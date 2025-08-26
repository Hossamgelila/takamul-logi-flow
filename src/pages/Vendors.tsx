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
  Building,
} from 'lucide-react';
import NewSupplierModal from '@/components/modals/NewSupplierModal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Vendor {
  id: string;
  name: string;
  country: string;
  type: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  createdAt: string;
}

export default function Vendors() {
  const { toast } = useToast();
  const [showNewSupplier, setShowNewSupplier] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch vendors from database
  const fetchVendors = async () => {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('is_deleted', false)
        .order('name');

      if (error) {
        toast({
          title: 'Error fetching vendors',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      // Transform data to match interface
      const transformedVendors: Vendor[] = data.map((vendor: any) => ({
        id: vendor.id,
        name: vendor.name,
        country: vendor.country,
        type: vendor.type,
        contactPerson: vendor.contact || '',
        phone: vendor.phone || '',
        email: vendor.email || '',
        address: vendor.address || '',
        createdAt: vendor.created_at,
      }));

      setVendors(transformedVendors);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast({
        title: 'Error',
        description: 'Failed to load vendors',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Clear all vendors
  const handleClearAllVendors = async () => {
    try {
      setLoading(true);

      // Soft delete all vendors
      const { error } = await supabase
        .from('vendors')
        .update({ is_deleted: true })
        .eq('is_deleted', false);

      if (error) {
        throw error;
      }

      // Clear the local state
      setVendors([]);

      toast({
        title: 'Success',
        description: 'All vendors have been cleared successfully',
      });
    } catch (error) {
      console.error('Error clearing vendors:', error);
      toast({
        title: 'Error',
        description: 'Failed to clear vendors. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time subscription and initial fetch
  useEffect(() => {
    fetchVendors();

    // Subscribe to vendor changes
    const channel = supabase
      .channel('vendors-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vendors',
        },
        payload => {
          console.log('Vendor change detected:', payload);
          fetchVendors(); // Refetch data when changes occur
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch =
      vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || vendor.type === typeFilter;
    const matchesCountry =
      countryFilter === 'all' || vendor.country === countryFilter;

    return matchesSearch && matchesType && matchesCountry;
  });

  const getCountryName = (code: string) => {
    const countries: { [key: string]: string } = {
      OM: 'Oman',
      YE: 'Yemen',
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
              All Vendors
            </h1>
            <p className="text-muted-foreground">
              Manage and track all suppliers and vendors
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
                  disabled={vendors.length === 0}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear All Vendors</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will permanently delete all vendors. This cannot
                    be undone. Are you sure you want to continue?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleClearAllVendors}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Clear All Vendors
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button onClick={() => setShowNewSupplier(true)} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              New Vendor
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
                <label className="text-sm font-medium">Type</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Garage">Garage</SelectItem>
                    <SelectItem value="Fuel">Fuel Station</SelectItem>
                    <SelectItem value="Shipping Line">Shipping Line</SelectItem>
                    <SelectItem value="Customs Broker">
                      Customs Broker
                    </SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
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
                    <SelectItem value="YE">Yemen</SelectItem>
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
              <div className="text-2xl font-bold">{filteredVendors.length}</div>
              <p className="text-xs text-muted-foreground">Total Vendors</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-success">
                {vendors.filter(v => v.type === 'Garage').length}
              </div>
              <p className="text-xs text-muted-foreground">Garages</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-warning">
                {vendors.filter(v => v.type === 'Fuel').length}
              </div>
              <p className="text-xs text-muted-foreground">Fuel Stations</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-primary">
                {vendors.filter(v => v.country === 'OM').length}
              </div>
              <p className="text-xs text-muted-foreground">Oman</p>
            </CardContent>
          </Card>
        </div>

        {/* Vendors Table */}
        <Card>
          <CardHeader className="print:block print:text-center">
            <CardTitle className="print:mb-4 print:text-2xl">
              <span className="hidden print:block">TAKAMUL LOGISTICS</span>
              <span className="hidden text-lg print:block print:font-normal">
                All Vendors Report
              </span>
              <span className="print:hidden">Vendors List</span>
            </CardTitle>
            <div className="hidden text-sm text-muted-foreground print:block">
              Generated on: {new Date().toLocaleDateString()}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-muted-foreground">Loading vendors...</div>
              </div>
            ) : filteredVendors.length === 0 ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-muted-foreground">No vendors found</div>
              </div>
            ) : (
              <div className="table-responsive">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
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
                      <TableHead className="hidden md:table-cell">
                        Created
                      </TableHead>
                      <TableHead className="print:hidden">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVendors.map(vendor => (
                      <TableRow key={vendor.id}>
                        <TableCell className="font-medium">
                          {vendor.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{vendor.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {getCountryName(vendor.country)}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {vendor.contactPerson}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {vendor.phone}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {vendor.email}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {new Date(vendor.createdAt).toLocaleDateString()}
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
                    <strong>Total Vendors:</strong> {filteredVendors.length}
                  </p>
                  <p>
                    <strong>Garages:</strong>{' '}
                    {vendors.filter(v => v.type === 'Garage').length}
                  </p>
                  <p>
                    <strong>Fuel Stations:</strong>{' '}
                    {vendors.filter(v => v.type === 'Fuel').length}
                  </p>
                </div>
                <div>
                  <p>
                    <strong>Oman:</strong>{' '}
                    {vendors.filter(v => v.country === 'OM').length}
                  </p>
                  <p>
                    <strong>Yemen:</strong>{' '}
                    {vendors.filter(v => v.country === 'YE').length}
                  </p>
                  <p>
                    <strong>Other Types:</strong>{' '}
                    {vendors.filter(v => v.type === 'Other').length}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <NewSupplierModal
        open={showNewSupplier}
        onOpenChange={setShowNewSupplier}
      />
    </Layout>
  );
}
