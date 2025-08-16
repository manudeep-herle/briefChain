import { useState, useRef, useEffect } from "react";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";

export function EditableTitle({
  title,
  onSave,
  isLoading = false,
  className = "text-2xl font-bold text-gray-900",
  placeholder = "Enter title",
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);
  const inputRef = useRef(null);

  useEffect(() => {
    setEditedTitle(title);
  }, [title]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditedTitle(title);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedTitle(title);
  };

  const handleSave = async () => {
    if (editedTitle.trim() && editedTitle.trim() !== title) {
      try {
        console.log("Saving");
        await onSave(editedTitle.trim());
        setIsEditing(false);
      } catch (error) {
        console.error("Failed to save title:", error);
        // Keep editing mode open on error
      }
    } else {
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    // Import at the top of your file:
    // import { CheckIcon, XMarkIcon, PencilSquareIcon } from "@heroicons/react/24/outline";

    return (
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleCancel}
          disabled={isLoading}
          placeholder={placeholder}
          className={`${className} bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-0 flex-1`}
        />
        <div className="flex gap-1">
          <button
            onMouseDown={(e) => e.preventDefault()} // Prevent blur when clicking
            onClick={handleSave}
            disabled={isLoading}
            className="p-1 text-green-600 hover:text-green-700 disabled:opacity-50"
            title="Save"
          >
            <CheckIcon className="w-4 h-4" />
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()} // Prevent blur when clicking
            onClick={handleCancel}
            disabled={isLoading}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            title="Cancel"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 group">
      <h2 className={className}>{title}</h2>
      <button
        onClick={handleStartEdit}
        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 transition-opacity"
        title="Edit name"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      </button>
    </div>
  );
}
