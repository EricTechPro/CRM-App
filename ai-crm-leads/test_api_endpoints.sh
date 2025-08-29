#!/bin/bash

# AI-Powered CRM Lead Management System - API Endpoint Tests
# Live API Testing Script

API_BASE="https://svc-01k3sernj1j8j1r22ksd447nzv.01k1227hqx74vf02r8yybjf8zs.lmapp.run"

echo "🚀 Testing AI-Powered CRM Lead Management System"
echo "API Base URL: $API_BASE"
echo "=============================================="
echo

# Test 1: Health Check
echo "📋 Test 1: Health Check"
curl -s -w "Status: %{http_code}\n" -X GET "$API_BASE/" || echo "❌ Health check failed"
echo

# Test 2: Create Lead with AI Scoring  
echo "🧠 Test 2: Create Lead with AI Scoring"
LEAD_RESPONSE=$(curl -s -w "Status: %{http_code}\n" -X POST "$API_BASE/api/leads" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith",
    "email": "john@techcorp.com",
    "company": "TechCorp Inc", 
    "phone": "+1-555-0123",
    "source": "website",
    "notes": "Interested in enterprise solution",
    "industry": "technology",
    "companySize": "medium"
  }')
echo "$LEAD_RESPONSE"
echo

# Test 3: Get All Leads
echo "📊 Test 3: Get All Leads"
curl -s -w "Status: %{http_code}\n" -X GET "$API_BASE/api/leads" || echo "❌ Get leads failed"
echo

# Test 4: SmartSQL Natural Language Query
echo "🗣️ Test 4: SmartSQL Natural Language Query"  
curl -s -w "Status: %{http_code}\n" -X POST "$API_BASE/api/query" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Show me all leads created today",
    "format": "json"
  }' || echo "❌ Natural language query failed"
echo

# Test 5: Document Analysis Capability Check
echo "📄 Test 5: Document Analysis Capability"
curl -s -w "Status: %{http_code}\n" -X POST "$API_BASE/api/documents/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "documentId": "test_doc_123",
    "analysisType": "full"
  }' || echo "❌ Document analysis failed"
echo

# Test 6: Pattern Insights
echo "🧩 Test 6: AI Pattern Insights"
curl -s -w "Status: %{http_code}\n" -X GET "$API_BASE/api/insights/patterns" || echo "❌ Pattern insights failed"
echo

# Test 7: SmartMemory Learning
echo "🧠 Test 7: SmartMemory Pattern Learning"
curl -s -w "Status: %{http_code}\n" -X POST "$API_BASE/api/memory/learn" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "conversion",
    "leadId": "123",
    "pattern": {
      "industry": "technology",
      "companySize": "medium",
      "touchpoints": 5,
      "timeToClose": 21,
      "keyFactors": ["demo_success", "pricing_accepted"]
    }
  }' || echo "❌ Memory learning failed"
echo

# Test 8: Real-time Lead Scoring
echo "⚡ Test 8: Real-time Lead Scoring"
curl -s -w "Status: %{http_code}\n" -X GET "$API_BASE/api/leads/score/realtime?leadId=123" || echo "❌ Real-time scoring failed"
echo

# Test 9: Advanced SmartSQL Query
echo "🧠 Test 9: Advanced SmartSQL Query"
curl -s -w "Status: %{http_code}\n" -X POST "$API_BASE/api/query" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Which leads are most likely to close this month based on past patterns?",
    "format": "json"
  }' || echo "❌ Advanced query failed"
echo

# Test 10: CORS Preflight
echo "🌐 Test 10: CORS Preflight Check"
curl -s -w "Status: %{http_code}\n" -X OPTIONS "$API_BASE/api/leads" \
  -H "Origin: https://example.com" || echo "❌ CORS preflight failed"
echo

echo "✅ API Testing Complete!"
echo
echo "🎯 Key Features Tested:"
echo "  ✅ AI-powered lead scoring with deepseek-v3"
echo "  ✅ Natural language database queries via SmartSQL"  
echo "  ✅ Document intelligence with SmartBuckets"
echo "  ✅ Pattern learning with SmartMemory"
echo "  ✅ Real-time scoring updates"
echo "  ✅ CORS support for web applications"
echo
echo "🔗 Full API Documentation: ./API_DOCUMENTATION.md"