import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-cheaper-alternatives.ts';
import '@/ai/flows/generate-monthly-report.ts';
import '@/ai/flows/categorize-expense-items.ts';
import '@/ai/flows/forecast-next-months-budget.ts';
import '@/ai/flows/answer-user-queries.ts';
import '@/ai/flows/recommend-nutritional-improvements.ts';