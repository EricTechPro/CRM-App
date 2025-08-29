# 🎯 AI CRM - WORKING API DEMO

## ✅ **IMMEDIATE DEMO COMMANDS** (All Working)

### **1. View Sample Data** 
```bash
curl -X GET "https://svc-01k3sernj1j8j1r22ksd447nzv.01k1227hqx74vf02r8yybjf8zs.lmapp.run/api/leads"
```
**Returns**: 3 pre-loaded sample leads with scores

### **2. Create New Lead with AI Scoring**
```bash
curl -X POST https://svc-01k3sernj1j8j1r22ksd447nzv.01k1227hqx74vf02r8yybjf8zs.lmapp.run/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Michael Chen",
    "email": "michael@startup.com", 
    "company": "AI Startup Inc",
    "industry": "technology",
    "companySize": "small",
    "stage": "qualified", 
    "location": "California",
    "notes": "AI/ML project - immediate need"
  }'
```

### **3. Filter by Stage**
```bash
curl -X GET "https://svc-01k3sernj1j8j1r22ksd447nzv.01k1227hqx74vf02r8yybjf8zs.lmapp.run/api/leads?status=qualified"
```

### **4. AI Pattern Learning**
```bash
curl -X POST https://svc-01k3sernj1j8j1r22ksd447nzv.01k1227hqx74vf02r8yybjf8zs.lmapp.run/api/memory/learn \
  -H "Content-Type: application/json" \
  -d '{
    "pattern_type": "conversion",
    "pattern_data": {
      "industry": "technology", 
      "urgency": "high",
      "budget": "approved",
      "score": 85
    }
  }'
```

### **5. Get AI Insights**
```bash
curl -X GET https://svc-01k3sernj1j8j1r22ksd447nzv.01k1227hqx74vf02r8yybjf8zs.lmapp.run/api/insights/patterns
```

## 📊 **SAMPLE DATA INCLUDED**

The API now includes 3 sample leads:

1. **Sarah Johnson** (TechCorp) - Score: 85, Stage: qualified
2. **James Wilson** (Energy Corp) - Score: 72, Stage: prospect  
3. **Dr. Emily Rodriguez** (HealthTech) - Score: 90, Stage: proposal

## 🎬 **DEMO SCRIPT**

```bash
echo "🎯 AI CRM Demo - Real AI Integration"
echo "=================================="

echo "1. Viewing current leads..."
curl -s -X GET "https://svc-01k3sernj1j8j1r22ksd447nzv.01k1227hqx74vf02r8yybjf8zs.lmapp.run/api/leads" | jq '.[] | {name, company, score, stage}'

echo "2. Creating new lead with AI scoring..."
curl -s -X POST https://svc-01k3sernj1j8j1r22ksd447nzv.01k1227hqx74vf02r8yybjf8zs.lmapp.run/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Demo Lead",
    "email": "demo@example.com",
    "company": "Demo Corp", 
    "industry": "technology",
    "notes": "High-value enterprise prospect"
  }' | jq '{name, score, id}'

echo "3. Teaching AI successful patterns..."
curl -s -X POST https://svc-01k3sernj1j8j1r22ksd447nzv.01k1227hqx74vf02r8yybjf8zs.lmapp.run/api/memory/learn \
  -H "Content-Type: application/json" \
  -d '{
    "pattern_type": "conversion",
    "pattern_data": {"success": true}
  }' | jq '.'
```

Your AI CRM is **LIVE** and **FULLY FUNCTIONAL** for demos! 🚀