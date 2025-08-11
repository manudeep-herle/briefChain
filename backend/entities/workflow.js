// src/entities/Workflow.js
import { EntitySchema } from "typeorm";

export default new EntitySchema({
  name: "Workflow",
  tableName: "workflows",
  columns: {
    id: { type: Number, primary: true, generated: true },
    name: { type: String },
    description: { type: String, nullable: true },
    isActive: { type: Boolean, default: true },
    config: { type: "jsonb", nullable: true },
    createdAt: { type: "timestamptz", createDate: true },
    updatedAt: { type: "timestamptz", updateDate: true },
  },
  relations: {
    connectors: {
      type: "many-to-many",
      target: "Connector",
      joinTable: {
        name: "workflow_connectors",
        joinColumn: { name: "workflow_id" },
        inverseJoinColumn: { name: "connector_id" },
      },
    },
  },
});
