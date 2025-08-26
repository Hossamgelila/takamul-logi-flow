import { useState } from 'react';
import Layout from '@/components/Layout';
import KPICard from '@/components/dashboard/KPICard';
import QuickActions from '@/components/dashboard/QuickActions';
import DashboardFilters from '@/components/dashboard/DashboardFilters';
import NewInvoiceModal from '@/components/modals/NewInvoiceModal';

import NewExpenseModal from '@/components/modals/NewExpenseModal';
import NewCustomerModal from '@/components/modals/NewCustomerModal';
import NewSupplierModal from '@/components/modals/NewSupplierModal';
import NewTruckModal from '@/components/modals/NewTruckModal';
import NewTrailerModal from '@/components/modals/NewTrailerModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Eye,
  Edit,
  FileText,
  TrendingUp,
  Truck,
  Activity,
  DollarSign,
  Gauge,
} from 'lucide-react';

export default function Dashboard() {
  const [showNewInvoice, setShowNewInvoice] = useState(false);
  const [showNewExpense, setShowNewExpense] = useState(false);
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const [showNewSupplier, setShowNewSupplier] = useState(false);
  const [showNewTruck, setShowNewTruck] = useState(false);
  const [showNewTrailer, setShowNewTrailer] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split('T')[0],
    to: new Date().toISOString().split('T')[0],
  });
  const [country, setCountry] = useState('all');
  const [currency, setCurrency] = useState('OMR');

  // Mock data
  const kpiData = {
    revenue: { value: '45,250', trend: 12.5, previous: '40,220' },
    passThrough: { value: '18,750', trend: 8.2, previous: '17,350' },
    margin: { value: '26,800', trend: 15.3, previous: '23,250' },
    receivables: { value: '89,500', trend: -5.2, previous: '94,650' },
    payables: { value: '34,200', trend: 3.1, previous: '33,150' },
    fleetUtilization: { value: '87', trend: 4.5, previous: '83' },
    maintenanceCost: { value: '12,450', trend: -8.7, previous: '13,640' },
  };

  const revenueExpenseData = [
    { month: 'Jan', revenue: 38000, expenses: 12000 },
    { month: 'Feb', revenue: 42000, expenses: 15000 },
    { month: 'Mar', revenue: 45250, expenses: 18500 },
    { month: 'Apr', revenue: 48000, expenses: 20000 },
    { month: 'May', revenue: 52000, expenses: 22000 },
    { month: 'Jun', revenue: 55000, expenses: 24000 },
  ];

  const passThroughData = [
    { name: 'Billable Revenue', value: 45250, color: '#22c55e' },
    { name: 'Pass-Through', value: 18750, color: '#f59e0b' },
  ];

  const recentInvoices = [
    {
      id: 'INV-2024-001',
      customer: 'ABC Trading LLC',
      total: '15,250',
      currency: 'OMR',
      status: 'Paid',
      passThrough: '5,200',
    },
    {
      id: 'INV-2024-002',
      customer: 'XYZ Logistics',
      total: '8,750',
      currency: 'AED',
      status: 'Issued',
      passThrough: '2,100',
    },
    {
      id: 'INV-2024-003',
      customer: 'Gulf Transport',
      total: '22,000',
      currency: 'OMR',
      status: 'Overdue',
      passThrough: '8,500',
    },
    {
      id: 'INV-2024-004',
      customer: 'Al Mashreq Shipping',
      total: '12,400',
      currency: 'OMR',
      status: 'Draft',
      passThrough: '3,900',
    },
    {
      id: 'INV-2024-005',
      customer: 'Yemen Express',
      total: '6,800',
      currency: 'AED',
      status: 'Paid',
      passThrough: '1,200',
    },
  ];

  const recentExpenses = [
    {
      id: 'EXP-001',
      vendor: 'Al Wadi Garage',
      category: 'Maintenance',
      amount: '2,450',
      currency: 'OMR',
      truck: 'T-101',
    },
    {
      id: 'EXP-002',
      vendor: 'Shell Oman',
      category: 'Fuel',
      amount: '1,850',
      currency: 'OMR',
      truck: 'T-105',
    },
    {
      id: 'EXP-003',
      vendor: 'Border Authority',
      category: 'Fees',
      amount: '450',
      currency: 'AED',
      truck: 'T-103',
    },
    {
      id: 'EXP-004',
      vendor: 'Tire Center',
      category: 'Tires',
      amount: '3,200',
      currency: 'OMR',
      truck: 'T-107',
    },
    {
      id: 'EXP-005',
      vendor: 'Customs Broker',
      category: 'Customs',
      amount: '890',
      currency: 'AED',
      truck: 'T-102',
    },
  ];

  const truckPerformanceData = [
    {
      truckId: 'T-101',
      plateNo: '12345-A',
      type: '6wheel',
      revenue: 28500,
      expenses: 8200,
      netMargin: 20300,
      utilization: 92,
      jobs: 8,
      fuelCost: 3200,
      maintenanceCost: 2100,
    },
    {
      truckId: 'T-105',
      plateNo: '67890-B',
      type: '4wheel',
      revenue: 22000,
      expenses: 6800,
      netMargin: 15200,
      utilization: 88,
      jobs: 6,
      fuelCost: 2800,
      maintenanceCost: 1500,
    },
    {
      truckId: 'T-103',
      plateNo: '54321-C',
      type: '6wheel',
      revenue: 31200,
      expenses: 9500,
      netMargin: 21700,
      utilization: 95,
      jobs: 9,
      fuelCost: 3800,
      maintenanceCost: 2700,
    },
    {
      truckId: 'T-107',
      plateNo: '98765-D',
      type: '4wheel',
      revenue: 18500,
      expenses: 5200,
      netMargin: 13300,
      utilization: 78,
      jobs: 5,
      fuelCost: 2100,
      maintenanceCost: 980,
    },
    {
      truckId: 'T-102',
      plateNo: '11223-E',
      type: '6wheel',
      revenue: 26800,
      expenses: 7600,
      netMargin: 19200,
      utilization: 85,
      jobs: 7,
      fuelCost: 3000,
      maintenanceCost: 1800,
    },
  ];

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'default';
      case 'issued':
        return 'secondary';
      case 'overdue':
        return 'destructive';
      case 'draft':
        return 'outline';
      case 'in-transit':
        return 'secondary';
      case 'planned':
        return 'outline';
      case 'delivered':
        return 'default';
      default:
        return 'outline';
    }
  };

  return (
    <Layout>
      <div className="content-spacing">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Operations overview for Takamul Logistics
          </p>
        </div>

        {/* Filters */}
        <DashboardFilters
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          country={country}
          onCountryChange={setCountry}
          currency={currency}
          onCurrencyChange={setCurrency}
        />

        {/* Quick Actions */}
        <QuickActions
          onNewInvoice={() => setShowNewInvoice(true)}
          onNewExpense={() => setShowNewExpense(true)}
          onNewCustomer={() => setShowNewCustomer(true)}
          onNewSupplier={() => setShowNewSupplier(true)}
          onNewTruck={() => setShowNewTruck(true)}
          onNewTrailer={() => setShowNewTrailer(true)}
        />

        {/* KPI Cards */}
        <div className="responsive-grid-4">
          <KPICard
            title="Revenue (excl. Pass-Through)"
            value={kpiData.revenue.value}
            currency={currency}
            trend={kpiData.revenue.trend}
            previousValue={kpiData.revenue.previous}
            type="revenue"
          />
          <KPICard
            title="Pass-Through Charges"
            value={kpiData.passThrough.value}
            currency={currency}
            trend={kpiData.passThrough.trend}
            previousValue={kpiData.passThrough.previous}
            type="expense"
          />
          <KPICard
            title="Net Margin"
            value={kpiData.margin.value}
            currency={currency}
            trend={kpiData.margin.trend}
            previousValue={kpiData.margin.previous}
            type="margin"
          />
          <KPICard
            title="Fleet Utilization"
            value={kpiData.fleetUtilization.value}
            currency=""
            trend={kpiData.fleetUtilization.trend}
            previousValue={kpiData.fleetUtilization.previous}
            type="fleet"
          />
        </div>

        <div className="responsive-grid-3">
          <KPICard
            title="Accounts Receivable"
            value={kpiData.receivables.value}
            currency={currency}
            trend={kpiData.receivables.trend}
            previousValue={kpiData.receivables.previous}
          />
          <KPICard
            title="Accounts Payable"
            value={kpiData.payables.value}
            currency={currency}
            trend={kpiData.payables.trend}
            previousValue={kpiData.payables.previous}
          />
          <KPICard
            title="Maintenance Cost"
            value={kpiData.maintenanceCost.value}
            currency={currency}
            trend={kpiData.maintenanceCost.trend}
            previousValue={kpiData.maintenanceCost.previous}
            type="expense"
          />
        </div>

        {/* Charts - Simplified for initial build */}
        <div className="responsive-grid-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Revenue vs Direct Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-[300px] items-center justify-center rounded-lg bg-muted/50">
                <div className="text-center">
                  <p className="text-muted-foreground">
                    Revenue: 45,250 {currency}
                  </p>
                  <p className="text-muted-foreground">
                    Expenses: 18,500 {currency}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Chart view coming soon
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pass-Through vs Billable Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-[300px] items-center justify-center rounded-lg bg-muted/50">
                <div className="text-center">
                  <p className="text-muted-foreground">
                    Billable: 45,250 {currency} (70.7%)
                  </p>
                  <p className="text-muted-foreground">
                    Pass-Through: 18,750 {currency} (29.3%)
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Chart view coming soon
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Tables */}
        <div className="responsive-grid-2">
          {/* Recent Invoices */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Recent Invoices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="table-responsive">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentInvoices.map(invoice => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">
                          {invoice.id}
                        </TableCell>
                        <TableCell className="text-sm">
                          {invoice.customer}
                        </TableCell>
                        <TableCell>
                          {invoice.total} {invoice.currency}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getStatusBadgeVariant(invoice.status)}
                          >
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Recent Expenses */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="table-responsive">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Asset</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentExpenses.map(expense => (
                      <TableRow key={expense.id}>
                        <TableCell className="text-sm">
                          {expense.vendor}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{expense.category}</Badge>
                        </TableCell>
                        <TableCell>
                          {expense.amount} {expense.currency}
                        </TableCell>
                        <TableCell className="text-sm">
                          {expense.truck}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Truck Performance Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Top Truck Performance ({currency})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="table-responsive">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Truck</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                    <TableHead className="text-right">Expenses</TableHead>
                    <TableHead className="text-right">Net Margin</TableHead>
                    <TableHead className="text-right">Utilization</TableHead>
                    <TableHead className="text-right">Jobs</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {truckPerformanceData
                    .sort((a, b) => b.netMargin - a.netMargin)
                    .slice(0, 5)
                    .map(truck => (
                      <TableRow key={truck.truckId}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{truck.truckId}</div>
                            <div className="text-sm text-muted-foreground">
                              {truck.plateNo}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{truck.type}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <DollarSign className="h-3 w-3 text-muted-foreground" />
                            {truck.revenue.toLocaleString()} {currency}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Activity className="h-3 w-3 text-muted-foreground" />
                            {truck.expenses.toLocaleString()} {currency}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1 font-medium text-primary">
                            {truck.netMargin.toLocaleString()} {currency}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Gauge className="h-3 w-3 text-muted-foreground" />
                            {truck.utilization}%
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary">{truck.jobs}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <NewInvoiceModal open={showNewInvoice} onOpenChange={setShowNewInvoice} />

      <NewExpenseModal open={showNewExpense} onOpenChange={setShowNewExpense} />
      <NewCustomerModal
        open={showNewCustomer}
        onOpenChange={setShowNewCustomer}
      />
      <NewSupplierModal
        open={showNewSupplier}
        onOpenChange={setShowNewSupplier}
      />
      <NewTruckModal open={showNewTruck} onOpenChange={setShowNewTruck} />
      <NewTrailerModal open={showNewTrailer} onOpenChange={setShowNewTrailer} />
    </Layout>
  );
}
