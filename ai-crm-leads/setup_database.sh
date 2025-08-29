#!/bin/bash

# Setup Database Schema and Metadata for AI CRM
API_BASE="https://svc-01k3sernj1j8j1r22ksd447nzv.01k1227hqx74vf02r8yybjf8zs.lmapp.run"

echo "🔧 Setting up Database Schema for AI CRM"
echo "========================================"

# First, let's create the database tables using direct SQL
echo "Creating leads table..."
curl -s -X POST "$API_BASE/api/query" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "CREATE TABLE IF NOT EXISTS leads (id TEXT PRIMARY KEY, name TEXT, email TEXT, company TEXT, phone TEXT, source TEXT, notes TEXT, industry TEXT, company_size TEXT, stage TEXT, location TEXT, score INTEGER, created_at DATETIME, updated_at DATETIME)",
    "useDirectSQL": true
  }' && echo " ✅"

echo "Creating companies table..."
curl -s -X POST "$API_BASE/api/query" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "CREATE TABLE IF NOT EXISTS companies (id TEXT PRIMARY KEY, name TEXT, industry TEXT, size TEXT, website TEXT, ai_research_data TEXT)",
    "useDirectSQL": true  
  }' && echo " ✅"

echo "Creating interactions table..."
curl -s -X POST "$API_BASE/api/query" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "CREATE TABLE IF NOT EXISTS interactions (id TEXT PRIMARY KEY, lead_id TEXT, type TEXT, content TEXT, sentiment TEXT, ai_insights TEXT, ai_coaching_notes TEXT, timestamp DATETIME)",
    "useDirectSQL": true
  }' && echo " ✅"

echo "Creating deals table..."
curl -s -X POST "$API_BASE/api/query" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "CREATE TABLE IF NOT EXISTS deals (id TEXT PRIMARY KEY, lead_id TEXT, value REAL, stage TEXT, conversion_probability REAL, documents TEXT, timeline TEXT)",
    "useDirectSQL": true
  }' && echo " ✅"

echo
echo "✅ Database schema setup complete!"
echo

echo "🗂️ Now populating with sample data using direct SQL..."

# Insert sample leads directly
echo "Inserting sample leads..."
curl -s -X POST "$API_BASE/api/query" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "INSERT INTO leads (id, name, email, company, phone, source, notes, industry, company_size, stage, location, score, created_at, updated_at) VALUES ('"'"'lead1'"'"', '"'"'Sarah Johnson'"'"', '"'"'sarah.johnson@techcorp.com'"'"', '"'"'TechCorp Industries'"'"', '"'"'+1-555-0123'"'"', '"'"'website'"'"', '"'"'CEO referral - urgent Q1 implementation'"'"', '"'"'technology'"'"', '"'"'large'"'"', '"'"'qualified'"'"', '"'"'California'"'"', 85, datetime('"'"'now'"'"'), datetime('"'"'now'"'"'))",
    "useDirectSQL": true
  }' && echo " ✅"

curl -s -X POST "$API_BASE/api/query" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "INSERT INTO leads (id, name, email, company, phone, source, notes, industry, company_size, stage, location, score, created_at, updated_at) VALUES ('"'"'lead2'"'"', '"'"'Mike Chen'"'"', '"'"'m.chen@manufacturing-plus.com'"'"', '"'"'Manufacturing Plus LLC'"'"', '"'"'+1-555-0456'"'"', '"'"'referral'"'"', '"'"'Legacy systems modernization'"'"', '"'"'manufacturing'"'"', '"'"'medium'"'"', '"'"'prospect'"'"', '"'"'Texas'"'"', 65, datetime('"'"'now'"'"'), datetime('"'"'now'"'"'))",
    "useDirectSQL": true
  }' && echo " ✅"

curl -s -X POST "$API_BASE/api/query" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "INSERT INTO leads (id, name, email, company, phone, source, notes, industry, company_size, stage, location, score, created_at, updated_at) VALUES ('"'"'lead3'"'"', '"'"'Dr. Emily Rodriguez'"'"', '"'"'emily@healthtech-innovations.com'"'"', '"'"'HealthTech Innovations'"'"', '"'"'+1-555-0789'"'"', '"'"'conference'"'"', '"'"'AI for patient data'"'"', '"'"'healthcare'"'"', '"'"'small'"'"', '"'"'proposal'"'"', '"'"'California'"'"', 92, datetime('"'"'now'"'"'), datetime('"'"'now'"'"'))",
    "useDirectSQL": true
  }' && echo " ✅"

curl -s -X POST "$API_BASE/api/query" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "INSERT INTO leads (id, name, email, company, phone, source, notes, industry, company_size, stage, location, score, created_at, updated_at) VALUES ('"'"'lead4'"'"', '"'"'Robert Kim'"'"', '"'"'robert.kim@bigbank.com'"'"', '"'"'BigBank Financial'"'"', '"'"'+1-555-0321'"'"', '"'"'cold_call'"'"', '"'"'Compliance requirements critical'"'"', '"'"'financial'"'"', '"'"'large'"'"', '"'"'qualified'"'"', '"'"'New York'"'"', 78, datetime('"'"'now'"'"'), datetime('"'"'now'"'"'))",
    "useDirectSQL": true
  }' && echo " ✅"

curl -s -X POST "$API_BASE/api/query" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "INSERT INTO leads (id, name, email, company, phone, source, notes, industry, company_size, stage, location, score, created_at, updated_at) VALUES ('"'"'lead5'"'"', '"'"'Lisa Thompson'"'"', '"'"'lisa@shopfast.com'"'"', '"'"'ShopFast E-commerce'"'"', '"'"'+1-555-0654'"'"', '"'"'google_ads'"'"', '"'"'Needs solution before holidays'"'"', '"'"'retail'"'"', '"'"'medium'"'"', '"'"'prospect'"'"', '"'"'Texas'"'"', 55, datetime('"'"'now'"'"'), datetime('"'"'now'"'"'))",
    "useDirectSQL": true  
  }' && echo " ✅"

echo
echo "📊 Testing data retrieval..."
curl -s -X POST "$API_BASE/api/query" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "SELECT COUNT(*) as total_leads FROM leads",
    "useDirectSQL": true
  }' | jq '.'

echo
echo "✅ Database setup and population complete!"