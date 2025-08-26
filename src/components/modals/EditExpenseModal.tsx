import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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

interface ExpenseItem {
  id: string;
  type: string;
  amount: string;
  currency: string;
}

interface EditExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: Expense | null;
}

export default function EditExpenseModal({ open, onOpenChange, expense }: EditExpenseModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [vendors, setVendors] = useState<Array<{ id: string; name: string }>>([]);
  const [trucks, setTrucks] = useState<Array<{ id: string; plate_no: string; make?: string; model?: string }>>([]);
  const [trailers, setTrailers] = useState<Array<{ id: string; plate_no: string; type?: string }>>([]);
  const [routes, setRoutes] = useState<Array<{ id: string; name: string; from_place: string; to_place: string }>>([]);

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
    'OIL'
  ];

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

  // Trip Mirror Form Data
  const [tripFormData, setTripFormData] = useState({
    invoiceNo: '',
    startDate: null as Date | null,
    endDate: null as Date | null,
    truckNo: '',
    trailerNo: '',
    route: '',
    km: '',
    customerName: '',
    driverName: '',
    cargoType: '',
    weightTons: '',
    containerNumber: '',
  });

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
    'OTHERS'
  ];

  // Outside Payment Form Data
  const [outsideFormData, setOutsideFormData] = useState({
    supplierName: '',
    route: '',
    numberOfTrucks: 1,
    value: 0,
    amount: 0,
    invoiceNumber: '',
  });

  // Fetch data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      const [vendorsRes, trucksRes, trailersRes, routesRes] = await Promise.all([
        supabase.from('vendors').select('id, name').eq('is_deleted', false),
        supabase.from('trucks').select('id, plate_no, make, model').eq('is_deleted', false).eq('active', true),
        supabase.from('trailers').select('id, plate_no, type').eq('is_deleted', false).eq('active', true),
        supabase.from('routes').select('id, name, from_place, to_place').eq('is_deleted', false).eq('is_active', true)
      ]);

      if (vendorsRes.data) setVendors(vendorsRes.data);
      if (trucksRes.data) setTrucks(trucksRes.data);
      if (trailersRes.data) setTrailers(trailersRes.data);
      if (routesRes.data) setRoutes(routesRes.data);
    };

    fetchData();
  }, []);

  // Populate form when expense changes and determine which tab to show
  useEffect(() => {
    if (expense && open) {
      // Determine which tab based on expense description or category
      let tabToShow = "general";
      
      // Check if it's a trip expense (description contains "Trip:" or has trip_mirror data)
      if (expense.description.includes("Trip:") || expense.tripMirrorDetails) {
        tabToShow = "trip";
      }
      // Check if it's an outside payment
      else if (expense.vendor.toLowerCase().includes("outside") || 
               expense.vendor.toLowerCase().includes("supplier") ||
               expense.description.toLowerCase().includes("outside payment")) {
        tabToShow = "outside";
      }
      
      setActiveTab(tabToShow);

      // Find vendor ID by name
      const vendor = vendors.find(v => v.name === expense.vendor);
      const truck = trucks.find(t => t.plate_no === expense.truck);
      const trailer = trailers.find(t => t.plate_no === expense.trailerDetails?.plate_no);

      if (tabToShow === "general") {
        setGeneralFormData({
          vendorId: expense.vendorDetails?.id || vendor?.id || '',
          referenceNumber: expense.referenceNumber,
          allocation: 'truck',
          truckId: expense.truckDetails?.id || truck?.id || 'none',
          trailerId: expense.trailerDetails?.id || trailer?.id || 'none',
          date: expense.date,
          category: expense.category,
          subcategory: expense.subcategory || '',
          description: expense.description,
          currency: expense.currency,
          amount: expense.amount,
          isPassThrough: expense.isPassThrough || false,
        });
      } else if (tabToShow === "trip") {
        // Parse trip data from description if available
        const tripMatch = expense.description.match(/Trip: (.+)/);
        const invoiceNo = tripMatch ? tripMatch[1] : expense.referenceNumber;
        
        // Get trip mirror details if available
        const tripDetails = expense.tripMirrorDetails;
        
        setTripFormData({
          invoiceNo: tripDetails?.reference_number || invoiceNo,
          startDate: tripDetails?.start_date ? new Date(tripDetails.start_date) : new Date(expense.date),
          endDate: tripDetails?.end_date ? new Date(tripDetails.end_date) : null,
          truckNo: expense.truckDetails?.id || truck?.id || '',
          trailerNo: expense.trailerDetails?.id || trailer?.id || 'none',
          route: tripDetails?.route_id || 'none',
          km: tripDetails?.km_distance?.toString() || '',
          customerName: tripDetails?.customer_id || 'Unknown Customer',
          driverName: tripDetails?.driver_name || '',
          cargoType: tripDetails?.cargo_type || '',
          weightTons: tripDetails?.weight_tons?.toString() || '',
          containerNumber: tripDetails?.container_number || '',
        });

        // Create expense item from the current expense
        const expenseType = expense.description.split(' - ')[0] || expense.category;
        setTripExpenseItems([{
          id: '1',
          type: expenseType,
          amount: expense.amount.toString(),
          currency: expense.currency
        }]);
      } else if (tabToShow === "outside") {
        setOutsideFormData({
          supplierName: expense.vendor,
          route: 'none',
          numberOfTrucks: 1,
          value: expense.amount,
          amount: expense.amount,
          invoiceNumber: expense.referenceNumber,
        });
      }
    }
  }, [expense, open, vendors, trucks, trailers]);

  const handleGeneralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expense) return;

    if (!generalFormData.vendorId || !generalFormData.description || generalFormData.amount <= 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Check if SERVICE & MAINTENANCE is selected but no subcategory is chosen
    if (generalFormData.category === 'SERVICE & MAINTENANCE' && !generalFormData.subcategory) {
      toast({
        title: "Error",
        description: "Please select a Service & Maintenance type",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const updateData = {
        date: generalFormData.date,
        vendor_id: generalFormData.vendorId,
        category: generalFormData.category,
        description: generalFormData.subcategory 
          ? `${generalFormData.description} - ${generalFormData.subcategory}`
          : generalFormData.description,
        amount_foreign: generalFormData.amount,
        currency: generalFormData.currency,
        truck_id: generalFormData.truckId !== 'none' ? generalFormData.truckId : null,
        trailer_id: generalFormData.trailerId !== 'none' ? generalFormData.trailerId : null,
        is_pass_through: generalFormData.isPassThrough,
      };

      const { error } = await supabase
        .from('expenses')
        .update(updateData)
        .eq('id', expense.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "General expense updated successfully",
      });

      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update expense",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTripSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expense) return;

    if (!tripFormData.truckNo || tripExpenseItems.length === 0) {
      toast({
        title: "Error",
        description: "Please select a truck and add at least one expense item",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Update trip mirror if it exists
      if (expense.tripMirrorDetails?.id) {
        const { error: tripError } = await supabase
          .from('trip_mirror')
          .update({
            reference_number: tripFormData.invoiceNo,
            start_date: tripFormData.startDate?.toISOString().split('T')[0],
            end_date: tripFormData.endDate?.toISOString().split('T')[0],
            truck_id: tripFormData.truckNo,
          trailer_id: tripFormData.trailerNo !== 'none' ? tripFormData.trailerNo : null,
            route_id: tripFormData.route !== 'none' ? tripFormData.route : null,
            km_distance: tripFormData.km ? parseFloat(tripFormData.km) : null,
            driver_name: tripFormData.driverName,
            cargo_type: tripFormData.cargoType,
            weight_tons: tripFormData.weightTons ? parseFloat(tripFormData.weightTons) : null,
            container_number: tripFormData.containerNumber,
            notes: `Customer: ${tripFormData.customerName}`
          })
          .eq('id', expense.tripMirrorDetails.id);

        if (tripError) {
          console.error('Trip mirror update error:', tripError);
        }
      }

      // Update the expense record with trip expense item data
      const firstExpenseItem = tripExpenseItems[0];
      const updateData = {
        date: tripFormData.startDate?.toISOString().split('T')[0] || expense.date,
        category: firstExpenseItem.type,
        description: `${firstExpenseItem.type} - Trip: ${tripFormData.invoiceNo}`,
        amount_foreign: parseFloat(firstExpenseItem.amount) || 0,
        currency: firstExpenseItem.currency,
        truck_id: tripFormData.truckNo,
        trailer_id: tripFormData.trailerNo || null,
        is_pass_through: false
      };

      const { error } = await supabase
        .from('expenses')
        .update(updateData)
        .eq('id', expense.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Trip expense updated successfully",
      });

      onOpenChange(false);
    } catch (error: any) {
      console.error('Trip update error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update trip expense",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOutsideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expense) return;

    if (!outsideFormData.supplierName || !outsideFormData.invoiceNumber || outsideFormData.amount <= 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields (Supplier Name, Invoice Number, Amount)",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Find or create vendor for outside payment
      let vendor_id = null;
      const existingVendor = vendors.find(v => v.name === outsideFormData.supplierName);
      
      if (existingVendor) {
        vendor_id = existingVendor.id;
      } else {
        // Create new vendor if supplier name has changed
        const { data: newVendor, error: vendorError } = await supabase
          .from('vendors')
          .insert({
            name: outsideFormData.supplierName,
            type: 'Supplier',
            country: 'OM'
          })
          .select()
          .single();

        if (vendorError) {
          console.error('Vendor creation error:', vendorError);
          throw vendorError;
        }
        vendor_id = newVendor.id;
      }

      // Update the expense record
      const updateData = {
        vendor_id: vendor_id,
        category: 'OUTSIDE PAYMENT',
        description: `Outside Payment - ${outsideFormData.supplierName} - Invoice: ${outsideFormData.invoiceNumber}`,
        amount_foreign: outsideFormData.amount,
        currency: 'OMR',
        truck_id: null, // Outside payments typically don't have truck assignment
        trailer_id: null,
        is_pass_through: true // Outside payments are usually pass-through
      };

      const { error } = await supabase
        .from('expenses')
        .update(updateData)
        .eq('id', expense.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Outside payment updated successfully",
      });

      onOpenChange(false);
    } catch (error: any) {
      console.error('Outside payment update error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update outside payment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Trip expense item handlers
  const addTripExpenseItem = () => {
    const newItem: ExpenseItem = {
      id: Date.now().toString(),
      type: '',
      amount: '',
      currency: 'OMR'
    };
    setTripExpenseItems([...tripExpenseItems, newItem]);
  };

  const removeTripExpenseItem = (id: string) => {
    setTripExpenseItems(tripExpenseItems.filter(item => item.id !== id));
  };

  const updateTripExpenseItem = (id: string, field: keyof ExpenseItem, value: string) => {
    setTripExpenseItems(tripExpenseItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="modal-responsive overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Expense</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                  onValueChange={(value) => setGeneralFormData({...generalFormData, vendorId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendors.map((vendor) => (
                      <SelectItem key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="referenceNumber">Reference Number *</Label>
                <Input
                  id="referenceNumber"
                  value={generalFormData.referenceNumber}
                  onChange={(e) => setGeneralFormData({...generalFormData, referenceNumber: e.target.value})}
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
                    onChange={(e) => setGeneralFormData({...generalFormData, date: e.target.value})}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select 
                    value={generalFormData.category} 
                    onValueChange={(value) => setGeneralFormData({...generalFormData, category: value, subcategory: ''})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VISA & IMMIGRATION EXP">VISA & IMMIGRATION EXP</SelectItem>
                      <SelectItem value="SEWAGE COUPONS">SEWAGE COUPONS</SelectItem>
                      <SelectItem value="STATIONARY & OFFICE EQUIPMENT">STATIONARY & OFFICE EQUIPMENT</SelectItem>
                      <SelectItem value="SOCIAL INSURANCE">SOCIAL INSURANCE</SelectItem>
                      <SelectItem value="PORT GATE PASS">PORT GATE PASS</SelectItem>
                      <SelectItem value="TELECOM">TELECOM</SelectItem>
                      <SelectItem value="OTHERS">OTHERS</SelectItem>
                      <SelectItem value="EQUIPMENT RENT">EQUIPMENT RENT</SelectItem>
                      <SelectItem value="FLIGHT TICKET">FLIGHT TICKET</SelectItem>
                      <SelectItem value="ASSET">ASSET</SelectItem>
                      <SelectItem value="FREE ZONE CHARGES">FREE ZONE CHARGES</SelectItem>
                      <SelectItem value="SAFETY CERTIFICATE">SAFETY CERTIFICATE</SelectItem>
                      <SelectItem value="STUFF EXP">STUFF EXP</SelectItem>
                      <SelectItem value="OUTSIDE DRIVER">OUTSIDE DRIVER</SelectItem>
                      <SelectItem value="SERVICE & MAINTENANCE">SERVICE & MAINTENANCE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Service & Maintenance Subcategory - Conditional Display */}
              {generalFormData.category === 'SERVICE & MAINTENANCE' && (
                <div className="space-y-2">
                  <Label htmlFor="subcategory">Service & Maintenance Type *</Label>
                  <Select 
                    value={generalFormData.subcategory} 
                    onValueChange={(value) => setGeneralFormData({...generalFormData, subcategory: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select maintenance type" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border shadow-md z-50 max-h-60 overflow-y-auto">
                      {maintenanceSubcategories.map((subcategory) => (
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
                  onChange={(e) => setGeneralFormData({...generalFormData, description: e.target.value})}
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
                    onValueChange={(value) => setGeneralFormData({...generalFormData, currency: value})}
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
                    onChange={(e) => setGeneralFormData({...generalFormData, amount: parseFloat(e.target.value) || 0})}
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
                    onValueChange={(value) => setGeneralFormData({...generalFormData, truckId: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select truck" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {trucks.map((truck) => (
                        <SelectItem key={truck.id} value={truck.id}>
                          {truck.plate_no} {truck.make && truck.model ? `(${truck.make} ${truck.model})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="trailer">Trailer Number</Label>
                  <Select 
                    value={generalFormData.trailerId} 
                    onValueChange={(value) => setGeneralFormData({...generalFormData, trailerId: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select trailer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {trailers.map((trailer) => (
                        <SelectItem key={trailer.id} value={trailer.id}>
                          {trailer.plate_no} {trailer.type ? `(${trailer.type})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Additional details section */}
              <div className="form-grid-responsive">
                <div className="space-y-2">
                  <Label htmlFor="fxRate">FX Rate to OMR</Label>
                  <Input
                    id="fxRate"
                    type="number"
                    step="0.0001"
                    value={expense?.fxRateToOmr || 1}
                    placeholder="Exchange rate"
                    disabled
                    className="bg-muted"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="amountOmr">Amount in OMR</Label>
                  <Input
                    id="amountOmr"
                    type="number"
                    step="0.01"
                    value={expense?.amountOmr || (generalFormData.amount * (expense?.fxRateToOmr || 1)).toFixed(2)}
                    placeholder="Amount in OMR"
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="passThrough"
                  checked={generalFormData.isPassThrough}
                  onCheckedChange={(checked) => setGeneralFormData({...generalFormData, isPassThrough: checked})}
                />
                <Label htmlFor="passThrough">Pass-Through Expense (paid on behalf of customer)</Label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Expense'}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="trip" className="mt-4">
            <form onSubmit={handleTripSubmit} className="space-y-6">
              {/* Basic Trip Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Trip Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="invoiceNo">Invoice No</Label>
                    <Input
                      id="invoiceNo"
                      value={tripFormData.invoiceNo}
                      onChange={(e) => setTripFormData({...tripFormData, invoiceNo: e.target.value})}
                      placeholder="Enter invoice number"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="route">Route</Label>
                    <Select 
                      value={tripFormData.route} 
                      onValueChange={(value) => setTripFormData({...tripFormData, route: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select route" />
                      </SelectTrigger>
                      <SelectContent>
                        {routes.map((route) => (
                          <SelectItem key={route.id} value={route.id}>
                            {route.name} - {route.from_place} to {route.to_place}
                          </SelectItem>
                        ))}
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
                            "w-full justify-start text-left font-normal",
                            !tripFormData.startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {tripFormData.startDate ? format(tripFormData.startDate, "PPP") : "Pick start date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={tripFormData.startDate || undefined}
                          onSelect={(date) => setTripFormData({...tripFormData, startDate: date || null})}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="truckNo">Truck No</Label>
                    <Select 
                      value={tripFormData.truckNo} 
                      onValueChange={(value) => setTripFormData({...tripFormData, truckNo: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select truck" />
                      </SelectTrigger>
                      <SelectContent>
                        {trucks.map((truck) => (
                          <SelectItem key={truck.id} value={truck.id}>
                            {truck.plate_no} {truck.make && truck.model ? `(${truck.make} ${truck.model})` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Additional Trip Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="trailerNo">Trailer No</Label>
                    <Select 
                      value={tripFormData.trailerNo} 
                      onValueChange={(value) => setTripFormData({...tripFormData, trailerNo: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select trailer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {trailers.map((trailer) => (
                          <SelectItem key={trailer.id} value={trailer.id}>
                            {trailer.plate_no} {trailer.type ? `(${trailer.type})` : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="driverName">Driver Name</Label>
                    <Input
                      id="driverName"
                      value={tripFormData.driverName}
                      onChange={(e) => setTripFormData({...tripFormData, driverName: e.target.value})}
                      placeholder="Enter driver name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="km">Distance (KM)</Label>
                    <Input
                      id="km"
                      type="number"
                      value={tripFormData.km}
                      onChange={(e) => setTripFormData({...tripFormData, km: e.target.value})}
                      placeholder="Distance in KM"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Customer Name</Label>
                    <Input
                      id="customerName"
                      value={tripFormData.customerName}
                      onChange={(e) => setTripFormData({...tripFormData, customerName: e.target.value})}
                      placeholder="Customer name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cargoType">Cargo Type</Label>
                    <Input
                      id="cargoType"
                      value={tripFormData.cargoType}
                      onChange={(e) => setTripFormData({...tripFormData, cargoType: e.target.value})}
                      placeholder="Type of cargo"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="weightTons">Weight (Tons)</Label>
                    <Input
                      id="weightTons"
                      type="number"
                      step="0.1"
                      value={tripFormData.weightTons}
                      onChange={(e) => setTripFormData({...tripFormData, weightTons: e.target.value})}
                      placeholder="Weight in tons"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="containerNumber">Container Number</Label>
                  <Input
                    id="containerNumber"
                    value={tripFormData.containerNumber}
                    onChange={(e) => setTripFormData({...tripFormData, containerNumber: e.target.value})}
                    placeholder="Container number"
                  />
                </div>
              </div>

              {/* Expense Items */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Expense Items</h3>
                  <Button type="button" onClick={addTripExpenseItem} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
                
                {tripExpenseItems.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-4 gap-4 p-4 border rounded-md">
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select 
                        value={item.type} 
                        onValueChange={(value) => updateTripExpenseItem(item.id, 'type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {expenseTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Amount</Label>
                      <Input
                        type="number"
                        value={item.amount}
                        onChange={(e) => updateTripExpenseItem(item.id, 'amount', e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Currency</Label>
                      <Select 
                        value={item.currency} 
                        onValueChange={(value) => updateTripExpenseItem(item.id, 'currency', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="OMR">OMR</SelectItem>
                          <SelectItem value="Saudi Rial">Saudi Rial</SelectItem>
                          <SelectItem value="AED">AED</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-end">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => removeTripExpenseItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Trip Expense'}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="outside" className="mt-4">
            <form onSubmit={handleOutsideSubmit} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Outside Payment Details</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="supplierName">Supplier Name *</Label>
                    <Input
                      id="supplierName"
                      value={outsideFormData.supplierName}
                      onChange={(e) => setOutsideFormData({...outsideFormData, supplierName: e.target.value})}
                      placeholder="Enter supplier name"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="route">Route</Label>
                    <Select 
                      value={outsideFormData.route} 
                      onValueChange={(value) => setOutsideFormData({...outsideFormData, route: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select route" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Route</SelectItem>
                        {routes.map((route) => (
                          <SelectItem key={route.id} value={route.id}>
                            {route.name} - {route.from_place} to {route.to_place}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="invoiceNumber">Invoice Number *</Label>
                    <Input
                      id="invoiceNumber"
                      value={outsideFormData.invoiceNumber}
                      onChange={(e) => setOutsideFormData({...outsideFormData, invoiceNumber: e.target.value})}
                      placeholder="Enter invoice number"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="numberOfTrucks">Number of Trucks</Label>
                    <Input
                      id="numberOfTrucks"
                      type="number"
                      min="1"
                      value={outsideFormData.numberOfTrucks}
                      onChange={(e) => setOutsideFormData({...outsideFormData, numberOfTrucks: parseInt(e.target.value) || 1})}
                      placeholder="Number of trucks"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (OMR) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={outsideFormData.amount}
                      onChange={(e) => setOutsideFormData({...outsideFormData, amount: parseFloat(e.target.value) || 0})}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="value">Service Value</Label>
                  <Input
                    id="value"
                    type="number"
                    value={outsideFormData.value}
                    onChange={(e) => setOutsideFormData({...outsideFormData, value: parseFloat(e.target.value) || 0})}
                    min="0"
                    step="0.01"
                    placeholder="Service value"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Outside Payment'}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}