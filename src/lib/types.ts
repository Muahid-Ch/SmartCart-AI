export type Expense = {
  id: string;
  userId: string;
  itemName: string;
  category: string;
  price: number;
  timestamp: string; // ISO 8601 format
};
