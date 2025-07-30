import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from pathlib import Path
import aiofiles
from typing import Dict, Any, List

from excel_engine.excel_processor import ExcelProcessor
from ai_engine.ai_assistant import AIAssistant

app = FastAPI(title="Excel Cursor API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "file://"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize engines
excel_processor = ExcelProcessor()
ai_assistant = AIAssistant()

@app.get("/")
async def root():
    return {"message": "Excel Cursor API is running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "services": {"excel": "ready", "ai": "ready"}}

@app.post("/upload-excel")
async def upload_excel(file: UploadFile = File(...)):
    """Upload and process an Excel file"""
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Only Excel files are supported")
    
    try:
        # Save uploaded file
        upload_dir = Path("uploads")
        upload_dir.mkdir(exist_ok=True)
        file_path = upload_dir / file.filename
        
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        # Process the Excel file using the saved path
        result = excel_processor.process_file(str(file_path))
        
        return {
            "message": "File uploaded successfully",
            "filename": file.filename,
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-cell")
async def analyze_cell(data: Dict[str, Any]):
    """Analyze a specific cell and provide AI suggestions"""
    try:
        cell_value = data.get("cell_value", "")
        context = data.get("context", {})
        
        suggestions = ai_assistant.analyze_cell(cell_value, context)
        
        return {
            "suggestions": suggestions,
            "cell_value": cell_value
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/suggest-formula")
async def suggest_formula(data: Dict[str, Any]):
    """Get AI-powered formula suggestions"""
    try:
        description = data.get("description", "")
        context = data.get("context", {})
        
        formula = ai_assistant.suggest_formula(description, context)
        
        return {
            "formula": formula,
            "description": description
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/validate-formula")
async def validate_formula(data: Dict[str, Any]):
    """Validate and optimize Excel formulas"""
    try:
        formula = data.get("formula", "")
        context = data.get("context", {})
        
        validation = excel_processor.validate_formula(formula, context)
        
        return validation
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/debug-excel")
async def debug_excel():
    """Debug endpoint to test Excel processor"""
    try:
        # Use the correct path from backend directory
        result = excel_processor.process_file("../test_data.xlsx")
        return {
            "debug_result": result,
            "processor_type": str(type(excel_processor))
        }
    except Exception as e:
        return {
            "error": str(e),
            "error_type": str(type(e))
        }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 