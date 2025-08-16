import { useState, useRef, useEffect } from "react";
import { CheckIcon, XMarkIcon, PencilSquareIcon } from "@heroicons/react/24/outline";

export function EditableText({
  text,
  onSave,
  isLoading = false,
  placeholder = "Click to edit",
  className = "text-sm text-gray-600",
  multiline = false,
  showEditIcon = true,
  emptyText = "No description available"
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(text || "");
  const inputRef = useRef(null);

  useEffect(() => {
    setEditedText(text || "");
  }, [text]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (!multiline) {
        inputRef.current.select();
      }
    }
  }, [isEditing, multiline]);

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditedText(text || "");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedText(text || "");
  };

  const handleSave = async () => {
    try {
      await onSave(editedText.trim());
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save text:', error);
      // Keep editing mode open on error
    }
  };

  const handleKeyDown = (e) => {
    if (!multiline && e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  if (isEditing) {
    const InputComponent = multiline ? "textarea" : "input";
    
    return (
      <div className="flex items-start gap-2">
        <InputComponent
          ref={inputRef}
          type={multiline ? undefined : "text"}
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleCancel}
          disabled={isLoading}
          placeholder={placeholder}
          rows={multiline ? 3 : undefined}
          className={`${className} bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex-1 resize-none`}
        />
        <div className="flex gap-1 flex-shrink-0 mt-1">
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

  const displayText = text || emptyText;
  const isEmpty = !text;

  return (
    <div className="flex items-start gap-2 group cursor-pointer" onClick={handleStartEdit}>
      <div className={`${className} ${isEmpty ? 'text-gray-400 italic' : ''} flex-1`}>
        {displayText}
      </div>
      {showEditIcon && (
        <button
          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 transition-opacity flex-shrink-0"
          title="Edit"
        >
          <PencilSquareIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}