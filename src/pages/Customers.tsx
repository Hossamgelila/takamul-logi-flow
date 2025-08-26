import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Printer,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  Users,
} from 'lucide-react';
import NewCustomerModal from '@/components/modals/NewCustomerModal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Customer {
  id: string;
  name: string;
  country: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  trnVatNo: string;
  createdAt: string;
}

export default function Customers() {
  const { toast } = useToast();
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('all');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch customers from database
  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('is_deleted', false)
        .order('name');

      if (error) {
        toast({
          title: 'Error fetching customers',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      // Transform data to match interface
      const transformedCustomers: Customer[] = data.map((customer: any) => ({
        id: customer.id,
        name: customer.name,
        country: customer.country,
        contactPerson: customer.contact || '',
        phone: customer.phone || '',
        email: customer.email || '',
        address: customer.address || '',
        trnVatNo: customer.trn_vat_no || '',
        createdAt: customer.created_at,
      }));

      setCustomers(transformedCustomers);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        title: 'Error',
        description: 'Failed to load customers',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Clear all customers
  const handleClearAllCustomers = async () => {
    try {
      setLoading(true);

      // Soft delete all customers
      const { error } = await supabase
        .from('customers')
        .update({ is_deleted: true })
        .eq('is_deleted', false);

      if (error) {
        throw error;
      }

      // Clear the local state
      setCustomers([]);

      toast({
        title: 'Success',
        description: 'All customers have been cleared successfully',
      });
    } catch (error) {
      console.error('Error clearing customers:', error);
      toast({
        title: 'Error',
        description: 'Failed to clear customers. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time subscription and initial fetch
  useEffect(() => {
    fetchCustomers();

    // Subscribe to customer changes
    const channel = supabase
      .channel('customers-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customers',
        },
        payload => {
          console.log('Customer change detected:', payload);
          fetchCustomers(); // Refetch data when changes occur
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry =
      countryFilter === 'all' || customer.country === countryFilter;

    return matchesSearch && matchesCountry;
  });

  const getCountryName = (code: string) => {
    const countries: { [key: string]: string } = {
      OM: 'Oman',
      AE: 'UAE',
      SA: 'Saudi Arabia',
      YE: 'Yemen',
      KW: 'Kuwait',
      QA: 'Qatar',
      BH: 'Bahrain',
    };
    return countries[code] || code;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Layout>
      <div className="content-spacing">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center print:hidden">
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              All Customers
            </h1>
            <p className="text-muted-foreground">
              Manage and track all customers
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handlePrint} variant="outline" size="sm">
              <Printer className="mr-2 h-4 w-4" />
              Print A4
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={customers.length === 0}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear All Customers</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will permanently delete all customers. This
                    cannot be undone. Are you sure you want to continue?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleClearAllCustomers}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Clear All Customers
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button onClick={() => setShowNewCustomer(true)} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              New Customer
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="print:hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="form-grid-responsive">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                  <Input
                    placeholder="Search by name, contact person, or email..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Country</label>
                <Select value={countryFilter} onValueChange={setCountryFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Countries</SelectItem>
                    <SelectItem value="OM">Oman</SelectItem>
                    <SelectItem value="AE">UAE</SelectItem>
                    <SelectItem value="SA">Saudi Arabia</SelectItem>
                    <SelectItem value="YE">Yemen</SelectItem>
                    <SelectItem value="KW">Kuwait</SelectItem>
                    <SelectItem value="QA">Qatar</SelectItem>
                    <SelectItem value="BH">Bahrain</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="responsive-grid-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold">
                {filteredCustomers.length}
              </div>
              <p className="text-xs text-muted-foreground">Total Customers</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-success">
                {customers.filter(c => c.country === 'OM').length}
              </div>
              <p className="text-xs text-muted-foreground">Oman</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-warning">
                {customers.filter(c => c.country === 'AE').length}
              </div>
              <p className="text-xs text-muted-foreground">UAE</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-primary">
                {customers.filter(c => c.trnVatNo).length}
              </div>
              <p className="text-xs text-muted-foreground">With TRN/VAT</p>
            </CardContent>
          </Card>
        </div>

        {/* Customers Table */}
        <Card>
          <CardHeader className="print:block print:text-center">
            <CardTitle className="print:mb-4 print:text-2xl">
              <span className="hidden print:block">TAKAMUL LOGISTICS</span>
              <span className="hidden text-lg print:block print:font-normal">
                All Customers Report
              </span>
              <span className="print:hidden">Customers List</span>
            </CardTitle>
            <div className="hidden text-sm text-muted-foreground print:block">
              Generated on: {new Date().toLocaleDateString()}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-muted-foreground">
                  Loading customers...
                </div>
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-muted-foreground">No customers found</div>
              </div>
            ) : (
              <div className="table-responsive">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Contact Person
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Phone
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Email
                      </TableHead>
                      <TableHead className="hidden sm:table-cell">
                        TRN/VAT
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        Created
                      </TableHead>
                      <TableHead className="print:hidden">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map(customer => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">
                          {customer.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getCountryName(customer.country)}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {customer.contactPerson}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {customer.phone}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {customer.email}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {customer.trnVatNo && (
                            <Badge variant="secondary" className="text-xs">
                              {customer.trnVatNo}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {new Date(customer.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="print:hidden">
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Print Summary */}
            <div className="mt-8 hidden border-t pt-4 print:block">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p>
                    <strong>Total Customers:</strong> {filteredCustomers.length}
                  </p>
                  <p>
                    <strong>Oman:</strong>{' '}
                    {customers.filter(c => c.country === 'OM').length}
                  </p>
                  <p>
                    <strong>UAE:</strong>{' '}
                    {customers.filter(c => c.country === 'AE').length}
                  </p>
                </div>
                <div>
                  <p>
                    <strong>With TRN/VAT:</strong>{' '}
                    {customers.filter(c => c.trnVatNo).length}
                  </p>
                  <p>
                    <strong>With Email:</strong>{' '}
                    {customers.filter(c => c.email).length}
                  </p>
                  <p>
                    <strong>With Phone:</strong>{' '}
                    {customers.filter(c => c.phone).length}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <NewCustomerModal
        open={showNewCustomer}
        onOpenChange={setShowNewCustomer}
      />
    </Layout>
  );
}
