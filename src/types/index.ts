export type Priority = 'high' | 'medium' | 'low';

export interface CardData {
  id: string;
  title: string;
  description: string;
  createdBy: string; // User's name or ID
  priority: Priority;
  dueDate: string; // Consider using Date type and formatting for display
  assignedTo: string; // User's name or ID
  columnId: string; // To link card to a column
}

export interface ColumnData {
  id: string;
  title: string;
  boardId: string; // To link column to a board
  // Card order is maintained by their order in the array
}

export interface BoardData {
  id:string;
  name: string;
  description?: string; // Or other necessary info for the table view
  createdAt: string; // Or Date
}

// For state, you might want to store cards and columns separately for easier lookup
// and then combine them as needed or store them nested.
// Storing them normalized can be more efficient for updates.

export interface AppState {
  boards: Record<string, BoardData>;
  columns: Record<string, ColumnData>;
  cards: Record<string, CardData>;
  // To maintain order of items in lists
  boardOrder: string[];
  columnOrders: Record<string, string[]>; // boardId -> columnId[]
  cardOrders: Record<string, string[]>; // columnId -> cardId[]
}