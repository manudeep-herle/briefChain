import githubRepoSummary from "../connectors/github.repoSummary.js";
import npmDownloads from "../connectors/npm.downloads.js";
import openssfScorecard from "../connectors/openssf.scorecard.js";
import aiEngine from "../connectors/ai.engine.js";
import httpRequest from "../connectors/http.request.js";
// import slackWebhook from "../connectors/slack.webhook.js";

// Comprehensive connector registry with implementation and context mapping
const registry = {
  "github.repoSummary": {
    implementation: githubRepoSummary,
    contextKey: "repoSummary"
  },
  "npm.downloads": {
    implementation: npmDownloads,
    contextKey: "downloads"
  },
  "openssf.scorecard": {
    implementation: openssfScorecard,
    contextKey: "scorecard"
  },
  "ai.engine": {
    implementation: aiEngine,
    contextKey: "aiResponse"
  },
  "http.request": {
    implementation: httpRequest,
    contextKey: "httpResponse"
  },
  // "slack.webhook": {
  //   implementation: slackWebhook,
  //   contextKey: "slack"
  // },
};

// Helper function to get connector implementation
export function getConnectorImplementation(type) {
  return registry[type]?.implementation;
}

// Helper function to get context key for a connector
export function getContextKey(type) {
  return registry[type]?.contextKey || null;
}


export default registry;
