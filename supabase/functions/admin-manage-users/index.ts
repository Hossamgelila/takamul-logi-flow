import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create Supabase client for auth check
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: authHeader } }
    });

    // Verify the user is authenticated and is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if user has admin role
    const { data: roles, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin');

    if (roleError || !roles || roles.length === 0) {
      console.error('Role check failed:', roleError);
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create service role client for admin operations
    const adminSupabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    const { action, ...params } = await req.json();
    console.log('Admin action:', action, 'by user:', user.email);

    switch (action) {
      case 'create_user': {
        const { email, password, username, role = 'user' } = params;
        
        // Create the user
        const { data: newUser, error: createError } = await adminSupabase.auth.admin.createUser({
          email,
          password,
          user_metadata: { username },
          email_confirm: true
        });

        if (createError) {
          console.error('Create user error:', createError);
          return new Response(JSON.stringify({ error: createError.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Assign role if not 'user' (default is handled by trigger)
        if (role !== 'user' && newUser.user) {
          await adminSupabase
            .from('user_roles')
            .insert({ user_id: newUser.user.id, role });
        }

        return new Response(JSON.stringify({ 
          success: true, 
          user: { id: newUser.user?.id, email: newUser.user?.email } 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'delete_user': {
        const { userId } = params;
        
        const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(userId);
        
        if (deleteError) {
          console.error('Delete user error:', deleteError);
          return new Response(JSON.stringify({ error: deleteError.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'update_user': {
        const { userId, email, password, ban_duration } = params;
        
        const updateData: any = {};
        if (email) updateData.email = email;
        if (password) updateData.password = password;
        if (ban_duration !== undefined) updateData.ban_duration = ban_duration;

        const { error: updateError } = await adminSupabase.auth.admin.updateUserById(userId, updateData);
        
        if (updateError) {
          console.error('Update user error:', updateError);
          return new Response(JSON.stringify({ error: updateError.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'change_password': {
        const { userId, password } = params;
        
        const { error: passwordError } = await adminSupabase.auth.admin.updateUserById(userId, {
          password
        });
        
        if (passwordError) {
          console.error('Change password error:', passwordError);
          return new Response(JSON.stringify({ error: passwordError.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'assign_role': {
        const { userId, role } = params;
        
        const { error: roleError } = await adminSupabase
          .from('user_roles')
          .insert({ user_id: userId, role })
          .select();
        
        if (roleError) {
          console.error('Assign role error:', roleError);
          return new Response(JSON.stringify({ error: roleError.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'remove_role': {
        const { userId, role } = params;
        
        const { error: roleError } = await adminSupabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', role);
        
        if (roleError) {
          console.error('Remove role error:', roleError);
          return new Response(JSON.stringify({ error: roleError.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'list_users': {
        // Get users from auth with pagination
        const { page = 1, perPage = 50 } = params;
        
        const { data: authUsers, error: usersError } = await adminSupabase.auth.admin.listUsers({
          page,
          perPage
        });
        
        if (usersError) {
          console.error('List users error:', usersError);
          return new Response(JSON.stringify({ error: usersError.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Get user roles and profiles
        const userIds = authUsers.users.map(u => u.id);
        
        const { data: userRoles } = await adminSupabase
          .from('user_roles')
          .select('user_id, role')
          .in('user_id', userIds);

        const { data: profiles } = await adminSupabase
          .from('profiles')
          .select('id, username')
          .in('id', userIds);

        // Combine the data
        const enrichedUsers = authUsers.users.map(user => ({
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at,
          banned_until: user.banned_until,
          username: profiles?.find(p => p.id === user.id)?.username,
          roles: userRoles?.filter(r => r.user_id === user.id).map(r => r.role) || []
        }));

        return new Response(JSON.stringify({ 
          users: enrichedUsers,
          pagination: {
            page,
            perPage,
            total: authUsers.users.length
          }
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

  } catch (error) {
    console.error('Admin function error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});