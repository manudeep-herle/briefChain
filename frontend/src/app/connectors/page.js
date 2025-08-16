"use client";
import { useState, useEffect } from "react";
import { PageHeader } from "../../components/PageHeader";
import { Button } from "../../components/Button";

function Connectors() {
  const [connectors, setConnectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConnectors = async () => {
      setLoading(true);
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
        setConnectors([]);
        setError("Failed to load connectors. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchConnectors();
  }, []);

  const handleDeleteConnector = (connectorId) => {
    console.log("Deleting connector:", connectorId);
    // TODO: Implement connector deletion
  };

  const handleEditConnector = (connectorId) => {
    console.log("Editing connector:", connectorId);
    // TODO: Implement connector editing
  };

  const getTypeColor = (type) => {
    const typeColors = {
      github: "bg-gray-100 text-gray-800",
      npm: "bg-red-100 text-red-800",
      openssf: "bg-green-100 text-green-800",
      ai: "bg-purple-100 text-purple-800",
      slack: "bg-blue-100 text-blue-800",
    };

    return typeColors[type] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="loader border-4 border-blue-200 border-t-blue-600 rounded-full w-8 h-8 animate-spin"></div>
        <span className="ml-2">Loading connectors...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 p-4">Error loading connectors: {error}</div>
    );
  }

  if (!connectors || connectors.length === 0) {
    return <div className="p-4 text-gray-600">No connectors available.</div>;
  }

  return (
    <div>
      <PageHeader 
        title="Connectors"
        description="Available data connectors for workflow steps"
      >
        <Button disabled variant="secondary">
          Add Connector
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {connectors.map((connector) => (
          <div
            key={connector.id}
            className="p-6 border border-gray-200 rounded-lg bg-white"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-semibold">{connector.name}</h3>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
                  connector.type
                )}`}
              >
                {connector.type}
              </span>
            </div>

            <p className="text-gray-600 mb-4 text-sm">
              {connector.description || "No description available"}
            </p>

            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Key</h4>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                {connector.key}
              </code>
            </div>

            {connector.config && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Configuration
                </h4>
                <div className="text-xs bg-gray-50 p-2 rounded border">
                  {typeof connector.config === "object" &&
                  Object.entries(connector.config)?.length ? (
                    Object.entries(connector.config).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-gray-600">{key}:</span>
                        <span className="font-medium">{String(value)}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-gray-600">No configuration</span>
                  )}
                </div>
              </div>
            )}

            {/* <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-100">
              <button 
                onClick={() => handleEditConnector(connector.id)}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
              >
                Edit
              </button>
              <button 
                onClick={() => handleDeleteConnector(connector.id)}
                className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-800 rounded"
              >
                Delete
              </button>
            </div> */}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Connectors;
