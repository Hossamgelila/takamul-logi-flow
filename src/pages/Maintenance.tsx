import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import {
  Wrench,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
} from 'lucide-react';

interface MaintenanceExpense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount_omr: number;
  currency: string;
  vendor_name?: string;
  truck_plate?: string;
  trailer_plate?: string;
}

export default function Maintenance() {
  const [expenses, setExpenses] = useState<MaintenanceExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all');

  useEffect(() => {
    fetchMaintenanceExpenses();
  }, [timeFilter]);

  const fetchMaintenanceExpenses = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('expenses')
        .select(
          `
          id,
          date,
          category,
          description,
          amount_omr,
          currency,
          vendors:vendor_id (name),
          trucks:truck_id (plate_no),
          trailers:trailer_id (plate_no)
        `
        )
        .eq('category', 'SERVICE & MAINTENANCE')
        .eq('is_deleted', false)
        .order('date', { ascending: false });

      // Apply time filter
      if (timeFilter !== 'all') {
        const now = new Date();
        let startDate = new Date();

        switch (timeFilter) {
          case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
          case 'quarter':
            startDate.setMonth(now.getMonth() - 3);
            break;
          case 'year':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        }

        query = query.gte('date', startDate.toISOString().split('T')[0]);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching maintenance expenses:', error);
        return;
      }

      const formattedExpenses =
        data?.map(expense => ({
          id: expense.id,
          date: expense.date,
          category: expense.category,
          description: expense.description || '',
          amount_omr: expense.amount_omr || 0,
          currency: expense.currency,
          vendor_name: expense.vendors?.name || 'Unknown',
          truck_plate: expense.trucks?.plate_no,
          trailer_plate: expense.trailers?.plate_no,
        })) || [];

      setExpenses(formattedExpenses);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate analytics
  const totalMaintenanceCost = expenses.reduce(
    (sum, exp) => sum + exp.amount_omr,
    0
  );
  const avgMonthlyMaintenance =
    expenses.length > 0
      ? totalMaintenanceCost / Math.max(1, getMonthsInPeriod())
      : 0;

  // Group by vehicle
  const vehicleBreakdown = expenses.reduce(
    (acc, exp) => {
      const vehicle = exp.truck_plate || exp.trailer_plate || 'Unassigned';
      if (!acc[vehicle]) {
        acc[vehicle] = { count: 0, total: 0 };
      }
      acc[vehicle].count += 1;
      acc[vehicle].total += exp.amount_omr;
      return acc;
    },
    {} as Record<string, { count: number; total: number }>
  );

  // Group by vendor
  const vendorBreakdown = expenses.reduce(
    (acc, exp) => {
      const vendor = exp.vendor_name || 'Unknown';
      if (!acc[vendor]) {
        acc[vendor] = { count: 0, total: 0 };
      }
      acc[vendor].count += 1;
      acc[vendor].total += exp.amount_omr;
      return acc;
    },
    {} as Record<string, { count: number; total: number }>
  );

  function getMonthsInPeriod(): number {
    switch (timeFilter) {
      case 'month':
        return 1;
      case 'quarter':
        return 3;
      case 'year':
        return 12;
      default:
        return Math.max(1, expenses.length > 0 ? 12 : 1); // Assume 12 months for 'all'
    }
  }

  const formatCurrency = (amount: number) => `${amount.toFixed(2)} OMR`;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Maintenance Analysis</h1>
            <p className="text-muted-foreground">
              Analyze maintenance costs from expense entries
            </p>
          </div>

          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Maintenance Cost
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(totalMaintenanceCost)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Maintenance Events
              </CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{expenses.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg Monthly Cost
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(avgMonthlyMaintenance)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg Cost per Event
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(
                  expenses.length > 0
                    ? totalMaintenanceCost / expenses.length
                    : 0
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analysis Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Vehicle Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Maintenance by Vehicle</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(vehicleBreakdown)
                  .sort(([, a], [, b]) => b.total - a.total)
                  .slice(0, 5)
                  .map(([vehicle, data]) => (
                    <div
                      key={vehicle}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium">{vehicle}</div>
                        <div className="text-sm text-muted-foreground">
                          {data.count} events
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {formatCurrency(data.total)}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Vendor Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Maintenance by Vendor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(vendorBreakdown)
                  .sort(([, a], [, b]) => b.total - a.total)
                  .slice(0, 5)
                  .map(([vendor, data]) => (
                    <div
                      key={vendor}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium">{vendor}</div>
                        <div className="text-sm text-muted-foreground">
                          {data.count} events
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {formatCurrency(data.total)}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Maintenance Expenses */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Maintenance Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Loading...</div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.slice(0, 10).map(expense => (
                    <TableRow key={expense.id}>
                      <TableCell>
                        {new Date(expense.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {expense.description || 'No description'}
                      </TableCell>
                      <TableCell>
                        {expense.truck_plate ||
                          expense.trailer_plate ||
                          'Unassigned'}
                      </TableCell>
                      <TableCell>{expense.vendor_name}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(expense.amount_omr)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {expenses.length === 0 && !loading && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-8 text-center text-muted-foreground"
                      >
                        No maintenance expenses found for the selected period.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
