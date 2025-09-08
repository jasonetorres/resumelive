import { supabase } from '@/integrations/supabase/client';
import { RATE_LIMITS, type RateLimit } from './validation';

export class RateLimiter {
  private sessionId: string;

  constructor() {
    // Get or create session ID
    this.sessionId = sessionStorage.getItem('sessionId') || this.generateSessionId();
    sessionStorage.setItem('sessionId', this.sessionId);
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substring(2)}`;
  }

  async checkRateLimit(actionType: string): Promise<{ allowed: boolean; reason?: string }> {
    const limit = RATE_LIMITS[actionType];
    if (!limit) {
      return { allowed: true };
    }

    try {
      // Get current rate limit record
      const { data: existing } = await supabase
        .from('rate_limits')
        .select('*')
        .eq('identifier', this.sessionId)
        .eq('action_type', actionType)
        .single();

      const now = new Date();
      const windowStart = new Date(now.getTime() - (limit.windowMinutes * 60 * 1000));

      if (!existing) {
        // First attempt - create record
        await supabase
          .from('rate_limits')
          .insert({
            identifier: this.sessionId,
            action_type: actionType,
            count: 1,
            window_start: now.toISOString()
          });
        return { allowed: true };
      }

      const recordWindowStart = new Date(existing.window_start);
      
      // Check if we're still in the same window
      if (recordWindowStart > windowStart) {
        // Still in window - check count
        if (existing.count >= limit.maxAttempts) {
          return {
            allowed: false,
            reason: `Rate limit exceeded. Maximum ${limit.maxAttempts} ${actionType.replace('_', ' ')}s per ${limit.windowMinutes} minutes.`
          };
        }

        // Increment count
        await supabase
          .from('rate_limits')
          .update({ count: existing.count + 1 })
          .eq('id', existing.id);

        return { allowed: true };
      } else {
        // New window - reset count
        await supabase
          .from('rate_limits')
          .update({
            count: 1,
            window_start: now.toISOString()
          })
          .eq('id', existing.id);

        return { allowed: true };
      }
    } catch (error) {
      console.error('Rate limit check failed:', error);
      // Allow on error to avoid blocking legitimate users
      return { allowed: true };
    }
  }

  async logAction(actionType: string, metadata?: any): Promise<void> {
    try {
      await supabase
        .from('moderation_log')
        .insert({
          action_type: actionType,
          target_type: 'rate_limit',
          metadata: { sessionId: this.sessionId, ...metadata }
        });
    } catch (error) {
      console.error('Failed to log action:', error);
    }
  }
}