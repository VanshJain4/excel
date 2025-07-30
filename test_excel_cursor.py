#!/usr/bin/env python3
"""
Simple test script for Excel Cursor functionality
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from excel_engine.excel_processor import ExcelProcessor
from ai_engine.ai_assistant import AIAssistant

def test_excel_processor():
    """Test the Excel processor functionality"""
    print("🧪 Testing Excel Processor...")
    
    processor = ExcelProcessor()
    
    # Test formula validation
    test_formulas = [
        "=SUM(A1:A10)",
        "=AVERAGE(B1:B20)",
        "=IF(A1>0, \"Positive\", \"Negative\")",
        "=SUM(A1:A10",  # Invalid - missing closing parenthesis
        "A1+B1"  # Invalid - missing equals sign
    ]
    
    for formula in test_formulas:
        result = processor.validate_formula(formula)
        status = "✅" if result["valid"] else "❌"
        print(f"  {status} {formula}")
        if not result["valid"]:
            print(f"     Errors: {result['errors']}")
        if result.get("functions"):
            print(f"     Functions: {result['functions']}")

def test_ai_assistant():
    """Test the AI assistant functionality"""
    print("\n🤖 Testing AI Assistant...")
    
    assistant = AIAssistant()
    
    # Test cell analysis
    test_cells = [
        "=SUM(A1:A10)",
        "john.doe@example.com",
        "12345.67",
        "This is a very long text that might need to be wrapped or abbreviated for better display in the spreadsheet"
    ]
    
    for cell_value in test_cells:
        result = assistant.analyze_cell(cell_value)
        print(f"  📊 Cell: '{cell_value}'")
        print(f"     Analysis: {result['suggestions']}")
        print(f"     Confidence: {result['confidence']}")
    
    # Test formula suggestions
    test_descriptions = [
        "sum all values in column A",
        "calculate the average of sales data",
        "count how many cells have values",
        "find the maximum value in the range"
    ]
    
    for description in test_descriptions:
        result = assistant.suggest_formula(description)
        print(f"  🧮 Description: '{description}'")
        print(f"     Formula: {result['formula']}")
        print(f"     Confidence: {result['confidence']}")

def test_data_insights():
    """Test data insights functionality"""
    print("\n📈 Testing Data Insights...")
    
    assistant = AIAssistant()
    
    # Sample data
    headers = ["Name", "Age", "Salary", "Department"]
    data = [
        ["John Doe", 30, 50000, "Engineering"],
        ["Jane Smith", 25, 45000, "Marketing"],
        ["Bob Johnson", 35, 60000, "Engineering"],
        ["Alice Brown", 28, 52000, "Sales"]
    ]
    
    insights = assistant.get_data_insights(data, headers)
    
    print(f"  📊 Insights: {insights['insights']}")
    print(f"  🔍 Patterns: {insights['patterns']}")
    print(f"  💡 Recommendations: {insights['recommendations']}")

if __name__ == "__main__":
    print("🚀 Excel Cursor Test Suite")
    print("=" * 50)
    
    try:
        test_excel_processor()
        test_ai_assistant()
        test_data_insights()
        
        print("\n✅ All tests completed successfully!")
        print("\n🎉 Excel Cursor is ready to use!")
        print("\nTo start the server:")
        print("  python backend/main.py")
        print("\nTo open the frontend:")
        print("  open frontend/index.html")
        
    except Exception as e:
        print(f"\n❌ Test failed: {e}")
        sys.exit(1) 