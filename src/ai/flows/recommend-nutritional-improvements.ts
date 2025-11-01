'use server';
/**
 * @fileOverview AI-powered nutritional improvement recommendations for grocery lists.
 *
 * This file defines a Genkit flow that suggests healthier alternatives to items in a user's grocery list.
 * - recommendNutritionalImprovements - The function to trigger the nutritional improvement process.
 * - NutritionalImprovementsInput - The input type for the recommendNutritionalImprovements function.
 * - NutritionalImprovementsOutput - The output type for the recommendNutritionalImprovements function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NutritionalImprovementsInputSchema = z.object({
  groceryList: z.string().describe('A comma-separated list of grocery items.'),
});
export type NutritionalImprovementsInput = z.infer<typeof NutritionalImprovementsInputSchema>;

const NutritionalImprovementsOutputSchema = z.object({
  recommendations: z.array(
    z.object({
      item: z.string().describe('The original grocery item.'),
      alternative: z.string().describe('A healthier alternative to the item.'),
      reason: z.string().describe('The reasoning behind the recommendation.'),
    })
  ).describe('A list of nutritional improvement recommendations.'),
});
export type NutritionalImprovementsOutput = z.infer<typeof NutritionalImprovementsOutputSchema>;

export async function recommendNutritionalImprovements(
  input: NutritionalImprovementsInput
): Promise<NutritionalImprovementsOutput> {
  return recommendNutritionalImprovementsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'nutritionalImprovementsPrompt',
  input: {schema: NutritionalImprovementsInputSchema},
  output: {schema: NutritionalImprovementsOutputSchema},
  prompt: `You are a nutritional expert. Review the following grocery list and suggest healthier alternatives for some items, along with a reason for each recommendation.

Grocery List: {{{groceryList}}}

Format your response as a JSON array of objects with the keys "item", "alternative", and "reason".`,
});

const recommendNutritionalImprovementsFlow = ai.defineFlow(
  {
    name: 'recommendNutritionalImprovementsFlow',
    inputSchema: NutritionalImprovementsInputSchema,
    outputSchema: NutritionalImprovementsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
