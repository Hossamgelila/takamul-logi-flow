import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Printer, Search, Filter, Plus, Eye, Edit, Download, FileText, Trash2 } from 'lucide-react';
import NewInvoiceModal from '@/components/modals/NewInvoiceModal';
import EditInvoiceModal from '@/components/modals/EditInvoiceModal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Invoice {
  id: string;
  date: string;
  customer: string;
  total: number;
  currency: string;
  status: 'Draft' | 'Issued' | 'Paid' | 'Overdue';
  passThrough: number;
  revenue: number;
  dueDate: string;
  items: InvoiceItem[];
}

interface InvoiceItem {
  description: string;
  qty: number;
  unitPrice: number;
  amount: number;
  isPassThrough: boolean;
}

export default function Invoices() {
  const { toast } = useToast();
  const [showNewInvoice, setShowNewInvoice] = useState(false);
  const [showEditInvoice, setShowEditInvoice] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currencyFilter, setCurrencyFilter] = useState('all');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch invoices from database
  const fetchInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          customers:customer_id(name),
          invoice_items(*)
        `)
        .eq('is_deleted', false)
        .order('issue_date', { ascending: false });

      if (error) {
        toast({
          title: "Error fetching invoices",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // Transform data to match interface
      const transformedInvoices: Invoice[] = data.map((invoice: any) => {
        const items = invoice.invoice_items || [];
        const revenue = items
          .filter((item: any) => !item.is_pass_through)
          .reduce((sum: number, item: any) => sum + (parseFloat(item.amount_foreign) || 0), 0);
        const passThrough = items
          .filter((item: any) => item.is_pass_through)
          .reduce((sum: number, item: any) => sum + (parseFloat(item.amount_foreign) || 0), 0);

        return {
          id: invoice.invoice_no,
          date: invoice.issue_date,
          customer: invoice.customers?.name || 'Unknown Customer',
          total: revenue + passThrough,
          currency: invoice.currency,
          status: invoice.status as 'Draft' | 'Issued' | 'Paid' | 'Overdue',
          passThrough: passThrough,
          revenue: revenue,
          dueDate: invoice.due_date || invoice.issue_date,
          items: items.map((item: any) => ({
            description: item.description || '',
            qty: parseFloat(item.qty) || 1,
            unitPrice: parseFloat(item.unit_price) || 0,
            amount: parseFloat(item.amount_foreign) || 0,
            isPassThrough: item.is_pass_through || false
          }))
        };
      });

      setInvoices(transformedInvoices);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast({
        title: "Error",
        description: "Failed to load invoices",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Clear all invoices
  const handleClearAllInvoices = async () => {
    try {
      setLoading(true);
      
      // Soft delete all invoices
      const { error } = await supabase
        .from('invoices')
        .update({ is_deleted: true })
        .eq('is_deleted', false);

      if (error) {
        throw error;
      }

      // Clear the local state
      setInvoices([]);
      
      toast({
        title: "Success",
        description: "All invoices have been cleared successfully",
      });
    } catch (error) {
      console.error('Error clearing invoices:', error);
      toast({
        title: "Error",
        description: "Failed to clear invoices. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time subscription and initial fetch
  useEffect(() => {
    fetchInvoices();

    // Subscribe to invoice changes
    const channel = supabase
      .channel('invoices-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invoices'
        },
        (payload) => {
          console.log('Invoice change detected:', payload);
          fetchInvoices(); // Refetch data when changes occur
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    const matchesCurrency = currencyFilter === 'all' || invoice.currency === currencyFilter;
    
    return matchesSearch && matchesStatus && matchesCurrency;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Paid': return 'default';
      case 'Issued': return 'secondary';
      case 'Overdue': return 'destructive';
      case 'Draft': return 'outline';
      default: return 'outline';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const totalRevenue = filteredInvoices.reduce((sum, invoice) => {
    // Convert to OMR if needed (simplified conversion)
    const revenueInOMR = invoice.currency === 'AED' ? invoice.revenue * 0.1 : invoice.revenue;
    return sum + revenueInOMR;
  }, 0);

  const totalPassThrough = filteredInvoices.reduce((sum, invoice) => {
    // Convert to OMR if needed (simplified conversion)
    const passThroughInOMR = invoice.currency === 'AED' ? invoice.passThrough * 0.1 : invoice.passThrough;
    return sum + passThroughInOMR;
  }, 0);

  const totalAmount = totalRevenue + totalPassThrough;

  return (
    <Layout>
      <div className="content-spacing">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">All Invoices</h1>
            <p className="text-muted-foreground">Manage and track all customer invoices</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handlePrint} variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Print A4
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" disabled={invoices.length === 0}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear All Invoices</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action will permanently delete all invoices. This cannot be undone.
                    Are you sure you want to continue?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleClearAllInvoices}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Clear All Invoices
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button onClick={() => setShowNewInvoice(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Invoice
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
                    placeholder="Search by customer or invoice ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Issued">Issued</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Currency</label>
                <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Currencies</SelectItem>
                    <SelectItem value="OMR">OMR</SelectItem>
                    <SelectItem value="AED">AED</SelectItem>
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
              <div className="text-2xl font-bold">{filteredInvoices.length}</div>
              <p className="text-xs text-muted-foreground">Total Invoices</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-success">{totalRevenue.toFixed(2)} OMR</div>
              <p className="text-xs text-muted-foreground">Total Revenue</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-warning">{totalPassThrough.toFixed(2)} OMR</div>
              <p className="text-xs text-muted-foreground">Pass-Through</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-primary">{totalAmount.toFixed(2)} OMR</div>
              <p className="text-xs text-muted-foreground">Grand Total</p>
            </CardContent>
          </Card>
        </div>

        {/* Invoices Table */}
        <Card>
          <CardHeader className="print:block print:text-center">
            <CardTitle className="print:text-2xl print:mb-4">
              <span className="hidden print:block">TAKAMUL LOGISTICS</span>
              <span className="hidden print:block text-lg print:font-normal">All Invoices Report</span>
              <span className="print:hidden">Invoices List</span>
            </CardTitle>
            <div className="hidden print:block text-sm text-muted-foreground">
              Generated on: {new Date().toLocaleDateString()}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center p-8">
                <div className="text-muted-foreground">Loading invoices...</div>
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div className="flex justify-center items-center p-8">
                <div className="text-muted-foreground">No invoices found</div>
              </div>
            ) : (
              <div className="table-responsive">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead className="hidden sm:table-cell">Pass-Through</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead className="hidden md:table-cell">Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="print:hidden">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.id}</TableCell>
                      <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                      <TableCell>{invoice.customer}</TableCell>
                      <TableCell>
                        <span className="font-medium text-success">
                          {invoice.revenue.toFixed(2)} {invoice.currency}
                        </span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span className="text-warning">
                          {invoice.passThrough.toFixed(2)} {invoice.currency}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold">
                          {invoice.total.toFixed(2)} {invoice.currency}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(invoice.status)}>
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="print:hidden">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setSelectedInvoiceId(invoice.id);
                              setShowEditInvoice(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
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
            <div className="hidden print:block mt-8 pt-4 border-t">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Total Invoices:</strong> {filteredInvoices.length}</p>
                  <p><strong>Total Revenue:</strong> {totalRevenue.toFixed(2)} OMR</p>
                  <p><strong>Total Pass-Through:</strong> {totalPassThrough.toFixed(2)} OMR</p>
                  <p><strong>Grand Total:</strong> {totalAmount.toFixed(2)} OMR</p>
                </div>
                <div>
                  <p><strong>Draft:</strong> {filteredInvoices.filter(i => i.status === 'Draft').length}</p>
                  <p><strong>Issued:</strong> {filteredInvoices.filter(i => i.status === 'Issued').length}</p>
                  <p><strong>Paid:</strong> {filteredInvoices.filter(i => i.status === 'Paid').length}</p>
                  <p><strong>Overdue:</strong> {filteredInvoices.filter(i => i.status === 'Overdue').length}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <NewInvoiceModal open={showNewInvoice} onOpenChange={setShowNewInvoice} />
      <EditInvoiceModal 
        open={showEditInvoice} 
        onOpenChange={setShowEditInvoice}
        invoiceId={selectedInvoiceId}
        onSuccess={fetchInvoices}
      />
    </Layout>
  );
}