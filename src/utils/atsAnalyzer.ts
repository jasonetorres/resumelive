export interface ATSAnalysis {
  score: number;
  formattingScore: number;
  keywordsFound: string[];
  skillsExtracted: string[];
  suggestions: string[];
  metadata: {
    wordCount: number;
    hasContactInfo: boolean;
    hasWorkExperience: boolean;
    hasEducation: boolean;
    hasSkillsSection: boolean;
  };
}

export class ATSAnalyzer {
  private static commonSkills = [
    // Technical Skills
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'React', 'Angular', 'Vue',
    'Node.js', 'HTML', 'CSS', 'SQL', 'MongoDB', 'PostgreSQL', 'AWS', 'Azure',
    'Docker', 'Kubernetes', 'Git', 'CI/CD', 'Agile', 'Scrum',
    
    // Business Skills
    'Project Management', 'Leadership', 'Communication', 'Analysis', 'Strategy',
    'Marketing', 'Sales', 'Customer Service', 'Operations', 'Finance',
    'Excel', 'PowerPoint', 'Salesforce', 'CRM', 'ERP',
    
    // General Skills
    'Problem Solving', 'Team Work', 'Time Management', 'Critical Thinking',
    'Attention to Detail', 'Adaptability', 'Innovation', 'Collaboration'
  ];

  private static commonKeywords = [
    'experience', 'managed', 'developed', 'implemented', 'created', 'designed',
    'led', 'coordinated', 'improved', 'increased', 'reduced', 'achieved',
    'delivered', 'collaborated', 'analyzed', 'optimized', 'streamlined',
    'supervised', 'trained', 'mentored', 'presented', 'negotiated'
  ];

  static analyzeText(text: string): ATSAnalysis {
    const cleanText = text.toLowerCase();
    const words = cleanText.split(/\s+/);
    
    // Extract skills
    const skillsFound = this.commonSkills.filter(skill => 
      cleanText.includes(skill.toLowerCase())
    );

    // Extract keywords
    const keywordsFound = this.commonKeywords.filter(keyword =>
      cleanText.includes(keyword)
    );

    // Analyze structure
    const hasContactInfo = /(\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9})|(\w+@\w+\.\w+)/.test(text);
    const hasWorkExperience = /experience|employment|work|position|role|job/i.test(text);
    const hasEducation = /education|degree|university|college|school|certification/i.test(text);
    const hasSkillsSection = /skills|competencies|abilities|expertise/i.test(text);

    // Calculate formatting score (0-100)
    let formattingScore = 0;
    if (hasContactInfo) formattingScore += 25;
    if (hasWorkExperience) formattingScore += 25;
    if (hasEducation) formattingScore += 25;
    if (hasSkillsSection) formattingScore += 25;

    // Calculate overall ATS score
    const skillsScore = Math.min(skillsFound.length * 5, 40); // Max 40 points for skills
    const keywordScore = Math.min(keywordsFound.length * 2, 30); // Max 30 points for keywords
    const lengthScore = words.length >= 200 && words.length <= 800 ? 30 : 15; // Optimal length
    
    const overallScore = Math.min(skillsScore + keywordScore + lengthScore, 100);

    // Generate suggestions
    const suggestions: string[] = [];
    if (skillsFound.length < 5) {
      suggestions.push('Add more relevant technical and soft skills to improve keyword matching');
    }
    if (keywordsFound.length < 10) {
      suggestions.push('Include more action verbs and achievement-focused language');
    }
    if (!hasContactInfo) {
      suggestions.push('Ensure contact information is clearly visible at the top');
    }
    if (!hasSkillsSection) {
      suggestions.push('Add a dedicated skills section for better ATS parsing');
    }
    if (words.length < 200) {
      suggestions.push('Consider adding more detail about your experience and achievements');
    }
    if (words.length > 800) {
      suggestions.push('Consider condensing content - ATS systems prefer concise resumes');
    }

    return {
      score: Math.round(overallScore),
      formattingScore: Math.round(formattingScore),
      keywordsFound,
      skillsExtracted: skillsFound,
      suggestions,
      metadata: {
        wordCount: words.length,
        hasContactInfo,
        hasWorkExperience,
        hasEducation,
        hasSkillsSection
      }
    };
  }

  static getScoreColor(score: number): string {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  }

  static getScoreLabel(score: number): string {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  }
}