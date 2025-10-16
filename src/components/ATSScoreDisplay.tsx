import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ATSAnalyzer } from '@/utils/atsAnalyzer';
import { CheckCircle, AlertCircle, XCircle, Info } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from 'react';

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
  const [showScoringInfo, setShowScoringInfo] = useState(false);
  
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
          <div className="mt-3 flex items-center gap-2 text-xs text-white/60">
            <CheckCircle className="h-3 w-3" />
            <span>ATS features active: Resume scoring, skills extraction, and compatibility analysis</span>
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

            <Collapsible open={showScoringInfo} onOpenChange={setShowScoringInfo}>
              <CollapsibleTrigger className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors">
                <Info className="h-4 w-4" />
                <span>How is this scored?</span>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3 space-y-3 text-xs text-white/70">
                <div>
                  <div className="font-semibold text-white mb-1">Overall Score (100 points):</div>
                  <ul className="space-y-1 ml-4">
                    <li>• Skills: Up to 40 points (5 points per detected skill)</li>
                    <li>• Action Verbs: Up to 30 points (2 points per keyword like "managed", "developed")</li>
                    <li>• Length: 30 points for 200-800 words, 15 points otherwise</li>
                  </ul>
                </div>
                <div>
                  <div className="font-semibold text-white mb-1">Format Structure (100 points):</div>
                  <ul className="space-y-1 ml-4">
                    <li>• Contact Information: 25 points</li>
                    <li>• Work Experience Section: 25 points</li>
                    <li>• Education Section: 25 points</li>
                    <li>• Skills Section: 25 points</li>
                  </ul>
                </div>
              </CollapsibleContent>
            </Collapsible>
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