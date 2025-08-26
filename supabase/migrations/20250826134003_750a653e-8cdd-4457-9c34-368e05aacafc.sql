-- Enable real-time for trucks table
ALTER TABLE public.trucks REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.trucks;

-- Enable real-time for trailers table  
ALTER TABLE public.trailers REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE public.trailers;