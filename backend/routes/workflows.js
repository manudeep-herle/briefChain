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
    const workflows = await wfRepo.find();
    return res.json(workflows);
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
      relations: { connectors: true },
    });

    if (!wf) return res.status(404).json({ error: "workflow_not_found" });

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
    const nodes = Array.isArray(config?.nodes) ? config.nodes : [];
    const wantedKeys = Array.from(
      new Set(nodes.map((n) => n?.use).filter(Boolean))
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

    // Merge secrets: workflow-stored -> env -> request body
    const secrets = {
      ...(wf.secrets || {}), // if you later add this column
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

    const result = await executeWorkflow(workflowForRun, secrets);
    return res.json(result);
  } catch (e) {
    console.error("POST /workflows/:id/run failed:", e);
    return res.status(500).json({ error: "run_failed", message: e.message });
  }
});

export default router;
