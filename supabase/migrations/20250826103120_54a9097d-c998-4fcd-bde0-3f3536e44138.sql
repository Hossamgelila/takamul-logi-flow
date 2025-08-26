-- Create routes table for managing transportation routes
CREATE TABLE public.routes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  from_country CHAR(2) NOT NULL DEFAULT 'OM',
  from_place TEXT NOT NULL,
  to_country CHAR(2) NOT NULL DEFAULT 'OM', 
  to_place TEXT NOT NULL,
  distance_km NUMERIC NOT NULL DEFAULT 0,
  estimated_duration_hours NUMERIC,
  route_type TEXT DEFAULT 'road',
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_deleted BOOLEAN NOT NULL DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;

-- Create policies for routes access
CREATE POLICY "Routes are viewable by everyone" 
ON public.routes 
FOR SELECT 
USING (NOT is_deleted);

CREATE POLICY "Routes can be created by anyone" 
ON public.routes 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Routes can be updated by anyone" 
ON public.routes 
FOR UPDATE 
USING (true);

CREATE POLICY "Routes can be deleted by anyone" 
ON public.routes 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_routes_updated_at
BEFORE UPDATE ON public.routes
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Create index for better performance
CREATE INDEX idx_routes_active ON public.routes(is_active) WHERE NOT is_deleted;
CREATE INDEX idx_routes_countries ON public.routes(from_country, to_country) WHERE NOT is_deleted;