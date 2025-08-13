import express from "express";
import AppDataSource from "../data-source.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository("Connector");
    const rows = await repo.find({ order: { name: "ASC" } });

    const data = rows.map((c) => ({
      id: c.id,
      key: c.key,
      name: c.name,
      type: c.type,
      description: c.description || "",
      paramSchema: c.paramSchema || null,
      defaultParams: c.defaultParams || null,
      config: c.config || null,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));

    res.json(data);
  } catch (e) {
    console.error("GET /api/connectors failed:", e);
    res.status(500).json({ error: "failed_to_list_connectors" });
  }
});

export default router;
