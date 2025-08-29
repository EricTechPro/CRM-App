import { Each, Message } from '@liquidmetal-ai/raindrop-framework';
import { Env } from './raindrop.gen';
import { z } from 'zod';

// Message body schema for successful conversion events
const ConversionEventSchema = z.object({
  eventType: z.enum(['deal_closed', 'conversion_success', 'lead_qualified']),
  dealId: z.string().optional(),
  leadId: z.string(),
  userId: z.string(),
  timestamp: z.string(),
  conversionData: z.object({
    // Lead characteristics that contributed to success
    leadScore: z.number(),
    companySize: z.string(),
    industry: z.string(),
    region: z.string(),
    budget: z.number().optional(),
    timeline: z.string().optional(),
    painPoints: z.array(z.string()),
    decisionMakers: z.array(z.string()),
    competitorMentioned: z.string().optional(),
    sourceChannel: z.string(),
    
    // Interaction patterns that led to success
    touchpoints: z.array(z.object({
      type: z.string(),
      timestamp: z.string(),
      content: z.string().optional(),
      sentiment: z.number().optional(),
    })),
    documentsShared: z.array(z.string()),
    meetingCount: z.number(),
    emailCount: z.number(),
    responseTime: z.number(), // average response time in hours
    
    // Outcome metrics
    dealValue: z.number().optional(),
    salesCycle: z.number(), // days from lead to close
    conversionStage: z.string(),
  }),
});

export type Body = z.infer<typeof ConversionEventSchema>;

// Interfaces for pattern analysis
interface ConversionPattern {
  id: string;
  patternType: 'demographic' | 'behavioral' | 'temporal' | 'content';
  features: Record<string, any>;
  successRate: number;
  sampleSize: number;
  confidence: number;
  createdAt: string;
  updatedAt: string;
}

interface SuccessFactors {
  leadCharacteristics: {
    optimalScore: number;
    topIndustries: string[];
    preferredCompanySize: string[];
    highValueRegions: string[];
  };
  interactionPatterns: {
    optimalTouchpoints: number;
    bestChannels: string[];
    idealResponseTime: number;
    effectiveContent: string[];
  };
  temporalFactors: {
    optimalSalesCycle: number;
    bestConversionStages: string[];
    peakInteractionTimes: string[];
  };
}

export default class PatternLearner extends Each<Body, Env> {
  async process(message: Message<Body>): Promise<void> {
    try {
      this.env.logger.info('Processing conversion event', { messageId: message.id });
      
      // Validate message body
      const conversionEvent = ConversionEventSchema.parse(message.body);
      
      // Analyze successful conversion for patterns
      const successFactors = await this.analyzeSuccessfulConversions(conversionEvent);
      
      // Generate embeddings for the conversion pattern
      const embeddings = await this.generateEmbeddings(conversionEvent, successFactors);
      
      // Store patterns in vector database and SmartMemory
      await this.storePatterns(conversionEvent, successFactors, embeddings);
      
      // Update lead scoring models based on new insights
      await this.updateLeadScoring(successFactors);
      
      this.env.logger.info('Conversion pattern learning completed successfully', {
        leadId: conversionEvent.leadId,
        eventType: conversionEvent.eventType
      });
      
    } catch (error) {
      this.env.logger.error('Error processing conversion event', {
        error: error instanceof Error ? error.message : 'Unknown error',
        messageId: message.id
      });
      throw error;
    }
  }

  /**
   * Analyzes successful conversion data to identify key success factors
   */
  private async analyzeSuccessfulConversions(conversionEvent: Body): Promise<SuccessFactors> {
    try {
      this.env.logger.info('Analyzing successful conversion factors', { leadId: conversionEvent.leadId });
      
      const { conversionData } = conversionEvent;
      
      // Use AI to analyze the conversion and extract success factors
      const analysisPrompt = `Analyze this successful conversion and identify key success factors:
        
        Lead Details:
        - Score: ${conversionData.leadScore}
        - Industry: ${conversionData.industry}
        - Company Size: ${conversionData.companySize}
        - Region: ${conversionData.region}
        - Budget: ${conversionData.budget || 'Not specified'}
        - Timeline: ${conversionData.timeline || 'Not specified'}
        - Pain Points: ${conversionData.painPoints.join(', ')}
        - Decision Makers: ${conversionData.decisionMakers.join(', ')}
        - Source Channel: ${conversionData.sourceChannel}
        
        Interaction Patterns:
        - Total Touchpoints: ${conversionData.touchpoints.length}
        - Documents Shared: ${conversionData.documentsShared.length}
        - Meetings: ${conversionData.meetingCount}
        - Emails: ${conversionData.emailCount}
        - Avg Response Time: ${conversionData.responseTime} hours
        - Sales Cycle: ${conversionData.salesCycle} days
        - Deal Value: ${conversionData.dealValue || 'Not specified'}
        
        Provide insights on what factors likely contributed to this successful conversion.`;
      
      const analysis = await this.env.AI.run('@cf/openai/gpt-oss-120b', {
        input: [{ role: 'user', content: analysisPrompt }]
      });
      
      // Calculate success factors based on the data
      const successFactors: SuccessFactors = {
        leadCharacteristics: {
          optimalScore: conversionData.leadScore,
          topIndustries: [conversionData.industry],
          preferredCompanySize: [conversionData.companySize],
          highValueRegions: [conversionData.region],
        },
        interactionPatterns: {
          optimalTouchpoints: conversionData.touchpoints.length,
          bestChannels: [conversionData.sourceChannel],
          idealResponseTime: conversionData.responseTime,
          effectiveContent: conversionData.documentsShared,
        },
        temporalFactors: {
          optimalSalesCycle: conversionData.salesCycle,
          bestConversionStages: [conversionData.conversionStage],
          peakInteractionTimes: conversionData.touchpoints.map(t => 
            new Date(t.timestamp).getHours().toString()
          ),
        },
      };
      
      this.env.logger.info('Conversion analysis completed', { 
        leadId: conversionEvent.leadId,
        analysisLength: (typeof analysis === 'string' ? analysis : JSON.stringify(analysis)).length 
      });
      
      return successFactors;
      
    } catch (error) {
      this.env.logger.error('Error analyzing conversion factors', {
        error: error instanceof Error ? error.message : 'Unknown error',
        leadId: conversionEvent.leadId
      });
      throw error;
    }
  }

  /**
   * Generates embeddings for conversion patterns using bge-base-en model
   */
  private async generateEmbeddings(conversionEvent: Body, successFactors: SuccessFactors): Promise<number[]> {
    try {
      this.env.logger.info('Generating embeddings for conversion pattern', { leadId: conversionEvent.leadId });
      
      // Create comprehensive text representation of the conversion pattern
      const patternText = this.createPatternText(conversionEvent, successFactors);
      
      // Generate embeddings using AI service with bge-m3 model
      const embeddingResponse = await this.env.AI.run('@cf/baai/bge-m3', {
        text: patternText
      });
      
      // Extract embedding vector from response
      // Note: The actual embedding extraction would depend on the AI service response format
      // This is a simplified implementation
      const embeddings = this.extractEmbeddingVector(typeof embeddingResponse === 'string' ? embeddingResponse : JSON.stringify(embeddingResponse));
      
      this.env.logger.info('Embeddings generated successfully', {
        leadId: conversionEvent.leadId,
        embeddingDimensions: embeddings.length
      });
      
      return embeddings;
      
    } catch (error) {
      this.env.logger.error('Error generating embeddings', {
        error: error instanceof Error ? error.message : 'Unknown error',
        leadId: conversionEvent.leadId
      });
      throw error;
    }
  }

  /**
   * Stores learned patterns in vector database and SmartMemory
   */
  private async storePatterns(
    conversionEvent: Body, 
    successFactors: SuccessFactors, 
    embeddings: number[]
  ): Promise<void> {
    try {
      this.env.logger.info('Storing conversion patterns', { leadId: conversionEvent.leadId });
      
      // Create pattern record for vector database
      const patternId = `pattern_${conversionEvent.leadId}_${Date.now()}`;
      const pattern: ConversionPattern = {
        id: patternId,
        patternType: 'behavioral',
        features: {
          leadScore: conversionEvent.conversionData.leadScore,
          industry: conversionEvent.conversionData.industry,
          companySize: conversionEvent.conversionData.companySize,
          sourceChannel: conversionEvent.conversionData.sourceChannel,
          touchpoints: conversionEvent.conversionData.touchpoints.length,
          salesCycle: conversionEvent.conversionData.salesCycle,
          dealValue: conversionEvent.conversionData.dealValue,
          successFactors: successFactors,
        },
        successRate: 1.0, // This is a successful conversion
        sampleSize: 1,
        confidence: 0.8,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Store in vector database for similarity search
      await this.env.CONVERSION_PATTERNS.upsert([{
        id: patternId,
        values: embeddings,
        metadata: {
          leadId: conversionEvent.leadId,
          eventType: conversionEvent.eventType,
          industry: conversionEvent.conversionData.industry,
          companySize: conversionEvent.conversionData.companySize,
          dealValue: conversionEvent.conversionData.dealValue || 0,
          salesCycle: conversionEvent.conversionData.salesCycle,
          patternData: JSON.stringify(pattern),
        },
      }]);
      
      // Store detailed insights in SmartMemory using semantic memory
      const patternDocument = {
        id: `conversion_pattern_${conversionEvent.leadId}`,
        pattern,
        successFactors,
        analysisDate: new Date().toISOString(),
        conversionEvent: {
          leadId: conversionEvent.leadId,
          eventType: conversionEvent.eventType,
          timestamp: conversionEvent.timestamp,
        },
      };
      await this.env.AI_INSIGHTS.putSemanticMemory(patternDocument);
      
      // Also store aggregated success factors for quick retrieval
      const aggregateKey = 'success_factors_aggregate';
      const existingAggregateResult = await this.env.AI_INSIGHTS.getSemanticMemory(aggregateKey);
      
      let aggregateData: any = { patterns: [], lastUpdated: null };
      if (existingAggregateResult.success && existingAggregateResult.document) {
        try {
          aggregateData = existingAggregateResult.document;
        } catch (e) {
          this.env.logger.warn('Could not parse existing aggregate data, creating new');
        }
      }
      
      aggregateData.patterns.push({
        patternId,
        successFactors,
        timestamp: new Date().toISOString(),
      });
      aggregateData.lastUpdated = new Date().toISOString();
      
      await this.env.AI_INSIGHTS.putSemanticMemory({
        id: aggregateKey,
        ...aggregateData
      });
      
      this.env.logger.info('Conversion patterns stored successfully', {
        patternId,
        leadId: conversionEvent.leadId
      });
      
    } catch (error) {
      this.env.logger.error('Error storing conversion patterns', {
        error: error instanceof Error ? error.message : 'Unknown error',
        leadId: conversionEvent.leadId
      });
      throw error;
    }
  }

  /**
   * Updates lead scoring models based on new conversion insights
   */
  private async updateLeadScoring(successFactors: SuccessFactors): Promise<void> {
    try {
      this.env.logger.info('Updating lead scoring models');
      
      // Retrieve current scoring parameters from SmartMemory
      const scoringConfigKey = 'lead_scoring_config';
      const currentConfigResult = await this.env.AI_INSIGHTS.getSemanticMemory(scoringConfigKey);
      
      let scoringConfig: any = {
        industryWeights: {},
        companySizeWeights: {},
        channelWeights: {},
        behavioralWeights: {},
        lastUpdated: null,
      };
      
      if (currentConfigResult.success && currentConfigResult.document) {
        try {
          scoringConfig = currentConfigResult.document;
        } catch (e) {
          this.env.logger.warn('Could not parse existing scoring config, using defaults');
        }
      }
      
      // Update weights based on success factors
      const updateWeight = (currentWeight: number = 0, increment = 0.1) => {
        return Math.min(currentWeight + increment, 1.0);
      };
      
      // Update industry weights
      successFactors.leadCharacteristics.topIndustries.forEach(industry => {
        scoringConfig.industryWeights[industry] = updateWeight(
          scoringConfig.industryWeights[industry]
        );
      });
      
      // Update company size weights
      successFactors.leadCharacteristics.preferredCompanySize.forEach(size => {
        scoringConfig.companySizeWeights[size] = updateWeight(
          scoringConfig.companySizeWeights[size]
        );
      });
      
      // Update channel weights
      successFactors.interactionPatterns.bestChannels.forEach(channel => {
        scoringConfig.channelWeights[channel] = updateWeight(
          scoringConfig.channelWeights[channel]
        );
      });
      
      // Update behavioral pattern weights
      scoringConfig.behavioralWeights = {
        ...scoringConfig.behavioralWeights,
        optimalTouchpoints: successFactors.interactionPatterns.optimalTouchpoints,
        idealResponseTime: successFactors.interactionPatterns.idealResponseTime,
        optimalSalesCycle: successFactors.temporalFactors.optimalSalesCycle,
      };
      
      scoringConfig.lastUpdated = new Date().toISOString();
      
      // Store updated configuration
      await this.env.AI_INSIGHTS.putSemanticMemory({
        id: scoringConfigKey,
        ...scoringConfig
      });
      
      // Notify lead scorer actor about the updates via message
      // This would typically trigger the lead scorer to reload its models
      try {
        const leadScorerActor = this.env.LEAD_SCORER.get(this.env.LEAD_SCORER.idFromName('default'));
        // In a real implementation, you would call a specific method on the actor
        // For now, just log that the update would be sent
        this.env.logger.info('Lead scorer model update notification prepared', {
          updateType: 'pattern_learning',
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        this.env.logger.warn('Could not notify lead scorer of model updates', {
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
      
      this.env.logger.info('Lead scoring models updated successfully', {
        industriesUpdated: successFactors.leadCharacteristics.topIndustries.length,
        channelsUpdated: successFactors.interactionPatterns.bestChannels.length
      });
      
    } catch (error) {
      this.env.logger.error('Error updating lead scoring models', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Creates a comprehensive text representation of the conversion pattern for embedding
   */
  private createPatternText(conversionEvent: Body, successFactors: SuccessFactors): string {
    const { conversionData } = conversionEvent;
    
    return `
      Successful conversion pattern:
      Lead characteristics: ${conversionData.leadScore} score, ${conversionData.industry} industry, 
      ${conversionData.companySize} company, ${conversionData.region} region.
      Pain points: ${conversionData.painPoints.join(', ')}.
      Decision makers: ${conversionData.decisionMakers.join(', ')}.
      Interaction pattern: ${conversionData.touchpoints.length} touchpoints, 
      ${conversionData.meetingCount} meetings, ${conversionData.emailCount} emails, 
      ${conversionData.responseTime} hours average response time.
      Sales cycle: ${conversionData.salesCycle} days from lead to close.
      Source: ${conversionData.sourceChannel}.
      Documents shared: ${conversionData.documentsShared.length} documents.
      Deal value: ${conversionData.dealValue || 'unspecified'}.
      Conversion stage: ${conversionData.conversionStage}.
    `.replace(/\s+/g, ' ').trim();
  }

  /**
   * Extracts embedding vector from AI response
   * Note: This is a simplified implementation - actual implementation would depend on AI service format
   */
  private extractEmbeddingVector(content: string): number[] {
    try {
      // In a real implementation, this would parse the actual embedding response
      // For now, we'll generate a mock 768-dimensional vector based on content hash
      const hash = this.simpleHash(content);
      const vector: number[] = [];
      
      for (let i = 0; i < 768; i++) {
        vector.push((Math.sin(hash + i) + 1) / 2); // Normalize to 0-1 range
      }
      
      return vector;
    } catch (error) {
      this.env.logger.error('Error extracting embedding vector', {
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      // Return zero vector as fallback
      return new Array(768).fill(0);
    }
  }

  /**
   * Simple hash function for generating consistent mock embeddings
   */
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}