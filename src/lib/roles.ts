export type UserRole =
  | 'admin'
  | 'general_manager'
  | 'supervisor'
  | 'data_entry';

export interface Permission {
  resource: string;
  actions: string[];
  conditions?: Record<string, any>;
}

export interface RoleDefinition {
  name: string;
  description: string;
  level: number; // Higher number = more privileges
  permissions: Permission[];
  visibleModules: string[];
  dataAccess: {
    canViewAll: boolean;
    canEditAll: boolean;
    canDeleteAll: boolean;
    canCreateAll: boolean;
    restrictedFields?: string[];
    dataScope: 'all' | 'department' | 'assigned' | 'own';
  };
  systemAccess: {
    canManageUsers: boolean;
    canViewReports: boolean;
    canExportData: boolean;
    canImportData: boolean;
    canManageSettings: boolean;
    canViewAuditLogs: boolean;
  };
}

export const ROLES: Record<UserRole, RoleDefinition> = {
  admin: {
    name: 'System Administrator',
    description: 'Full system access with user management capabilities',
    level: 100,
    permissions: [
      {
        resource: 'users',
        actions: ['create', 'read', 'update', 'delete', 'manage_roles'],
      },
      {
        resource: 'companies',
        actions: ['create', 'read', 'update', 'delete'],
      },
      {
        resource: 'invoices',
        actions: ['create', 'read', 'update', 'delete', 'approve', 'void'],
      },
      {
        resource: 'expenses',
        actions: ['create', 'read', 'update', 'delete', 'approve', 'reject'],
      },
      {
        resource: 'customers',
        actions: ['create', 'read', 'update', 'delete'],
      },
      { resource: 'vendors', actions: ['create', 'read', 'update', 'delete'] },
      {
        resource: 'fleet',
        actions: ['create', 'read', 'update', 'delete', 'assign'],
      },
      {
        resource: 'routes',
        actions: ['create', 'read', 'update', 'delete', 'optimize'],
      },
      {
        resource: 'maintenance',
        actions: ['create', 'read', 'update', 'delete', 'schedule'],
      },
      {
        resource: 'reports',
        actions: ['create', 'read', 'export', 'schedule'],
      },
      { resource: 'settings', actions: ['create', 'read', 'update', 'delete'] },
      { resource: 'audit_logs', actions: ['read', 'export'] },
    ],
    visibleModules: [
      'dashboard',
      'invoices',
      'expenses',
      'customers',
      'vendors',
      'fleet',
      'routes',
      'maintenance',
      'reports',
      'user_management',
      'settings',
      'audit_logs',
      'analytics',
      'system_health',
    ],
    dataAccess: {
      canViewAll: true,
      canEditAll: true,
      canDeleteAll: true,
      canCreateAll: true,
      dataScope: 'all',
    },
    systemAccess: {
      canManageUsers: true,
      canViewReports: true,
      canExportData: true,
      canImportData: true,
      canManageSettings: true,
      canViewAuditLogs: true,
    },
  },

  general_manager: {
    name: 'General Manager',
    description: 'Strategic oversight with full operational access',
    level: 80,
    permissions: [
      {
        resource: 'invoices',
        actions: ['create', 'read', 'update', 'approve', 'void'],
      },
      {
        resource: 'expenses',
        actions: ['create', 'read', 'update', 'approve', 'reject'],
      },
      { resource: 'customers', actions: ['create', 'read', 'update'] },
      { resource: 'vendors', actions: ['create', 'read', 'update'] },
      { resource: 'fleet', actions: ['create', 'read', 'update', 'assign'] },
      { resource: 'routes', actions: ['create', 'read', 'update', 'optimize'] },
      {
        resource: 'maintenance',
        actions: ['create', 'read', 'update', 'schedule'],
      },
      {
        resource: 'reports',
        actions: ['create', 'read', 'export', 'schedule'],
      },
      { resource: 'analytics', actions: ['read', 'export'] },
    ],
    visibleModules: [
      'dashboard',
      'invoices',
      'expenses',
      'customers',
      'vendors',
      'fleet',
      'routes',
      'maintenance',
      'reports',
      'analytics',
    ],
    dataAccess: {
      canViewAll: true,
      canEditAll: true,
      canDeleteAll: false,
      canCreateAll: true,
      restrictedFields: ['deleted_at', 'internal_notes'],
      dataScope: 'all',
    },
    systemAccess: {
      canManageUsers: false,
      canViewReports: true,
      canExportData: true,
      canImportData: false,
      canManageSettings: false,
      canViewAuditLogs: false,
    },
  },

  supervisor: {
    name: 'Supervisor',
    description: 'Team management with operational oversight',
    level: 60,
    permissions: [
      { resource: 'invoices', actions: ['create', 'read', 'update'] },
      {
        resource: 'expenses',
        actions: ['create', 'read', 'update', 'approve'],
      },
      { resource: 'customers', actions: ['create', 'read', 'update'] },
      { resource: 'vendors', actions: ['create', 'read', 'update'] },
      { resource: 'fleet', actions: ['read', 'update'] },
      { resource: 'routes', actions: ['create', 'read', 'update'] },
      { resource: 'maintenance', actions: ['create', 'read', 'update'] },
      { resource: 'reports', actions: ['read', 'export'] },
    ],
    visibleModules: [
      'dashboard',
      'invoices',
      'expenses',
      'customers',
      'vendors',
      'fleet',
      'routes',
      'maintenance',
      'reports',
    ],
    dataAccess: {
      canViewAll: false,
      canEditAll: false,
      canDeleteAll: false,
      canCreateAll: true,
      restrictedFields: [
        'deleted_at',
        'internal_notes',
        'cost_center',
        'profit_margin',
      ],
      dataScope: 'department',
    },
    systemAccess: {
      canManageUsers: false,
      canViewReports: true,
      canExportData: true,
      canImportData: false,
      canManageSettings: false,
      canViewAuditLogs: false,
    },
  },

  data_entry: {
    name: 'Data Entry',
    description: 'Basic data entry with limited access',
    level: 20,
    permissions: [
      { resource: 'invoices', actions: ['create', 'read'] },
      { resource: 'expenses', actions: ['create', 'read'] },
      { resource: 'customers', actions: ['create', 'read'] },
      { resource: 'vendors', actions: ['create', 'read'] },
      { resource: 'fleet', actions: ['read'] },
      { resource: 'routes', actions: ['read'] },
      { resource: 'maintenance', actions: ['create', 'read'] },
    ],
    visibleModules: [
      'dashboard',
      'invoices',
      'expenses',
      'customers',
      'vendors',
      'fleet',
      'routes',
      'maintenance',
    ],
    dataAccess: {
      canViewAll: false,
      canEditAll: false,
      canDeleteAll: false,
      canCreateAll: false,
      restrictedFields: [
        'deleted_at',
        'internal_notes',
        'cost_center',
        'profit_margin',
        'salary_info',
        'performance_metrics',
        'confidential_data',
      ],
      dataScope: 'assigned',
    },
    systemAccess: {
      canManageUsers: false,
      canViewReports: false,
      canExportData: false,
      canImportData: false,
      canManageSettings: false,
      canViewAuditLogs: false,
    },
  },
};

// Permission checking utilities
export const hasPermission = (
  userRole: UserRole,
  resource: string,
  action: string
): boolean => {
  const role = ROLES[userRole];
  if (!role) return false;

  const permission = role.permissions.find(p => p.resource === resource);
  return permission?.actions.includes(action) || false;
};

export const canAccessModule = (
  userRole: UserRole,
  module: string
): boolean => {
  const role = ROLES[userRole];
  if (!role) return false;

  return role.visibleModules.includes(module);
};

export const getDataScope = (userRole: UserRole): string => {
  const role = ROLES[userRole];
  return role?.dataAccess.dataScope || 'own';
};

export const canPerformAction = (
  userRole: UserRole,
  action: 'view' | 'edit' | 'delete' | 'create',
  resource?: string
): boolean => {
  const role = ROLES[userRole];
  if (!role) return false;

  switch (action) {
    case 'view':
      return role.dataAccess.canViewAll;
    case 'edit':
      return role.dataAccess.canEditAll;
    case 'delete':
      return role.dataAccess.canDeleteAll;
    case 'create':
      return role.dataAccess.canCreateAll;
    default:
      return false;
  }
};

// Role hierarchy
export const getRoleLevel = (role: UserRole): number => {
  return ROLES[role]?.level || 0;
};

export const canManageRole = (
  currentRole: UserRole,
  targetRole: UserRole
): boolean => {
  return getRoleLevel(currentRole) > getRoleLevel(targetRole);
};

// Module-specific permissions
export const INVOICE_PERMISSIONS = {
  admin: ['create', 'read', 'update', 'delete', 'approve', 'void', 'export'],
  general_manager: ['create', 'read', 'update', 'approve', 'void', 'export'],
  supervisor: ['create', 'read', 'update', 'export'],
  data_entry: ['create', 'read'],
};

export const EXPENSE_PERMISSIONS = {
  admin: ['create', 'read', 'update', 'delete', 'approve', 'reject', 'export'],
  general_manager: ['create', 'read', 'update', 'approve', 'reject', 'export'],
  supervisor: ['create', 'read', 'update', 'approve', 'export'],
  data_entry: ['create', 'read'],
};

export const USER_MANAGEMENT_PERMISSIONS = {
  admin: ['create', 'read', 'update', 'delete', 'assign_roles', 'view_audit'],
  general_manager: ['read'],
  supervisor: ['read'],
  data_entry: [],
};

// Field-level permissions
export const FIELD_PERMISSIONS = {
  admin: {
    invoices: ['*'], // All fields
    expenses: ['*'],
    customers: ['*'],
    vendors: ['*'],
    fleet: ['*'],
    users: ['*'],
  },
  general_manager: {
    invoices: ['*'],
    expenses: ['*'],
    customers: ['*'],
    vendors: ['*'],
    fleet: ['*'],
    users: ['id', 'username', 'email', 'role', 'status'],
  },
  supervisor: {
    invoices: ['id', 'customer', 'amount', 'status', 'created_at', 'due_date'],
    expenses: ['id', 'vendor', 'amount', 'category', 'status', 'created_at'],
    customers: ['id', 'name', 'email', 'phone', 'status'],
    vendors: ['id', 'name', 'email', 'phone', 'status'],
    fleet: ['id', 'plate_number', 'type', 'status', 'assigned_driver'],
    users: ['id', 'username', 'email', 'role'],
  },
  data_entry: {
    invoices: ['id', 'customer', 'amount', 'status'],
    expenses: ['id', 'vendor', 'amount', 'category'],
    customers: ['id', 'name', 'email', 'phone'],
    vendors: ['id', 'name', 'email', 'phone'],
    fleet: ['id', 'plate_number', 'type'],
    users: ['id', 'username', 'email'],
  },
};

// Dashboard visibility based on role
export const DASHBOARD_MODULES = {
  admin: {
    kpis: [
      'revenue',
      'expenses',
      'profit',
      'fleet_utilization',
      'maintenance_costs',
    ],
    charts: [
      'revenue_trend',
      'expense_breakdown',
      'fleet_performance',
      'customer_analytics',
    ],
    tables: [
      'recent_invoices',
      'pending_expenses',
      'fleet_status',
      'maintenance_schedule',
    ],
    actions: [
      'create_invoice',
      'approve_expense',
      'assign_fleet',
      'manage_users',
    ],
  },
  general_manager: {
    kpis: ['revenue', 'expenses', 'profit', 'fleet_utilization'],
    charts: ['revenue_trend', 'expense_breakdown', 'fleet_performance'],
    tables: ['recent_invoices', 'pending_expenses', 'fleet_status'],
    actions: ['create_invoice', 'approve_expense', 'assign_fleet'],
  },
  supervisor: {
    kpis: ['revenue', 'expenses', 'fleet_utilization'],
    charts: ['revenue_trend', 'expense_breakdown'],
    tables: ['recent_invoices', 'pending_expenses', 'fleet_status'],
    actions: ['create_invoice', 'approve_expense'],
  },
  data_entry: {
    kpis: ['revenue', 'expenses'],
    charts: ['revenue_trend'],
    tables: ['recent_invoices', 'pending_expenses'],
    actions: ['create_invoice', 'create_expense'],
  },
};

export default ROLES;
