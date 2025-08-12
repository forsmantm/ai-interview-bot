const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config(); // Load environment variables from .env file

const API_KEY = process.env.GOOGLE_API_KEY;

if (!API_KEY) {
  console.error("Error: GOOGLE_API_KEY is not set in the .env file.");
  process.exit(1);
}

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: "You are an AI interview bot. Your purpose is to act as a recruiter and ask the user questions to assess their skills and experience. Ask one question at a time and wait for the user's response. Your questions should be challenging but fair. Maintain a professional and encouraging tone.",
});

app.post('/chat', async (req, res) => {
  const { message } = req.body;
  console.log('Received message:', message);

  try {
    const chat = model.startChat({
      history: [],
      generationConfig: {
        maxOutputTokens: 100,
      },
    });

    const result = await chat.sendMessage(message);
    const reply = result.response.text();

    res.json({ reply });
  } catch (error) {
    console.error('Error generating AI response:', error);
    res.status(500).json({ reply: "Sorry, I'm having trouble connecting to the AI model. Please try again." });
  }
});

app.listen(port, () => {
  console.log(`Back-end server running at http://localhost:${port}`);
});