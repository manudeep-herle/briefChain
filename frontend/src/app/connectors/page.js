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
    <ul>
      {connectors.map((connector) => (
        <li key={connector.id} className="mb-4 p-4 border rounded">
          <h3 className="text-lg font-semibold">{connector.name}</h3>
          <p className="text-gray-600">{connector.description}</p>
        </li>
      ))}
    </ul>
  );
}

export default Connectors;
