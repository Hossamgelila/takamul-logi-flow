import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Filter } from 'lucide-react';

interface DashboardFiltersProps {
  dateRange: { from: string; to: string };
  onDateRangeChange: (range: { from: string; to: string }) => void;
  country: string;
  onCountryChange: (country: string) => void;
  currency: string;
  onCurrencyChange: (currency: string) => void;
}

export default function DashboardFilters({
  dateRange,
  onDateRangeChange,
  country,
  onCountryChange,
  currency,
  onCurrencyChange,
}: DashboardFiltersProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Filter className="h-4 w-4" />
            Filters
          </div>

          {/* Date Range */}
          <div className="grid gap-2">
            <Label htmlFor="date-from" className="text-xs">
              From
            </Label>
            <Input
              id="date-from"
              type="date"
              value={dateRange.from}
              onChange={e =>
                onDateRangeChange({ ...dateRange, from: e.target.value })
              }
              className="w-36"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="date-to" className="text-xs">
              To
            </Label>
            <Input
              id="date-to"
              type="date"
              value={dateRange.to}
              onChange={e =>
                onDateRangeChange({ ...dateRange, to: e.target.value })
              }
              className="w-36"
            />
          </div>

          {/* Country Filter */}
          <div className="grid gap-2">
            <Label className="text-xs">Country</Label>
            <Select value={country} onValueChange={onCountryChange}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="OM">Oman</SelectItem>
                <SelectItem value="YE">Yemen</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Currency Toggle */}
          <div className="grid gap-2">
            <Label className="text-xs">Currency View</Label>
            <Select value={currency} onValueChange={onCurrencyChange}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OMR">OMR</SelectItem>
                <SelectItem value="AED">AED</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            This Month
          </Button>

          <Button variant="outline" size="sm">
            Last 30 Days
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
