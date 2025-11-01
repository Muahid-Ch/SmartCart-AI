
'use client';

import {
  CircleDollarSign,
  TrendingDown,
  TrendingUp,
  Wallet,
  Pencil,
  Scale,
} from 'lucide-react';
import { StatCard } from './components/stat-card';
import { SpendingChart } from './components/spending-chart';
import { RecentTransactions } from './components/recent-transactions';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  forecastNextMonthsBudget,
  type ForecastNextMonthsBudgetOutput,
} from '@/ai/flows/forecast-next-months-budget';
import { useEffect, useState, useMemo } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useCollection } from '@/firebase/firestore/use-collection';
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  doc,
  updateDoc,
} from 'firebase/firestore';
import type { Expense } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [forecastData, setForecastData] =
    useState<ForecastNextMonthsBudgetOutput | null>(null);
  const [newBalance, setNewBalance] = useState('');
  const [isSavingBalance, setIsSavingBalance] = useState(false);

  const userDocRef = useMemoFirebase(
    () => (user && firestore ? doc(firestore, 'users', user.uid) : null),
    [user, firestore]
  );
  const { data: userData, isLoading: isUserDocLoading } = useDoc(userDocRef);

  const expensesQuery = useMemoFirebase(() => {
    if (user && firestore) {
      return collection(firestore, `users/${user.uid}/expenses`);
    }
    return null;
  }, [user, firestore]);

  const { data: expenses, isLoading: areExpensesLoading } =
    useCollection<Expense>(expensesQuery);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    async function getForecast() {
      if (!expenses || expenses.length === 0) {
        setForecastData(null);
        return;
      }
      try {
        const history = expenses.map((item) => ({
          timestamp: item.timestamp,
          category: item.category,
          price: item.price,
        }));
        const forecast: ForecastNextMonthsBudgetOutput =
          await forecastNextMonthsBudget(history);
        setForecastData(forecast);
      } catch (error) {
        console.error('Failed to fetch forecast:', error);
      }
    }

    if (user) {
      getForecast();
    }
  }, [user, expenses]);

  const handleSetBalance = async () => {
    const balanceValue = parseFloat(newBalance);
    if (!userDocRef || isNaN(balanceValue)) {
      toast({
        variant: 'destructive',
        title: 'Invalid Input',
        description: 'Please enter a valid number for your balance.',
      });
      return;
    }
    setIsSavingBalance(true);
    try {
      await updateDoc(userDocRef, { bankBalance: balanceValue });
      toast({
        title: 'Balance Updated!',
        description: 'Your total balance has been set.',
      });
      setNewBalance('');
    } catch (error) {
      console.error('Failed to update balance:', error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not update your balance. Please try again.',
      });
    } finally {
      setIsSavingBalance(false);
    }
  };

  const { currentMonthSpending, lastMonthSpending } = useMemo(() => {
    if (!expenses) return { currentMonthSpending: 0, lastMonthSpending: 0 };

    const now = new Date();
    const currentMonthStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    ).toISOString();
    const lastMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    ).toISOString();
    const lastMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      0
    ).toISOString();

    const currentMonthSpending = expenses
      .filter((e) => e.timestamp >= currentMonthStart)
      .reduce((sum, e) => sum + e.price, 0);

    const lastMonthSpending = expenses
      .filter((e) => e.timestamp >= lastMonthStart && e.timestamp <= lastMonthEnd)
      .reduce((sum, e) => sum + e.price, 0);

    return { currentMonthSpending, lastMonthSpending };
  }, [expenses]);
  
  const percentageChange =
    lastMonthSpending > 0
      ? ((currentMonthSpending - lastMonthSpending) / lastMonthSpending) * 100
      : currentMonthSpending > 0
        ? 100
        : 0;
        
  const remainingBalance = (userData?.bankBalance ?? 0) - currentMonthSpending;

  if (isUserLoading || !user || isUserDocLoading) {
    return <p>Loading...</p>;
  }

  const stats = [
    {
      title: 'Total Balance',
      value: `$${(userData?.bankBalance ?? 0).toFixed(2)}`,
      change: 'Available funds',
      icon: Wallet,
    },
    {
      title: "This Month's Spending",
      value: `$${currentMonthSpending.toFixed(2)}`,
      change: `${percentageChange.toFixed(1)}% from last month`,
      icon: CircleDollarSign,
      isNegative: currentMonthSpending > lastMonthSpending,
    },
    {
      title: 'Remaining Balance',
      value: `$${remainingBalance.toFixed(2)}`,
      change: 'After this month\'s spending',
      icon: Scale,
      isNegative: remainingBalance < 0,
    },
    {
      title: 'Forecasted Budget',
      value: `$${(forecastData?.forecastedBudget ?? 0).toFixed(2)}`,
      change: 'Based on your spending habits',
      icon: TrendingDown,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Pencil className="mr-2 h-4 w-4" />
            Set/Update Balance
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update Your Bank Balance</AlertDialogTitle>
            <AlertDialogDescription>
              Enter your current total balance. This will be updated as you add
              expenses.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              placeholder="e.g., 5000.00"
              value={newBalance}
              onChange={(e) => setNewBalance(e.target.value)}
              disabled={isSavingBalance}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSetBalance} disabled={isSavingBalance}>
              {isSavingBalance ? 'Saving...' : 'Save'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Spending Overview</CardTitle>
            <CardDescription>
              Your spending summary for the last 7 months.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SpendingChart />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              Your most recent grocery expenses.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentTransactions />
          </CardContent>
        </Card>
      </div>

      {forecastData && (
        <Card>
          <CardHeader>
            <CardTitle>AI Budget Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {forecastData.recommendations}
            </p>
            <div className="mt-4">
              <h4 className="font-semibold">High Spend Categories:</h4>
              <ul className="list-disc pl-5 mt-2 text-sm text-muted-foreground">
                {forecastData.highSpendCategories.map((cat) => (
                  <li key={cat.category}>
                    {cat.category} ({cat.percentage.toFixed(1)}% of total)
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
