import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { GoogleGenAI, Type } from "@google/genai";
import 'dotenv/config';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY?.trim() || "";
const HAS_GEMINI_KEY = Boolean(GEMINI_API_KEY && GEMINI_API_KEY !== "your_gemini_api_key_here");

console.log("Loaded API Key:", HAS_GEMINI_KEY ? "PRESENT" : "MISSING");
if (!HAS_GEMINI_KEY) {
  console.warn("GEMINI_API_KEY is not set. Copy .env.example to .env and add your key from https://aistudio.google.com/apikey");
}
console.log("Current directory:", process.cwd());

// Data persistence file path
const isVercel = Boolean(process.env.VERCEL);
const DATA_FILE = isVercel 
  ? path.join("/tmp", ".lumo_db.json") 
  : path.join(process.cwd(), ".lumo_db.json");

// Copy seed database to /tmp if running on Vercel and it doesn't exist
if (isVercel && !fs.existsSync(DATA_FILE)) {
  const initialDbPath = path.join(process.cwd(), ".lumo_db.json");
  if (fs.existsSync(initialDbPath)) {
    try {
      fs.copyFileSync(initialDbPath, DATA_FILE);
      console.log("Copied database seed to /tmp/.lumo_db.json");
    } catch (e) {
      console.error("Failed to copy database seed to /tmp:", e);
    }
  }
}

interface UserEntity {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  username?: string;
  currentCycle: number;
  currentLevel: number;
  lastJournalTimestamp: string | null;
  createdAt: string;
  updatedAt: string;
}

interface JournalEntryEntity {
  id: string;
  userId: string;
  cycle: number;
  level: number;
  content: string;
  moodTag: string;
  reflectionScore: number;
  createdAt: string;
}

interface CareerPredictionEntity {
  id: string;
  userId: string;
  cycle: number;
  topCareers: any[];
  strengthsSummary: string[];
  growthRoadmap: string[];
  summary: string;
  generatedAt: string;
}

interface DatabaseSchema {
  users: Record<string, UserEntity>;
  journalEntries: JournalEntryEntity[];
  careerPredictions: CareerPredictionEntity[];
}

// Load or initialize DB store
function loadDatabase(): DatabaseSchema {
  let db: DatabaseSchema;
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      db = JSON.parse(raw);
    } else {
      db = { users: {}, journalEntries: [], careerPredictions: [] };
    }
  } catch (e) {
    console.error("Failed to load database file, initializing default:", e);
    db = { users: {}, journalEntries: [], careerPredictions: [] };
  }

  ensureSeededUsers(db);
  saveDatabase(db);
  return db;
}

function ensureSeededUsers(db: DatabaseSchema) {
  if (!db.users) db.users = {};
  if (!db.journalEntries) db.journalEntries = [];
  if (!db.careerPredictions) db.careerPredictions = [];

  // Default demo user
  const demoUserId = "user_demo_123";
  if (!db.users[demoUserId]) {
    db.users[demoUserId] = {
      id: demoUserId,
      email: "explorer@lumo.app",
      passwordHash: hashPassword("password123"),
      fullName: "Explorer",
      username: "explorer_user",
      currentCycle: 1,
      currentLevel: 3,
      lastJournalTimestamp: new Date(Date.now() - 25 * 3600 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
}

function saveDatabase(db: DatabaseSchema) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to save database file:", e);
  }
}

// Auth Helpers
const JWT_SECRET = process.env.JWT_SECRET || "lumo_super_secret_jwt_key_2026";

function hashPassword(password: string): string {
  return crypto.createHmac("sha256", JWT_SECRET).update(password).digest("hex");
}

function generateToken(userId: string): string {
  const payload = `${userId}:${Date.now() + 30 * 24 * 3600 * 1000}`;
  const sig = crypto.createHmac("sha256", JWT_SECRET).update(payload).digest("hex");
  return Buffer.from(`${payload}:${sig}`).toString("base64url");
}

function verifyToken(token: string): string | null {
  try {
    if (!token) return null;
    const decoded = Buffer.from(token, "base64url").toString("utf-8");
    const [userId, expiryStr, sig] = decoded.split(":");
    if (!userId || !expiryStr || !sig) return null;
    if (Date.now() > parseInt(expiryStr, 10)) return null;
    
    const expectedSig = crypto.createHmac("sha256", JWT_SECRET).update(`${userId}:${expiryStr}`).digest("hex");
    if (sig !== expectedSig) return null;

    return userId;
  } catch (e) {
    return null;
  }
}

// Global DB in memory
const db = loadDatabase();

function sanitizeUser(user: UserEntity) {
  const { passwordHash, ...rest } = user;
  return rest;
}

export const app = express();
app.use(express.json({ limit: '10mb' }));

  // Helper to safely obtain Gemini AI client
  const getAi = () => {
    if (!HAS_GEMINI_KEY) {
      throw new Error("GEMINI_API_KEY is not configured. Add it to your .env file.");
    }
    return new GoogleGenAI({
      apiKey: GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // Authentication Middleware
  const authenticateUser = (req: any, res: any, next: any) => {
    try {
      const authHeader = req.headers.authorization;
      let userId: string | null = null;

      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        userId = verifyToken(token);
      } else if (req.headers["x-user-id"]) {
        userId = req.headers["x-user-id"] as string;
      }

      if (userId && db.users[userId]) {
        req.user = db.users[userId];
      } else if (userId) {
        // Token/userId present but user not found in DB — invalid
        return res.status(401).json({ success: false, error: "User not found. Please login again." });
      } else {
        // No valid authentication provided
        // Fallback: use demo user for frictionless frontend testing
        const demoFallback = Object.values(db.users)[0];
        if (demoFallback) {
          req.user = demoFallback;
        } else {
          return res.status(401).json({ success: false, error: "Authentication required." });
        }
      }

      next();
    } catch (authError: any) {
      console.error("[authenticateUser] Error:", authError);
      return res.status(500).json({ success: false, error: "Authentication error." });
    }
  };

  // Wraps async Express route handlers so unhandled promise rejections are
  // forwarded to the global Express error handler instead of crashing the function.
  const asyncHandler = (fn: Function) => (req: any, res: any, next: any) =>
    Promise.resolve(fn(req, res, next)).catch(next);

  // ------------------------------------------------------------------
  // 1. AUTHENTICATION & USER MANAGEMENT ENDPOINTS
  // ------------------------------------------------------------------

  // POST /api/auth/register - Register new user
  app.post("/api/auth/register", (req, res) => {
    try {
      const { email, password, fullName, username } = req.body;

      if (!email || !password) {
        return res.status(400).json({ success: false, error: "Email and password are required." });
      }

      const normalizedEmail = email.toLowerCase().trim();
      const existingUser = Object.values(db.users).find(u => u.email === normalizedEmail);

      if (existingUser) {
        return res.status(400).json({ success: false, error: "An account with this email already exists." });
      }

      const cleanUsername = (username || fullName || normalizedEmail.split("@")[0]).trim().toLowerCase().replace(/[^a-z0-9_]/g, '');

      const userId = "user_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
      const newUser: UserEntity = {
        id: userId,
        email: normalizedEmail,
        passwordHash: hashPassword(password),
        fullName: fullName?.trim() || cleanUsername || "Explorer",
        username: cleanUsername,
        currentCycle: 1,
        currentLevel: 0,
        lastJournalTimestamp: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      db.users[userId] = newUser;
      saveDatabase(db);

      const token = generateToken(userId);
      res.status(201).json({
        success: true,
        message: "User registered successfully",
        token,
        user: sanitizeUser(newUser)
      });
    } catch (e: any) {
      console.error("Error in /api/auth/register:", e);
      res.status(500).json({ success: false, error: e.message || "Registration failed" });
    }
  });

  // POST /api/auth/login - Login & return JWT (supports email or username)
  app.post("/api/auth/login", (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ success: false, error: "Email/username and password are required." });
      }

      const normalizedInput = email.toLowerCase().trim();
      const user = Object.values(db.users).find(u => 
        u.email === normalizedInput || (u.username && u.username.toLowerCase() === normalizedInput)
      );

      if (!user || user.passwordHash !== hashPassword(password)) {
        return res.status(401).json({ success: false, error: "Invalid email/username or password." });
      }

      const token = generateToken(user.id);
      res.json({
        success: true,
        message: "Login successful",
        token,
        user: sanitizeUser(user)
      });
    } catch (e: any) {
      console.error("Error in /api/auth/login:", e);
      res.status(500).json({ success: false, error: e.message || "Login failed" });
    }
  });

  // POST /api/user/update-profile - Update user name/username
  app.post("/api/user/update-profile", authenticateUser, (req: any, res) => {
    try {
      const user: UserEntity = req.user;
      if (!user) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }
      const { fullName, username } = req.body;
      if (fullName) user.fullName = fullName.trim();
      if (username) user.username = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
      user.updatedAt = new Date().toISOString();
      db.users[user.id] = user;
      saveDatabase(db);
      res.json({ success: true, user: sanitizeUser(user) });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // GET /api/user/status - Returns current user status & 24h timer status
  app.get("/api/user/status", authenticateUser, (req: any, res) => {
    try {
      const user: UserEntity = req.user;
      if (!user) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      const now = Date.now();
      let lastTime = user.lastJournalTimestamp ? new Date(user.lastJournalTimestamp).getTime() : 0;
      let timePassed = now - lastTime;
      const cooldownMs = 24 * 60 * 60 * 1000;
      
      const canJournalToday = !user.lastJournalTimestamp || timePassed >= cooldownMs;
      const timeRemainingMs = canJournalToday ? 0 : Math.max(0, cooldownMs - timePassed);
      
      // Calculate next available time ISO
      const nextAvailableTime = canJournalToday 
        ? null 
        : new Date(lastTime + cooldownMs).toISOString();

      res.json({
        success: true,
        user: {
          ...sanitizeUser(user),
          canJournalToday,
          timeRemainingSeconds: Math.ceil(timeRemainingMs / 1000),
          nextAvailableTime
        }
      });
    } catch (e: any) {
      console.error("Error in /api/user/status:", e);
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // ------------------------------------------------------------------
  // 2. 24-HOUR JOURNAL LEVELING & DB RECORDING ENDPOINTS
  // ------------------------------------------------------------------

  // Helper function: Perform Gemini 30-Day Synthesis for completed level 30
  async function perform30DayCareerSynthesis(user: UserEntity) {
    try {
      const userCycleEntries = db.journalEntries.filter(
        j => j.userId === user.id && j.cycle === user.currentCycle
      );

      const journalSummaryText = userCycleEntries
        .sort((a, b) => a.level - b.level)
        .map(e => `Level ${e.level} (Mood: ${e.moodTag}): "${e.content}"`)
        .join("\n\n");

      const prompt = `Analyze these 30 daily reflections from the user. Extract key emotional patterns, problem-solving habits, core passions, and personal strengths. Generate a structured 360° Career Path Prediction including:
- Top 3 Recommended Career Paths / Roles
- Core Strengths & Values
- 30-Day Growth Synthesis Summary
- Actionable Next Steps & Skill Growth Roadmap.

--- USER 30-DAY REFLECTIONS ---
User: ${user.fullName}
Cycle: ${user.currentCycle}
${journalSummaryText || "User completed 30 reflections."}`;

      const response = await getAi().models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are Lumo AI, a master behavioral scientist & career counselor.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              topCareers: {
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
                description: "Top 3 Recommended Career Paths"
              },
              strengthsSummary: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Core Strengths & Values"
              },
              summary: {
                type: Type.STRING,
                description: "30-Day Growth Synthesis Summary"
              },
              growthRoadmap: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Actionable Next Steps & Skill Growth Roadmap"
              }
            },
            required: ["topCareers", "strengthsSummary", "summary", "growthRoadmap"]
          }
        }
      });

      const parsedData = JSON.parse(response.text || "{}");

      const prediction: CareerPredictionEntity = {
        id: "career_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
        userId: user.id,
        cycle: user.currentCycle,
        topCareers: parsedData.topCareers || [],
        strengthsSummary: parsedData.strengthsSummary || [],
        growthRoadmap: parsedData.growthRoadmap || [],
        summary: parsedData.summary || "Congratulations on completing your 30-day reflection cycle!",
        generatedAt: new Date().toISOString()
      };

      db.careerPredictions.push(prediction);
      saveDatabase(db);

      return prediction;
    } catch (error) {
      console.error("Error running 30-day career synthesis:", error);
      // Fallback prediction record
      const fallbackPrediction: CareerPredictionEntity = {
        id: "career_fb_" + Date.now(),
        userId: user.id,
        cycle: user.currentCycle,
        topCareers: [
          {
            title: "Product Strategy & UX Director",
            matchPercentage: 96,
            whyItFits: "Your 30 reflections showcase deep empathetic communication, systematic reflection, and creative problem-solving.",
            keySkillsToLeverage: ["Empathy", "Strategic Design", "Leadership"],
            firstStep: "Build a portfolio project demonstrating user-centric strategy."
          },
          {
            title: "AI Behavioral Solutions Lead",
            matchPercentage: 92,
            whyItFits: "Strong alignment with human-centric technology and mindfulness tools.",
            keySkillsToLeverage: ["Cognitive Design", "Empathy", "Agile Leadership"],
            firstStep: "Explore AI workflow certifications."
          },
          {
            title: "Creative Innovation Strategist",
            matchPercentage: 89,
            whyItFits: "High curiosity and consistent self-improvement mindset.",
            keySkillsToLeverage: ["Storytelling", "Synthesis", "Growth Mindset"],
            firstStep: "Write an article synthesizing your 30-day growth learnings."
          }
        ],
        strengthsSummary: [
          "Empathetic & Clear Communication",
          "Structured Self-Reflection & Resilience",
          "Systematic Problem Solving",
          "Continuous Growth Mindset"
        ],
        growthRoadmap: [
          "Take on a cross-functional leadership initiative",
          "Publish your 30-day growth synthesis to mentor others",
          "Master advance decision-making and cognitive reframing tools"
        ],
        summary: "Over your 30 days of mindful journaling, you demonstrated consistent self-awareness, emotional resilience, and a talent for strategic reflection.",
        generatedAt: new Date().toISOString()
      };

      db.careerPredictions.push(fallbackPrediction);
      saveDatabase(db);
      return fallbackPrediction;
    }
  }

  // POST /api/journal/submit - Submit daily entry (enforces 24-hour lock & level progression)
  app.post("/api/journal/submit", authenticateUser, asyncHandler(async (req: any, res) => {
    try {
      const user: UserEntity = req.user;
      if (!user) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      const { content, moodTag = "Calm", reflectionScore = 5, bypassCooldown = false } = req.body;

      if (!content || !content.trim()) {
        return res.status(400).json({ success: false, error: "Journal entry content cannot be empty." });
      }

      // Check 24-Hour Cooldown Logic
      const now = Date.now();
      const lastTime = user.lastJournalTimestamp ? new Date(user.lastJournalTimestamp).getTime() : 0;
      const cooldownMs = 24 * 60 * 60 * 1000;

      if (user.lastJournalTimestamp && (now - lastTime) < cooldownMs && !bypassCooldown) {
        const nextAvailableTime = new Date(lastTime + cooldownMs).toISOString();
        const readableTime = new Date(lastTime + cooldownMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        return res.status(429).json({
          success: false,
          error: `You can only write 1 reflection entry per 24 hours. Please wait until ${readableTime} (${nextAvailableTime}).`,
          nextAvailableTime,
          timeRemainingSeconds: Math.ceil((cooldownMs - (now - lastTime)) / 1000)
        });
      }

      // Progression: level = currentLevel + 1
      const nextLevel = user.currentLevel + 1;

      // Save Journal Entry
      const newEntry: JournalEntryEntity = {
        id: "journal_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
        userId: user.id,
        cycle: user.currentCycle,
        level: nextLevel,
        content: content.trim(),
        moodTag: moodTag || "Calm",
        reflectionScore: Number(reflectionScore) || 5,
        createdAt: new Date().toISOString()
      };

      db.journalEntries.push(newEntry);

      // Update User State
      user.lastJournalTimestamp = newEntry.createdAt;
      user.currentLevel = nextLevel;
      user.updatedAt = new Date().toISOString();

      let careerPrediction: CareerPredictionEntity | null = null;

      // Level 30 Completion Check
      let isCycleCompleted = false;
      if (nextLevel >= 30) {
        // Trigger 30-Day Gemini AI Career Synthesis
        careerPrediction = await perform30DayCareerSynthesis(user);
        isCycleCompleted = true;
        // Keep currentLevel = 30 so user sees the 30-day completion celebration & falling apples
        user.currentLevel = 30;
      }

      saveDatabase(db);

      res.status(201).json({
        success: true,
        message: isCycleCompleted 
          ? "30 Days completed! AI Career Path Synthesis generated!" 
          : "Reflection entry saved successfully!",
        entry: newEntry,
        isCycleCompleted,
        userStatus: {
          ...sanitizeUser(user),
          canJournalToday: false
        },
        careerPrediction
      });
    } catch (e: any) {
      console.error("Error in /api/journal/submit:", e);
      res.status(500).json({ success: false, error: e.message || "Failed to save journal entry" });
    }
  }));

  // POST /api/user/complete-cycle - Reset current level to 0 for a new cycle while preserving all journal data
  app.post("/api/user/complete-cycle", authenticateUser, (req: any, res) => {
    try {
      const user: UserEntity = req.user;
      if (!user) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      user.currentLevel = 0;
      user.currentCycle = (user.currentCycle || 1) + 1;
      user.updatedAt = new Date().toISOString();
      db.users[user.id] = user;
      saveDatabase(db);

      res.json({
        success: true,
        message: "Cycle completed and progress reset to 0 for new cycle!",
        userStatus: {
          ...sanitizeUser(user),
          canJournalToday: true
        }
      });
    } catch (e: any) {
      console.error("Error in /api/user/complete-cycle:", e);
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // GET /api/journal/history - Fetch past archived journals
  app.get("/api/journal/history", authenticateUser, (req: any, res) => {
    try {
      const user: UserEntity = req.user;
      if (!user) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      const cycleQuery = req.query.cycle ? parseInt(req.query.cycle as string, 10) : null;

      let entries = db.journalEntries.filter(j => j.userId === user.id);
      if (cycleQuery) {
        entries = entries.filter(j => j.cycle === cycleQuery);
      }

      // Sort by creation time / level ascending
      entries.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      res.json({
        success: true,
        count: entries.length,
        entries
      });
    } catch (e: any) {
      console.error("Error in /api/journal/history:", e);
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // ------------------------------------------------------------------
  // 3. 30-DAY GEMINI AI CAREER PATH PREDICTION & SYNTHESIS ENDPOINTS
  // ------------------------------------------------------------------

  // GET /api/career/prediction - Get latest AI Career Path prediction after 30 days
  app.get("/api/career/prediction", authenticateUser, asyncHandler(async (req: any, res) => {
    try {
      const user: UserEntity = req.user;
      if (!user) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }

      const cycleQuery = req.query.cycle ? parseInt(req.query.cycle as string, 10) : user.currentCycle;

      // Check if prediction already exists for this cycle
      let prediction = db.careerPredictions
        .filter(p => p.userId === user.id && p.cycle === cycleQuery)
        .pop();

      // If no prediction yet, but requested or forced:
      if (!prediction) {
        prediction = await perform30DayCareerSynthesis(user);
      }

      res.json({
        success: true,
        prediction
      });
    } catch (e: any) {
      console.error("Error in /api/career/prediction:", e);
      res.status(500).json({ success: false, error: e.message });
    }
  }));

  // POST /api/user/reset-cooldown - Helper / Dev endpoint to test 24h cooldown reset or level skip
  app.post("/api/user/reset-cooldown", authenticateUser, (req: any, res) => {
    try {
      const user: UserEntity = req.user;
      if (!user) return res.status(401).json({ success: false, error: "Unauthorized" });

      const { setLevel } = req.body;
      user.lastJournalTimestamp = null;
      if (setLevel !== undefined && typeof setLevel === 'number') {
        user.currentLevel = Math.max(0, Math.min(30, setLevel));
      }
      user.updatedAt = new Date().toISOString();

      saveDatabase(db);

      res.json({
        success: true,
        message: "Cooldown reset! You can now journal immediately.",
        userStatus: sanitizeUser(user)
      });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  // ------------------------------------------------------------------
  // EXISTING COMPATIBILITY ENDPOINTS (Career Advice, Cognitive Reframe, Socio Chat)
  // ------------------------------------------------------------------

  // ------------------------------------------------------------------
  // ENCOURAGING WORDS & DAILY SUPPORT ENDPOINT
  // ------------------------------------------------------------------

  app.post("/api/encouraging-words", authenticateUser, asyncHandler(async (req: any, res) => {
    try {
      const { journals = {}, mood, userName } = req.body;
      const activeUserName = req.user?.fullName || userName || "Explorer";

      const journalEntries = Object.entries(journals)
        .map(([lvl, text]) => `Day/Level ${lvl}: "${text}"`)
        .join("\n");

      const prompt = `You are Lumo, a warm, compassionate, empathetic companion providing personalized encouraging words, affirmations, and emotional support.

User Name: ${activeUserName}
Current Mood/Focus: ${mood || "Calm & Seeking Inspiration"}

--- USER REFLECTIONS & JOURNALS ---
${journalEntries || "The user hasn't written a reflection yet today, but needs a warm, uplifting boost."}

--- TASK ---
Generate a deeply personal, soothing, and genuinely encouraging set of words for ${activeUserName}:
1. A warm personal greeting acknowledging their efforts.
2. A powerful, memorable main daily affirmation.
3. 3 specific, uplifting encouraging messages celebrating their growth, resilience, and unique qualities.
4. 4 positive personal strengths recognized in them.
5. An inspiring, comforting quote.
6. 3 gentle, practical tips for peace of mind and self-care.`;

      const response = await getAi().models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are Lumo, an empathetic, warm companion delivering uplifting encouragement and gentle affirmations.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              greeting: { type: Type.STRING },
              mainAffirmation: { type: Type.STRING },
              encouragingMessages: { type: Type.ARRAY, items: { type: Type.STRING } },
              dailyStrengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              upliftingQuote: { type: Type.STRING },
              gentleTips: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["greeting", "mainAffirmation", "encouragingMessages", "dailyStrengths", "upliftingQuote", "gentleTips"]
          }
        }
      });

      const parsedData = JSON.parse(response.text || "{}");
      res.json({ success: true, data: parsedData });
    } catch (error: any) {
      console.error("Error generating encouraging words:", error);
      res.status(500).json({ success: false, error: error?.message || "Failed to generate encouraging words." });
    }
  }));

  app.post("/api/career-advice", authenticateUser, asyncHandler(async (req: any, res) => {
    try {
      const { journals = {}, events = [], userName } = req.body;
      const activeUserName = req.user?.fullName || userName || "Explorer";

      const journalEntries = Object.entries(journals)
        .map(([lvl, text]) => `Day/Level ${lvl}: "${text}"`)
        .join("\n");

      const eventLogs = Array.isArray(events) && events.length > 0
        ? events.map(e => `- ${e}`).join("\n")
        : "No extra events logged yet.";

      const prompt = `You are an expert AI Career Guidance Counselor & Behavioral Scientist.
Analyze the user's daily journal reflections, cognitive reframe notes, and logged events/habits.

User Name: ${activeUserName}

--- USER DAILY JOURNALS ---
${journalEntries || "No journal entries recorded yet."}

--- LOGGED EVENTS & CBT REFRAMES ---
${eventLogs}

--- TASK ---
Based on the emotional tone, expressed interests, problem-solving habits, values, and psychological insights in these journals and events:
1. Provide a sweet, encouraging career synthesis tailored to ${userName}.
2. Recommend 3 highly suitable, realistic career paths with match percentages and why they fit based on journal patterns.
3. Identify 4 key psychological & professional strengths evident in their writing.
4. Give 3 concrete, actionable next steps they can take today to explore these careers.
5. Provide a short, uplifting mascot quote.`;

      const response = await getAi().models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are Lumo, an empathetic, insightful AI career & growth counselor.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
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
                }
              },
              detectedStrengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              actionableNextSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
              encouragingQuote: { type: Type.STRING }
            },
            required: ["summary", "recommendedPaths", "detectedStrengths", "actionableNextSteps", "encouragingQuote"]
          }
        }
      });

      const parsedData = JSON.parse(response.text || "{}");
      res.json({ success: true, data: parsedData });
    } catch (error: any) {
      console.error("Error generating career advice:", error);
      res.status(500).json({ success: false, error: error?.message || "Failed to analyze journals." });
    }
  }));

  app.post("/api/generate-reframe", asyncHandler(async (req, res) => {
    try {
      const { userThought, context } = req.body;
      const prompt = `The user shared a thought: "${userThought || 'I feel nervous'}".
Context: ${context || 'General'}.
Generate 3 CBT-style cognitive reframing statements. Return JSON with key "reframes".`;

      const response = await getAi().models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              reframes: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["reframes"]
          }
        }
      });

      const data = JSON.parse(response.text || '{"reframes":[]}');
      res.json({ success: true, reframes: data.reframes || [] });
    } catch (error: any) {
      res.status(500).json({ success: false, error: "Failed to generate reframes" });
    }
  }));

  app.post("/api/socio-chat", asyncHandler(async (req, res) => {
    try {
      const { message, history = [], fileData, imageBase64, mimeType, fileName } = req.body;
      const attachment = fileData || (imageBase64 ? { base64: imageBase64, mimeType, fileName } : null);

      const systemInstruction = `You are Lumo, a warm, caring, empathetic AI friend and interview/presentation coach. Keep responses warm, natural, and helpful (2-4 sentences max).`;

      const currentParts: any[] = [];
      if (attachment?.base64 && attachment?.mimeType) {
        currentParts.push({
          inlineData: { data: attachment.base64, mimeType: attachment.mimeType }
        });
      }
      if (message && typeof message === 'string' && message.trim()) {
        currentParts.push({ text: message.trim() });
      }

      if (currentParts.length === 0) {
        return res.status(400).json({ success: false, error: "Message or file attachment is required." });
      }

      const formattedHistory: any[] = [];
      if (Array.isArray(history) && history.length > 0) {
        for (const item of history) {
          if (!item || !item.text) continue;
          const role = item.sender === 'user' ? 'user' : 'model';
          formattedHistory.push({ role, parts: [{ text: item.text }] });
        }
      }

      while (formattedHistory.length > 0 && formattedHistory[0].role === 'model') {
        formattedHistory.shift();
      }

      const contents = [...formattedHistory, { role: 'user', parts: currentParts }];

      const response = await getAi().models.generateContent({
        model: "gemini-3.6-flash",
        contents,
        config: { systemInstruction, temperature: 0.8 }
      });

      res.json({ success: true, text: response.text || "Hello!" });
    } catch (error: any) {
      console.error("[/api/socio-chat] ERROR:", error);
      res.status(500).json({ success: false, error: error?.message || "Failed to communicate with Gemini AI." });
    }
  }));

  // Vite middleware for development vs static serve for production
  async function startServer() {
    if (!isVercel) {
      const PORT = Number(process.env.PORT) || 3000;
      if (process.env.NODE_ENV !== "production") {
        const { createServer: createViteServer } = await import("vite");
        const vite = await createViteServer({
          server: {
            middlewareMode: true,
            hmr: { port: Number(process.env.VITE_HMR_PORT) || 24679 },
          },
          appType: "spa",
        });
        app.use(vite.middlewares);
      } else {
        const distPath = path.join(process.cwd(), "dist");
        app.use(express.static(distPath));
        app.get("*", (_req: any, res: any) => {
          res.sendFile(path.join(distPath, "index.html"));
        });
      }

      await new Promise<void>((resolve, reject) => {
        const server = app.listen(PORT, "0.0.0.0", () => {
          console.log(`Lumo Backend & Web Server running on http://localhost:${PORT}`);
          resolve();
        });
        server.on("error", (err: NodeJS.ErrnoException) => {
          if (err.code === "EADDRINUSE") {
            console.error(
              `Port ${PORT} is already in use. Stop the other process or run: PORT=${PORT + 1} npm run dev`
            );
          }
          reject(err);
        });
      });
    }
  }

  startServer().catch((err) => {
    console.error("Fatal error starting Lumo backend server:", err);
  });

// ------------------------------------------------------------------
// GLOBAL EXPRESS ERROR HANDLER
// ------------------------------------------------------------------
// Catches any error that reaches `next(err)` (including unhandled async
// rejections wrapped by `asyncHandler`) and returns a valid JSON response
// instead of the default Express HTML error page.
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error("[Global Error Handler] Unhandled error:", err?.message || err);
  const statusCode = err?.status || err?.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err?.message || "An unexpected server error occurred.",
  });
});

// Catch any async rejection that wasn't handled elsewhere (safety net)
process.on("unhandledRejection", (reason: any) => {
  console.error("[unhandledRejection]", reason?.message || reason);
});
process.on("uncaughtException", (error: Error) => {
  console.error("[uncaughtException]", error?.message || error);
});

  export default app;

