'use client';

import { useState } from 'react';
import { Loader2, HeartPulse } from 'lucide-react';
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
import {
  recommendNutritionalImprovements,
  type NutritionalImprovementsOutput,
} from '@/ai/flows/recommend-nutritional-improvements';

type Recommendation = NutritionalImprovementsOutput['recommendations'][0];

export default function HealthPage() {
  const [itemsInput, setItemsInput] = useState('');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGetRecommendations = async () => {
    if (!itemsInput.trim()) {
      toast({
        variant: 'destructive',
        title: 'Input required',
        description: 'Please enter a grocery list to get health insights.',
      });
      return;
    }
    setIsLoading(true);
    setRecommendations([]);
    try {
      const result = await recommendNutritionalImprovements({ groceryList: itemsInput });
      setRecommendations(result.recommendations);
      toast({
        title: 'Health Insights Ready!',
        description: 'Check out these healthier alternatives.',
      });
    } catch (error) {
      console.error('Failed to get recommendations:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to Get Insights',
        description: 'Could not get recommendations. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Health & Sustainability Insights</CardTitle>
          <CardDescription>
            Enter your grocery list, and our AI will recommend nutritional improvements and healthier alternatives.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="e.g., White bread, Potato chips, Sugary soda..."
            className="min-h-[120px]"
            value={itemsInput}
            onChange={(e) => setItemsInput(e.target.value)}
            disabled={isLoading}
          />
        </CardContent>
        <CardFooter>
          <Button onClick={handleGetRecommendations} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <HeartPulse className="mr-2 h-4 w-4" />
                Get Health Insights
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>AI Health Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendations.map((rec, index) => (
              <div key={index} className="rounded-lg border bg-card p-4">
                <p>
                  Instead of <span className="font-semibold text-destructive">{rec.item}</span>,
                  try <span className="font-semibold text-primary">{rec.alternative}</span>.
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Reason:</span> {rec.reason}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
