import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StarRating } from './StarRating';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

import { TrendingUp, Users, MessageSquare, Star, Eye, EyeOff, Sparkles, ThumbsUp, ThumbsDown } from 'lucide-react';

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
  const [isRevealed, setIsRevealed] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
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

  const calculateStats = (ratings: Rating[]) => {
    // Filter out quick reactions (ratings with overall = 0)
    const realRatings = ratings.filter(r => r.overall > 0);
    if (realRatings.length === 0) return { average: 0, presentation: 0, content: 0 };
    
    const sum = realRatings.reduce((acc, r) => ({
      overall: acc.overall + r.overall,
      presentation: acc.presentation + r.presentation,
      content: acc.content + r.content
    }), { overall: 0, presentation: 0, content: 0 });
    
    return {
      average: sum.overall / realRatings.length,
      presentation: sum.presentation / realRatings.length,
      content: sum.content / realRatings.length
    };
  };

  const resumeRatings = displayedRatings.filter(r => r.category === 'resume' && r.overall !== null);
  const linkedinRatings = displayedRatings.filter(r => r.category === 'linkedin' && r.overall !== null);
  const allStats = calculateStats(displayedRatings.filter(r => r.overall > 0));
  const resumeStats = calculateStats(resumeRatings);
  const linkedinStats = calculateStats(linkedinRatings);

  // Calculate agreement stats
  const realRatingsWithAgreement = displayedRatings.filter(r => r.overall > 0);
  const agreementStats = {
    total: realRatingsWithAgreement.filter(r => r.agreement).length,
    agree: realRatingsWithAgreement.filter(r => r.agreement === 'agree').length,
    disagree: realRatingsWithAgreement.filter(r => r.agreement === 'disagree').length
  };

  const handleReveal = () => {
    if (!isRevealed) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
    setIsRevealed(!isRevealed);
  };

  return (
    <div className="h-full bg-gradient-to-br from-background via-background to-background/80 p-4 relative overflow-hidden flex flex-col">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-50">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            >
              <div 
                className={`w-2 h-2 ${
                  ['bg-neon-purple', 'bg-neon-pink', 'bg-neon-cyan', 'bg-neon-orange', 'bg-neon-green'][Math.floor(Math.random() * 5)]
                } rounded-full`}
              />
            </div>
          ))}
        </div>
      )}
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-neon-purple via-neon-pink to-neon-orange bg-clip-text text-transparent mb-4">
          🚀 LIVE RATINGS 🚀
        </h1>
        <div className="flex justify-center items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2 text-neon-cyan">
            <Users className="w-5 h-5" />
            <span className="text-lg font-semibold">{displayedRatings.filter(r => r.overall > 0).length} Anonymous Votes</span>
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
          
          <Button
            onClick={handleReveal}
            variant="outline"
            size="lg"
            className={`${
              isRevealed 
                ? 'bg-neon-purple/20 border-neon-purple text-neon-purple' 
                : 'bg-neon-orange/20 border-neon-orange text-neon-orange'
            } hover:scale-105 transition-all duration-300`}
          >
            {isRevealed ? (
              <>
                <EyeOff className="w-5 h-5 mr-2" />
                Hide Results
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Reveal Results
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Results Section */}
      <div className={`flex-1 transition-all duration-700 transform overflow-hidden ${
        isRevealed ? 'opacity-100 translate-y-0 scale-100' : 'opacity-30 translate-y-4 scale-95 pointer-events-none'
      }`}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4 flex-shrink-0">
          {/* Overall Stats */}
          <Card className={`glow-effect border-neon-purple/50 transition-all duration-500 ${
            isRevealed ? 'animate-scale-in' : ''
            }`}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-neon-purple text-sm">
                <TrendingUp className="w-4 h-4" />
                Overall Score
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="text-center space-y-2">
                <div className={`text-3xl font-bold text-neon-orange transition-all duration-700 ${
                  isRevealed ? 'animate-fade-in' : 'blur-sm'
                }`}>
                  {isRevealed ? allStats.average.toFixed(1) : '?'}
                </div>
                <div className={`transition-all duration-700 delay-100 ${
                  isRevealed ? 'animate-fade-in' : 'blur-sm opacity-50'
                }`}>
                  <StarRating value={isRevealed ? Math.round(allStats.average) : 0} readonly size="sm" />
                </div>
                <div className={`space-y-1 text-xs transition-all duration-700 delay-200 ${
                  isRevealed ? 'animate-fade-in' : 'blur-sm opacity-30'
                }`}>
                  <div className="flex justify-between text-xs">
                    <span>Presentation</span>
                    <span className="text-neon-cyan">
                      {isRevealed ? allStats.presentation.toFixed(1) : '?'}
                    </span>
                  </div>
                  <Progress value={isRevealed ? allStats.presentation * 20 : 0} className="h-1" />
                  <div className="flex justify-between text-xs">
                    <span>Content</span>
                    <span className="text-neon-green">
                      {isRevealed ? allStats.content.toFixed(1) : '?'}
                    </span>
                  </div>
                  <Progress value={isRevealed ? allStats.content * 20 : 0} className="h-1" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Resume Stats */}
          <Card className={`glow-effect border-neon-purple/50 transition-all duration-500 delay-100 ${
            isRevealed ? 'animate-scale-in' : ''
          }`}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Badge className="bg-neon-purple text-primary-foreground">Resume</Badge>
                <span className="text-sm text-muted-foreground">({resumeRatings.length} votes)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className={`text-4xl font-bold text-neon-purple transition-all duration-700 delay-300 ${
                  isRevealed ? 'animate-fade-in' : 'blur-sm'
                }`}>
                  {isRevealed ? resumeStats.average.toFixed(1) : '?'}
                </div>
                <div className={`transition-all duration-700 delay-400 ${
                  isRevealed ? 'animate-fade-in' : 'blur-sm opacity-50'
                }`}>
                  <StarRating value={isRevealed ? Math.round(resumeStats.average) : 0} readonly />
                </div>
                <div className={`grid grid-cols-2 gap-2 text-sm transition-all duration-700 delay-500 ${
                  isRevealed ? 'animate-fade-in' : 'blur-sm opacity-30'
                }`}>
                  <div className="text-center">
                    <div className="text-neon-cyan font-semibold">
                      {isRevealed ? resumeStats.presentation.toFixed(1) : '?'}
                    </div>
                    <div className="text-muted-foreground">Presentation</div>
                  </div>
                  <div className="text-center">
                    <div className="text-neon-green font-semibold">
                      {isRevealed ? resumeStats.content.toFixed(1) : '?'}
                    </div>
                    <div className="text-muted-foreground">Content</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* LinkedIn Stats */}
          <Card className={`glow-effect border-neon-cyan/50 transition-all duration-500 delay-200 ${
            isRevealed ? 'animate-scale-in' : ''
          }`}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Badge className="bg-neon-cyan text-primary-foreground">LinkedIn</Badge>
                <span className="text-sm text-muted-foreground">({linkedinRatings.length} votes)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className={`text-4xl font-bold text-neon-cyan transition-all duration-700 delay-600 ${
                  isRevealed ? 'animate-fade-in' : 'blur-sm'
                }`}>
                  {isRevealed ? linkedinStats.average.toFixed(1) : '?'}
                </div>
                <div className={`transition-all duration-700 delay-700 ${
                  isRevealed ? 'animate-fade-in' : 'blur-sm opacity-50'
                }`}>
                  <StarRating value={isRevealed ? Math.round(linkedinStats.average) : 0} readonly />
                </div>
                <div className={`grid grid-cols-2 gap-2 text-sm transition-all duration-700 delay-800 ${
                  isRevealed ? 'animate-fade-in' : 'blur-sm opacity-30'
                }`}>
                  <div className="text-center">
                    <div className="text-neon-cyan font-semibold">
                      {isRevealed ? linkedinStats.presentation.toFixed(1) : '?'}
                    </div>
                    <div className="text-muted-foreground">Presentation</div>
                  </div>
                  <div className="text-center">
                    <div className="text-neon-green font-semibold">
                      {isRevealed ? linkedinStats.content.toFixed(1) : '?'}
                    </div>
                    <div className="text-muted-foreground">Content</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Feedback Box - spans full width under score boxes */}
        {currentFeedback && (
          <Card className={`mb-4 rating-glow border-neon-pink transition-all duration-700 delay-400 ${
            isRevealed ? 'animate-fade-in' : 'opacity-30'
          }`}>
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

        {/* Recent Ratings Stream - Compact */}
        {displayedRatings.filter(r => r.overall > 0).length > 0 && (
          <div className={`flex-1 min-h-0 transition-all duration-700 delay-300 ${
            isRevealed ? 'animate-fade-in' : 'opacity-30'
          }`}>
            <h3 className="text-sm font-semibold text-neon-pink mb-2 flex items-center gap-1">
              <Star className="w-4 h-4" />
              Recent Ratings
            </h3>
            <div className="grid grid-cols-2 gap-2 h-full overflow-hidden">
              {displayedRatings.filter(r => r.overall > 0).slice(0, 12).map((rating, index) => (
                <div
                  key={rating.id}
                  className={`flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-border/50 transition-all duration-500 ${
                    isRevealed ? 'animate-fade-in opacity-100' : 'blur-sm opacity-30'
                  }`}
                  style={{ 
                    animationDelay: isRevealed ? `${800 + index * 50}ms` : '0ms' 
                  }}
                >
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${rating.category === 'resume' ? 'border-neon-purple/50' : 'border-neon-cyan/50'}`}
                  >
                    {rating.category === 'resume' ? 'R' : 'L'}
                  </Badge>
                  <StarRating value={isRevealed ? rating.overall : 0} readonly size="sm" />
                  <span className="text-xs font-semibold text-neon-orange">
                    {isRevealed ? rating.overall : '?'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Unrevealed State Message */}
      {!isRevealed && displayedRatings.filter(r => r.overall > 0).length > 0 && (
        <div className="text-center mt-8">
          <Card className="border-neon-orange/30 bg-neon-orange/5 max-w-md mx-auto">
            <CardContent className="p-6">
              <Eye className="w-12 h-12 text-neon-orange mx-auto mb-3" />
              <h3 className="text-xl font-bold text-neon-orange mb-2">Results Hidden</h3>
              <p className="text-muted-foreground">
                Click "Reveal Results" when you're ready to show the ratings!
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}