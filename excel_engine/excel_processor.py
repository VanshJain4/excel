import openpyxl
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
import re
from pathlib import Path

class ExcelProcessor:
    """Core Excel processing engine for Excel Cursor"""
    
    def __init__(self):
        self.workbook = None
        self.current_sheet = None
        
    def process_file(self, file_path: str) -> Dict[str, Any]:
        """Process an Excel file and extract metadata"""
        try:
            self.workbook = openpyxl.load_workbook(file_path, data_only=True)
            
            # Extract basic information
            sheet_names = self.workbook.sheetnames
            active_sheet = self.workbook.active
            
            # Analyze the active sheet
            sheet_data = self._analyze_sheet(active_sheet)
            
            return {
                "filename": Path(file_path).name,
                "sheets": sheet_names,
                "active_sheet": active_sheet.title,
                "data": sheet_data,
                "status": "success"
            }
        except Exception as e:
            return {
                "status": "error",
                "message": str(e)
            }
    
    def _analyze_sheet(self, sheet) -> Dict[str, Any]:
        """Analyze a worksheet and extract useful information"""
        data = {
            "title": sheet.title,
            "dimensions": f"{sheet.max_row}x{sheet.max_column}",
            "used_range": f"A1:{sheet.max_column_letter}{sheet.max_row}",
            "data_types": {},
            "formulas": [],
            "headers": [],
            "summary": {}
        }
        
        # Analyze first row for headers
        if sheet.max_row > 0:
            headers = []
            for col in range(1, min(sheet.max_column + 1, 11)):  # First 10 columns
                cell_value = sheet.cell(row=1, column=col).value
                if cell_value:
                    headers.append(str(cell_value))
            data["headers"] = headers
        
        # Find formulas
        formulas = []
        for row in sheet.iter_rows():
            for cell in row:
                if cell.value and isinstance(cell.value, str) and cell.value.startswith('='):
                    formulas.append({
                        "cell": cell.coordinate,
                        "formula": cell.value
                    })
        data["formulas"] = formulas
        
        # Analyze data types in first few rows
        if sheet.max_row > 1:
            data_types = {}
            for col in range(1, min(sheet.max_column + 1, 6)):  # First 5 columns
                col_letter = sheet.cell(row=1, column=col).column_letter
                sample_values = []
                for row in range(2, min(sheet.max_row + 1, 7)):  # First 5 data rows
                    cell_value = sheet.cell(row=row, column=col).value
                    if cell_value is not None:
                        sample_values.append(cell_value)
                
                if sample_values:
                    data_types[col_letter] = self._infer_data_type(sample_values)
            
            data["data_types"] = data_types
        
        return data
    
    def _infer_data_type(self, values: List[Any]) -> str:
        """Infer the data type from a list of values"""
        if not values:
            return "unknown"
        
        # Check if all are numbers
        try:
            numeric_values = [float(v) for v in values if v is not None]
            if len(numeric_values) == len(values):
                return "numeric"
        except (ValueError, TypeError):
            pass
        
        # Check if all are dates
        try:
            from datetime import datetime
            date_values = []
            for v in values:
                if isinstance(v, datetime):
                    date_values.append(v)
                elif isinstance(v, str):
                    # Try to parse as date
                    try:
                        datetime.strptime(v, "%Y-%m-%d")
                        date_values.append(v)
                    except ValueError:
                        pass
            
            if len(date_values) == len(values):
                return "date"
        except:
            pass
        
        return "text"
    
    def validate_formula(self, formula: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Validate and analyze an Excel formula"""
        result = {
            "valid": True,
            "suggestions": [],
            "errors": [],
            "optimizations": []
        }
        
        if not formula.startswith('='):
            result["valid"] = False
            result["errors"].append("Formula must start with '='")
            return result
        
        # Basic syntax validation
        try:
            # Remove the equals sign for analysis
            formula_body = formula[1:]
            
            # Check for common issues
            if formula_body.count('(') != formula_body.count(')'):
                result["errors"].append("Mismatched parentheses")
                result["valid"] = False
            
            # Check for common Excel functions
            excel_functions = [
                'SUM', 'AVERAGE', 'COUNT', 'MAX', 'MIN', 'IF', 'VLOOKUP', 
                'HLOOKUP', 'INDEX', 'MATCH', 'CONCATENATE', 'LEFT', 'RIGHT',
                'MID', 'LEN', 'TRIM', 'UPPER', 'LOWER', 'PROPER'
            ]
            
            used_functions = []
            for func in excel_functions:
                if func in formula_body.upper():
                    used_functions.append(func)
            
            result["functions"] = used_functions
            
            # Suggest optimizations
            if 'SUM' in used_functions and 'AVERAGE' in used_functions:
                result["optimizations"].append("Consider using SUMPRODUCT for better performance")
            
            if formula_body.count('IF') > 2:
                result["optimizations"].append("Consider using IFS or SWITCH for multiple conditions")
                
        except Exception as e:
            result["valid"] = False
            result["errors"].append(f"Formula parsing error: {str(e)}")
        
        return result
    
    def get_cell_value(self, sheet_name: str, cell_ref: str) -> Any:
        """Get the value of a specific cell"""
        if not self.workbook:
            raise ValueError("No workbook loaded")
        
        sheet = self.workbook[sheet_name]
        return sheet[cell_ref].value
    
    def get_range_values(self, sheet_name: str, range_ref: str) -> List[List[Any]]:
        """Get values from a range of cells"""
        if not self.workbook:
            raise ValueError("No workbook loaded")
        
        sheet = self.workbook[sheet_name]
        return [[cell.value for cell in row] for row in sheet[range_ref]] 