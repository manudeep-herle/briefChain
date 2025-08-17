"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "../../../components/Button";
import { Loader } from "../../../components/Loader";
import { PageHeader } from "../../../components/PageHeader";
import { EditableTitle } from "../../../components/EditableTitle";
import {
  Breadcrumb,
  createWorkflowBreadcrumbs,
} from "../../../components/Breadcrumb";

function WorkflowDetails() {
  const params = useParams();
  const router = useRouter();
  const workflowId = params.id;

  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [pollingInterval, setPollingInterval] = useState(null);
  const [isUpdatingName, setIsUpdatingName] = useState(false);

  const fetchWorkflowDetails = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/workflows/${workflowId}`
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      setWorkflow(data);

      // Set last result if available from previous execution
      if (data.lastExecution) {
        setLastResult({
          executionLog: data.lastExecution.executionLog,
          final: data.lastExecution.finalResult,
          failedStepId: data.lastExecution.failedStepId,
        });
      }

      // No automatic polling needed - workflow runs are synchronous

      setError(null);
      return data;
    } catch (error) {
      console.error("Failed to fetch workflow details:", error);
      
      // If workflow not found (404), stop polling and redirect
      if (error.message.includes("404")) {
        setError("Workflow not found");
        stopPolling();
        // Optionally redirect to workflows list after a delay
        setTimeout(() => {
          router.push("/workflows");
        }, 3000);
      } else {
        setError("Failed to load workflow details. Please try again later.");
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Polling not needed for synchronous workflow execution
  const startPolling = () => {
    // No-op: workflow runs are synchronous
  };

  const stopPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  };

  useEffect(() => {
    if (!workflowId) return;
    fetchWorkflowDetails();

    // Cleanup polling on unmount
    return () => stopPolling();
  }, [workflowId]);

  const handleRunWorkflow = async () => {
    try {
      setIsRunning(true);
      setWorkflow((prev) => ({ ...prev, status: "running" }));

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/workflows/${workflowId}/run`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to run workflow: ${response.status}`);
      }

      const result = await response.json();
      setLastResult(result);
      setWorkflow((prev) => ({
        ...prev,
        status: result.failedStepId ? "error" : "success",
        lastRun: new Date().toISOString(),
      }));

      // Stop polling since we have the final result
      stopPolling();
    } catch (error) {
      console.error("Failed to run workflow:", error);
      setWorkflow((prev) => ({ ...prev, status: "error" }));
      
      // Stop polling on error too
      stopPolling();
    } finally {
      setIsRunning(false);
    }
  };

  const handleUpdateWorkflowName = async (newName) => {
    setIsUpdatingName(true);
    console.log("Here");
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/workflows/${workflowId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: newName }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update workflow name: ${response.status}`);
      }

      const updatedWorkflow = await response.json();
      setWorkflow((prev) => ({ ...prev, name: updatedWorkflow.name }));
    } catch (error) {
      console.error("Failed to update workflow name:", error);
      throw error; // Re-throw to let EditableTitle handle the error
    } finally {
      setIsUpdatingName(false);
    }
  };

  const copyResults = () => {
    if (lastResult?.final?.markdown) {
      navigator.clipboard.writeText(lastResult.final.markdown);
      // TODO: Add toast notification
    }
  };

  const downloadResults = () => {
    if (lastResult?.final?.markdown) {
      const blob = new Blob([lastResult.final.markdown], {
        type: "text/markdown",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${workflow?.name || "workflow"}-results.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader variant="bars" text="Loading workflow details..." />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Breadcrumb items={createWorkflowBreadcrumbs()} />
        <div className="text-red-600 p-4">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!workflow) {
    return <div className="p-4 text-gray-600">Workflow not found.</div>;
  }

  return (
    <div>
      {/* Breadcrumbs */}
      <Breadcrumb items={createWorkflowBreadcrumbs(workflow.name)} />

      {/* Header */}
      <div className="ui-divider bg-white px-6 -mx-6 mb-6">
        <PageHeader
          title={
            <div className="flex items-center gap-3">
              <EditableTitle
                title={workflow.name}
                onSave={handleUpdateWorkflowName}
                isLoading={isUpdatingName}
              />
              {getStatusBadge(workflow.status)}
            </div>
          }
          description={workflow.description}
        >
          <Button
            onClick={handleRunWorkflow}
            disabled={isRunning || workflow.status === "running"}
            variant={
              isRunning || workflow.status === "running"
                ? "secondary"
                : "default"
            }
          >
            {isRunning || workflow.status === "running"
              ? "Running..."
              : "Run Workflow"}
          </Button>
        </PageHeader>
      </div>

      {/* Main Layout: 2/3 Results + 1/3 Steps */}
      <div className="grid grid-cols-3 gap-6">
        {/* Results Card - Takes 2/3 of the width */}
        <div className="col-span-2">
          <div className="ui-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Results</h2>
              {lastResult && (
                <div className="flex gap-2">
                  <Button
                    onClick={copyResults}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
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
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    Copy
                  </Button>
                  <Button
                    onClick={downloadResults}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
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
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Download
                  </Button>
                </div>
              )}
            </div>

            <div className="min-h-96">
              {isRunning || workflow.status === "running" ? (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <Loader
                      variant="wave"
                      size="lg"
                      text="Workflow is running..."
                    />
                  </div>
                </div>
              ) : lastResult ? (
                <div className="space-y-4">
                  {lastResult.failedStepId && (
                    <div className="bg-red-50 border border-red-200 p-4 rounded">
                      <h3 className="font-medium text-red-800 mb-2">
                        Execution Failed
                      </h3>
                      <p className="text-red-700 text-sm">
                        Failed at step: {lastResult.failedStepId}
                      </p>
                    </div>
                  )}

                  {lastResult.final?.aiResponse?.content ? (
                    <div className="bg-gray-50 p-4 rounded border">
                      <h3 className="font-medium mb-2">Generated Results</h3>
                      <pre className="whitespace-pre-wrap text-sm text-gray-700">
                        {lastResult.final.aiResponse.content}
                      </pre>
                    </div>
                  ) : (
                    <p className="text-gray-600">
                      No AI results available.
                    </p>
                  )}

                  {lastResult.executionLog && (
                    <div className="mt-4">
                      <h3 className="font-medium mb-2">Execution Log</h3>
                      <div className="space-y-2">
                        {lastResult.executionLog.map((log, index) => (
                          <div
                            key={index}
                            className="bg-gray-50 p-3 rounded border text-sm"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-medium">
                                {log.stepId}: {log.type}
                              </span>
                              <span
                                className={`px-2 py-1 rounded text-xs ${
                                  log.status === "ok"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {log.status}
                              </span>
                            </div>
                            <div className="text-gray-600 mt-1">
                              Duration: {log.durationMs}ms
                            </div>
                            {log.error && (
                              <div className="text-red-600 mt-1">
                                Error: {log.error}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : workflow.lastExecution ? (
                <div className="text-center text-gray-500 py-8">
                  <p>Previous execution results are loaded above.</p>
                  <p className="text-sm mt-2">
                    Run the workflow again to see new results.
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center text-gray-500">
                    <p>No results yet. Run the workflow to see results here.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Steps Card - Takes 1/3 of the width */}
        <div className="col-span-1">
          <div className="ui-card p-6">
            <h2 className="text-lg font-semibold mb-4">Workflow Steps</h2>
            <div className="space-y-3">
              {workflow.config?.steps?.map((step, index) => (
                <div
                  key={step.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded"
                >
                  <div className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{step.name}</div>
                    <div className="text-xs text-gray-500">{step.type}</div>
                  </div>
                </div>
              )) || (
                <p className="text-gray-500 text-sm">No steps configured</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkflowDetails;
