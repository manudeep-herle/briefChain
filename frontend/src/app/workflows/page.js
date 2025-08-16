"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../components/Button";
import { Loader } from "../../components/Loader";
import { PageHeader } from "../../components/PageHeader";

function Workflows() {
  const router = useRouter();
  const [workflows, setWorkflows] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settingsDropdown, setSettingsDropdown] = useState({});

  useEffect(() => {
    const fetchWorkflows = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/workflows`
        );
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        setWorkflows(data);
        setError(null);
      } catch (error) {
        console.error("Failed to fetch workflows:", error);
        setWorkflows([]);
        setError("Failed to load workflows. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflows();
  }, []);

  const toggleSettingsDropdown = (workflowId) => {
    setSettingsDropdown((prev) => ({
      ...prev,
      [workflowId]: !prev[workflowId],
    }));
  };

  const handleRunWorkflow = async (workflowId) => {
    try {
      // Optimistically update status to running
      setWorkflows(prev => 
        prev.map(wf => 
          wf.id === workflowId 
            ? { ...wf, status: 'running' }
            : wf
        )
      );

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/workflows/${workflowId}/run`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}), // Can add secrets here if needed
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to run workflow: ${response.status}`);
      }

      const result = await response.json();
      
      // Update workflow with success status and last run time
      setWorkflows(prev => 
        prev.map(wf => 
          wf.id === workflowId 
            ? { 
                ...wf, 
                status: result.failedStepId ? 'error' : 'success',
                lastRun: new Date().toISOString()
              }
            : wf
        )
      );

      console.log('Workflow completed:', result);
    } catch (error) {
      console.error('Failed to run workflow:', error);
      
      // Update status to error
      setWorkflows(prev => 
        prev.map(wf => 
          wf.id === workflowId 
            ? { ...wf, status: 'error' }
            : wf
        )
      );
    }
  };

  const handleOpenWorkflow = (workflowId) => {
    router.push(`/workflows/${workflowId}`);
  };

  const handleSecretsSettings = (workflowId) => {
    console.log("Opening secrets for workflow:", workflowId);
    // TODO: Implement secrets management
    setSettingsDropdown((prev) => ({ ...prev, [workflowId]: false }));
  };

  const handleDeleteWorkflow = (workflowId) => {
    console.log("Deleting workflow:", workflowId);
    // TODO: Implement workflow deletion
    setSettingsDropdown((prev) => ({ ...prev, [workflowId]: false }));
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      running: "bg-blue-100 text-blue-800",
      success: "bg-green-100 text-green-800",
      error: "bg-red-100 text-red-800",
      idle: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          statusColors[status] || statusColors.idle
        }`}
      >
        {status || "idle"}
      </span>
    );
  };

  const formatLastRun = (lastRun) => {
    if (!lastRun) return "Never";
    const date = new Date(lastRun);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader variant="wave" text="Loading workflows..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 p-4">Error loading workflows: {error}</div>
    );
  }

  if (workflows.length === 0) {
    return <div className="p-4 text-gray-600">No workflows available.</div>;
  }

  return (
    <div>
      <PageHeader 
        title="Workflows"
        description="Manage and execute your automated workflows"
      >
        <Button 
          variant="default"
          onClick={() => router.push("/workflows/new")}
        >
          New Workflow
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workflows.map((workflow) => (
          <div
            key={workflow.id}
            className="p-6 ui-card"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-semibold">{workflow.name}</h3>
              {getStatusBadge(workflow.status)}
            </div>

            <p className="text-gray-600 mb-4 text-sm">
              {workflow.description || "No description available"}
            </p>

            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Steps:</span>
                <span className="font-medium">
                  {workflow.config?.steps?.length || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Last Run:</span>
                <span className="font-medium">
                  {formatLastRun(workflow.lastRun)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex gap-2">
                <Button
                  onClick={() => handleOpenWorkflow(workflow.id)}
                  variant="outline"
                  size="sm"
                >
                  Open
                </Button>
                <Button
                  onClick={() => handleRunWorkflow(workflow.id)}
                  disabled={workflow.status === 'running'}
                  variant={workflow.status === 'running' ? 'secondary' : 'default'}
                  size="sm"
                >
                  {workflow.status === 'running' ? 'Running...' : 'Run'}
                </Button>
              </div>

              <div className="relative">
                <button
                  onClick={() => toggleSettingsDropdown(workflow.id)}
                  className="p-1 hover:bg-gray-100 rounded"
                  title="Settings"
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
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </button>

                {settingsDropdown[workflow.id] && (
                  <div className="absolute right-0 mt-1 w-32 bg-white border-ui rounded shadow-lg z-10">
                    <button
                      onClick={() => handleSecretsSettings(workflow.id)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                    >
                      Secrets
                    </button>
                    <button
                      onClick={() => handleDeleteWorkflow(workflow.id)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Workflows;
