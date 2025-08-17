import OpenAI from "openai";

export default {
  async run(context, params = {}, secrets) {
    console.log("AI Summarizer running with params:", params);
    
    if (!secrets?.OPENAI_KEY) {
      console.error("Missing OPENAI_KEY");
      return {
        content: "OpenAI key missing — stub output",
        stub: true,
      };
    }

    const openai = new OpenAI({
      apiKey: secrets.OPENAI_KEY,
    });

    // Generic system prompt for general-purpose AI engine
    const systemPrompt = "You are a helpful AI assistant. Provide accurate, concise responses based on the given information and instructions.";
    
    // Determine if we need to include context data
    const hasContextData = Object.keys(context).length > 0;
    
    let userMessage;
    if (hasContextData && params.prompt) {
      // Include context data with custom prompt
      userMessage = `${params.prompt}\n\nAvailable data:\n${JSON.stringify(context, null, 2)}`;
    } else if (params.prompt) {
      // Just the prompt without context (for simple questions)
      userMessage = params.prompt;
    } else {
      // Fallback: analyze available data generically
      userMessage = hasContextData 
        ? `Please analyze and summarize this data:\n${JSON.stringify(context, null, 2)}`
        : "No specific instructions provided.";
    }

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
      
      const content = res.choices?.[0]?.message?.content || "No content generated";
      
      console.log(`Generated AI content: ${content.substring(0, 200)}...`);
      return { content, stub: false };
    } catch (error) {
      console.error("OpenAI request failed:", error);
      return {
        content: `AI request failed: ${error.message}`,
        stub: true,
      };
    }
  },
};
