const functions = require("firebase-functions");
const fetch = require("node-fetch");

exports.gerarLook = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const { prompt, apiKey } = req.body;
  if (!prompt || !apiKey) {
    return res.status(400).send("Prompt e apiKey são obrigatórios");
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();
    return res.json(data);
  } catch (error) {
    console.error("Erro no proxy Gemini:", error);
    return res.status(500).json({ error: "Falha no proxy" });
  }
});