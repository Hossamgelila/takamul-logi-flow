import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, Calculator, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface InvoiceItem {
  id: string;
  elementCode: string;
  description: string;
  qty: number;
  unitPrice: number;
  amount: number;
  isPassThrough: boolean;
  taxRate: number;
}

interface NewInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const INVOICE_ELEMENTS = [
  {
    code: 'CUSTOMS_OMAN',
    label: 'Customs Oman',
    category: 'PassThrough',
    isPassThrough: true,
  },
  {
    code: 'CLEARANCE_OMAN',
    label: 'Clearance Oman',
    category: 'PassThrough',
    isPassThrough: true,
  },
  {
    code: 'UAE_CUSTOMS_CLEARANCE',
    label: 'U.A.E. Customs & Clearance',
    category: 'PassThrough',
    isPassThrough: true,
  },
  {
    code: 'TRANSPORTATION',
    label: 'Transportation',
    category: 'Revenue',
    isPassThrough: false,
  },
  {
    code: 'INSPECTION',
    label: 'Inspection',
    category: 'PassThrough',
    isPassThrough: true,
  },
  {
    code: 'EXIT_FEE',
    label: 'Exit Fee',
    category: 'PassThrough',
    isPassThrough: true,
  },
  {
    code: 'TOLL_CHARGES_GATE_PASS',
    label: 'Toll Charges / Gate Pass',
    category: 'PassThrough',
    isPassThrough: true,
  },
  {
    code: 'SEAL_CHARGES',
    label: 'Seal Charges',
    category: 'PassThrough',
    isPassThrough: true,
  },
  {
    code: 'LOGISTICS_SERVICE_CHARGES',
    label: 'Logistics Service Charges',
    category: 'Revenue',
    isPassThrough: false,
  },
  {
    code: 'AMENDMENT_BAYAN',
    label: 'Amendment Bayan',
    category: 'PassThrough',
    isPassThrough: true,
  },
  {
    code: 'VETERINARY_PERMIT_CHARGES',
    label: 'Veterinary Permit Charges',
    category: 'PassThrough',
    isPassThrough: true,
  },
  {
    code: 'DOCTOR_INSPECTION_CHARGES',
    label: 'Doctor Inspection Charges',
    category: 'PassThrough',
    isPassThrough: true,
  },
  {
    code: 'OSS_INSPECTION_CHARGES',
    label: 'OSS Inspection Charges',
    category: 'PassThrough',
    isPassThrough: true,
  },
  {
    code: 'VETERINARY_HEALTH_CERTIFICATE',
    label: 'Veterinary Health Certificate',
    category: 'PassThrough',
    isPassThrough: true,
  },
  { code: 'COO', label: 'COO', category: 'PassThrough', isPassThrough: true },
  {
    code: 'INVOICE_LEGALIZATION',
    label: 'Invoice Legalization',
    category: 'PassThrough',
    isPassThrough: true,
  },
  {
    code: 'WEIGHING_CHARGES',
    label: 'Weighing Charges',
    category: 'PassThrough',
    isPassThrough: true,
  },
  {
    code: 'WAITING_CHARGES',
    label: 'Waiting Charges',
    category: 'PassThrough',
    isPassThrough: true,
  },
  {
    code: 'ROP_INSPECTION',
    label: 'ROP Inspection',
    category: 'PassThrough',
    isPassThrough: true,
  },
  { code: 'VISA', label: 'Visa', category: 'PassThrough', isPassThrough: true },
  {
    code: 'TRIPTIK',
    label: 'Triptik',
    category: 'PassThrough',
    isPassThrough: true,
  },
  {
    code: 'INSURANCE',
    label: 'Insurance',
    category: 'PassThrough',
    isPassThrough: true,
  },
  {
    code: 'TRANSPORTATION_PERMIT',
    label: 'Transportation Permit',
    category: 'PassThrough',
    isPassThrough: true,
  },
  {
    code: 'SERVICE',
    label: 'Service',
    category: 'Revenue',
    isPassThrough: false,
  },
  {
    code: 'PORT_DEMMURAGE_CHARGES',
    label: 'Port Demmurage Charges',
    category: 'PassThrough',
    isPassThrough: true,
  },
  {
    code: 'SEA_FREIGHT',
    label: 'Sea Freight',
    category: 'PassThrough',
    isPassThrough: true,
  },
  {
    code: 'DIESEL',
    label: 'Diesel',
    category: 'PassThrough',
    isPassThrough: true,
  },
];

export default function NewInvoiceModal({
  open,
  onOpenChange,
}: NewInvoiceModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [trucks, setTrucks] = useState<any[]>([]);
  const [trailers, setTrailers] = useState<any[]>([]);
  const [availableTripMirrors, setAvailableTripMirrors] = useState<any[]>([]);
  const [invoiceElements, setInvoiceElements] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    customerName: '',
    currency: 'OMR',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    notes: '',
    truckId: '',
    trailerId: '',
    tripMirrorReference: '',
  });

  // Load initial data
  useEffect(() => {
    if (open) {
      fetchCustomers();
      fetchTrucks();
      fetchTrailers();
      fetchInvoiceElements();
    }
  }, [open]);

  // Fetch available trip mirrors when truck and trailer are selected
  useEffect(() => {
    if (formData.truckId && formData.trailerId) {
      fetchAvailableTripMirrors();
    } else {
      setAvailableTripMirrors([]);
      setFormData(prev => ({ ...prev, tripMirrorReference: '' }));
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

  const fetchAvailableTripMirrors = async () => {
    const { data } = await supabase
      .from('trip_mirror')
      .select('*')
      .eq('truck_id', formData.truckId)
      .eq('trailer_id', formData.trailerId)
      .eq('is_invoiced', false)
      .eq('is_deleted', false)
      .in('status', ['Completed', 'Active'])
      .order('reference_number', { ascending: false });

    if (data) {
      setAvailableTripMirrors(data);
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
    setItems(
      items.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };

          // Auto-set pass-through flag based on element
          if (field === 'elementCode') {
            const element = invoiceElements.find(e => e.code === value);
            if (element) {
              updated.isPassThrough = element.category === 'PassThrough';
              updated.description = element.label;
            }
          }

          // Recalculate amount
          if (field === 'qty' || field === 'unitPrice') {
            updated.amount = updated.qty * updated.unitPrice;
          }

          return updated;
        }
        return item;
      })
    );
  };

  const calculateTotals = () => {
    const revenueItems = items.filter(item => !item.isPassThrough);
    const passThroughItems = items.filter(item => item.isPassThrough);

    const revenueSubtotal = revenueItems.reduce(
      (sum, item) => sum + item.amount,
      0
    );
    const passThroughSubtotal = passThroughItems.reduce(
      (sum, item) => sum + item.amount,
      0
    );
    const totalTax = items.reduce(
      (sum, item) => sum + (item.amount * item.taxRate) / 100,
      0
    );
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

    if (!formData.customerName || !formData.truckId || !formData.trailerId) {
      toast({
        title: 'Error',
        description:
          'Please fill in all required fields (Customer, Truck, Trailer)',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.tripMirrorReference) {
      toast({
        title: 'Error',
        description: 'Please select a Trip Mirror reference number',
        variant: 'destructive',
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one invoice item',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Generate invoice number
      const invoiceNo = `INV-${Date.now()}`;

      // Calculate totals
      const totals = calculateTotals();

      // Create the invoice
      const invoiceData = {
        invoice_no: invoiceNo,
        customer_id: formData.customerName,
        issue_date: formData.issueDate,
        due_date: formData.dueDate || formData.issueDate,
        currency: formData.currency,
        status: 'Draft',
        notes: formData.notes,
        trip_mirror_reference_number: formData.tripMirrorReference,
      };

      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert(invoiceData)
        .select()
        .single();

      if (invoiceError) {
        console.error('Invoice creation error:', invoiceError);
        throw invoiceError;
      }

      // Create invoice items
      const invoiceItemsData = items.map(item => {
        const element = invoiceElements.find(e => e.code === item.elementCode);
        return {
          invoice_id: invoice.id,
          element_id: element?.id || null,
          description: item.description,
          qty: item.qty,
          unit_price: item.unitPrice,
          currency: formData.currency,
          amount_foreign: item.amount,
          amount_omr:
            formData.currency === 'OMR' ? item.amount : item.amount * 0.1, // Simple conversion
          is_pass_through: item.isPassThrough,
          tax_rate: item.taxRate,
          truck_id: formData.truckId,
          trailer_id: formData.trailerId,
        };
      });

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(invoiceItemsData);

      if (itemsError) {
        console.error('Invoice items creation error:', itemsError);
        throw itemsError;
      }

      // Mark the trip mirror as invoiced
      await supabase
        .from('trip_mirror')
        .update({ is_invoiced: true })
        .eq('reference_number', formData.tripMirrorReference);

      toast({
        title: 'Success',
        description: `Invoice ${invoiceNo} created successfully`,
      });

      onOpenChange(false);
      // Reset form
      setFormData({
        customerName: '',
        currency: 'OMR',
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: '',
        notes: '',
        truckId: '',
        trailerId: '',
        tripMirrorReference: '',
      });
      setItems([]);
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast({
        title: 'Error',
        description: 'Failed to create invoice. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotals();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-6xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Invoice</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Trip Mirror Selection Alert */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Invoice creation requires a valid Trip Mirror reference. Please
              select truck and trailer first to see available trip mirrors.
            </AlertDescription>
          </Alert>

          {/* Header Information */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="customer">Customer *</Label>
              <Select
                value={formData.customerName}
                onValueChange={value =>
                  setFormData({ ...formData, customerName: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map(customer => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={value =>
                  setFormData({ ...formData, currency: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OMR">OMR</SelectItem>
                  <SelectItem value="AED">AED</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Truck and Trailer Selection */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="truck">Truck *</Label>
              <Select
                value={formData.truckId}
                onValueChange={value =>
                  setFormData({ ...formData, truckId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select truck" />
                </SelectTrigger>
                <SelectContent>
                  {trucks.map(truck => (
                    <SelectItem key={truck.id} value={truck.id}>
                      {truck.plate_no} ({truck.make} {truck.model})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="trailer">Trailer *</Label>
              <Select
                value={formData.trailerId}
                onValueChange={value =>
                  setFormData({ ...formData, trailerId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select trailer" />
                </SelectTrigger>
                <SelectContent>
                  {trailers.map(trailer => (
                    <SelectItem key={trailer.id} value={trailer.id}>
                      {trailer.plate_no} ({trailer.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Trip Mirror Reference Selection */}
          {formData.truckId && formData.trailerId && (
            <div className="space-y-2">
              <Label htmlFor="tripMirror">Trip Mirror Reference *</Label>
              <Select
                value={formData.tripMirrorReference}
                onValueChange={value =>
                  setFormData({ ...formData, tripMirrorReference: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select trip mirror reference" />
                </SelectTrigger>
                <SelectContent>
                  {availableTripMirrors.map(tripMirror => (
                    <SelectItem
                      key={tripMirror.id}
                      value={tripMirror.reference_number}
                    >
                      {tripMirror.reference_number} - {tripMirror.driver_name} (
                      {new Date(tripMirror.start_date).toLocaleDateString()})
                    </SelectItem>
                  ))}
                  {availableTripMirrors.length === 0 && (
                    <SelectItem value="no-trips-available" disabled>
                      No available trip mirrors for this truck/trailer
                      combination
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {availableTripMirrors.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No uninvoiced trip mirrors found for the selected truck and
                  trailer combination.
                </p>
              )}
            </div>
          )}

          {/* Date Fields */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="issueDate">Issue Date</Label>
              <Input
                id="issueDate"
                type="date"
                value={formData.issueDate}
                onChange={e =>
                  setFormData({ ...formData, issueDate: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={e =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
              />
            </div>
          </div>

          {/* Invoice Items */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Invoice Items</CardTitle>
              <Button type="button" onClick={addItem} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map(item => (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 items-end gap-2 rounded-lg border p-4"
                  >
                    <div className="col-span-2">
                      <Label className="text-xs">Element</Label>
                      <Select
                        value={item.elementCode}
                        onValueChange={value =>
                          updateItem(item.id, 'elementCode', value)
                        }
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {invoiceElements.map(element => (
                            <SelectItem key={element.code} value={element.code}>
                              {element.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="col-span-3">
                      <Label className="text-xs">Description</Label>
                      <Input
                        value={item.description}
                        onChange={e =>
                          updateItem(item.id, 'description', e.target.value)
                        }
                        className="h-8"
                        placeholder="Description"
                      />
                    </div>

                    <div className="col-span-1">
                      <Label className="text-xs">Qty</Label>
                      <Input
                        type="number"
                        value={item.qty}
                        onChange={e =>
                          updateItem(
                            item.id,
                            'qty',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="h-8"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div className="col-span-2">
                      <Label className="text-xs">Unit Price</Label>
                      <Input
                        type="number"
                        value={item.unitPrice}
                        onChange={e =>
                          updateItem(
                            item.id,
                            'unitPrice',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="h-8"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div className="col-span-2">
                      <Label className="text-xs">Amount</Label>
                      <div className="flex h-8 items-center rounded bg-muted px-3 py-1 text-sm">
                        {item.amount.toFixed(2)}
                      </div>
                    </div>

                    <div className="col-span-1">
                      <Label className="text-xs">Tax %</Label>
                      <Input
                        type="number"
                        value={item.taxRate}
                        onChange={e =>
                          updateItem(
                            item.id,
                            'taxRate',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="h-8"
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    </div>

                    <div className="col-span-1 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {item.isPassThrough && (
                      <div className="col-span-12">
                        <span className="rounded bg-orange-100 px-2 py-1 text-xs text-orange-800">
                          Pass-Through Charge
                        </span>
                      </div>
                    )}
                  </div>
                ))}

                {items.length === 0 && (
                  <div className="py-8 text-center text-muted-foreground">
                    No items added yet. Click "Add Item" to get started.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Totals Panel */}
          {items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Invoice Totals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Revenue Subtotal:</span>
                      <span className="font-medium">
                        {totals.revenueSubtotal.toFixed(2)} {formData.currency}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pass-Through:</span>
                      <span className="font-medium">
                        {totals.passThroughSubtotal.toFixed(2)}{' '}
                        {formData.currency}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax:</span>
                      <span className="font-medium">
                        {totals.totalTax.toFixed(2)} {formData.currency}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2 font-bold">
                      <span>Grand Total:</span>
                      <span>
                        {totals.grandTotal.toFixed(2)} {formData.currency}
                      </span>
                    </div>
                  </div>
                  {formData.currency !== 'OMR' && (
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        OMR Equivalent:
                      </div>
                      <div className="flex justify-between">
                        <span>Revenue:</span>
                        <span>
                          {(totals.revenueSubtotal * 0.1).toFixed(2)} OMR
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Grand Total:</span>
                        <span className="font-bold">
                          {(totals.grandTotal * 0.1).toFixed(2)} OMR
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={e =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Additional notes or terms..."
              rows={3}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Invoice'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
