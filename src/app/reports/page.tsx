
'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { generateMonthlyReport } from '@/ai/flows/generate-monthly-report';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import type { Expense } from '@/lib/types';
import { collection, query, where } from 'firebase/firestore';

export default function ReportsPage() {
  const [date, setDate] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const expensesQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    const selectedMonth = format(date, 'yyyy-MM');
    const startDate = `${selectedMonth}-01`;
    const endDate = `${selectedMonth}-31`;

    return query(
      collection(firestore, `users/${user.uid}/expenses`),
      where('timestamp', '>=', startDate),
      where('timestamp', '<=', endDate)
    );
  }, [user, firestore, date]);

  const { data: expenses, isLoading: expensesLoading } =
    useCollection<Expense>(expensesQuery);

  const handleGenerateReport = async () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Not Logged In',
        description: 'You must be logged in to generate a report.',
      });
      return;
    }
    if (!expenses || expenses.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No Data',
        description: `There is no expense data for ${format(date, 'MMMM yyyy')}.`,
      });
      return;
    }

    setIsLoading(true);
    try {
      const reportData = {
        userId: user.uid,
        month: format(date, 'yyyy-MM'),
        expenses: expenses,
      };
      
      const result = await generateMonthlyReport(reportData);

      toast({
        title: 'Report Generated!',
        description: `Your report for ${format(date, 'MMMM yyyy')} is ready. The download should start shortly.`,
      });

      // Create a Blob from the HTML content and trigger download
      const blob = new Blob([result.report], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SmartCart_Report_${format(date, 'yyyy-MM')}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Failed to generate report:', error);
      toast({
        variant: 'destructive',
        title: 'Report Generation Failed',
        description: 'Could not generate the report. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateDisabled = isLoading || expensesLoading;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Monthly AI Budget Report</CardTitle>
          <CardDescription>
            Select a month to generate a detailed HTML summary of your spending,
            optimization insights, and savings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  'w-[280px] justify-start text-left font-normal',
                  !date && 'text-muted-foreground'
                )}
                disabled={generateDisabled}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, 'MMMM yyyy') : <span>Pick a month</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(day) => day && setDate(day)}
                initialFocus
                captionLayout="dropdown-buttons"
                fromYear={2022}
                toYear={new Date().getFullYear()}
              />
            </PopoverContent>
          </Popover>
        </CardContent>
        <CardFooter>
          <Button onClick={handleGenerateReport} disabled={generateDisabled}>
            {isLoading || expensesLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {expensesLoading ? 'Loading Expenses...' : 'Generating...'}
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Generate Report
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
