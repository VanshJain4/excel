import os
from typing import Dict, Any, List, Optional
import json
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

class AIAssistant:
    """AI assistant for Excel Cursor - provides intelligent suggestions and analysis"""
    
    def __init__(self):
        self.client = None
        self.api_key = os.getenv("OPENAI_API_KEY")
        
        if self.api_key:
            self.client = OpenAI(api_key=self.api_key)
        else:
            print("Warning: OPENAI_API_KEY not found. Using mock responses.")
    
    def analyze_cell(self, cell_value: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Analyze a cell value and provide suggestions"""
        if not self.client:
            return self._mock_analyze_cell(cell_value, context)
        
        try:
            prompt = self._build_cell_analysis_prompt(cell_value, context)
            
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are an Excel expert assistant. Provide helpful suggestions for Excel cells and formulas."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=300,
                temperature=0.3
            )
            
            suggestions = response.choices[0].message.content
            return {
                "suggestions": suggestions,
                "confidence": 0.8,
                "type": "ai_analysis"
            }
            
        except Exception as e:
            return {
                "suggestions": f"Error analyzing cell: {str(e)}",
                "confidence": 0.0,
                "type": "error"
            }
    
    def suggest_formula(self, description: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Suggest Excel formulas based on natural language description"""
        if not self.client:
            return self._mock_suggest_formula(description, context)
        
        try:
            prompt = self._build_formula_suggestion_prompt(description, context)
            
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are an Excel formula expert. Provide accurate Excel formulas based on descriptions."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=200,
                temperature=0.2
            )
            
            formula = response.choices[0].message.content.strip()
            
            return {
                "formula": formula,
                "description": description,
                "confidence": 0.9,
                "type": "formula_suggestion"
            }
            
        except Exception as e:
            return {
                "formula": f"Error: {str(e)}",
                "description": description,
                "confidence": 0.0,
                "type": "error"
            }
    
    def _build_cell_analysis_prompt(self, cell_value: str, context: Dict[str, Any] = None) -> str:
        """Build a prompt for cell analysis"""
        prompt = f"Analyze this Excel cell value: '{cell_value}'\n\n"
        
        if context:
            if "headers" in context:
                prompt += f"Column headers: {context['headers']}\n"
            if "data_types" in context:
                prompt += f"Data types: {context['data_types']}\n"
            if "surrounding_cells" in context:
                prompt += f"Surrounding context: {context['surrounding_cells']}\n"
        
        prompt += "\nProvide suggestions for:\n1. Data validation\n2. Formula improvements\n3. Formatting suggestions\n4. Potential errors\n\nKeep suggestions concise and practical."
        
        return prompt
    
    def _build_formula_suggestion_prompt(self, description: str, context: Dict[str, Any] = None) -> str:
        """Build a prompt for formula suggestions"""
        prompt = f"Create an Excel formula for: '{description}'\n\n"
        
        if context:
            if "headers" in context:
                prompt += f"Available columns: {context['headers']}\n"
            if "data_range" in context:
                prompt += f"Data range: {context['data_range']}\n"
        
        prompt += "\nProvide only the Excel formula (starting with =) without explanation."
        
        return prompt
    
    def _mock_analyze_cell(self, cell_value: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Mock cell analysis when AI is not available"""
        suggestions = []
        
        # Basic analysis based on cell value
        if cell_value.startswith('='):
            suggestions.append("This appears to be a formula. Consider validating syntax.")
        elif cell_value.replace('.', '').replace('-', '').isdigit():
            suggestions.append("Numeric value detected. Consider formatting as currency or percentage if appropriate.")
        elif '@' in cell_value and '.' in cell_value:
            suggestions.append("Email address detected. Consider data validation for email format.")
        elif len(cell_value) > 50:
            suggestions.append("Long text detected. Consider using text wrapping or abbreviating.")
        
        return {
            "suggestions": "; ".join(suggestions) if suggestions else "No specific suggestions",
            "confidence": 0.6,
            "type": "mock_analysis"
        }
    
    def _mock_suggest_formula(self, description: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """Mock formula suggestions when AI is not available"""
        # Simple keyword-based formula suggestions
        description_lower = description.lower()
        
        if "sum" in description_lower:
            formula = "=SUM(A:A)"
        elif "average" in description_lower:
            formula = "=AVERAGE(A:A)"
        elif "count" in description_lower:
            formula = "=COUNT(A:A)"
        elif "max" in description_lower:
            formula = "=MAX(A:A)"
        elif "min" in description_lower:
            formula = "=MIN(A:A)"
        elif "if" in description_lower:
            formula = "=IF(A1>0, \"Positive\", \"Negative\")"
        elif "lookup" in description_lower:
            formula = "=VLOOKUP(A1, B:C, 2, FALSE)"
        else:
            formula = "=A1"  # Default fallback
        
        return {
            "formula": formula,
            "description": description,
            "confidence": 0.5,
            "type": "mock_suggestion"
        }
    
    def get_data_insights(self, data: List[List[Any]], headers: List[str] = None) -> Dict[str, Any]:
        """Analyze data and provide insights"""
        if not data:
            return {"insights": [], "patterns": [], "recommendations": []}
        
        insights = []
        patterns = []
        recommendations = []
        
        # Basic data analysis
        if headers:
            insights.append(f"Dataset has {len(headers)} columns: {', '.join(headers)}")
        
        insights.append(f"Dataset has {len(data)} rows of data")
        
        # Detect patterns
        if len(data) > 1:
            # Check for numeric columns
            numeric_cols = []
            for col_idx in range(len(data[0])):
                try:
                    numeric_values = [float(row[col_idx]) for row in data if row[col_idx] is not None]
                    if len(numeric_values) > len(data) * 0.5:  # More than 50% numeric
                        numeric_cols.append(col_idx)
                except (ValueError, TypeError):
                    continue
            
            if numeric_cols:
                patterns.append(f"Found {len(numeric_cols)} numeric columns")
                recommendations.append("Consider adding charts or pivot tables for numeric data")
        
        return {
            "insights": insights,
            "patterns": patterns,
            "recommendations": recommendations
        } 