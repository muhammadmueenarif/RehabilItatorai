// Vercel Serverless Function - API Proxy for DeepSeek
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request for CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { reportText, systemPrompt } = req.body;

    if (!reportText) {
      return res.status(400).json({ error: 'reportText is required' });
    }

    // API key is stored server-side (secure)
    const apiKey = process.env.DEEPSEEK_API_KEY || "sk-ba2ff135a0ab48218d88c776e41b32f0";
    const apiUrl = "https://api.deepseek.com/v1/chat/completions";

    const payload = {
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt || "" },
        {
          role: "user",
          content: `Here is the combined text from the user's credit reports: \n\n${reportText}`,
        },
      ],
      response_format: { type: "json_object" },
      stream: true,
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      throw new Error(`API request failed: ${response.status} ${errText}`);
    }

    // Set headers for streaming response
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Stream the response from DeepSeek to the client
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      res.write(chunk);
    }

    res.end();
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Failed to process request', 
      details: error.message 
    });
  }
}

