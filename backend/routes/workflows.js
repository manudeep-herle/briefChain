// routes/workflows.js
import express from "express";
import WorkflowService from "../services/workflowService.js";

const router = express.Router();
const workflowService = new WorkflowService();

/**
 * GET /api/workflows
 * Returns a list of all workflows.
 */
router.get("/", async (req, res) => {
  try {
    const workflows = await workflowService.getAllWorkflows();
    return res.json(workflows);
  } catch (e) {
    console.error("GET /workflows failed:", e);
    return res.status(500).json({ error: "failed_to_get_workflows" });
  }
});

/**
 * POST /api/workflows
 * Creates a new workflow with the provided configuration.
 * Body: { name: string, description?: string, config?: object }
 */
router.post("/", async (req, res) => {
  try {
    const { name, description, config } = req.body;
    
    if (!name?.trim()) {
      return res.status(400).json({ error: "Workflow name is required" });
    }

    const workflow = await workflowService.createWorkflow({
      name,
      description,
      config
    });

    return res.status(201).json(workflow);
  } catch (e) {
    console.error("POST /workflows failed:", e);
    if (e.message.includes("Required connectors not found")) {
      return res.status(400).json({ error: "missing_connectors", message: e.message });
    }
    return res.status(500).json({ error: "failed_to_create_workflow", message: e.message });
  }
});

/**
 * GET /api/workflows/:id
 * Returns a workflow with its config and bound connectors.
 */
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id))
      return res.status(400).json({ error: "invalid_id" });

    const workflow = await workflowService.getWorkflow(id);
    return res.json(workflow);
  } catch (e) {
    console.error("GET /workflows/:id failed:", e);
    if (e.message === "Workflow not found") {
      return res.status(404).json({ error: "workflow_not_found" });
    }
    return res.status(500).json({ error: "failed_to_get_workflow" });
  }
});

/**
 * PUT /api/workflows/:id
 * Updates workflow name, description, or config.
 * Body: { name?: string, description?: string, config?: object }
 */
router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id))
      return res.status(400).json({ error: "invalid_id" });

    const { name, description, config } = req.body;
    
    const updatedWorkflow = await workflowService.updateWorkflow(id, {
      name,
      description, 
      config
    });

    return res.json(updatedWorkflow);
  } catch (e) {
    console.error("PUT /workflows/:id failed:", e);
    if (e.message === "Workflow not found") {
      return res.status(404).json({ error: "workflow_not_found" });
    }
    if (e.message.includes("Required connectors not found")) {
      return res.status(400).json({ error: "missing_connectors", message: e.message });
    }
    return res.status(500).json({ error: "failed_to_update_workflow", message: e.message });
  }
});

/**
 * DELETE /api/workflows/:id
 * Deletes a workflow by ID.
 */
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id))
      return res.status(400).json({ error: "invalid_id" });

    await workflowService.deleteWorkflow(id);
    return res.status(204).send(); // No content response for successful deletion
  } catch (e) {
    console.error("DELETE /workflows/:id failed:", e);
    if (e.message === "Workflow not found") {
      return res.status(404).json({ error: "workflow_not_found" });
    }
    return res.status(500).json({ error: "failed_to_delete_workflow", message: e.message });
  }
});

/**
 * POST /api/workflows/:id/run
 * Body: { secrets?: Record<string,string|object> }
 * Merges provided secrets with workflow.secrets (if any) and env OPENAI_KEY.
 * Validates that every node.use in config has a matching bound connector.
 */
router.post("/:id/run", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id))
      return res.status(400).json({ error: "invalid_id" });

    const result = await workflowService.runWorkflow(id, req.body?.secrets);
    return res.json(result);
  } catch (e) {
    console.error("POST /workflows/:id/run failed:", e);
    
    if (e.message.includes("not found") || e.message.includes("inactive")) {
      return res.status(404).json({ error: "workflow_not_found_or_inactive" });
    }
    
    if (e.message.includes("Missing required connectors")) {
      return res.status(400).json({ 
        error: "missing_required_connectors", 
        message: e.message 
      });
    }
    
    if (e.message.includes("not bound")) {
      return res.status(400).json({ 
        error: "connectors_not_bound", 
        message: e.message 
      });
    }
    
    return res.status(500).json({ error: "run_failed", message: e.message });
  }
});

export default router;
