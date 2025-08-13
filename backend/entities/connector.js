// src/entities/Connector.js
import { EntitySchema } from "typeorm";

export default new EntitySchema({
  name: "Connector",
  tableName: "connectors",
  columns: {
    id: { type: Number, primary: true, generated: true },
    key: { type: String, unique: true },
    name: { type: String },
    type: { type: String },
    description: { type: String, nullable: true }, // UI/help
    paramSchema: { type: "jsonb", nullable: true }, // JSON Schema / Zod-like
    defaultParams: { type: "jsonb", nullable: true }, // optional global defaults
    config: { type: "jsonb", nullable: true }, // connector-level config (e.g., base_url)
    createdAt: { type: "timestamptz", createDate: true },
    updatedAt: { type: "timestamptz", updateDate: true },
  },
  indices: [
    { name: "idx_connectors_key", columns: ["key"], unique: true },
    { name: "idx_connectors_type", columns: ["type"] },
  ],
});
