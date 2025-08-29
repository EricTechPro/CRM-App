import { Actor, ActorState } from '@liquidmetal-ai/raindrop-framework';
import { Env } from './raindrop.gen.js';
import { z } from 'zod';

// Session data validation schemas
const UserPreferencesSchema = z.object({
  timezone: z.string().optional(),
  dateFormat: z.string().optional(),
  language: z.string().default('en'),
  theme: z.enum(['light', 'dark', 'auto']).default('light'),
  dashboardLayout: z.record(z.any()).optional(),
  notificationSettings: z.object({
    email: z.boolean().default(true),
    push: z.boolean().default(true),
    leadUpdates: z.boolean().default(true),
    territoryChanges: z.boolean().default(true),
  }).optional(),
});

const TerritorySchema = z.object({
  id: z.string(),
  name: z.string(),
  region: z.string().optional(),
  zipCodes: z.array(z.string()).optional(),
  states: z.array(z.string()).optional(),
  countries: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
  assignedAt: z.string(), // ISO date string
});

const SessionDataSchema = z.object({
  sessionId: z.string(),
  userId: z.string(),
  createdAt: z.string(), // ISO date string
  lastAccessedAt: z.string(), // ISO date string
  expiresAt: z.string(), // ISO date string
  isActive: z.boolean().default(true),
  preferences: UserPreferencesSchema,
  territories: z.array(TerritorySchema).default([]),
  metadata: z.record(z.any()).optional(),
});

// Type definitions from schemas
export type UserPreferences = z.infer<typeof UserPreferencesSchema>;
export type Territory = z.infer<typeof TerritorySchema>;
export type SessionData = z.infer<typeof SessionDataSchema>;

// Error types
export class SessionError extends Error {
  constructor(message: string, public code: string, public sessionId?: string) {
    super(message);
    this.name = 'SessionError';
  }
}

export class UserSessions extends Actor<Env> {
  private readonly SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
  private readonly CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // 1 hour
  
  constructor(state: ActorState, env: Env) {
    super(state, env);
    this.initializeCleanupAlarm();
  }

  /**
   * Create a new user session with preferences
   */
  async createSession(userId: string, preferences: Partial<UserPreferences> = {}): Promise<SessionData> {
    try {
      this.env.logger.info('Creating new session', { userId, preferences });

      // Generate unique session ID
      const sessionId = `session_${userId}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      
      // Validate and set default preferences
      const validatedPreferences = UserPreferencesSchema.parse(preferences);
      
      // Get existing territories for user if any
      const existingTerritories = await this.getUserTerritories(userId);
      
      const now = new Date().toISOString();
      const expiresAt = new Date(Date.now() + this.SESSION_DURATION_MS).toISOString();

      const sessionData: SessionData = {
        sessionId,
        userId,
        createdAt: now,
        lastAccessedAt: now,
        expiresAt,
        isActive: true,
        preferences: validatedPreferences,
        territories: existingTerritories,
        metadata: {
          userAgent: 'unknown',
          createdBy: 'system',
        },
      };

      // Validate session data
      const validatedSession = SessionDataSchema.parse(sessionData);

      // Store session in actor storage
      await this.state.storage.put(`session:${sessionId}`, validatedSession);
      await this.state.storage.put(`user_session:${userId}`, sessionId);

      // Update active sessions index
      await this.updateActiveSessionsIndex(sessionId, userId, true);

      this.env.logger.info('Session created successfully', { sessionId, userId });
      
      return validatedSession;
    } catch (error) {
      this.env.logger.error('Failed to create session', { 
        userId, 
        preferences, 
        error: error instanceof Error ? error.message : String(error) 
      });
      
      if (error instanceof z.ZodError) {
        throw new SessionError(
          `Invalid session data: ${error.errors.map(e => e.message).join(', ')}`,
          'VALIDATION_ERROR'
        );
      }
      
      throw new SessionError(
        `Failed to create session: ${error instanceof Error ? error.message : String(error)}`,
        'CREATION_ERROR'
      );
    }
  }

  /**
   * Retrieve session data by session ID
   */
  async getSession(sessionId: string): Promise<SessionData | null> {
    try {
      this.env.logger.debug('Retrieving session', { sessionId });

      const sessionData = await this.state.storage.get<SessionData>(`session:${sessionId}`);
      
      if (!sessionData) {
        this.env.logger.debug('Session not found', { sessionId });
        return null;
      }

      // Check if session is expired or inactive
      if (new Date(sessionData.expiresAt) < new Date() || !sessionData.isActive) {
        this.env.logger.info('Session expired or inactive, removing', { sessionId, isActive: sessionData.isActive });
        await this.cleanupSession(sessionId);
        return null;
      }

      // Update last accessed time
      sessionData.lastAccessedAt = new Date().toISOString();
      await this.state.storage.put(`session:${sessionId}`, sessionData);

      this.env.logger.debug('Session retrieved successfully', { sessionId, userId: sessionData.userId });
      
      return sessionData;
    } catch (error) {
      this.env.logger.error('Failed to retrieve session', { 
        sessionId, 
        error: error instanceof Error ? error.message : String(error) 
      });
      
      // Return null for storage failures to allow graceful degradation
      return null;
    }
  }

  /**
   * Update territories for a user across all their sessions
   */
  async updateTerritory(userId: string, territories: Territory[]): Promise<void> {
    try {
      this.env.logger.info('Updating territories for user', { userId, territoryCount: territories.length });

      // Validate territories
      const validatedTerritories = territories.map(territory => TerritorySchema.parse(territory));

      // Store territories for user
      await this.state.storage.put(`territories:${userId}`, validatedTerritories);

      // Update all active sessions for this user
      const currentSessionId = await this.state.storage.get<string>(`user_session:${userId}`);
      
      if (currentSessionId) {
        const sessionData = await this.state.storage.get<SessionData>(`session:${currentSessionId}`);
        
        if (sessionData && sessionData.isActive) {
          sessionData.territories = validatedTerritories;
          sessionData.lastAccessedAt = new Date().toISOString();
          
          // Add territory change to metadata
          if (!sessionData.metadata) sessionData.metadata = {};
          sessionData.metadata.lastTerritoryUpdate = new Date().toISOString();
          sessionData.metadata.territoryChangeCount = (sessionData.metadata.territoryChangeCount || 0) + 1;

          await this.state.storage.put(`session:${currentSessionId}`, sessionData);
        }
      }

      // Log territory changes for audit purposes
      await this.logTerritoryChange(userId, validatedTerritories);

      this.env.logger.info('Territories updated successfully', { 
        userId, 
        territoryCount: validatedTerritories.length,
        sessionId: currentSessionId 
      });

    } catch (error) {
      this.env.logger.error('Failed to update territories', { 
        userId, 
        territories, 
        error: error instanceof Error ? error.message : String(error) 
      });
      
      if (error instanceof z.ZodError) {
        throw new SessionError(
          `Invalid territory data: ${error.errors.map(e => e.message).join(', ')}`,
          'VALIDATION_ERROR'
        );
      }
      
      throw new SessionError(
        `Failed to update territories: ${error instanceof Error ? error.message : String(error)}`,
        'TERRITORY_UPDATE_ERROR'
      );
    }
  }

  /**
   * Get active sessions with optional filtering
   */
  async getActiveSessions(filterBy?: { userId?: string, region?: string }): Promise<SessionData[]> {
    try {
      this.env.logger.debug('Retrieving active sessions', { filterBy });

      const activeSessionsIndex = await this.state.storage.get<Record<string, { userId: string, sessionId: string }>>('active_sessions') || {};
      const activeSessions: SessionData[] = [];

      for (const [sessionId, sessionInfo] of Object.entries(activeSessionsIndex)) {
        try {
          const sessionData = await this.state.storage.get<SessionData>(`session:${sessionId}`);
          
          if (!sessionData) {
            // Clean up stale index entry
            await this.updateActiveSessionsIndex(sessionId, sessionInfo.userId, false);
            continue;
          }

          // Check if session is expired
          if (new Date(sessionData.expiresAt) < new Date() || !sessionData.isActive) {
            await this.cleanupSession(sessionId);
            continue;
          }

          // Apply filters
          if (filterBy) {
            if (filterBy.userId && sessionData.userId !== filterBy.userId) {
              continue;
            }
            
            if (filterBy.region) {
              const hasRegion = sessionData.territories.some(territory => 
                territory.region === filterBy.region && territory.isActive
              );
              if (!hasRegion) {
                continue;
              }
            }
          }

          activeSessions.push(sessionData);
        } catch (sessionError) {
          this.env.logger.warn('Error processing session, skipping', { 
            sessionId, 
            error: sessionError instanceof Error ? sessionError.message : String(sessionError) 
          });
        }
      }

      this.env.logger.debug('Active sessions retrieved', { 
        count: activeSessions.length,
        filterBy 
      });

      return activeSessions;
    } catch (error) {
      this.env.logger.error('Failed to retrieve active sessions', { 
        filterBy, 
        error: error instanceof Error ? error.message : String(error) 
      });
      
      throw new SessionError(
        `Failed to retrieve active sessions: ${error instanceof Error ? error.message : String(error)}`,
        'ACTIVE_SESSIONS_ERROR'
      );
    }
  }

  /**
   * Get territories for a specific user
   */
  private async getUserTerritories(userId: string): Promise<Territory[]> {
    try {
      const territories = await this.state.storage.get<Territory[]>(`territories:${userId}`);
      return territories || [];
    } catch (error) {
      this.env.logger.warn('Failed to get user territories, returning empty array', { 
        userId, 
        error: error instanceof Error ? error.message : String(error) 
      });
      return [];
    }
  }

  /**
   * Update the active sessions index for efficient querying
   */
  private async updateActiveSessionsIndex(sessionId: string, userId: string, isActive: boolean): Promise<void> {
    try {
      const activeSessionsIndex = await this.state.storage.get<Record<string, { userId: string, sessionId: string }>>('active_sessions') || {};
      
      if (isActive) {
        activeSessionsIndex[sessionId] = { userId, sessionId };
      } else {
        delete activeSessionsIndex[sessionId];
      }
      
      await this.state.storage.put('active_sessions', activeSessionsIndex);
    } catch (error) {
      this.env.logger.error('Failed to update active sessions index', { 
        sessionId, 
        userId, 
        isActive, 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  }

  /**
   * Log territory changes for audit purposes
   */
  private async logTerritoryChange(userId: string, territories: Territory[]): Promise<void> {
    try {
      const auditLog = {
        userId,
        action: 'territory_update',
        timestamp: new Date().toISOString(),
        territories: territories.map(t => ({ id: t.id, name: t.name, isActive: t.isActive })),
        activeCount: territories.filter(t => t.isActive).length,
      };

      // Store in audit log (using a simple array for now)
      const existingLogs = await this.state.storage.get<any[]>(`audit:${userId}`) || [];
      existingLogs.push(auditLog);
      
      // Keep only last 100 entries to prevent storage bloat
      if (existingLogs.length > 100) {
        existingLogs.splice(0, existingLogs.length - 100);
      }
      
      await this.state.storage.put(`audit:${userId}`, existingLogs);
    } catch (error) {
      this.env.logger.warn('Failed to log territory change', { 
        userId, 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  }

  /**
   * Clean up a specific session
   */
  private async cleanupSession(sessionId: string): Promise<void> {
    try {
      const sessionData = await this.state.storage.get<SessionData>(`session:${sessionId}`);
      
      if (sessionData) {
        // Mark as inactive instead of deleting immediately for audit purposes
        sessionData.isActive = false;
        sessionData.metadata = sessionData.metadata || {};
        sessionData.metadata.cleanedUpAt = new Date().toISOString();
        
        await this.state.storage.put(`session:${sessionId}`, sessionData);
        
        // Remove from active sessions index
        await this.updateActiveSessionsIndex(sessionId, sessionData.userId, false);
        
        // Clear user session reference if it matches
        const userSessionId = await this.state.storage.get<string>(`user_session:${sessionData.userId}`);
        if (userSessionId === sessionId) {
          await this.state.storage.delete(`user_session:${sessionData.userId}`);
        }

        this.env.logger.info('Session cleaned up', { sessionId, userId: sessionData.userId });
      }
    } catch (error) {
      this.env.logger.error('Failed to cleanup session', { 
        sessionId, 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  }

  /**
   * Initialize cleanup alarm for expired sessions
   */
  private async initializeCleanupAlarm(): Promise<void> {
    try {
      // Set up recurring alarm for session cleanup
      this.state.blockConcurrencyWhile(async () => {
        await this.state.storage.setAlarm(new Date(Date.now() + this.CLEANUP_INTERVAL_MS));
      });

      this.env.logger.info('Cleanup alarm initialized', { 
        intervalMs: this.CLEANUP_INTERVAL_MS 
      });
    } catch (error) {
      this.env.logger.error('Failed to initialize cleanup alarm', { 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  }

  /**
   * Handle alarm events for periodic cleanup
   */
  async alarm(): Promise<void> {
    try {
      this.env.logger.info('Running scheduled session cleanup');
      
      const startTime = Date.now();
      let cleanedCount = 0;
      let errorCount = 0;

      // Get all active sessions and check for expired ones
      const activeSessionsIndex = await this.state.storage.get<Record<string, { userId: string, sessionId: string }>>('active_sessions') || {};
      
      for (const [sessionId, sessionInfo] of Object.entries(activeSessionsIndex)) {
        try {
          const sessionData = await this.state.storage.get<SessionData>(`session:${sessionId}`);
          
          if (!sessionData || new Date(sessionData.expiresAt) < new Date() || !sessionData.isActive) {
            await this.cleanupSession(sessionId);
            cleanedCount++;
          }
        } catch (error) {
          errorCount++;
          this.env.logger.warn('Error during session cleanup', { 
            sessionId, 
            error: error instanceof Error ? error.message : String(error) 
          });
        }
      }

      // Also cleanup old inactive sessions (older than 7 days)
      const cutoffDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const allKeys = await this.state.storage.list();
      
      for (const key of Array.from(allKeys.keys())) {
        if (typeof key === 'string' && key.startsWith('session:')) {
          try {
            const sessionData = await this.state.storage.get<SessionData>(key);
            if (sessionData && 
                !sessionData.isActive && 
                sessionData.metadata?.cleanedUpAt && 
                new Date(sessionData.metadata.cleanedUpAt) < cutoffDate) {
              
              await this.state.storage.delete(key);
              cleanedCount++;
            }
          } catch (error) {
            errorCount++;
            this.env.logger.warn('Error during old session cleanup', { 
              key, 
              error: error instanceof Error ? error.message : String(error) 
            });
          }
        }
      }

      const duration = Date.now() - startTime;
      
      this.env.logger.info('Session cleanup completed', { 
        cleanedCount, 
        errorCount, 
        durationMs: duration 
      });

      // Schedule next cleanup
      await this.state.storage.setAlarm(new Date(Date.now() + this.CLEANUP_INTERVAL_MS));

    } catch (error) {
      this.env.logger.error('Fatal error during session cleanup alarm', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      
      // Still try to schedule next cleanup
      try {
        await this.state.storage.setAlarm(new Date(Date.now() + this.CLEANUP_INTERVAL_MS));
      } catch (alarmError) {
        this.env.logger.error('Failed to reschedule cleanup alarm', { 
          error: alarmError instanceof Error ? alarmError.message : String(alarmError) 
        });
      }
    }
  }

  /**
   * Additional utility methods for session management
   */

  /**
   * Extend session expiration time
   */
  async extendSession(sessionId: string, additionalMinutes: number = 60): Promise<boolean> {
    try {
      const sessionData = await this.getSession(sessionId);
      
      if (!sessionData) {
        return false;
      }

      const newExpiresAt = new Date(new Date(sessionData.expiresAt).getTime() + additionalMinutes * 60 * 1000).toISOString();
      sessionData.expiresAt = newExpiresAt;
      sessionData.lastAccessedAt = new Date().toISOString();
      
      if (!sessionData.metadata) sessionData.metadata = {};
      sessionData.metadata.extensionCount = (sessionData.metadata.extensionCount || 0) + 1;
      sessionData.metadata.lastExtendedAt = new Date().toISOString();

      await this.state.storage.put(`session:${sessionId}`, sessionData);

      this.env.logger.info('Session extended', { 
        sessionId, 
        userId: sessionData.userId, 
        newExpiresAt, 
        additionalMinutes 
      });

      return true;
    } catch (error) {
      this.env.logger.error('Failed to extend session', { 
        sessionId, 
        additionalMinutes, 
        error: error instanceof Error ? error.message : String(error) 
      });
      return false;
    }
  }

  /**
   * Invalidate a specific session
   */
  async invalidateSession(sessionId: string): Promise<boolean> {
    try {
      const sessionData = await this.state.storage.get<SessionData>(`session:${sessionId}`);
      
      if (!sessionData) {
        return false;
      }

      await this.cleanupSession(sessionId);

      this.env.logger.info('Session invalidated', { 
        sessionId, 
        userId: sessionData.userId 
      });

      return true;
    } catch (error) {
      this.env.logger.error('Failed to invalidate session', { 
        sessionId, 
        error: error instanceof Error ? error.message : String(error) 
      });
      return false;
    }
  }

  /**
   * Get session statistics
   */
  async getSessionStats(): Promise<{
    totalActive: number;
    totalInactive: number;
    expiringSoon: number;
    byUser: Record<string, number>;
    byRegion: Record<string, number>;
  }> {
    try {
      const stats = {
        totalActive: 0,
        totalInactive: 0,
        expiringSoon: 0,
        byUser: {} as Record<string, number>,
        byRegion: {} as Record<string, number>,
      };

      const soonThreshold = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
      const allKeys = await this.state.storage.list();

      for (const key of Array.from(allKeys.keys())) {
        if (typeof key === 'string' && key.startsWith('session:')) {
          try {
            const sessionData = await this.state.storage.get<SessionData>(key);
            if (!sessionData) continue;

            if (sessionData.isActive && new Date(sessionData.expiresAt) > new Date()) {
              stats.totalActive++;
              
              if (new Date(sessionData.expiresAt) < soonThreshold) {
                stats.expiringSoon++;
              }

              // Count by user
              stats.byUser[sessionData.userId] = (stats.byUser[sessionData.userId] || 0) + 1;

              // Count by region
              for (const territory of sessionData.territories.filter(t => t.isActive)) {
                if (territory.region) {
                  stats.byRegion[territory.region] = (stats.byRegion[territory.region] || 0) + 1;
                }
              }
            } else {
              stats.totalInactive++;
            }
          } catch (sessionError) {
            this.env.logger.warn('Error processing session for stats', { 
              key, 
              error: sessionError instanceof Error ? sessionError.message : String(sessionError) 
            });
          }
        }
      }

      return stats;
    } catch (error) {
      this.env.logger.error('Failed to get session stats', { 
        error: error instanceof Error ? error.message : String(error) 
      });
      
      return {
        totalActive: 0,
        totalInactive: 0,
        expiringSoon: 0,
        byUser: {},
        byRegion: {},
      };
    }
  }
}
