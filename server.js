const express = require("express");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();

// Parse JSON requests from the React app.
app.use(express.json({ limit: "1mb" }));

// Proxy ElevenLabs TTS to avoid CORS/browser issues.
app.post("/api/elevenlabs/text-to-speech/:voiceId", async (req, res) => {
  const voiceId = req.params.voiceId;
  const elevenKey = process.env.REACT_APP_ELEVENLABS_KEY || process.env.ELEVENLABS_KEY;

  if (!elevenKey) {
    return res.status(500).json({ error: "Missing ElevenLabs API key" });
  }

  try {
    const upstream = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(
        voiceId
      )}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": elevenKey,
          "Content-Type": "application/json",
        },
        // Ensure the model_id is controlled server-side.
        body: JSON.stringify({
          ...(req.body || {}),
          model_id: "eleven_flash_v2_5",
        }),
      }
    );

    if (!upstream.ok) {
      const errText = await upstream.text().catch(() => "");
      console.error("ElevenLabs upstream error", {
        status: upstream.status,
        body: errText,
      });
      return res.status(upstream.status).send(errText);
    }

    const contentType = upstream.headers.get("content-type") || "audio/mpeg";
    res.setHeader("Content-Type", contentType);

    // ElevenLabs returns an audio body, so we forward it as raw bytes.
    const audioBuffer = await upstream.buffer();
    res.status(upstream.status).send(audioBuffer);
  } catch (err) {
    console.error("ElevenLabs proxy error", err);
    res.status(500).json({ error: "Proxy failed" });
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`ClearPath proxy server listening on port ${port}`);
});

