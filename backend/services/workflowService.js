import AppDataSource from "../data-source.js";
import { In } from "typeorm";
import executeWorkflow from "../engine/executor.js";

export class WorkflowService {
  constructor() {
    this.workflowRepo = AppDataSource.getRepository("Workflow");
    this.connectorRepo = AppDataSource.getRepository("Connector");
    this.executionRepo = AppDataSource.getRepository("WorkflowExecution");
  }

  async createWorkflow({ name, description, config }) {
    try {
      if (!name?.trim()) {
        throw new Error("Workflow name is required");
      }

      // Extract connector keys from config if provided
      const steps = Array.isArray(config?.steps) ? config.steps : [];
      const connectorKeys = [...new Set(steps.map(step => step.type).filter(Boolean))];

      // Find connectors by their keys
      let connectors = [];
      if (connectorKeys.length > 0) {
        connectors = await this.connectorRepo.find({
          where: { key: In(connectorKeys) }
        });

        // Check if all required connectors exist
        const foundKeys = new Set(connectors.map(c => c.key));
        const missingKeys = connectorKeys.filter(key => !foundKeys.has(key));
        
        if (missingKeys.length > 0) {
          throw new Error(`Required connectors not found: ${missingKeys.join(", ")}`);
        }
      }

      // Create the workflow
      const workflow = await this.workflowRepo.save({
        name: name.trim(),
        description: description?.trim() || null,
        config: config || null,
        isActive: true,
        connectors
      });

      return workflow;
    } catch (error) {
      console.error("WorkflowService.createWorkflow failed:", error);
      throw error;
    }
  }

  async updateWorkflow(id, { name, description, config }) {
    try {
      const workflow = await this.workflowRepo.findOne({
        where: { id },
        relations: { connectors: true }
      });

      if (!workflow) {
        throw new Error("Workflow not found");
      }

      // Update basic fields
      if (name !== undefined) workflow.name = name.trim();
      if (description !== undefined) workflow.description = description?.trim() || null;
      if (config !== undefined) workflow.config = config;

      // Update connectors if config changed
      if (config !== undefined) {
        const steps = Array.isArray(config?.steps) ? config.steps : [];
        const connectorKeys = [...new Set(steps.map(step => step.type).filter(Boolean))];

        if (connectorKeys.length > 0) {
          const connectors = await this.connectorRepo.find({
            where: { key: In(connectorKeys) }
          });

          const foundKeys = new Set(connectors.map(c => c.key));
          const missingKeys = connectorKeys.filter(key => !foundKeys.has(key));
          
          if (missingKeys.length > 0) {
            throw new Error(`Required connectors not found: ${missingKeys.join(", ")}`);
          }

          workflow.connectors = connectors;
        } else {
          workflow.connectors = [];
        }
      }

      return await this.workflowRepo.save(workflow);
    } catch (error) {
      console.error("WorkflowService.updateWorkflow failed:", error);
      throw error;
    }
  }

  async runWorkflow(id, secrets = {}) {
    try {
      // Find workflow with connectors
      const wf = await this.workflowRepo.findOne({
        where: { id, isActive: true },
        relations: { connectors: true },
      });

      if (!wf) {
        throw new Error("Workflow not found or inactive");
      }

      const config = wf.config || {};
      const steps = Array.isArray(config?.steps) ? config.steps : [];
      const wantedKeys = Array.from(
        new Set(steps.map((s) => s?.type).filter(Boolean))
      );

      // Check if all required connectors are bound to the workflow
      const boundKeys = new Set((wf.connectors || []).map((c) => c.key));
      const missing = wantedKeys.filter((k) => !boundKeys.has(k));
      
      if (missing.length) {
        // Try to find them in DB to give a better error
        const found = await this.connectorRepo.find({ where: { key: In(missing) } });
        const foundKeys = new Set(found.map((f) => f.key));
        const stillMissing = missing.filter((k) => !foundKeys.has(k));
        
        if (stillMissing.length) {
          throw new Error(`Missing required connectors: ${stillMissing.join(", ")}`);
        }
        
        // Connectors exist but not bound to workflow
        throw new Error(`Connectors not bound to workflow: ${missing.join(", ")}`);
      }

      // Merge secrets: workflow config -> env -> provided secrets
      const mergedSecrets = {
        ...(config.secrets || {}),
        OPENAI_KEY: process.env.OPENAI_KEY || undefined,
        ...secrets,
      };

      // Prepare workflow for execution
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
      const execution = await this.executionRepo.save({
        workflowId: wf.id,
        status: "running",
        startedAt: new Date()
      });

      try {
        const result = await executeWorkflow(workflowForRun, mergedSecrets);
        
        // Update execution with results
        await this.executionRepo.update(execution.id, {
          status: result.failedStepId ? "error" : "success",
          completedAt: new Date(),
          executionLog: result.executionLog,
          finalResult: result.final,
          errorMessage: result.failedStepId ? `Failed at step: ${result.failedStepId}` : null,
          failedStepId: result.failedStepId || null
        });
        
        return {
          ...result,
          executionId: execution.id
        };
      } catch (executionError) {
        console.error("WorkflowService.runWorkflow execution failed:", executionError);
        // Update execution with error
        await this.executionRepo.update(execution.id, {
          status: "error",
          completedAt: new Date(),
          errorMessage: executionError.message
        });
        throw executionError;
      }
    } catch (error) {
      console.error("WorkflowService.runWorkflow failed:", error);
      throw error;
    }
  }

  async getWorkflow(id) {
    try {
      const workflow = await this.workflowRepo.findOne({
        where: { id },
        relations: { connectors: true, executions: true },
        order: { executions: { startedAt: "DESC" } }
      });

      if (!workflow) {
        throw new Error("Workflow not found");
      }

      const lastExecution = workflow.executions?.[0];

      return {
        id: workflow.id,
        name: workflow.name,
        description: workflow.description,
        isActive: workflow.isActive,
        config: workflow.config || null,
        connectors: (workflow.connectors || []).map((c) => ({
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
        updatedAt: workflow.updatedAt,
        createdAt: workflow.createdAt,
      };
    } catch (error) {
      console.error("WorkflowService.getWorkflow failed:", error);
      throw error;
    }
  }

  async getAllWorkflows() {
    try {
      const workflows = await this.workflowRepo.find({
        relations: { executions: true },
        order: { 
          updatedAt: "DESC",
          executions: { startedAt: "DESC" }
        }
      });
      
      return workflows.map(wf => {
        const lastExecution = wf.executions?.[0];
        
        return {
          ...wf,
          status: lastExecution?.status || 'idle',
          lastRun: lastExecution?.startedAt,
          lastExecutionId: lastExecution?.id
        };
      });
    } catch (error) {
      console.error("WorkflowService.getAllWorkflows failed:", error);
      throw error;
    }
  }

  async deleteWorkflow(id) {
    try {
      const result = await this.workflowRepo.delete(id);
      if (result.affected === 0) {
        throw new Error("Workflow not found");
      }
      return true;
    } catch (error) {
      console.error("WorkflowService.deleteWorkflow failed:", error);
      throw error;
    }
  }
}

export default WorkflowService;