import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Printer, Search, Filter, Plus, Eye, Edit, Download } from 'lucide-react';
import NewExpenseModal from '@/components/modals/NewExpenseModal';
import EditExpenseModal from '@/components/modals/EditExpenseModal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Expense {
  id: string;
  date: string;
  vendor: string;
  vendorDetails?: any;
  category: string;
  subcategory?: string;
  amount: number;
  currency: string;
  truck?: string;
  truckDetails?: any;
  trailerDetails?: any;
  description: string;
  referenceNumber: string;
  status: 'Pending' | 'Approved' | 'Paid';
  isPassThrough?: boolean;
  fxRateToOmr?: number;
  amountOmr?: number;
  tripMirrorDetails?: any;
  fullExpenseData?: any;
}

export default function Expenses() {
  const { toast } = useToast();
  const { user, hasRole } = useAuth();
  const [showNewExpense, setShowNewExpense] = useState(false);
  const [showEditExpense, setShowEditExpense] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  // Check if current user is admin (specifically Hossamgelila@gmail.com)
  const isAdmin = hasRole('admin') || user?.email === 'hossamgelila@gmail.com';
  
  // Debug logging
  console.log('Current user:', user?.email);
  console.log('Has admin role:', hasRole('admin'));
  console.log('Is admin check result:', isAdmin);

  // Fetch expenses from database
  const fetchExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select(`
          *,
          vendors:vendor_id(id, name, type, country, email, phone, contact, address),
          trucks:truck_id(id, plate_no, make, model, year, capacity_tons, ownership),
          trailers:trailer_id(id, plate_no, type, capacity_tons, ownership)
        `)
        .eq('is_deleted', false)
        .order('date', { ascending: false });

      if (error) {
        toast({
          title: "Error fetching expenses",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // Transform data to match interface with complete details
      const transformedExpenses: Expense[] = data.map((expense: any) => ({
        id: expense.id,
        date: expense.date,
        vendor: expense.vendors?.name || 'Unknown Vendor',
        vendorDetails: expense.vendors || null,
        category: expense.category,
        subcategory: expense.description?.includes(' - ') ? expense.description.split(' - ')[1] : expense.description || '',
        amount: parseFloat(expense.amount_foreign || '0'),
        currency: expense.currency,
        truck: expense.trucks?.plate_no || '',
        truckDetails: expense.trucks || null,
        trailerDetails: expense.trailers || null,
        description: expense.description || '',
        referenceNumber: expense.id,
        status: 'Approved', // Default status since expenses table doesn't have status field
        isPassThrough: expense.is_pass_through || false,
        fxRateToOmr: expense.fx_rate_to_omr || 1,
        amountOmr: expense.amount_omr || 0,
        tripMirrorDetails: expense.trip_mirror || null,
        fullExpenseData: expense // Keep full database record for editing
      }));

      setExpenses(transformedExpenses);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast({
        title: "Error",
        description: "Failed to load expenses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    fetchExpenses();

    // Subscribe to expense changes
    const channel = supabase
      .channel('expenses-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'expenses'
        },
        (payload) => {
          console.log('Expense change detected:', payload);
          fetchExpenses(); // Refetch data when changes occur
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || expense.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Paid': return 'default';
      case 'Approved': return 'secondary';
      case 'Pending': return 'outline';
      default: return 'outline';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEditExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setShowEditExpense(true);
  };

  const totalAmount = filteredExpenses.reduce((sum, expense) => {
    // Convert to OMR if needed (simplified conversion)
    const amountInOMR = expense.currency === 'AED' ? expense.amount * 0.1 : expense.amount;
    return sum + amountInOMR;
  }, 0);

  return (
    <Layout>
      <div className="content-spacing">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">All Expenses</h1>
            <p className="text-muted-foreground">Manage and track all company expenses</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handlePrint} variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Print A4
            </Button>
            <Button onClick={() => setShowNewExpense(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Expense
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
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by vendor, category, or ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="SERVICE & MAINTENANCE">Service & Maintenance</SelectItem>
                    <SelectItem value="DIESEL">Diesel</SelectItem>
                    <SelectItem value="VISA & IMMIGRATION EXP">Visa & Immigration</SelectItem>
                    <SelectItem value="TELECOM">Telecom</SelectItem>
                    <SelectItem value="OTHERS">Others</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
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
              <div className="text-2xl font-bold">{filteredExpenses.length}</div>
              <p className="text-xs text-muted-foreground">Total Expenses</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-destructive">{totalAmount.toFixed(2)} OMR</div>
              <p className="text-xs text-muted-foreground">Total Amount</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-warning">{filteredExpenses.filter(e => e.status === 'Pending').length}</div>
              <p className="text-xs text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-success">{filteredExpenses.filter(e => e.status === 'Paid').length}</div>
              <p className="text-xs text-muted-foreground">Paid</p>
            </CardContent>
          </Card>
        </div>

        {/* Expenses Table */}
        <Card>
          <CardHeader className="print:block print:text-center">
            <CardTitle className="print:text-2xl print:mb-4">
              <span className="hidden print:block">TAKAMUL LOGISTICS</span>
              <span className="hidden print:block text-lg print:font-normal">All Expenses Report</span>
              <span className="print:hidden">Expenses List</span>
            </CardTitle>
            <div className="hidden print:block text-sm text-muted-foreground">
              Generated on: {new Date().toLocaleDateString()}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center p-8">
                <div className="text-muted-foreground">Loading expenses...</div>
              </div>
            ) : (
              <div className="table-responsive">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="hidden sm:table-cell">Subcategory</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="hidden md:table-cell">Truck</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="print:hidden">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">{expense.id}</TableCell>
                      <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                      <TableCell>{expense.vendor}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{expense.category}</Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {expense.subcategory && (
                          <Badge variant="secondary" className="text-xs">
                            {expense.subcategory}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {expense.amount.toFixed(2)} {expense.currency}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{expense.truck}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(expense.status)}>
                          {expense.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="print:hidden">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {isAdmin && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditExpense(expense)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            
            {/* Print Summary */}
            <div className="hidden print:block mt-8 pt-4 border-t">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Total Expenses:</strong> {filteredExpenses.length}</p>
                  <p><strong>Total Amount:</strong> {totalAmount.toFixed(2)} OMR</p>
                </div>
                <div>
                  <p><strong>Pending:</strong> {filteredExpenses.filter(e => e.status === 'Pending').length}</p>
                  <p><strong>Approved:</strong> {filteredExpenses.filter(e => e.status === 'Approved').length}</p>
                  <p><strong>Paid:</strong> {filteredExpenses.filter(e => e.status === 'Paid').length}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <NewExpenseModal open={showNewExpense} onOpenChange={setShowNewExpense} />
      <EditExpenseModal 
        open={showEditExpense} 
        onOpenChange={setShowEditExpense} 
        expense={selectedExpense}
      />
    </Layout>
  );
}