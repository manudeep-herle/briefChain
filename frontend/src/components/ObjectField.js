import { useState } from "react";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Button } from "./Button";

// Component for editing key-value pairs (like headers)
export function KeyValueField({ 
  value = {}, 
  onChange, 
  placeholder = { key: "Key", value: "Value" },
  className = ""
}) {
  const pairs = Object.entries(value);
  
  const addPair = () => {
    onChange({ ...value, "": "" });
  };
  
  const updateKey = (oldKey, newKey) => {
    if (oldKey === newKey) return;
    
    const newValue = { ...value };
    if (oldKey in newValue) {
      newValue[newKey] = newValue[oldKey];
      delete newValue[oldKey];
    }
    onChange(newValue);
  };
  
  const updateValue = (key, newVal) => {
    onChange({ ...value, [key]: newVal });
  };
  
  const removePair = (key) => {
    const newValue = { ...value };
    delete newValue[key];
    onChange(newValue);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {pairs.map(([key, val], index) => (
        <div key={index} className="flex gap-2 items-center">
          <input
            type="text"
            value={key}
            onChange={(e) => updateKey(key, e.target.value)}
            placeholder={placeholder.key}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            value={val}
            onChange={(e) => updateValue(key, e.target.value)}
            placeholder={placeholder.value}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={() => removePair(key)}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
            title="Remove"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      ))}
      
      <Button
        type="button"
        onClick={addPair}
        variant="outline"
        size="sm"
        className="flex items-center gap-1"
      >
        <PlusIcon className="w-4 h-4" />
        Add {placeholder.key}
      </Button>
    </div>
  );
}

// Component for editing nested objects with specific schema (like auth)
export function NestedObjectField({
  value = {},
  onChange,
  schema,
  className = ""
}) {
  const updateField = (fieldName, fieldValue) => {
    onChange({
      ...value,
      [fieldName]: fieldValue
    });
  };

  const clearField = (fieldName) => {
    const newValue = { ...value };
    delete newValue[fieldName];
    onChange(newValue);
  };

  if (!schema || !schema.properties) {
    return null;
  }

  return (
    <div className={`space-y-3 p-4 border border-gray-200 rounded-md bg-gray-50 ${className}`}>
      {Object.entries(schema.properties).map(([fieldName, fieldSchema]) => (
        <div key={fieldName}>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {fieldName}
            {fieldSchema.description && (
              <span className="text-gray-500 font-normal"> - {fieldSchema.description}</span>
            )}
          </label>
          
          {fieldSchema.enum ? (
            <select
              value={value[fieldName] || fieldSchema.default || ""}
              onChange={(e) => updateField(fieldName, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select {fieldName}</option>
              {fieldSchema.enum.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          ) : (
            <div className="flex gap-2">
              <input
                type={fieldSchema.type === "number" ? "number" : "text"}
                value={value[fieldName] || fieldSchema.default || ""}
                onChange={(e) => updateField(fieldName, e.target.value)}
                placeholder={fieldSchema.description || `Enter ${fieldName}`}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {value[fieldName] && (
                <button
                  type="button"
                  onClick={() => clearField(fieldName)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  title={`Clear ${fieldName}`}
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}