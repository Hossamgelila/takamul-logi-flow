-- Admin capabilities migration
-- 1) Ensure auth triggers exist for profiles and default 'user' role

-- Create trigger to populate profiles on new auth user
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created_profile'
  ) THEN
    CREATE TRIGGER on_auth_user_created_profile
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

-- Create trigger to assign default 'user' role on new auth user
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created_default_role'
  ) THEN
    CREATE TRIGGER on_auth_user_created_default_role
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_default_role();
  END IF;
END $$;

-- 2) Policies: allow admins to manage all roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Admins can manage all user roles'
      AND schemaname = 'public' AND tablename = 'user_roles'
  ) THEN
    CREATE POLICY "Admins can manage all user roles"
    ON public.user_roles
    AS PERMISSIVE
    FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;

-- 3) Helper to grant admin by email and run it for the requested user
CREATE OR REPLACE FUNCTION public.grant_admin_by_email(p_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE lower(email) = lower(p_email) LIMIT 1;
  IF v_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'admin'::public.app_role)
    ON CONFLICT DO NOTHING;
  END IF;
END;
$$;

-- Grant admin to the specified email (idempotent)
SELECT public.grant_admin_by_email('hossamgelila@gmail.com');
