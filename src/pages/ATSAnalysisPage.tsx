import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ATSScoreDisplay } from "@/components/ATSScoreDisplay";
import { FileText, ArrowLeft, CheckCircle, XCircle, AlertCircle, ArrowUpDown } from "lucide-react";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Resume {
  id: string;
  name: string;
  file_path: string;
  file_type: string;
  created_at: string;
  submitter_name?: string;
  ats_score?: number;
}

interface ATSAnalysis {
  score: number;
  formattingScore: number;
  skillsExtracted: string[];
  keywordsFound: string[];
  suggestions: string[];
  metadata: {
    wordCount: number;
    hasContactInfo: boolean;
    hasWorkExperience: boolean;
    hasEducation: boolean;
    hasSkillsSection: boolean;
  };
}

const ATSAnalysisPage = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [atsAnalysis, setAtsAnalysis] = useState<ATSAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'score'>('date');

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    // Fetch resumes - they now have submitter_name directly in the table
    const { data: resumesData, error: resumesError } = await supabase
      .from('resumes')
      .select('*')
      .order('created_at', { ascending: false });

    if (resumesError) {
      console.error('Error fetching resumes:', resumesError);
      return;
    }

    // Fetch resume analysis data for ATS scores
    const { data: analysisData, error: analysisError } = await supabase
      .from('resume_analysis')
      .select('resume_id, ats_score');

    if (analysisError) {
      console.error('Error fetching analysis:', analysisError);
    }

    // Enrich resumes with ATS scores from analysis
    const enrichedResumes = resumesData?.map(resume => {
      const analysis = analysisData?.find(a => a.resume_id === resume.id);
      
      return {
        ...resume,
        ats_score: analysis?.ats_score
      };
    });

    setResumes(enrichedResumes || []);
  };

  const getSortedResumes = () => {
    const sorted = [...resumes];
    
    switch (sortBy) {
      case 'name':
        return sorted.sort((a, b) => {
          const nameA = a.submitter_name || a.name;
          const nameB = b.submitter_name || b.name;
          return nameA.localeCompare(nameB);
        });
      case 'score':
        return sorted.sort((a, b) => {
          const scoreA = a.ats_score || 0;
          const scoreB = b.ats_score || 0;
          return scoreB - scoreA;
        });
      case 'date':
      default:
        return sorted.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }
  };

  const analyzeResume = async (resume: Resume) => {
    setSelectedResume(resume);
    setIsAnalyzing(true);
    setAtsAnalysis(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-resume', {
        body: { 
          filePath: resume.file_path,
          resumeId: resume.id 
        }
      });

      if (error) throw error;

      setAtsAnalysis(data);
    } catch (error) {
      console.error('Error analyzing resume:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getStatusIcon = (hasFeature: boolean) => {
    return hasFeature ? (
      <CheckCircle className="h-5 w-5 text-green-400" />
    ) : (
      <XCircle className="h-5 w-5 text-red-400" />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-6">
          <Link to="/host">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Host Dashboard
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">ATS Analysis Dashboard</h1>
          <p className="text-muted-foreground">
            Analyze resumes for ATS compatibility, extract skills, and get optimization recommendations
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Resume List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Available Resumes</CardTitle>
              <CardDescription>
                Select a resume to analyze
              </CardDescription>
              <div className="mt-4">
                <Select value={sortBy} onValueChange={(value: 'date' | 'name' | 'score') => setSortBy(value)}>
                  <SelectTrigger className="w-full">
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Upload Date</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="score">ATS Score</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {resumes.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No resumes uploaded yet
                </p>
              ) : (
                getSortedResumes().map((resume) => (
                  <Button
                    key={resume.id}
                    variant={selectedResume?.id === resume.id ? "default" : "outline"}
                    className="w-full justify-start gap-2 h-auto py-3 px-4"
                    onClick={() => analyzeResume(resume)}
                    disabled={isAnalyzing}
                  >
                    <FileText className="h-4 w-4 flex-shrink-0" />
                    <div className="text-left overflow-hidden flex-1">
                      <div className="font-medium truncate">
                        {resume.submitter_name || resume.name}
                      </div>
                      <div className="text-xs opacity-70 flex items-center gap-2">
                        <span>{new Date(resume.created_at).toLocaleDateString()}</span>
                        {resume.ats_score && (
                          <Badge variant="secondary" className="text-xs px-1 py-0">
                            {resume.ats_score}/100
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Button>
                ))
              )}
            </CardContent>
          </Card>

          {/* Analysis Results */}
          <div className="lg:col-span-2 space-y-6">
            {!selectedResume && !isAnalyzing && (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">
                    Select a resume from the list to begin ATS analysis
                  </p>
                </CardContent>
              </Card>
            )}

            {isAnalyzing && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mb-4" />
                  <p className="text-muted-foreground">Analyzing resume...</p>
                </CardContent>
              </Card>
            )}

            {selectedResume && atsAnalysis && (
              <>
                {/* Resume Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {selectedResume.name}
                    </CardTitle>
                    <CardDescription>
                      Uploaded on {new Date(selectedResume.created_at).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                </Card>

                {/* ATS Score Display */}
                <ATSScoreDisplay
                  score={atsAnalysis.score}
                  formattingScore={atsAnalysis.formattingScore}
                  skillsExtracted={atsAnalysis.skillsExtracted}
                  suggestions={atsAnalysis.suggestions}
                />

                {/* Detailed Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle>Resume Structure Analysis</CardTitle>
                    <CardDescription>
                      Breakdown of key resume sections detected by ATS systems
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(atsAnalysis.metadata.hasContactInfo)}
                          <div>
                            <div className="font-medium">Contact Information</div>
                            <div className="text-xs text-muted-foreground">
                              Email, phone, or address
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(atsAnalysis.metadata.hasWorkExperience)}
                          <div>
                            <div className="font-medium">Work Experience</div>
                            <div className="text-xs text-muted-foreground">
                              Job history section
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(atsAnalysis.metadata.hasEducation)}
                          <div>
                            <div className="font-medium">Education</div>
                            <div className="text-xs text-muted-foreground">
                              Degrees and certifications
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(atsAnalysis.metadata.hasSkillsSection)}
                          <div>
                            <div className="font-medium">Skills Section</div>
                            <div className="text-xs text-muted-foreground">
                              Dedicated skills list
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Word Count</span>
                        <span className="text-sm text-muted-foreground">
                          {atsAnalysis.metadata.wordCount} words
                        </span>
                      </div>
                      <Progress 
                        value={Math.min((atsAnalysis.metadata.wordCount / 800) * 100, 100)} 
                        className="h-2"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Optimal range: 200-800 words
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Keywords Found */}
                {atsAnalysis.keywordsFound.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Action Keywords Detected</CardTitle>
                      <CardDescription>
                        {atsAnalysis.keywordsFound.length} action verbs found that strengthen your resume
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {atsAnalysis.keywordsFound.map((keyword, index) => (
                          <Badge 
                            key={index} 
                            variant="outline"
                            className="border-primary/30 text-primary"
                          >
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ATSAnalysisPage;
