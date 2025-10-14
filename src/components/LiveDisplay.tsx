import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StarRating } from './StarRating';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';

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
  const [isResultsHidden, setIsResultsHidden] = useState(false);
  
  console.log('LiveDisplay: Received ratings:', ratings.length, ratings);

  useEffect(() => {
    // Fetch initial display settings
    const fetchDisplaySettings = async () => {
      const { data } = await supabase
        .from('display_settings')
        .select('results_hidden')
        .eq('id', 1)
        .single();
      
      if (data) {
        setIsResultsHidden(data.results_hidden);
      }
    };

    fetchDisplaySettings();

    // Subscribe to display settings changes
    const settingsChannel = supabase
      .channel('live-display-settings')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'display_settings'
        },
        (payload) => {
          setIsResultsHidden(payload.new.results_hidden);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(settingsChannel);
    };
  }, []);
  
  useEffect(() => {
    console.log('LiveDisplay: Ratings prop changed:', ratings.length, ratings);
    
    // If ratings is empty, clear displayed ratings immediately
    if (ratings.length === 0) {
      console.log('LiveDisplay: Clearing displayed ratings due to empty ratings prop');
      setDisplayedRatings([]);
      setCurrentFeedback('');
      return;
    }
    
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
      <div className="text-center mb-2">
        <h1 className="text-2xl font-bold text-foreground mb-1">
          🚀 RESUME RATINGS LIVE 🚀
        </h1>
        <p className="text-sm text-muted-foreground mb-2">feedback tool for resumes, live!</p>
        <div className="flex justify-center items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 text-white">
            <Users className="w-4 h-4" />
            <span className="text-base font-semibold">{displayedRatings.filter(r => r.overall > 0).length} Live Votes</span>
          </div>
          
          {agreementStats.total > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-white">
                <ThumbsUp className="w-4 h-4" />
                <span className="font-semibold">{agreementStats.agree}</span>
              </div>
              <div className="flex items-center gap-1 text-destructive">
                <ThumbsDown className="w-4 h-4" />
                <span className="font-semibold">{agreementStats.disagree}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Section - Show/Hide based on settings */}
      {!isResultsHidden && (
        <div className="flex-shrink-0">
          <div className="flex justify-center mb-2">
            {/* Single Score Card */}
            <Card className="glow-effect transition-all duration-500 max-w-sm w-full">
              <CardHeader className="pb-1 pt-3 text-center">
                <CardTitle className="flex items-center justify-center gap-2 text-white text-sm">
                  <TrendingUp className="w-4 h-4" />
                  SCORE
                </CardTitle>
                <div className="text-xs text-muted-foreground">({resumeRatings.length} votes)</div>
              </CardHeader>
              <CardContent className="pb-3 pt-2">
                <div className="text-center space-y-2">
                  <div className="text-4xl font-bold text-white">
                    {allStats.average.toFixed(1)}
                  </div>
                  <div className="flex justify-center items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFilled = Math.round(allStats.average) >= star;
                      return (
                        <Star
                          key={star}
                          fill={isFilled ? "currentColor" : "none"}
                          className={`w-5 h-5 transition-all duration-300 ${
                            isFilled 
                              ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" 
                              : "text-muted-foreground/40"
                          }`}
                        />
                      );
                    })}
                  </div>
                  <div className="text-xs text-muted-foreground/70 font-medium">
                    OUT OF 5 STARS
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Current Feedback Box */}
          {currentFeedback && (
            <Card className="mb-2 rating-glow border-primary">
              <CardContent className="p-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary flex-shrink-0" />
                  <div className="text-sm font-medium text-foreground">
                    "{currentFeedback}"
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Hidden Results Message */}
      {isResultsHidden && (
        <div className="flex-1 flex items-center justify-center">
          <Card className="border-muted bg-muted/10">
            <CardContent className="p-8 text-center">
              <div className="text-4xl mb-4">🙈</div>
              <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                Results Hidden
              </h3>
              <p className="text-muted-foreground">
                Results are currently hidden by the host
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}