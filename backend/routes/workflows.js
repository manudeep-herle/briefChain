// routes/workflows.js
import express from "express";
import AppDataSource from "../data-source.js";
import { In } from "typeorm";
import executeWorkflow from "../engine/executor.js";

const router = express.Router();

/**
 * GET /api/workflows
 * Returns a list of all workflows.
 */
router.get("/", async (req, res) => {
  try {
    const wfRepo = AppDataSource.getRepository("Workflow");
    const workflows = await wfRepo.find({
      relations: { executions: true },
      order: { 
        updatedAt: "DESC",
        executions: { startedAt: "DESC" }
      }
    });
    
    // Add last execution info to each workflow
    const workflowsWithStatus = workflows.map(wf => {
      const lastExecution = wf.executions?.[0]; // First item is already the latest due to DESC order
      
      return {
        ...wf,
        status: lastExecution?.status || 'idle',
        lastRun: lastExecution?.startedAt,
        lastExecutionId: lastExecution?.id
      };
    });
    
    return res.json(workflowsWithStatus);
  } catch (e) {
    console.error("GET /workflows failed:", e);
    return res.status(500).json({ error: "failed_to_get_workflows" });
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

    const wfRepo = AppDataSource.getRepository("Workflow");
    const wf = await wfRepo.findOne({
      where: { id },
      relations: { connectors: true, executions: true },
      order: { executions: { startedAt: "DESC" } }
    });

    if (!wf) return res.status(404).json({ error: "workflow_not_found" });

    // Get last execution (first item is already the latest due to DESC order)
    const lastExecution = wf.executions?.[0];

    // shape it a bit for the client
    return res.json({
      id: wf.id,
      name: wf.name,
      description: wf.description,
      isActive: wf.isActive,
      config: wf.config || null,
      connectors: (wf.connectors || []).map((c) => ({
        id: c.id,
        key: c.key,
        name: c.name,
        type: c.type,
      })),
      status: lastExecution?.status || 'idle',
      lastRun: lastExecution?.startedAt,
      lastExecution: lastExecution ? {
        id: lastExecution.id,
        status: lastExecution.status,
        startedAt: lastExecution.startedAt,
        completedAt: lastExecution.completedAt,
        executionLog: lastExecution.executionLog,
        finalResult: lastExecution.finalResult,
        errorMessage: lastExecution.errorMessage,
        failedStepId: lastExecution.failedStepId
      } : null,
      updatedAt: wf.updatedAt,
      createdAt: wf.createdAt,
    });
  } catch (e) {
    console.error("GET /workflows/:id failed:", e);
    return res.status(500).json({ error: "failed_to_get_workflow" });
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

    const wfRepo = AppDataSource.getRepository("Workflow");
    const connRepo = AppDataSource.getRepository("Connector");

    const wf = await wfRepo.findOne({
      where: { id, isActive: true },
      relations: { connectors: true },
    });
    if (!wf)
      return res.status(404).json({ error: "workflow_not_found_or_inactive" });

    const config = wf.config || {};
    const steps = Array.isArray(config?.steps) ? config.steps : [];
    const wantedKeys = Array.from(
      new Set(steps.map((s) => s?.type).filter(Boolean))
    );

    // If the workflow has no bound connectors yet, we *could* loosely fetch by key,
    // but safest is to require bindings to exist.
    const boundKeys = new Set((wf.connectors || []).map((c) => c.key));

    // If any wanted key is not bound, try to load them from DB to give a better error
    const missing = wantedKeys.filter((k) => !boundKeys.has(k));
    if (missing.length) {
      // Optionally: attempt to resolve them
      const found = await connRepo.find({ where: { key: In(missing) } });
      const foundKeys = new Set(found.map((f) => f.key));
      const stillMissing = missing.filter((k) => !foundKeys.has(k));
      if (stillMissing.length) {
        return res.status(400).json({
          error: "missing_required_connectors",
          details: { missing: stillMissing },
        });
      }
      // We have them in DB but not bound to the workflow — you can choose to:
      //  (A) fail (enforce explicit binding), or
      //  (B) run anyway using the fetched connectors (no DB write).
      // Here we choose (A) for safety:
      return res.status(400).json({
        error: "connectors_not_bound",
        details: {
          needed: missing,
          message: "Bind these connectors to the workflow first.",
        },
      });
    }

    // Merge secrets: workflow config -> env -> request body
    const secrets = {
      ...(config.secrets || {}), // from workflow.config.secrets
      OPENAI_KEY: process.env.OPENAI_KEY || undefined,
      ...(req.body?.secrets || {}),
    };

    // Minimal shape that executor likely expects
    const workflowForRun = {
      id: wf.id,
      name: wf.name,
      config: config,
      connectors: wf.connectors.map((c) => ({
        id: c.id,
        key: c.key,
        name: c.name,
        type: c.type,
        config: c.config || null,
      })),
    };

    // Create execution record
    const executionRepo = AppDataSource.getRepository("WorkflowExecution");
    const execution = await executionRepo.save({
      workflowId: wf.id,
      status: "running",
      startedAt: new Date()
    });

    try {
      const result = await executeWorkflow(workflowForRun, secrets);
      
      // Update execution with results
      await executionRepo.update(execution.id, {
        status: result.failedStepId ? "error" : "success",
        completedAt: new Date(),
        executionLog: result.executionLog,
        finalResult: result.final,
        errorMessage: result.failedStepId ? `Failed at step: ${result.failedStepId}` : null,
        failedStepId: result.failedStepId || null
      });
      
      return res.json({
        ...result,
        executionId: execution.id
      });
    } catch (error) {
      // Update execution with error
      await executionRepo.update(execution.id, {
        status: "error",
        completedAt: new Date(),
        errorMessage: error.message
      });
      throw error;
    }
  } catch (e) {
    console.error("POST /workflows/:id/run failed:", e);
    return res.status(500).json({ error: "run_failed", message: e.message });
  }
});

export default router;
