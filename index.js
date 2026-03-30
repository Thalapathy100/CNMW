const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors()); 

app.get('/', (req, res) => {
    res.send('CNMW Bulletproof Backend is Live! 🚀');
});

// --- 🎵 SAAVN ENGINE ---
app.get('/api/saavn', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: "Please provide a search query!" });

    const APIs = [
        `https://saavn.me/search/songs?query=${encodeURIComponent(query)}`,
        `https://jiosaavn-api-privatecvc2.vercel.app/search/songs?query=${encodeURIComponent(query)}`,
        `https://jiosaavn-api-v3.vercel.app/search/songs?query=${encodeURIComponent(query)}`
    ];

    let success = false;
    for (let api of APIs) {
        try {
            const response = await axios.get(api, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
                timeout: 5000 
            });
            if (response.data && (response.data.data || response.data.results)) {
                res.json(response.data); 
                success = true;
                break;
            }
        } catch (error) { console.log(`Failed Saavn: ${error.message}`); }
    }
    if (!success) res.status(500).json({ error: "All Saavn APIs down." });
});

// --- 🎥 YOUTUBE ENGINE (SEARCH) ---
app.get('/api/yt', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: "Please provide a search query!" });

    const APIs = [
        "https://pipedapi.kavin.rocks",
        "https://pipedapi.tokhmi.xyz",
        "https://api.piped.projectsegfau.lt"
    ];

    let success = false;
    for (let server of APIs) {
        try {
            const response = await axios.get(`${server}/search?q=${encodeURIComponent(query)}&filter=all`, { timeout: 6000 });
            if (response.data && response.data.items) {
                res.json({ server: server, items: response.data.items });
                success = true;
                break;
            }
        } catch (error) { console.log(`Failed YT: ${error.message}`); }
    }
    if (!success) res.status(500).json({ error: "All YT APIs down." });
});

// --- 🎥 YOUTUBE ENGINE (AUDIO EXTRACTOR) ---
app.get('/api/yt/stream', async (req, res) => {
    const videoId = req.query.id;
    const server = req.query.server; // We get this from the search response
    try {
        const response = await axios.get(`${server}/streams/${videoId}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Failed to extract audio." });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`CNMW Backend running on port ${PORT} 🔥`);
});
