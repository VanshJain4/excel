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

### **Option 1: Quick Start (Recommended)**
```bash
# Install Python dependencies
pip install -r requirements.txt

# Start both backend and frontend servers
python3 serve_frontend.py  # In one terminal
cd backend && python3 main.py  # In another terminal
```

### **Option 2: Using npm scripts**
```bash
# Install dependencies
pip install -r requirements.txt
npm install

# Start both servers
npm run dev
```

### **Option 3: Manual Start**
```bash
# Install dependencies
pip install -r requirements.txt

# Start backend server
cd backend && python3 main.py

# Start frontend server (in new terminal)
python3 serve_frontend.py
```

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