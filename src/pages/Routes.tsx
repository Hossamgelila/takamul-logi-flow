import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, MapPin, Clock, Route } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import NewRouteModal from '@/components/modals/NewRouteModal';

interface RouteData {
  id: string;
  name: string;
  from_country: string;
  from_place: string;
  to_country: string;
  to_place: string;
  distance_km: number;
  estimated_duration_hours: number | null;
  route_type: string;
  notes: string | null;
  is_active: boolean;
  created_at: string;
}

export default function Routes() {
  const { toast } = useToast();
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewRouteModal, setShowNewRouteModal] = useState(false);

  const fetchRoutes = async () => {
    try {
      const { data, error } = await supabase
        .from('routes')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRoutes(data || []);
    } catch (error) {
      console.error('Error fetching routes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch routes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const getCountryName = (code: string) => {
    const countries: Record<string, string> = {
      'OM': 'Oman',
      'AE': 'UAE',
      'SA': 'Saudi Arabia',
      'KW': 'Kuwait',
      'QA': 'Qatar',
      'BH': 'Bahrain',
    };
    return countries[code] || code;
  };

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Routes</h1>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Routes</h1>
        <Button onClick={() => setShowNewRouteModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Route
        </Button>
      </div>

      {routes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Route className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">No routes found</h3>
            <p className="text-sm text-muted-foreground mb-4">Create your first route to get started</p>
            <Button onClick={() => setShowNewRouteModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Route
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {routes.map((route) => (
            <Card key={route.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{route.name}</CardTitle>
                  <Badge variant={route.is_active ? "default" : "secondary"}>
                    {route.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{route.from_place}, {getCountryName(route.from_country)}</span>
                  <span className="text-muted-foreground">→</span>
                  <span className="font-medium">{route.to_place}, {getCountryName(route.to_country)}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Route className="w-4 h-4 text-muted-foreground" />
                    <span>{route.distance_km} km</span>
                  </div>
                  
                  {route.estimated_duration_hours && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{route.estimated_duration_hours}h</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {route.route_type}
                  </Badge>
                </div>

                {route.notes && (
                  <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
                    {route.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <NewRouteModal
        open={showNewRouteModal}
        onOpenChange={setShowNewRouteModal}
        onRouteCreated={fetchRoutes}
      />
      </div>
    </Layout>
  );
}