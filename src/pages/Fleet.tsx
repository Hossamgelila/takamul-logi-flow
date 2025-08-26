import { useState, useEffect } from "react";
import Layout from '@/components/Layout';
import { Plus, Search, Filter, Truck, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import NewTruckModal from "@/components/modals/NewTruckModal";
import NewTrailerModal from "@/components/modals/NewTrailerModal";
import { Skeleton } from "@/components/ui/skeleton";

interface Truck {
  id: string;
  plate_no: string;
  make?: string;
  model?: string;
  year?: number;
  capacity_tons?: number;
  ownership: string;
  active: boolean;
  vendor_id?: string;
}

interface Trailer {
  id: string;
  plate_no: string;
  type?: string;
  capacity_tons?: number;
  ownership: string;
  active: boolean;
  vendor_id?: string;
}

export default function Fleet() {
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [newTruckModalOpen, setNewTruckModalOpen] = useState(false);
  const [newTrailerModalOpen, setNewTrailerModalOpen] = useState(false);

  useEffect(() => {
    fetchFleetData();
    
    // Set up real-time subscriptions
    const trucksChannel = supabase
      .channel('trucks-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trucks'
        },
        (payload) => {
          console.log('🚛 Trucks real-time update received:', payload);
          if (payload.eventType === 'INSERT') {
            const newTruck = payload.new as Truck;
            setTrucks(prev => {
              // Check if truck already exists to prevent duplicates
              if (prev.find(truck => truck.id === newTruck.id)) {
                return prev;
              }
              console.log('Adding new truck:', newTruck);
              return [...prev, newTruck];
            });
          } else if (payload.eventType === 'UPDATE') {
            setTrucks(prev => prev.map(truck => 
              truck.id === payload.new.id ? payload.new as Truck : truck
            ));
          } else if (payload.eventType === 'DELETE') {
            setTrucks(prev => prev.filter(truck => truck.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    const trailersChannel = supabase
      .channel('trailers-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trailers'
        },
        (payload) => {
          console.log('🚚 Trailers real-time update received:', payload);
          if (payload.eventType === 'INSERT') {
            const newTrailer = payload.new as Trailer;
            setTrailers(prev => {
              // Check if trailer already exists to prevent duplicates
              if (prev.find(trailer => trailer.id === newTrailer.id)) {
                return prev;
              }
              console.log('Adding new trailer:', newTrailer);
              return [...prev, newTrailer];
            });
          } else if (payload.eventType === 'UPDATE') {
            setTrailers(prev => prev.map(trailer => 
              trailer.id === payload.new.id ? payload.new as Trailer : trailer
            ));
          } else if (payload.eventType === 'DELETE') {
            setTrailers(prev => prev.filter(trailer => trailer.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    console.log('📡 Real-time subscriptions established for trucks and trailers');

    return () => {
      console.log('🔌 Cleaning up real-time subscriptions');
      supabase.removeChannel(trucksChannel);
      supabase.removeChannel(trailersChannel);
    };
  }, []);

  const fetchFleetData = async () => {
    try {
      setLoading(true);
      
      const [trucksResponse, trailersResponse] = await Promise.all([
        supabase
          .from("trucks")
          .select("*")
          .eq("is_deleted", false)
          .order("plate_no", { ascending: true }),
        supabase
          .from("trailers")
          .select("*")
          .eq("is_deleted", false)
          .order("plate_no", { ascending: true })
      ]);

      if (trucksResponse.error) throw trucksResponse.error;
      if (trailersResponse.error) throw trailersResponse.error;

      setTrucks(trucksResponse.data || []);
      setTrailers(trailersResponse.data || []);
    } catch (error) {
      console.error("Error fetching fleet data:", error);
      toast.error("Failed to load fleet data");
    } finally {
      setLoading(false);
    }
  };

  const filteredTrucks = trucks.filter((truck) =>
    truck.plate_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
    truck.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    truck.model?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTrailers = trailers.filter((trailer) =>
    trailer.plate_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trailer.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTruckModalClose = (success?: boolean) => {
    setNewTruckModalOpen(false);
    if (success) {
      // Real-time will handle the update, but we can show a success message
      toast.success("Truck created successfully!");
    }
  };

  const handleTrailerModalClose = (success?: boolean) => {
    setNewTrailerModalOpen(false);
    if (success) {
      // Real-time will handle the update, but we can show a success message
      toast.success("Trailer created successfully!");
    }
  };

  const activeTrucks = trucks.filter(truck => truck.active).length;
  const activeTrailers = trailers.filter(trailer => trailer.active).length;
  const totalCapacityTrucks = trucks.reduce((sum, truck) => sum + (truck.capacity_tons || 0), 0);
  const totalCapacityTrailers = trailers.reduce((sum, trailer) => sum + (trailer.capacity_tons || 0), 0);

  if (loading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Fleet Management</h1>
        <div className="flex gap-2">
          <Button onClick={() => setNewTruckModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Truck
          </Button>
          <Button onClick={() => setNewTrailerModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Trailer
          </Button>
        </div>
      </div>

      {/* Fleet Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Trucks
            </CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{activeTrucks}</div>
            <p className="text-xs text-muted-foreground">
              {trucks.length} total trucks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Trailers
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{activeTrailers}</div>
            <p className="text-xs text-muted-foreground">
              {trailers.length} total trailers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Truck Capacity
            </CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalCapacityTrucks}</div>
            <p className="text-xs text-muted-foreground">tons total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Trailer Capacity
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalCapacityTrailers}</div>
            <p className="text-xs text-muted-foreground">tons total</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by plate number, make, model, or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Fleet Tables */}
      <Tabs defaultValue="trucks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trucks">Trucks ({trucks.length})</TabsTrigger>
          <TabsTrigger value="trailers">Trailers ({trailers.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="trucks">
          <Card>
            <CardHeader>
              <CardTitle>Trucks</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plate No</TableHead>
                    <TableHead>Make & Model</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Ownership</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTrucks.map((truck) => (
                    <TableRow key={truck.id}>
                      <TableCell className="font-medium">{truck.plate_no}</TableCell>
                      <TableCell>
                        {truck.make && truck.model ? `${truck.make} ${truck.model}` : '-'}
                      </TableCell>
                      <TableCell>{truck.year || '-'}</TableCell>
                      <TableCell>
                        {truck.capacity_tons ? `${truck.capacity_tons} tons` : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={truck.ownership === 'Owned' ? 'default' : 'secondary'}>
                          {truck.ownership}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={truck.active ? 'default' : 'destructive'}>
                          {truck.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredTrucks.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No trucks found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trailers">
          <Card>
            <CardHeader>
              <CardTitle>Trailers</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plate No</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Ownership</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTrailers.map((trailer) => (
                    <TableRow key={trailer.id}>
                      <TableCell className="font-medium">{trailer.plate_no}</TableCell>
                      <TableCell>{trailer.type || '-'}</TableCell>
                      <TableCell>
                        {trailer.capacity_tons ? `${trailer.capacity_tons} tons` : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={trailer.ownership === 'Owned' ? 'default' : 'secondary'}>
                          {trailer.ownership}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={trailer.active ? 'default' : 'destructive'}>
                          {trailer.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredTrailers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No trailers found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <NewTruckModal
        open={newTruckModalOpen}
        onOpenChange={handleTruckModalClose}
      />
      <NewTrailerModal
        open={newTrailerModalOpen}
        onOpenChange={handleTrailerModalClose}
      />
      </div>
    </Layout>
  );
}