"use client";
import { useState, useEffect } from "react";

function Connectors() {
  const [connectors, setConnectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/connectors`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setConnectors(data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

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
      <div className="flex pt-4 pb-4 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2>Connectors</h2>
          <p className="text-muted-foreground">
            Available data connectors for workflow steps
          </p>
        </div>
        <div className="">
          <div className=""></div>
          <button disabled className="gap-2">
            Add
          </button>
        </div>
      </div>

      <ul className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {connectors.map((connector) => (
          <li key={connector.id} className="p-4 border border-gray-200 rounded">
            <h3 className="text-lg font-semibold">{connector.name}</h3>
            <p className="text-gray-600">
              {connector.description || "lorem ipsum dolor sit amet"}
            </p>
            <p className="font-semibold">Parameters</p>
            {connector.parameters?.length ? (
              <p className="text-gray-600">{connector.parameters.join(", ")}</p>
            ) : (
              <p className="text-gray-600">No parameters available.</p>
            )}
            <div className="mt-2 flex justify-between gap-2">
              <button>Delete</button>
              <button>Edit</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Connectors;
