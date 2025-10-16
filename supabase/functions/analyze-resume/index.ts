import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const commonSkills = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'React', 'Angular', 'Vue',
  'Node.js', 'HTML', 'CSS', 'SQL', 'MongoDB', 'PostgreSQL', 'AWS', 'Azure',
  'Docker', 'Kubernetes', 'Git', 'CI/CD', 'Agile', 'Scrum',
  'Project Management', 'Leadership', 'Communication', 'Analysis', 'Strategy',
  'Marketing', 'Sales', 'Customer Service', 'Operations', 'Finance',
  'Excel', 'PowerPoint', 'Salesforce', 'CRM', 'ERP',
  'Problem Solving', 'Team Work', 'Time Management', 'Critical Thinking',
  'Attention to Detail', 'Adaptability', 'Innovation', 'Collaboration'
];

const commonKeywords = [
  'experience', 'managed', 'developed', 'implemented', 'created', 'designed',
  'led', 'coordinated', 'improved', 'increased', 'reduced', 'achieved',
  'delivered', 'collaborated', 'analyzed', 'optimized', 'streamlined',
  'supervised', 'trained', 'mentored', 'presented', 'negotiated'
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { filePath, resumeId } = await req.json();
    
    if (!filePath) {
      throw new Error('File path is required');
    }

    console.log('Analyzing resume:', filePath);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Download the file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('resumes')
      .download(filePath);

    if (downloadError) {
      console.error('Error downloading file:', downloadError);
      throw downloadError;
    }

    console.log('File downloaded, processing with AI...');

    let extractedText = '';
    const isPdf = filePath.toLowerCase().endsWith('.pdf');

    if (isPdf) {
      // For PDFs, use document understanding without image extraction
      const arrayBuffer = await fileData.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Try to extract basic text patterns from PDF
      const decoder = new TextDecoder('utf-8', { fatal: false });
      const pdfText = decoder.decode(uint8Array);
      
      // Extract readable text (simple heuristic - PDFs have text between stream objects)
      const textMatches = pdfText.match(/\(([^)]+)\)/g);
      if (textMatches) {
        extractedText = textMatches
          .map(match => match.slice(1, -1))
          .join(' ')
          .replace(/\\[nrt]/g, ' ')
          .replace(/\s+/g, ' ');
      }
      
      console.log('Extracted text length:', extractedText.length);
    } else {
      // For images, use AI vision
      const arrayBuffer = await fileData.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      const mimeType = 'image/jpeg';
      const dataUrl = `data:${mimeType};base64,${base64}`;

      const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Extract all text content from this resume image. Return only the extracted text, no formatting or commentary.'
                },
                {
                  type: 'image_url',
                  image_url: { url: dataUrl }
                }
              ]
            }
          ],
        }),
      });

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        console.error('AI API error:', aiResponse.status, errorText);
        throw new Error(`AI API error: ${aiResponse.status}`);
      }

      const aiData = await aiResponse.json();
      extractedText = aiData.choices?.[0]?.message?.content || '';
    }

    console.log('Text extracted, analyzing...');

    // Analyze the extracted text
    const cleanText = extractedText.toLowerCase();
    const words = cleanText.split(/\s+/);
    
    // Extract skills
    const skillsFound = commonSkills.filter(skill => 
      cleanText.includes(skill.toLowerCase())
    );

    // Extract keywords
    const keywordsFound = commonKeywords.filter(keyword =>
      cleanText.includes(keyword)
    );

    // Analyze structure
    const hasContactInfo = /(\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9})|(\w+@\w+\.\w+)/.test(extractedText);
    const hasWorkExperience = /experience|employment|work|position|role|job/i.test(extractedText);
    const hasEducation = /education|degree|university|college|school|certification/i.test(extractedText);
    const hasSkillsSection = /skills|competencies|abilities|expertise/i.test(extractedText);

    // Calculate formatting score (0-100)
    let formattingScore = 0;
    if (hasContactInfo) formattingScore += 25;
    if (hasWorkExperience) formattingScore += 25;
    if (hasEducation) formattingScore += 25;
    if (hasSkillsSection) formattingScore += 25;

    // Calculate overall ATS score
    const skillsScore = Math.min(skillsFound.length * 5, 40);
    const keywordScore = Math.min(keywordsFound.length * 2, 30);
    const lengthScore = words.length >= 200 && words.length <= 800 ? 30 : 15;
    
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

    const analysis = {
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

    console.log('Analysis complete:', analysis);

    // Save analysis to database if resumeId provided
    if (resumeId) {
      const { error: dbError } = await supabase
        .from('resume_analysis')
        .insert({
          resume_id: resumeId,
          ats_score: analysis.score,
          formatting_score: analysis.formattingScore,
          skills_extracted: analysis.skillsExtracted,
          keywords_found: analysis.keywordsFound,
          suggestions: analysis.suggestions,
          analysis_data: analysis.metadata
        });

      if (dbError) {
        console.error('Error saving analysis:', dbError);
      }
    }

    return new Response(
      JSON.stringify(analysis),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in analyze-resume function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
