import React, { useState, useEffect } from 'react';
import { RatingInput } from '@/components/RatingInput';
import { LeadForm } from '@/components/LeadForm';
import { PersonalResumeUploader } from '@/components/PersonalResumeUploader';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Wifi, CheckCircle, Upload, Star } from 'lucide-react';

interface RatingData {
  overall: number;
  presentation: number;
  content: number;
  feedback?: string;
  category: 'resume' | 'linkedin';
  agreement?: 'agree' | 'disagree';
  reaction?: string;
}

const RateInputPage = () => {
  const [currentTarget, setCurrentTarget] = useState<string | null>(null);
  const [participantCount, setParticipantCount] = useState(0);
  const [currentStep, setCurrentStep] = useState<'lead' | 'rating' | 'upload' | 'complete'>('lead');
  const [hasSubmittedLead, setHasSubmittedLead] = useState(false);
  const [hasSubmittedRating, setHasSubmittedRating] = useState(false);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user has already submitted lead data in this session
    const leadData = sessionStorage.getItem('leadData');
    if (leadData) {
      setHasSubmittedLead(true);
      setCurrentStep('rating');
    }
  }, []);

  useEffect(() => {
    // Fetch current target
    const fetchCurrentTarget = async () => {
      console.log('RateInputPage: Fetching current target...');
      const { data } = await (supabase as any)
        .from('current_target')
        .select('target_person')
        .eq('id', 1)
        .maybeSingle();
      
      console.log('RateInputPage: Current target fetched:', data?.target_person);
      setCurrentTarget(data?.target_person || null);
      setIsLoading(false);
    };

    fetchCurrentTarget();

    console.log('RateInputPage: Setting up target subscription...');
    // Subscribe to target changes
    const channel = supabase
      .channel('target-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'current_target'
        },
        (payload) => {
          console.log('RateInputPage: Target changed via subscription:', payload.new.target_person);
          setCurrentTarget(payload.new.target_person);
          
          // Show toast notification when target changes
          if (payload.new.target_person) {
            toast({
              title: "New Target Set! 🎯",
              description: `Now rating: ${payload.new.target_person}`,
            });
          } else {
            toast({
              title: "Target Cleared",
              description: "No target is currently set",
            });
          }
        }
      )
      .subscribe();

    console.log('RateInputPage: Subscription created');

    return () => {
      console.log('RateInputPage: Cleaning up subscription');
      supabase.removeChannel(channel);
    };
  }, []);

  // Separate effect for presence tracking
  useEffect(() => {
    if (!currentTarget) {
      setParticipantCount(0);
      return;
    }

    // Create a channel for presence tracking
    const presenceChannel = supabase.channel(`presence-rating-${currentTarget}`, {
      config: {
        presence: {
          key: `user-${Date.now()}-${Math.random()}`,
        },
      },
    });

    // Track our presence
    const trackPresence = async () => {
      await presenceChannel.track({
        user_id: `anonymous-${Date.now()}`,
        online_at: new Date().toISOString(),
        page: 'rating',
        target: currentTarget,
      });
    };

    // Listen for presence changes
    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = presenceChannel.presenceState();
        const count = Object.keys(presenceState).length;
        setParticipantCount(count);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await trackPresence();
        }
      });

    return () => {
      supabase.removeChannel(presenceChannel);
    };
  }, [currentTarget]);

  const handleSubmitLead = () => {
    setHasSubmittedLead(true);
    setCurrentStep('rating');
    toast({
      title: "Contact Info Saved! ✅",
      description: "You can now rate the current resume",
    });
  };

  const handleSubmitRating = async (rating: RatingData) => {
    if (!currentTarget) {
      toast({
        title: "No Target Set",
        description: "Please wait for a target to be set before submitting ratings.",
        variant: "destructive",
      });
      throw new Error('No target set');
    }

    const { error } = await (supabase as any)
      .from('ratings')
      .insert({
        target_person: currentTarget,
        overall: rating.overall,
        presentation: rating.presentation,
        content: rating.content,
        feedback: rating.feedback,
        category: rating.category,
        agreement: rating.agreement,
        reaction: rating.reaction,
      });

    if (error) {
      console.error('Error submitting rating:', error);
      throw error;
    }

    setHasSubmittedRating(true);
    // DON'T change step - keep user on rating form to vote again
    toast({
      title: "Rating Submitted! ⭐",
      description: "Your vote has been cast! You can vote again with different ratings.",
    });
  };

  const handleCompleteFlow = () => {
    setCurrentStep('complete');
    toast({
      title: "All Done! 🎉",
      description: "Thank you for participating in the conference!",
    });
  };

  const renderStepIndicator = () => {
    const steps = [
      { key: 'lead', label: 'Contact Info', icon: Users },
      { key: 'rating', label: 'Rate Resume', icon: Star },
      { key: 'upload', label: 'Upload Resume', icon: Upload },
      { key: 'complete', label: 'Complete', icon: CheckCircle }
    ];

    return (
      <div className="flex justify-center mb-6">
        <div className="flex items-center gap-2 bg-card/50 rounded-full p-2 border border-border/50">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.key;
            const isCompleted = 
              (step.key === 'lead' && hasSubmittedLead) ||
              (step.key === 'rating' && hasSubmittedRating) ||
              (step.key === 'upload' && currentStep === 'complete') ||
              (step.key === 'complete' && currentStep === 'complete');
            
            return (
              <div
                key={step.key}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs transition-all ${
                  isActive
                    ? 'bg-neon-purple text-primary-foreground'
                    : isCompleted
                    ? 'bg-neon-green text-primary-foreground'
                    : 'text-muted-foreground'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span className="hidden sm:inline">{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-neon-purple to-neon-pink bg-clip-text text-transparent mb-2">
            Conference Participation
          </h1>
          
          {/* Live Status Indicators */}
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            <Badge variant="outline" className="border-neon-green text-neon-green bg-neon-green/10 flex items-center gap-1 text-xs">
              <Wifi className="w-3 h-3" />
              Live
            </Badge>
            {currentTarget && participantCount > 0 && (
              <Badge variant="outline" className="border-neon-cyan text-neon-cyan bg-neon-cyan/10 flex items-center gap-1 text-xs">
                <Users className="w-3 h-3" />
                {participantCount} participant{participantCount !== 1 ? 's' : ''}
              </Badge>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-neon-purple border-t-transparent rounded-full animate-spin" />
              <p className="text-muted-foreground text-sm">Loading...</p>
            </div>
          ) : currentTarget ? (
            <div>
              <p className="text-muted-foreground mb-2 text-sm sm:text-base">
                Currently reviewing
              </p>
              <p className="text-lg sm:text-xl font-bold text-neon-green px-2 break-words">
                {currentTarget}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-muted-foreground mb-2 text-sm sm:text-base">
                No session active...
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <div className="w-2 h-2 bg-neon-orange rounded-full animate-pulse" />
                Waiting for conference to begin
              </div>
            </div>
          )}
        </div>

        {renderStepIndicator()}

        {/* Step Content */}
        <Card className="border border-neon-purple/20 bg-card/50 backdrop-blur">
          <CardContent className="p-4">
            {currentStep === 'lead' && (
              <div>
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-neon-purple mb-1">Contact Information</h3>
                  <p className="text-sm text-muted-foreground">
                    Please provide your contact details to participate
                  </p>
                </div>
                <LeadForm onSuccess={handleSubmitLead} />
              </div>
            )}

            {currentStep === 'rating' && currentTarget && (
              <div>
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-neon-purple mb-1">Rate the Resume</h3>
                  <p className="text-sm text-muted-foreground">
                    Share your feedback on <span className="font-medium text-neon-green">{currentTarget}</span>
                  </p>
                </div>
                <RatingInput onSubmit={handleSubmitRating} currentTarget={currentTarget} />
              </div>
            )}

            {currentStep === 'rating' && !currentTarget && (
              <div>
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-neon-orange mb-1">No Active Session</h3>
                  <p className="text-sm text-muted-foreground">
                    There's no resume being reviewed right now, but you can still upload your resume!
                  </p>
                </div>
                <Button 
                  onClick={() => setCurrentStep('upload')}
                  className="w-full bg-neon-purple hover:bg-neon-purple/90"
                >
                  Continue to Upload Resume
                </Button>
              </div>
            )}

            {currentStep === 'upload' && (
              <div>
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-neon-purple mb-1">Upload Your Resume</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload your resume to be considered for future reviews
                  </p>
                </div>
                <PersonalResumeUploader onUploadSuccess={handleCompleteFlow} />
                <div className="mt-3 text-center">
                  <Button 
                    variant="outline" 
                    onClick={handleCompleteFlow}
                    className="border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10"
                  >
                    Finish Without Upload
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 'complete' && (
              <div className="text-center py-6">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-neon-green" />
                <h3 className="text-xl font-bold text-neon-green mb-2">Thank You!</h3>
                <p className="text-muted-foreground mb-4">
                  You've successfully participated in the conference resume review session.
                </p>
                <div className="space-y-2 text-sm">
                  {hasSubmittedLead && (
                    <div className="flex items-center justify-center gap-2 text-neon-green">
                      <CheckCircle className="w-4 h-4" />
                      Contact information saved
                    </div>
                  )}
                  {hasSubmittedRating && (
                    <div className="flex items-center justify-center gap-2 text-neon-green">
                      <CheckCircle className="w-4 h-4" />
                      Rating submitted
                    </div>
                  )}
                  <div className="flex items-center justify-center gap-2 text-neon-cyan">
                    <CheckCircle className="w-4 h-4" />
                    Session completed
                  </div>
                </div>
                <Button 
                  className="mt-6 bg-neon-purple hover:bg-neon-purple/90"
                  onClick={() => {
                    setCurrentStep('lead');
                    setHasSubmittedLead(false);
                    setHasSubmittedRating(false);
                  }}
                >
                  Start New Session
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RateInputPage;