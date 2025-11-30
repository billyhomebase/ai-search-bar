// src/search/searchChunks.ts

import fs from "fs";
import path from "path";
import OpenAI from "openai";

// ------------------ Types ------------------

export interface Chunk {
  chunkIndex: number;
  text: string;
  embedding: number[];
}

export interface Article {
  entryId: string;
  url: string;
  title: string;
  headings: string;
  type: string;
  tags: string[];
  news: string;
  chunks: Chunk[];
}

export interface FlatChunkDoc {
  entryId: string;
  url: string;
  title: string;
  headings: string;
  type: string;
  tags: string[];
  chunkIndex: number;
  text: string;
  embedding: number[];
}

export interface ScoredChunk extends FlatChunkDoc {
  score: number;
}

// ------------------ OpenAI ------------------

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

// ------------------ Load + Flatten ------------------

const DATA_FILE = path.join(
  process.cwd(),
  "./data/canonical-articles-with-embeddings.json"
);

let INDEX: FlatChunkDoc[] = [];

function loadIndex() {
  const raw = fs.readFileSync(DATA_FILE, "utf8");
  const articles: Article[] = JSON.parse(raw);

  INDEX = [];

  for (const article of articles) {
    if (!Array.isArray(article.chunks)) continue;

    for (const chunk of article.chunks) {
      if (!chunk.text || !Array.isArray(chunk.embedding)) continue;

      INDEX.push({
        entryId: article.entryId,
        url: article.url,
        title: article.title,
        headings: article.headings,
        type: article.type,
        tags: article.tags,
        chunkIndex: chunk.chunkIndex,
        text: chunk.text,
        embedding: chunk.embedding,
      });
    }
  }

  console.log(
    `Loaded ${articles.length} articles → ${INDEX.length} chunk embeddings.`
  );
}

loadIndex();

// ------------------ Helpers ------------------

/** Cosine similarity between two number vectors */
export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let na = 0;
  let nb = 0;

  for (let i = 0; i < a.length; i++) {
    const av = a[i];
    const bv = b[i];
    dot += av * bv;
    na += av * av;
    nb += bv * bv;
  }

  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

async function embedQuery(question: string): Promise<number[]> {
  const res = await openai.embeddings.create({
    model: "text-embedding-3-large",
    input: question,
  });

  return res.data[0].embedding as number[];
}

// ------------------ Main Search Function ------------------

/**
 * Search top chunk matches for a question.
 *
 * @param question - user query string
 * @param topK - number of chunks to return
 */
export async function searchChunks(
  question: string,
  topK = 8
): Promise<ScoredChunk[]> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  if (!question || typeof question !== "string") {
    throw new Error("Invalid question string");
  }

  const queryEmbedding = await embedQuery(question);

  // Score all chunks
  const scored: ScoredChunk[] = INDEX.map((doc) => ({
    ...doc,
    score: cosineSimilarity(queryEmbedding, doc.embedding),
  }));

  // Sort high → low
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, topK);
}
