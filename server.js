// server.js
const express = require("express");
const OpenAI = require("openai");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// Set up OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure this is set in your Render Environment Variables
});

app.use(express.json());

app.post("/oil-info", async (req, res) => {
  try {
    const { year, make, model, cylinderSize } = req.body;

    const prompt = `What is the recommended engine oil viscosity and capacity for a ${year} ${make} ${model} with a ${cylinderSize} engine?`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    const result = response.choices[0].message.content;
    res.json({ result });
  } catch (error) {
    console.error("Error querying OpenAI:", error);
    res.status(500).json({ error: "Failed to get response from OpenAI" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
