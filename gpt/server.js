const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const PORT = 3000;
const FILE_PATH = path.join(__dirname, "sample-spreadsheet.xlsx");

// Root endpoint - serve the HTML file
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Collabora with chat interface
app.get("/collabora-with-chat.html", (req, res) => {
    res.sendFile(path.join(__dirname, "collabora-with-chat.html"));
});

// WOPI endpoint: return file info
app.get("/wopi/files/:id", (req, res) => {
    res.json({
        BaseFileName: "sample-spreadsheet.xlsx",
        Size: fs.statSync(FILE_PATH).size,
        OwnerId: "user1",
        Version: "1",
        SupportsUpdate: true,
        UserCanWrite: true
    });
});

// WOPI endpoint: return file content
app.get("/wopi/files/:id/contents", (req, res) => {
    fs.createReadStream(FILE_PATH).pipe(res);
});

// WOPI endpoint: save file
app.post("/wopi/files/:id/contents", (req, res) => {
    const stream = fs.createWriteStream(FILE_PATH);
    req.pipe(stream);
    req.on("end", () => res.sendStatus(200));
});

app.listen(PORT, () => {
    console.log(`WOPI host running on http://localhost:${PORT}`);
}); 