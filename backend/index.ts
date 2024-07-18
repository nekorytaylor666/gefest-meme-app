import express from "express";
import { loadSummarizationChain } from "langchain/chains";
import { ChatAnthropic } from "@langchain/anthropic";
import fetch from "node-fetch";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import dotenv from "dotenv";
import { OpenAI } from "@langchain/openai";
import cors from "cors";

dotenv.config();

const app = express();
const port = 3000;
app.use(cors());

app.use(express.json());

const model = new OpenAI({ temperature: 0, model: "gpt-3.5-turbo" });

app.post("/summarize", async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    // Fetch PDF from URL
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: "application/pdf" });
    const pdfLoader = new PDFLoader(blob);
    const docs = await pdfLoader.load();
    console.log(docs);

    const chain = loadSummarizationChain(model, { type: "map_reduce" });
    const summary = await chain.call({
      input_documents: docs,
    });

    // Translate summary to Russian and explain with memes in a single prompt
    const combinedPrompt = `Translate the following summary to Russian and then explain it using popular internet memes:

Summary:
${summary.text}

Your response should be in Russian and should include:
1. The translated summary
2. Should be explained so middle schoolers can understand it

Please separate the translated summary and the meme explanation with a line break.`;

    const combinedResponse = await model.invoke(combinedPrompt);

    console.log(combinedResponse);
    res.json({
      originalSummary: summary.text,
      russianSummaryAndMemes: combinedResponse,
    });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ error: "An error occurred while processing the request" });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
