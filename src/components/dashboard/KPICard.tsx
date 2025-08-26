import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string;
  currency: string;
  trend?: number;
  previousValue?: string;
  className?: string;
  type?: 'revenue' | 'expense' | 'margin' | 'fleet' | 'default';
}

const typeColors = {
  revenue: 'border-l-4 border-l-revenue',
  expense: 'border-l-4 border-l-expense',
  margin: 'border-l-4 border-l-margin',
  fleet: 'border-l-4 border-l-fleet',
  default: 'border-l-4 border-l-primary',
};

export default function KPICard({
  title,
  value,
  currency,
  trend,
  previousValue,
  className,
  type = 'default',
}: KPICardProps) {
  const formatCurrency = (amount: string, curr: string) => {
    return `${amount} ${curr}`;
  };

  const getTrendIcon = () => {
    if (trend === undefined) return null;

    if (trend > 0) return <TrendingUp className="h-4 w-4 text-success" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-destructive" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getTrendColor = () => {
    if (trend === undefined) return '';
    if (trend > 0) return 'text-success';
    if (trend < 0) return 'text-destructive';
    return 'text-muted-foreground';
  };

  return (
    <Card
      className={cn(
        'transition-all hover:shadow-md',
        typeColors[type],
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {getTrendIcon()}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">
          {type === 'fleet' ? `${value}%` : formatCurrency(value, currency)}
        </div>
        {trend !== undefined && (
          <p className={cn('mt-1 text-xs', getTrendColor())}>
            {trend > 0 ? '+' : ''}
            {trend.toFixed(1)}% from last period
          </p>
        )}
        {previousValue && (
          <p className="mt-1 text-xs text-muted-foreground">
            Previous:{' '}
            {type === 'fleet'
              ? `${previousValue}%`
              : formatCurrency(previousValue, currency)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
