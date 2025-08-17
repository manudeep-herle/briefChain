import registry, {
  getConnectorImplementation,
  getContextKey,
} from "./registry.js";

// Template resolver function
function resolveTemplates(params, context) {
  const resolved = JSON.parse(JSON.stringify(params)); // Deep clone

  function replaceTemplates(obj) {
    if (typeof obj === "string") {
      // Replace {{step1.output}}, {{repoSummary.stars}}, etc.
      return obj.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
        const keys = path.trim().split(".");
        let value = context;

        for (const key of keys) {
          value = value?.[key];
        }

        return value !== undefined ? value : match; // Keep original if not found
      });
    } else if (Array.isArray(obj)) {
      return obj.map(replaceTemplates);
    } else if (obj && typeof obj === "object") {
      const result = {};
      for (const [key, val] of Object.entries(obj)) {
        result[key] = replaceTemplates(val);
      }
      return result;
    }

    return obj;
  }

  return replaceTemplates(resolved);
}

export default async function executeWorkflow(workflow, secrets) {
  const executionLog = [];
  const context = {}; // accumulates normalized outputs for later steps

  try {
    console.log("\n" + "=".repeat(60));
    console.log(
      `Starting workflow execution: ${workflow.name} (ID: ${workflow.id})`
    );
    console.log("=".repeat(60));

    // Handle both old format (workflow.steps) and new format (workflow.config.steps)
    const steps = workflow.steps || workflow.config?.steps || [];

    if (!steps.length) {
      const error = "No steps found in workflow";
      console.error(`Workflow execution failed: ${error}`);
      throw new Error(error);
    }

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const start = Date.now();

      console.log(
        `Executing step ${i + 1}/${steps.length}: ${step.type} (${step.id})`
      );

      const connector = getConnectorImplementation(step.type);
      if (!connector) {
        const error = `Unknown connector: ${step.type}`;
        console.error(`Step ${step.id} failed: ${error}`);
        throw new Error(error);
      }

      try {
        const rawParams = step.params || step.parameters || {};

        // Resolve template variables like {{repoSummary.stars}} before running
        const resolvedParams = resolveTemplates(rawParams, context);

        console.log(
          `Running connector ${step.type} with params:`,
          safePreview(resolvedParams)
        );
        if (JSON.stringify(rawParams) !== JSON.stringify(resolvedParams)) {
          console.log(`Templates resolved:`, {
            before: safePreview(rawParams),
            after: safePreview(resolvedParams),
          });
        }

        // Call connector with (input, params, secrets) — input = current context
        const output = await connector.run(context, resolvedParams, secrets);

        console.log(
          `Step ${step.id} completed successfully in ${Date.now() - start}ms`
        );

        // Store outputs in multiple ways for flexible access

        // 1. Step-based access: context.step1, context.step2, etc.
        context[step.id] = { output };

        // 2. Legacy context key access for backward compatibility
        const contextKey = getContextKey(step.type);
        if (contextKey) {
          context[contextKey] = output;
          console.log(
            `Stored output in context.${contextKey} and context.${step.id}`
          );
        } else {
          console.log(`Stored output in context.${step.id}`);
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
        const duration = Date.now() - start;
        console.error(
          `Step ${step.id} (${step.type}) failed after ${duration}ms:`,
          err.message
        );
        console.error("Step error details:", err);

        executionLog.push({
          stepId: step.id,
          type: step.type,
          status: "error",
          durationMs: duration,
          error: err?.message || String(err),
        });

        // For now: stop on first error . Remove this return to continue-on-error.
        console.log(
          `Workflow execution stopped due to failed step: ${step.id}`
        );
        return { failedStepId: step.id, executionLog, final: context };
      }
    }

    console.log(
      `Workflow ${workflow.name} completed successfully with ${steps.length} steps`
    );
    return { executionLog, final: context };
  } catch (error) {
    console.error(`Workflow execution failed for ${workflow.name}:`, error);
    throw error;
  }
}

function safePreview(obj) {
  try {
    const s = JSON.stringify(obj);
    return s.length > 400 ? s.slice(0, 400) + "…" : s;
  } catch {
    return String(obj);
  }
}
