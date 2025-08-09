import express from "express";
const router = express.Router();
import { workflows } from "../store/workflows.js";
import executeWorkflow from "../engine/executor.js";

// TODO: implement get, post, put, deleteof blocks/ connectors
// TODO: implement put/ patch of workflows
// TODO: Move any data to db

// POST /workflows - creates a new workflow
// workflow -> {id, name, desc, steps[]}
// step -> {id, name, endpoint, API keys?}
router.post("/", (req, res) => {
  // store the workflow
  const workflow = req.body;
  workflows[workflow.id] = workflow;
  res.status(201).json(workflow);
});

router.get("/:id", (req, res) => {
  const { id } = req.params;
  // retrieve the workflow
  const workflow = workflows[id];
  if (!workflow) {
    return res.status(404).json({ error: "Workflow not found" });
  }
  res.json(workflow);
});

router.post("/:id/run", async (req, res) => {
  const { id } = req.params;
  // run the workflow
  console.log(
    `Running workflow: ${id}, All workflows ${Object.keys(workflows)}`
  );
  const workflow = workflows[id];
  if (!workflow) {
    return res.status(404).json({ error: "Workflow not found" });
  }
  // run the workflow
  try {
    const secrets = {
      ...(workflow.secrets || {}),
      ...(req.body?.secrets || {}),
    };
    const result = await executeWorkflow(workflow, secrets);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
