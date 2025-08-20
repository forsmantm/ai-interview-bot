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

// Existing /chat endpoint for the conversational part of the interview
app.post('/chat', async (req, res) => {
  const { message, language, profession, botName } = req.body;
  const sessionId = req.headers['x-session-id'] || 'default';

  if (!interviewSessions[sessionId]) {
    interviewSessions[sessionId] = {
      history: [],
      language: language,
      profession: profession,
    };
  }

  const session = interviewSessions[sessionId];

  if (message && !message.startsWith('Generate a casual greeting')) {
    session.history.push({ role: 'user', parts: [{ text: message }] });
  }

  console.log('Received message:', message);
  console.log(`Session ID: ${sessionId}, Profession: ${session.profession}`);

  const instruction = `You are an AI assistant named ${botName}. Your purpose is to have a casual small talk conversation in ${language} about the field of ${session.profession}. The user is practicing their language skills, so respond in a friendly and conversational manner. Keep your responses concise and focused on the topic. Do not ask for their name again if you already have it.`;

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: instruction,
    });

    let chatContent;
    if (message.startsWith('Generate a casual greeting')) {
      chatContent = [{ role: 'user', parts: [{ text: message }] }];
    } else {
      chatContent = session.history.slice();
    }

    const result = await model.generateContent({
      contents: chatContent,
      generationConfig: {
        maxOutputTokens: 100,
      },
    });

    const reply = result.response.text();
    
    if (!message.startsWith('Generate a casual greeting')) {
      session.history.push({ role: 'model', parts: [{ text: reply }] });
    }

    res.json({ reply });
  } catch (error) {
    console.error('Error generating AI response:', error);
    res.status(500).json({ reply: "Sorry, I'm having trouble connecting to the AI model. Please try again." });
  }
});

// New /analyze endpoint to generate a language proficiency report
app.post('/analyze', async (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId || !interviewSessions[sessionId]) {
    return res.status(404).json({ error: 'Session not found.' });
  }

  const session = interviewSessions[sessionId];
  const conversationHistory = session.history;

  // Formulate a detailed prompt for the AI to perform a language analysis
  const analysisPrompt = `
  You are a language proficiency expert. Your task is to analyze a conversation in ${session.language} about the profession of ${session.profession} to assess the user's language skills.
  
  Provide a detailed report that evaluates the user's performance in the following areas:
  1.  **Grammar and Syntax:** Comment on the accuracy of sentence structure and verb tense.
  2.  **Vocabulary:** Assess the range and appropriateness of the vocabulary used.
  3.  **Fluency and Cohesion:** Evaluate the flow of the conversation and how well the user connected their ideas.
  4.  **Relevance to Topic:** Judge how well the user's responses stayed on topic with the profession of ${session.profession}.
  
  Please provide a summary and a final recommendation for areas of improvement. The report should be easy to read and formatted clearly.
  
  Here is the conversation to analyze:
  ${conversationHistory.map(item => `${item.role === 'user' ? 'User' : 'Bot'}: ${item.parts[0].text}`).join('\n')}
  `;

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: analysisPrompt }] }],
    });

    const analysisReport = result.response.text();
    res.json({ analysis: analysisReport });
  } catch (error) {
    console.error('Error generating analysis report:', error);
    res.status(500).json({ error: "Sorry, I'm unable to generate the analysis report at this time." });
  }
});

app.listen(port, () => {
  console.log(`Back-end server running at http://localhost:${port}`);
});