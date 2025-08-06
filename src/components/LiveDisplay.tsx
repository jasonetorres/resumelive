import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StarRating } from './StarRating';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Users, MessageSquare, Star } from 'lucide-react';

interface Rating {
  id: string;
  overall: number;
  presentation: number;
  content: number;
  feedback?: string;
  category: 'resume' | 'linkedin';
  timestamp: string;
}

interface LiveDisplayProps {
  ratings: Rating[];
}

export function LiveDisplay({ ratings }: LiveDisplayProps) {
  const [displayedRatings, setDisplayedRatings] = useState<Rating[]>([]);
  const [currentFeedback, setCurrentFeedback] = useState<string>('');

  useEffect(() => {
    // Add new ratings with animation
    const newRatings = ratings.filter(
      rating => !displayedRatings.find(dr => dr.id === rating.id)
    );
    
    if (newRatings.length > 0) {
      setDisplayedRatings(prev => [...newRatings, ...prev].slice(0, 50));
      
      // Show feedback if available
      const latestWithFeedback = newRatings.find(r => r.feedback);
      if (latestWithFeedback?.feedback) {
        setCurrentFeedback(latestWithFeedback.feedback);
        setTimeout(() => setCurrentFeedback(''), 10000); // Clear after 10 seconds
      }
    }
  }, [ratings]);

  const resumeRatings = displayedRatings.filter(r => r.category === 'resume');
  const linkedinRatings = displayedRatings.filter(r => r.category === 'linkedin');

  const calculateStats = (ratings: Rating[]) => {
    if (ratings.length === 0) return { average: 0, presentation: 0, content: 0 };
    
    const sum = ratings.reduce((acc, r) => ({
      overall: acc.overall + r.overall,
      presentation: acc.presentation + r.presentation,
      content: acc.content + r.content
    }), { overall: 0, presentation: 0, content: 0 });
    
    return {
      average: sum.overall / ratings.length,
      presentation: sum.presentation / ratings.length,
      content: sum.content / ratings.length
    };
  };

  const resumeStats = calculateStats(resumeRatings);
  const linkedinStats = calculateStats(linkedinRatings);
  const allStats = calculateStats(displayedRatings);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80 p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-neon-purple via-neon-pink to-neon-orange bg-clip-text text-transparent mb-4">
          🚀 LIVE RATINGS 🚀
        </h1>
        <div className="flex justify-center items-center gap-4 text-neon-cyan">
          <Users className="w-5 h-5" />
          <span className="text-lg font-semibold">{displayedRatings.length} Anonymous Votes</span>
        </div>
      </div>

      {/* Current Feedback Banner */}
      {currentFeedback && (
        <Card className="mb-6 rating-glow border-neon-pink">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-6 h-6 text-neon-pink" />
              <div className="text-lg font-medium text-foreground">
                "{currentFeedback}"
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Overall Stats */}
        <Card className="glow-effect border-neon-purple/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-neon-purple">
              <TrendingUp className="w-5 h-5" />
              Overall Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="text-5xl font-bold text-neon-orange">
                {allStats.average.toFixed(1)}
              </div>
              <StarRating value={Math.round(allStats.average)} readonly size="lg" />
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Presentation</span>
                  <span className="text-neon-cyan">{allStats.presentation.toFixed(1)}</span>
                </div>
                <Progress value={allStats.presentation * 20} className="h-2" />
                <div className="flex justify-between text-sm">
                  <span>Content</span>
                  <span className="text-neon-green">{allStats.content.toFixed(1)}</span>
                </div>
                <Progress value={allStats.content * 20} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resume Stats */}
        <Card className="glow-effect border-neon-purple/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Badge className="bg-neon-purple text-primary-foreground">Resume</Badge>
              <span className="text-sm text-muted-foreground">({resumeRatings.length} votes)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="text-4xl font-bold text-neon-purple">
                {resumeStats.average.toFixed(1)}
              </div>
              <StarRating value={Math.round(resumeStats.average)} readonly />
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-center">
                  <div className="text-neon-cyan font-semibold">{resumeStats.presentation.toFixed(1)}</div>
                  <div className="text-muted-foreground">Presentation</div>
                </div>
                <div className="text-center">
                  <div className="text-neon-green font-semibold">{resumeStats.content.toFixed(1)}</div>
                  <div className="text-muted-foreground">Content</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* LinkedIn Stats */}
        <Card className="glow-effect border-neon-cyan/50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Badge className="bg-neon-cyan text-primary-foreground">LinkedIn</Badge>
              <span className="text-sm text-muted-foreground">({linkedinRatings.length} votes)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="text-4xl font-bold text-neon-cyan">
                {linkedinStats.average.toFixed(1)}
              </div>
              <StarRating value={Math.round(linkedinStats.average)} readonly />
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-center">
                  <div className="text-neon-cyan font-semibold">{linkedinStats.presentation.toFixed(1)}</div>
                  <div className="text-muted-foreground">Presentation</div>
                </div>
                <div className="text-center">
                  <div className="text-neon-green font-semibold">{linkedinStats.content.toFixed(1)}</div>
                  <div className="text-muted-foreground">Content</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Ratings Stream */}
      {displayedRatings.length > 0 && (
        <Card className="mt-6 border-neon-pink/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-neon-pink">
              <Star className="w-5 h-5" />
              Recent Ratings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-h-40 overflow-y-auto">
              {displayedRatings.slice(0, 20).map((rating) => (
                <div
                  key={rating.id}
                  className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-border/50"
                >
                  <Badge 
                    variant="outline" 
                    className={rating.category === 'resume' ? 'border-neon-purple/50' : 'border-neon-cyan/50'}
                  >
                    {rating.category}
                  </Badge>
                  <StarRating value={rating.overall} readonly size="sm" />
                  <span className="text-sm font-semibold text-neon-orange">
                    {rating.overall}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}