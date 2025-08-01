import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/generate', async (req, res) => {
  const { diff } = req.body;

  if (!diff) {
    return res.status(400).json({ error: 'Missing diff in request body' });
  }

  const prompt = `다음 git diff를 기반으로 적절한 커밋 메시지를 3가지 스타일로 각각 만들어줘:
    1. Conventional commit 스타일
    2. Gitmoji 스타일
    3. 한글 요약

    \`\`\`diff
    ${diff}
    \`\`\`
  `;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
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

export default app;