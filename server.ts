import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import multer from 'multer';
import fs from 'fs';
// import { GoogleGenAI } from "@google/genai"; // Mocking AI, so we don't need this
import db from './db.ts';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mammoth from 'mammoth';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-prod';
// const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Mocking

// if (!GEMINI_API_KEY) {
//   console.warn("GEMINI_API_KEY is missing!");
// }

// const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY }); // Mocking

// Seed default user
const seedDatabase = async () => {
  try {
    const userCount = db.prepare('SELECT count(*) as count FROM users').get() as any;
    if (userCount.count === 0) {
      console.log('Seeding default user...');
      const hashedPassword = await bcrypt.hash('password123', 10);
      const apiKey = uuidv4();
      db.prepare('INSERT INTO users (email, password, name, api_key, credits) VALUES (?, ?, ?, ?, ?)').run(
        'admin@example.com', 
        hashedPassword, 
        'Admin User', 
        apiKey, 
        1000
      );
      console.log('Default user created: admin@example.com / password123');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

async function startServer() {
  await seedDatabase();
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // Configure Multer for file uploads
  const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
  });

  // --- Middleware ---

  const authenticateToken = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: 'Forbidden' });
      req.user = user;
      next();
    });
  };

  const authenticateApiKey = (req: any, res: any, next: any) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey) return res.status(401).json({ error: 'API Key required' });

    const user = db.prepare('SELECT * FROM users WHERE api_key = ?').get(apiKey) as any;
    if (!user) return res.status(403).json({ error: 'Invalid API Key' });

    req.user = { id: user.id, email: user.email };
    next();
  };

  // --- Auth Routes ---

  app.post('/api/auth/register', async (req, res) => {
    const { email, password, name } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const apiKey = uuidv4();
      const stmt = db.prepare('INSERT INTO users (email, password, name, api_key, credits) VALUES (?, ?, ?, ?, ?)');
      const info = stmt.run(email, hashedPassword, name, apiKey, 50); // Give 50 free credits
      
      const token = jwt.sign({ id: info.lastInsertRowid, email }, JWT_SECRET, { expiresIn: '24h' });
      res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
      res.json({ success: true, user: { id: info.lastInsertRowid, email, name, credits: 50, api_key: apiKey } });
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(400).json({ error: 'Email already exists' });
      }
      res.status(500).json({ error: 'Server error' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    res.json({ success: true, user: { id: user.id, email: user.email, name: user.name, credits: user.credits, api_key: user.api_key } });
  });

  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ success: true });
  });

  app.get('/api/user/me', authenticateToken, (req: any, res) => {
    const user = db.prepare('SELECT id, email, name, credits, api_key FROM users WHERE id = ?').get(req.user.id);
    res.json(user);
  });

  // --- Payment / Credits ---

  app.post('/api/credits/topup', authenticateToken, (req: any, res) => {
    const { amount } = req.body; // In real app, verify payment first
    // Mock payment success
    const creditsToAdd = amount * 10; // 1 USD = 10 Credits example
    
    db.prepare('UPDATE users SET credits = credits + ? WHERE id = ?').run(creditsToAdd, req.user.id);
    db.prepare('INSERT INTO transactions (user_id, amount, type, description) VALUES (?, ?, ?, ?)').run(req.user.id, creditsToAdd, 'credit', 'Top-up');
    
    const updatedUser = db.prepare('SELECT credits FROM users WHERE id = ?').get(req.user.id);
    res.json({ success: true, credits: (updatedUser as any).credits });
  });

  // --- Translation Services ---

  // Helper to deduct credits
  const deductCredits = (userId: number, amount: number) => {
    const user = db.prepare('SELECT credits FROM users WHERE id = ?').get(userId) as any;
    if (!user || user.credits < amount) return false;
    
    db.prepare('UPDATE users SET credits = credits - ? WHERE id = ?').run(amount, userId);
    db.prepare('INSERT INTO transactions (user_id, amount, type, description) VALUES (?, ?, ?, ?)').run(userId, amount, 'debit', 'Service usage');
    return true;
  };

  // B2B API Routes (Protected by API Key)
  app.post('/api/v1/translate/text', authenticateApiKey, async (req: any, res) => {
    const { text, targetLang } = req.body;
    if (!deductCredits(req.user.id, 1)) return res.status(402).json({ error: 'Insufficient credits' });

    try {
      // MOCK RESPONSE
      const mockTranslatedText = `[Mocked B2B translation for '${text.substring(0, 20)}...' to ${targetLang}]`;
      setTimeout(() => {
        res.json({ translated: mockTranslatedText });
      }, 1000);
    } catch (e) {
      res.status(500).json({ error: 'Error' });
    }
  });
  
  const optionalAuth = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) {
      req.user = null;
      return next();
    }
    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) req.user = null;
      else req.user = user;
      next();
    });
  };


  // Clean Route Definitions
  const docxHandler = async (req: any, res: any) => {
    const isGuest = !req.user;
    const targetLang = req.body.targetLang || 'English';
    
    if (!isGuest) {
      if (!deductCredits(req.user.id, 5)) {
        return res.status(402).json({ error: 'Insufficient credits' });
      }
    }

    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    try {
      const result = await mammoth.extractRawText({ buffer: req.file.buffer });
      const text = result.value;

      // MOCK RESPONSE
      const mockTranslatedText = `[This is a mocked translation for the DOCX file into ${targetLang}]\n\nOriginal text started with: "${text.substring(0, 100)}..."`;

      // Simulate network delay
      setTimeout(() => {
        res.json({ 
          original: text,
          translated: mockTranslatedText 
        });
      }, 1500);

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Translation failed' });
    }
  };

  const asrHandler = async (req: any, res: any) => {
    const isGuest = !req.user;
    const targetLang = req.body.targetLang || 'English';

    if (!isGuest) {
      if (!deductCredits(req.user.id, 10)) {
        return res.status(402).json({ error: 'Insufficient credits' });
      }
    }

    if (!req.file) return res.status(400).json({ error: 'No audio uploaded' });

    try {
      // MOCK RESPONSE
      const mockResponse = {
        transcription: "This is a mock transcription of the uploaded audio file.",
        translation: `This is the mocked translation of the transcription into ${targetLang}.`
      };
      
      // Simulate network delay
      setTimeout(() => {
        res.json(mockResponse);
      }, 2000);

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'ASR failed' });
    }
  };

  app.post('/api/translate/docx', optionalAuth, upload.single('file'), docxHandler);
  app.post('/api/translate/asr', optionalAuth, upload.single('audio'), asrHandler);


  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
