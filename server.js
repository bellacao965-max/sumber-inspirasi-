import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import OpenAI from 'openai';
import path from 'path';
import { fileURLToPath } from 'url';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 10000;
app.use(cors());
app.use(express.json());
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(__dirname));
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
app.post('/api/ai/chat', async (req, res) => {
  try {
    const prompt = req.body.prompt || 'Halo!';
    console.log('Prompt:', prompt);
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 600,
    });
    const reply = completion.choices?.[0]?.message?.content || '';
    res.json({ response: reply });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'AI error', detail: err.message });
  }
});
app.get('/api/youtube', (req, res) => {
  const q = req.query.q || '';
  if (!q) return res.status(400).json({ error: 'q required' });
  const m = q.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([\w-]{11})/);
  if (m) return res.json({ videoId: m[1] });
  if (/^[\w-]{6,}$/.test(q)) return res.json({ videoId: q });
  return res.json({ error: 'Tidak dapat mengekstrak video id. Paste full URL atau ID.' });
});
app.get('/api/preview', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'url required' });
  try {
    const r = await fetch(url, { timeout: 10000 });
    const text = await r.text();
    const ogImage = (text.match(/<meta[^>]+property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i) || [null, null])[1]
      || (text.match(/<meta[^>]+name=["']twitter:image["'][^>]*content=["']([^"']+)["'][^>]*>/i) || [null, null])[1];
    const ogTitle = (text.match(/<meta[^>]+property=["']og:title["'][^>]*content=["']([^"']+)["'][^>]*>/i) || [null, null])[1]
      || (text.match(/<title>([^<]+)<\/title>/i) || [null, null])[1];
    res.json({ ogImage, title: ogTitle });
  } catch (err) {
    console.error('Preview fetch error:', err.message || err);
    res.status(500).json({ error: 'Gagal fetch preview', detail: String(err) });
  }
});
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
