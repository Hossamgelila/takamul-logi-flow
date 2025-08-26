import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Shield, 
  ShieldCheck, 
  UserX, 
  Key,
  Ban,
  CheckCircle
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string;
  banned_until: string | null;
  username?: string;
  roles: string[];
}

export default function UserManagement() {
  const { hasRole, session } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [selectedUserForRoles, setSelectedUserForRoles] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    role: 'user'
  });
  
  const allRoles = ['user', 'moderator', 'admin'];

  // Redirect non-admins
  if (!hasRole('admin')) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You need admin privileges to access user management.</p>
          </div>
        </div>
      </Layout>
    );
  }

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('admin-manage-users', {
        body: { action: 'list_users', page: 1, perPage: 100 },
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });

      if (error) throw error;
      setUsers(data.users || []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-manage-users', {
        body: { 
          action: 'create_user',
          email: formData.email,
          password: formData.password,
          username: formData.username,
          role: formData.role
        },
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "User created successfully",
      });
      
      setShowCreateUser(false);
      setFormData({ email: '', password: '', username: '', role: 'user' });
      fetchUsers();
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase.functions.invoke('admin-manage-users', {
        body: { action: 'delete_user', userId },
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "User deleted successfully",
      });
      
      fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const handleBanUser = async (userId: string, ban: boolean) => {
    try {
      const { error } = await supabase.functions.invoke('admin-manage-users', {
        body: { 
          action: 'update_user', 
          userId, 
          ban_duration: ban ? '1 year' : 'none'
        },
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: ban ? "User banned successfully" : "User unbanned successfully",
      });
      
      fetchUsers();
    } catch (error: any) {
      console.error('Error updating user ban status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user ban status",
        variant: "destructive",
      });
    }
  };

  const handleToggleRole = async (userId: string, role: string, hasRole: boolean) => {
    try {
      const action = hasRole ? 'remove_role' : 'assign_role';
      const { error } = await supabase.functions.invoke('admin-manage-users', {
        body: { action, userId, role },
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Role ${hasRole ? 'removed' : 'assigned'} successfully`,
      });
      
      fetchUsers();
      setShowRoleDialog(false);
    } catch (error: any) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  const openRoleDialog = (user: User) => {
    setSelectedUserForRoles(user);
    setShowRoleDialog(true);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'moderator': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Users className="h-8 w-8" />
              User Management
            </h1>
            <p className="text-muted-foreground">Manage users, roles, and permissions</p>
          </div>
          <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Strong password"
                  />
                </div>
                <div>
                  <Label htmlFor="username">Username (Optional)</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="username"
                  />
                </div>
                <div>
                  <Label htmlFor="role">Initial Role</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="moderator">Moderator</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleCreateUser} className="w-full">
                  Create User
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground mt-2">Loading users...</p>
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Sign In</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.email}</div>
                          {user.username && (
                            <div className="text-sm text-muted-foreground">@{user.username}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {user.roles.map((role) => (
                            <Badge key={role} variant={getRoleBadgeVariant(role)}>
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.banned_until ? (
                          <Badge variant="destructive">
                            <Ban className="h-3 w-3 mr-1" />
                            Banned
                          </Badge>
                        ) : (
                          <Badge variant="default">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {/* Role Management */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openRoleDialog(user)}
                          >
                            <ShieldCheck className="h-4 w-4 mr-1" />
                            Roles
                          </Button>
                          
                          {/* Ban/Unban */}
                          <Button
                            variant={user.banned_until ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleBanUser(user.id, !user.banned_until)}
                          >
                            {user.banned_until ? <CheckCircle className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
                          </Button>
                          
                          {/* Delete User */}
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Role Management Dialog */}
        <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Manage Roles for {selectedUserForRoles?.email}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Select the roles you want to assign to this user:
              </p>
              <div className="space-y-3">
                {allRoles.map((role) => {
                  const hasRole = selectedUserForRoles?.roles.includes(role) || false;
                  return (
                    <div key={role} className="flex items-center space-x-3">
                      <Checkbox
                        id={`role-${role}`}
                        checked={hasRole}
                        onCheckedChange={(checked) => {
                          if (selectedUserForRoles) {
                            handleToggleRole(selectedUserForRoles.id, role, hasRole);
                          }
                        }}
                      />
                      <label 
                        htmlFor={`role-${role}`}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <Badge variant={getRoleBadgeVariant(role)}>
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {role === 'admin' && '- Full system access'}
                          {role === 'moderator' && '- Limited admin access'}
                          {role === 'user' && '- Basic user access'}
                        </span>
                      </label>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-end pt-4">
                <Button variant="outline" onClick={() => setShowRoleDialog(false)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}