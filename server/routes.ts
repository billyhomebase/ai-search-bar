import type { Express } from "express";
import type { Server } from "http";
import OpenAI from "openai";

import { streamChatCompletion, type ChatMessage } from "./openaiService";
import { searchChunks } from "./searchChunks.js";

type ScoredChunk = {
  url: string;
  title: string;
  text: string;
  chunkIndex: number;
  score?: number;
};

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function getLastUserMessage(messages: ChatMessage[]): string | null {
  // Try to find the most recent user message with string content
  for (let i = messages.length - 1; i >= 0; i--) {
    const m: any = messages[i];
    if (m?.role === "user" && typeof m?.content === "string" && m.content.trim()) {
      return m.content.trim();
    }
  }
  return null;
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  // Existing streaming route - unchanged
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages } = req.body as { messages: ChatMessage[] };

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Messages array is required" });
      }

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      await streamChatCompletion(messages, (chunk) => {
        res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
      });

      res.write("data: [DONE]\n\n");
      res.end();
    } catch (error: any) {
      console.error("Chat error:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // Retrieval + streaming route
  app.post("/api/chatNews", async (req, res) => {
    try {
      const { messages } = req.body as { messages: ChatMessage[] };

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Messages array is required" });
      }

      const question = getLastUserMessage(messages);
      if (!question) {
        return res.status(400).json({ error: "No user message found in messages" });
      }

      // SSE headers
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      // 1) Retrieve top chunks
      const results = (await searchChunks(question)) as ScoredChunk[];

      const context = results
        .map((r, i) => `Snippet ${i + 1} (from "${r.title}"):\n${r.text}`)
        .join("\n\n");

      const systemPrompt = `
You are a helpful assistant answering questions based ONLY on the provided content snippets.
If the answer is not clearly contained in the snippets, say you don't know and suggest speaking to a financial adviser.
Do not mention the snippets explicitly; just answer naturally.
`.trim();

      const userPrompt = `
Here are content snippets from the knowledge base:

${context}

User question: ${question}

Answer the question using only the information above.
`.trim();

      // 2) Stream response from OpenAI
      const stream = await openai.chat.completions.create({
        model: "gpt-5.1",
        stream: true,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      });

      for await (const event of stream) {
        const delta = event.choices[0]?.delta?.content ?? "";
        if (delta) {
          res.write(`data: ${JSON.stringify({ content: delta })}\n\n`);
        }
      }

      // Optional: include sources at the end as a final SSE message (client can ignore/show)
      res.write(`data: ${JSON.stringify({
        sources: results.map((r) => ({
          url: r.url,
          title: r.title,
          chunkIndex: r.chunkIndex,
          score: r.score,
        })),
      })}\n\n`);

      res.write("data: [DONE]\n\n");
      res.end();
    } catch (error: any) {
      console.error("chatNews error:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  return httpServer;
}
