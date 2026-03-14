// backend/services/aiService.js
const OpenAI = require("openai");
const fs     = require("fs");
const path   = require("path");

require("dotenv").config();

// ==============================
// OpenAI Client Setup
// ==============================

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const analyzeImageWithAI = async (filePath) => {
  try {
    console.log("[AI] Starting image analysis...");

    const imageBuffer = fs.readFileSync(filePath);
    const base64Image = imageBuffer.toString("base64");
    const mimeType    = getMimeType(filePath);

    console.log("[AI] Image converted to base64");

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

    const rawText     = response.choices[0].message.content;
    const cleanedText = rawText.replace(/```json|```/g, "").trim();
    const parsed      = JSON.parse(cleanedText);

    console.log(`[AI] Originality score: ${parsed.score}`);

    return {
      score:     parsed.score,
      certified: parsed.certified,
      style:     parsed.style,
      details:   parsed.details,
    };

  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error("[AI] Failed to parse OpenAI response as JSON");
      throw new Error("AI response was not valid JSON. Please try again.");
    }
    if (error.status === 401) throw new Error("OpenAI API key is invalid or missing.");
    if (error.status === 429) throw new Error("OpenAI rate limit reached. Please try again later.");
    if (error.status === 500) throw new Error("OpenAI server error. Please try again later.");

    console.error("[AI] Error:", error.message);
    throw new Error(`AI analysis failed: ${error.message}`);
  }
};

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

const analyzeMultipleImages = async (filePaths) => {
  try {
    console.log(`[AI] Analyzing ${filePaths.length} images...`);
    return await Promise.all(filePaths.map((fp) => analyzeImageWithAI(fp)));
  } catch (error) {
    console.error("[AI] Batch analysis error:", error.message);
    throw new Error(`Batch AI analysis failed: ${error.message}`);
  }
};

module.exports = { analyzeImageWithAI, analyzeMultipleImages };