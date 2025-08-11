// server.js (ESM)
import "reflect-metadata"; // safe to include here too
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

import AppDataSource from "./data-source.js";
import connectorsRouter from "./routes/connectors.js";
import workflowsRouter from "./routes/workflows.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get("/api/health", (req, res) =>
  res.json({ ok: true, db: AppDataSource.isInitialized })
);

// Mount routes (only used after DB is ready)
app.use("/api/connectors", connectorsRouter);
app.use("/api/workflows", workflowsRouter);

const PORT = process.env.PORT || 3000;

(async function bootstrap() {
  try {
    await AppDataSource.initialize();
    console.log(" DB connected");

    const server = app.listen(PORT, () =>
      console.log(` Backend running on http://localhost:${PORT}`)
    );

    // Graceful shutdown
    const shutdown = async (signal) => {
      console.log(`\n${signal} received. Shutting down...`);
      server.close(async () => {
        try {
          if (AppDataSource.isInitialized) await AppDataSource.destroy();
          console.log(" DB disconnected. Bye!");
          process.exit(0);
        } catch (e) {
          console.error("Error during shutdown:", e);
          process.exit(1);
        }
      });
    };
    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (err) {
    console.error(" DB init error:", err);
    process.exit(1);
  }
})();
