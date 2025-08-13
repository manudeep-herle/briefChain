const DEFAULT_CONNECTORS = [
  {
    key: "github.repoSummary",
    name: "GitHub Repository Summary",
    type: "github",
    config: null,
  },
  { key: "npm.downloads", name: "npm Downloads", type: "npm", config: null },
  {
    key: "openssf.scorecard",
    name: "OpenSSF Scorecard",
    type: "openssf",
    config: null,
  },
  {
    key: "ai.summarizeBrief",
    name: "AI Summarize Brief",
    type: "ai",
    config: { model: "gpt-4o-mini" },
  },
];

export default async function seedConnectors(dataSource) {
  const repo = dataSource.getRepository("Connector");
  await repo.upsert(DEFAULT_CONNECTORS, ["key"]); // idempotent
  console.log(`Seeded ${DEFAULT_CONNECTORS.length} connectors.`);
}
