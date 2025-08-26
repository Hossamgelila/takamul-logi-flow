-- Takamul Logistics Database Schema
-- Execute this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Companies table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  legal_name TEXT NOT NULL,
  trade_name TEXT,
  country TEXT NOT NULL CHECK (country IN ('OM', 'YE')),
  vat_enabled BOOLEAN DEFAULT false,
  base_currency TEXT DEFAULT 'OMR' CHECK (base_currency IN ('OMR', 'AED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT false
);

-- Currencies table
CREATE TABLE currencies (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exchange rates table
CREATE TABLE exchange_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_currency TEXT NOT NULL REFERENCES currencies(code),
  to_currency TEXT NOT NULL REFERENCES currencies(code),
  rate DECIMAL(10,6) NOT NULL,
  valid_from DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Customers table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  country TEXT NOT NULL CHECK (country IN ('OM', 'YE')),
  trn_vat_no TEXT,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT false
);

-- Vendors table
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  country TEXT NOT NULL CHECK (country IN ('OM', 'YE')),
  type TEXT NOT NULL CHECK (type IN ('Garage', 'Fuel', 'Shipping Line', 'Customs Broker', 'Other')),
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT false
);

-- Trucks table
CREATE TABLE trucks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plate_no TEXT NOT NULL UNIQUE,
  ownership TEXT NOT NULL CHECK (ownership IN ('owned', 'rented')),
  vendor_id UUID REFERENCES vendors(id),
  make TEXT,
  model TEXT,
  year INTEGER,
  capacity_tons DECIMAL(8,2),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT false
);

-- Trailers table
CREATE TABLE trailers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plate_no TEXT NOT NULL UNIQUE,
  ownership TEXT NOT NULL CHECK (ownership IN ('owned', 'rented')),
  vendor_id UUID REFERENCES vendors(id),
  type TEXT NOT NULL CHECK (type IN ('flatbed', 'reefer', 'tanker', 'container', 'other')),
  capacity_tons DECIMAL(8,2),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT false
);

-- Jobs table
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_no TEXT NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES customers(id),
  origin_country TEXT NOT NULL CHECK (origin_country IN ('OM', 'YE')),
  destination_country TEXT NOT NULL CHECK (destination_country IN ('OM', 'YE')),
  pickup_date DATE,
  delivery_date DATE,
  status TEXT NOT NULL DEFAULT 'Planned' CHECK (status IN ('Planned', 'In-Transit', 'Delivered', 'Closed')),
  truck_id UUID REFERENCES trucks(id),
  trailer_id UUID REFERENCES trailers(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT false
);

-- Invoice elements lookup table
CREATE TABLE invoice_elements_lookup (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Revenue', 'PassThrough', 'Discount')),
  default_tax_rate DECIMAL(5,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices table
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_no TEXT NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES customers(id),
  job_id UUID REFERENCES jobs(id),
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  currency TEXT NOT NULL DEFAULT 'OMR' CHECK (currency IN ('OMR', 'AED')),
  fx_rate_to_omr DECIMAL(10,6) DEFAULT 1.0,
  status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Issued', 'Partially Paid', 'Paid', 'Cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT false
);

-- Invoice items table
CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  element_id UUID NOT NULL REFERENCES invoice_elements_lookup(id),
  description TEXT NOT NULL,
  qty DECIMAL(10,2) NOT NULL DEFAULT 1,
  unit_price DECIMAL(15,2) NOT NULL,
  currency TEXT NOT NULL CHECK (currency IN ('OMR', 'AED')),
  amount_foreign DECIMAL(15,2) NOT NULL,
  amount_omr DECIMAL(15,2) NOT NULL,
  is_pass_through BOOLEAN DEFAULT false,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  truck_id UUID REFERENCES trucks(id),
  trailer_id UUID REFERENCES trailers(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer receipts table
CREATE TABLE receipts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id),
  invoice_id UUID REFERENCES invoices(id),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  currency TEXT NOT NULL CHECK (currency IN ('OMR', 'AED')),
  amount_foreign DECIMAL(15,2) NOT NULL,
  amount_omr DECIMAL(15,2) NOT NULL,
  payment_method TEXT,
  reference_no TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT false
);

-- Expenses table
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendors(id),
  job_id UUID REFERENCES jobs(id),
  truck_id UUID REFERENCES trucks(id),
  trailer_id UUID REFERENCES trailers(id),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT NOT NULL CHECK (category IN ('Fuel', 'Tires', 'Parts', 'Labor', 'Tolls', 'Fees', 'Other')),
  description TEXT NOT NULL,
  currency TEXT NOT NULL CHECK (currency IN ('OMR', 'AED')),
  amount_foreign DECIMAL(15,2) NOT NULL,
  fx_rate_to_omr DECIMAL(10,6) DEFAULT 1.0,
  amount_omr DECIMAL(15,2) NOT NULL,
  is_pass_through BOOLEAN DEFAULT false,
  linked_invoice_id UUID REFERENCES invoices(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT false
);

-- Maintenance orders table
CREATE TABLE maintenance_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mo_no TEXT NOT NULL UNIQUE,
  truck_id UUID NOT NULL REFERENCES trucks(id),
  trailer_id UUID REFERENCES trailers(id),
  vendor_id UUID NOT NULL REFERENCES vendors(id),
  type TEXT NOT NULL CHECK (type IN ('Preventive', 'Corrective')),
  opened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  closed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Closed')),
  notes TEXT,
  total_cost_omr DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT false
);

-- Attachments table
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  uploaded_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT false
);

-- Insert seed data
INSERT INTO currencies (code, name, is_active) VALUES
('OMR', 'Omani Rial', true),
('AED', 'UAE Dirham', true);

INSERT INTO exchange_rates (from_currency, to_currency, rate, valid_from) VALUES
('OMR', 'AED', 10.0, CURRENT_DATE),
('AED', 'OMR', 0.1, CURRENT_DATE);

INSERT INTO invoice_elements_lookup (code, label, category, default_tax_rate) VALUES
('FREIGHT', 'Freight Charges', 'Revenue', 0),
('FUEL_SUR', 'Fuel Surcharge', 'Revenue', 0),
('HANDLING', 'Handling Charges', 'Revenue', 0),
('CUSTOMS', 'Customs Clearance', 'PassThrough', 0),
('SHIPPING_LINE', 'Shipping Line Charges', 'PassThrough', 0),
('BORDER_FEES', 'Border Crossing Fees', 'PassThrough', 0),
('DEMURRAGE', 'Demurrage Charges', 'PassThrough', 0),
('DISCOUNT', 'Discount', 'Discount', 0);

-- Create indexes for better performance
CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_invoices_job_id ON invoices(job_id);
CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX idx_expenses_vendor_id ON expenses(vendor_id);
CREATE INDEX idx_expenses_truck_id ON expenses(truck_id);
CREATE INDEX idx_expenses_date ON expenses(date);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_trucks_active ON trucks(active);
CREATE INDEX idx_trailers_active ON trailers(active);

-- Enable Row Level Security (RLS) - can be configured later
-- ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE trucks ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE trailers ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE maintenance_orders ENABLE ROW LEVEL SECURITY;