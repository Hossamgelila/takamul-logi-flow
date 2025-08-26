-- Create trip_mirror table to store trip records
CREATE TABLE public.trip_mirror (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reference_number text NOT NULL UNIQUE,
  truck_id uuid REFERENCES public.trucks(id),
  trailer_id uuid REFERENCES public.trailers(id),
  route_id uuid REFERENCES public.routes(id),
  customer_id uuid REFERENCES public.customers(id),
  driver_name text,
  start_date date,
  end_date date,
  cargo_type text,
  weight_tons numeric,
  container_number text,
  km_distance numeric,
  status text NOT NULL DEFAULT 'Active',
  is_invoiced boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  is_deleted boolean NOT NULL DEFAULT false
);

-- Add RLS policies for trip_mirror
ALTER TABLE public.trip_mirror ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trip mirror manageable by authenticated users" 
ON public.trip_mirror 
FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Trip mirror viewable by authenticated users" 
ON public.trip_mirror 
FOR SELECT 
TO authenticated 
USING (true);

-- Add updated_at trigger
CREATE TRIGGER set_updated_at_trip_mirror
  BEFORE UPDATE ON public.trip_mirror
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Add trip_mirror_reference_number to invoices table
ALTER TABLE public.invoices 
ADD COLUMN trip_mirror_reference_number text REFERENCES public.trip_mirror(reference_number);

-- Create index for better performance
CREATE INDEX idx_trip_mirror_truck_trailer ON public.trip_mirror(truck_id, trailer_id) WHERE NOT is_deleted;
CREATE INDEX idx_trip_mirror_reference ON public.trip_mirror(reference_number) WHERE NOT is_deleted;
CREATE INDEX idx_invoices_trip_mirror_ref ON public.invoices(trip_mirror_reference_number);

-- Insert some sample trip mirror data
INSERT INTO public.trip_mirror (reference_number, truck_id, trailer_id, driver_name, start_date, end_date, cargo_type, weight_tons, km_distance, status) 
SELECT 
  'TM-2024-' || LPAD((ROW_NUMBER() OVER())::text, 3, '0'),
  t.id,
  tr.id,
  CASE (ROW_NUMBER() OVER()) % 4
    WHEN 1 THEN 'Ahmed Al-Rashid'
    WHEN 2 THEN 'Mohammed Al-Balushi'
    WHEN 3 THEN 'Salem Al-Hinai'
    ELSE 'Khalid Al-Mahri'
  END,
  CURRENT_DATE - INTERVAL '30 days' + (ROW_NUMBER() OVER()) * INTERVAL '2 days',
  CURRENT_DATE - INTERVAL '28 days' + (ROW_NUMBER() OVER()) * INTERVAL '2 days',
  CASE (ROW_NUMBER() OVER()) % 3
    WHEN 1 THEN 'General Cargo'
    WHEN 2 THEN 'Container'
    ELSE 'Dry Goods'
  END,
  15.5 + (ROW_NUMBER() OVER()) * 2.5,
  450 + (ROW_NUMBER() OVER()) * 100,
  'Completed'
FROM (SELECT id FROM public.trucks WHERE NOT is_deleted LIMIT 3) t
CROSS JOIN (SELECT id FROM public.trailers WHERE NOT is_deleted LIMIT 2) tr;