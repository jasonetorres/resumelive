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

  // Calculate agreement stats
  const agreementStats = {
    total: displayedRatings.filter(r => r.agreement).length,
    agree: displayedRatings.filter(r => r.agreement === 'agree').length,
    disagree: displayedRatings.filter(r => r.agreement === 'disagree').length
  };

  const handleReveal = () => {
    if (!isRevealed) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
    setIsRevealed(!isRevealed);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80 p-6 relative overflow-hidden">
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
            <span className="text-lg font-semibold">{displayedRatings.length} Anonymous Votes</span>
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
            } hover:scale-105 transition-all duration-300 ${
              !isRevealed ? 'animate-pulse' : ''
            }`}
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

      {/* Results Section */}
      <div className={`transition-all duration-700 transform ${
        isRevealed ? 'opacity-100 translate-y-0 scale-100' : 'opacity-30 translate-y-4 scale-95 pointer-events-none'
      }`}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Overall Stats */}
          <Card className={`glow-effect border-neon-purple/50 transition-all duration-500 ${
            isRevealed ? 'animate-scale-in' : ''
          }`}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-neon-purple">
                <TrendingUp className="w-5 h-5" />
                Overall Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className={`text-5xl font-bold text-neon-orange transition-all duration-700 ${
                  isRevealed ? 'animate-fade-in' : 'blur-sm'
                }`}>
                  {isRevealed ? allStats.average.toFixed(1) : '?'}
                </div>
                <div className={`transition-all duration-700 delay-100 ${
                  isRevealed ? 'animate-fade-in' : 'blur-sm opacity-50'
                }`}>
                  <StarRating value={isRevealed ? Math.round(allStats.average) : 0} readonly size="lg" />
                </div>
                <div className={`space-y-2 transition-all duration-700 delay-200 ${
                  isRevealed ? 'animate-fade-in' : 'blur-sm opacity-30'
                }`}>
                  <div className="flex justify-between text-sm">
                    <span>Presentation</span>
                    <span className="text-neon-cyan">
                      {isRevealed ? allStats.presentation.toFixed(1) : '?'}
                    </span>
                  </div>
                  <Progress value={isRevealed ? allStats.presentation * 20 : 0} className="h-2" />
                  <div className="flex justify-between text-sm">
                    <span>Content</span>
                    <span className="text-neon-green">
                      {isRevealed ? allStats.content.toFixed(1) : '?'}
                    </span>
                  </div>
                  <Progress value={isRevealed ? allStats.content * 20 : 0} className="h-2" />
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

        {/* Recent Ratings Stream */}
        {displayedRatings.length > 0 && (
          <Card className={`mt-6 border-neon-pink/30 transition-all duration-700 delay-300 ${
            isRevealed ? 'animate-fade-in' : 'opacity-30'
          }`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-neon-pink">
                <Star className="w-5 h-5" />
                Recent Ratings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-h-40 overflow-y-auto">
                {displayedRatings.slice(0, 20).map((rating, index) => (
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
                      className={rating.category === 'resume' ? 'border-neon-purple/50' : 'border-neon-cyan/50'}
                    >
                      {rating.category}
                    </Badge>
                    <StarRating value={isRevealed ? rating.overall : 0} readonly size="sm" />
                    <span className="text-sm font-semibold text-neon-orange">
                      {isRevealed ? rating.overall : '?'}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Unrevealed State Message */}
      {!isRevealed && displayedRatings.length > 0 && (
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