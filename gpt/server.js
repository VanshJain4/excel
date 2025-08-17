const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.raw({ type: 'application/octet-stream', limit: '50mb' }));
app.use(express.static(__dirname));

const PORT = 3002;

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAV8EITshJJO_-NGkBOMiU3gIIMs0vZirQ",
  authDomain: "skopeo-ai.firebaseapp.com",
  projectId: "skopeo-ai",
  storageBucket: "skopeo-ai.firebasestorage.app",
  messagingSenderId: "295265049654",
  appId: "1:295265049654:web:486856ccde50928efe8c97",
  measurementId: "G-S7Y1FDBM6L"
};

// Firebase REST API endpoints
const FIRESTORE_BASE_URL = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents`;

// Helper function to fetch file from Firebase Firestore
async function fetchFileFromFirebase(fileId) {
    try {
        const url = `${FIRESTORE_BASE_URL}/files/${fileId}`;
        const response = await axios.get(url, {
            params: {
                key: firebaseConfig.apiKey
            }
        });
        
        if (response.data && response.data.fields) {
            const fields = response.data.fields;
            return {
                fileName: fields.fileName?.stringValue || fields.originalName?.stringValue || 'spreadsheet.xlsx',
                fileSize: fields.fileSize?.integerValue || 0,
                mimeType: fields.mimeType?.stringValue || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                fileContent: fields.fileContent?.stringValue || null,
                userId: fields.userId?.stringValue || 'anonymous',
                createdAt: fields.createdAt?.timestampValue || null,
                updatedAt: fields.updatedAt?.timestampValue || null
            };
        }
        return null;
    } catch (error) {
        console.error('Error fetching file from Firebase:', error.message);
        return null;
    }
}

// Helper function to convert base64 to buffer
function base64ToBuffer(base64Data) {
    try {
        // Remove data URL prefix if present
        const base64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
        
        // Convert base64 to buffer
        const buffer = Buffer.from(base64, 'base64');
        return buffer;
    } catch (error) {
        console.error('Error converting base64 to buffer:', error);
        return null;
    }
}

// Root endpoint - serve the HTML file
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Collabora with chat interface
app.get("/collabora-with-chat.html", (req, res) => {
    res.sendFile(path.join(__dirname, "collabora-with-chat.html"));
});

// WOPI endpoint: return file info
app.get("/wopi/files/:id", async (req, res) => {
    try {
        const fileId = req.params.id;
        
        if (fileId === 'empty') {
            // Return info for empty file
            res.json({
                BaseFileName: "empty.xlsx",
                Size: 0,
                Version: "1.0",
                OwnerId: "anonymous",
                UserId: "anonymous",
                UserCanWrite: true,
                UserCanNotWriteRelative: false,
                UserCanRename: false,
                UserCanShare: false,
                UserCanPresent: false,
                UserCanComment: false,
                UserCanEdit: true,
                UserCanView: true,
                PostMessageOrigin: "*",
                HidePrintOption: false,
                HideSaveOption: false,
                HideExportOption: false,
                DisablePrint: false,
                DisableExport: false,
                DisableCopy: false,
                DisableInactiveMessages: false,
                DownloadUrl: "",
                FileUrl: "",
                HostEditUrl: "",
                HostViewUrl: "",
                FileSharingUrl: "",
                SignoutUrl: "",
                BreadcrumbBrandName: "SKOPEO.AI",
                BreadcrumbBrandUrl: "",
                BreadcrumbDocName: "empty.xlsx",
                BreadcrumbDocUrl: "",
                BreadcrumbFolderName: "",
                BreadcrumbFolderUrl: "",
                ClientUrl: "",
                CloseUrl: "",
                FileSharingUrl: "",
                HostViewUrl: "",
                SignoutUrl: "",
                UserInfo: {
                    Id: "anonymous",
                    Name: "Anonymous User",
                    Email: "anonymous@example.com"
                }
            });
            return;
        }
        
        // Fetch actual file from Firebase
        const fileData = await fetchFileFromFirebase(fileId);
        
        if (!fileData) {
            console.log(`File not found in Firebase: ${fileId}`);
            return res.status(404).json({ error: "File not found" });
        }
        
        console.log(`Serving file from Firebase: ${fileData.fileName} (${fileData.fileSize} bytes)`);
        
        res.json({
            BaseFileName: fileData.fileName,
            Size: fileData.fileSize,
            Version: "1.0",
            OwnerId: fileData.userId,
            UserId: fileData.userId,
            UserCanWrite: true,
            UserCanNotWriteRelative: false,
            UserCanRename: false,
            UserCanShare: false,
            UserCanPresent: false,
            UserCanComment: false,
            UserCanEdit: true,
            UserCanView: true,
            PostMessageOrigin: "*",
            HidePrintOption: false,
            HideSaveOption: false,
            HideExportOption: false,
            DisablePrint: false,
            DisableExport: false,
            DisableCopy: false,
            DisableInactiveMessages: false,
            DownloadUrl: "",
            FileUrl: "",
            HostEditUrl: "",
            HostViewUrl: "",
            FileSharingUrl: "",
            SignoutUrl: "",
            BreadcrumbBrandName: "SKOPEO.AI",
            BreadcrumbBrandUrl: "",
            BreadcrumbDocName: fileData.fileName,
            BreadcrumbDocUrl: "",
            BreadcrumbFolderName: "",
            BreadcrumbFolderUrl: "",
            ClientUrl: "",
            CloseUrl: "",
            FileSharingUrl: "",
            HostViewUrl: "",
            SignoutUrl: "",
            UserInfo: {
                Id: fileData.userId,
                Name: "User",
                Email: "user@example.com"
            }
        });
    } catch (error) {
        console.error("Error fetching file info:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// WOPI endpoint: return file content
app.get("/wopi/files/:id/contents", async (req, res) => {
    try {
        const fileId = req.params.id;
        
        if (fileId === 'empty') {
            // Return empty Excel file
            const emptyExcelPath = path.join(__dirname, 'sample-spreadsheet.xlsx');
            if (fs.existsSync(emptyExcelPath)) {
                res.sendFile(emptyExcelPath);
            } else {
                res.status(404).json({ error: "Empty file template not found" });
            }
            return;
        }
        
        // Check if we have updated content from WOPI save
        if (global.tempFileStorage && global.tempFileStorage.has(fileId)) {
            const tempData = global.tempFileStorage.get(fileId);
            console.log(`Serving updated content from WOPI save: ${fileId}, size: ${tempData.size} bytes`);
            
            // Set appropriate headers
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Length', tempData.size);
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
            
            res.send(tempData.content);
            return;
        }
        
        // Fetch actual file from Firebase
        const fileData = await fetchFileFromFirebase(fileId);
        
        if (!fileData) {
            console.log(`File not found in Firebase: ${fileId}`);
            // Fallback to sample file
            const sampleExcelPath = path.join(__dirname, 'sample-spreadsheet.xlsx');
            if (fs.existsSync(sampleExcelPath)) {
                res.sendFile(sampleExcelPath);
            } else {
                res.status(404).json({ error: "File not found" });
            }
            return;
        }
        
        if (!fileData.fileContent) {
            console.log(`No file content for: ${fileId}`);
            // Fallback to sample file
            const sampleExcelPath = path.join(__dirname, 'sample-spreadsheet.xlsx');
            if (fs.existsSync(sampleExcelPath)) {
                res.sendFile(sampleExcelPath);
            } else {
                res.status(404).json({ error: "File content not found" });
            }
            return;
        }
        
        // Convert base64 to buffer
        const buffer = base64ToBuffer(fileData.fileContent);
        
        if (!buffer) {
            console.log(`Failed to convert base64 for: ${fileId}`);
            // Fallback to sample file
            const sampleExcelPath = path.join(__dirname, 'sample-spreadsheet.xlsx');
            if (fs.existsSync(sampleExcelPath)) {
                res.sendFile(sampleExcelPath);
            } else {
                res.status(500).json({ error: "Failed to process file content" });
            }
            return;
        }
        
        console.log(`Serving file content: ${fileData.fileName} (${buffer.length} bytes)`);
        
        // Set appropriate headers
        res.setHeader('Content-Type', fileData.mimeType || 'application/octet-stream');
        res.setHeader('Content-Length', buffer.length);
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        
        res.send(buffer);
    } catch (error) {
        console.error("Error fetching file content:", error);
        // Fallback to sample file
        const sampleExcelPath = path.join(__dirname, 'sample-spreadsheet.xlsx');
        if (fs.existsSync(sampleExcelPath)) {
            res.sendFile(sampleExcelPath);
        } else {
            res.status(500).json({ error: "Internal server error" });
        }
    }
});

// WOPI endpoint: save file
app.post("/wopi/files/:id/contents", async (req, res) => {
    try {
        const fileId = req.params.id;
        const fileContent = req.body;
        
        console.log(`WOPI: Saving file ${fileId}, content length: ${fileContent.length} bytes`);
        
        // Store the updated content temporarily so it can be retrieved
        // This will be used when the Firebase save button downloads the content
        if (!global.tempFileStorage) {
            global.tempFileStorage = new Map();
        }
        
        // Store the updated content with timestamp
        global.tempFileStorage.set(fileId, {
            content: fileContent,
            timestamp: Date.now(),
            size: fileContent.length
        });
        
        console.log(`WOPI: Stored updated content for ${fileId}, size: ${fileContent.length} bytes`);
        
        res.sendStatus(200);
    } catch (error) {
        console.error("Error saving file:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Debug endpoint to list files
app.get("/debug/files", async (req, res) => {
    try {
        const url = `${FIRESTORE_BASE_URL}/files`;
        const response = await axios.get(url, {
            params: {
                key: firebaseConfig.apiKey
            }
        });
        
        if (response.data && response.data.documents) {
            const files = response.data.documents.map(doc => ({
                id: doc.name.split('/').pop(),
                fileName: doc.fields?.fileName?.stringValue || doc.fields?.originalName?.stringValue,
                fileSize: doc.fields?.fileSize?.integerValue,
                userId: doc.fields?.userId?.stringValue,
                hasContent: !!doc.fields?.fileContent?.stringValue,
                createdAt: doc.fields?.createdAt?.timestampValue,
                updatedAt: doc.fields?.updatedAt?.timestampValue,
                base64Length: doc.fields?.fileContent?.stringValue?.length || 0
            }));
            
            res.json({
                totalFiles: files.length,
                files: files,
                timestamp: new Date().toISOString()
            });
        } else {
            res.json({ totalFiles: 0, files: [], timestamp: new Date().toISOString() });
        }
    } catch (error) {
        console.error('Error listing files:', error);
        res.status(500).json({ error: "Failed to list files" });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 WOPI host running on http://localhost:${PORT}`);
    console.log(`📁 Firebase project: ${firebaseConfig.projectId}`);
    console.log(`🔍 Debug endpoint: http://localhost:${PORT}/debug/files`);
}); 