const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// CORS is magic! It allows your frontend app to talk to this backend without security errors.
app.use(cors()); 

// Basic Home Route (Just to check if server is alive)
app.get('/', (req, res) => {
    res.send('CNMW Backend is Live and Bypassing ISPs! 🚀');
});

// The Secret God-Mode Route for Saavn
app.get('/api/saavn', async (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ error: "Please provide a search query!" });
    }

    try {
        // Our server makes the request to Saavn (ISPs can't block this because servers don't have Jio/Airtel!)
        const saavnAPI = `https://saavn.dev/api/search/songs?limit=40&query=${encodeURIComponent(query)}`;
        const response = await axios.get(saavnAPI);
        
        // Send the pure data back to our Frontend App
        res.json(response.data);
    } catch (error) {
        console.error("Backend Error:", error.message);
        res.status(500).json({ error: "Failed to fetch data from Saavn." });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`CNMW Backend running on port ${PORT} 🔥`);
});
