"use client";

import { useState, useEffect } from "react";

function Workflows() {
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

  const handleRunWorkflow = (workflowId) => {
    console.log("Running workflow:", workflowId);
    // TODO: Implement workflow run functionality
  };

  const handleOpenWorkflow = (workflowId) => {
    console.log("Opening workflow:", workflowId);
    // TODO: Implement workflow open functionality
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
    return new Date(lastRun).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="loader border-4 border-blue-200 border-t-blue-600 rounded-full w-8 h-8 animate-spin"></div>
        <span className="ml-2">Loading workflows...</span>
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
      <div className="flex pt-4 pb-4 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2>Workflows</h2>
          <p className="text-muted-foreground">
            Manage and execute your automated workflows
          </p>
        </div>
        <div className="">
          <button disabled className="gap-2">
            New Workflow
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workflows.map((workflow) => (
          <div
            key={workflow.id}
            className="p-6 border border-gray-200 rounded-lg bg-white"
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
                <button
                  onClick={() => handleOpenWorkflow(workflow.id)}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                >
                  Open
                </button>
                <button
                  onClick={() => handleRunWorkflow(workflow.id)}
                  className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-800 rounded"
                >
                  Run
                </button>
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
                  <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded shadow-lg z-10">
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
