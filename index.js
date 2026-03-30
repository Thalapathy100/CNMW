const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors()); 

app.get('/', (req, res) => {
    res.send('CNMW Pro Backend is Live! 🚀');
});

// --- 🎵 SAAVN ENGINE ---
app.get('/api/saavn', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: "Query needed" });

    const APIs = [
        `https://saavn.me/search/songs?query=${encodeURIComponent(query)}`,
        `https://jiosaavn-api-privatecvc2.vercel.app/search/songs?query=${encodeURIComponent(query)}`,
        `https://jiosaavn-api-v3.vercel.app/search/songs?query=${encodeURIComponent(query)}`
    ];

    let success = false;
    for (let api of APIs) {
        try {
            const response = await axios.get(api, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 5000 });
            if (response.data && (response.data.data || response.data.results)) {
                res.json(response.data); success = true; break;
            }
        } catch (error) { console.log(`Saavn API Failed`); }
    }
    if (!success) res.status(500).json({ error: "Saavn down" });
});

// --- 🎥 YOUTUBE ENGINE (INVIDIOUS FIX) ---
app.get('/api/yt', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: "Query needed" });

    // The new unbreakable Invidious APIs
    const APIs = [
        "https://inv.tux.pizza/api/v1",
        "https://invidious.nerdvpn.de/api/v1",
        "https://invidious.privacydev.net/api/v1"
    ];

    let success = false;
    for (let server of APIs) {
        try {
            const response = await axios.get(`${server}/search?q=${encodeURIComponent(query)}&type=video`, { timeout: 6000 });
            if (response.data && response.data.length > 0) {
                res.json({ server: server, items: response.data });
                success = true; break;
            }
        } catch (error) { console.log(`YT Failed on ${server}`); }
    }
    if (!success) res.status(500).json({ error: "YT APIs down." });
});

app.get('/api/yt/stream', async (req, res) => {
    const videoId = req.query.id;
    const server = req.query.server;
    try {
        const response = await axios.get(`${server}/videos/${videoId}`);
        res.json(response.data);
    } catch (error) { res.status(500).json({ error: "Extract failed" }); }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`CNMW Backend running on port ${PORT} 🔥`);
});
                                                                                             
