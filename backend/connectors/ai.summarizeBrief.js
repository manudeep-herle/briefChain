import OpenAI from "openai";

export default {
  type: "ai.summarizeBrief",
  title: "AI Summarizer",
  description:
    "Generate a concise OSS maintainer brief from collected context.",
  paramsSchema: {}, // no params; it reads from context

  async run(context, params, secrets) {
    console.log("AI Summarizer running");
    const repoSummary = context.repoSummary || null;
    const downloads = context.downloads || null;
    const scorecard = context.scorecard || null;

    if (!secrets?.OPENAI_KEY) {
      console.error("Missing OPENAI_KEY");
      // Return a stub so the workflow still completes
      return {
        markdown: "# Brief\n\n(OpenAI key missing — stub output)",
        stub: true,
      };
    }
    const openai = new OpenAI({
      apiKey: secrets.OPENAI_KEY,
    });
    const system =
      params.prompt ||
      `You create concise daily briefs for open-source maintainers.
Return Markdown with sections: TL;DR, Key Metrics, Notable Changes, Security, and 3–5 Action Items.
Be specific and short.`;

    const user = JSON.stringify({ repoSummary, downloads, scorecard });
    try {
      const res = await openai.chat.completions.create(
        {
          model: "gpt-4o-mini",
          //   each message has role - system, user or assistant
          messages: [
            { role: "system", content: system },
            {
              role: "user",
              content: `Generate the brief from this JSON:\n${user}`,
            },
          ],
          //   temperature 0-1, higher -> more creative
          temperature: 0.2,
        },
        { timeout: 10000 }
      );
      console.log("OpenAI response:", res);
      // safely display this generated markdown on the UI
      const markdown =
        res.choices?.[0]?.message?.content || "# Brief\n\n(No content)";

      console.log(`Generated AI brief: ${markdown}`);
      return { markdown, stub: false };
    } catch (error) {
      console.error("OpenAI request failed:", error);
      return {
        markdown: "# Brief\n\n(OpenAI request failed — stub output)",
        stub: true,
      };
    }
  },
};
