import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  hasPermission,
  canAccessModule,
  canPerformAction,
  ROLES,
  type UserRole,
} from '@/lib/roles';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  Settings,
  Users,
  BarChart3,
  FileText,
  Truck,
  Wrench,
} from 'lucide-react';

interface RoleBasedAccessProps {
  children?: React.ReactNode;
}

// Higher-order component for role-based access control
export const withRoleAccess = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredRole: UserRole,
  requiredPermission?: { resource: string; action: string }
) => {
  return (props: P) => {
    const { hasRole } = useAuth();

    if (!hasRole(requiredRole)) {
      return (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-700">
              <Shield className="h-5 w-5" />
              <span className="font-medium">Access Denied</span>
            </div>
            <p className="mt-2 text-sm text-red-600">
              You need {ROLES[requiredRole].name} role to access this feature.
            </p>
          </CardContent>
        </Card>
      );
    }

    if (requiredPermission) {
      const { user } = useAuth();
      // This would need to be implemented based on your user role system
      const userRole = (user?.user_metadata?.role as UserRole) || 'data_entry';

      if (
        !hasPermission(
          userRole,
          requiredPermission.resource,
          requiredPermission.action
        )
      ) {
        return (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-orange-700">
                <Shield className="h-5 w-5" />
                <span className="font-medium">Permission Required</span>
              </div>
              <p className="mt-2 text-sm text-orange-600">
                You need {requiredPermission.action} permission on{' '}
                {requiredPermission.resource} to access this feature.
              </p>
            </CardContent>
          </Card>
        );
      }
    }

    return <WrappedComponent {...props} />;
  };
};

// Component to display role-based navigation
export const RoleBasedNavigation: React.FC = () => {
  const { hasRole } = useAuth();

  const navigationItems = [
    {
      name: 'Dashboard',
      icon: BarChart3,
      roles: ['admin', 'general_manager', 'supervisor', 'data_entry'],
    },
    {
      name: 'Invoices',
      icon: FileText,
      roles: ['admin', 'general_manager', 'supervisor', 'data_entry'],
    },
    {
      name: 'Expenses',
      icon: FileText,
      roles: ['admin', 'general_manager', 'supervisor', 'data_entry'],
    },
    {
      name: 'Fleet',
      icon: Truck,
      roles: ['admin', 'general_manager', 'supervisor', 'data_entry'],
    },
    {
      name: 'Maintenance',
      icon: Wrench,
      roles: ['admin', 'general_manager', 'supervisor', 'data_entry'],
    },
    {
      name: 'User Management',
      icon: Users,
      roles: ['admin'],
    },
    {
      name: 'Settings',
      icon: Settings,
      roles: ['admin'],
    },
  ];

  return (
    <div className="space-y-2">
      {navigationItems.map(item => {
        const Icon = item.icon;
        const hasAccess = item.roles.some(role => hasRole(role as UserRole));

        if (!hasAccess) return null;

        return (
          <Button
            key={item.name}
            variant="ghost"
            className="w-full justify-start gap-2"
          >
            <Icon className="h-4 w-4" />
            {item.name}
          </Button>
        );
      })}
    </div>
  );
};

// Component to display role-based actions
export const RoleBasedActions: React.FC<{ resource: string }> = ({
  resource,
}) => {
  const { hasRole } = useAuth();

  const getActions = () => {
    if (hasRole('admin')) {
      return ['create', 'read', 'update', 'delete', 'export'];
    } else if (hasRole('general_manager')) {
      return ['create', 'read', 'update', 'export'];
    } else if (hasRole('supervisor')) {
      return ['create', 'read', 'update', 'export'];
    } else if (hasRole('data_entry')) {
      return ['create', 'read'];
    }
    return [];
  };

  const actions = getActions();

  return (
    <div className="flex flex-wrap gap-2">
      {actions.includes('create') && (
        <Button size="sm" className="bg-green-600 hover:bg-green-700">
          <Plus className="mr-2 h-4 w-4" />
          Create
        </Button>
      )}
      {actions.includes('export') && (
        <Button size="sm" variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      )}
    </div>
  );
};

// Component to display role-based data fields
export const RoleBasedDataDisplay: React.FC<{
  data: Record<string, any>;
  resource: string;
}> = ({ data, resource }) => {
  const { hasRole } = useAuth();

  const getVisibleFields = () => {
    if (hasRole('admin')) {
      return Object.keys(data);
    } else if (hasRole('general_manager')) {
      return Object.keys(data).filter(
        field => !['deleted_at', 'internal_notes'].includes(field)
      );
    } else if (hasRole('supervisor')) {
      return Object.keys(data).filter(
        field =>
          ![
            'deleted_at',
            'internal_notes',
            'cost_center',
            'profit_margin',
          ].includes(field)
      );
    } else if (hasRole('data_entry')) {
      return Object.keys(data).filter(
        field =>
          ![
            'deleted_at',
            'internal_notes',
            'cost_center',
            'profit_margin',
            'salary_info',
            'performance_metrics',
            'confidential_data',
          ].includes(field)
      );
    }
    return [];
  };

  const visibleFields = getVisibleFields();

  return (
    <div className="space-y-2">
      {visibleFields.map(field => (
        <div key={field} className="flex justify-between border-b pb-2">
          <span className="font-medium capitalize">
            {field.replace(/_/g, ' ')}:
          </span>
          <span className="text-muted-foreground">
            {typeof data[field] === 'boolean'
              ? data[field]
                ? 'Yes'
                : 'No'
              : data[field]?.toString() || 'N/A'}
          </span>
        </div>
      ))}
    </div>
  );
};

// Main component to demonstrate role-based access control
export const RoleBasedAccess: React.FC<RoleBasedAccessProps> = () => {
  const { hasRole } = useAuth();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Role-Based Access Control Demo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Admin Section */}
            {hasRole('admin') && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-green-800">Admin Access</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Badge className="bg-green-600">Full System Access</Badge>
                    <p className="text-sm text-green-700">
                      You have complete access to all system features and data.
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Users className="mr-2 h-4 w-4" />
                        Manage Users
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="mr-2 h-4 w-4" />
                        System Settings
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* General Manager Section */}
            {hasRole('general_manager') && (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-blue-800">
                    General Manager Access
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Badge className="bg-blue-600">Strategic Oversight</Badge>
                    <p className="text-sm text-blue-700">
                      You have access to operational data and financial
                      approvals.
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        View Reports
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export Data
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Supervisor Section */}
            {hasRole('supervisor') && (
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="text-orange-800">
                    Supervisor Access
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Badge className="bg-orange-600">Team Management</Badge>
                    <p className="text-sm text-orange-700">
                      You can manage team operations and approve expenses.
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Records
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Export Reports
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Data Entry Section */}
            {hasRole('data_entry') && (
              <Card className="border-gray-200 bg-gray-50">
                <CardHeader>
                  <CardTitle className="text-gray-800">
                    Data Entry Access
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Badge className="bg-gray-600">Basic Operations</Badge>
                    <p className="text-sm text-gray-700">
                      You can create and view basic records.
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Records
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="mr-2 h-4 w-4" />
                        View Data
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Permission Matrix */}
          <Card>
            <CardHeader>
              <CardTitle>Your Current Permissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2 text-left">Resource</th>
                      <th className="p-2 text-left">Create</th>
                      <th className="p-2 text-left">Read</th>
                      <th className="p-2 text-left">Update</th>
                      <th className="p-2 text-left">Delete</th>
                      <th className="p-2 text-left">Export</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      'invoices',
                      'expenses',
                      'customers',
                      'vendors',
                      'fleet',
                    ].map(resource => (
                      <tr key={resource} className="border-b">
                        <td className="p-2 font-medium capitalize">
                          {resource}
                        </td>
                        <td className="p-2">
                          {hasPermission('admin', resource, 'create')
                            ? '✅'
                            : '❌'}
                        </td>
                        <td className="p-2">
                          {hasPermission('admin', resource, 'read')
                            ? '✅'
                            : '❌'}
                        </td>
                        <td className="p-2">
                          {hasPermission('admin', resource, 'update')
                            ? '✅'
                            : '❌'}
                        </td>
                        <td className="p-2">
                          {hasPermission('admin', resource, 'delete')
                            ? '✅'
                            : '❌'}
                        </td>
                        <td className="p-2">
                          {hasPermission('admin', resource, 'export')
                            ? '✅'
                            : '❌'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleBasedAccess;
