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

```bash
# Install dependencies
pip install -r requirements.txt
npm install

# Start the backend
python backend/main.py

# Start the frontend
npm run dev
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