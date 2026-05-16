const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const OpenAI = require("openai");
const cloudinary = require("cloudinary").v2;
const axios = require("axios");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json({ limit: "20mb" }));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

app.get("/", (req, res) => {
  res.send("Niront AI Image Service is running.");
});

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    service: "niront-ai-image-service",
    ts: new Date().toISOString()
  });
});

app.post("/generate-image", async (req, res) => {
  try {
    const prompt = String(req.body.prompt || "").trim();

    if (!prompt) {
      return res.status(400).json({
        ok: false,
        error: "missing_prompt"
      });
    }

    console.log("Generating image...");

    const imageResponse = await openai.images.generate({
      model: "gpt-image-1",
      prompt: prompt,
      size: "1024x1024"
    });

    const imageBase64 = imageResponse.data[0].b64_json;

    if (!imageBase64) {
      throw new Error("No image returned from OpenAI");
    }

    const uploadResult = await cloudinary.uploader.upload(
      `data:image/png;base64,${imageBase64}`,
      {
        folder: "niront-ai-images"
      }
    );

    return res.json({
      ok: true,
      image_url: uploadResult.secure_url,
      public_id: uploadResult.public_id
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      ok: false,
      error: String(err.message || err)
    });
  }
});

app.post("/generate-video", async (req, res) => {
  try {
    const { prompt, videoType } = req.body || {};

    console.log("VIDEO REQUEST:", {
      videoType,
      prompt
    });

    return res.json({
      ok: true,
      video_url: "",
      thumbnail_url: "",
      status: "pending_backend",
      message: "AI video backend placeholder ready"
    });

  } catch (err) {
    console.error("VIDEO GENERATION ERROR:", err);

    return res.status(500).json({
      ok: false,
      error: err.message || "Video generation failed"
    });
  }
});

app.listen(port, () => {
  console.log("Niront AI Image Service running on port " + port);
});
