import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ATSAnalyzer } from '@/utils/atsAnalyzer';
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';

interface ATSScoreDisplayProps {
  score: number;
  formattingScore: number;
  skillsExtracted: string[];
  suggestions: string[];
}

export const ATSScoreDisplay = ({ 
  score, 
  formattingScore, 
  skillsExtracted, 
  suggestions 
}: ATSScoreDisplayProps) => {
  const scoreColor = ATSAnalyzer.getScoreColor(score);
  const scoreLabel = ATSAnalyzer.getScoreLabel(score);
  
  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-5 w-5 text-green-400" />;
    if (score >= 60) return <AlertCircle className="h-5 w-5 text-yellow-400" />;
    return <XCircle className="h-5 w-5 text-red-400" />;
  };

  return (
    <div className="space-y-4">
      <Card className="bg-black border-white/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              {getScoreIcon(score)}
              ATS Compatibility Score
            </CardTitle>
            <div className="text-right">
              <div className={`text-2xl font-bold ${scoreColor}`}>{score}/100</div>
              <div className="text-sm text-white/70">{scoreLabel}</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-white/70">Overall Compatibility</span>
                <span className="text-white">{score}%</span>
              </div>
              <Progress value={score} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-white/70">Format Structure</span>
                <span className="text-white">{formattingScore}%</span>
              </div>
              <Progress value={formattingScore} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {skillsExtracted.length > 0 && (
        <Card className="bg-black border-white/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-lg">Detected Skills</CardTitle>
            <CardDescription className="text-white/70">
              Skills found that match common ATS keywords
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {skillsExtracted.slice(0, 10).map((skill, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="bg-primary/20 text-primary border-primary/30"
                >
                  {skill}
                </Badge>
              ))}
              {skillsExtracted.length > 10 && (
                <Badge variant="outline" className="border-white/30 text-white/70">
                  +{skillsExtracted.length - 10} more
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {suggestions.length > 0 && (
        <Card className="bg-black border-white/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-lg">Optimization Tips</CardTitle>
            <CardDescription className="text-white/70">
              Suggestions to improve ATS compatibility
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <li key={index} className="text-white/80 text-sm flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  {suggestion}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};