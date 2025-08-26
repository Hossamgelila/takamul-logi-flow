-- Enable RLS on all tables that don't have it enabled
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_elements_lookup ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trailers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trucks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies for all tables (authenticated users can access all data for now)
-- Companies
CREATE POLICY "Companies viewable by authenticated users" ON public.companies
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Companies manageable by authenticated users" ON public.companies
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Currencies
CREATE POLICY "Currencies viewable by authenticated users" ON public.currencies
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Currencies manageable by authenticated users" ON public.currencies
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Customers
CREATE POLICY "Customers viewable by authenticated users" ON public.customers
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Customers manageable by authenticated users" ON public.customers
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Exchange rates
CREATE POLICY "Exchange rates viewable by authenticated users" ON public.exchange_rates
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Exchange rates manageable by authenticated users" ON public.exchange_rates
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Expenses
CREATE POLICY "Expenses viewable by authenticated users" ON public.expenses
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Expenses manageable by authenticated users" ON public.expenses
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Invoice elements lookup
CREATE POLICY "Invoice elements viewable by authenticated users" ON public.invoice_elements_lookup
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Invoice elements manageable by authenticated users" ON public.invoice_elements_lookup
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Invoice items
CREATE POLICY "Invoice items viewable by authenticated users" ON public.invoice_items
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Invoice items manageable by authenticated users" ON public.invoice_items
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Invoices
CREATE POLICY "Invoices viewable by authenticated users" ON public.invoices
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Invoices manageable by authenticated users" ON public.invoices
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Maintenance orders
CREATE POLICY "Maintenance orders viewable by authenticated users" ON public.maintenance_orders
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Maintenance orders manageable by authenticated users" ON public.maintenance_orders
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Receipts
CREATE POLICY "Receipts viewable by authenticated users" ON public.receipts
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Receipts manageable by authenticated users" ON public.receipts
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Trailers
CREATE POLICY "Trailers viewable by authenticated users" ON public.trailers
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Trailers manageable by authenticated users" ON public.trailers
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Trucks
CREATE POLICY "Trucks viewable by authenticated users" ON public.trucks
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Trucks manageable by authenticated users" ON public.trucks
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Vendors
CREATE POLICY "Vendors viewable by authenticated users" ON public.vendors
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Vendors manageable by authenticated users" ON public.vendors
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Attachments
CREATE POLICY "Attachments viewable by authenticated users" ON public.attachments
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Attachments manageable by authenticated users" ON public.attachments
FOR ALL TO authenticated USING (true) WITH CHECK (true);