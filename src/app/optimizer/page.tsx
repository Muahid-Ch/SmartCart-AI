'use client';

import { useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { suggestCheaperAlternatives } from '@/ai/flows/suggest-cheaper-alternatives';

export default function OptimizerPage() {
  const [itemsInput, setItemsInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleOptimize = async () => {
    if (!itemsInput.trim()) {
      toast({
        variant: 'destructive',
        title: 'Input required',
        description: 'Please enter some grocery items to optimize.',
      });
      return;
    }
    setIsLoading(true);
    setSuggestions([]);
    try {
      const items = itemsInput.split(/[,\\n]/).map(item => item.trim()).filter(Boolean);
      const result = await suggestCheaperAlternatives({ items });
      setSuggestions(result.suggestions);
      toast({
        title: 'Optimization Complete!',
        description: 'Here are some suggestions to save money.',
      });
    } catch (error) {
      console.error('Failed to get suggestions:', error);
      toast({
        variant: 'destructive',
        title: 'Optimization Failed',
        description: 'Could not get suggestions. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Smart Grocery Optimizer</CardTitle>
          <CardDescription>
            Enter your grocery list and our AI will suggest cheaper brand or bulk-buy alternatives to help you save.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="e.g., Nestlé Milk, Head & Shoulders Shampoo, 500g Basmati Rice..."
            className="min-h-[120px]"
            value={itemsInput}
            onChange={(e) => setItemsInput(e.target.value)}
            disabled={isLoading}
          />
        </CardContent>
        <CardFooter>
          <Button onClick={handleOptimize} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Finding Savings...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Optimize My Cart
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>AI Savings Suggestions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-2 pl-5 text-sm text-foreground">
              {suggestions.map((suggestion, index) => (
                <li key={index}>{suggestion}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
