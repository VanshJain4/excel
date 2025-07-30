#!/usr/bin/env python3
"""
Excel Cursor Startup Script
This script starts both the backend and frontend servers
"""

import subprocess
import sys
import time
import webbrowser
from pathlib import Path

def start_excel_cursor():
    """Start Excel Cursor with both servers"""
    
    print("🚀 Starting Excel Cursor...")
    print("=" * 50)
    
    # Check if backend directory exists
    if not Path("backend").exists():
        print("❌ Backend directory not found!")
        return
    
    # Check if frontend directory exists
    if not Path("frontend").exists():
        print("❌ Frontend directory not found!")
        return
    
    print("📋 Starting servers...")
    print("🌐 Backend API: http://localhost:8000")
    print("🌐 Frontend UI: http://localhost:3000")
    print("📚 API Docs: http://localhost:8000/docs")
    print("=" * 50)
    
    try:
        # Start backend server
        print("🔧 Starting backend server...")
        backend_process = subprocess.Popen(
            ["python3", "main.py"],
            cwd="backend",
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        # Wait a moment for backend to start
        time.sleep(3)
        
        # Start frontend server
        print("🎨 Starting frontend server...")
        frontend_process = subprocess.Popen(
            ["python3", "../serve_frontend.py"],
            cwd="frontend"
        )
        
        # Wait a moment for frontend to start
        time.sleep(2)
        
        print("✅ Both servers started successfully!")
        print("=" * 50)
        print("🌐 Access your Excel Cursor at: http://localhost:3000")
        print("🔧 API available at: http://localhost:8000")
        print("📚 API documentation at: http://localhost:8000/docs")
        print("=" * 50)
        print("⏹️  Press Ctrl+C to stop all servers")
        
        # Open browser
        webbrowser.open("http://localhost:3000")
        
        # Keep the script running
        try:
            backend_process.wait()
        except KeyboardInterrupt:
            print("\n🛑 Stopping servers...")
            backend_process.terminate()
            frontend_process.terminate()
            print("✅ Servers stopped")
            
    except Exception as e:
        print(f"❌ Error starting servers: {e}")
        return

if __name__ == "__main__":
    start_excel_cursor() 