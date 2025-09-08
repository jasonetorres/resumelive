// Email validation and security utilities

export interface ValidationResult {
  isValid: boolean;
  reason?: string;
  severity?: 'low' | 'medium' | 'high';
}

// Common disposable email domains to block
const DISPOSABLE_EMAIL_DOMAINS = [
  '10minutemail.com',
  'guerrillamail.com',
  'mailinator.com',
  'tempmail.org',
  'yopmail.com',
  'temp-mail.org',
  'throwaway.email',
  'getnada.com',
  'maildrop.cc',
  'sharklasers.com',
  'guerrillamailblock.com',
  'pokemail.net',
  'spam4.me',
  'bccto.me',
  'chacuo.net',
  'dispostable.com',
  'emailondeck.com',
  'fakeinbox.com',
  'hide.biz.st',
  'mytrashmail.com',
  'nobulk.com',
  'sogetthis.com',
  'spamherelots.com',
  'superrito.com',
  'zoemail.org'
];

// Suspicious patterns in names
const SUSPICIOUS_NAME_PATTERNS = [
  /^test\s*\d*$/i,
  /^fake/i,
  /^spam/i,
  /^troll/i,
  /^admin/i,
  /^null$/i,
  /^undefined$/i,
  /^delete$/i,
  /^drop$/i,
  /^select$/i,
  /^insert$/i,
  /^update$/i,
  /^script/i,
  /^alert/i,
  /^javascript/i,
  /^<script/i,
  /fuck|shit|damn|bitch|asshole/i,
  /^\s*$/,
  /^.{1}$/, // Single character names
  /^(.)\1{4,}$/, // Repeated characters (aaaaa, bbbbb)
  /^(.)(.)\1\2/i, // Alternating patterns (abab, xyxy)
];

// Professional email domains (more likely to be legitimate)
const PROFESSIONAL_EMAIL_DOMAINS = [
  'gmail.com',
  'outlook.com',
  'hotmail.com',
  'yahoo.com',
  'icloud.com',
  'protonmail.com',
  'company.com', // Generic - would need to be more specific
  'microsoft.com',
  'google.com',
  'apple.com',
  'amazon.com',
  'meta.com',
  'linkedin.com'
];

export function validateEmail(email: string): ValidationResult {
  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      reason: 'Invalid email format',
      severity: 'high'
    };
  }

  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) {
    return {
      isValid: false,
      reason: 'Invalid email domain',
      severity: 'high'
    };
  }

  // Check against disposable email domains
  if (DISPOSABLE_EMAIL_DOMAINS.includes(domain)) {
    return {
      isValid: false,
      reason: 'Disposable email addresses are not allowed',
      severity: 'high'
    };
  }

  // Check for suspicious patterns
  if (email.includes('+')) {
    return {
      isValid: false,
      reason: 'Email aliases are not allowed for this event',
      severity: 'medium'
    };
  }

  // Check for obviously fake emails
  if (email.includes('test') || email.includes('fake') || email.includes('spam')) {
    return {
      isValid: false,
      reason: 'Email appears to be fake or for testing',
      severity: 'high'
    };
  }

  return { isValid: true };
}

export function validateName(name: string): ValidationResult {
  // Check length
  if (name.length < 2) {
    return {
      isValid: false,
      reason: 'Name must be at least 2 characters',
      severity: 'medium'
    };
  }

  if (name.length > 50) {
    return {
      isValid: false,
      reason: 'Name is too long',
      severity: 'medium'
    };
  }

  // Check against suspicious patterns
  for (const pattern of SUSPICIOUS_NAME_PATTERNS) {
    if (pattern.test(name)) {
      return {
        isValid: false,
        reason: 'Name contains inappropriate or suspicious content',
        severity: 'high'
      };
    }
  }

  // Check for SQL injection attempts
  const sqlPatterns = [
    /drop\s+table/i,
    /delete\s+from/i,
    /insert\s+into/i,
    /update\s+set/i,
    /select\s+\*/i,
    /union\s+select/i,
    /or\s+1\s*=\s*1/i,
    /'\s*or\s*'/i,
    /--/,
    /\/\*/,
    /\*\//
  ];

  for (const pattern of sqlPatterns) {
    if (pattern.test(name)) {
      return {
        isValid: false,
        reason: 'Name contains potentially malicious content',
        severity: 'high'
      };
    }
  }

  return { isValid: true };
}

export function validateJobTitle(jobTitle: string): ValidationResult {
  // Check length
  if (jobTitle.length < 2) {
    return {
      isValid: false,
      reason: 'Job title must be at least 2 characters',
      severity: 'medium'
    };
  }

  if (jobTitle.length > 100) {
    return {
      isValid: false,
      reason: 'Job title is too long',
      severity: 'medium'
    };
  }

  // Check for suspicious content
  if (SUSPICIOUS_NAME_PATTERNS.some(pattern => pattern.test(jobTitle))) {
    return {
      isValid: false,
      reason: 'Job title contains inappropriate content',
      severity: 'high'
    };
  }

  return { isValid: true };
}

export function validateQuestion(question: string): ValidationResult {
  // Check length
  if (question.length < 5) {
    return {
      isValid: false,
      reason: 'Question must be at least 5 characters',
      severity: 'medium'
    };
  }

  if (question.length > 500) {
    return {
      isValid: false,
      reason: 'Question is too long',
      severity: 'medium'
    };
  }

  // Check for profanity and inappropriate content
  const profanityPatterns = [
    /fuck|shit|damn|bitch|asshole|bastard|crap|hell|piss|dick|cock|pussy|tits|ass|whore|slut|fag|nigger|retard/i,
    /kill\s+yourself/i,
    /kys/i,
    /die/i,
    /hate\s+you/i
  ];

  for (const pattern of profanityPatterns) {
    if (pattern.test(question)) {
      return {
        isValid: false,
        reason: 'Question contains inappropriate language',
        severity: 'high'
      };
    }
  }

  // Check for spam patterns
  const spamPatterns = [
    /buy\s+now/i,
    /click\s+here/i,
    /free\s+money/i,
    /make\s+money/i,
    /work\s+from\s+home/i,
    /http[s]?:\/\//i, // URLs
    /www\./i,
    /\.com|\.org|\.net/i
  ];

  for (const pattern of spamPatterns) {
    if (pattern.test(question)) {
      return {
        isValid: false,
        reason: 'Question appears to be spam or contains links',
        severity: 'high'
      };
    }
  }

  return { isValid: true };
}

export function generateSessionId(): string {
  return `session-${Date.now()}-${Math.random().toString(36).substring(2)}`;
}