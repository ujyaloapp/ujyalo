export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  const { action, subject, question, studentAnswer } = req.body;

  let prompt = '';

  if (action === 'generate') {
    prompt = `You are creating a practice question for a Grade 10 student in Nepal preparing for the SEE exam.

Subject: ${subject}

Create ONE practice question following SEE exam format. Important rules:
- The question must be in clear, simple English only
- Match the SEE Grade 10 syllabus for ${subject}
- Use Nepali context where natural — Nepali names like Rajan, Sita, Anish; NPR currency; Nepali geography and examples
- Be appropriate difficulty for Grade 10 (not too hard, not too easy)
- Have a definite correct answer

Respond ONLY with a JSON object in this exact format:
{"question": "the question text in English here", "expectedAnswer": "the correct answer here"}

Do not include any Nepali script, devanagari, or non-English text. Only English. Only the JSON object. No markdown, no code blocks, just the raw JSON.`;
  } else if (action === 'evaluate') {
    prompt = `You are a friendly teacher evaluating a Grade 10 SEE student's answer in Nepal.

Subject: ${subject}
Question: ${question}
Student's Answer: ${studentAnswer}

Evaluate the answer warmly and helpfully. Important rules:
- Respond in clear, simple English only — no Nepali script
- Use simple vocabulary that any Grade 10 Nepali student can understand
- Be encouraging and warm
- Maximum 4 short sentences

Respond ONLY with a JSON object in this exact format:
{"verdict": "correct", "feedback": "your warm helpful feedback in simple English here"}

Verdict must be one of: "correct", "partial", or "incorrect".

Do not include any Nepali script or non-English text. Only English. Only the JSON object. No markdown, no code blocks, just the raw JSON.`;
  } else {
    return res.status(400).json({ error: 'Invalid action' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('API error:', data);
      return res.status(500).json({ error: data.error?.message || 'API request failed', details: data });
    }

    if (!data.content || !data.content[0] || !data.content[0].text) {
      console.error('Unexpected response:', data);
      return res.status(500).json({ error: 'Unexpected AI response format', details: data });
    }

    const text = data.content[0].text.trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      console.error('No JSON found in:', text);
      return res.status(500).json({ error: 'Could not parse AI response', rawText: text });
    }

    try {
      const result = JSON.parse(jsonMatch[0]);
      return res.status(200).json(result);
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Text:', jsonMatch[0]);
      return res.status(500).json({ error: 'Invalid JSON from AI', rawText: jsonMatch[0] });
    }

  } catch (error) {
    console.error('Catch error:', error);
    return res.status(500).json({ error: error.message });
  }
}
