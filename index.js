const express = require('express');
const cors = require('cors');
const axios = require('axios');
const ytSearch = require('yt-search');
const ytdl = require('@distube/ytdl-core'); // THE OFFICIAL CORE 🛡️

const app = express();
app.use(cors());

app.get('/', (req, res) => {
    res.send('CNMW Official Core Backend is LIVE! 🟢');
});

// --- 🎵 SAAVN ENGINE ---
app.get('/api/saavn', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: "Query needed" });

    const APIs = [
        `https://saavn.me/search/songs?query=${encodeURIComponent(query)}`,
        `https://jiosaavn-api-privatecvc2.vercel.app/search/songs?query=${encodeURIComponent(query)}`
    ];

    for (let api of APIs) {
        try {
            const response = await axios.get(api, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 5000 });
            if (response.data && response.data.data) return res.json(response.data);
        } catch (error) { continue; }
    }
    res.status(500).json({ error: "Saavn API blocked." });
});

// --- 🎥 YOUTUBE SEARCH ---
app.get('/api/yt', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: "Query needed" });

    try {
        const r = await ytSearch(query);
        const videos = r.videos.slice(0, 15).map(v => ({
            videoId: v.videoId,
            title: v.title,
            author: v.author.name,
            videoThumbnails: [{ url: v.thumbnail }]
        }));
        res.json({ server: "local", items: videos });
    } catch (error) {
        res.status(500).json({ error: "YT Search Failed." });
    }
});

// --- 🎥 YOUTUBE OFFICIAL AUDIO EXTRACTOR ---
app.get('/api/yt/stream', async (req, res) => {
    const videoId = req.query.id;
    if (!videoId) return res.status(400).json({ error: "Video ID needed" });

    try {
        console.log(`Extracting official core link for: ${videoId}`);
        // This is where we bypass using the core library natively
        const info = await ytdl.getInfo(videoId);
        const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
        
        if (format && format.url) {
            return res.json({ adaptiveFormats: [{ type: "audio", url: format.url }] });
        } else {
            throw new Error("Format not found");
        }
    } catch (error) {
        console.error("Core extraction failed:", error.message);
        res.status(500).json({ error: "YT blocked the Core Extractor." });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`CNMW Backend running on port ${PORT} 🚀`);
});
