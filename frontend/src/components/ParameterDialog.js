import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "./Button";
import { KeyValueField, NestedObjectField } from "./ObjectField";

export function ParameterDialog({ connector, isOpen, onClose, onSubmit }) {
  const [parameters, setParameters] = useState({});
  const [errors, setErrors] = useState({});

  const handleParameterChange = (paramName, value) => {
    setParameters((prev) => ({
      ...prev,
      [paramName]: value,
    }));

    // Clear error when user starts typing
    if (errors[paramName]) {
      setErrors((prev) => ({
        ...prev,
        [paramName]: null,
      }));
    }
  };

  const validateAndSubmit = () => {
    const newErrors = {};
    const paramSchema = connector?.paramSchema || {};
    const requiredFields = paramSchema.required || [];

    // Validate required fields
    requiredFields.forEach((paramName) => {
      const value = parameters[paramName];
      const fieldSchema = paramSchema.properties?.[paramName];

      if (fieldSchema?.type === "object") {
        // For objects, check if it's empty or has any content
        if (
          !value ||
          (typeof value === "object" && Object.keys(value).length === 0)
        ) {
          newErrors[paramName] = "This field is required";
        }
      } else {
        // For strings and other types
        if (!value?.trim?.() && value !== 0) {
          newErrors[paramName] = "This field is required";
        }
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(parameters);
    handleClose();
  };

  const handleClose = () => {
    setParameters({});
    setErrors({});
    onClose();
  };

  if (!connector) return null;

  const paramSchema = connector.paramSchema || {};
  const properties = paramSchema.properties || {};
  const requiredFields = paramSchema.required || [];
  const hasParameters = Object.keys(properties).length > 0;

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-2 w-full max-w-md z-50 ">
          <div className="overflow-y-auto max-h-[90vh] p-4">
            <Dialog.Title className="text-lg font-semibold mb-2">
              Configure {connector.title || connector.name}
            </Dialog.Title>

            <Dialog.Description className="text-gray-600 text-sm mb-6">
              {connector.description}
            </Dialog.Description>

            {!hasParameters ? (
              <p className="text-gray-500 text-sm mb-6">
                This connector doesn't require any parameters.
              </p>
            ) : (
              <div className="space-y-4 mb-6">
                {Object.entries(properties).map(([paramName, schema]) => (
                  <div key={paramName}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {paramName}
                      {requiredFields.includes(paramName) && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </label>

                    {schema.type === "object" ? (
                      // Handle object types with special components
                      paramName === "headers" ? (
                        <KeyValueField
                          value={parameters[paramName] || {}}
                          onChange={(value) =>
                            handleParameterChange(paramName, value)
                          }
                          placeholder={{
                            key: "Header Name",
                            value: "Header Value",
                          }}
                          className={errors[paramName] ? "border-red-500" : ""}
                        />
                      ) : paramName === "auth" ? (
                        <NestedObjectField
                          value={parameters[paramName] || {}}
                          onChange={(value) =>
                            handleParameterChange(paramName, value)
                          }
                          schema={schema}
                          className={errors[paramName] ? "border-red-500" : ""}
                        />
                      ) : (
                        // Generic object handling for other object types
                        <div className="text-sm text-gray-500 p-3 border border-gray-200 rounded-md bg-gray-50">
                          Complex object parameter (type not yet supported)
                        </div>
                      )
                    ) : schema.enum ? (
                      <select
                        value={parameters[paramName] || schema.default || ""}
                        onChange={(e) =>
                          handleParameterChange(paramName, e.target.value)
                        }
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors[paramName]
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      >
                        {schema.enum.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={schema.type === "number" ? "number" : "text"}
                        value={parameters[paramName] || schema.default || ""}
                        onChange={(e) =>
                          handleParameterChange(paramName, e.target.value)
                        }
                        placeholder={schema.description || ""}
                        min={schema.minimum}
                        max={schema.maximum}
                        step={schema.type === "number" ? "any" : undefined}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors[paramName]
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                    )}

                    {schema.description && (
                      <p className="text-gray-500 text-xs mt-1">
                        {schema.description}
                      </p>
                    )}
                    {errors[paramName] && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors[paramName]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Dialog.Close asChild>
                <Button variant="outline">Cancel</Button>
              </Dialog.Close>
              <Button onClick={validateAndSubmit}>Add to Workflow</Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
