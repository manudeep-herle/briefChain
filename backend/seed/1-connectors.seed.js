const DEFAULT_CONNECTORS = [
  {
    key: "github.repoSummary",
    name: "GitHub Repository Summary",
    type: "github",
    description: "Fetches comprehensive repository statistics including stars, forks, issues, and recent activity from GitHub API",
    paramSchema: {
      type: "object",
      properties: {
        owner: { type: "string", description: "Repository owner username" },
        repo: { type: "string", description: "Repository name" }
      },
      required: ["owner", "repo"]
    },
    defaultParams: null,
    config: null,
  },
  {
    key: "npm.downloads",
    name: "npm Downloads",
    type: "npm",
    description: "Retrieves download statistics for npm packages over specified time periods",
    paramSchema: {
      type: "object",
      properties: {
        packageName: { type: "string", description: "npm package name" },
        period: { type: "string", enum: ["last-day", "last-week", "last-month"], default: "last-week" }
      },
      required: ["packageName"]
    },
    defaultParams: { period: "last-week" },
    config: null,
  },
  {
    key: "openssf.scorecard",
    name: "OpenSSF Scorecard",
    type: "openssf",
    description: "Analyzes repository security practices using OpenSSF Scorecard to assess security posture",
    paramSchema: {
      type: "object",
      properties: {
        owner: { type: "string", description: "Repository owner username" },
        repo: { type: "string", description: "Repository name" }
      },
      required: ["owner", "repo"]
    },
    defaultParams: null,
    config: null,
  },
  {
    key: "ai.summarizeBrief",
    name: "AI Summarize Brief",
    type: "ai",
    description: "Uses AI to generate concise summaries and insights from collected data and metrics",
    paramSchema: {
      type: "object",
      properties: {
        model: { type: "string", enum: ["gpt-4o-mini", "gpt-4", "gpt-3.5-turbo"], default: "gpt-4o-mini" },
        maxTokens: { type: "number", default: 1000 },
        temperature: { type: "number", minimum: 0, maximum: 1, default: 0.7 }
      }
    },
    defaultParams: {
      maxTokens: 1000,
      temperature: 0.7
    },
    config: { model: "gpt-4o-mini" },
  },
  {
    key: "slack.webhook",
    name: "Slack Webhook",
    type: "slack",
    description: "Sends formatted messages and notifications to Slack channels via webhook integration",
    paramSchema: {
      type: "object",
      properties: {
        webhookUrl: { type: "string", description: "Slack webhook URL" },
        channel: { type: "string", description: "Target channel (optional if webhook has default)" },
        username: { type: "string", description: "Bot username for the message" }
      },
      required: ["webhookUrl"]
    },
    defaultParams: {
      username: "BriefChain Bot"
    },
    config: null,
  },
  {
    key: "http.request",
    name: "HTTP Request",
    type: "http",
    description: "Makes HTTP requests to any API endpoint with customizable method, headers, and body",
    paramSchema: {
      type: "object",
      required: ["url"],
      properties: {
        url: {
          type: "string",
          description: "API endpoint URL"
        },
        method: {
          type: "string",
          enum: ["GET", "POST", "PUT", "DELETE", "PATCH"],
          default: "GET"
        },
        headers: {
          type: "object",
          description: "Request headers as key-value pairs",
          additionalProperties: {
            type: "string"
          }
        },
        body: {
          type: "string",
          description: "Request body (for POST/PUT/PATCH)"
        },
        auth: {
          type: "object",
          properties: {
            type: {
              enum: ["bearer", "apikey", "basic"],
              type: "string"
            },
            value: {
              type: "string",
              description: "Token or API key value"
            },
            headerName: {
              type: "string",
              default: "Authorization",
              description: "Header name for API key auth"
            }
          }
        },
        timeout: {
          type: "number",
          default: 30000,
          description: "Request timeout in milliseconds"
        }
      }
    },
    defaultParams: {
      method: "GET",
      timeout: 30000,
      headers: {
        "Content-Type": "application/json"
      }
    },
    config: null,
  },
];

export default async function seedConnectors(dataSource) {
  const repo = dataSource.getRepository("Connector");
  await repo.upsert(DEFAULT_CONNECTORS, ["key"]); // idempotent
  console.log(`Seeded ${DEFAULT_CONNECTORS.length} connectors.`);
}
