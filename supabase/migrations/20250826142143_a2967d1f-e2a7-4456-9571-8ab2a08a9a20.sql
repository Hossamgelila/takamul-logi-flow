-- Grant admin role to hossamgelila@gmail.com
INSERT INTO public.user_roles (user_id, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'hossamgelila@gmail.com'),
  'admin'::public.app_role
)
ON CONFLICT (user_id, role) DO NOTHING;