const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors()); 

app.get('/', (req, res) => {
    res.send('CNMW Bulletproof Backend is Live! 🚀');
});

app.get('/api/saavn', async (req, res) => {
    const query = req.query.q;
    if (!query) return res.status(400).json({ error: "Please provide a search query!" });

    // Removed the dead saavn.dev! Using 3 strong surviving APIs
    const APIs = [
        `https://saavn.me/search/songs?query=${encodeURIComponent(query)}`,
        `https://jiosaavn-api-privatecvc2.vercel.app/search/songs?query=${encodeURIComponent(query)}`,
        `https://jiosaavn-api-v3.vercel.app/search/songs?query=${encodeURIComponent(query)}`
    ];

    let success = false;
    let lastError = "";

    // Loop through APIs until one works
    for (let api of APIs) {
        try {
            const response = await axios.get(api, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'application/json'
                },
                timeout: 5000 // 5 seconds max wait per API
            });
            
            // Check if valid data exists
            if (response.data && (response.data.data || response.data.results)) {
                res.json(response.data); 
                success = true;
                break; // Found it! Break the loop.
            }
        } catch (error) {
            lastError = error.message;
            console.log(`Failed API (${api}): ${lastError}. Trying next...`);
        }
    }

    if (!success) {
        res.status(500).json({ error: "All Saavn APIs are down right now.", details: lastError });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`CNMW Backend running on port ${PORT} 🔥`);
});
