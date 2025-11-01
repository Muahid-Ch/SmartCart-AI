'use server';

/**
 * @fileOverview Forecasts the user's next month's grocery budget based on historical spending data.
 *
 * - forecastNextMonthsBudget - A function that forecasts the budget.
 * - ForecastNextMonthsBudgetInput - The input type for the forecastNextMonthsBudget function.
 * - ForecastNextMonthsBudgetOutput - The return type for the forecastNextMonthsBudget function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ForecastNextMonthsBudgetInputSchema = z.array(
  z.object({
    timestamp: z.string().describe('The timestamp of the expense.'),
    category: z.string().describe('The category of the expense.'),
    price: z.number().describe('The price of the expense.'),
  })
).describe('Historical spending data consisting of timestamp, category, and price.');

export type ForecastNextMonthsBudgetInput = z.infer<typeof ForecastNextMonthsBudgetInputSchema>;

const ForecastNextMonthsBudgetOutputSchema = z.object({
  forecastedBudget: z.number().describe('The forecasted grocery budget for the next month.'),
  highSpendCategories: z.array(
    z.object({
      category: z.string().describe('The category with high spending.'),
      percentage: z.number().describe('The percentage of total spending in this category.'),
    })
  ).describe('Categories where the user spends the most, with their percentage of total spending.'),
  recommendations: z.string().describe('Recommendations to reduce spending in high-spend categories.'),
});

export type ForecastNextMonthsBudgetOutput = z.infer<typeof ForecastNextMonthsBudgetOutputSchema>;

export async function forecastNextMonthsBudget(
  input: ForecastNextMonthsBudgetInput
): Promise<ForecastNextMonthsBudgetOutput> {
  return forecastNextMonthsBudgetFlow(input);
}

const prompt = ai.definePrompt({
  name: 'forecastNextMonthsBudgetPrompt',
  input: {schema: ForecastNextMonthsBudgetInputSchema},
  output: {schema: ForecastNextMonthsBudgetOutputSchema},
  prompt: `You are an AI assistant that forecasts the user's next month's grocery budget based on their historical spending data.

Analyze the following historical spending data to predict the next month's grocery budget. Identify high-spend categories and provide recommendations for reducing spending.

Historical Spending Data:
{{#each this}}
- Timestamp: {{timestamp}}, Category: {{category}}, Price: {{price}}
{{/each}}

Output the forecasted budget, high-spend categories, and recommendations in the following JSON format:
\`json
{ "forecastedBudget": number, "highSpendCategories": [{ "category": string, "percentage": number }], "recommendations": string }
\`
`,
});

const forecastNextMonthsBudgetFlow = ai.defineFlow(
  {
    name: 'forecastNextMonthsBudgetFlow',
    inputSchema: ForecastNextMonthsBudgetInputSchema,
    outputSchema: ForecastNextMonthsBudgetOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
