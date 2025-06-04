import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBoardStore } from '../store/boardStore';

const BoardViewPage: React.FC = () => {
  const boardOrder = useBoardStore((state) => state.boardOrder);
  const boardsMap = useBoardStore((state) => state.boards);
  const boards = useMemo(() => boardOrder.map(id => boardsMap[id]), [boardOrder, boardsMap]);

  const addBoard = useBoardStore((state) => state.addBoard);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');

  const handleCreateBoard = useCallback(() => {
    if (newBoardName.trim()) {
      addBoard(newBoardName.trim());
      setNewBoardName('');
      setIsModalOpen(false);
    }
  }, [newBoardName, addBoard]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-violet-500 py-10 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-20">
          <h1 className="md:text-5xl text-4xl font-extrabold drop-shadow-xl text-amber-300 brightness-125">My Boards</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-amber-300 brightness-125 hover:from-violet-600 text-sm md:text-lg hover:to-teal-600 text-clip font-semibold py-2 px-6 rounded-xl shadow-md transition-all"
          >
            + Create New Board
          </button>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md animate-fade-in border border-teal-100">
              <h3 className="text-2xl font-bold text-violet-700 mb-4">Create New Board</h3>
              <input
                type="text"
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                placeholder="Enter board name"
                className="w-full p-3 border border-teal-300 rounded-lg outline-none focus:ring-2 ring-teal-400 transition"
              />
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateBoard}
                  className="bg-gradient-to-r from-violet-500 to-teal-500 hover:from-violet-600 hover:to-teal-600 text-white font-semibold px-5 py-2 rounded-lg shadow"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}

        {boards.length === 0 ? (
          <p className="text-gray-600 text-center mt-16">No boards available. Create one to get started!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
            {boards.map((board) => (
              <div
                key={board.id}
                className="bg-amber-50 p-6 rounded-xl shadow-xl hover:shadow-xl transition transform hover:scale-[1.015] cursor-pointer"
                onClick={() => navigate(`/board/${board.id}`)}
              >
                <h3 className="text-xl font-bold text-violet-700 mb-2">{board.name}</h3>
                <p className="text-gray-500 text-sm">
                  Created on {new Date(board.createdAt).toLocaleDateString()}
                </p>
                <button
                  className="mt-4 text-teal-600 font-medium hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/board/${board.id}`);
                  }}
                >
                  View Board →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BoardViewPage;
