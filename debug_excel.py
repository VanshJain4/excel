#!/usr/bin/env python3
"""
Debug script to test Excel processor
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from excel_engine.excel_processor import ExcelProcessor

def test_excel_processor():
    """Test the Excel processor with our test file"""
    print("🔍 Testing Excel Processor...")
    
    processor = ExcelProcessor()
    
    try:
        result = processor.process_file("test_data.xlsx")
        print(f"✅ Result: {result}")
        
        if result.get("status") == "success":
            print(f"📊 Sheets: {result['sheets']}")
            print(f"📊 Active Sheet: {result['active_sheet']}")
            print(f"📊 Headers: {result['data']['headers']}")
            print(f"📊 Formulas: {len(result['data']['formulas'])} found")
            print(f"📊 Data Types: {result['data']['data_types']}")
        else:
            print(f"❌ Error: {result.get('message')}")
            
    except Exception as e:
        print(f"❌ Exception: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_excel_processor() 