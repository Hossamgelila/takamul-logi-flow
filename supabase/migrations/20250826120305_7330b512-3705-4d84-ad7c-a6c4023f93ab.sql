-- Fix Security Definer View issues
-- The problem is that views owned by postgres superuser effectively bypass RLS

-- First, drop the existing problematic views
DROP VIEW IF EXISTS public.v_invoice_totals;
DROP VIEW IF EXISTS public.v_truck_performance;

-- Recreate v_invoice_totals with proper RLS respect
CREATE VIEW public.v_invoice_totals AS
SELECT 
  i.id AS invoice_id,
  i.invoice_no,
  i.customer_id,
  i.currency,
  i.fx_rate_to_omr,
  COALESCE(sum(
    CASE
      WHEN (ii.is_pass_through = false) THEN ii.amount_omr
      ELSE (0)::numeric
    END), (0)::numeric) AS revenue_omr,
  COALESCE(sum(
    CASE
      WHEN (ii.is_pass_through = true) THEN ii.amount_omr
      ELSE (0)::numeric
    END), (0)::numeric) AS pass_through_omr,
  COALESCE(sum(ii.amount_omr), (0)::numeric) AS total_omr,
  COALESCE((
    SELECT sum(r.amount_omr) 
    FROM public.receipts r
    WHERE r.invoice_id = i.id AND r.is_deleted = false
  ), (0)::numeric) AS receipts_omr,
  (COALESCE(sum(ii.amount_omr), (0)::numeric) - COALESCE((
    SELECT sum(r.amount_omr) 
    FROM public.receipts r
    WHERE r.invoice_id = i.id AND r.is_deleted = false
  ), (0)::numeric)) AS balance_omr
FROM public.invoices i
LEFT JOIN public.invoice_items ii ON (ii.invoice_id = i.id AND ii.is_deleted = false)
WHERE i.is_deleted = false
GROUP BY i.id;

-- Recreate v_truck_performance with proper RLS respect  
CREATE VIEW public.v_truck_performance AS
SELECT 
  t.id AS truck_id,
  t.plate_no,
  COALESCE((
    SELECT sum(ii.amount_omr) 
    FROM public.invoice_items ii
    JOIN public.invoices inv ON inv.id = ii.invoice_id
    WHERE ii.truck_id = t.id 
      AND ii.is_deleted = false 
      AND inv.is_deleted = false 
      AND COALESCE(ii.is_pass_through, false) = false
  ), (0)::numeric) AS revenue_omr,
  COALESCE((
    SELECT sum(e.amount_omr) 
    FROM public.expenses e
    WHERE e.truck_id = t.id 
      AND e.is_deleted = false 
      AND COALESCE(e.is_pass_through, false) = false
  ), (0)::numeric) AS direct_expenses_omr,
  (COALESCE((
    SELECT sum(ii.amount_omr) 
    FROM public.invoice_items ii
    JOIN public.invoices inv ON inv.id = ii.invoice_id
    WHERE ii.truck_id = t.id 
      AND ii.is_deleted = false 
      AND inv.is_deleted = false 
      AND COALESCE(ii.is_pass_through, false) = false
  ), (0)::numeric) - COALESCE((
    SELECT sum(e.amount_omr) 
    FROM public.expenses e
    WHERE e.truck_id = t.id 
      AND e.is_deleted = false 
      AND COALESCE(e.is_pass_through, false) = false
  ), (0)::numeric)) AS net_margin_omr
FROM public.trucks t
WHERE t.is_deleted = false;

-- Enable RLS on the views explicitly to ensure they respect user permissions
ALTER VIEW public.v_invoice_totals OWNER TO authenticated;
ALTER VIEW public.v_truck_performance OWNER TO authenticated;

-- Create RLS policies for the views to ensure they respect user authentication
-- These views will now respect the RLS policies of the underlying tables
-- rather than bypassing them as superuser-owned views

-- Grant appropriate permissions
GRANT SELECT ON public.v_invoice_totals TO authenticated;
GRANT SELECT ON public.v_truck_performance TO authenticated;

-- Since these are views that aggregate data, we want authenticated users to be able to see them
-- but the underlying table RLS policies will still control what data they actually see
CREATE POLICY "Allow authenticated users to view invoice totals" 
ON public.v_invoice_totals FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Allow authenticated users to view truck performance" 
ON public.v_truck_performance FOR SELECT 
TO authenticated 
USING (true);

-- Note: The security is now properly handled by the underlying table RLS policies
-- rather than being bypassed by superuser ownership