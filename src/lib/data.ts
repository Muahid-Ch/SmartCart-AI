import type { Expense } from './types';

export const mockExpenses: Expense[] = [
  { id: '1', item: 'Organic Milk', category: 'Dairy', price: 4.5, date: '2024-07-15' },
  { id: '2', item: 'Sourdough Bread', category: 'Bakery', price: 3.2, date: '2024-07-15' },
  { id: '3', item: 'Chicken Breast', category: 'Meat', price: 12.0, date: '2024-07-14' },
  { id: '4', item: 'Avocado', category: 'Produce', price: 1.8, date: '2024-07-14' },
  { id: '5', item: 'Brown Rice', category: 'Grains', price: 5.0, date: '2024-07-13' },
  { id: '6', item: 'Salmon Fillet', category: 'Seafood', price: 15.5, date: '2024-07-12' },
  { id: '7', item: 'Greek Yogurt', category: 'Dairy', price: 2.5, date: '2024-07-12' },
  { id: '8', item: 'Almond Butter', category: 'Pantry', price: 8.0, date: '2024-07-11' },
  { id: '9', item: 'White Sugar', category: 'Pantry', price: 3.0, date: '2024-07-10' },
  { id: '10', item: 'Potato Chips', category: 'Snacks', price: 2.8, date: '2024-07-10' },
  { id: '11', item: 'Soda 12-pack', category: 'Beverages', price: 9.0, date: '2024-07-09' },
  { id: '12', item: 'Apples', category: 'Produce', price: 3.5, date: '2024-07-08' },
];

export const mockSpendingData = {
  currentMonth: 350.75,
  lastMonth: 420.50,
  forecastedBudget: 380.00,
  potentialSavings: 45.20,
};

export const mockChartData = [
  { date: 'Jan', spending: 280 },
  { date: 'Feb', spending: 320 },
  { date: 'Mar', spending: 290 },
  { date: 'Apr', spending: 350 },
  { date: 'May', spending: 400 },
  { date: 'Jun', spending: 380 },
  { date: 'Jul', spending: 350.75 },
];
