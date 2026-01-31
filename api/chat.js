
import fetch from 'node-fetch';

export default async function handler(req, res) {
    // 1. Setup Headers for CORS (Security)
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow any frontend to call this
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle OPTIONS request (Browser pre-flight check)
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // 2. Security Check (API Key)
    const API_KEY = process.env.OPENAI_API_KEY;
    if (!API_KEY) {
        return res.status(500).json({ error: "Server Configuration Error: Missing API Key" });
    }

    // 3. Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        const { message } = req.body;

        // 4. Call OpenAI API
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "You are a helpful AI Business Sales Agent. Respond in short, sales-focused messages." },
                    { role: "user", content: message }
                ]
            })
        });

        const data = await response.json();

        // 5. Send Result back to Frontend
        if (data.error) throw new Error(data.error.message);
        const botReply = data.choices[0].message.content;

        res.status(200).json({ reply: botReply });

    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ reply: "Server connection failed." });
    }
}
