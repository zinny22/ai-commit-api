import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_MODEL = 'claude-3-haiku-20240307';

app.post('/generate', async (req, res) => {
  const { diff } = req.body;

  if (!diff) {
    return res.status(400).json({ error: 'Missing diff in request body' });
  }

  try {
    const prompt = `다음 git diff를 기반으로 적절한 커밋 메시지를 3가지 스타일로 각각 만들어줘:

1. Conventional commit 스타일
2. Gitmoji 스타일
3. 한글 요약

\`\`\`diff
${diff}
\`\`\``;

    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 512,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    res.json({ message: data.content[0].text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate message' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ API server running on http://localhost:${PORT}`);
});


export default app;