const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const OpenAI = require('openai');

// Initialize Express
const app = express();
const port = 3000;

// Middleware to parse incoming requests
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// OpenAI Configuration
const openai = new OpenAI({
    apiKey: "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",
});

// Fetch Text Content from URL
const fetchTextContentFromURL = async (url) => {
    try {
        const { data: html } = await axios.get(url);
        const $ = cheerio.load(html);
        return $('body').text().replace(/\s+/g, ' ').trim();
    } catch (error) {
        console.error(`Error fetching content from ${url}:`, error.message);
        return 'Error fetching content from the URL.';
    }
};

// Generate Video Script using OpenAI
const generateVideoScript = async (content) => {
    try {
        const prompt = `
        Generate a professional video script based on the following content:
        ${content}
        The script should be engaging and formatted for narration.
        `;

        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                { role: 'system', content: 'You are an expert scriptwriter.' },
                { role: 'user', content: prompt },
            ],
            max_tokens: 1500,
            temperature: 0.7,
        });

        return response.choices[0].message.content.trim();
    } catch (error) {
        console.error('Error generating video script:', error.message);
        return 'Error generating video script.';
    }
};

// Route for UI
app.get('/', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>Video Script Generator</title>
            </head>
            <body>
                <h1>Enter a URL to Generate a Video Script</h1>
                <form method="POST" action="/generate">
                    <label for="url">Enter URL:</label>
                    <input type="text" id="url" name="url" placeholder="https://example.com" required />
                    <button type="submit">Generate Script</button>
                </form>
            </body>
        </html>
    `);
});

// Route to Handle Script Generation
app.post('/generate', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        res.status(400).send('URL is required');
        return;
    }

    try {
        const content = await fetchTextContentFromURL(url);
        const script = await generateVideoScript(content);

        res.send(`
            <html>
                <head>
                    <title>Generated Script</title>
                </head>
                <body>
                    <h1>Generated Video Script</h1>
                    <p><strong>URL:</strong> ${url}</p>
                    <h2>Script:</h2>
                    <pre>${script}</pre>
                    <a href="/">Go Back</a>
                </body>
            </html>
        `);
    } catch (error) {
        res.status(500).send('An error occurred while processing the request.');
    }
});

// Start the Server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
