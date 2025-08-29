import { Actor, ActorState } from '@liquidmetal-ai/raindrop-framework';
import { Env } from './raindrop.gen.js';

export interface LeadData {
  id: string;
  email?: string;
  company?: string;
  jobTitle?: string;
  industry?: string;
  companySize?: number;
  budget?: number;
  timeline?: string;
  source?: string;
  engagement?: {
    websiteVisits: number;
    emailOpens: number;
    emailClicks: number;
    downloadedAssets: number;
    socialInteractions: number;
  };
  behavioral?: {
    pagesViewed: string[];
    timeOnSite: number;
    formSubmissions: number;
    lastActivity: Date;
  };
  firmographic?: {
    revenue?: number;
    employees?: number;
    location?: string;
    technology?: string[];
  };
  [key: string]: any;
}

export interface ScoreResult {
  score: number;
  confidence: number;
  factors: ScoreFactor[];
  recommendation: string;
  priority: 'hot' | 'warm' | 'cold';
  nextActions: string[];
}

export interface ScoreFactor {
  factor: string;
  weight: number;
  value: number;
  impact: number;
  reason: string;
}

export interface ScoreHistory {
  leadId: string;
  timestamp: Date;
  score: number;
  confidence: number;
  factors: ScoreFactor[];
  changes: string[];
}

export interface PatternMatch {
  patternId: string;
  similarity: number;
  conversionProbability: number;
  matchingFeatures: string[];
  suggestedActions: string[];
}

interface LeadScoreState {
  scores: Map<string, ScoreResult>;
  history: Map<string, ScoreHistory[]>;
  patterns: Map<string, PatternMatch[]>;
  lastCleanup: Date;
}

export class LeadScorer extends Actor<Env> {
  private readonly CLEANUP_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours
  private readonly MAX_HISTORY_ENTRIES = 100;
  private readonly SCORE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

  constructor(state: ActorState, env: Env) {
    super(state, env);
    this.scheduleCleanup();
  }

  /**
   * Calculate comprehensive lead score using AI-powered analysis
   */
  async calculateLeadScore(leadData: LeadData): Promise<ScoreResult> {
    try {
      this.env.logger.info(`Calculating lead score for lead ${leadData.id}`);
      
      // Prepare data for AI analysis
      const context = this.prepareAIContext(leadData);
      
      // Get AI-powered scoring using available AI model
      const aiResponse = await this.env.AI.run('@cf/openai/gpt-oss-120b', {
        input: [{
          role: 'system',
          content: `You are an expert lead scoring AI. Analyze the provided lead data and return a comprehensive score.
          
          Score leads on a scale of 0-100 based on:
          - Engagement level (0-25 points)
          - Fit quality (company size, industry, budget) (0-25 points)
          - Behavioral signals (0-25 points)
          - Firmographic data (0-25 points)
          
          Return JSON with:
          {
            "score": number (0-100),
            "confidence": number (0-1),
            "factors": [{
              "factor": string,
              "weight": number (0-1),
              "value": number,
              "impact": number (-10 to +10),
              "reason": string
            }],
            "recommendation": string,
            "priority": "hot" | "warm" | "cold",
            "nextActions": [string]
          }`
        }, {
          role: 'user',
          content: `Analyze this lead data: ${JSON.stringify(context)}`
        }],
        temperature: 0.3,
        max_tokens: 1000
      });

      const responseText = typeof aiResponse === 'string' ? aiResponse : 
                          (aiResponse as any).content || (aiResponse as any).response || JSON.stringify(aiResponse);
      const scoreResult = this.parseAIResponse(responseText.trim());
      
      // Store the score in actor state
      await this.updateScoreInState(leadData.id, scoreResult);
      
      // Analyze patterns for additional insights
      const patterns = await this.analyzePatterns(leadData);
      if (patterns && patterns.length > 0) {
        scoreResult.factors.push({
          factor: 'Pattern Match',
          weight: 0.15,
          value: patterns[0]?.similarity || 0,
          impact: (patterns[0]?.conversionProbability || 0) * 10 - 5,
          reason: `Matches conversion pattern with ${((patterns[0]?.similarity || 0) * 100).toFixed(1)}% similarity`
        });
      }

      this.env.logger.info(`Lead score calculated: ${scoreResult.score} (confidence: ${scoreResult.confidence})`);
      return scoreResult;

    } catch (error) {
      this.env.logger.error(`Error calculating lead score: ${error}`);
      throw new Error(`Failed to calculate lead score: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Update lead score with new data in real-time
   */
  async updateScore(leadId: string, newData: Partial<LeadData>): Promise<ScoreResult> {
    try {
      this.env.logger.info(`Updating score for lead ${leadId}`);
      
      // Get current score from state
      const state = await this.getLeadScoreState();
      const currentScore = state.scores.get(leadId);
      
      if (!currentScore) {
        // No existing score, calculate fresh
        return await this.calculateLeadScore({ id: leadId, ...newData } as LeadData);
      }

      // Merge new data with existing context
      const updatedData = { id: leadId, ...newData };
      
      // Recalculate score with updated data
      const newScore = await this.calculateLeadScore(updatedData);
      
      // Track changes in history
      const changes = this.identifyChanges(currentScore, newScore);
      await this.addToHistory(leadId, newScore, changes);
      
      this.env.logger.info(`Score updated for lead ${leadId}: ${currentScore.score} → ${newScore.score}`);
      return newScore;

    } catch (error) {
      this.env.logger.error(`Error updating score: ${error}`);
      throw new Error(`Failed to update score: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get score progression history for a lead
   */
  async getScoreHistory(leadId: string): Promise<ScoreHistory[]> {
    try {
      const state = await this.getLeadScoreState();
      return state.history.get(leadId) || [];
    } catch (error) {
      this.env.logger.error(`Error getting score history: ${error}`);
      throw new Error(`Failed to get score history: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Analyze patterns using vector database for similarity matching
   */
  async analyzePatterns(leadData: LeadData): Promise<PatternMatch[]> {
    try {
      this.env.logger.info(`Analyzing patterns for lead ${leadData.id}`);
      
      // Create embedding vector from lead data
      const embedding = await this.createLeadEmbedding(leadData);
      
      // Query vector database for similar patterns
      const similarPatterns = await this.env.CONVERSION_PATTERNS.query(embedding, {
        topK: 5
      });

      const patterns: PatternMatch[] = [];
      
      for (const match of similarPatterns.matches) {
        const metadata = match.metadata as any;
        patterns.push({
          patternId: match.id,
          similarity: match.score,
          conversionProbability: metadata.conversionRate || 0,
          matchingFeatures: metadata.features || [],
          suggestedActions: metadata.actions || []
        });
      }

      // Store patterns in state
      const state = await this.getLeadScoreState();
      state.patterns.set(leadData.id, patterns);
      await this.state.storage.put('leadScoreState', state);

      this.env.logger.info(`Found ${patterns.length} pattern matches for lead ${leadData.id}`);
      return patterns;

    } catch (error) {
      this.env.logger.error(`Error analyzing patterns: ${error}`);
      throw new Error(`Failed to analyze patterns: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get current lead score from state
   */
  async getCurrentScore(leadId: string): Promise<ScoreResult | null> {
    try {
      const state = await this.getLeadScoreState();
      return state.scores.get(leadId) || null;
    } catch (error) {
      this.env.logger.error(`Error getting current score: ${error}`);
      return null;
    }
  }

  /**
   * Get pattern matches for a lead
   */
  async getPatternMatches(leadId: string): Promise<PatternMatch[]> {
    try {
      const state = await this.getLeadScoreState();
      return state.patterns.get(leadId) || [];
    } catch (error) {
      this.env.logger.error(`Error getting pattern matches: ${error}`);
      return [];
    }
  }

  // Private helper methods

  private async getLeadScoreState(): Promise<LeadScoreState> {
    const state = await this.state.storage.get<LeadScoreState>('leadScoreState');
    return state || {
      scores: new Map(),
      history: new Map(),
      patterns: new Map(),
      lastCleanup: new Date()
    };
  }

  private prepareAIContext(leadData: LeadData): any {
    return {
      id: leadData.id,
      profile: {
        email: leadData.email,
        company: leadData.company,
        jobTitle: leadData.jobTitle,
        industry: leadData.industry,
        source: leadData.source
      },
      engagement: leadData.engagement || {},
      behavioral: leadData.behavioral || {},
      firmographic: leadData.firmographic || {},
      derived: {
        hasEmail: !!leadData.email,
        hasCompany: !!leadData.company,
        hasTitle: !!leadData.jobTitle,
        engagementScore: this.calculateEngagementScore(leadData.engagement),
        recencyScore: this.calculateRecencyScore(leadData.behavioral?.lastActivity)
      }
    };
  }

  private parseAIResponse(response: string): ScoreResult {
    try {
      const parsed = JSON.parse(response);
      
      // Validate required fields
      if (typeof parsed.score !== 'number' || parsed.score < 0 || parsed.score > 100) {
        throw new Error('Invalid score value');
      }
      
      return {
        score: Math.round(parsed.score),
        confidence: Math.max(0, Math.min(1, parsed.confidence || 0.5)),
        factors: Array.isArray(parsed.factors) ? parsed.factors : [],
        recommendation: parsed.recommendation || 'No recommendation provided',
        priority: ['hot', 'warm', 'cold'].includes(parsed.priority) ? parsed.priority : 'cold',
        nextActions: Array.isArray(parsed.nextActions) ? parsed.nextActions : []
      };
    } catch (error) {
      this.env.logger.error(`Error parsing AI response: ${error}`);
      // Return fallback score
      return {
        score: 50,
        confidence: 0.3,
        factors: [],
        recommendation: 'Unable to analyze - requires manual review',
        priority: 'cold',
        nextActions: ['Review lead manually', 'Gather more data']
      };
    }
  }

  private async updateScoreInState(leadId: string, scoreResult: ScoreResult): Promise<void> {
    const state = await this.getLeadScoreState();
    state.scores.set(leadId, scoreResult);
    
    // Add to history
    await this.addToHistory(leadId, scoreResult, ['Initial score calculation']);
    
    await this.state.storage.put('leadScoreState', state);
  }

  private async addToHistory(leadId: string, scoreResult: ScoreResult, changes: string[]): Promise<void> {
    const state = await this.getLeadScoreState();
    const history = state.history.get(leadId) || [];
    
    const historyEntry: ScoreHistory = {
      leadId,
      timestamp: new Date(),
      score: scoreResult.score,
      confidence: scoreResult.confidence,
      factors: [...scoreResult.factors],
      changes
    };
    
    history.unshift(historyEntry);
    
    // Keep only the most recent entries
    if (history.length > this.MAX_HISTORY_ENTRIES) {
      history.splice(this.MAX_HISTORY_ENTRIES);
    }
    
    state.history.set(leadId, history);
    await this.state.storage.put('leadScoreState', state);
  }

  private identifyChanges(oldScore: ScoreResult, newScore: ScoreResult): string[] {
    const changes: string[] = [];
    
    const scoreDiff = newScore.score - oldScore.score;
    if (Math.abs(scoreDiff) >= 5) {
      changes.push(`Score changed by ${scoreDiff > 0 ? '+' : ''}${scoreDiff} points`);
    }
    
    if (oldScore.priority !== newScore.priority) {
      changes.push(`Priority changed from ${oldScore.priority} to ${newScore.priority}`);
    }
    
    const confidenceDiff = newScore.confidence - oldScore.confidence;
    if (Math.abs(confidenceDiff) >= 0.1) {
      changes.push(`Confidence changed by ${(confidenceDiff * 100).toFixed(1)}%`);
    }
    
    return changes.length > 0 ? changes : ['Minor score adjustment'];
  }

  private async createLeadEmbedding(leadData: LeadData): Promise<number[]> {
    // Create a feature vector from lead data
    const features = [
      leadData.engagement?.websiteVisits || 0,
      leadData.engagement?.emailOpens || 0,
      leadData.engagement?.emailClicks || 0,
      leadData.firmographic?.employees || 0,
      leadData.firmographic?.revenue || 0,
      leadData.behavioral?.timeOnSite || 0,
      leadData.behavioral?.formSubmissions || 0
    ];
    
    // Normalize and pad to 768 dimensions (matching vector index)
    const embedding = new Array(768).fill(0);
    
    // Use first features directly
    for (let i = 0; i < Math.min(features.length, 100); i++) {
      embedding[i] = (features[i] || 0) / 1000; // Normalize
    }
    
    // Add categorical features as binary indicators
    let offset = 100;
    if (leadData.industry) {
      const industryHash = this.simpleHash(leadData.industry) % 50;
      embedding[offset + industryHash] = 1;
    }
    offset += 50;
    
    if (leadData.jobTitle) {
      const titleHash = this.simpleHash(leadData.jobTitle) % 50;
      embedding[offset + titleHash] = 1;
    }
    offset += 50;
    
    if (leadData.source) {
      const sourceHash = this.simpleHash(leadData.source) % 20;
      embedding[offset + sourceHash] = 1;
    }
    
    return embedding;
  }

  private calculateEngagementScore(engagement?: LeadData['engagement']): number {
    if (!engagement) return 0;
    
    return Math.min(100, (
      (engagement.websiteVisits || 0) * 2 +
      (engagement.emailOpens || 0) * 3 +
      (engagement.emailClicks || 0) * 5 +
      (engagement.downloadedAssets || 0) * 10 +
      (engagement.socialInteractions || 0) * 2
    ));
  }

  private calculateRecencyScore(lastActivity?: Date): number {
    if (!lastActivity) return 0;
    
    const daysSince = (Date.now() - lastActivity.getTime()) / (24 * 60 * 60 * 1000);
    return Math.max(0, 100 - daysSince * 5); // Decrease by 5 points per day
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  private scheduleCleanup(): void {
    this.state.storage.setAlarm(Date.now() + this.CLEANUP_INTERVAL);
  }

  async alarm(): Promise<void> {
    try {
      this.env.logger.info('Running scheduled cleanup of lead score data');
      
      const state = await this.getLeadScoreState();
      const now = new Date();
      let cleanedCount = 0;

      // Clean up expired scores
      for (const [leadId, score] of Array.from(state.scores.entries())) {
        // Remove scores older than SCORE_EXPIRY
        const history = state.history.get(leadId);
        if (history && history.length > 0) {
          const lastUpdate = history[0]?.timestamp;
          if (lastUpdate && now.getTime() - lastUpdate.getTime() > this.SCORE_EXPIRY) {
            state.scores.delete(leadId);
            state.history.delete(leadId);
            state.patterns.delete(leadId);
            cleanedCount++;
          }
        }
      }

      // Trim history entries that exceed limits
      for (const [leadId, history] of Array.from(state.history.entries())) {
        if (history.length > this.MAX_HISTORY_ENTRIES) {
          state.history.set(leadId, history.slice(0, this.MAX_HISTORY_ENTRIES));
        }
      }

      state.lastCleanup = now;
      await this.state.storage.put('leadScoreState', state);

      this.env.logger.info(`Cleanup completed: removed ${cleanedCount} expired lead scores`);
      
      // Schedule next cleanup
      this.scheduleCleanup();

    } catch (error) {
      this.env.logger.error(`Error during cleanup: ${error}`);
      // Schedule retry in 1 hour
      this.state.storage.setAlarm(Date.now() + 60 * 60 * 1000);
    }
  }
}
