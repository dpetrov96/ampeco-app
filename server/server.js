const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Endpoint to fetch data from JSON file
app.get('/pins', (req, res) => {
    // Assuming data.json is in the same directory as this script
    const filePath = path.join(__dirname, 'react-native-interview-task-pins.json');

    // Read data from file
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        try {
            const jsonData = JSON.parse(data);
            res.json(jsonData);
        } catch (error) {
            console.error('Error parsing JSON data:', error);
            res.status(500).json({ error: 'Error parsing JSON data' });
        }
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
