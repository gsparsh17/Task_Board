import React, { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useBoardStore } from '../store/boardStore';
import { ColumnData, CardData, Priority } from '../types';
import { FiEdit2, FiTrash2, FiPlus, FiArrowLeft } from 'react-icons/fi';
import { MdDragIndicator } from 'react-icons/md';

// Types for our card form
interface CardFormData {
  title: string;
  description: string;
  priority: Priority;
  dueDate: string;
  assignedTo: string;
}

// Column Component
const ColumnDisplay = React.memo(({ 
  column, 
  cards,
  onAddCard,
  onEditColumn,
  onDeleteColumn,
  onEditCard,
  onDeleteCard
}: {
  column: ColumnData;
  cards: CardData[];
  onAddCard: (card: CardFormData) => void;
  onEditColumn: (newTitle: string) => void;
  onDeleteColumn: () => void;
  onEditCard: (cardId: string, updates: Partial<CardData>) => void;
  onDeleteCard: (cardId: string) => void;
}) => {
  const [showAddCard, setShowAddCard] = useState(false);
  const [showEditColumn, setShowEditColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState(column.title);
  const [cardForm, setCardForm] = useState<CardFormData>({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: new Date().toISOString().split('T')[0],
    assignedTo: ''
  });

  const handleAddCard = () => {
    if (cardForm.title.trim()) {
      onAddCard(cardForm);
      setCardForm({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: new Date().toISOString().split('T')[0],
        assignedTo: ''
      });
      setShowAddCard(false);
    }
  };

  const handleEditColumn = () => {
    if (newColumnTitle.trim() && newColumnTitle !== column.title) {
      onEditColumn(newColumnTitle);
      setShowEditColumn(false);
    }
  };

  return (
    <div className="bg-slate-50 p-4 rounded-lg shadow-md w-80 flex-shrink-0 mr-4 border border-slate-200">
      <div className="flex justify-between items-center mb-3">
        {showEditColumn ? (
          <div className="flex items-center w-full">
            <input
              type="text"
              value={newColumnTitle}
              onChange={(e) => setNewColumnTitle(e.target.value)}
              className="flex-1 p-2 border rounded mr-2"
              autoFocus
            />
            <button 
              onClick={handleEditColumn}
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
            >
              Save
            </button>
          </div>
        ) : (
          <>
            <h3 className="font-semibold text-lg text-slate-800">{column.title}</h3>
            <div className="flex space-x-2">
              <button 
                onClick={() => setShowEditColumn(true)}
                className="text-slate-500 hover:text-blue-500"
                aria-label="Edit column"
              >
                <FiEdit2 size={16} />
              </button>
              <button 
                onClick={onDeleteColumn}
                className="text-slate-500 hover:text-red-500"
                aria-label="Delete column"
              >
                <FiTrash2 size={16} />
              </button>
            </div>
          </>
        )}
      </div>

      <Droppable droppableId={column.id} type="CARD">
        {(provided: import('react-beautiful-dnd').DroppableProvided) => (
          <div 
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="space-y-3 min-h-[50px]"
          >
            {cards.map((card, index) => (
              <Draggable key={card.id} draggableId={card.id} index={index}>
                {(provided: import('react-beautiful-dnd').DraggableProvided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start">
                      <MdDragIndicator className="text-slate-400 mr-2 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-800">{card.title}</h4>
                        {card.description && (
                          <p className="text-sm text-slate-600 mt-1">{card.description}</p>
                        )}
                        <div className="flex items-center mt-2 space-x-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            card.priority === 'high' ? 'bg-red-100 text-red-800' :
                            card.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {card.priority}
                          </span>
                          <span className="text-xs text-slate-500">
                            Due: {new Date(card.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                        {card.assignedTo && (
                          <div className="mt-2 text-xs text-slate-500">
                            Assigned to: {card.assignedTo}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {showAddCard ? (
        <div className="mt-3 p-3 bg-slate-100 rounded-lg">
          <input
            type="text"
            placeholder="Card title"
            value={cardForm.title}
            onChange={(e) => setCardForm({...cardForm, title: e.target.value})}
            className="w-full p-2 border rounded mb-2"
            autoFocus
          />
          <textarea
            placeholder="Description"
            value={cardForm.description}
            onChange={(e) => setCardForm({...cardForm, description: e.target.value})}
            className="w-full p-2 border rounded mb-2 text-sm"
            rows={3}
          />
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Priority</label>
              <select
                value={cardForm.priority}
                onChange={(e) => setCardForm({...cardForm, priority: e.target.value as Priority})}
                className="w-full p-2 border rounded text-sm"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Due Date</label>
              <input
                type="date"
                value={cardForm.dueDate}
                onChange={(e) => setCardForm({...cardForm, dueDate: e.target.value})}
                className="w-full p-2 border rounded text-sm"
              />
            </div>
          </div>
          <input
            type="text"
            placeholder="Assign to"
            value={cardForm.assignedTo}
            onChange={(e) => setCardForm({...cardForm, assignedTo: e.target.value})}
            className="w-full p-2 border rounded mb-2 text-sm"
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setShowAddCard(false)}
              className="px-3 py-1 text-sm text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={handleAddCard}
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
            >
              Add Card
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddCard(true)}
          className="mt-3 w-full flex items-center justify-center p-2 text-sm text-slate-500 hover:text-blue-500 hover:bg-slate-100 rounded"
        >
          <FiPlus className="mr-1" /> Add a card
        </button>
      )}
    </div>
  );
});

const BoardDetailPage: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  
  // Get store data and actions
  const {
    getBoardDetails,
    columns,
    columnOrders,
    cards,
    cardOrders,
    addColumn,
    editColumn,
    deleteColumn,
    addCard,
    editCard,
    deleteCard,
    moveCard,
    reorderCardInColumn
  } = useBoardStore();

  // Memoize board details and derived data
  const boardDetails = useMemo(
    () => boardId ? getBoardDetails(boardId) : undefined,
    [boardId, getBoardDetails]
  );

  const columnsWithCards = useMemo(() => {
    if (!boardId) return [];
    const order = columnOrders[boardId] || [];
    return order.map(colId => {
      const column = columns[colId];
      if (!column) return null;
      
      const columnCards = (cardOrders[colId] || [])
        .map(cardId => cards[cardId])
        .filter(Boolean) as CardData[];
      
      return { column, cards: columnCards };
    }).filter(Boolean) as { column: ColumnData; cards: CardData[] }[];
  }, [boardId, columns, columnOrders, cards, cardOrders]);

  // Local state for adding columns
  const [showAddColumnForm, setShowAddColumnForm] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');

  // Handle drag and drop
  const handleDragEnd = useCallback((result: any) => {
    const { source, destination, draggableId } = result;
    
    if (!destination) return;
    
    if (source.droppableId === destination.droppableId) {
      // Reorder within same column
      reorderCardInColumn(
        draggableId,
        source.droppableId,
        destination.index
      );
    } else {
      // Move to different column
      moveCard(
        draggableId,
        source.droppableId,
        destination.droppableId,
        destination.index
      );
    }
  }, [moveCard, reorderCardInColumn]);

  if (!boardId || !boardDetails) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-600 mb-4">Board not found</p>
        <button 
          onClick={() => navigate('/boards')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go to Boards
        </button>
      </div>
    );
  }

  const handleAddColumn = () => {
    if (newColumnTitle.trim() && boardId) {
      addColumn(boardId, newColumnTitle.trim());
      setNewColumnTitle('');
      setShowAddColumnForm(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-500 to-violet-500 p-6">
      <div className="max-w-7xl mx-auto">
        <button 
          onClick={() => navigate('/boards')}
          className="flex items-center bg-white hover:from-violet-600 hover:to-teal-600 text-clip font-semibold py-2 px-6 rounded-xl shadow-md transition-all"
        >
          <FiArrowLeft className="mr-2" /> Back to Boards
        </button>
        
        <div className="flex items-center mt-12 justify-between mb-12">
          <h1 className="text-5xl font-extrabold text-amber-300">{boardDetails.board.name}</h1>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex overflow-x-auto pb-6">
            {columnsWithCards.map(({ column, cards }) => (
              <ColumnDisplay
                key={column.id}
                column={column}
                cards={cards}
                onAddCard={(cardData) => addCard(
                  column.id,
                  cardData.title,
                  cardData.description,
                  "Current User", // In a real app, use actual user
                  cardData.priority,
                  cardData.dueDate,
                  cardData.assignedTo
                )}
                onEditColumn={(newTitle) => editColumn(column.id, newTitle)}
                onDeleteColumn={() => deleteColumn(column.id, column.boardId)}
                onEditCard={editCard}
                onDeleteCard={(cardId) => deleteCard(cardId, column.id)}
              />
            ))}

            <div className="flex-shrink-0 w-80">
              {showAddColumnForm ? (
                <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                  <input
                    type="text"
                    value={newColumnTitle}
                    onChange={(e) => setNewColumnTitle(e.target.value)}
                    placeholder="Column title (e.g., 'To Do')"
                    className="w-full p-3 border rounded mb-3"
                    autoFocus
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setShowAddColumnForm(false)}
                      className="px-4 py-2 text-slate-600 hover:text-slate-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddColumn}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Add Column
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddColumnForm(true)}
                  className="w-full flex items-center justify-center p-3 text-slate-300 hover:text-blue-500 hover:bg-slate-100 rounded-lg border-2 border-dashed border-slate-300"
                >
                  <FiPlus className="mr-2" /> Add another column
                </button>
              )}
            </div>
          </div>
        </DragDropContext>
      </div>
    </div>
  );
};

export default BoardDetailPage;