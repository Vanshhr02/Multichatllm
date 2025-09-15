import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.post("/ask", async (req, res) => {
  const { prompt, models } = req.body;

  if (!prompt || !models || models.length === 0) {
    return res.status(400).json({ error: "Prompt and models are required." });
  }

  const responses = {};

  for (let model of models) {
    try {
      if (model === "ChatGPT") {
        const openaiRes = await axios.post(
          "https://api.openai.com/v1/chat/completions",
          {
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: prompt }],
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );
        responses["ChatGPT"] =
          openaiRes.data.choices[0].message.content.trim();
      }

      if (model === "Gemini") {
  try {
    const geminiRes = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": process.env.GEMINI_API_KEY,
        },
      }
    );

    responses["Gemini"] =
      geminiRes.data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No response from Gemini";
  } catch (err) {
    console.error("Gemini API error:", err.response?.data || err.message);
    responses["Gemini"] = "Error fetching response from Gemini";
  }
}


      if (model === "Claude") {
        const claudeRes = await axios.post(
          "https://api.anthropic.com/v1/messages",
          {
            model: "claude-3-sonnet-20240229",
            max_tokens: 300,
            messages: [{ role: "user", content: prompt }],
          },
          {
            headers: {
              "x-api-key": process.env.CLAUDE_API_KEY,
              "Content-Type": "application/json",
              "anthropic-version": "2023-06-01",
            },
          }
        );
        responses["Claude"] = claudeRes.data.content[0].text.trim();
      }
    } catch (err) {
      console.error(`${model} API error:`, err.message);
      responses[model] = "Error fetching response from " + model;
    }
  }

  res.json(responses);
});

const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
