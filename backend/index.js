const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

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
const interviewSessions = {};

app.post('/chat', async (req, res) => {
  const { message, language, profession } = req.body;
  const sessionId = req.headers['x-session-id'] || 'default';

  if (!interviewSessions[sessionId]) {
    interviewSessions[sessionId] = {
      history: [],
      questionCount: 0,
      language: language,
      profession: profession,
    };
  }

  const session = interviewSessions[sessionId];
  session.history.push({ role: 'user', parts: [{ text: message }] });
  session.questionCount++;

  console.log('Received message:', message);
  console.log(`Session ID: ${sessionId}, Profession: ${session.profession}`);

  let instruction = `You are an AI interview bot. Your purpose is to act as a professional recruiter and ask the user questions to assess their skills and experience. The interview is for the field of ${session.profession} in ${session.language}.`;

  if (session.questionCount <= 5) {
    instruction += ` Start with a casual and friendly tone. Ask one question at a time and wait for the user's response.`;
  } else if (session.questionCount > 5 && session.questionCount <= 15) {
    instruction += ` You are now in the main phase of the interview. Your questions should be more specific and challenging, focusing on the user's technical skills and experience. Ask one question at a time and wait for the user's response.`;
  } else if (session.questionCount > 15 && session.questionCount < 20) {
    instruction += ` You are nearing the end of the interview. Ask your final questions, which should be very challenging. Ask one question at a time and wait for the user's response.`;
  } else {
    instruction += ` The interview is complete. Thank the user for their time and tell them to hit the "Finish interview." button to end the session. Do not ask any more questions.`;
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: instruction,
    });

    // Send the entire history and the new message to the model
    const chatContent = session.history.slice(); // Use a copy of the history
    const result = await model.generateContent({
      contents: chatContent,
      generationConfig: {
        maxOutputTokens: 100,
      },
    });

    const reply = result.response.text();
    session.history.push({ role: 'model', parts: [{ text: reply }] });

    res.json({ reply });
  } catch (error) {
    console.error('Error generating AI response:', error);
    res.status(500).json({ reply: "Sorry, I'm having trouble connecting to the AI model. Please try again." });
  }
});

app.listen(port, () => {
  console.log(`Back-end server running at http://localhost:${port}`);
});