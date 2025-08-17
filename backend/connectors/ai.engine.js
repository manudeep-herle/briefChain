import OpenAI from "openai";

export default {
  async run(context, params = {}, secrets) {
    console.log("AI Summarizer running with params:", params);
    
    if (!secrets?.OPENAI_KEY) {
      console.error("Missing OPENAI_KEY");
      return {
        markdown: "# Analysis\n\n(OpenAI key missing — stub output)",
        stub: true,
      };
    }

    const openai = new OpenAI({
      apiKey: secrets.OPENAI_KEY,
    });

    // Use custom prompt or fall back to default OSS maintainer brief
    const systemPrompt = params.prompt || 
      `You create concise daily briefs for open-source maintainers.
Return Markdown with sections: TL;DR, Key Metrics, Notable Changes, Security, and 3–5 Action Items.
Be specific and short.`;

    // Create user message with all available context
    const contextData = {
      ...context, // Include all context data (repoSummary, downloads, scorecard, httpResponse, etc.)
    };
    
    const userMessage = params.prompt 
      ? `Analyze this data according to the given instructions:\n${JSON.stringify(contextData, null, 2)}`
      : `Generate the brief from this JSON:\n${JSON.stringify(contextData, null, 2)}`;

    try {
      const res = await openai.chat.completions.create(
        {
          model: params.model || "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
          temperature: params.temperature || 0.2,
          max_tokens: params.maxTokens || 1000,
        },
        { timeout: 15000 }
      );
      
      const markdown = res.choices?.[0]?.message?.content || "# Analysis\n\n(No content generated)";
      
      console.log(`Generated AI analysis: ${markdown.substring(0, 200)}...`);
      return { markdown, stub: false };
    } catch (error) {
      console.error("OpenAI request failed:", error);
      return {
        markdown: `# Analysis\n\n(OpenAI request failed: ${error.message})`,
        stub: true,
      };
    }
  },
};
