import { supabase } from '@/integrations/supabase/client';

export class ContentModerator {
  // Enhanced profanity filter
  private static readonly PROFANITY_WORDS = [
    'fuck', 'shit', 'damn', 'bitch', 'asshole', 'bastard', 'crap',
    'hell', 'piss', 'dick', 'cock', 'pussy', 'tits', 'ass', 'whore',
    'slut', 'fag', 'nigger', 'retard', 'idiot', 'stupid', 'hate',
    'kill yourself', 'kys', 'die', 'suicide', 'bomb', 'terrorist',
    'nazi', 'hitler', 'rape', 'murder', 'violence'
  ];

  // Spam patterns
  private static readonly SPAM_PATTERNS = [
    /buy\s+now/i,
    /click\s+here/i,
    /free\s+money/i,
    /make\s+\$\d+/i,
    /work\s+from\s+home/i,
    /lose\s+weight/i,
    /viagra|cialis/i,
    /crypto|bitcoin|investment/i,
    /http[s]?:\/\/[^\s]+/i, // URLs
    /www\.[^\s]+/i,
    /\b\d{3}-\d{3}-\d{4}\b/, // Phone numbers
    /\b\d{10,}\b/, // Long numbers
    /@[^\s]+\.(com|org|net|edu)/i // Email addresses in content
  ];

  static moderateText(text: string): { 
    filtered: string; 
    wasModerated: boolean; 
    severity: 'low' | 'medium' | 'high';
    flags: string[];
  } {
    let filtered = text;
    let wasModerated = false;
    let severity: 'low' | 'medium' | 'high' = 'low';
    const flags: string[] = [];

    // Check for profanity
    this.PROFANITY_WORDS.forEach(word => {
      const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      if (regex.test(filtered)) {
        filtered = filtered.replace(regex, '*'.repeat(word.length));
        wasModerated = true;
        severity = 'high';
        flags.push('profanity');
      }
    });

    // Check for spam patterns
    this.SPAM_PATTERNS.forEach(pattern => {
      if (pattern.test(text)) {
        flags.push('spam');
        if (severity === 'low') severity = 'medium';
      }
    });

    // Check for excessive caps (more than 70% uppercase)
    const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
    if (capsRatio > 0.7 && text.length > 10) {
      flags.push('excessive_caps');
      if (severity === 'low') severity = 'medium';
    }

    // Check for repeated characters
    if (/(.)\1{4,}/.test(text)) {
      flags.push('repeated_chars');
      if (severity === 'low') severity = 'medium';
    }

    // Block if mostly profanity
    const profanityRatio = (text.length - filtered.replace(/\*/g, '').length) / text.length;
    if (profanityRatio > 0.5) {
      return {
        filtered: '[BLOCKED - Inappropriate content]',
        wasModerated: true,
        severity: 'high',
        flags: [...flags, 'blocked']
      };
    }

    return { filtered, wasModerated, severity, flags };
  }

  static async checkBlockedEmail(email: string): Promise<boolean> {
    try {
      const domain = email.split('@')[1]?.toLowerCase();
      
      const { data } = await supabase
        .from('blocked_emails')
        .select('id')
        .or(`email.eq.${email},domain.eq.${domain}`)
        .limit(1);

      return (data && data.length > 0) || false;
    } catch (error) {
      console.error('Error checking blocked emails:', error);
      return false;
    }
  }

  static async logModerationAction(
    actionType: string,
    targetId: string,
    targetType: string,
    reason: string,
    metadata?: any
  ): Promise<void> {
    try {
      await supabase
        .from('moderation_log')
        .insert({
          action_type: actionType,
          target_id: targetId,
          target_type: targetType,
          reason: reason,
          moderator: 'system',
          metadata: metadata
        });
    } catch (error) {
      console.error('Failed to log moderation action:', error);
    }
  }
}