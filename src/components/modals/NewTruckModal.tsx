import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface NewTruckModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function NewTruckModal({ open, onOpenChange }: NewTruckModalProps) {
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    plateNo: '',
    chassisNumber: '',
    type: '',
    ownership: 'owned',
    vendorId: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    capacityTons: 0,
    operationCardExpiry: '',
    registrationExpiry: '',
    insuranceExpiry: '',
    active: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.plateNo) {
      toast.error("Plate number is required");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('trucks')
        .insert({
          plate_no: formData.plateNo,
          make: formData.make || null,
          model: formData.model || null,
          year: formData.year || null,
          capacity_tons: formData.capacityTons || null,
          ownership: formData.ownership,
          vendor_id: formData.vendorId || null,
          active: formData.active
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating truck:', error);
        toast.error("Failed to create truck: " + error.message);
        return;
      }
      
      toast.success("Truck created successfully");
      onOpenChange(false);
      
      // Reset form
      setFormData({
        plateNo: '',
        chassisNumber: '',
        type: '',
        ownership: 'owned',
        vendorId: '',
        make: '',
        model: '',
        year: new Date().getFullYear(),
        capacityTons: 0,
        operationCardExpiry: '',
        registrationExpiry: '',
        insuranceExpiry: '',
        active: true,
      });
    } catch (error) {
      console.error('Error creating truck:', error);
      toast.error("Failed to create truck");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Truck</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="plateNo">Plate Number *</Label>
            <Input
              id="plateNo"
              value={formData.plateNo}
              onChange={(e) => setFormData({...formData, plateNo: e.target.value})}
              placeholder="12345-A"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="chassisNumber">Chassis Number</Label>
            <Input
              id="chassisNumber"
              value={formData.chassisNumber}
              onChange={(e) => setFormData({...formData, chassisNumber: e.target.value})}
              placeholder="WDB9634261L123456"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Truck Type</Label>
            <Select 
              value={formData.type} 
              onValueChange={(value) => setFormData({...formData, type: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select truck type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4wheel">4 Wheel</SelectItem>
                <SelectItem value="6wheel">6 Wheel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ownership">Ownership</Label>
            <Select 
              value={formData.ownership} 
              onValueChange={(value) => setFormData({...formData, ownership: value})}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="owned">Owned</SelectItem>
                <SelectItem value="rented">Rented</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.ownership === 'rented' && (
            <div className="space-y-2">
              <Label htmlFor="vendor">Rental Vendor</Label>
              <Select 
                value={formData.vendorId} 
                onValueChange={(value) => setFormData({...formData, vendorId: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vendor1">Al Mashreq Transport</SelectItem>
                  <SelectItem value="vendor2">Gulf Rentals LLC</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="make">Make</Label>
              <Input
                id="make"
                value={formData.make}
                onChange={(e) => setFormData({...formData, make: e.target.value})}
                placeholder="Mercedes"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => setFormData({...formData, model: e.target.value})}
                placeholder="Actros"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({...formData, year: parseInt(e.target.value) || 0})}
                min="1990"
                max={new Date().getFullYear() + 1}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity (Tons)</Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacityTons}
                onChange={(e) => setFormData({...formData, capacityTons: parseFloat(e.target.value) || 0})}
                min="0"
                step="0.1"
                placeholder="15.0"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Expiry Dates</h4>
            
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="operationCardExpiry">Operation Card Expiry</Label>
                <Input
                  id="operationCardExpiry"
                  type="date"
                  value={formData.operationCardExpiry}
                  onChange={(e) => setFormData({...formData, operationCardExpiry: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="registrationExpiry">Registration Expiry</Label>
                <Input
                  id="registrationExpiry"
                  type="date"
                  value={formData.registrationExpiry}
                  onChange={(e) => setFormData({...formData, registrationExpiry: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="insuranceExpiry">Insurance Expiry</Label>
                <Input
                  id="insuranceExpiry"
                  type="date"
                  value={formData.insuranceExpiry}
                  onChange={(e) => setFormData({...formData, insuranceExpiry: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={formData.active}
              onCheckedChange={(checked) => setFormData({...formData, active: checked})}
            />
            <Label htmlFor="active">Active</Label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Truck'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}