import dns from "node:dns";
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config({ path: new URL("../.env", import.meta.url).pathname });

dns.setDefaultResultOrder("ipv4first");

const AI_TIMEOUT_MS = 15000;
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY?.trim(),
});

function json(res, status, body) {
  res.status(status);
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.end(JSON.stringify(body));
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    return json(res, 200, { ok: true });
  }

  if (req.method !== "POST") {
    return json(res, 405, { reply: "Method not allowed." });
  }

  try {
    const userMessage = req.body?.message?.trim();

    if (!userMessage) {
      return json(res, 400, { reply: "Please type something." });
    }

    if (!process.env.GROQ_API_KEY) {
      return json(res, 500, {
        reply: "The backend is missing the Groq API key. Please add GROQ_API_KEY in Vercel environment variables.",
      });
    }

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
      return json(res, 200, {
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

    return json(res, 200, { reply });
  } catch (error) {
    console.error("GROQ API ERROR:", error);

    const reply =
      error.message === "AI request timed out"
        ? "The AI service took too long to respond. Please try again in a moment."
        : "Sorry, something went wrong while contacting the AI service. Please try again.";

    return json(res, 500, { reply });
  }
}
