"use client";
import { useState, useEffect } from "react";
import { useFetchTagsQuery, useCreateTagMutation, useUpdateTagMutation, useDeleteTagMutation } from "@/redux/services/apiSlice";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { closeTagManagementModal } from "@/redux/features/appSlice";
import { FaTimes, FaEdit, FaTrash, FaPlus, FaSave, FaTimes as FaCancel } from "react-icons/fa";
import type { ITag } from "@/redux/services/apiSlice";

interface TagManagementModalProps {
  isOpen: boolean;
}

export default function TagManagementModal({ isOpen }: TagManagementModalProps) {
  const dispatch = useAppDispatch();
  const { data: tags = [], isLoading, error } = useFetchTagsQuery();
  const [createTag] = useCreateTagMutation();
  const [updateTag] = useUpdateTagMutation();
  const [deleteTag] = useDeleteTagMutation();

  // Form states
  const [isCreating, setIsCreating] = useState(false);
  const [editingTag, setEditingTag] = useState<ITag | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    color: "#3B82F6", // Default blue color
    description: ""
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setIsCreating(false);
      setEditingTag(null);
      setFormData({ name: "", color: "#3B82F6", description: "" });
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, color: e.target.value }));
  };

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      await createTag({
        name: formData.name.trim(),
        color: formData.color,
        description: formData.description.trim()
      }).unwrap();
      
      setIsCreating(false);
      setFormData({ name: "", color: "#3B82F6", description: "" });
    } catch (error) {
      console.error("Error creating tag:", error);
    }
  };

  const handleEditTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTag || !formData.name.trim()) return;

    try {
      await updateTag({
        tagId: editingTag.id,
        tagData: {
          name: formData.name.trim(),
          color: formData.color,
          description: formData.description.trim()
        }
      }).unwrap();
      
      setEditingTag(null);
      setFormData({ name: "", color: "#3B82F6", description: "" });
    } catch (error) {
      console.error("Error updating tag:", error);
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    if (!confirm("Are you sure you want to delete this tag? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteTag(tagId).unwrap();
    } catch (error) {
      console.error("Error deleting tag:", error);
    }
  };

  const startEditing = (tag: ITag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      color: tag.color,
      description: tag.description || ""
    });
    setIsCreating(false);
  };

  const cancelEditing = () => {
    setEditingTag(null);
    setIsCreating(false);
    setFormData({ name: "", color: "#3B82F6", description: "" });
  };

  const startCreating = () => {
    setIsCreating(true);
    setEditingTag(null);
    setFormData({ name: "", color: "#3B82F6", description: "" });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Tag Management</h2>
          <button
            onClick={() => dispatch(closeTagManagementModal())}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Add New Tag Button */}
        <div className="mb-6">
          <button
            onClick={startCreating}
            disabled={isCreating || editingTag !== null}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <FaPlus size={16} />
            <span>Add New Tag</span>
          </button>
        </div>

        {/* Create/Edit Form */}
        {(isCreating || editingTag) && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold mb-4">
              {editingTag ? "Edit Tag" : "Create New Tag"}
            </h3>
            
            <form onSubmit={editingTag ? handleEditTag : handleCreateTag} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tag Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter tag name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={handleColorChange}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={handleColorChange}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter tag description (optional)"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <FaSave size={16} />
                  <span>{editingTag ? "Update Tag" : "Create Tag"}</span>
                </button>
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <FaCancel size={16} />
                  <span>Cancel</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tags List */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Existing Tags ({tags.length})</h3>
          
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading tags...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600">Error loading tags. Please try again.</p>
            </div>
          ) : tags.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No tags found. Create your first tag!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tags.map((tag) => (
                <div
                  key={tag.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      ></div>
                      <h4 className="font-semibold text-gray-800">{tag.name}</h4>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEditing(tag)}
                        disabled={isCreating || editingTag?.id === tag.id}
                        className="text-blue-500 hover:text-blue-700 disabled:text-gray-300"
                        title="Edit tag"
                      >
                        <FaEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteTag(tag.id)}
                        disabled={isCreating || editingTag?.id === tag.id}
                        className="text-red-500 hover:text-red-700 disabled:text-gray-300"
                        title="Delete tag"
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>
                  </div>
                  
                  {tag.description && (
                    <p className="text-sm text-gray-600 mb-2">{tag.description}</p>
                  )}
                  
                  <div className="text-xs text-gray-500">
                    Created: {new Date(tag.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
