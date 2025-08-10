import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import connectorsRouter from "./routes/connectors.js";
import workflowsRouter from "./routes/workflows.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// health check API
app.get("/api/health", (req, res) => res.json({ ok: true }));

// Mount route modules
app.use("/api/connectors", connectorsRouter);
app.use("/api/workflows", workflowsRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () =>
  console.log(`Backend running on http://localhost:${PORT}`)
);
