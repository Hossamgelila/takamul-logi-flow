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
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ExpenseItem {
  id: string;
  type: string;
  amount: string;
  currency: string;
}

interface NewExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function NewExpenseModal({
  open,
  onOpenChange,
}: NewExpenseModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  // Fetch data when component mounts
  useEffect(() => {
    fetchRoutes();
    fetchTrucks();
    fetchTrailers();
    fetchCustomers();
    fetchVendors();
  }, []);

  const fetchRoutes = async () => {
    const { data } = await supabase
      .from('routes')
      .select('*')
      .eq('is_deleted', false)
      .eq('is_active', true)
      .order('name');
    if (data) setRoutes(data);
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

  const fetchCustomers = async () => {
    const { data } = await supabase
      .from('customers')
      .select('*')
      .eq('is_deleted', false)
      .order('name');
    if (data) setCustomers(data);
  };

  const fetchVendors = async () => {
    const { data } = await supabase
      .from('vendors')
      .select('*')
      .eq('is_deleted', false)
      .order('name');
    if (data) setVendors(data);
  };

  // General Expense Form Data
  const [generalFormData, setGeneralFormData] = useState({
    vendorId: '',
    referenceNumber: '',
    allocation: 'truck',
    truckId: 'none',
    trailerId: 'none',
    date: new Date().toISOString().split('T')[0],
    category: 'VISA & IMMIGRATION EXP',
    subcategory: '',
    description: '',
    currency: 'OMR',
    amount: 0,
    isPassThrough: false,
  });

  // Service & Maintenance subcategories
  const maintenanceSubcategories = [
    'SAFETY BELTS',
    'STEERING',
    'ENGINE',
    'TRANSMISSION',
    'HEATER AIR CONDITIONING',
    'WIPERS',
    'LIGHTS',
    'DOORS',
    'WINDOWS WINDSHIELD',
    'HORN',
    'TIRES',
    'LUG WRENCH JACK',
    'FIRE EXTINGUISHER',
    'FIRST AID KIT',
    'ACCIDENT INFORMATION',
    'LIQUIDS',
    'RADIATOR',
    'EXHAUST SYSTEM',
    'BRAKES',
    'TRAPOLINE & RASAS',
    'IVMS',
    'OIL FILTER',
    'FUEL FILTER DIESEL',
    'AIR FILTER',
    'CAR WASH & GREASE',
    'BATTERY',
    'AIR COMPRESSOR',
    'WELDING',
    'PAINTING',
    'OTHERS',
    'SUSPENSION',
    'GENSET',
    'ASSET',
    'OIL',
  ];

  // Trip Mirror Form Data
  const [tripFormData, setTripFormData] = useState({
    // Basic Trip Information
    invoiceNo: '',
    startDate: null as Date | null,
    endDate: null as Date | null,
    truckNo: '',
    trailerNo: '',
    route: '',
    km: '',

    // Customer/Client Information
    customerName: '',

    // Driver Details
    driverName: '',

    // Load/Cargo Information
    cargoType: '',
    weightTons: '',
    containerNumber: '',
  });

  // Routes data
  const [routes, setRoutes] = useState<any[]>([]);

  // Trucks and trailers data
  const [trucks, setTrucks] = useState<any[]>([]);
  const [trailers, setTrailers] = useState<any[]>([]);

  // Customers data
  const [customers, setCustomers] = useState<any[]>([]);

  // Vendors data
  const [vendors, setVendors] = useState<any[]>([]);

  // Trip expense items
  const [tripExpenseItems, setTripExpenseItems] = useState<ExpenseItem[]>([]);

  const expenseTypes = [
    'DIESEL',
    'TRIP ALLOWANCE',
    'UAE VISA',
    'KSA VISA',
    'UAE EXIT',
    'KSA EXIT',
    'NAQAL PERMIT',
    'KSA FUSAH',
    'MEAZN & TAHSEEN',
    'TOLL',
    'TERPOLINE',
    'CONTAINER EMPTY RETURN',
    'OTHERS',
  ];

  const currencies = ['OMR', 'Saudi Rial', 'AED'];

  // Outside Payment Form Data
  const [outsideFormData, setOutsideFormData] = useState({
    supplierName: '',
    route: '',
    numberOfTrucks: 1,
    value: 0,
    amount: 0,
    invoiceNumber: '',
  });

  // Trip expense item handlers
  const addTripExpenseItem = () => {
    const newItem: ExpenseItem = {
      id: Date.now().toString(),
      type: '',
      amount: '',
      currency: 'OMR',
    };
    setTripExpenseItems([...tripExpenseItems, newItem]);
  };

  const removeTripExpenseItem = (id: string) => {
    setTripExpenseItems(tripExpenseItems.filter(item => item.id !== id));
  };

  const updateTripExpenseItem = (
    id: string,
    field: keyof ExpenseItem,
    value: string
  ) => {
    setTripExpenseItems(
      tripExpenseItems.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  // Map expense types to valid database categories
  const mapExpenseTypeToCategory = (expenseType: string): string => {
    const mapping: { [key: string]: string } = {
      DIESEL: 'Fuel',
      'TRIP ALLOWANCE': 'Other',
      'UAE VISA': 'Fees',
      'KSA VISA': 'Fees',
      'UAE EXIT': 'Fees',
      'KSA EXIT': 'Fees',
      'NAQAL PERMIT': 'Fees',
      SALIK: 'Tolls',
      TOLL: 'Tolls',
      LOADING: 'Other',
      OVERTIME: 'Labor',
      REPAIR: 'Parts',
      'SPARE PARTS': 'Parts',
      'TYRE REPAIR': 'Tires',
      'ENGINE OIL': 'Parts',
      'DIESEL FILTER': 'Parts',
      'AIR FILTER': 'Parts',
      SERVICE: 'Labor',
      TIRES: 'Tires',
      'OFFICE SUPPLIES': 'Other',
      INSURANCE: 'Other',
      MAINTENANCE: 'Labor',
      WASHING: 'Other',
      GARAGE: 'Labor',
      TOWING: 'Other',
      INSPECTION: 'Other',
      REGISTRATION: 'Fees',
      ASSET: 'Other',
      OIL: 'Parts',
    };

    return mapping[expenseType] || 'Other';
  };

  const handleTripInputChange = (field: string, value: string) => {
    setTripFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTripDateChange = (
    field: 'startDate' | 'endDate',
    date: Date | undefined
  ) => {
    setTripFormData(prev => ({ ...prev, [field]: date || null }));
  };

  const handleGeneralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !generalFormData.vendorId ||
      !generalFormData.referenceNumber ||
      !generalFormData.description ||
      generalFormData.amount <= 0
    ) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    // Check if SERVICE & MAINTENANCE is selected but no subcategory is chosen
    if (
      generalFormData.category === 'SERVICE & MAINTENANCE' &&
      !generalFormData.subcategory
    ) {
      toast({
        title: 'Error',
        description: 'Please select a Service & Maintenance type',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Save to database
      const expenseData = {
        date: generalFormData.date,
        vendor_id: generalFormData.vendorId,
        category: generalFormData.category,
        description: generalFormData.subcategory
          ? `${generalFormData.description} - ${generalFormData.subcategory}`
          : generalFormData.description,
        amount_foreign: generalFormData.amount,
        currency: generalFormData.currency,
        truck_id:
          generalFormData.truckId !== 'none' ? generalFormData.truckId : null,
        trailer_id:
          generalFormData.trailerId !== 'none'
            ? generalFormData.trailerId
            : null,
        is_pass_through: generalFormData.isPassThrough,
      };

      const { error } = await supabase.from('expenses').insert(expenseData);

      if (error) {
        console.error('Error saving expense:', error);
        throw error;
      }

      toast({
        title: 'Success',
        description: 'General expense recorded successfully',
      });

      onOpenChange(false);
      resetForms();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to record expense',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTripSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !tripFormData.route ||
      !tripFormData.truckNo ||
      !tripFormData.customerName ||
      !tripFormData.driverName
    ) {
      toast({
        title: 'Error',
        description:
          'Please fill in all required fields (Route, Truck Number, Customer Name, Driver Name)',
        variant: 'destructive',
      });
      return;
    }

    if (tripExpenseItems.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one expense item',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // First create the trip mirror entry
      const tripMirrorData = {
        reference_number: tripFormData.invoiceNo || `TM-${Date.now()}`,
        start_date: tripFormData.startDate?.toISOString().split('T')[0] || null,
        end_date: tripFormData.endDate?.toISOString().split('T')[0] || null,
        truck_id: tripFormData.truckNo,
        trailer_id: tripFormData.trailerNo || null,
        route_id: tripFormData.route,
        customer_id: tripFormData.customerName, // Now stores actual customer ID
        driver_name: tripFormData.driverName,
        cargo_type: tripFormData.cargoType || null,
        weight_tons: tripFormData.weightTons
          ? parseFloat(tripFormData.weightTons)
          : null,
        container_number: tripFormData.containerNumber || null,
        km_distance: tripFormData.km ? parseFloat(tripFormData.km) : null,
        status: 'Active',
        notes: null, // Remove customer name from notes since we have customer_id
      };

      const { data: tripMirror, error: tripError } = await supabase
        .from('trip_mirror')
        .insert(tripMirrorData)
        .select()
        .single();

      if (tripError) {
        console.error('Trip mirror error:', tripError);
        throw tripError;
      }

      // Create expenses for each expense item
      const expensePromises = tripExpenseItems.map(async item => {
        // Ensure a vendor exists (use a generic "Trip Expense" vendor)
        let vendor_id = null as string | null;

        const { data: existingVendor } = await supabase
          .from('vendors')
          .select('id')
          .eq('name', 'Trip Expense')
          .maybeSingle();

        if (existingVendor) {
          vendor_id = existingVendor.id;
        } else {
          const { data: newVendor, error: vendorError } = await supabase
            .from('vendors')
            .insert({
              name: 'Trip Expense',
              type: 'Other',
              country: 'OM',
            })
            .select()
            .single();

          if (vendorError) {
            console.error('Vendor creation error:', vendorError);
            throw vendorError;
          }
          vendor_id = newVendor.id;
        }

        const expenseData = {
          date:
            tripFormData.startDate?.toISOString().split('T')[0] ||
            new Date().toISOString().split('T')[0],
          vendor_id: vendor_id,
          category: mapExpenseTypeToCategory(item.type),
          description: `${item.type} - Trip: ${tripFormData.invoiceNo || tripMirror.id}`,
          amount_foreign: parseFloat(item.amount) || 0,
          currency: item.currency,
          truck_id: tripFormData.truckNo,
          trailer_id: tripFormData.trailerNo || null,
          is_pass_through: false,
        };

        return supabase.from('expenses').insert(expenseData);
      });

      await Promise.all(expensePromises);

      console.log('Trip Mirror Data saved successfully:', {
        tripFormData,
        tripExpenseItems,
      });

      toast({
        title: 'Success',
        description: `Trip expenses recorded successfully (${tripExpenseItems.length} items)`,
      });

      onOpenChange(false);
      resetForms();
    } catch (error) {
      console.error('Error saving trip expenses:', error);
      toast({
        title: 'Error',
        description: 'Failed to record trip expenses. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOutsideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !outsideFormData.supplierName ||
      !outsideFormData.invoiceNumber ||
      outsideFormData.amount <= 0
    ) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Find or create vendor for outside payment
      let vendor_id = null;
      const existingVendor = vendors.find(
        v => v.name === outsideFormData.supplierName
      );

      if (existingVendor) {
        vendor_id = existingVendor.id;
      } else {
        // Create new vendor
        const { data: newVendor, error: vendorError } = await supabase
          .from('vendors')
          .insert({
            name: outsideFormData.supplierName,
            type: 'Supplier',
            country: 'OM',
          })
          .select()
          .single();

        if (vendorError) {
          console.error('Vendor creation error:', vendorError);
          throw vendorError;
        }
        vendor_id = newVendor.id;

        // Add the new vendor to the list
        setVendors([...vendors, newVendor]);
      }

      // Create the expense record
      const expenseData = {
        date: new Date().toISOString().split('T')[0],
        vendor_id: vendor_id,
        category: 'OUTSIDE PAYMENT',
        description: `Outside Payment - ${outsideFormData.supplierName} - Invoice: ${outsideFormData.invoiceNumber}`,
        amount_foreign: outsideFormData.amount,
        currency: 'OMR',
        truck_id: null, // Outside payments typically don't have truck assignment
        trailer_id: null,
        is_pass_through: true, // Outside payments are usually pass-through
      };

      const { error } = await supabase.from('expenses').insert(expenseData);

      if (error) {
        console.error('Error saving outside payment:', error);
        throw error;
      }

      toast({
        title: 'Success',
        description: 'Outside payment recorded successfully',
      });

      onOpenChange(false);
      resetForms();
    } catch (error) {
      console.error('Error saving outside payment:', error);
      toast({
        title: 'Error',
        description: 'Failed to record outside payment',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForms = () => {
    setGeneralFormData({
      vendorId: '',
      referenceNumber: '',
      allocation: 'truck',
      truckId: 'none',
      trailerId: 'none',
      date: new Date().toISOString().split('T')[0],
      category: 'VISA & IMMIGRATION EXP',
      subcategory: '',
      description: '',
      currency: 'OMR',
      amount: 0,
      isPassThrough: false,
    });
    setTripFormData({
      // Basic Trip Information
      invoiceNo: '',
      startDate: null,
      endDate: null,
      truckNo: '',
      trailerNo: '',
      route: '',
      km: '',

      // Customer/Client Information
      customerName: '',

      // Driver Details
      driverName: '',

      // Load/Cargo Information
      cargoType: '',
      weightTons: '',
      containerNumber: '',
    });
    setTripExpenseItems([]);
    setOutsideFormData({
      supplierName: '',
      route: '',
      numberOfTrucks: 1,
      value: 0,
      amount: 0,
      invoiceNumber: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="modal-responsive overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record New Expense</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General Expense</TabsTrigger>
            <TabsTrigger value="trip">Trip Mirror</TabsTrigger>
            <TabsTrigger value="outside">Outside Payment</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-4">
            <form onSubmit={handleGeneralSubmit} className="form-responsive">
              <div className="space-y-2">
                <Label htmlFor="vendor">Vendor *</Label>
                <Select
                  value={generalFormData.vendorId}
                  onValueChange={value =>
                    setGeneralFormData({ ...generalFormData, vendorId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendors.map(vendor => (
                      <SelectItem key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </SelectItem>
                    ))}
                    {vendors.length === 0 && (
                      <SelectItem value="no-vendors" disabled>
                        No vendors available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="referenceNumber">Reference Number *</Label>
                <Input
                  id="referenceNumber"
                  value={generalFormData.referenceNumber}
                  onChange={e =>
                    setGeneralFormData({
                      ...generalFormData,
                      referenceNumber: e.target.value,
                    })
                  }
                  placeholder="Enter reference number"
                  required
                />
              </div>

              <div className="form-grid-responsive">
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={generalFormData.date}
                    onChange={e =>
                      setGeneralFormData({
                        ...generalFormData,
                        date: e.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={generalFormData.category}
                    onValueChange={value =>
                      setGeneralFormData({
                        ...generalFormData,
                        category: value,
                        subcategory: '',
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VISA & IMMIGRATION EXP">
                        VISA & IMMIGRATION EXP
                      </SelectItem>
                      <SelectItem value="SEWAGE COUPONS">
                        SEWAGE COUPONS
                      </SelectItem>
                      <SelectItem value="STATIONARY & OFFICE EQUIPMENT">
                        STATIONARY & OFFICE EQUIPMENT
                      </SelectItem>
                      <SelectItem value="SOCIAL INSURANCE">
                        SOCIAL INSURANCE
                      </SelectItem>
                      <SelectItem value="PORT GATE PASS">
                        PORT GATE PASS
                      </SelectItem>
                      <SelectItem value="TELECOM">TELECOM</SelectItem>
                      <SelectItem value="OTHERS">OTHERS</SelectItem>
                      <SelectItem value="EQUIPMENT RENT">
                        EQUIPMENT RENT
                      </SelectItem>
                      <SelectItem value="FLIGHT TICKET">
                        FLIGHT TICKET
                      </SelectItem>
                      <SelectItem value="ASSET">ASSET</SelectItem>
                      <SelectItem value="FREE ZONE CHARGES">
                        FREE ZONE CHARGES
                      </SelectItem>
                      <SelectItem value="SAFETY CERTIFICATE">
                        SAFETY CERTIFICATE
                      </SelectItem>
                      <SelectItem value="STUFF EXP">STUFF EXP</SelectItem>
                      <SelectItem value="OUTSIDE DRIVER">
                        OUTSIDE DRIVER
                      </SelectItem>
                      <SelectItem value="SERVICE & MAINTENANCE">
                        SERVICE & MAINTENANCE
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Service & Maintenance Subcategory - Conditional Display */}
              {generalFormData.category === 'SERVICE & MAINTENANCE' && (
                <div className="space-y-2">
                  <Label htmlFor="subcategory">
                    Service & Maintenance Type *
                  </Label>
                  <Select
                    value={generalFormData.subcategory}
                    onValueChange={value =>
                      setGeneralFormData({
                        ...generalFormData,
                        subcategory: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select maintenance type" />
                    </SelectTrigger>
                    <SelectContent className="z-50 max-h-60 overflow-y-auto border bg-background shadow-md">
                      {maintenanceSubcategories.map(subcategory => (
                        <SelectItem key={subcategory} value={subcategory}>
                          {subcategory}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={generalFormData.description}
                  onChange={e =>
                    setGeneralFormData({
                      ...generalFormData,
                      description: e.target.value,
                    })
                  }
                  placeholder="Detailed description of the expense"
                  rows={3}
                  required
                />
              </div>

              <div className="form-grid-responsive">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={generalFormData.currency}
                    onValueChange={value =>
                      setGeneralFormData({
                        ...generalFormData,
                        currency: value,
                      })
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

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={generalFormData.amount}
                    onChange={e =>
                      setGeneralFormData({
                        ...generalFormData,
                        amount: parseFloat(e.target.value) || 0,
                      })
                    }
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className="form-grid-responsive">
                <div className="space-y-2">
                  <Label htmlFor="truck">Truck Number</Label>
                  <Select
                    value={generalFormData.truckId}
                    onValueChange={value =>
                      setGeneralFormData({ ...generalFormData, truckId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select truck" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {trucks.map(truck => (
                        <SelectItem key={truck.id} value={truck.id}>
                          {truck.plate_no}{' '}
                          {truck.make && truck.model
                            ? `(${truck.make} ${truck.model})`
                            : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="trailer">Trailer Number</Label>
                  <Select
                    value={generalFormData.trailerId}
                    onValueChange={value =>
                      setGeneralFormData({
                        ...generalFormData,
                        trailerId: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select trailer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {trailers.map(trailer => (
                        <SelectItem key={trailer.id} value={trailer.id}>
                          {trailer.plate_no}{' '}
                          {trailer.type ? `(${trailer.type})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="passThrough"
                  checked={generalFormData.isPassThrough}
                  onCheckedChange={checked =>
                    setGeneralFormData({
                      ...generalFormData,
                      isPassThrough: checked,
                    })
                  }
                />
                <Label htmlFor="passThrough">
                  Pass-Through Expense (paid on behalf of customer)
                </Label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Recording...' : 'Record Expense'}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="trip" className="mt-4">
            <form onSubmit={handleTripSubmit} className="space-y-6">
              {/* Basic Trip Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Basic Trip Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="invoiceNo">Invoice No</Label>
                    <Input
                      id="invoiceNo"
                      value={tripFormData.invoiceNo}
                      onChange={e =>
                        handleTripInputChange('invoiceNo', e.target.value)
                      }
                      placeholder="Enter invoice number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="route">Route *</Label>
                    <Select
                      value={tripFormData.route}
                      onValueChange={value =>
                        handleTripInputChange('route', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select route" />
                      </SelectTrigger>
                      <SelectContent className="z-50 border bg-background shadow-md">
                        {routes.map(route => (
                          <SelectItem key={route.id} value={route.id}>
                            {route.name} - {route.from_place} to{' '}
                            {route.to_place}
                          </SelectItem>
                        ))}
                        {routes.length === 0 && (
                          <SelectItem value="no-routes" disabled>
                            No routes available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !tripFormData.startDate && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {tripFormData.startDate
                            ? format(tripFormData.startDate, 'PPP')
                            : 'Pick start date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={tripFormData.startDate || undefined}
                          onSelect={date =>
                            handleTripDateChange('startDate', date)
                          }
                          initialFocus
                          className="pointer-events-auto p-3"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !tripFormData.endDate && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {tripFormData.endDate
                            ? format(tripFormData.endDate, 'PPP')
                            : 'Pick end date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={tripFormData.endDate || undefined}
                          onSelect={date =>
                            handleTripDateChange('endDate', date)
                          }
                          initialFocus
                          className="pointer-events-auto p-3"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="truckNo">Truck No *</Label>
                    <Select
                      value={tripFormData.truckNo}
                      onValueChange={value =>
                        handleTripInputChange('truckNo', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select truck" />
                      </SelectTrigger>
                      <SelectContent className="z-50 border bg-background shadow-md">
                        {trucks.map(truck => (
                          <SelectItem key={truck.id} value={truck.id}>
                            {truck.plate_no}{' '}
                            {truck.make && truck.model
                              ? `(${truck.make} ${truck.model})`
                              : ''}
                          </SelectItem>
                        ))}
                        {trucks.length === 0 && (
                          <SelectItem value="no-trucks" disabled>
                            No trucks available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="trailerNo">Trailer No</Label>
                    <Select
                      value={tripFormData.trailerNo}
                      onValueChange={value =>
                        handleTripInputChange('trailerNo', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select trailer" />
                      </SelectTrigger>
                      <SelectContent className="z-50 border bg-background shadow-md">
                        {trailers.map(trailer => (
                          <SelectItem key={trailer.id} value={trailer.id}>
                            {trailer.plate_no}{' '}
                            {trailer.type ? `(${trailer.type})` : ''}
                          </SelectItem>
                        ))}
                        {trailers.length === 0 && (
                          <SelectItem value="no-trailers" disabled>
                            No trailers available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="km">KM</Label>
                    <Input
                      id="km"
                      type="number"
                      value={tripFormData.km}
                      onChange={e =>
                        handleTripInputChange('km', e.target.value)
                      }
                      placeholder="Distance in KM"
                    />
                  </div>
                </div>
              </div>

              {/* Customer/Client Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Customer/Client Information
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="customerName">Customer Name *</Label>
                  <Select
                    value={tripFormData.customerName}
                    onValueChange={value =>
                      handleTripInputChange('customerName', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent className="z-50 border bg-background shadow-md">
                      {customers.map(customer => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                      {customers.length === 0 && (
                        <SelectItem value="no-customers" disabled>
                          No customers available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Driver Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Driver Details</h3>
                <div className="space-y-2">
                  <Label htmlFor="driverName">Driver Name *</Label>
                  <Input
                    id="driverName"
                    value={tripFormData.driverName}
                    onChange={e =>
                      handleTripInputChange('driverName', e.target.value)
                    }
                    placeholder="Full driver name"
                    required
                  />
                </div>
              </div>

              {/* Load/Cargo Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Load/Cargo Information
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cargoType">Cargo Type</Label>
                    <Select
                      value={tripFormData.cargoType}
                      onValueChange={value =>
                        handleTripInputChange('cargoType', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent className="z-50 border bg-background shadow-md">
                        <SelectItem value="General">General</SelectItem>
                        <SelectItem value="Container">Container</SelectItem>
                        <SelectItem value="Bulk">Bulk</SelectItem>
                        <SelectItem value="Liquid">Liquid</SelectItem>
                        <SelectItem value="Hazardous">Hazardous</SelectItem>
                        <SelectItem value="Refrigerated">
                          Refrigerated
                        </SelectItem>
                        <SelectItem value="Oversized">Oversized</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weightTons">Weight (Tons)</Label>
                    <Input
                      id="weightTons"
                      type="number"
                      step="0.1"
                      value={tripFormData.weightTons}
                      onChange={e =>
                        handleTripInputChange('weightTons', e.target.value)
                      }
                      placeholder="0.0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="containerNumber">Container Number</Label>
                    <Input
                      id="containerNumber"
                      value={tripFormData.containerNumber}
                      onChange={e =>
                        handleTripInputChange('containerNumber', e.target.value)
                      }
                      placeholder="Container ID"
                    />
                  </div>
                </div>
              </div>

              {/* Trip Expenses Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Trip Expenses</h3>
                  <Button
                    type="button"
                    onClick={addTripExpenseItem}
                    size="sm"
                    variant="outline"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Expense
                  </Button>
                </div>

                {tripExpenseItems.length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    <p>No expenses added yet.</p>
                    <p className="text-sm">
                      Click "Add Expense" to start adding trip expenses.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tripExpenseItems.map(item => (
                      <div
                        key={item.id}
                        className="grid grid-cols-12 items-end gap-2"
                      >
                        <div className="col-span-5">
                          <Label className="text-xs">Expense Type</Label>
                          <Select
                            value={item.type}
                            onValueChange={value =>
                              updateTripExpenseItem(item.id, 'type', value)
                            }
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent className="z-50 border bg-background shadow-md">
                              {expenseTypes.map(type => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="col-span-3">
                          <Label className="text-xs">Amount</Label>
                          <Input
                            type="number"
                            value={item.amount}
                            onChange={e =>
                              updateTripExpenseItem(
                                item.id,
                                'amount',
                                e.target.value
                              )
                            }
                            placeholder="0.00"
                            className="h-9"
                          />
                        </div>

                        <div className="col-span-3">
                          <Label className="text-xs">Currency</Label>
                          <Select
                            value={item.currency}
                            onValueChange={value =>
                              updateTripExpenseItem(item.id, 'currency', value)
                            }
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="z-50 border bg-background shadow-md">
                              {currencies.map(currency => (
                                <SelectItem key={currency} value={currency}>
                                  {currency}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="col-span-1">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeTripExpenseItem(item.id)}
                            className="h-9 w-9 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    {/* Summary */}
                    <div className="mt-4 rounded-lg bg-muted p-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          Total Expenses: {tripExpenseItems.length} items
                        </p>
                        <div className="flex gap-4 text-sm">
                          {currencies.map(currency => {
                            const total = tripExpenseItems
                              .filter(item => item.currency === currency)
                              .reduce(
                                (sum, item) =>
                                  sum + (parseFloat(item.amount) || 0),
                                0
                              );

                            if (total > 0) {
                              return (
                                <span key={currency} className="font-medium">
                                  {currency}: {total.toFixed(2)}
                                </span>
                              );
                            }
                            return null;
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Recording...' : 'Record Trip Expenses'}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="outside" className="mt-4">
            <form onSubmit={handleOutsideSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="supplierName">Supplier Name *</Label>
                <Input
                  id="supplierName"
                  value={outsideFormData.supplierName}
                  onChange={e =>
                    setOutsideFormData({
                      ...outsideFormData,
                      supplierName: e.target.value,
                    })
                  }
                  placeholder="Enter supplier name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="outsideRoute">Route</Label>
                <Select
                  value={outsideFormData.route}
                  onValueChange={value =>
                    setOutsideFormData({ ...outsideFormData, route: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select route" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="route1">Muscat - Dubai</SelectItem>
                    <SelectItem value="route2">Salalah - Muscat</SelectItem>
                    <SelectItem value="route3">Sohar - Abu Dhabi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="numberOfTrucks">Number of Trucks</Label>
                  <Input
                    id="numberOfTrucks"
                    type="number"
                    value={outsideFormData.numberOfTrucks}
                    onChange={e =>
                      setOutsideFormData({
                        ...outsideFormData,
                        numberOfTrucks: parseInt(e.target.value) || 1,
                      })
                    }
                    min="1"
                    placeholder="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="value">Value</Label>
                  <Input
                    id="value"
                    type="number"
                    value={outsideFormData.value}
                    onChange={e =>
                      setOutsideFormData({
                        ...outsideFormData,
                        value: parseFloat(e.target.value) || 0,
                      })
                    }
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={outsideFormData.amount}
                    onChange={e =>
                      setOutsideFormData({
                        ...outsideFormData,
                        amount: parseFloat(e.target.value) || 0,
                      })
                    }
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invoiceNumber">Invoice Number *</Label>
                  <Input
                    id="invoiceNumber"
                    value={outsideFormData.invoiceNumber}
                    onChange={e =>
                      setOutsideFormData({
                        ...outsideFormData,
                        invoiceNumber: e.target.value,
                      })
                    }
                    placeholder="Enter invoice number"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Recording...' : 'Record Outside Payment'}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
