#!/bin/bash

# Test AI CRM with Complete Data and Schema
API_BASE="https://svc-01k3sernj1j8j1r22ksd447nzv.01k1227hqx74vf02r8yybjf8zs.lmapp.run"

echo "🚀 AI CRM - Complete Data Testing Script"
echo "========================================"
echo

echo "📊 Creating sample leads with complete schema..."

echo "Creating Lead 1: High-scoring California tech lead..."
LEAD1=$(curl -s -X POST "$API_BASE/api/leads" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sarah Johnson",
    "email": "sarah.johnson@techcorp.com",
    "company": "TechCorp Industries",
    "phone": "+1-555-0123",
    "source": "referral",
    "notes": "CEO referral - urgent Q1 implementation. Budget approved $500K.",
    "industry": "technology",
    "companySize": "large",
    "stage": "qualified",
    "location": "California"
  }')
echo "✅ Created: $(echo $LEAD1 | jq -r '.name // "Error"')"

echo "Creating Lead 2: Medium-scoring Texas energy lead..."
LEAD2=$(curl -s -X POST "$API_BASE/api/leads" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "James Wilson",
    "email": "james.wilson@energycorp.com", 
    "company": "Energy Corp Texas",
    "phone": "+1-214-555-0456",
    "source": "referral",
    "notes": "Legacy infrastructure modernization. Multi-year project potential.",
    "industry": "energy",
    "companySize": "large", 
    "stage": "prospect",
    "location": "Texas"
  }')
echo "✅ Created: $(echo $LEAD2 | jq -r '.name // "Error"')"

echo "Creating Lead 3: High-value healthcare lead..."
LEAD3=$(curl -s -X POST "$API_BASE/api/leads" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Emily Rodriguez",
    "email": "emily@healthtech-innovations.com",
    "company": "HealthTech Innovations", 
    "phone": "+1-555-0789",
    "source": "conference",
    "notes": "AI for patient data analysis. HIPAA compliance required.",
    "industry": "healthcare",
    "companySize": "small",
    "stage": "proposal", 
    "location": "California"
  }')
echo "✅ Created: $(echo $LEAD3 | jq -r '.name // "Error"')"

echo "Creating Lead 4: Financial services lead..."
LEAD4=$(curl -s -X POST "$API_BASE/api/leads" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Robert Kim",
    "email": "robert.kim@bigbank.com",
    "company": "BigBank Financial",
    "phone": "+1-555-0321",
    "source": "cold_call", 
    "notes": "Compliance requirements critical. SOX and GDPR needed.",
    "industry": "financial",
    "companySize": "large",
    "stage": "qualified",
    "location": "New York"
  }')
echo "✅ Created: $(echo $LEAD4 | jq -r '.name // "Error"')"

echo "Creating Lead 5: E-commerce prospect..."
LEAD5=$(curl -s -X POST "$API_BASE/api/leads" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Lisa Thompson", 
    "email": "lisa@shopfast.com",
    "company": "ShopFast E-commerce",
    "phone": "+1-555-0654",
    "source": "google_ads",
    "notes": "Peak season approaching. Needs solution before holidays.",
    "industry": "retail",
    "companySize": "medium", 
    "stage": "prospect",
    "location": "Texas"
  }')
echo "✅ Created: $(echo $LEAD5 | jq -r '.name // "Error"')"

echo
echo "🔍 Testing data retrieval..."
LEADS=$(curl -s -X GET "$API_BASE/api/leads")
LEAD_COUNT=$(echo $LEADS | jq 'length')
echo "Found $LEAD_COUNT leads in database"

if [ "$LEAD_COUNT" -gt "0" ]; then
  echo "Sample lead data:"
  echo $LEADS | jq '.[0:3]'
  
  echo
  echo "🗣️ Testing SmartSQL natural language queries..."
  
  echo "Query 1: Show all leads from California"
  curl -s -X POST "$API_BASE/api/query" \
    -H "Content-Type: application/json" \
    -d '{
      "query": "Show me all leads from California",
      "format": "json"
    }' | jq '.'
    
  echo
  echo "Query 2: Which leads have scores above 80?"
  curl -s -X POST "$API_BASE/api/query" \
    -H "Content-Type: application/json" \
    -d '{
      "query": "Which leads have scores above 80?", 
      "format": "json"
    }' | jq '.'
    
  echo
  echo "Query 3: Show technology industry leads"
  curl -s -X POST "$API_BASE/api/query" \
    -H "Content-Type: application/json" \
    -d '{
      "query": "Show me leads in the technology industry",
      "format": "json"
    }' | jq '.'
    
  echo
  echo "✅ Complete testing finished!"
else
  echo "❌ No leads found - waiting for deployment to complete"
fi