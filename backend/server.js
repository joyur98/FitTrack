import express from "express";
import cors from "cors";
import { pipeline } from "@xenova/transformers";
import { INTENTS } from "./intents.js";

const BACKEND_URL = "http://192.168.1.69:3000/chat";
const app = express();
app.use(cors());
app.use(express.json());

console.log("Loading MiniLM...");
const extractor = await pipeline(
  "feature-extraction",
  "Xenova/all-MiniLM-L6-v2"
);
console.log("MiniLM loaded");

// Precompute intent embeddings
console.log("Precomputing intent embeddings...");
for (const intent of INTENTS) {
  intent.embeddings = [];

  for (const example of intent.examples) {
   const output = await extractor(example, {
    pooling: "mean",
    normalize: true,
  });

    const embedding = output.data;

    intent.embeddings.push(embedding);
  }
}
console.log("Intent embeddings ready");


// Utility: cosine similarity
function cosineSimilarity(a, b) {
  const dot = [...a].reduce((sum, v, i) => sum + v * b[i], 0);
  const magA = Math.sqrt(
    [...a].reduce((sum, v) => sum + v * v, 0)
  );
  const magB = Math.sqrt(
    [...b].reduce((sum, v) => sum + v * v, 0)
  );
  return dot / (magA * magB);
}

app.post("/chat", async (req, res) => {
  const userText = req.body.message.toLowerCase();

 const userOutput = await extractor(userText, {
  pooling: "mean",
  normalize: true,
});

  const userEmbedding = userOutput.data;


  let bestScore = 0;
  let bestIntent = null;

  for (const intent of INTENTS) {
    for (const exampleEmbedding of intent.embeddings) {
      const score = cosineSimilarity(userEmbedding, exampleEmbedding);

      if (score > bestScore) {
        bestScore = score;
        bestIntent = intent;
      }
    }
  }

  console.log("Best score:", bestScore, "Intent:", bestIntent?.label);

  if (bestScore < 0.25) {
    return res.json({
      reply: "I can help with fitness, workouts, nutrition, and calories.",
    });
  }

 const reply =
  typeof bestIntent.response === "function"
    ? bestIntent.response({ text: userText })
    : bestIntent.response;

res.json({ reply });
});


app.listen(3000, () => {
  console.log("FitTrack AI running on port 3000");
});
