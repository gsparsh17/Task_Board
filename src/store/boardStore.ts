import { create, StateCreator } from 'zustand';
import { persist } from 'zustand/middleware'; // For local storage persistence [cite: 6]
import { BoardData, ColumnData, CardData, Priority } from '../types';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs
import { devtools } from 'zustand/middleware';

interface BoardState {
  boards: Record<string, BoardData>;
  columns: Record<string, ColumnData>;
  cards: Record<string, CardData>;
  boardOrder: string[];
  columnOrders: Record<string, string[]>; // boardId -> columnId[]
  cardOrders: Record<string, string[]>;   // columnId -> cardId[]

  // Board actions
  addBoard: (name: string, description?: string) => void;
  getBoardDetails: (boardId: string) => { board: BoardData; columns: ColumnData[]; cards: CardData[] } | undefined;

  // Column actions
  addColumn: (boardId: string, title: string) => void;
  editColumn: (columnId: string, newTitle: string) => void;
  deleteColumn: (columnId: string, boardId: string) => void;

  // Card actions
  addCard: (columnId: string, title: string, description: string, createdBy: string, priority: Priority, dueDate: string, assignedTo: string) => void;
  editCard: (cardId: string, updates: Partial<Omit<CardData, 'id' | 'columnId'>>) => void;
  deleteCard: (cardId: string, columnId: string) => void;
  moveCard: (cardId: string, sourceColumnId: string, destinationColumnId: string, destinationIndex: number) => void;
  reorderCardInColumn: (cardId: string, columnId: string, newIndex: number) => void;
}

type BoardStatePersist = StateCreator<
  BoardState,
  [['zustand/persist', unknown]],
  [],
  BoardState
>;

export const useBoardStore = create<BoardState>()(
  devtools(persist( // Persist state to local storage [cite: 6]
    (set, get) => ({
      boards: {},
      columns: {},
      cards: {},
      boardOrder: [],
      columnOrders: {},
      cardOrders: {},

      addBoard: (name, description) => {
  const newBoardId = uuidv4();
  set((state) => {
    // Only update if the board name doesn't already exist
    if (Object.values(state.boards).some(b => b.name === name)) {
      return state;
    }
    
    const newBoard: BoardData = { 
      id: newBoardId, 
      name, 
      description, 
      createdAt: new Date().toISOString() 
    };
    
    return {
      boards: { ...state.boards, [newBoardId]: newBoard },
      boardOrder: [...state.boardOrder, newBoardId],
      columnOrders: { ...state.columnOrders, [newBoardId]: [] },
    };
  });
},

      getBoardDetails: (boardId) => {
        const board = get().boards[boardId];
        if (!board) return undefined;

        const columnIds = get().columnOrders[boardId] || [];
        const columnsForBoard = columnIds.map(colId => get().columns[colId]).filter(Boolean);

        let cardsForBoard: CardData[] = [];
        columnsForBoard.forEach(col => {
            const cardIds = get().cardOrders[col.id] || [];
            cardsForBoard = cardsForBoard.concat(cardIds.map(cardId => get().cards[cardId]).filter(Boolean));
        });

        return { board, columns: columnsForBoard, cards: cardsForBoard };
      },

      addColumn: (boardId, title) => {
        if (!get().boards[boardId]) return; // Ensure board exists
        const newColumnId = uuidv4();
        const newColumn: ColumnData = { id: newColumnId, title, boardId };
        set((state) => ({
          columns: { ...state.columns, [newColumnId]: newColumn },
          columnOrders: {
            ...state.columnOrders,
            [boardId]: [...(state.columnOrders[boardId] || []), newColumnId],
          },
          cardOrders: { ...state.cardOrders, [newColumnId]: [] },
        }));
      },
      
      editColumn: (columnId, newTitle) => {
        set(state => ({
          columns: {
            ...state.columns,
            [columnId]: { ...state.columns[columnId], title: newTitle },
          }
        }));
      },

      deleteColumn: (columnId, boardId) => {
        set(state => {
          const newColumns = { ...state.columns };
          delete newColumns[columnId];
          
          const newColumnOrders = { ...state.columnOrders };
          if (newColumnOrders[boardId]) {
            newColumnOrders[boardId] = newColumnOrders[boardId].filter(id => id !== columnId);
          }
          
          // Also delete cards within this column
          const newCards = { ...state.cards };
          const newCardOrders = { ...state.cardOrders };
          (state.cardOrders[columnId] || []).forEach(cardId => {
            delete newCards[cardId];
          });
          delete newCardOrders[columnId];

          return {
            columns: newColumns,
            columnOrders: newColumnOrders,
            cards: newCards,
            cardOrders: newCardOrders,
          };
        });
      },

      addCard: (columnId, title, description, createdBy, priority, dueDate, assignedTo) => {
        if (!get().columns[columnId]) return; // Ensure column exists
        const newCardId = uuidv4();
        const newCard: CardData = { id: newCardId, columnId, title, description, createdBy, priority, dueDate, assignedTo };
        set((state) => ({
          cards: { ...state.cards, [newCardId]: newCard },
          cardOrders: {
            ...state.cardOrders,
            [columnId]: [...(state.cardOrders[columnId] || []), newCardId],
          },
        }));
      },

      editCard: (cardId, updates) => {
        set(state => {
          if (!state.cards[cardId]) return {};
          return {
            cards: {
              ...state.cards,
              [cardId]: { ...state.cards[cardId], ...updates },
            }
          };
        });
      },

      deleteCard: (cardId, columnId) => {
        set(state => {
          const newCards = { ...state.cards };
          delete newCards[cardId];

          const newCardOrders = { ...state.cardOrders };
          if (newCardOrders[columnId]) {
            newCardOrders[columnId] = newCardOrders[columnId].filter(id => id !== cardId);
          }
          return { cards: newCards, cardOrders: newCardOrders };
        });
      },

      moveCard: (cardId, sourceColumnId, destinationColumnId, destinationIndex) => {
        set(state => {
          const card = state.cards[cardId];
          if (!card) return {};

          const newCardOrders = { ...state.cardOrders };
          
          // Remove from source column
          if (newCardOrders[sourceColumnId]) {
            newCardOrders[sourceColumnId] = newCardOrders[sourceColumnId].filter(id => id !== cardId);
          }

          // Add to destination column
          if (!newCardOrders[destinationColumnId]) {
            newCardOrders[destinationColumnId] = [];
          }
          const destCards = [...newCardOrders[destinationColumnId]];
          destCards.splice(destinationIndex, 0, cardId);
          newCardOrders[destinationColumnId] = destCards;

          return {
            cards: { ...state.cards, [cardId]: { ...card, columnId: destinationColumnId } },
            cardOrders: newCardOrders,
          };
        });
      },
      
      reorderCardInColumn: (cardId, columnId, newIndex) => {
        set(state => {
          if (!state.cardOrders[columnId]) return {};
          
          const orderedCards = [...state.cardOrders[columnId]];
          const oldIndex = orderedCards.indexOf(cardId);
          if (oldIndex === -1) return {};

          orderedCards.splice(oldIndex, 1); // Remove card from old position
          orderedCards.splice(newIndex, 0, cardId); // Insert card at new position
          
          return {
            cardOrders: {
              ...state.cardOrders,
              [columnId]: orderedCards,
            }
          };
        });
      }
    }),
    {
      name: 'task-board-storage', // Name for local storage item [cite: 6]
    }
  )
)
);