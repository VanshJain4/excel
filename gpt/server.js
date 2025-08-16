const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const PORT = 3000;
const AUTH_BACKEND_URL = "http://localhost:5001";

// Root endpoint - serve the HTML file
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Collabora with chat interface
app.get("/collabora-with-chat.html", (req, res) => {
    res.sendFile(path.join(__dirname, "collabora-with-chat.html"));
});

// WOPI endpoint: return file info - proxy to auth backend
app.get("/wopi/files/:id", async (req, res) => {
    try {
        const fileId = req.params.id;
        const response = await axios.get(`${AUTH_BACKEND_URL}/api/files/wopi/${fileId}`);
        res.json(response.data);
    } catch (error) {
        console.error("Error fetching file info:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// WOPI endpoint: return file content - proxy to auth backend
app.get("/wopi/files/:id/contents", async (req, res) => {
    try {
        const fileId = req.params.id;
        const response = await axios.get(`${AUTH_BACKEND_URL}/api/files/wopi/${fileId}/contents`, {
            responseType: 'stream'
        });
        
        response.data.pipe(res);
    } catch (error) {
        console.error("Error fetching file content:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// WOPI endpoint: save file - proxy to auth backend
app.post("/wopi/files/:id/contents", async (req, res) => {
    try {
        const fileId = req.params.id;
        // For now, we'll just acknowledge the save
        // In a full implementation, you'd want to actually save the file
        res.sendStatus(200);
    } catch (error) {
        console.error("Error saving file:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.listen(PORT, () => {
    console.log(`WOPI host running on http://localhost:${PORT}`);
}); 