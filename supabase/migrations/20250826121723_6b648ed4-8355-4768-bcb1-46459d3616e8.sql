-- Grant admin role to the specified email so they have full access via RLS-admin allowances
-- This is idempotent due to ON CONFLICT in the function
select public.grant_admin_by_email('Hossamgelila@gmail.com');