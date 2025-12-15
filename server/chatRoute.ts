// src/server/chatRoute.ts

//Updated route using chunked data 


import express, { type Request, type Response } from "express";
import OpenAI from "openai";
import { searchChunks } from "../script/searchChunks.js";

type SearchChunkResult = {
  url: string;
  title: string;
  text: string;
  chunkIndex: number;
  score?: number;
};

type ChatBody = {
  message?: unknown;
};

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post("/chat", async (req: Request<unknown, unknown, ChatBody>, res: Response) => {

    try {
    
    const question = req.body?.message;



    if (typeof question !== "string" || question.trim().length === 0) {
      return res.status(400).json({ error: "message is required" });
    }

    // 1) Retrieve top chunks from your JSON-based index
    const results = (await searchChunks(question, 6)) as SearchChunkResult[];

    // Build hidden context for the model only
    const context = results
      .map(
        (r, i) =>
          `Snippet ${i + 1} (from "${r.title}"):\n` +
          `${r.text}`
      )
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

    // 2) Call ChatGPT with that context
    const completion = await openai.chat.completions.create({
      model: "gpt-5.1",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const answer: string = completion.choices[0]?.message?.content ?? "";

    // 3) Return just the answer (and optional metadata if YOU want it)
    return res.json({
      answer,
      sources: results.map((r) => ({
        url: r.url,
        title: r.title,
        chunkIndex: r.chunkIndex,
        score: r.score,
      })),
    });
  } catch (err: unknown) {
    console.error("Error in /chat:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
