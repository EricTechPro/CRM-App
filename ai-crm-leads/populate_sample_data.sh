#!/bin/bash

# Populate AI CRM with Sample Data
API_BASE="https://svc-01k3sernj1j8j1r22ksd447nzv.01k1227hqx74vf02r8yybjf8zs.lmapp.run"

echo "🚀 Populating AI CRM with Sample Data"
echo "======================================"

# Create sample leads with diverse profiles
echo "Creating Lead 1: Enterprise Tech Company..."
curl -s -X POST "$API_BASE/api/leads" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sarah Johnson", 
    "email": "sarah.johnson@techcorp.com",
    "company": "TechCorp Industries",
    "phone": "+1-555-0123",
    "source": "website",
    "notes": "CEO referral - urgent need for Q1 implementation. Budget approved.",
    "industry": "technology",
    "companySize": "large",
    "stage": "qualified"
  }' && echo " ✅"

echo "Creating Lead 2: Manufacturing Company..."
curl -s -X POST "$API_BASE/api/leads" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mike Chen",
    "email": "m.chen@manufacturing-plus.com", 
    "company": "Manufacturing Plus LLC",
    "phone": "+1-555-0456",
    "source": "referral",
    "notes": "Looking to modernize legacy systems. Timeline flexible.",
    "industry": "manufacturing",
    "companySize": "medium",
    "stage": "prospect"
  }' && echo " ✅"

echo "Creating Lead 3: Healthcare Startup..."
curl -s -X POST "$API_BASE/api/leads" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Emily Rodriguez",
    "email": "emily@healthtech-innovations.com",
    "company": "HealthTech Innovations",
    "phone": "+1-555-0789", 
    "source": "conference",
    "notes": "Met at HealthTech conference. Interested in AI capabilities for patient data.",
    "industry": "healthcare",
    "companySize": "small",
    "stage": "proposal"
  }' && echo " ✅"

echo "Creating Lead 4: Financial Services..."
curl -s -X POST "$API_BASE/api/leads" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Robert Kim",
    "email": "robert.kim@bigbank.com",
    "company": "BigBank Financial",
    "phone": "+1-555-0321",
    "source": "cold_call", 
    "notes": "Compliance requirements are critical. Security audit needed.",
    "industry": "financial",
    "companySize": "large",
    "stage": "qualified"
  }' && echo " ✅"

echo "Creating Lead 5: E-commerce Company..."
curl -s -X POST "$API_BASE/api/leads" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Lisa Thompson",
    "email": "lisa@shopfast.com",
    "company": "ShopFast E-commerce",
    "phone": "+1-555-0654",
    "source": "google_ads",
    "notes": "Peak season approaching - needs solution before holidays.",
    "industry": "retail",
    "companySize": "medium", 
    "stage": "prospect"
  }' && echo " ✅"

echo "Creating Lead 6: California Tech Startup..."
curl -s -X POST "$API_BASE/api/leads" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alex Martinez",
    "email": "alex@ai-startup.com",
    "company": "AI Startup Labs",
    "phone": "+1-415-555-0987",
    "source": "website",
    "notes": "Early stage startup, limited budget but high growth potential.", 
    "industry": "technology",
    "companySize": "small",
    "stage": "prospect",
    "location": "California"
  }' && echo " ✅"

echo "Creating Lead 7: Texas Oil & Gas..."
curl -s -X POST "$API_BASE/api/leads" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "James Wilson",
    "email": "james.wilson@energycorp.com",
    "company": "Energy Corp Texas", 
    "phone": "+1-214-555-0456",
    "source": "referral",
    "notes": "Legacy infrastructure modernization project. Multi-year engagement.",
    "industry": "energy",
    "companySize": "large",
    "stage": "qualified",
    "location": "Texas"
  }' && echo " ✅"

echo "Creating Lead 8: New York Finance..."
curl -s -X POST "$API_BASE/api/leads" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maria Gonzalez",
    "email": "maria.gonzalez@wallstreetfirm.com",
    "company": "Wall Street Investment Firm",
    "phone": "+1-212-555-0789", 
    "source": "conference",
    "notes": "Regulatory compliance focus. Needs SOX and GDPR compliance.",
    "industry": "financial",
    "companySize": "large",
    "stage": "proposal",
    "location": "New York"
  }' && echo " ✅"

echo
echo "🎯 Sample Data Creation Complete!"
echo "Created 8 diverse leads across industries, company sizes, and stages"
echo
echo "Now testing SmartSQL queries with real data..."
echo

# Test natural language queries with actual data
echo "🗣️ Testing: 'Show me all leads from technology companies'"
curl -s -X POST "$API_BASE/api/query" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Show me all leads from technology companies",
    "format": "json"
  }' | jq '.'

echo
echo "🗣️ Testing: 'Which leads have the highest scores?'"  
curl -s -X POST "$API_BASE/api/query" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Which leads have the highest scores?",
    "format": "json"
  }' | jq '.'

echo  
echo "🗣️ Testing: 'Find leads from California or Texas'"
curl -s -X POST "$API_BASE/api/query" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Find leads from California or Texas", 
    "format": "json"
  }' | jq '.'

echo
echo "✅ Sample Data Population Complete!"