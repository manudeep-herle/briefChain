const API_BASE = "https://api.securityscorecards.dev/projects/github.com";

export default {
  type: "openssf.scorecard",
  title: "OpenSSF Scorecard",
  description:
    "Fetch security/health score and key checks for a GitHub repository.",
  paramsSchema: {
    owner: { type: "string", required: true, example: "facebook" },
    repo: { type: "string", required: true, example: "react" },
  },

  async run(context, params, secrets) {
    const { owner, repo } = params;

    // Minimal headers; User-Agent is polite and sometimes required
    const headers = { "User-Agent": "briefchain" };

    //Scorecard API is public; token not required
    const url = `${API_BASE}/${owner}/${repo}`;

    const resp = await fetch(url, { headers });

    if (!resp.ok) {
      if (resp.status === 404) {
        // Some repos won’t have a score yet
        return {
          repo: `${owner}/${repo}`,
          score: null,
          checks: [],
          date: null,
          unavailable: true,
        };
      }
      if (resp.status === 429) {
        throw new Error("OpenSSF Scorecard rate-limited. Please retry later.");
      }
      throw new Error(`OpenSSF Scorecard fetch failed (${resp.status})`);
    }

    const data = await resp.json();

    // Normalize to a compact shape for the AI step
    // API fields often include { score, date, checks: [{name, score, details...}] }
    const normalized = {
      repo: `${owner}/${repo}`,
      score: typeof data.score === "number" ? data.score : null,
      date: data.date || null,
      checks: Array.isArray(data.checks)
        ? data.checks.slice(0, 8).map((c) => ({
            name: c.name,
            score: typeof c.score === "number" ? c.score : null,
          }))
        : [],
    };
    return normalized;
  },
};
