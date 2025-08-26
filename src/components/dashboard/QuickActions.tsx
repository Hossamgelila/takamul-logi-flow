import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, FileText, Truck, Users, Wrench, Package, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface QuickActionsProps {
  onNewInvoice: () => void;
  onNewExpense: () => void;
  onNewCustomer: () => void;
  onNewSupplier: () => void;
  onNewTruck: () => void;
  onNewTrailer: () => void;
}

export default function QuickActions({
  onNewInvoice,
  onNewExpense,
  onNewCustomer,
  onNewSupplier,
  onNewTruck,
  onNewTrailer,
}: QuickActionsProps) {
  const { hasRole } = useAuth();
  const navigate = useNavigate();

  const actions = [
    { label: 'New Invoice', icon: FileText, onClick: onNewInvoice, variant: 'default' as const },
    { label: 'New Expense', icon: Wrench, onClick: onNewExpense, variant: 'outline' as const },
    { label: 'New Customer', icon: Users, onClick: onNewCustomer, variant: 'outline' as const },
    { label: 'New Supplier', icon: Users, onClick: onNewSupplier, variant: 'outline' as const },
    { label: 'New Truck', icon: Truck, onClick: onNewTruck, variant: 'outline' as const },
    { label: 'New Trailer', icon: Package, onClick: onNewTrailer, variant: 'outline' as const },
  ];

  // Add User Management for admins
  if (hasRole('admin')) {
    actions.push({
      label: 'User Management',
      icon: Shield,
      onClick: () => navigate('/user-management'),
      variant: 'outline' as const
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.label}
                variant={action.variant}
                size="sm"
                onClick={action.onClick}
                className="flex flex-col items-center gap-2 h-20 p-2"
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs text-center leading-tight">
                  {action.label}
                </span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}