import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  // TODO: return available connectors
  res.json([
    { type: "github.repoSummary", title: "GitHub Repository Summary " },
    { type: "npm.downloads", title: "npm Downloads" },
  ]);
});

export default router;
