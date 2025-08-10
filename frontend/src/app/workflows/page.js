"use client";

import { useState, useEffect } from "react";

function Workflows() {
  const [workflows, setWorkflows] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div>
        <h1>Workflows</h1>
        <div>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1>Workflows</h1>
        <p style={{ color: "red" }}>{error}</p>
      </div>
    );
  }

  if (workflows.length === 0) {
    return (
      <div>
        <h1>Workflows</h1>
        <p>No Workflows found.</p>
      </div>
    );
  }

  return (
    <div>
      <h1>Workflows</h1>
      <ul>
        {workflows.map((workflow) => (
          <li key={workflow.id}>{workflow.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default Workflows;
