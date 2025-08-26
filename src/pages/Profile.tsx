import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Calendar, Shield } from 'lucide-react';

export default function Profile() {
  const { user, profile, roles } = useAuth();

  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Not Logged In</h2>
            <p className="text-muted-foreground">Please log in to view your profile.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Profile</h1>
          <p className="text-muted-foreground">Manage your account information</p>
        </div>

        {/* Profile Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={profile?.avatar_url || ''} alt={profile?.username || user.email || ''} />
                  <AvatarFallback className="text-lg">
                    {profile?.username ? profile.username.charAt(0).toUpperCase() : 
                     user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">
                    {profile?.username || 'No username set'}
                  </h3>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Email: {user.email}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Member since: {new Date(user.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Last sign in: {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Never'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Roles & Permissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Your current roles and access levels:
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {roles.length > 0 ? (
                    roles.map((userRole) => (
                      <Badge 
                        key={userRole.id} 
                        variant={
                          userRole.role === 'admin' ? 'destructive' : 
                          userRole.role === 'moderator' ? 'secondary' : 
                          'outline'
                        }
                      >
                        {userRole.role.charAt(0).toUpperCase() + userRole.role.slice(1)}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="outline">User</Badge>
                  )}
                </div>
                
                <div className="text-xs text-muted-foreground space-y-1">
                  {roles.some(r => r.role === 'admin') && (
                    <p>✓ Full system administration access</p>
                  )}
                  {roles.some(r => r.role === 'moderator') && (
                    <p>✓ Limited administrative privileges</p>
                  )}
                  <p>✓ Basic user access to the application</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}