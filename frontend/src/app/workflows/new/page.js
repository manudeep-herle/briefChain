"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Button } from "../../../components/Button";

import { ConnectorPalette } from "../../../components/ConnectorPalette";
import { WorkflowCanvas } from "../../../components/WorkflowCanvas";

// Workflow builder page for creating new workflows
function NewWorkflow() {
  const router = useRouter();
  const [workflowName, setWorkflowName] = useState("Untitled Workflow");
  const [workflowDescription, setWorkflowDescription] = useState("");
  const [connectors, setConnectors] = useState([]);
  const [loadingConnectors, setLoadingConnectors] = useState(true);
  const [error, setError] = useState(null);
  const [canvasConnectors, setCanvasConnectors] = useState([]);

  // Fetch available connectors on component mount
  useEffect(() => {
    const fetchConnectors = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/connectors`
        );
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        setConnectors(data);
        setError(null);
      } catch (error) {
        console.error("Failed to fetch connectors:", error);
        setError("Failed to load connectors");
      } finally {
        setLoadingConnectors(false);
      }
    };

    fetchConnectors();
  }, []);

  const handleSave = () => {
    // TODO: Implement workflow saving
    console.log("Save workflow:", { workflowName, workflowDescription });
  };

  const handleCancel = () => {
    router.push("/workflows");
  };

  const handleConnectorDrop = (connector) => {
    // Add connector to canvas with unique ID - always center horizontally and stack vertically
    const newConnector = {
      ...connector,
      canvasId: `${connector.id}-${Date.now()}`, // Unique ID for canvas
      position: {
        x: "center", // Will be centered in CSS
        y: 80 + canvasConnectors.length * 200, // Stack vertically with 200px spacing
      },
      parameters: {}, // Will be filled in dialog
    };
    setCanvasConnectors((prev) => [...prev, newConnector]);
  };

  const handleRemoveConnector = (canvasId) => {
    setCanvasConnectors((prev) => prev.filter((c) => c.canvasId !== canvasId));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="ui-divider bg-white px-6">
          <div className="flex pt-4 pb-4 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Button onClick={handleCancel} variant="ghost" size="sm">
                ← Back
              </Button>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {workflowName}
                </h2>
                <p className="text-gray-600 mt-1">
                  Create a new automated workflow by connecting data sources
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save Workflow</Button>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex">
          {/* Left sidebar - Connector palette */}
          <ConnectorPalette
            connectors={connectors}
            loading={loadingConnectors}
            error={error}
          />

          {/* Center canvas area */}
          <WorkflowCanvas
            connectors={canvasConnectors}
            onConnectorDrop={handleConnectorDrop}
            onRemoveConnector={handleRemoveConnector}
          />
        </div>
      </div>
    </DndProvider>
  );
}

export default NewWorkflow;
