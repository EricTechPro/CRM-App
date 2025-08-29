#!/bin/bash

# Initialize SmartSQL Database with Schema and Metadata
API_BASE="https://svc-01k3sernj1j8j1r22ksd447nzv.01k1227hqx74vf02r8yybjf8zs.lmapp.run"

echo "🔧 Initializing SmartSQL Database Schema"
echo "========================================"

# The issue is that we need to use the SmartSQL MCP tools directly to set up metadata
# Since we can't access those from curl, let me create some sample leads first
# and then the database will auto-create the schema

echo "📊 Creating sample leads to auto-generate schema..."

# Create diverse sample leads
echo "Creating Lead 1: High-scoring California tech lead..."
LEAD1=$(curl -s -X POST "$API_BASE/api/leads" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sarah Johnson",
    "email": "sarah.johnson@techcorp.com",
    "company": "TechCorp Industries", 
    "phone": "+1-555-0123",
    "source": "website",
    "notes": "CEO referral - urgent Q1 implementation. Budget approved $500K.",
    "industry": "technology",
    "companySize": "large",
    "stage": "qualified",
    "location": "California"
  }')
echo "✅ $LEAD1"

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
    "stage": "qualified",
    "location": "Texas"
  }')
echo "✅ $LEAD2"

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
echo "✅ $LEAD3"

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
echo "✅ $LEAD4"

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
echo "✅ $LEAD5"

echo
echo "🔍 Testing data retrieval..."
curl -s -X GET "$API_BASE/api/leads" | jq '.'

echo
echo "🗣️ Now testing SmartSQL with actual data..."

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
echo "✅ Database initialization complete!"
echo "📊 Sample data created and SmartSQL queries tested!"