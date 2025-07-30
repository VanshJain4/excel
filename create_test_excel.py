#!/usr/bin/env python3
"""
Create a test Excel file for Excel Cursor testing
"""

import openpyxl
from openpyxl.styles import Font, PatternFill
from datetime import datetime, timedelta
import random

def create_test_excel():
    """Create a comprehensive test Excel file"""
    
    # Create workbook
    wb = openpyxl.Workbook()
    
    # Sales Data Sheet
    ws1 = wb.active
    ws1.title = "Sales Data"
    
    # Headers
    headers = ["Date", "Product", "Sales", "Revenue", "Region", "Salesperson"]
    for col, header in enumerate(headers, 1):
        cell = ws1.cell(row=1, column=col, value=header)
        cell.font = Font(bold=True)
        cell.fill = PatternFill(start_color="CCCCCC", end_color="CCCCCC", fill_type="solid")
    
    # Sample data
    products = ["Laptop", "Phone", "Tablet", "Monitor", "Keyboard"]
    regions = ["North", "South", "East", "West"]
    salespeople = ["John Doe", "Jane Smith", "Bob Johnson", "Alice Brown"]
    
    for row in range(2, 22):  # 20 rows of data
        # Date
        date = datetime.now() - timedelta(days=random.randint(0, 30))
        ws1.cell(row=row, column=1, value=date.strftime("%Y-%m-%d"))
        
        # Product
        ws1.cell(row=row, column=2, value=random.choice(products))
        
        # Sales (quantity)
        ws1.cell(row=row, column=3, value=random.randint(1, 50))
        
        # Revenue (price)
        revenue = random.randint(100, 2000)
        ws1.cell(row=row, column=4, value=revenue)
        
        # Region
        ws1.cell(row=row, column=5, value=random.choice(regions))
        
        # Salesperson
        ws1.cell(row=row, column=6, value=random.choice(salespeople))
    
    # Add some formulas
    ws1.cell(row=23, column=1, value="Total Sales:")
    ws1.cell(row=23, column=3, value="=SUM(C2:C21)")
    ws1.cell(row=23, column=4, value="=SUM(D2:D21)")
    
    ws1.cell(row=24, column=1, value="Average Revenue:")
    ws1.cell(row=24, column=4, value="=AVERAGE(D2:D21)")
    
    ws1.cell(row=25, column=1, value="Max Revenue:")
    ws1.cell(row=25, column=4, value="=MAX(D2:D21)")
    
    # Employee Data Sheet
    ws2 = wb.create_sheet("Employee Data")
    
    # Headers
    emp_headers = ["Name", "Age", "Salary", "Department", "Start Date", "Performance Score"]
    for col, header in enumerate(emp_headers, 1):
        cell = ws2.cell(row=1, column=col, value=header)
        cell.font = Font(bold=True)
        cell.fill = PatternFill(start_color="CCCCCC", end_color="CCCCCC", fill_type="solid")
    
    # Employee data
    employees = [
        ["John Doe", 30, 50000, "Engineering", "2020-01-15", 85],
        ["Jane Smith", 25, 45000, "Marketing", "2021-03-20", 92],
        ["Bob Johnson", 35, 60000, "Engineering", "2019-11-10", 78],
        ["Alice Brown", 28, 52000, "Sales", "2020-06-05", 88],
        ["Charlie Wilson", 32, 55000, "Engineering", "2021-01-30", 91],
        ["Diana Davis", 27, 48000, "Marketing", "2021-08-15", 87],
        ["Eve Miller", 29, 51000, "Sales", "2020-09-12", 83],
        ["Frank Garcia", 31, 54000, "Engineering", "2020-04-18", 89]
    ]
    
    for row, employee in enumerate(employees, 2):
        for col, value in enumerate(employee, 1):
            ws2.cell(row=row, column=col, value=value)
    
    # Add formulas
    ws2.cell(row=11, column=1, value="Average Salary:")
    ws2.cell(row=11, column=3, value="=AVERAGE(C2:C9)")
    
    ws2.cell(row=12, column=1, value="Total Employees:")
    ws2.cell(row=12, column=2, value="=COUNT(A2:A9)")
    
    ws2.cell(row=13, column=1, value="High Performers (>85):")
    ws2.cell(row=13, column=2, value="=COUNTIF(F2:F9,\">85\")")
    
    # Save the file
    filename = "test_data.xlsx"
    wb.save(filename)
    print(f"✅ Created test Excel file: {filename}")
    print(f"📊 Contains:")
    print(f"   - Sales Data sheet with 20 rows + formulas")
    print(f"   - Employee Data sheet with 8 rows + formulas")
    print(f"   - Various data types: dates, text, numbers")
    print(f"   - Excel formulas: SUM, AVERAGE, COUNT, COUNTIF, MAX")
    
    return filename

if __name__ == "__main__":
    create_test_excel() 