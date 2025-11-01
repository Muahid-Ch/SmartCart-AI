'use client';

import { useState } from 'react';
import { Loader2, PlusCircle, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  categorizeExpenseItems,
  type CategorizeExpenseItemsOutput,
} from '@/ai/flows/categorize-expense-items';
import { Input } from '@/components/ui/input';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import {
  addDoc,
  collection,
  doc,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';

type CategorizedItemWithPrice = CategorizeExpenseItemsOutput['categorizedItems'][0] & {
  price?: number | string;
};

export default function ExpensesPage() {
  const [itemsInput, setItemsInput] = useState('');
  const [categorizedItems, setCategorizedItems] = useState<
    CategorizedItemWithPrice[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const handleCategorize = async () => {
    if (!itemsInput.trim()) {
      toast({
        variant: 'destructive',
        title: 'Input required',
        description: 'Please enter some expense items to categorize.',
      });
      return;
    }
    setIsLoading(true);
    setCategorizedItems([]);
    try {
      const result = await categorizeExpenseItems({ expenseItems: itemsInput });
      setCategorizedItems(
        result.categorizedItems.map((item) => ({ ...item, price: '' }))
      );
      toast({
        title: 'Success!',
        description: 'Your items have been categorized. Please add prices.',
      });
    } catch (error) {
      console.error('Failed to categorize items:', error);
      toast({
        variant: 'destructive',
        title: 'Categorization Failed',
        description: 'Could not categorize the items. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePriceChange = (index: number, price: string) => {
    const newItems = [...categorizedItems];
    newItems[index].price = price;
    setCategorizedItems(newItems);
  };

  const handleSaveExpenses = async () => {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Not logged in',
        description: 'You must be logged in to save expenses.',
      });
      return;
    }

    const itemsToSave = categorizedItems.filter(
      (item) =>
        typeof item.price === 'number' ||
        (typeof item.price === 'string' && item.price.trim() !== '')
    );

    if (itemsToSave.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No prices entered',
        description: 'Please enter a price for at least one item.',
      });
      return;
    }

    setIsSaving(true);
    const userDocRef = doc(firestore, 'users', user.uid);
    const expensesColRef = collection(firestore, 'users', user.uid, 'expenses');
    let totalExpenseAmount = 0;

    try {
      await runTransaction(firestore, async (transaction) => {
        const userDoc = await transaction.get(userDocRef);
        if (!userDoc.exists()) {
          throw new Error('User document does not exist!');
        }

        let currentBalance = userDoc.data().bankBalance ?? 0;

        for (const item of itemsToSave) {
          const price = Number(item.price);
          if (isNaN(price) || price <= 0) {
            // This won't actually rollback the transaction but stops it from proceeding
            throw new Error(`Invalid price for "${item.item}".`);
          }

          const newExpense = {
            userId: user.uid,
            itemName: item.item,
            category: item.category,
            price: price,
            timestamp: new Date().toISOString(),
          };
          const newExpenseRef = doc(expensesColRef); // Create a new doc ref in the subcollection
          transaction.set(newExpenseRef, newExpense);
          totalExpenseAmount += price;
        }

        const newBalance = currentBalance - totalExpenseAmount;
        transaction.update(userDocRef, { bankBalance: newBalance });
      });

      toast({
        title: 'Expenses Saved!',
        description: `Your new expenses have been recorded and your balance is updated.`,
      });

      setCategorizedItems(
        categorizedItems.filter(
          (item) =>
            typeof item.price !== 'number' &&
            (typeof item.price === 'string' && item.price.trim() === '')
        )
      );

      if (
        categorizedItems.every(
          (item) =>
            typeof item.price === 'number' ||
            (typeof item.price === 'string' && item.price.trim() !== '')
        )
      ) {
        setItemsInput('');
      }
    } catch (error: any) {
      console.error('Failed to save expenses:', error);
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: error.message || 'Could not save expenses. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Smart Expense Categorization</CardTitle>
          <CardDescription>
            Enter your expense items, separated by commas or on new lines. Our
            AI will automatically categorize them for you.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="e.g., Milk, Bread, Metro ticket, Movie night..."
            className="min-h-[120px]"
            value={itemsInput}
            onChange={(e) => setItemsInput(e.target.value)}
            disabled={isLoading || isSaving}
          />
        </CardContent>
        <CardFooter>
          <Button onClick={handleCategorize} disabled={isLoading || isSaving}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Categorizing...
              </>
            ) : (
              <>
                <PlusCircle className="mr-2 h-4 w-4" />
                Categorize Items
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {categorizedItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Categorized Items</CardTitle>
            <CardDescription>
              Add a price to each item and save them as new expenses.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="w-[120px]">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categorizedItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{item.item}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{item.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={item.price}
                        onChange={(e) =>
                          handlePriceChange(index, e.target.value)
                        }
                        className="h-8"
                        disabled={isSaving}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleSaveExpenses}
              disabled={isSaving || isLoading}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Expenses
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}