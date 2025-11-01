'use server';

/**
 * @fileOverview This file defines a Genkit flow to suggest cheaper alternatives for grocery purchases.
 *
 * - suggestCheaperAlternatives - A function that suggests cheaper alternatives for given grocery items.
 * - SuggestCheaperAlternativesInput - The input type for the suggestCheaperAlternatives function.
 * - SuggestCheaperAlternativesOutput - The return type for the suggestCheaperAlternatives function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestCheaperAlternativesInputSchema = z.object({
  items: z
    .array(z.string())
    .describe('An array of grocery items for which to find cheaper alternatives.'),
});
export type SuggestCheaperAlternativesInput = z.infer<
  typeof SuggestCheaperAlternativesInputSchema
>;

const SuggestCheaperAlternativesOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('An array of suggestions for cheaper alternatives.'),
});
export type SuggestCheaperAlternativesOutput = z.infer<
  typeof SuggestCheaperAlternativesOutputSchema
>;

export async function suggestCheaperAlternatives(
  input: SuggestCheaperAlternativesInput
): Promise<SuggestCheaperAlternativesOutput> {
  return suggestCheaperAlternativesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestCheaperAlternativesPrompt',
  input: {schema: SuggestCheaperAlternativesInputSchema},
  output: {schema: SuggestCheaperAlternativesOutputSchema},
  prompt: `You are a personal shopping assistant. A user will provide a list of items they wish to purchase.

  Suggest cheaper alternatives to the user's items.

  Items: {{{items}}}
  `,
});

const suggestCheaperAlternativesFlow = ai.defineFlow(
  {
    name: 'suggestCheaperAlternativesFlow',
    inputSchema: SuggestCheaperAlternativesInputSchema,
    outputSchema: SuggestCheaperAlternativesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
