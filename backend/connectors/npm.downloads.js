const API_BASE = "https://api.npmjs.org/downloads/point/last-week/";

export default {
  async run(context, params, secrets) { // eslint-disable-line no-unused-vars
    // add headers
    const headers = { "User-Agent": "briefchain" };
    if (secrets?.NPM_TOKEN) {
      headers["Authorization"] = `Bearer ${secrets.NPM_TOKEN}`;
    }
    const response = await fetch(`${API_BASE}${params.packageName}`, {
      headers,
    });
    if (!response.ok) {
      throw new Error("Failed to fetch npm downloads");
    }
    const data = await response.json();
    // console.log(`Fetched NPM download statistics for ${JSON.stringify(data)}`);
    return {
      packageName: params.packageName,
      downloads: data.downloads,
      start: data.start,
      end: data.end,
    };
  },
};
