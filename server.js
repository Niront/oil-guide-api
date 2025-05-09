// server.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const OpenAI = require("openai");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Health check route
app.get("/", (req, res) => {
  res.send("Oil Info API is running.");
});

app.post("/oil-info", async (req, res) => {
  try {
    const { year, make, model, cylinderSize } = req.body;

    const prompt = `What is the recommended engine oil viscosity and capacity for a ${year} ${make} ${model} with a ${cylinderSize} engine?`;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo", // Upgraded from gpt-3.5-turbo
      messages: [{ role: "user", content: prompt }],
    });

    const result = response.choices[0].message.content;
    res.json({ result });

  } catch (error) {
    console.error("Error querying OpenAI:", error);
    res.status(503).json({
      error: "The AI service is currently unavailable. Please try again later.",
      message: error.message, // Helpful in development
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
