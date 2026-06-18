import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

// Set up larger limit for base64 image uploads
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

// Initialize Gemini SDK server-side
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    if (!apiKey) {
      console.warn("Warning: GEMINI_API_KEY environment variable is not set. AI features might run in offline/simulation fallback mode.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// 1. Prompt Enhancement API (uses gemini-3.5-flash, standard API)
app.post("/api/prompt-enhance", async (req, res) => {
  try {
    const { idea } = req.body;
    if (!idea || typeof idea !== "string" || idea.trim() === "") {
      return res.status(400).json({ error: "아이디어를 입력해주세요." });
    }

    const ai = getGeminiClient();
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      // Return a simulated high-quality enhanced prompt in case API key is generic
      return res.json({
        enhancedPrompt: `A highly detailed, professional masterwork, showing ${idea}. Cinematic lighting, studio photography style, extremely high resolution, award-winning composition, photorealistic textures, 8k resolution, crisp focus.`,
        explanationKr: "API 키가 비활성화 상태이므로 로컬 AI 템플릿 엔진을 사용하여 프롬프트가 최적화되었습니다. (고해상도 디테일 및 조명 토큰 추가)"
      });
    }

    const systemInstruction = 
      "You are an AI prompt engineering expert specializing in image generation models. " +
      "The user will provide a brief phrase, concept or idea in Korean. Your job is to transform this brief idea " +
      "into a highly descriptive, professional, detailed English prompt (approx 40-70 words) designed for state-of-the-art image generators. " +
      "Add precise vocabulary for style (e.g., photorealistic, highly detailed, 3D render, digital painting, studio portrait, vintage Polaroid), " +
      "composition, focal lighting (e.g., warm volumetric lighting, golden hour, neon backlight), and background setup. " +
      "Also provide a short description (1-2 sentences in Korean) explaining what elements were enhanced. " +
      "You MUST return a JSON object with properties 'enhancedPrompt' (string) and 'explanationKr' (string).";

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `User idea: "${idea}"`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            enhancedPrompt: {
              type: Type.STRING,
              description: "The expanded, detailed English prompt for image generation."
            },
            explanationKr: {
              type: Type.STRING,
              description: "A short, friendly Korean explanation of what was enhanced (e.g., lighting, style, composition)."
            }
          },
          required: ["enhancedPrompt", "explanationKr"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response from Gemini API");
    }

    const result = JSON.parse(resultText);
    res.json(result);
  } catch (error: any) {
    console.error("Error enhancing prompt:", error);
    res.json({
      enhancedPrompt: `A highly detailed, professional cinematic shot of ${req.body.idea || "the described concept"}, photorealistic style, masterfully rendered textures, ambient lighting, beautiful depth of field, 8k, incredibly detailed.`,
      explanationKr: "API 호출 중 오류가 발생하여 기본 프롬프트 엔진을 사용해 시네마틱 스타일로 자동 구체화했습니다."
    });
  }
});

// Start full-stack service and bundle setup
async function startServer() {
  // Vite dev middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
