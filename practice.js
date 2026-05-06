export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  const { action, subject, question, studentAnswer } = req.body;

  let prompt = '';

  if (action === 'generate') {
    prompt = `You are a friendly Nepali teacher creating a practice question for a Grade 10 SEE student in Nepal.

Subject: ${subject}

Create ONE practice question following SEE exam format. The question should:
- Match the SEE Grade 10 syllabus for ${subject}
- Be clear and appropriate for a Grade 10 student
- Have a definite correct answer

Respond ONLY with a JSON object in this exact format:
{
  "question": "the question text here",
  "expectedAnswer": "the correct answer here"
}

Do not include any other text, explanations, or markdown. Only the JSON object.`;
  } else if (action === 'evaluate') {
    prompt = `You are a friendly Nepali teacher evaluating a Grade 10 SEE student's answer.

Subject: ${subject}
Question: ${question}
Student's Answer: ${studentAnswer}

Evaluate the answer warmly and helpfully. Tell the student:
1. Is the answer correct, partially correct, or incorrect?
2. What the correct approach is
3. One specific tip to improve

Keep it short, encouraging, and use simple English a Nepali student can easily understand. Maximum 4 short sentences.

Respond ONLY with a JSON object in this exact format:
{
  "verdict": "correct" or "partial" or "incorrect",
  "feedback": "your warm helpful feedback here"
}

Do not include any other text. Only the JSON object.`;
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
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    const text = data.content[0].text.trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return res.status(500).json({ error: 'Could not parse AI response' });
    }

    const result = JSON.parse(jsonMatch[0]);
    return res.status(200).json(result);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}