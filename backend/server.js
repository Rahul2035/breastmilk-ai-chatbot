import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";
import dns from "node:dns";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, ".env");
dotenv.config({ path: envPath });
dns.setDefaultResultOrder("ipv4first");

const app = express();
const AI_TIMEOUT_MS = 15000;

app.use(cors());
app.use(express.json());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Groq AI backend is running" });
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    provider: "groq",
    apiKeyConfigured: Boolean(process.env.GROQ_API_KEY),
  });
});

app.post("/chat", async (req, res) => {
  try {
    const userMessage = req.body?.message?.trim();

    if (!userMessage) {
      return res.status(400).json({ reply: "Please type something." });
    }

    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({
        reply: "The backend is missing the Groq API key. Please add GROQ_API_KEY in backend/.env.",
      });
    }

    const groq = getGroqClient();

    const creatorQuestions = [
      "who is your creator",
      "who created you",
      "who made you",
      "your creator",
      "your owner",
      "who developed you",
    ];

    const lowerMsg = userMessage.toLowerCase();

    if (creatorQuestions.some((q) => lowerMsg.includes(q))) {
      return res.json({
        reply: "Rahul Suresh is the creator of AI Breast Milk Buddy.",
      });
    }

    const completion = await Promise.race([
      groq.chat.completions.create({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content:
              "You are Breastmilk AI Buddy, a friendly and helpful AI assistant. You can answer general questions on any topic, including everyday knowledge, sports, current affairs, and practical advice. When the user asks about breast milk donation, storage, safety, screening, pumping, newborn feeding, or milk banks, give especially clear, supportive, and practical answers. If the user asks about very recent or live events, answer carefully and mention when information may change quickly.",
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
        temperature: 0.7,
        max_tokens: 400,
      }),
      new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error("AI request timed out"));
        }, AI_TIMEOUT_MS);
      }),
    ]);

    const reply =
      completion.choices?.[0]?.message?.content ||
      "I could not generate a reply right now. Please try again.";

    return res.json({ reply });
  } catch (error) {
    console.error("GROQ API ERROR:", error);

    const reply =
      error.message === "AI request timed out"
        ? "The AI service took too long to respond. Please try again in a moment."
        : "Sorry, something went wrong while contacting the AI service. Please try again.";

    return res.status(500).json({
      reply,
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Groq AI Chatbot running on port ${PORT}`);
});
