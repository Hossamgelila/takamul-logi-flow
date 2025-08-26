-- Fix Security Definer View issues
-- Drop the existing problematic views
DROP VIEW IF EXISTS public.v_invoice_totals CASCADE;
DROP VIEW IF EXISTS public.v_truck_performance CASCADE;

-- Recreate v_invoice_totals without SECURITY DEFINER
CREATE VIEW public.v_invoice_totals
WITH (security_invoker=true) AS
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
    FROM receipts r
    WHERE r.invoice_id = i.id AND r.is_deleted = false
  ), (0)::numeric) AS receipts_omr,
  (COALESCE(sum(ii.amount_omr), (0)::numeric) - COALESCE((
    SELECT sum(r.amount_omr) 
    FROM receipts r
    WHERE r.invoice_id = i.id AND r.is_deleted = false
  ), (0)::numeric)) AS balance_omr
FROM invoices i
LEFT JOIN invoice_items ii ON (ii.invoice_id = i.id AND ii.is_deleted = false)
WHERE i.is_deleted = false
GROUP BY i.id;

-- Recreate v_truck_performance without SECURITY DEFINER
CREATE VIEW public.v_truck_performance
WITH (security_invoker=true) AS
SELECT 
  t.id AS truck_id,
  t.plate_no,
  COALESCE((
    SELECT sum(ii.amount_omr) 
    FROM invoice_items ii
    JOIN invoices inv ON inv.id = ii.invoice_id
    WHERE ii.truck_id = t.id 
      AND ii.is_deleted = false 
      AND inv.is_deleted = false 
      AND COALESCE(ii.is_pass_through, false) = false
  ), (0)::numeric) AS revenue_omr,
  COALESCE((
    SELECT sum(e.amount_omr) 
    FROM expenses e
    WHERE e.truck_id = t.id 
      AND e.is_deleted = false 
      AND COALESCE(e.is_pass_through, false) = false
  ), (0)::numeric) AS direct_expenses_omr,
  (COALESCE((
    SELECT sum(ii.amount_omr) 
    FROM invoice_items ii
    JOIN invoices inv ON inv.id = ii.invoice_id
    WHERE ii.truck_id = t.id 
      AND ii.is_deleted = false 
      AND inv.is_deleted = false 
      AND COALESCE(ii.is_pass_through, false) = false
  ), (0)::numeric) - COALESCE((
    SELECT sum(e.amount_omr) 
    FROM expenses e
    WHERE e.truck_id = t.id 
      AND e.is_deleted = false 
      AND COALESCE(e.is_pass_through, false) = false
  ), (0)::numeric)) AS net_margin_omr
FROM trucks t
WHERE t.is_deleted = false;