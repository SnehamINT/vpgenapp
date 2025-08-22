const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export const generateValuePropositions = async (formData) => {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not found. Please set VITE_GEMINI_API_KEY in your environment variables.');
    }

    const industry = formData.industry === 'Other' ? formData.customIndustry : formData.industry;
    const challenge = formData.challenge === 'Other' ? formData.customChallenge : formData.challenge;

    const prompt = `Generate 3 compelling value propositions for a company in the ${industry} industry that is facing the challenge of ${challenge}. 

Company Details:
- Company Name: ${formData.companyName || 'Our organization'}
- Goal: ${formData.goal}
- Target Client Context: ${formData.clientContext || 'General business clients'}
- Desired Tone: ${formData.tone}

Requirements:
1. Each value proposition should be 1-2 sentences long
2. Focus on the specific industry and challenge mentioned
3. Incorporate the company's goal
4. Use the specified tone (${formData.tone})
5. Make them compelling and benefit-focused
6. Avoid generic statements - be specific to the industry and challenge

Format the response as 3 separate value propositions, each clearly labeled as "Draft 1:", "Draft 2:", and "Draft 3:".`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response format from Gemini API');
    }

    const generatedText = data.candidates[0].content.parts.map(p => p.text || '').join('\n').trim();

    // Helper: strip common markdown wrappers like **bold** and surrounding quotes
    const stripMd = (s) => s
      .replace(/^['"\s]+|['"\s]+$/g, '')
      .replace(/\*\*/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const propositions = [];

    // 1) Primary parse: capture multi-line sections between Draft labels
    try {
      const regex = /(?:^|\n)\s*(?:\*\*)?Draft\s*(\d)\s*:?\s*(?:\*\*)?\s*(.*?)\s*(?=(?:\n\s*(?:\*\*)?Draft\s*\d\s*:?)|$)/gis;
      let match;
      const map = {};
      while ((match = regex.exec(generatedText)) !== null) {
        const idx = Number(match[1]);
        const text = stripMd(match[2]);
        if (idx >= 1 && idx <= 3 && text) {
          map[idx] = text;
        }
      }
      if (map[1]) propositions.push(map[1]);
      if (map[2]) propositions.push(map[2]);
      if (map[3]) propositions.push(map[3]);
    } catch {}

    // 2) Fallback: bullet/numbered list lines
    if (propositions.length < 3) {
      const bullets = generatedText
        .split(/\n+/)
        .map(l => l.trim())
        .filter(l => /^[-*•\d]+[.)]?\s+/.test(l))
        .map(l => stripMd(l.replace(/^[-*•\d]+[.)]?\s+/, '')))
        .filter(Boolean);
      for (const b of bullets) {
        if (propositions.length < 3) propositions.push(b);
      }
    }

    // 3) Fallback: sentence split
    if (propositions.length < 3) {
      const sentences = generatedText
        .split(/(?<=[.!?])\s+/)
        .map(stripMd)
        .filter(s => s.length > 20);
      for (const s of sentences) {
        if (propositions.length < 3) propositions.push(s);
      }
    }

    // Ensure exactly three items, pad if needed
    while (propositions.length < 3) {
      propositions.push('Unable to parse this draft from the AI response. Please try again.');
    }

    return propositions.slice(0, 3);

  } catch (error) {
    console.error('Error generating value propositions:', error);
    throw error;
  }
};
