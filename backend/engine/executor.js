import registry, { getConnectorImplementation, getContextKey, hasSpecialHandling } from "./registry.js";

export default async function executeWorkflow(workflow, secrets) {
  const executionLog = [];
  const context = {}; // accumulates normalized outputs for later steps

  try {
    console.log(`Starting workflow execution: ${workflow.name} (ID: ${workflow.id})`);
    
    // Handle both old format (workflow.steps) and new format (workflow.config.steps)
    const steps = workflow.steps || workflow.config?.steps || [];
    
    if (!steps.length) {
      const error = 'No steps found in workflow';
      console.error(`Workflow execution failed: ${error}`);
      throw new Error(error);
    }

    console.log(`Executing ${steps.length} steps for workflow: ${workflow.name}`);

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      const start = Date.now();
      
      console.log(`Executing step ${i + 1}/${steps.length}: ${step.type} (${step.id})`);

      const connector = getConnectorImplementation(step.type);
      if (!connector) {
        const error = `Unknown connector: ${step.type}`;
        console.error(`Step ${step.id} failed: ${error}`);
        throw new Error(error);
      }

      try {
        const stepParams = step.params || step.parameters || {};
        console.log(`Running connector ${step.type} with params:`, safePreview(stepParams));
        
        // Call connector with (input, params, secrets) — input = current context
        const output = await connector.run(context, stepParams, secrets);
        
        console.log(`Step ${step.id} completed successfully in ${Date.now() - start}ms`);

        // Store normalized outputs for later steps using registry mapping
        const contextKey = getContextKey(step.type);
        if (contextKey) {
          if (hasSpecialHandling(step.type)) {
            // Special case: store the markdown field from output for AI connectors
            context[contextKey] = output?.markdown || "";
          } else {
            context[contextKey] = output;
          }
          console.log(`Stored output in context.${contextKey}`);
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
        console.error(`Step ${step.id} (${step.type}) failed after ${duration}ms:`, err.message);
        console.error('Step error details:', err);
        
        executionLog.push({
          stepId: step.id,
          type: step.type,
          status: "error",
          durationMs: duration,
          error: err?.message || String(err),
        });

        // For now: stop on first error . Remove this return to continue-on-error.
        console.log(`Workflow execution stopped due to failed step: ${step.id}`);
        return { failedStepId: step.id, executionLog, final: context };
      }
    }

    console.log(`Workflow ${workflow.name} completed successfully with ${steps.length} steps`);
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
