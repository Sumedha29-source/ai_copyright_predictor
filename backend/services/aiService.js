// backend/services/aiService.js
import OpenAI  from "openai";
import fs      from "fs";
import path    from "path";
import dotenv  from "dotenv";

dotenv.config();

// ==============================
// OpenAI Client Setup
// ==============================

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ==============================
// analyzeImageWithAI()
// Sends image to OpenAI Vision
// API and returns originality
// score and analysis details
// ==============================

export const analyzeImageWithAI = async (filePath) => {
  try {

    console.log("[AI] Starting image analysis...");

    // Step 1 — Read image file and convert to base64
    const imageBuffer = fs.readFileSync(filePath);
    const base64Image = imageBuffer.toString("base64");
    const mimeType    = getMimeType(filePath);

    console.log("[AI] Image converted to base64");

    // Step 2 — Send to OpenAI Vision API
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert AI art analyst specializing in copyright 
          verification. Your job is to analyze artwork for originality and 
          potential copyright issues. Always respond in valid JSON format only.`,
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
              },
            },
            {
              type: "text",
              text: `Analyze this artwork for originality and copyright concerns.
              
              Return a JSON response with exactly this structure:
              {
                "score": <number 0-100>,
                "certified": <boolean>,
                "style": "<art style detected>",
                "details": {
                  "originalityAssessment": "<brief assessment>",
                  "similarArtists":        ["<artist1>", "<artist2>"],
                  "colorPalette":          ["<color1>", "<color2>"],
                  "artStyle":              "<style>",
                  "potentialConcerns":     "<any copyright concerns or none>",
                  "recommendation":        "<certify or flag>"
                }
              }
              
              Score guide:
              90-100 = Highly original
              70-89  = Original with minor similarities
              40-69  = Moderate similarities detected
              0-39   = High similarity — likely copied
              
              certified = true if score > 70, false otherwise.`,
            },
          ],
        },
      ],
      max_tokens: 1000,
    });

    console.log("[AI] Response received from OpenAI");

    // Step 3 — Parse the JSON response
    const rawText     = response.choices[0].message.content;
    const cleanedText = rawText.replace(/```json|```/g, "").trim();
    const parsed      = JSON.parse(cleanedText);

    console.log(`[AI] Originality score: ${parsed.score}`);

    // Step 4 — Return structured result
    return {
      score:     parsed.score,
      certified: parsed.certified,
      style:     parsed.style,
      details:   parsed.details,
    };

  } catch (error) {

    // Handle JSON parse error
    if (error instanceof SyntaxError) {
      console.error("[AI] Failed to parse OpenAI response as JSON");
      throw new Error("AI response was not valid JSON. Please try again.");
    }

    // Handle OpenAI API errors
    if (error.status === 401) {
      throw new Error("OpenAI API key is invalid or missing.");
    }

    if (error.status === 429) {
      throw new Error("OpenAI rate limit reached. Please try again later.");
    }

    if (error.status === 500) {
      throw new Error("OpenAI server error. Please try again later.");
    }

    console.error("[AI] Error:", error.message);
    throw new Error(`AI analysis failed: ${error.message}`);
  }
};

// ==============================
// getMimeType()
// Helper to get mime type
// from file extension
// ==============================

const getMimeType = (filePath) => {
  const ext = path.extname(filePath).toLowerCase();

  const mimeTypes = {
    ".jpg":  "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png":  "image/png",
    ".webp": "image/webp",
    ".gif":  "image/gif",
    ".svg":  "image/svg+xml",
  };

  return mimeTypes[ext] || "image/jpeg";
};

// ==============================
// analyzeMultipleImages()
// Analyze multiple images at
// once and return array of
// results
// ==============================

export const analyzeMultipleImages = async (filePaths) => {
  try {
    console.log(`[AI] Analyzing ${filePaths.length} images...`);

    const results = await Promise.all(
      filePaths.map((filePath) => analyzeImageWithAI(filePath))
    );

    return results;

  } catch (error) {
    console.error("[AI] Batch analysis error:", error.message);
    throw new Error(`Batch AI analysis failed: ${error.message}`);
  }
};
```

---

### What each part does
```
```
aiService.js
│
├── openai setup
│   └── reads OPENAI_API_KEY from .env
│
├── analyzeImageWithAI()
│   ├── Step 1 → reads image file
│   ├── Step 2 → converts to base64
│   ├── Step 3 → sends to GPT-4o Vision
│   ├── Step 4 → parses JSON response
│   └── Step 5 → returns score + details
│
├── getMimeType()
│   └── helper to get correct
│       mime type from extension
│
└── analyzeMultipleImages()
    └── analyze multiple images
        at once using Promise.all
```