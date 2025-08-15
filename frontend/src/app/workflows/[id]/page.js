"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

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
          failedStepId: data.lastExecution.failedStepId
        });
      }
      
      // Check if workflow is running and start polling if needed
      if (data.status === 'running' && !pollingInterval) {
        startPolling();
      } else if (data.status !== 'running' && pollingInterval) {
        stopPolling();
      }
      
      setError(null);
      return data;
    } catch (error) {
      console.error("Failed to fetch workflow details:", error);
      setError("Failed to load workflow details. Please try again later.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const startPolling = () => {
    if (pollingInterval) return; // Already polling
    
    const interval = setInterval(async () => {
      const data = await fetchWorkflowDetails();
      if (data && data.status !== 'running') {
        stopPolling();
        setIsRunning(false);
      }
    }, 2000); // Poll every 2 seconds
    
    setPollingInterval(interval);
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
      setWorkflow(prev => ({ ...prev, status: 'running' }));
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/workflows/${workflowId}/run`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to run workflow: ${response.status}`);
      }

      // Start polling for status updates
      startPolling();
      
      const result = await response.json();
      setLastResult(result);
      setWorkflow(prev => ({
        ...prev,
        status: result.failedStepId ? 'error' : 'success',
        lastRun: new Date().toISOString()
      }));
      
      // Stop polling since we have the final result
      stopPolling();
    } catch (error) {
      console.error('Failed to run workflow:', error);
      setWorkflow(prev => ({ ...prev, status: 'error' }));
      stopPolling();
    } finally {
      setIsRunning(false);
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
      const blob = new Blob([lastResult.final.markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${workflow?.name || 'workflow'}-results.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      running: 'bg-blue-100 text-blue-800',
      success: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800',
      idle: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || statusColors.idle}`}>
        {status || 'idle'}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="loader border-4 border-blue-200 border-t-blue-600 rounded-full w-8 h-8 animate-spin"></div>
        <span className="ml-2">Loading workflow details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 p-4">
        <p>{error}</p>
        <button 
          onClick={() => router.back()}
          className="mt-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!workflow) {
    return <div className="p-4 text-gray-600">Workflow not found.</div>;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="text-gray-500 hover:text-gray-700"
          >
            ← Back
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{workflow.name}</h1>
              {getStatusBadge(workflow.status)}
            </div>
            <p className="text-gray-600 mt-1">{workflow.description}</p>
          </div>
        </div>
        <button
          onClick={handleRunWorkflow}
          disabled={isRunning || workflow.status === 'running'}
          className={`px-4 py-2 rounded ${
            isRunning || workflow.status === 'running'
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isRunning || workflow.status === 'running' ? 'Running...' : 'Run Workflow'}
        </button>
      </div>

      {/* Main Layout: 2/3 Results + 1/3 Steps */}
      <div className="grid grid-cols-3 gap-6">
        {/* Results Card - Takes 2/3 of the width */}
        <div className="col-span-2">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Results</h2>
              {lastResult && (
                <div className="flex gap-2">
                  <button
                    onClick={copyResults}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </button>
                  <button
                    onClick={downloadResults}
                    className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download
                  </button>
                </div>
              )}
            </div>
            
            <div className="min-h-96">
              {isRunning || workflow.status === 'running' ? (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <div className="loader border-4 border-blue-200 border-t-blue-600 rounded-full w-12 h-12 animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Workflow is running...</p>
                  </div>
                </div>
              ) : lastResult ? (
                <div className="space-y-4">
                  {lastResult.failedStepId && (
                    <div className="bg-red-50 border border-red-200 p-4 rounded">
                      <h3 className="font-medium text-red-800 mb-2">Execution Failed</h3>
                      <p className="text-red-700 text-sm">Failed at step: {lastResult.failedStepId}</p>
                    </div>
                  )}
                  
                  {lastResult.final?.markdown ? (
                    <div className="bg-gray-50 p-4 rounded border">
                      <h3 className="font-medium mb-2">Generated Summary</h3>
                      <pre className="whitespace-pre-wrap text-sm text-gray-700">
                        {lastResult.final.markdown}
                      </pre>
                    </div>
                  ) : (
                    <p className="text-gray-600">No markdown results available.</p>
                  )}
                  
                  {lastResult.executionLog && (
                    <div className="mt-4">
                      <h3 className="font-medium mb-2">Execution Log</h3>
                      <div className="space-y-2">
                        {lastResult.executionLog.map((log, index) => (
                          <div key={index} className="bg-gray-50 p-3 rounded border text-sm">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{log.stepId}: {log.type}</span>
                              <span className={`px-2 py-1 rounded text-xs ${
                                log.status === 'ok' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {log.status}
                              </span>
                            </div>
                            <div className="text-gray-600 mt-1">
                              Duration: {log.durationMs}ms
                            </div>
                            {log.error && (
                              <div className="text-red-600 mt-1">Error: {log.error}</div>
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
                  <p className="text-sm mt-2">Run the workflow again to see new results.</p>
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
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Workflow Steps</h2>
            <div className="space-y-3">
              {workflow.config?.steps?.map((step, index) => (
                <div key={step.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded">
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