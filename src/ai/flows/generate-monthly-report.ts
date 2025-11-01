
'use server';

/**
 * @fileOverview A flow to generate a monthly HTML report summarizing user spending, optimization insights, and suggested replacements.
 *
 * - generateMonthlyReport - A function that generates the monthly report.
 * - GenerateMonthlyReportInput - The input type for the generateMonthlyReport function.
 * - GenerateMonthlyReportOutput - The return type for the generateMonthlyReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { Expense } from '@/lib/types';

const expenseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  itemName: z.string(),
  category: z.string(),
  price: z.number(),
  timestamp: z.string(),
});

const GenerateMonthlyReportInputSchema = z.object({
  userId: z.string().describe('The ID of the user for whom to generate the report.'),
  month: z.string().describe('The month for which to generate the report (YYYY-MM).'),
  expenses: z.array(expenseSchema).describe('An array of expense objects for the month.'),
});
export type GenerateMonthlyReportInput = z.infer<typeof GenerateMonthlyReportInputSchema>;

const GenerateMonthlyReportOutputSchema = z.object({
  report: z.string().describe('The generated HTML report as a string.'),
});
export type GenerateMonthlyReportOutput = z.infer<typeof GenerateMonthlyReportOutputSchema>;

export async function generateMonthlyReport(input: GenerateMonthlyReportInput): Promise<GenerateMonthlyReportOutput> {
  return generateMonthlyReportFlow(input);
}

const generateReportPrompt = ai.definePrompt({
  name: 'generateReportPrompt',
  input: {schema: GenerateMonthlyReportInputSchema},
  output: {schema: GenerateMonthlyReportOutputSchema},
  prompt: `You are an AI assistant tasked with generating a comprehensive monthly spending report for users.

  The report should be a single HTML file with embedded CSS for styling. It must be visually appealing and easy to read.

  The report should include the following sections:
  1.  **Executive Summary**: A brief overview of the user's spending for the month. Include total spending and key insights.
  2.  **Spending Analysis**: Detailed breakdown of spending by category (e.g., groceries, transportation, entertainment). Use a table to show expenses for each category.
  3.  **Optimization Insights**: Provide recommendations for reducing spending in specific categories. Be specific and suggest alternative products or habits.
  4.  **Savings Summary**: An estimate of the total potential savings based on the suggested optimizations.

  Use the following data to create the report:
  - User ID: {{{userId}}}
  - Month: {{{month}}}
  - Expenses:
  {{#each expenses}}
  - {{itemName}}: $\{{price}} ({{category}}) on {{timestamp}}
  {{/each}}

  Ensure the final output is a single, complete HTML document string, starting with <!DOCTYPE html> and ending with </html>.
  `,
});

const generateMonthlyReportFlow = ai.defineFlow(
  {
    name: 'generateMonthlyReportFlow',
    inputSchema: GenerateMonthlyReportInputSchema,
    outputSchema: GenerateMonthlyReportOutputSchema,
  },
  async input => {
    const {output} = await generateReportPrompt(input);
    return output!;
  }
);
