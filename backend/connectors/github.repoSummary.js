const API_BASE = "https://api.github.com";

export default {
  type: "github.repoSummary",
  title: "GitHub Repo Summary",
  description:
    "Fetch stars, forks, open issues/PRs, recent activity, and latest release for a GitHub repository.",
  paramsSchema: {
    owner: { type: "string", required: true, example: "facebook" },
    repo: { type: "string", required: true, example: "react" },
  },
  async run(context, params, secrets) {
    // fetch the metadata from the repository defined by owner and repo
    const url = `${API_BASE}/repos/${params.owner}/${params.repo}`;
    const headers = {
      "User-Agent": "briefChain",
      Accept: "application/vnd.github+json",
    };
    if (secrets?.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${secrets.GITHUB_TOKEN}`;
    }

    const res = await fetch(url, { headers });
    if (!res.ok) {
      if (res.status === 404) throw new Error("Repo not found");
      if (res.status === 403)
        throw new Error("GitHub rate limit. Add GITHUB_TOKEN.");
      throw new Error(`GitHub repo fetch failed (${res.status})`);
    }

    const data = await res.json();
    // console.log(`GitHub Repo Summary: ${JSON.stringify(data)}`);
    return {
      repo: `${params.owner}/${params.repo}`,
      stars: data.stargazers_count,
      forks: data.forks_count ?? 0,
      openIssues: data.open_issues_count,
    };
  },
};
