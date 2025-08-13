import "reflect-metadata";
import fs from "fs";
import path from "path";
import AppDataSource from "../data-source.js";

// current directory
const __dirname = path.dirname(new URL(import.meta.url).pathname);

(async () => {
  try {
    await AppDataSource.initialize();

    // find all seed files except index.js
    const files = fs
      .readdirSync(__dirname)
      .filter((f) => f.endsWith(".js") && f !== "index.js");

    for (const file of files) {
      const { default: seedFn } = await import(`./${file}`);
      if (typeof seedFn === "function") {
        console.log(`\nRunning seed: ${file}`);
        await seedFn(AppDataSource); // pass dataSource in
      }
    }

    await AppDataSource.destroy();
    console.log("\nAll seeds completed.");
    process.exit(0);
  } catch (err) {
    console.error("Seed process failed:", err);
    process.exit(1);
  }
})();
