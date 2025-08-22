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

const createCEFRPrompt = (language, profession, botName) => {
  return `You are a language teacher named ${botName}. Your task is to conduct an interview in ${language} to assess the user's proficiency based on the Common European Framework of Reference for Languages (CEFR) standard.

Your instructions are as follows:
1.  **First Response:** Your first response must be a very short and simple greeting, like "Hello, how are you?". Your purpose is to determine if the user is beyond an A1 level. The tone should be very casual and friendly.
2.  **Progressive Difficulty:** If the user's responses indicate they can use more challenging language, ask more difficult questions to test for the next CEFR level. For example, if they demonstrate A1 skills, test for A2, and so on. Only introduce language related to the profession of ${profession} once the user has qualified for a higher level (B1 or above).
3.  **Handle Misunderstandings:** If the user fails to answer a question or clearly misunderstands you, rephrase the question using different words. You should try this up to three times. If the user still fails to respond appropriately after three attempts, conclude that they have not yet reached the level you were testing.
4.  **Conclude the Interview:** Once you have enough data to determine the user's final CEFR level, tell them that the interview has come to an end and that they can now press "Finish interview." After this point, you should no longer ask any questions.

Your responses should be in ${language}.`;
};

// Existing /chat endpoint for the conversational part of the interview
app.post('/chat', async (req, res) => {
  const { message, language, profession, botName, interviewerType } = req.body;
  const sessionId = req.headers['x-session-id'] || 'default';

  if (!interviewSessions[sessionId]) {
    interviewSessions[sessionId] = {
      history: [],
      language: language,
      profession: profession,
      interviewerType: interviewerType,
    };
  }

  const session = interviewSessions[sessionId];

  // The very first message is from the front-end to trigger the greeting.
  // The first user message is received after the initial greeting is sent.
  if (message && !message.startsWith('Generate a casual greeting')) {
    session.history.push({ role: 'user', parts: [{ text: message }] });
  }
  
  // This is a special case for the initial greeting and should be sent exactly as is
  let chatContents = [{ role: 'user', parts: [{ text: message }] }];
  if (message.startsWith('Generate a casual greeting')) {
    chatContents = [{ role: 'user', parts: [{ text: message }] }];
  } else {
    chatContents = session.history.slice();
  }

  console.log('Received message:', message);
  console.log(`Session ID: ${sessionId}, Profession: ${session.profession}, Interviewer Type: ${session.interviewerType}`);

  let instruction;
  if (session.interviewerType === 'languageProficiencyCEFR') {
    instruction = createCEFRPrompt(language, profession, botName, session.history);
  } else {
    instruction = `You are an AI assistant named ${botName}. Your purpose is to have a casual small talk conversation in ${language} about the field of ${session.profession}. The user is practicing their language skills, so respond in a friendly and conversational manner. Keep your responses concise and focused on the topic. Do not ask for their name again if you already have it.`;
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: instruction,
    });

    const result = await model.generateContent({
      contents: chatContents,
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

  let analysisPrompt;
  if (session.interviewerType === 'languageProficiencyCEFR') {
    analysisPrompt = `You are a language proficiency expert. Based on the conversation history provided below, determine the user's language proficiency level according to the Common European Framework of Reference for Languages (CEFR).

    Provide a detailed report in ${session.language} that includes the following:
    1.  **CEFR Level:** State the user's determined level (e.g., A1, B2, C1).
    2.  **Summary of Level:** Briefly explain what this level means in terms of language skills.
    3.  **Analysis:** Provide specific examples from the conversation that demonstrate why the user is at this level. Comment on their grammar, vocabulary, fluency, and overall communication ability.
    4.  **Recommendations:** Suggest concrete steps the user can take to improve their skills and reach the next CEFR level.

    The report should be professionally formatted and easy to read.

    Here is the conversation to analyze:
    ${conversationHistory.map(item => `${item.role === 'user' ? 'User' : 'Bot'}: ${item.parts[0].text}`).join('\n')}
    `;
  } else {
    analysisPrompt = `
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
  }

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
  console.log(`Back-end server running at http://86.60.227.111:${port}`);
});