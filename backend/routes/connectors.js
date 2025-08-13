import express from "express";
import AppDataSource from "../data-source.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const repo = AppDataSource.getRepository("Connector");
    const rows = await repo.find({ order: { name: "ASC" } });

    const data = rows.map((c) => ({
      name: c.name, // "GitHub Repo Summary"
      type: c.type, // "github", "npm", "ai", "security"
      description: c.description || "",
      parameters: c.parameters || [], // array of { name: string, type: string }
    }));

    res.json(data);
  } catch (e) {
    console.error("GET /api/connectors failed:", e);
    res.status(500).json({ error: "failed_to_list_connectors" });
  }
});

export default router;
