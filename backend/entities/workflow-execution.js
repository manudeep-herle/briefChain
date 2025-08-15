// src/entities/WorkflowExecution.js
import { EntitySchema } from "typeorm";

export default new EntitySchema({
  name: "WorkflowExecution",
  tableName: "workflow_executions",
  columns: {
    id: { type: Number, primary: true, generated: true },
    workflowId: { type: Number },
    status: { type: String, default: "running" }, // running, success, error
    startedAt: { type: "timestamptz", createDate: true },
    completedAt: { type: "timestamptz", nullable: true },
    executionLog: { type: "jsonb", nullable: true }, // array of step execution logs
    finalResult: { type: "jsonb", nullable: true }, // final context/result
    errorMessage: { type: String, nullable: true },
    failedStepId: { type: String, nullable: true },
  },
  relations: {
    workflow: {
      type: "many-to-one",
      target: "Workflow",
      joinColumn: { name: "workflowId" },
      onDelete: "CASCADE",
    },
  },
  indices: [
    { name: "idx_workflow_executions_workflow_id", columns: ["workflowId"] },
    { name: "idx_workflow_executions_status", columns: ["status"] },
    { name: "idx_workflow_executions_started_at", columns: ["startedAt"] },
  ],
});