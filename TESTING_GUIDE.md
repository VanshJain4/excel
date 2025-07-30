# Excel Cursor - Testing Guide

## 🚀 Quick Start Testing

### 1. **Start the Server**
```bash
cd backend && python3 main.py
```

### 2. **Open the Web Interface**
```bash
open frontend/index.html
```

### 3. **Test with Sample Data**
```bash
python3 create_test_excel.py  # Creates test_data.xlsx
```

## 🧪 **API Testing**

### **Health Check**
```bash
curl http://localhost:8000/health
```
**Expected Response:**
```json
{"status":"healthy","services":{"excel":"ready","ai":"ready"}}
```

### **Upload Excel File**
```bash
curl -X POST -F "file=@test_data.xlsx" http://localhost:8000/upload-excel
```
**Expected Response:**
```json
{
  "message": "File uploaded successfully",
  "filename": "test_data.xlsx",
  "data": {
    "filename": "test_data.xlsx",
    "sheets": ["Sales Data", "Employee Data"],
    "active_sheet": "Sales Data",
    "data": {
      "title": "Sales Data",
      "dimensions": "25x6",
      "used_range": "A1:F25",
      "data_types": {"A": "date", "B": "text", "C": "numeric", "D": "numeric", "E": "text"},
      "formulas": [],
      "headers": ["Date", "Product", "Sales", "Revenue", "Region", "Salesperson"]
    },
    "status": "success"
  }
}
```

### **Formula Suggestions**
```bash
curl -X POST http://localhost:8000/suggest-formula \
  -H "Content-Type: application/json" \
  -d '{"description": "sum all revenue", "context": {}}'
```
**Expected Response:**
```json
{
  "formula": {
    "formula": "=SUM(A:A)",
    "description": "sum all revenue",
    "confidence": 0.5,
    "type": "mock_suggestion"
  },
  "description": "sum all revenue"
}
```

### **Cell Analysis**
```bash
curl -X POST http://localhost:8000/analyze-cell \
  -H "Content-Type: application/json" \
  -d '{"cell_value": "=SUM(D2:D21)", "context": {}}'
```
**Expected Response:**
```json
{
  "suggestions": {
    "suggestions": "This appears to be a formula. Consider validating syntax.",
    "confidence": 0.6,
    "type": "mock_analysis"
  },
  "cell_value": "=SUM(D2:D21)"
}
```

### **Formula Validation**
```bash
curl -X POST http://localhost:8000/validate-formula \
  -H "Content-Type: application/json" \
  -d '{"formula": "=SUM(A1:A10)", "context": {}}'
```
**Expected Response:**
```json
{
  "valid": true,
  "suggestions": [],
  "errors": [],
  "optimizations": [],
  "functions": ["SUM"]
}
```

## 🎯 **Web Interface Testing**

### **1. File Upload Test**
1. Open `frontend/index.html` in your browser
2. Click "Choose an Excel file" or drag `test_data.xlsx`
3. Click "Upload and Analyze"
4. Verify you see success message with file details

### **2. Formula Suggestion Test**
1. In the "AI Assistant" section
2. Enter: "calculate total sales"
3. Click "Get Formula"
4. Verify you get a suggested formula

### **3. Cell Analysis Test**
1. In the "Analyze a cell value" section
2. Enter: "john.doe@example.com"
3. Click "Analyze"
4. Verify you get analysis suggestions

## 📊 **Test Data Structure**

The `test_data.xlsx` file contains:

### **Sales Data Sheet**
- **Headers**: Date, Product, Sales, Revenue, Region, Salesperson
- **Data**: 20 rows of sample sales data
- **Formulas**: SUM, AVERAGE, MAX functions
- **Data Types**: Dates, text, numbers

### **Employee Data Sheet**
- **Headers**: Name, Age, Salary, Department, Start Date, Performance Score
- **Data**: 8 employee records
- **Formulas**: AVERAGE, COUNT, COUNTIF functions

## 🔧 **Debugging**

### **Check Server Status**
```bash
curl http://localhost:8000/health
```

### **Debug Excel Processing**
```bash
curl http://localhost:8000/debug-excel
```

### **Run Unit Tests**
```bash
python3 test_excel_cursor.py
```

### **Create Fresh Test Data**
```bash
python3 create_test_excel.py
```

## 🚨 **Common Issues**

### **Server Won't Start**
- Check if port 8000 is in use: `lsof -i :8000`
- Kill existing processes: `pkill -f "python3 main.py"`

### **Import Errors**
- Clear Python cache: `find . -name "*.pyc" -delete`
- Restart server after code changes

### **File Upload Fails**
- Check file permissions
- Ensure file is valid Excel format (.xlsx, .xls)
- Check uploads directory exists

### **AI Responses are Mock**
- Set `OPENAI_API_KEY` environment variable for real AI responses
- Mock responses work for testing without API key

## 📈 **Performance Testing**

### **Large File Test**
1. Create a large Excel file (1000+ rows)
2. Test upload and processing time
3. Monitor memory usage

### **Concurrent Requests**
```bash
# Test multiple simultaneous uploads
for i in {1..5}; do
  curl -X POST -F "file=@test_data.xlsx" http://localhost:8000/upload-excel &
done
wait
```

## 🎉 **Success Criteria**

✅ **Basic Functionality**
- Server starts without errors
- Health endpoint responds
- File upload works
- Excel analysis returns data

✅ **AI Features**
- Formula suggestions work (mock or real)
- Cell analysis provides insights
- Formula validation catches errors

✅ **Web Interface**
- Frontend loads without errors
- File upload UI works
- API status shows connected
- All buttons respond

✅ **Data Processing**
- Excel files are parsed correctly
- Headers are extracted
- Data types are inferred
- Formulas are detected

## 🔮 **Next Steps for Enhancement**

1. **Add Real AI Integration**
   - Set up OpenAI API key
   - Test with real AI responses
   - Improve prompt engineering

2. **Enhanced Testing**
   - Add automated test suite
   - Performance benchmarking
   - Error handling tests

3. **Feature Expansion**
   - Real-time Excel monitoring
   - Advanced formula suggestions
   - Data visualization recommendations 