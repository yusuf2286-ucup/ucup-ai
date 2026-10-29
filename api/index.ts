import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
app.use(express.json());

// Initialize Gemini SDK with server-side API Key
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server');
  }
  return new GoogleGenAI({ apiKey });
};

// Resilient AI generation with automatic model fallback
async function generateAiContent(prompt: string): Promise<{ text: string; model: string }> {
  const ai = getGeminiClient();
  // Preferred fast model with fallback to handle demand spikes seamlessly
  const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      if (response && response.text) {
        return { text: response.text, model };
      }
    } catch (err: any) {
      console.warn(`Model ${model} unavailable: ${err.message || err}. Trying next model...`);
      lastError = err;
    }
  }

  throw lastError || new Error('Semua model Gemini sedang sibuk. Silakan coba kembali sesaat lagi.');
}

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'IdeaFlow Express API',
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString()
  });
});

// Admin Login: username 'mhmmdyusf' and password 'yusuf2286'
app.post('/api/admin/login', (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (username === 'mhmmdyusf' && password === 'yusuf2286') {
      return res.json({
        success: true,
        message: 'Login admin berhasil',
        token: `admin_token_${Buffer.from(`admin:${Date.now()}`).toString('base64')}`,
        user: {
          username: 'mhmmdyusf',
          displayName: 'M. Yusuf (Super Admin)',
          email: 'mhmmdyusf2286@gmail.com',
          role: 'admin',
          isAdmin: true
        }
      });
    }

    return res.status(401).json({
      success: false,
      error: 'Username atau sandi admin salah. Harap periksa kembali kredensial Anda.'
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Generate App Idea via Gemini AI Server-side
app.post('/api/generate-idea', async (req: Request, res: Response) => {
  try {
    const { category, targetAudience, problemSpace, scope = 'MVP Siap Bangun' } = req.body;

    const prompt = `Anda adalah seorang startup product architect kelas dunia dan tech founder berpengalaman.
Tolong buat 1 ide aplikasi web/mobile yang sangat inovatif, realistis, dan berpotensi tinggi untuk dibangun.

Parameter pengguna:
- Kategori: ${category || 'SaaS & AI Productivity'}
- Target Pengguna: ${targetAudience || 'Profesional & UMKM'}
- Fokus Masalah / Kata Kunci: ${problemSpace || 'Solusi otomatisasi alur kerja modern'}
- Lingkup Proyek: ${scope}

Berikan respons HANYA dalam format JSON valid (tanpa markdown backticks di luar format JSON) dengan struktur berikut:
{
  "title": "Nama Aplikasi yang catchy dan modern",
  "tagline": "Slogan singkat 1 kalimat yang memikat",
  "summary": "Ringkasan deskripsi aplikasi (2-3 kalimat jelas dan padat)",
  "category": "${category || 'SaaS'}",
  "targetAudience": "${targetAudience || 'Pengguna Umum'}",
  "problemSolved": "Masalah utama yang diselesaikan secara spesifik",
  "keyFeatures": [
    "Fitur Utama 1 (deskripsi singkat)",
    "Fitur Utama 2 (deskripsi singkat)",
    "Fitur Utama 3 (deskripsi singkat)",
    "Fitur Utama 4 (deskripsi singkat)"
  ],
  "techStack": {
    "frontend": "contoh: React 19, Tailwind CSS, Vite, Lucide",
    "backend": "contoh: Node.js Express Serverless",
    "database": "contoh: Firebase Firestore & Auth",
    "aiEngine": "contoh: Gemini AI API"
  },
  "monetization": "Model pendapatan (misal: Freemium $12/bulan, kredit AI, dsb)",
  "mvpLaunchPlan": [
    "Langkah 1: Pengembangan prototipe inti",
    "Langkah 2: Validasi beta tester",
    "Langkah 3: Peluncuran publik dan monetisasi"
  ],
  "tags": ["AI", "SaaS", "Web App", "Productivity"]
}`;

    const { text, model } = await generateAiContent(prompt);
    const parsed = JSON.parse(text);
    return res.json({ success: true, idea: parsed, modelUsed: model });
  } catch (error: any) {
    console.error('Error generating idea:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Gagal menghasilkan ide dengan Gemini AI'
    });
  }
});

// Deep Dive Analysis for an Idea via Gemini AI
app.post('/api/analyze-idea', async (req: Request, res: Response) => {
  try {
    const { idea } = req.body;
    if (!idea || !idea.title) {
      return res.status(400).json({ success: false, error: 'Data ide aplikasi dibutuhkan' });
    }

    const prompt = `Lakukan analisis mendalam (Deep Feasibility & Market Analysis) untuk ide aplikasi berikut:
Nama: ${idea.title}
Ringkasan: ${idea.summary}
Kategori: ${idea.category}
Target Pasar: ${idea.targetAudience}
Fitur Kunci: ${Array.isArray(idea.keyFeatures) ? idea.keyFeatures.join(', ') : idea.keyFeatures}
Monetisasi: ${idea.monetization}

Berikan respons HANYA dalam format JSON valid dengan struktur:
{
  "marketScore": 88,
  "marketScoreLabel": "Sangat Menjanjikan / High Potential",
  "swot": {
    "strengths": ["Kelebihan 1", "Kelebihan 2"],
    "weaknesses": ["Kelemahan 1", "Kelemahan 2"],
    "opportunities": ["Peluang 1", "Peluang 2"],
    "threats": ["Tantangan 1", "Tantangan 2"]
  },
  "targetPersona": {
    "name": "Profil Pengguna Ideal",
    "painPoints": ["Penderitaan 1", "Penderitaan 2"],
    "willingnessToPay": "Tinggi / Menengah / Rendah"
  },
  "competitiveMoat": "Keunggulan kompetitif yang sulit ditiru kompetitor",
  "growthStrategy": "Strategi akuisisi 100 pengguna pertama (Go-To-Market)",
  "technicalComplexity": "Rendah / Sedang / Tinggi (dengan penjelasan singkat)"
}`;

    const { text } = await generateAiContent(prompt);
    const parsed = JSON.parse(text || '{}');
    return res.json({ success: true, analysis: parsed });
  } catch (error: any) {
    console.error('Error analyzing idea:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Gagal menganalisis ide'
    });
  }
});

// Admin System Stats
app.get('/api/admin/stats', (_req: Request, res: Response) => {
  res.json({
    success: true,
    stats: {
      uptime: process.uptime(),
      nodeVersion: process.version,
      geminiModel: 'gemini-3.1-flash-lite / gemini-3.8-flash (High Availability)',
      geminiConfigured: !!process.env.GEMINI_API_KEY,
      firestoreConfigured: true,
      authMethod: 'Firebase Google Sign-In & Direct Admin Credentials'
    }
  });
});

// Export default app WITHOUT app.listen (sesuai instruksi khusus: "export default app, tanpa app.listen")
export default app;
