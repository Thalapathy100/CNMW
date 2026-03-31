const express = require('express');
const cors = require('cors');
const axios = require('axios');
const ytSearch = require('yt-search');

const app = express();
app.use(cors());

app.get('/', (req, res) => {
    res.send('CNMW Boss-Mode Backend is LIVE! 🟢');
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

// --- 🎥 YOUTUBE SEARCH ENGINE ---
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

// --- 🎥 YOUTUBE HYDRA EXTRACTOR (8 Backup Nodes) ---
app.get('/api/yt/stream', async (req, res) => {
    const videoId = req.query.id;
    if (!videoId) return res.status(400).json({ error: "Video ID needed" });
    
    const nodes = [
        `https://pipedapi.smnz.de/streams/${videoId}`,
        `https://vid.puffyan.us/api/v1/videos/${videoId}`,
        `https://pipedapi.adminforge.de/streams/${videoId}`,
        `https://inv.tux.pizza/api/v1/videos/${videoId}`,
        `https://pipedapi.tokhmi.xyz/streams/${videoId}`,
        `https://invidious.flokinet.to/api/v1/videos/${videoId}`,
        `https://invidious.jing.rocks/api/v1/videos/${videoId}`,
        `https://pipedapi.kavin.rocks/streams/${videoId}`
    ];

    for (let server of nodes) {
        try {
            // Very fast 4-second timeout. If blocked, jumps immediately!
            const response = await axios.get(server, { timeout: 4000 });
            let streamUrl = null;

            if (response.data.audioStreams) {
                const stream = response.data.audioStreams.find(a => a.mimeType.includes('mp4') || a.mimeType.includes('webm'));
                if (stream) streamUrl = stream.url;
            } else if (response.data.adaptiveFormats) {
                const stream = response.data.adaptiveFormats.find(a => a.type.includes('audio'));
                if (stream) streamUrl = stream.url;
            }

            if (streamUrl) {
                console.log(`Stream successful from: ${server}`);
                return res.json({ adaptiveFormats: [{ type: "audio", url: streamUrl }] });
            }
        } catch (error) { 
            continue; 
        }
    }
    res.status(500).json({ error: "All YT extraction nodes blocked." });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`CNMW Backend running on port ${PORT} 🚀`);
});
