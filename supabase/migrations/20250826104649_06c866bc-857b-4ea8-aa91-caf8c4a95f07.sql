-- Remove job_id foreign key columns and constraints from expenses table
ALTER TABLE public.expenses DROP CONSTRAINT IF EXISTS expenses_job_id_fkey;
ALTER TABLE public.expenses DROP COLUMN IF EXISTS job_id;

-- Remove job_id foreign key columns and constraints from invoices table  
ALTER TABLE public.invoices DROP CONSTRAINT IF EXISTS invoices_job_id_fkey;
ALTER TABLE public.invoices DROP COLUMN IF EXISTS job_id;

-- Drop the jobs table completely
DROP TABLE IF EXISTS public.jobs;