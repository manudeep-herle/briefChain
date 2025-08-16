"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Button } from "../../../components/Button";

import { ConnectorPalette } from "../../../components/ConnectorPalette";
import { WorkflowCanvas } from "../../../components/WorkflowCanvas";
import { ParameterDialog } from "../../../components/ParameterDialog";
import {
  Breadcrumb,
  createWorkflowBreadcrumbs,
} from "../../../components/Breadcrumb";
import { PageHeader } from "@/components/PageHeader";
import { EditableTitle } from "@/components/EditableTitle";
import { EditableText } from "@/components/EditableText";

// Workflow builder page for creating new workflows
function NewWorkflow() {
  const router = useRouter();
  const [workflowName, setWorkflowName] = useState("Untitled Workflow");
  const [workflowDescription, setWorkflowDescription] = useState("");
  const [connectors, setConnectors] = useState([]);
  const [loadingConnectors, setLoadingConnectors] = useState(true);
  const [error, setError] = useState(null);
  const [canvasConnectors, setCanvasConnectors] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingConnector, setPendingConnector] = useState(null);

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

  const handleSave = async () => {
    try {
      // Convert canvas connectors to workflow config
      const steps = canvasConnectors.map((connector, index) => ({
        id: `step-${index + 1}`,
        type: connector.key,
        name: connector.name,
        parameters: connector.parameters,
        position: { x: connector.position.x, y: connector.position.y },
      }));

      const config = {
        steps,
        version: "1.0",
      };

      const workflowData = {
        name: workflowName,
        description: workflowDescription || null,
        config,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/workflows`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(workflowData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }

      const savedWorkflow = await response.json();
      console.log("Workflow saved successfully:", savedWorkflow);

      // Redirect to the workflow detail page
      router.push(`/workflows/${savedWorkflow.id}`);
    } catch (error) {
      console.error("Failed to save workflow:", error);
      setError(`Failed to save workflow: ${error.message}`);
    }
  };

  const handleCancel = () => {
    router.push("/workflows");
  };

  const handleUpdateWorkflowName = async (newName) => {
    setWorkflowName(newName);
  };

  const handleUpdateWorkflowDescription = async (newDescription) => {
    setWorkflowDescription(newDescription);
  };

  const handleConnectorDrop = (connector) => {
    // Open parameter dialog for configuration
    setPendingConnector(connector);
    setDialogOpen(true);
  };

  const handleParameterSubmit = (parameters) => {
    if (!pendingConnector) return;

    // Add connector to canvas with parameters
    const newConnector = {
      ...pendingConnector,
      canvasId: `${pendingConnector.id}-${Date.now()}`, // Unique ID for canvas
      position: {
        x: "center", // Will be centered in CSS
        y: 80 + canvasConnectors.length * 200, // Stack vertically with 200px spacing
      },
      parameters,
    };
    setCanvasConnectors((prev) => [...prev, newConnector]);
    setPendingConnector(null);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setPendingConnector(null);
  };

  const handleRemoveConnector = (canvasId) => {
    setCanvasConnectors((prev) => prev.filter((c) => c.canvasId !== canvasId));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="ui-divider bg-white px-6">
          <div className="pt-4">
            <Breadcrumb
              items={[...createWorkflowBreadcrumbs(), { label: "New Workflow" }]}
            />
          </div>
          
          <PageHeader
          title={
            <EditableTitle
              title={workflowName}
              onSave={handleUpdateWorkflowName}
              placeholder="Enter workflow name"
            />
          }
          description={
            <EditableText
              text={workflowDescription}
              onSave={handleUpdateWorkflowDescription}
              placeholder="Enter workflow description"
              emptyText="Click to add a description"
              multiline={true}
              className="text-gray-600 mt-1"
            />
          }
        >
          <div className="flex gap-2 flex-shrink-0">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Workflow</Button>
          </div>
        </PageHeader>
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

        {/* Parameter Collection Dialog */}
        <ParameterDialog
          connector={pendingConnector}
          isOpen={dialogOpen}
          onClose={handleDialogClose}
          onSubmit={handleParameterSubmit}
        />
      </div>
    </DndProvider>
  );
}

export default NewWorkflow;
