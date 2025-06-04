import { create, StateCreator } from 'zustand';
import { persist } from 'zustand/middleware'; 
import { BoardData, ColumnData, CardData, Priority } from '../types';
import { v4 as uuidv4 } from 'uuid'; 
import { devtools } from 'zustand/middleware';

interface BoardState {
  boards: Record<string, BoardData>;
  columns: Record<string, ColumnData>;
  cards: Record<string, CardData>;
  boardOrder: string[];
  columnOrders: Record<string, string[]>; 
  cardOrders: Record<string, string[]>;  


  addBoard: (name: string, description?: string) => void;
  getBoardDetails: (boardId: string) => { board: BoardData; columns: ColumnData[]; cards: CardData[] } | undefined;


  addColumn: (boardId: string, title: string) => void;
  editColumn: (columnId: string, newTitle: string) => void;
  deleteColumn: (columnId: string, boardId: string) => void;

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
  devtools(persist( 
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
        if (!get().boards[boardId]) return;
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
        if (!get().columns[columnId]) return; 
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
          
          if (newCardOrders[sourceColumnId]) {
            newCardOrders[sourceColumnId] = newCardOrders[sourceColumnId].filter(id => id !== cardId);
          }

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

          orderedCards.splice(oldIndex, 1); 
          orderedCards.splice(newIndex, 0, cardId); 
          
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
      name: 'task-board-storage', 
    }
  )
)
);