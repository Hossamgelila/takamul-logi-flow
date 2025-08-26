import { useState } from 'react';
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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface NewRouteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRouteCreated?: () => void;
}

const countries = [
  { code: 'OM', name: 'Oman' },
  { code: 'AE', name: 'UAE' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'KW', name: 'Kuwait' },
  { code: 'QA', name: 'Qatar' },
  { code: 'BH', name: 'Bahrain' },
];

export default function NewRouteModal({
  open,
  onOpenChange,
  onRouteCreated,
}: NewRouteModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    fromCountry: 'OM',
    fromPlace: '',
    toCountry: 'OM',
    toPlace: '',
    distanceKm: 0,
    estimatedDurationHours: 0,
    routeType: 'road',
    notes: '',
    isActive: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.fromPlace || !formData.toPlace) {
      toast({
        title: 'Error',
        description: 'Route name, from place, and to place are required',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('routes').insert({
        name: formData.name,
        from_country: formData.fromCountry,
        from_place: formData.fromPlace,
        to_country: formData.toCountry,
        to_place: formData.toPlace,
        distance_km: formData.distanceKm,
        estimated_duration_hours: formData.estimatedDurationHours || null,
        route_type: formData.routeType,
        notes: formData.notes || null,
        is_active: formData.isActive,
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Route created successfully',
      });

      onOpenChange(false);
      onRouteCreated?.();
      setFormData({
        name: '',
        fromCountry: 'OM',
        fromPlace: '',
        toCountry: 'OM',
        toPlace: '',
        distanceKm: 0,
        estimatedDurationHours: 0,
        routeType: 'road',
        notes: '',
        isActive: true,
      });
    } catch (error) {
      console.error('Error creating route:', error);
      toast({
        title: 'Error',
        description: 'Failed to create route',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Route</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Route Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="Muscat to Dubai"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fromCountry">From Country</Label>
              <Select
                value={formData.fromCountry}
                onValueChange={value =>
                  setFormData({ ...formData, fromCountry: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {countries.map(country => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fromPlace">From Place *</Label>
              <Input
                id="fromPlace"
                value={formData.fromPlace}
                onChange={e =>
                  setFormData({ ...formData, fromPlace: e.target.value })
                }
                placeholder="Muscat"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="toCountry">To Country</Label>
              <Select
                value={formData.toCountry}
                onValueChange={value =>
                  setFormData({ ...formData, toCountry: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {countries.map(country => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="toPlace">To Place *</Label>
              <Input
                id="toPlace"
                value={formData.toPlace}
                onChange={e =>
                  setFormData({ ...formData, toPlace: e.target.value })
                }
                placeholder="Dubai"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="distance">Distance (KM)</Label>
              <Input
                id="distance"
                type="number"
                value={formData.distanceKm}
                onChange={e =>
                  setFormData({
                    ...formData,
                    distanceKm: parseFloat(e.target.value) || 0,
                  })
                }
                min="0"
                step="0.1"
                placeholder="450"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (Hours)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.estimatedDurationHours}
                onChange={e =>
                  setFormData({
                    ...formData,
                    estimatedDurationHours: parseFloat(e.target.value) || 0,
                  })
                }
                min="0"
                step="0.5"
                placeholder="6"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="routeType">Route Type</Label>
            <Select
              value={formData.routeType}
              onValueChange={value =>
                setFormData({ ...formData, routeType: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="road">Road</SelectItem>
                <SelectItem value="highway">Highway</SelectItem>
                <SelectItem value="border">Border Crossing</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={e =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Additional route information..."
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={formData.isActive}
              onCheckedChange={checked =>
                setFormData({ ...formData, isActive: checked })
              }
            />
            <Label htmlFor="active">Active</Label>
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
              {loading ? 'Creating...' : 'Create Route'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
