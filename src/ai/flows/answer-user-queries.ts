'use server';

/**
 * @fileOverview This file defines a Genkit flow for answering user queries about their spending habits.
 *
 * The flow uses a language model to understand the user's question and then retrieves
 * relevant information from the database or external APIs to answer the question.
 *
 * @example
 * // Example usage:
 * const answer = await answerUserQueries("How much will I spend next month?");
 *
 * @interface AnswerUserQueriesInput - The input type for the answerUserQueries function.
 * @interface AnswerUserQueriesOutput - The output type for the answerUserQueries function.
 * @function answerUserQueries - The function that handles the user query and returns the answer.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerUserQueriesInputSchema = z.object({
  query: z.string().describe('The user query about their spending habits.'),
});

export type AnswerUserQueriesInput = z.infer<typeof AnswerUserQueriesInputSchema>;

const AnswerUserQueriesOutputSchema = z.object({
  answer: z.string().describe('The answer to the user query.'),
});

export type AnswerUserQueriesOutput = z.infer<typeof AnswerUserQueriesOutputSchema>;

export async function answerUserQueries(input: AnswerUserQueriesInput): Promise<AnswerUserQueriesOutput> {
  return answerUserQueriesFlow(input);
}

const answerUserQueriesPrompt = ai.definePrompt({
  name: 'answerUserQueriesPrompt',
  input: {schema: AnswerUserQueriesInputSchema},
  output: {schema: AnswerUserQueriesOutputSchema},
  prompt: `You are a personal finance assistant. Your job is to answer questions about the user\'s spending habits.

  Here is the user\'s question:
  {{query}}
  `,
});

const answerUserQueriesFlow = ai.defineFlow(
  {
    name: 'answerUserQueriesFlow',
    inputSchema: AnswerUserQueriesInputSchema,
    outputSchema: AnswerUserQueriesOutputSchema,
  },
  async input => {
    const {output} = await answerUserQueriesPrompt(input);
    return output!;
  }
);
