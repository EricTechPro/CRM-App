import {
  BucketEventNotification,
  Each,
  Message,
} from "@liquidmetal-ai/raindrop-framework";
import { Env } from './raindrop.gen';

/**
 * Structured analysis results from AI document processing
 */
export interface DocumentAnalysis {
  // Deal information
  dealValue?: {
    amount: number;
    currency: string;
    confidence: number;
  };
  
  // Timeline indicators
  timeline?: {
    urgency: 'low' | 'medium' | 'high' | 'critical';
    estimatedCloseDate?: string;
    keyDates: Array<{
      date: string;
      event: string;
      importance: number; // 1-10 scale
    }>;
    confidence: number;
  };
  
  // Decision makers and stakeholders
  decisionMakers?: Array<{
    name: string;
    title?: string;
    role: 'primary' | 'secondary' | 'influencer';
    contact?: string;
    confidence: number;
  }>;
  
  // Key business terms and requirements
  keyTerms?: Array<{
    term: string;
    category: 'requirement' | 'feature' | 'constraint' | 'benefit';
    importance: number; // 1-10 scale
    context: string;
  }>;
  
  // Competitor mentions and analysis
  competitors?: Array<{
    name: string;
    context: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    mentioned_features?: string[];
  }>;
  
  // Urgency and priority indicators
  urgencyIndicators?: Array<{
    indicator: string;
    type: 'deadline' | 'business_pressure' | 'competitive' | 'regulatory';
    urgencyScore: number; // 1-10 scale
    context: string;
  }>;
  
  // Budget and financial signals
  budgetSignals?: Array<{
    signal: string;
    type: 'approved' | 'allocated' | 'requested' | 'constraint';
    amount?: number;
    currency?: string;
    context: string;
    confidence: number;
  }>;
  
  // Document metadata
  documentInfo: {
    type: 'proposal' | 'contract' | 'email' | 'presentation' | 'rfp' | 'other';
    confidence: number;
    language: string;
    pageCount?: number;
    wordCount?: number;
  };
  
  // Overall analysis summary
  summary: {
    overallScore: number; // 1-100 lead quality score
    riskFactors: string[];
    opportunities: string[];
    nextSteps: string[];
    analysisConfidence: number; // Overall confidence in analysis
  };
}

/**
 * Message body structure for AI processing queue
 */
export interface AIProcessingMessage {
  documentKey: string;
  bucketName: string;
  analysis: DocumentAnalysis;
  timestamp: string;
  processingMetadata: {
    modelUsed: string;
    processingTime: number;
    tokenCount?: number;
  };
}

/**
 * Document Processor Observer
 * Processes SmartBucket file uploads for AI-powered document analysis
 */
export default class DocumentProcessor extends Each<BucketEventNotification, Env> {
  async process(message: Message<BucketEventNotification>): Promise<void> {
    const startTime = Date.now();
    const { logger, tracer, AI, SALES_DOCUMENTS, AI_PROCESSING, CRM_DATABASE } = this.env;
    
    try {
      // Extract event details from BucketEventNotification
      const bucketName = message.body.bucket;
      const objectKey = message.body.object.key;
      
      if (!bucketName || !objectKey) {
        logger.warn('Invalid bucket event structure', { body: message.body });
        return;
      }
      
      const bucket = { name: bucketName };
      const object = { 
        key: objectKey, 
        size: message.body.object.size,
        eTag: message.body.object.eTag 
      };
      
      logger.info('Processing document upload', {
        bucketName: bucket.name,
        objectKey: object.key,
        objectSize: object.size,
        objectETag: object.eTag
      });

      if (!object?.key) {
        logger.warn('No object key found in event');
        return;
      }

      try {
        // Retrieve document content from SmartBucket
        logger.debug('Retrieving document content', { key: object.key });
        const documentContent = await SALES_DOCUMENTS.get(object.key);

        if (!documentContent) {
          throw new Error(`Failed to retrieve document content for key: ${object.key}`);
        }

        // Convert BucketObjectBody to string
        const contentText = await documentContent.text();

        // Prepare AI analysis prompt
        const analysisPrompt = this.buildAnalysisPrompt(object.key);
        
        logger.debug('Starting AI analysis', {
          documentKey: object.key,
          contentLength: contentText.length
        });

        // Perform AI analysis using gpt-4o
        const aiResponse = await AI.run('@cf/openai/gpt-oss-120b', {
          input: [
            {
              role: 'system',
              content: analysisPrompt
            },
            {
              role: 'user',
              content: `Please analyze the following document content and return a structured JSON response:\n\n${contentText}`
            }
          ]
        });

        if (!aiResponse) {
          throw new Error('No response received from AI model');
        }

        // Parse AI response - aiResponse should have the response content
        const responseContent = typeof aiResponse === 'string' ? aiResponse : JSON.stringify(aiResponse);
        const analysisResult = this.parseAIResponse(responseContent, object.key);
        
        logger.info('AI analysis completed', {
          documentKey: object.key,
          overallScore: analysisResult.summary.overallScore,
          analysisConfidence: analysisResult.summary.analysisConfidence,
          dealValue: analysisResult.dealValue?.amount
        });

        // Store analysis in database
        await this.storeAnalysisInDatabase(object.key, analysisResult);

        // Send to AI processing queue for pattern learning
        const processingTime = Date.now() - startTime;
        const aiProcessingMessage: AIProcessingMessage = {
          documentKey: object.key,
          bucketName: bucket.name,
          analysis: analysisResult,
          timestamp: new Date().toISOString(),
          processingMetadata: {
            modelUsed: 'gpt-4o',
            processingTime,
            tokenCount: undefined
          }
        };

        // TODO: Fix queue message type mismatch - pattern-learner expects ConversionEventSchema
        // await AI_PROCESSING.send(aiProcessingMessage);
        
        logger.info('Document analysis completed successfully', {
          documentKey: object.key,
          processingTimeMs: processingTime
        });

      } catch (error) {
        throw error;
      }

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      logger.error('Document processing failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        objectKey: message.body.object?.key,
        processingTimeMs: processingTime,
        stack: error instanceof Error ? error.stack : undefined
      });

      // Don't throw - we don't want to retry failed documents indefinitely
      // The error is logged for investigation
    }
  }

  /**
   * Builds the analysis prompt for the AI model
   */
  private buildAnalysisPrompt(documentKey: string): string {
    return `You are an expert sales document analyzer. Analyze the provided document and extract key business insights in a structured format.

Instructions:
1. Extract all relevant information for sales lead qualification
2. Assign confidence scores (0-1) to each extracted data point
3. Use conservative estimates for numerical values
4. Return response as valid JSON matching the specified schema

Document: ${documentKey}

Required JSON Schema:
{
  "dealValue": {
    "amount": number,
    "currency": string,
    "confidence": number
  },
  "timeline": {
    "urgency": "low|medium|high|critical",
    "estimatedCloseDate": "ISO date string or null",
    "keyDates": [{"date": "ISO date", "event": "string", "importance": number}],
    "confidence": number
  },
  "decisionMakers": [
    {
      "name": "string",
      "title": "string or null",
      "role": "primary|secondary|influencer",
      "contact": "string or null",
      "confidence": number
    }
  ],
  "keyTerms": [
    {
      "term": "string",
      "category": "requirement|feature|constraint|benefit",
      "importance": number,
      "context": "string"
    }
  ],
  "competitors": [
    {
      "name": "string",
      "context": "string",
      "sentiment": "positive|negative|neutral",
      "mentioned_features": ["string"]
    }
  ],
  "urgencyIndicators": [
    {
      "indicator": "string",
      "type": "deadline|business_pressure|competitive|regulatory",
      "urgencyScore": number,
      "context": "string"
    }
  ],
  "budgetSignals": [
    {
      "signal": "string",
      "type": "approved|allocated|requested|constraint",
      "amount": number,
      "currency": "string",
      "context": "string",
      "confidence": number
    }
  ],
  "documentInfo": {
    "type": "proposal|contract|email|presentation|rfp|other",
    "confidence": number,
    "language": "string",
    "pageCount": number,
    "wordCount": number
  },
  "summary": {
    "overallScore": number,
    "riskFactors": ["string"],
    "opportunities": ["string"],
    "nextSteps": ["string"],
    "analysisConfidence": number
  }
}

Analysis Guidelines:
- Deal Value: Look for budget numbers, contract values, annual spend mentions
- Timeline: Extract deadlines, go-live dates, decision timeframes
- Decision Makers: Identify names, titles, roles in decision process
- Key Terms: Business requirements, technical features, constraints
- Competitors: Any competing solutions or vendors mentioned
- Urgency: Time pressures, business drivers, regulatory requirements
- Budget: Approved budgets, spending authority, financial constraints
- Overall Score: 1-100 lead quality based on completeness and opportunity size

Return only valid JSON without markdown formatting or code blocks.`;
  }

  /**
   * Parses AI response and validates the structure
   */
  private parseAIResponse(aiContent: string, documentKey: string): DocumentAnalysis {
    try {
      // Clean up response (remove markdown formatting if present)
      const cleanContent = aiContent
        .replace(/```json\s*/g, '')
        .replace(/```\s*$/g, '')
        .trim();

      const parsed = JSON.parse(cleanContent);
      
      // Validate required fields and provide defaults
      const analysis: DocumentAnalysis = {
        dealValue: parsed.dealValue || undefined,
        timeline: parsed.timeline || undefined,
        decisionMakers: Array.isArray(parsed.decisionMakers) ? parsed.decisionMakers : [],
        keyTerms: Array.isArray(parsed.keyTerms) ? parsed.keyTerms : [],
        competitors: Array.isArray(parsed.competitors) ? parsed.competitors : [],
        urgencyIndicators: Array.isArray(parsed.urgencyIndicators) ? parsed.urgencyIndicators : [],
        budgetSignals: Array.isArray(parsed.budgetSignals) ? parsed.budgetSignals : [],
        documentInfo: {
          type: parsed.documentInfo?.type || 'other',
          confidence: parsed.documentInfo?.confidence || 0.5,
          language: parsed.documentInfo?.language || 'en',
          pageCount: parsed.documentInfo?.pageCount,
          wordCount: parsed.documentInfo?.wordCount
        },
        summary: {
          overallScore: parsed.summary?.overallScore || 0,
          riskFactors: Array.isArray(parsed.summary?.riskFactors) ? parsed.summary.riskFactors : [],
          opportunities: Array.isArray(parsed.summary?.opportunities) ? parsed.summary.opportunities : [],
          nextSteps: Array.isArray(parsed.summary?.nextSteps) ? parsed.summary.nextSteps : [],
          analysisConfidence: parsed.summary?.analysisConfidence || 0.5
        }
      };

      return analysis;

    } catch (error) {
      this.env.logger.error('Failed to parse AI response', {
        documentKey,
        error: error instanceof Error ? error.message : 'Unknown parsing error',
        aiContent: aiContent.substring(0, 500) // Log first 500 chars for debugging
      });

      // Return minimal analysis on parse failure
      return {
        documentInfo: {
          type: 'other',
          confidence: 0.1,
          language: 'en'
        },
        summary: {
          overallScore: 0,
          riskFactors: ['AI analysis parsing failed'],
          opportunities: [],
          nextSteps: ['Manual document review required'],
          analysisConfidence: 0.1
        }
      };
    }
  }

  /**
   * Store analysis results in SmartSQL database
   */
  private async storeAnalysisInDatabase(documentKey: string, analysis: DocumentAnalysis): Promise<void> {
    try {
      const { CRM_DATABASE, logger } = this.env;

      // Store document analysis record
      await CRM_DATABASE.executeQuery({
        sqlQuery: `INSERT OR REPLACE INTO document_analyses 
        (document_key, analysis_date, document_type, overall_score, analysis_confidence, deal_value, deal_currency, urgency_level, raw_analysis)
        VALUES ('${documentKey}', '${new Date().toISOString()}', '${analysis.documentInfo.type}', ${analysis.summary.overallScore}, ${analysis.summary.analysisConfidence}, ${analysis.dealValue?.amount || 'NULL'}, '${analysis.dealValue?.currency || 'NULL'}', '${analysis.timeline?.urgency || 'NULL'}', '${JSON.stringify(analysis).replace(/'/g, "''")}')`
      });

      // Store decision makers
      if (analysis.decisionMakers && analysis.decisionMakers.length > 0) {
        for (const dm of analysis.decisionMakers) {
          await CRM_DATABASE.executeQuery({
            sqlQuery: `INSERT OR REPLACE INTO decision_makers
            (document_key, name, title, role, contact_info, confidence)
            VALUES ('${documentKey}', '${dm.name.replace(/'/g, "''")}', '${dm.title?.replace(/'/g, "''") || 'NULL'}', '${dm.role}', '${dm.contact?.replace(/'/g, "''") || 'NULL'}', ${dm.confidence})`
          });
        }
      }

      // Store key terms
      if (analysis.keyTerms && analysis.keyTerms.length > 0) {
        for (const term of analysis.keyTerms) {
          await CRM_DATABASE.executeQuery({
            sqlQuery: `INSERT OR REPLACE INTO document_key_terms
            (document_key, term, category, importance, context)
            VALUES ('${documentKey}', '${term.term.replace(/'/g, "''")}', '${term.category}', ${term.importance}, '${term.context.replace(/'/g, "''")}')` 
          });
        }
      }

      // Store competitors
      if (analysis.competitors && analysis.competitors.length > 0) {
        for (const competitor of analysis.competitors) {
          await CRM_DATABASE.executeQuery({
            sqlQuery: `INSERT OR REPLACE INTO competitor_mentions
            (document_key, competitor_name, context, sentiment, mentioned_features)
            VALUES ('${documentKey}', '${competitor.name.replace(/'/g, "''")}', '${competitor.context.replace(/'/g, "''")}', '${competitor.sentiment}', '${JSON.stringify(competitor.mentioned_features || []).replace(/'/g, "''")}')`
          });
        }
      }

      // Store urgency indicators
      if (analysis.urgencyIndicators && analysis.urgencyIndicators.length > 0) {
        for (const indicator of analysis.urgencyIndicators) {
          await CRM_DATABASE.executeQuery({
            sqlQuery: `INSERT OR REPLACE INTO urgency_indicators
            (document_key, indicator, type, urgency_score, context)
            VALUES ('${documentKey}', '${indicator.indicator.replace(/'/g, "''")}', '${indicator.type}', ${indicator.urgencyScore}, '${indicator.context.replace(/'/g, "''")}')` 
          });
        }
      }

      // Store budget signals
      if (analysis.budgetSignals && analysis.budgetSignals.length > 0) {
        for (const signal of analysis.budgetSignals) {
          await CRM_DATABASE.executeQuery({
            sqlQuery: `INSERT OR REPLACE INTO budget_signals
            (document_key, signal, type, amount, currency, context, confidence)
            VALUES ('${documentKey}', '${signal.signal.replace(/'/g, "''")}', '${signal.type}', ${signal.amount || 'NULL'}, '${signal.currency || 'NULL'}', '${signal.context.replace(/'/g, "''")}', ${signal.confidence})`
          });
        }
      }

      logger.info('Analysis stored in database successfully', { documentKey });

    } catch (error) {
      this.env.logger.error('Failed to store analysis in database', {
        documentKey,
        error: error instanceof Error ? error.message : 'Unknown database error'
      });
      // Don't throw - analysis was successful, storage failure shouldn't break the flow
    }
  }
}
