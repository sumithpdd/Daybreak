'use client';

import React, { useState } from 'react';
import { FaCheck, FaTrash, FaPlus, FaEye, FaEyeSlash } from 'react-icons/fa';
import { IChecklistItem } from '@/redux/services/apiSlice';
import { id } from '../utils/id';

interface ChecklistProps {
  items: IChecklistItem[];
  onItemsChange: (items: IChecklistItem[]) => void;
}

const Checklist: React.FC<ChecklistProps> = ({ items, onItemsChange }) => {
  const [newItemText, setNewItemText] = useState('');
  const [hideCompleted, setHideCompleted] = useState(false);

  const completedCount = items.filter(item => item.completed).length;
  const totalCount = items.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const visibleItems = hideCompleted ? items.filter(item => !item.completed) : items;

  const addItem = () => {
    if (newItemText.trim()) {
      const newItem: IChecklistItem = {
        id: id('checklist-'),
        text: newItemText.trim(),
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      onItemsChange([...items, newItem]);
      setNewItemText('');
    }
  };

  const toggleItem = (itemId: string) => {
    const updatedItems = items.map(item =>
      item.id === itemId
        ? { ...item, completed: !item.completed, updatedAt: new Date().toISOString() }
        : item
    );
    onItemsChange(updatedItems);
  };

  const deleteItem = (itemId: string) => {
    const updatedItems = items.filter(item => item.id !== itemId);
    onItemsChange(updatedItems);
  };

  const deleteAllItems = () => {
    if (window.confirm('Are you sure you want to delete all checklist items?')) {
      onItemsChange([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem();
    }
  };

  return (
    <div className="mt-4">
      {/* Checklist Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <FaCheck className="text-gray-600" />
          <h3 className="font-semibold text-gray-800">Checklist</h3>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-28 bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-blue-500 h-2 transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <span className="text-sm text-gray-700 font-medium">{progressPercentage}%</span>
          </div>
          <button
            onClick={() => setHideCompleted(!hideCompleted)}
            className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            {hideCompleted ? 'Show' : 'Hide'} completed items
          </button>
          {items.length > 0 && (
            <button
              onClick={deleteAllItems}
              className="text-sm text-red-600 hover:text-red-800 transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Checklist Items */}
      <div className="space-y-2 mb-3">
        {visibleItems.map((item) => (
          <div key={item.id} className="flex items-center space-x-3 group">
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); toggleItem(item.id); }}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                item.completed
                  ? 'bg-blue-500 border-blue-500 text-white'
                  : 'border-gray-300 hover:border-blue-400'
              }`}
            >
              {item.completed && <FaCheck size={10} />}
            </button>
            <span
              className={`flex-1 transition-colors ${
                item.completed
                  ? 'line-through text-gray-500'
                  : 'text-gray-800'
              }`}
            >
              {item.text}
            </span>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); deleteItem(item.id); }}
              className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-all duration-200"
            >
              <FaTrash size={12} />
            </button>
          </div>
        ))}
      </div>

      {/* Add New Item */}
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={addItem}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
        >
          <FaPlus size={12} />
          <span className="text-sm">Add an item</span>
        </button>
        <input
          type="text"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add checklist item..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>
  );
};

export default Checklist;
