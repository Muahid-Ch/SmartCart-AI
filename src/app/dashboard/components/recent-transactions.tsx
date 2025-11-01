'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import type { Expense } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export function RecentTransactions() {
  const { user } = useUser();
  const firestore = useFirestore();

  const expensesQuery = useMemoFirebase(() => {
    if (user && firestore) {
      return query(
        collection(firestore, `users/${user.uid}/expenses`),
        orderBy('timestamp', 'desc'),
        limit(5)
      );
    }
    return null;
  }, [user, firestore]);

  const { data: recentExpenses, isLoading } = useCollection<Expense>(expensesQuery);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center">
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="ml-4 space-y-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-[60px]" />
            </div>
            <Skeleton className="ml-auto h-5 w-[50px]" />
          </div>
        ))}
      </div>
    );
  }

  if (!recentExpenses || recentExpenses.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
        <p className="text-sm text-muted-foreground">No recent transactions.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[300px]">
      <div className="space-y-4">
        {recentExpenses.map((expense) => (
          <div key={expense.id} className="flex items-center">
            <Avatar className="h-9 w-9">
              <AvatarFallback>{expense.category.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">{expense.itemName}</p>
              <p className="text-sm text-muted-foreground">{expense.category}</p>
            </div>
            <div className="ml-auto font-medium">
              -${expense.price.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
