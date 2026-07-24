import express from "express";
import path from "path";
import 'dotenv/config';
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
console.log("Loaded API Key:", process.env.GEMINI_API_KEY);
console.log("Current directory:", process.cwd());

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini AI client on server side
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // API Route: Detect Career Path Advice from Daily Journals & Events
  app.post("/api/career-advice", async (req, res) => {
    try {
      const { journals = {}, events = [], userName = "Friend" } = req.body;

      const journalEntries = Object.entries(journals)
        .map(([lvl, text]) => `Day/Level ${lvl}: "${text}"`)
        .join("\n");

      const eventLogs = Array.isArray(events) && events.length > 0
        ? events.map(e => `- ${e}`).join("\n")
        : "No extra events logged yet.";

      const prompt = `
You are an expert AI Career Guidance Counselor & Behavioral Scientist.
Analyze the user's daily journal reflections, cognitive reframe notes, and logged events/habits.

User Name: ${userName}

--- USER DAILY JOURNALS ---
${journalEntries || "No journal entries recorded yet. (User is just starting out!)"}

--- LOGGED EVENTS & CBT REFRAMES ---
${eventLogs}

--- TASK ---
Based on the emotional tone, expressed interests, problem-solving habits, values, and psychological insights in these journals and events:
1. Provide a sweet, encouraging career synthesis tailored to ${userName}.
2. Recommend 3 highly suitable, realistic career paths with match percentages and why they fit based on journal patterns.
3. Identify 4 key psychological & professional strengths evident in their writing.
4. Give 3 concrete, actionable next steps they can take today to explore these careers.
5. Provide a short, uplifting mascot quote.

Return the result as a valid JSON object matching the requested structure.
`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are Lumo, an empathetic, insightful AI career & growth counselor.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: {
                type: Type.STRING,
                description: "Warm, insightful summary analyzing the user's journal entries and personality traits."
              },
              recommendedPaths: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    matchPercentage: { type: Type.INTEGER },
                    whyItFits: { type: Type.STRING },
                    keySkillsToLeverage: { type: Type.ARRAY, items: { type: Type.STRING } },
                    firstStep: { type: Type.STRING }
                  },
                  required: ["title", "matchPercentage", "whyItFits", "keySkillsToLeverage", "firstStep"]
                },
                description: "3 top recommended career paths."
              },
              detectedStrengths: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "4 key strengths detected from journals and events."
              },
              actionableNextSteps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "3 practical action steps for career exploration."
              },
              encouragingQuote: {
                type: Type.STRING,
                description: "An inspiring owl mascot quote."
              }
            },
            required: ["summary", "recommendedPaths", "detectedStrengths", "actionableNextSteps", "encouragingQuote"]
          }
        }
      });

      const resultText = response.text || "{}";
      const parsedData = JSON.parse(resultText);

      res.json({ success: true, data: parsedData });
    } catch (error: any) {
      console.error("Error generating career advice:", error);
      res.status(500).json({
        success: false,
        error: error?.message || "Failed to analyze journals for career advice."
      });
    }
  });

  // API Route: AI Cognitive Reframing using Gemini API
  app.post("/api/generate-reframe", async (req, res) => {
    try {
      const { userThought, context } = req.body;

      const prompt = `The user shared a thought, concern, or response: "${userThought || 'I feel nervous about speaking or interviewing'}".
Context: ${context || 'Interview or presentation practice'}.

Generate 3 powerful, encouraging, and highly specific Cognitive Reframing statements (CBT-style) that help reframe anxiety or self-doubt into confidence and growth mindsets. Return a JSON object with a "reframes" array containing 3 string statements.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reframes: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "3 cognitive reframing statements."
              }
            },
            required: ["reframes"]
          }
        }
      });

      const data = JSON.parse(response.text || '{"reframes":[]}');
      res.json({ success: true, reframes: data.reframes || [] });
    } catch (error: any) {
      console.error("Error generating reframes:", error);
      res.status(500).json({ success: false, error: "Failed to generate reframes" });
    }
  });

  // API Route: Socio Chat Communication using Gemini API
  app.post("/api/socio-chat", async (req, res) => {
    try {
      const { message, history = [], imageBase64, mimeType, fileName, fileData, sessionId = "default-session" } = req.body;

      // Handle either legacy imageBase64 or new fileData attachment object
      const attachment = fileData || (imageBase64 ? { base64: imageBase64, mimeType, fileName } : null);

      // System Instructions for Lumo
      const systemInstruction = `You are Lumo (also known as Mascot), a deeply caring, empathetic AI friend, emotional support companion, and expert interview/presentation practice coach.

CRITICAL CONVERSATIONAL & EMOTIONAL SUPPORT RULES:
1. CONTINUOUS CONVERSATIONAL MEMORY & PERSISTENT SESSION:
   - You are engaged in a persistent, ongoing chat session with your close friend.
   - ALWAYS read and remember the entire conversation history provided.
   - Reference previous user responses, job goals, slide details, emotional disclosures, or achievements mentioned earlier.
   - NEVER repeat questions, greeting scripts, or generic fallback phrases.

2. EMPATHY FIRST & EMOTIONAL RESPONSIVENESS:
   - When the user shares ANY emotion (stress, anxiety, sadness, loneliness, fear, anger, excitement, fatigue, happiness):
     a) Respond with deep empathy, genuine warmth, and validation FIRST before asking any question.
     b) Gently explore what they are experiencing with caring, open follow-up questions.
     c) Offer practical grounding exercises (like 4-7-8 breathing), gentle CBT reframing, or reassuring pep talks when helpful.

3. NATURAL, CONCISE, SPOKEN-VOICE FRIENDLY:
   - Speak in a warm, natural, best-friend voice (2 to 4 sentences max per turn).
   - Keep language easygoing, conversational, and energetic so it sounds completely natural when read or spoken aloud via voice synthesis.
   - Ensure every turn naturally moves the conversation forward without ever sounding like a scripted chatbot.`;

      // Prepare current turn parts
      const currentParts: any[] = [];
      if (attachment?.base64 && attachment?.mimeType) {
        const type = attachment.mimeType.toLowerCase();
        if (type.startsWith("image/") || type === "application/pdf" || type.startsWith("audio/")) {
          currentParts.push({
            inlineData: {
              data: attachment.base64,
              mimeType: attachment.mimeType
            }
          });
        } else {
          try {
            const decodedText = Buffer.from(attachment.base64, 'base64').toString('utf-8');
            currentParts.push({
              text: `[Attached Document: ${attachment.fileName || 'File'}]\nContent:\n${decodedText}`
            });
          } catch (e) {
            currentParts.push({
              inlineData: {
                data: attachment.base64,
                mimeType: attachment.mimeType
              }
            });
          }
        }
      }

      if (message && typeof message === 'string' && message.trim().length > 0) {
        currentParts.push({ text: message.trim() });
      }

      if (currentParts.length === 0) {
        return res.status(400).json({ success: false, error: "Message or valid file attachment is required." });
      }

      // Format previous chat history cleanly with alternating user and model roles
      const formattedHistory: any[] = [];
      if (Array.isArray(history) && history.length > 0) {
        for (const item of history) {
          if (!item || !item.text || typeof item.text !== 'string' || !item.text.trim()) continue;
          const role = item.sender === 'user' ? 'user' : 'model';
          const last = formattedHistory[formattedHistory.length - 1];

          if (last && last.role === role) {
            last.parts[0].text += `\n${item.text.trim()}`;
          } else {
            formattedHistory.push({
              role,
              parts: [{ text: item.text.trim() }]
            });
          }
        }
      }

      // CRITICAL FIX: Gemini API requires that the first content item in history MUST have role 'user'.
      // Drop leading 'model' entries (such as initial greeting messages sent by the UI) so Gemini history validly starts with 'user'.
      while (formattedHistory.length > 0 && formattedHistory[0].role === 'model') {
        formattedHistory.shift();
      }

      // Build full contents array for Gemini API call
      const contents = [
        ...formattedHistory,
        {
          role: 'user',
          parts: currentParts
        }
      ];

      console.log("\n=======================================================");
      console.log("[/api/socio-chat] REQUEST RECEIVED");
      console.log("Session ID:", sessionId);
      console.log("Latest User Message:", message);
      console.log("Attachment present:", !!attachment);
      console.log("Formatted History Turns:", formattedHistory.length);
      console.log("Full Contents Payload Sent to Gemini:");
      console.log(JSON.stringify(contents, null, 2));
      console.log("=======================================================\n");

      let response: any;
      try {
        response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents,
          config: {
            systemInstruction,
            temperature: 0.8,
          }
        });
      } catch (firstError: any) {
        console.warn("[/api/socio-chat] Primary model (gemini-3.6-flash) failed, attempting fallback to gemini-flash-latest:", firstError?.message || firstError);
        try {
          response = await ai.models.generateContent({
            model: "gemini-flash-latest",
            contents,
            config: {
              systemInstruction,
              temperature: 0.8,
            }
          });
        } catch (secondError: any) {
          console.warn("[/api/socio-chat] Secondary model (gemini-flash-latest) failed, attempting fallback to gemini-3.1-flash-lite:", secondError?.message || secondError);
          response = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents,
            config: {
              systemInstruction,
              temperature: 0.8,
            }
          });
        }
      }

      console.log("=======================================================");
      console.log("[/api/socio-chat] GEMINI RESPONSE RECEIVED:");
      console.log(response.text);
      console.log("=======================================================\n");

      if (!response.text) {
        throw new Error("Gemini API returned empty text.");
      }

      res.json({ success: true, text: response.text, sessionId });
    } catch (error: any) {
      console.error("[/api/socio-chat] ERROR IN API:", error);
      res.status(500).json({
        success: false,
        error: error?.message || "Failed to communicate with Gemini AI."
      });
    }
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
