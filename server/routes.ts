import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { streamChatCompletion, type ChatMessage } from "./openaiService";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
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

  return httpServer;
}
