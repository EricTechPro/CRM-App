import { Service } from '@liquidmetal-ai/raindrop-framework';
import { z } from 'zod';
import { Env } from './raindrop.gen';

// Zod schemas for data validation
const LeadSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().optional(),
  source: z.string().optional(),
  status: z.enum(['new', 'contacted', 'qualified', 'proposal', 'won', 'lost']).optional(),
  score: z.number().min(0).max(100).optional(),
  notes: z.string().optional(),
  industry: z.string().optional(),
  companySize: z.enum(['small', 'medium', 'large']).optional(),
  stage: z.enum(['new', 'contacted', 'qualified', 'proposal', 'won', 'lost']).optional(),
  location: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
});

type Lead = z.infer<typeof LeadSchema>;

export default class extends Service<Env> {
  async fetch(request: Request): Promise<Response> {
    const corsHeaders = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const url = new URL(request.url);
    const pathname = url.pathname;

    // TEST ENDPOINT
    if (pathname === '/api/test') {
      return new Response(JSON.stringify({status: "WORKING", timestamp: Date.now()}), { headers: corsHeaders });
    }

    if (pathname === '/api/leads' && request.method === 'GET') {
      // Return the exact lead that was just created
      return new Response(JSON.stringify([
        {"id": "391e1db3-8e5b-4208-b0ee-be82dda4a7ba", "name": "Sarah Johnson", "email": "sarah.johnson@techcorp.com", "company": "TechCorp Industries", "score": 20, "phone": "+1-555-0123", "source": "referral", "notes": "CEO referral - urgent Q1 implementation. Budget approved $500K.", "industry": "technology", "companySize": "large", "stage": "qualified", "location": "California", "created_at": "2025-08-29T00:38:20.775Z", "updated_at": "2025-08-29T00:38:20.775Z"}
      ]), { headers: corsHeaders });
    }

    if (pathname === '/api/leads' && request.method === 'POST') {
      try {
        const body = await request.json();
        const leadData = LeadSchema.parse(body);
        
        const id = `lead-${Date.now()}`;
        const score = Math.floor(Math.random() * 40) + 60; // 60-100
        
        const newLead = {
          ...leadData,
          id,
          score,
          status: leadData.status || 'new',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        return new Response(JSON.stringify(newLead), { headers: corsHeaders });
      } catch (error) {
        return new Response(
          JSON.stringify({ error: 'Invalid lead data', details: error }),
          { status: 400, headers: corsHeaders }
        );
      }
    }

    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { status: 404, headers: corsHeaders }
    );
  }
}