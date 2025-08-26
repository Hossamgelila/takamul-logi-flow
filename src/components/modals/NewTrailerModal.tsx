import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface NewTrailerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function NewTrailerModal({ open, onOpenChange }: NewTrailerModalProps) {
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    plateNo: '',
    chasisNo: '',
    ownership: 'owned',
    vendorId: '',
    type: 'flatbed',
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
        .from('trailers')
        .insert({
          plate_no: formData.plateNo,
          type: formData.type || null,
          capacity_tons: formData.capacityTons || null,
          ownership: formData.ownership,
          vendor_id: formData.vendorId || null,
          active: formData.active
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating trailer:', error);
        toast.error("Failed to create trailer: " + error.message);
        return;
      }
      
      toast.success("Trailer created successfully");
      onOpenChange(false);
      
      // Reset form
      setFormData({
        plateNo: '',
        chasisNo: '',
        ownership: 'owned',
        vendorId: '',
        type: 'flatbed',
        capacityTons: 0,
        operationCardExpiry: '',
        registrationExpiry: '',
        insuranceExpiry: '',
        active: true,
      });
    } catch (error) {
      console.error('Error creating trailer:', error);
      toast.error("Failed to create trailer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Trailer</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="plateNo">Plate Number *</Label>
            <Input
              id="plateNo"
              value={formData.plateNo}
              onChange={(e) => setFormData({...formData, plateNo: e.target.value})}
              placeholder="TR-12345"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="chasisNo">Chassis Number</Label>
            <Input
              id="chasisNo"
              value={formData.chasisNo}
              onChange={(e) => setFormData({...formData, chasisNo: e.target.value})}
              placeholder="CH-ABC123"
            />
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
              <Label htmlFor="type">Type</Label>
              <Select 
                value={formData.type} 
                onValueChange={(value) => setFormData({...formData, type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flatbed">Flatbed</SelectItem>
                  <SelectItem value="reefer">Reefer</SelectItem>
                  <SelectItem value="tanker">Tanker</SelectItem>
                  <SelectItem value="container">Container</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
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
                placeholder="25.0"
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
              {loading ? 'Creating...' : 'Create Trailer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}