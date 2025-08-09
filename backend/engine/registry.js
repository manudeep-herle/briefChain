import githubRepoSummary from "../connectors/github.repoSummary.js";
import npmDownloads from "../connectors/npm.downloads.js";
import openssfScorecard from "../connectors/openssf.scorecard.js";
import aiSummarizeBrief from "../connectors/ai.summarizeBrief.js";
// import slackWebhook from "../connectors/slack.webhook.js";

// Map connector type → connector module
const registry = {
  "github.repoSummary": githubRepoSummary,
  "npm.downloads": npmDownloads,
  "openssf.scorecard": openssfScorecard,
  "ai.summarizeBrief": aiSummarizeBrief,
  // "slack.webhook": slackWebhook,
};

export default registry;
