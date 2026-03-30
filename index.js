const express = require('express');
const cors = require('cors');
const axios = require('axios');
const ytSearch = require('yt-search'); // THE ULTIMATE WEAPON 🗡️

const app = express();
app.use(cors());

app.get('/', (req, res) => {
    res.send('CNMW God-Mode Backend is Live! 🚀');
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
    res.status(500).json({ error: "Saavn down" });
});

// --- 🎥 YOUTUBE BYPASS ENGINE (Direct Scraping) ---
app.get('/api/yt', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: "Query needed" });

    try {
        console.log(`Searching YT direct for: ${query}`);
        const r = await ytSearch(query);
        
        // Trick the data so our Frontend doesn't need any updates!
        const videos = r.videos.slice(0, 15).map(v => ({
            videoId: v.videoId,
            title: v.title,
            author: v.author.name,
            videoThumbnails: [{ url: v.thumbnail }]
        }));
        
        res.json({ server: "local", items: videos });
    } catch (error) {
        console.error("YT Search Error:", error);
        res.status(500).json({ error: "YT Direct Search Failed." });
    }
});

// --- 🎥 YOUTUBE AUDIO EXTRACTOR (Rotating Nodes) ---
app.get('/api/yt/stream', async (req, res) => {
    const videoId = req.query.id;
    
    // Using an army of free nodes. If one fails, it jumps to the next!
    const nodes = [
        `https://pipedapi.kavin.rocks/streams/${videoId}`,
        `https://invidious.nerdvpn.de/api/v1/videos/${videoId}`,
        `https://api.piped.projectsegfau.lt/streams/${videoId}`,
        `https://inv.tux.pizza/api/v1/videos/${videoId}`
    ];

    for (let server of nodes) {
        try {
            const response = await axios.get(server, { timeout: 6000 });
            let streamUrl = null;

            // Piped Format
            if (response.data.audioStreams) {
                const stream = response.data.audioStreams.find(a => a.mimeType.includes('mp4') || a.mimeType.includes('webm'));
                if (stream) streamUrl = stream.url;
            } 
            // Invidious Format
            else if (response.data.adaptiveFormats) {
                const stream = response.data.adaptiveFormats.find(a => a.type.includes('audio'));
                if (stream) streamUrl = stream.url;
            }

            // Fake the format so Frontend perfectly understands it
            if (streamUrl) {
                console.log(`Stream found on: ${server}`);
                return res.json({ adaptiveFormats: [{ type: "audio", url: streamUrl }] });
            }
        } catch (error) { 
            console.log(`Stream blocked on ${server}, jumping to next...`); 
            continue; 
        }
    }
    
    res.status(500).json({ error: "All extraction nodes blocked." });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`CNMW Backend running on port ${PORT} 🔥`);
});
