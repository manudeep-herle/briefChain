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
    config: { type: "jsonb", nullable: true },
    createdAt: { type: "timestamptz", createDate: true },
    updatedAt: { type: "timestamptz", updateDate: true },
  },
  indices: [
    { name: "idx_connectors_key", columns: ["key"], unique: true },
    { name: "idx_connectors_type", columns: ["type"] },
  ],
});
