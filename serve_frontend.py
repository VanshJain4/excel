#!/usr/bin/env python3
"""
Simple HTTP server to serve the frontend files
This avoids CORS issues when opening HTML files directly
"""

import http.server
import socketserver
import webbrowser
import os
from pathlib import Path

def serve_frontend():
    """Serve the frontend files on localhost"""
    
    # Change to frontend directory
    frontend_dir = Path("frontend")
    if not frontend_dir.exists():
        print("❌ Frontend directory not found!")
        return
    
    os.chdir(frontend_dir)
    
    # Set up server
    PORT = 3000
    Handler = http.server.SimpleHTTPRequestHandler
    
    try:
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            print(f"🌐 Frontend server running at http://localhost:{PORT}")
            print(f"📁 Serving files from: {frontend_dir.absolute()}")
            print("🔗 Opening browser...")
            
            # Open browser
            webbrowser.open(f"http://localhost:{PORT}")
            
            print("⏹️  Press Ctrl+C to stop the server")
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n🛑 Server stopped")
    except OSError as e:
        if "Address already in use" in str(e):
            print(f"❌ Port {PORT} is already in use. Try a different port or stop the existing server.")
        else:
            print(f"❌ Error: {e}")

if __name__ == "__main__":
    serve_frontend() 