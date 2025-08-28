import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StarRating } from './StarRating';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

import { TrendingUp, Users, MessageSquare, Star, Sparkles, ThumbsUp, ThumbsDown } from 'lucide-react';

interface Rating {
  id: string;
  overall: number;
  presentation: number;
  content: number;
  feedback?: string;
  category: 'resume' | 'linkedin';
  agreement?: 'agree' | 'disagree' | null;
  reaction?: string;
  timestamp: string;
}

interface LiveDisplayProps {
  ratings: Rating[];
}

export function LiveDisplay({ ratings }: LiveDisplayProps) {
  const [displayedRatings, setDisplayedRatings] = useState<Rating[]>([]);
  const [currentFeedback, setCurrentFeedback] = useState<string>('');
  
  console.log('LiveDisplay: Received ratings:', ratings.length, ratings);
  
  useEffect(() => {
    // Add new ratings with animation
    const newRatings = ratings.filter(
      rating => !displayedRatings.find(dr => dr.id === rating.id)
    );
    
    console.log('LiveDisplay: New ratings to display:', newRatings.length, newRatings);
    
    if (newRatings.length > 0) {
      console.log('LiveDisplay: Adding new ratings to displayed list');
      setDisplayedRatings(prev => [...newRatings, ...prev].slice(0, 50));
      
      // Show feedback if available
      const latestWithFeedback = newRatings.find(r => r.feedback);
      if (latestWithFeedback?.feedback) {
        setCurrentFeedback(latestWithFeedback.feedback);
        setTimeout(() => setCurrentFeedback(''), 10000); // Clear after 10 seconds
      }
    }
  }, [ratings]);

  const calculateStats = (ratings: Rating[]) => {
    // Filter out quick reactions (ratings with overall = 0)
    const realRatings = ratings.filter(r => r.overall > 0);
    if (realRatings.length === 0) return { average: 0, resumeQuality: 0, layout: 0, content: 0 };
    
    const sum = realRatings.reduce((acc, r) => ({
      overall: acc.overall + r.overall,
      resumeQuality: acc.resumeQuality + r.presentation, // Map presentation to resumeQuality
      layout: acc.layout + (r.content || 0), // Use content field for layout since we don't have separate field
      content: acc.content + r.content
    }), { overall: 0, resumeQuality: 0, layout: 0, content: 0 });
    
    return {
      average: sum.overall / realRatings.length,
      resumeQuality: sum.resumeQuality / realRatings.length,
      layout: sum.layout / realRatings.length,
      content: sum.content / realRatings.length
    };
  };

  // Only show resume ratings now (remove LinkedIn)
  const resumeRatings = displayedRatings.filter(r => r.overall !== null);
  const allStats = calculateStats(displayedRatings.filter(r => r.overall > 0));

  // Calculate agreement stats
  const realRatingsWithAgreement = displayedRatings.filter(r => r.overall > 0);
  const agreementStats = {
    total: realRatingsWithAgreement.filter(r => r.agreement).length,
    agree: realRatingsWithAgreement.filter(r => r.agreement === 'agree').length,
    disagree: realRatingsWithAgreement.filter(r => r.agreement === 'disagree').length
  };

  return (
    <div className="h-full bg-gradient-to-br from-background via-background to-background/80 p-2 relative overflow-hidden flex flex-col">
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-neon-purple via-neon-pink to-neon-orange bg-clip-text text-transparent mb-2">
          🚀 RESUME RATINGS LIVE 🚀
        </h1>
        <p className="text-base text-muted-foreground mb-3">feedback tool for resumes, live!</p>
        <div className="flex justify-center items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2 text-neon-cyan">
            <Users className="w-5 h-5" />
            <span className="text-lg font-semibold">{displayedRatings.filter(r => r.overall > 0).length} Live Votes</span>
          </div>
          
          {agreementStats.total > 0 && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-neon-green">
                <ThumbsUp className="w-4 h-4" />
                <span className="font-semibold">{agreementStats.agree}</span>
              </div>
              <div className="flex items-center gap-2 text-destructive">
                <ThumbsDown className="w-4 h-4" />
                <span className="font-semibold">{agreementStats.disagree}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Section - Always Visible */}
      <div className="flex-1 overflow-hidden">
        <div className="flex justify-center mb-3 flex-shrink-0">
          {/* Single Score Card */}
          <Card className="glow-effect border-neon-purple/50 transition-all duration-500 max-w-md w-full">
            <CardHeader className="pb-2 text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-neon-purple text-base">
                <TrendingUp className="w-4 h-4" />
                SCORE
              </CardTitle>
              <div className="text-xs text-muted-foreground">({resumeRatings.length} votes)</div>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="text-center space-y-3">
                <div className="text-4xl font-bold text-neon-orange">
                  {allStats.average.toFixed(1)}
                </div>
                <div>
                  <StarRating value={Math.round(allStats.average)} readonly size="md" />
                </div>
                
                {/* Category Breakdown */}
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-center">
                      <div className="text-neon-cyan font-bold text-base">
                        {allStats.resumeQuality.toFixed(1)}
                      </div>
                      <div className="text-muted-foreground">Presentation</div>
                    </div>
                    <div className="text-center">
                      <div className="text-neon-green font-bold text-base">
                        {allStats.content.toFixed(1)}
                      </div>
                      <div className="text-muted-foreground">Content</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Feedback Box */}
        {currentFeedback && (
          <Card className="mb-4 rating-glow border-neon-pink">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-neon-pink flex-shrink-0" />
                <div className="text-sm font-medium text-foreground">
                  "{currentFeedback}"
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}