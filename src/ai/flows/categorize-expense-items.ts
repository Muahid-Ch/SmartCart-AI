'use server';
/**
 * @fileOverview An AI agent that categorizes expense items.
 *
 * - categorizeExpenseItems - A function that categorizes a list of expense items.
 * - CategorizeExpenseItemsInput - The input type for the categorizeExpenseItems function.
 * - CategorizeExpenseItemsOutput - The return type for the categorizeExpenseItems function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorizeExpenseItemsInputSchema = z.object({
  expenseItems: z
    .string()
    .describe("A comma separated list of expense items e.g. 'Milk, Bread, Eggs'."),
});
export type CategorizeExpenseItemsInput = z.infer<
  typeof CategorizeExpenseItemsInputSchema
>;

const CategorizeExpenseItemsOutputSchema = z.object({
  categorizedItems: z
    .array(
      z.object({
        item: z.string().describe('The name of the expense item.'),
        category: z.string().describe('The category of the expense item.'),
      })
    )
    .describe('A list of expense items with their categories.'),
});
export type CategorizeExpenseItemsOutput = z.infer<
  typeof CategorizeExpenseItemsOutputSchema
>;

export async function categorizeExpenseItems(
  input: CategorizeExpenseItemsInput
): Promise<CategorizeExpenseItemsOutput> {
  return categorizeExpenseItemsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'categorizeExpenseItemsPrompt',
  input: {schema: CategorizeExpenseItemsInputSchema},
  output: {schema: CategorizeExpenseItemsOutputSchema},
  prompt: `You are an expert personal finance assistant. Your task is to categorize a list of expense items into relevant categories.  The categories should be one of the following options: Groceries, Transportation, Entertainment, Utilities, Eating Out, Clothing, Health, Personal Care, Education, Travel, Home Improvement, Other.

  Respond in a valid JSON format.

  Expense Items: {{{expenseItems}}}
  `,
});

const categorizeExpenseItemsFlow = ai.defineFlow(
  {
    name: 'categorizeExpenseItemsFlow',
    inputSchema: CategorizeExpenseItemsInputSchema,
    outputSchema: CategorizeExpenseItemsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
