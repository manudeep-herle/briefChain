import registry from "./registry.js";

export default async function executeWorkflow(workflow, secrets) {
  const executionLog = [];
  const context = {}; // accumulates normalized outputs for later steps

  // Handle both old format (workflow.steps) and new format (workflow.config.steps)
  const steps = workflow.steps || workflow.config?.steps || [];
  
  if (!steps.length) {
    throw new Error('No steps found in workflow');
  }

  for (const step of steps) {
    const start = Date.now();

    const connector = registry[step.type];
    if (!connector) {
      throw new Error(`Unknown connector: ${step.type}`);
    }

    try {
      // Call connector with (input, params, secrets) — input = current context
      const output = await connector.run(context, step.params || {}, secrets);

      // Store normalized outputs for later steps
      if (step.type === "github.repoSummary") {
        context.repoSummary = output;
      }
      if (step.type === "npm.downloads") {
        context.downloads = output;
      }
      if (step.type === "openssf.scorecard") {
        context.scorecard = output;
      }
      if (step.type === "ai.summarizeBrief") {
        // expect { markdown }
        context.markdown = output?.markdown || "";
      }
      if (step.type === "slack.webhook") {
        context.slack = output; // e.g., { delivered: true/false, reason? }
      }

      executionLog.push({
        stepId: step.id,
        type: step.type,
        status: "ok",
        durationMs: Date.now() - start,
        // output preview is for logging only (meant for end user, not the system)
        outputPreview: safePreview(output),
      });
    } catch (err) {
      executionLog.push({
        stepId: step.id,
        type: step.type,
        status: "error",
        durationMs: Date.now() - start,
        error: err?.message || String(err),
      });

      // For now: stop on first error . Remove this return to continue-on-error.
      return { failedStepId: step.id, executionLog, final: context };
    }
  }

  return { executionLog, final: context };
}

function safePreview(obj) {
  try {
    const s = JSON.stringify(obj);
    return s.length > 400 ? s.slice(0, 400) + "…" : s;
  } catch {
    return String(obj);
  }
}
