'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { mockChartData } from '@/lib/data';

const chartConfig = {
  spending: {
    label: 'Spending',
    color: 'hsl(var(--primary))',
  },
};

export function SpendingChart() {
  return (
    <ChartContainer config={chartConfig} className="h-[250px] w-full">
      <BarChart
        data={mockChartData}
        margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          fontSize={12}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          fontSize={12}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dot" />}
        />
        <Bar dataKey="spending" fill="var(--color-spending)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
