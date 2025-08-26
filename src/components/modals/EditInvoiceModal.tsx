import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Calculator, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface InvoiceItem {
  id?: string;
  elementCode: string;
  description: string;
  qty: number;
  unitPrice: number;
  amount: number;
  isPassThrough: boolean;
  taxRate: number;
  element_id?: string;
}

interface EditInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoiceId?: string;
  onSuccess?: () => void;
}

export default function EditInvoiceModal({ open, onOpenChange, invoiceId, onSuccess }: EditInvoiceModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [trucks, setTrucks] = useState<any[]>([]);
  const [trailers, setTrailers] = useState<any[]>([]);
  const [invoiceElements, setInvoiceElements] = useState<any[]>([]);
  const [originalInvoice, setOriginalInvoice] = useState<any>(null);
  const [availableTripMirrors, setAvailableTripMirrors] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    invoiceNo: '',
    customerName: '',
    currency: 'OMR',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    notes: '',
    status: 'Draft',
    tripMirrorReference: '',
    truckId: '',
    trailerId: '',
    fxRateToOmr: 1,
  });

  // Load initial data
  useEffect(() => {
    if (open) {
      fetchCustomers();
      fetchTrucks();
      fetchTrailers();
      fetchInvoiceElements();
      if (invoiceId) {
        fetchInvoiceData();
      }
    }
  }, [open, invoiceId]);

  // Fetch available trip mirrors when truck and trailer are selected
  useEffect(() => {
    if (formData.truckId && formData.trailerId) {
      fetchAvailableTripMirrors();
    } else {
      setAvailableTripMirrors([]);
    }
  }, [formData.truckId, formData.trailerId]);

  const fetchCustomers = async () => {
    const { data } = await supabase
      .from('customers')
      .select('*')
      .eq('is_deleted', false)
      .order('name');
    if (data) setCustomers(data);
  };

  const fetchTrucks = async () => {
    const { data } = await supabase
      .from('trucks')
      .select('*')
      .eq('is_deleted', false)
      .eq('active', true)
      .order('plate_no');
    if (data) setTrucks(data);
  };

  const fetchAvailableTripMirrors = async () => {
    if (!formData.truckId || !formData.trailerId) return;
    
    const { data } = await supabase
      .from('trip_mirror')
      .select('*')
      .eq('truck_id', formData.truckId)
      .eq('trailer_id', formData.trailerId)
      .eq('is_deleted', false)
      .in('status', ['Completed', 'Active'])
      .order('reference_number', { ascending: false });
    
    if (data) {
      setAvailableTripMirrors(data);
    }
  };

  const fetchTrailers = async () => {
    const { data } = await supabase
      .from('trailers')
      .select('*')
      .eq('is_deleted', false)
      .eq('active', true)
      .order('plate_no');
    if (data) setTrailers(data);
  };

  const fetchInvoiceElements = async () => {
    const { data } = await supabase
      .from('invoice_elements_lookup')
      .select('*')
      .eq('is_deleted', false)
      .order('label');
    if (data) setInvoiceElements(data);
  };

  const fetchInvoiceData = async () => {
    if (!invoiceId) return;

    try {
      setLoading(true);
      
      // Fetch invoice with related data including truck and trailer info
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select(`
          *,
          customers:customer_id(id, name),
          invoice_items(*, 
            invoice_elements_lookup:element_id(id, code, label, category),
            trucks:truck_id(id, plate_no, make, model),
            trailers:trailer_id(id, plate_no, type)
          )
        `)
        .eq('invoice_no', invoiceId)
        .eq('is_deleted', false)
        .single();

      if (invoiceError) {
        throw invoiceError;
      }

      if (invoiceData) {
        setOriginalInvoice(invoiceData);
        
        // Populate form data
        const firstItem = invoiceData.invoice_items?.[0];
        setFormData({
          invoiceNo: invoiceData.invoice_no || '',
          customerName: invoiceData.customer_id || '',
          currency: invoiceData.currency || 'OMR',
          issueDate: invoiceData.issue_date || new Date().toISOString().split('T')[0],
          dueDate: invoiceData.due_date || '',
          notes: invoiceData.notes || '',
          status: invoiceData.status || 'Draft',
          tripMirrorReference: invoiceData.trip_mirror_reference_number || '',
          truckId: firstItem?.truck_id || '',
          trailerId: firstItem?.trailer_id || '',
          fxRateToOmr: parseFloat(invoiceData.fx_rate_to_omr?.toString() || '1') || 1,
        });

        // Populate items
        if (invoiceData.invoice_items) {
          const transformedItems: InvoiceItem[] = invoiceData.invoice_items.map((item: any, index: number) => ({
            id: item.id || Date.now().toString() + index,
            elementCode: item.invoice_elements_lookup?.code || '',
            description: item.description || '',
            qty: parseFloat(item.qty) || 1,
            unitPrice: parseFloat(item.unit_price) || 0,
            amount: parseFloat(item.amount_foreign) || 0,
            isPassThrough: item.is_pass_through || false,
            taxRate: parseFloat(item.tax_rate) || 0,
            element_id: item.element_id,
          }));
          setItems(transformedItems);
        }
      }
    } catch (error) {
      console.error('Error fetching invoice:', error);
      toast({
        title: "Error",
        description: "Failed to load invoice data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      elementCode: '',
      description: '',
      qty: 1,
      unitPrice: 0,
      amount: 0,
      isPassThrough: false,
      taxRate: 0,
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        
        // Auto-set pass-through flag based on element
        if (field === 'elementCode') {
          const element = invoiceElements.find(e => e.code === value);
          if (element) {
            updated.isPassThrough = element.category === 'PassThrough';
            updated.description = element.label;
            updated.element_id = element.id;
          }
        }
        
        // Recalculate amount
        if (field === 'qty' || field === 'unitPrice') {
          updated.amount = updated.qty * updated.unitPrice;
        }
        
        return updated;
      }
      return item;
    }));
  };

  const calculateTotals = () => {
    const revenueItems = items.filter(item => !item.isPassThrough);
    const passThroughItems = items.filter(item => item.isPassThrough);
    
    const revenueSubtotal = revenueItems.reduce((sum, item) => sum + item.amount, 0);
    const passThroughSubtotal = passThroughItems.reduce((sum, item) => sum + item.amount, 0);
    const totalTax = items.reduce((sum, item) => sum + (item.amount * item.taxRate / 100), 0);
    const grandTotal = revenueSubtotal + passThroughSubtotal + totalTax;

    return {
      revenueSubtotal,
      passThroughSubtotal,
      totalTax,
      grandTotal,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerName) {
      toast({
        title: "Error",
        description: "Please select a customer",
        variant: "destructive",
      });
      return;
    }
    
    if (items.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one invoice item",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Update the invoice
      const invoiceData = {
        customer_id: formData.customerName,
        issue_date: formData.issueDate,
        due_date: formData.dueDate || formData.issueDate,
        currency: formData.currency,
        status: formData.status,
        notes: formData.notes,
        trip_mirror_reference_number: formData.tripMirrorReference || null,
        fx_rate_to_omr: formData.fxRateToOmr
      };

      const { error: invoiceError } = await supabase
        .from('invoices')
        .update(invoiceData)
        .eq('id', originalInvoice.id);

      if (invoiceError) {
        console.error('Invoice update error:', invoiceError);
        throw invoiceError;
      }

      // Delete existing items and recreate them
      const { error: deleteError } = await supabase
        .from('invoice_items')
        .delete()
        .eq('invoice_id', originalInvoice.id);

      if (deleteError) {
        console.error('Error deleting existing items:', deleteError);
        throw deleteError;
      }

      // Create updated invoice items
      const invoiceItemsData = items.map(item => {
        const element = invoiceElements.find(e => e.code === item.elementCode);
        return {
          invoice_id: originalInvoice.id,
          element_id: element?.id || item.element_id || null,
          description: item.description,
          qty: item.qty,
          unit_price: item.unitPrice,
          currency: formData.currency,
          amount_foreign: item.amount,
          amount_omr: formData.currency === 'OMR' ? item.amount : item.amount * formData.fxRateToOmr,
          is_pass_through: item.isPassThrough,
          tax_rate: item.taxRate,
          truck_id: formData.truckId || null,
          trailer_id: formData.trailerId || null
        };
      });

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(invoiceItemsData);

      if (itemsError) {
        console.error('Invoice items creation error:', itemsError);
        throw itemsError;
      }
      
      toast({
        title: "Success",
        description: `Invoice ${formData.invoiceNo} updated successfully`,
      });
      
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error updating invoice:', error);
      toast({
        title: "Error",
        description: "Failed to update invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotals();

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Invoice {formData.invoiceNo}</DialogTitle>
        </DialogHeader>
        
        {loading && !originalInvoice ? (
          <div className="flex justify-center items-center p-8">
            <div className="text-muted-foreground">Loading invoice data...</div>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Alert for comprehensive editing */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Full Invoice Edit Mode: All fields, items, and settings can be modified. Changes will be saved immediately upon submission.
            </AlertDescription>
          </Alert>

          {/* Invoice Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoiceNo">Invoice Number</Label>
                  <Input
                    id="invoiceNo"
                    value={formData.invoiceNo}
                    disabled
                    className="bg-muted"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customer">Customer *</Label>
                  <Select 
                    value={formData.customerName} 
                    onValueChange={(value) => setFormData({...formData, customerName: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border shadow-lg z-50">
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => setFormData({...formData, status: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border shadow-lg z-50">
                      <SelectItem value="Draft">Draft</SelectItem>
                      <SelectItem value="Issued">Issued</SelectItem>
                      <SelectItem value="Paid">Paid</SelectItem>
                      <SelectItem value="Overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Financial Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select 
                    value={formData.currency} 
                    onValueChange={(value) => setFormData({...formData, currency: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border shadow-lg z-50">
                      <SelectItem value="OMR">OMR</SelectItem>
                      <SelectItem value="AED">AED</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fxRate">Exchange Rate to OMR</Label>
                  <Input
                    id="fxRate"
                    type="number"
                    step="0.000001"
                    min="0"
                    value={formData.fxRateToOmr}
                    onChange={(e) => setFormData({...formData, fxRateToOmr: parseFloat(e.target.value) || 1})}
                    placeholder="1.000000"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Date and Reference Information */}
          <Card>
            <CardHeader>
              <CardTitle>Dates & References</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="issueDate">Issue Date</Label>
                  <Input
                    id="issueDate"
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => setFormData({...formData, issueDate: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <Label htmlFor="tripMirrorReference">Trip Mirror Reference</Label>
                <Input
                  id="tripMirrorReference"
                  value={formData.tripMirrorReference}
                  onChange={(e) => setFormData({...formData, tripMirrorReference: e.target.value})}
                  placeholder="Enter trip mirror reference"
                />
              </div>
            </CardContent>
          </Card>

          {/* Vehicle Assignment */}
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Assignment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="truck">Truck</Label>
                  <Select 
                    value={formData.truckId} 
                    onValueChange={(value) => setFormData({...formData, truckId: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select truck" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border shadow-lg z-50">
                      <SelectItem value="none">No Truck</SelectItem>
                      {trucks.map((truck) => (
                        <SelectItem key={truck.id} value={truck.id}>
                          {truck.plate_no} ({truck.make} {truck.model})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="trailer">Trailer</Label>
                  <Select 
                    value={formData.trailerId} 
                    onValueChange={(value) => setFormData({...formData, trailerId: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select trailer" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border shadow-lg z-50">
                      <SelectItem value="none">No Trailer</SelectItem>
                      {trailers.map((trailer) => (
                        <SelectItem key={trailer.id} value={trailer.id}>
                          {trailer.plate_no} ({trailer.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Available Trip Mirrors */}
              {formData.truckId && formData.trailerId && formData.truckId !== 'none' && formData.trailerId !== 'none' && (
                <div className="mt-4 space-y-2">
                  <Label htmlFor="availableTripMirror">Available Trip Mirrors</Label>
                  <Select 
                    value={formData.tripMirrorReference} 
                    onValueChange={(value) => setFormData({...formData, tripMirrorReference: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select from available trip mirrors" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border shadow-lg z-50">
                      {availableTripMirrors.map((tripMirror) => (
                        <SelectItem key={tripMirror.id} value={tripMirror.reference_number}>
                          {tripMirror.reference_number} - {tripMirror.driver_name} ({new Date(tripMirror.start_date).toLocaleDateString()})
                        </SelectItem>
                      ))}
                      {availableTripMirrors.length === 0 && (
                        <SelectItem value="no-trips-available" disabled>
                          No available trip mirrors for this combination
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

            {/* Invoice Items Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Invoice Items Management</span>
                  <div className="flex gap-2">
                    <span className="text-sm text-muted-foreground">
                      {items.length} item{items.length !== 1 ? 's' : ''}
                    </span>
                    <Button type="button" variant="outline" size="sm" onClick={addItem}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={item.id} className="grid grid-cols-1 md:grid-cols-9 gap-2 p-4 border rounded-lg bg-card">
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Element</Label>
                        <Select 
                          value={item.elementCode} 
                          onValueChange={(value) => updateItem(item.id!, 'elementCode', value)}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent className="bg-background border shadow-lg z-50">
                            {invoiceElements.map((element) => (
                              <SelectItem key={element.code} value={element.code}>
                                {element.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-1 md:col-span-2">
                        <Label className="text-xs font-medium">Description</Label>
                        <Input
                          value={item.description}
                          onChange={(e) => updateItem(item.id!, 'description', e.target.value)}
                          className="h-8"
                          placeholder="Description"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Qty</Label>
                        <Input
                          type="number"
                          value={item.qty}
                          onChange={(e) => updateItem(item.id!, 'qty', parseFloat(e.target.value) || 0)}
                          className="h-8"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Unit Price</Label>
                        <Input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(item.id!, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="h-8"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Tax %</Label>
                        <Input
                          type="number"
                          value={item.taxRate}
                          onChange={(e) => updateItem(item.id!, 'taxRate', parseFloat(e.target.value) || 0)}
                          className="h-8"
                          min="0"
                          max="100"
                          step="0.01"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Amount</Label>
                        <div className="h-8 px-3 py-2 border rounded-md bg-muted text-sm font-medium">
                          {item.amount.toFixed(2)}
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <Label className="text-xs font-medium">Pass-Through</Label>
                        <div className="h-8 px-3 py-2 border rounded-md bg-muted text-sm text-center">
                          {item.isPassThrough ? '✓' : '✗'}
                        </div>
                      </div>
                      
                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(item.id!)}
                          className="h-8 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {items.length === 0 && (
                    <div className="text-center text-muted-foreground py-8 border rounded-lg bg-muted/10">
                      <div className="text-lg font-medium">No items added yet</div>
                      <p className="text-sm">Click "Add Item" to get started with your invoice items.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Comprehensive Invoice Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Complete Invoice Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  <div className="bg-success/10 p-3 rounded-lg">
                    <span className="text-muted-foreground font-medium block">Revenue Subtotal:</span>
                    <div className="font-bold text-success text-lg">
                      {totals.revenueSubtotal.toFixed(2)} {formData.currency}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formData.currency !== 'OMR' && `≈ ${(totals.revenueSubtotal * formData.fxRateToOmr).toFixed(2)} OMR`}
                    </div>
                  </div>
                  <div className="bg-warning/10 p-3 rounded-lg">
                    <span className="text-muted-foreground font-medium block">Pass-Through:</span>
                    <div className="font-bold text-warning text-lg">
                      {totals.passThroughSubtotal.toFixed(2)} {formData.currency}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formData.currency !== 'OMR' && `≈ ${(totals.passThroughSubtotal * formData.fxRateToOmr).toFixed(2)} OMR`}
                    </div>
                  </div>
                  <div className="bg-destructive/10 p-3 rounded-lg">
                    <span className="text-muted-foreground font-medium block">Total Tax:</span>
                    <div className="font-bold text-destructive text-lg">
                      {totals.totalTax.toFixed(2)} {formData.currency}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formData.currency !== 'OMR' && `≈ ${(totals.totalTax * formData.fxRateToOmr).toFixed(2)} OMR`}
                    </div>
                  </div>
                  <div className="bg-primary/10 p-3 rounded-lg md:col-span-2">
                    <span className="text-muted-foreground font-medium block">Grand Total:</span>
                    <div className="font-bold text-primary text-2xl">
                      {totals.grandTotal.toFixed(2)} {formData.currency}
                    </div>
                    <div className="text-sm text-muted-foreground font-medium">
                      {formData.currency !== 'OMR' && `≈ ${(totals.grandTotal * formData.fxRateToOmr).toFixed(2)} OMR`}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Revenue Items:</span>
                      <div className="font-medium">{items.filter(i => !i.isPassThrough).length}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Pass-Through Items:</span>
                      <div className="font-medium">{items.filter(i => i.isPassThrough).length}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Items:</span>
                      <div className="font-medium">{items.length}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Exchange Rate:</span>
                      <div className="font-medium">{formData.fxRateToOmr.toFixed(6)}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes Section */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="notes">Internal Notes & Comments</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Add any additional notes, special instructions, or comments about this invoice..."
                    rows={4}
                    className="resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Last modified: {originalInvoice?.updated_at ? new Date(originalInvoice.updated_at).toLocaleString() : 'Never'}
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel Changes
                </Button>
                <Button type="submit" disabled={loading} className="min-w-[120px]">
                  {loading ? 'Updating...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}