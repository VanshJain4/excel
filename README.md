# Excel Cursor

An AI-powered assistant for Excel that provides real-time suggestions, formula optimization, and intelligent data analysis - like Cursor but for spreadsheets.

## Features (Planned)

- 🤖 **Real-time AI assistance** - Get suggestions as you work
- 📊 **Smart formula suggestions** - AI-powered formula recommendations
- 🔍 **Data analysis insights** - Automatic pattern recognition
- 🛡️ **Error prevention** - Catch mistakes before they happen
- 💬 **Natural language interface** - "Sum all sales in Q1"
- ⚡ **Performance optimization** - Smart caching and processing

## Tech Stack

- **Backend**: Python with FastAPI
- **Excel Integration**: openpyxl, xlwings
- **AI**: OpenAI API / Local LLM
- **Frontend**: React with TypeScript
- **UI**: Tailwind CSS + Shadcn/ui

## Getting Started

### **Option 1: One-Click Start (Recommended)**
```bash
# Install Python dependencies
pip install -r requirements.txt

# Start both servers with one command
python3 start_excel_cursor.py
```
**Then open your browser to: http://localhost:3000**

### **Option 2: Manual Start**
```bash
# Install Python dependencies
pip install -r requirements.txt

# Terminal 1: Start backend server
cd backend && python3 main.py

# Terminal 2: Start frontend server
python3 serve_frontend.py
```
**Then open your browser to: http://localhost:3000**

### **Option 3: Using npm scripts**
```bash
# Install dependencies
pip install -r requirements.txt
npm install

# Start both servers
npm run dev
```
**Then open your browser to: http://localhost:3000**

## 🌐 Access Your Application

- **Frontend UI**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

**⚠️ Important**: Always access the application through `http://localhost:3000`, not by opening the HTML file directly!

## Development

```bash
# Run tests
npm run test

# Create test data
npm run create-test-data

# Start only backend
npm run start

# Start only frontend
npm run frontend
```

## Project Structure

```
Excel_cursor/
├── backend/          # Python FastAPI server
├── frontend/         # React TypeScript app
├── excel_engine/     # Excel manipulation logic
├── ai_engine/        # AI integration
└── docs/            # Documentation
```

## Development Status

🚧 **In Development** - Core architecture and basic functionality being built. 