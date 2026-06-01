"use client";

import { useState } from "react";
import { useFetchTagsQuery, useCreateTagMutation, useUpdateTagMutation, useDeleteTagMutation } from "@/redux/services/apiSlice";
import { Modal, ModalBody } from "./Modal";

interface TagModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTag?: {
    id: string;
    name: string;
    color: string;
    description?: string;
  } | null;
}

export default function TagModal({ isOpen, onClose, editingTag }: TagModalProps) {
  const [tagData, setTagData] = useState({
    name: editingTag?.name || "",
    color: editingTag?.color || "#3b82f6",
    description: editingTag?.description || "",
  });

  const [createTag] = useCreateTagMutation();
  const [updateTag] = useUpdateTagMutation();
  const [deleteTag] = useDeleteTagMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tagData.name.trim()) return;

    try {
      if (editingTag) {
        await updateTag({
          tagId: editingTag.id,
          tagData: {
            name: tagData.name.trim(),
            color: tagData.color,
            description: tagData.description.trim() || undefined,
          },
        });
      } else {
        await createTag({
          name: tagData.name.trim(),
          color: tagData.color,
          description: tagData.description.trim() || undefined,
        });
      }
      
      onClose();
      setTagData({ name: "", color: "#3b82f6", description: "" });
    } catch (error) {
      console.error("Error saving tag:", error);
    }
  };

  const handleDelete = async () => {
    if (!editingTag) return;
    
    if (confirm(`Are you sure you want to delete the tag "${editingTag.name}"?`)) {
      try {
        await deleteTag(editingTag.id);
        onClose();
      } catch (error) {
        console.error("Error deleting tag:", error);
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose}>
      <ModalBody>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {editingTag ? "Edit Tag" : "Create New Tag"}
          </h2>
          {editingTag && (
            <button
              onClick={handleDelete}
              className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
            >
              Delete
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Tag Name *
            </label>
            <input
              id="name"
              type="text"
              value={tagData.name}
              onChange={(e) => setTagData({ ...tagData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Bug, Feature, Enhancement"
              required
            />
          </div>

          <div>
            <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
              Color
            </label>
            <div className="flex items-center space-x-3">
              <input
                id="color"
                type="color"
                value={tagData.color}
                onChange={(e) => setTagData({ ...tagData, color: e.target.value })}
                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={tagData.color}
                onChange={(e) => setTagData({ ...tagData, color: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="#3b82f6"
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={tagData.description}
              onChange={(e) => setTagData({ ...tagData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Optional description for this tag..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {editingTag ? "Update Tag" : "Create Tag"}
            </button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  );
}

// Tag List Component
export function TagList() {
  const { data: tags, isLoading } = useFetchTagsQuery();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<{
    id: string;
    name: string;
    color: string;
    description?: string;
  } | null>(null);

  const handleEditTag = (tag: any) => {
    setEditingTag(tag);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTag(null);
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading tags...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tag Management</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Create New Tag
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tags?.map((tag) => (
          <div
            key={tag.id}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: tag.color }}
                />
                <span className="font-medium text-gray-900">{tag.name}</span>
              </div>
              <button
                onClick={() => handleEditTag(tag)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>
            {tag.description && (
              <p className="text-sm text-gray-600">{tag.description}</p>
            )}
            <div className="mt-2 text-xs text-gray-400">
              Created: {new Date(tag.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      <TagModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingTag={editingTag}
      />
    </div>
  );
}
