export const workflows = {
  "wf-react-daily-brief": {
    id: "wf-react-daily-brief",
    name: "React OSS Daily Brief",
    desc: "Fetch GitHub stats, npm downloads, OpenSSF security score, summarize via AI, and deliver to Slack.",
    steps: [
      {
        id: "s1",
        type: "github.repoSummary",
        name: "GitHub Repo Summary",
        params: {
          owner: "facebook",
          repo: "react",
        },
      },
      {
        id: "s2",
        type: "npm.downloads",
        name: "npm Downloads",
        params: {
          packageName: "react",
        },
      },
      {
        id: "s3",
        type: "openssf.scorecard",
        name: "OpenSSF Scorecard",
        params: {
          owner: "facebook",
          repo: "react",
        },
      },
      {
        id: "s4",
        type: "ai.summarizeBrief",
        name: "AI Summarizer",
        params: {},
      },
      {
        id: "s5",
        type: "slack.webhook",
        name: "Slack Delivery",
        params: {},
      },
    ],
    secrets: {
      OPENAI_KEY: "", // fill with your OpenAI API key
      SLACK_WEBHOOK_URL: "", // fill with your Slack Incoming Webhook URL (optional for testing)
    },
    createdAt: "2025-08-08T21:00:00Z",
    updatedAt: "2025-08-08T21:00:00Z",
  },
  "github-only": {
    id: "github-only",
    name: "Github test",
    desc: "Github test",
    steps: [
      {
        id: "s1",
        type: "github.repoSummary",
        name: "GitHub Repo Summary",
        params: {
          owner: "facebook",
          repo: "react",
        },
      },
    ],
  },
};
