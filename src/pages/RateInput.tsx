import React, { useState, useEffect } from 'react';
import { ParticipationFlow } from '@/components/ParticipationFlow';
import { ScheduledBookingBanner } from '@/components/ScheduledBookingBanner';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Wifi, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  console.log('RateInputPage: Component starting to render');
  const [currentTarget, setCurrentTarget] = useState<string | null>(null);
  const [participantCount, setParticipantCount] = useState(0);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true); // Force refresh
  const [hasCompletedRegistration, setHasCompletedRegistration] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has completed registration
    const registrationCompleted = sessionStorage.getItem('leadCompleted');
    if (!registrationCompleted) {
      // Redirect to registration if not completed
      navigate('/register');
      return;
    }
    setHasCompletedRegistration(true);

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

    toast({
      title: "Rating Submitted! ⭐",
      description: "Your vote has been cast! You can vote again with different ratings.",
    });
  };

  // Don't render anything if registration not completed (will redirect)
  if (!hasCompletedRegistration) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-lg">
        {/* Scheduled Booking Banner */}
        <ScheduledBookingBanner />
        
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-neon-purple to-neon-pink bg-clip-text text-transparent mb-2">
            Conference Participation
          </h1>
          
          {/* Privacy Notice */}
          <div className="flex items-center justify-center gap-1 mb-4">
            <AlertCircle className="w-3 h-3 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              Votes are anonymous • Live chat is not
            </p>
          </div>
          
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

        {/* Main Content */}
        <Card className="border border-neon-purple/20 bg-card/50 backdrop-blur">
          <CardContent className="p-4">
            {currentTarget ? (
              <ParticipationFlow onSubmitRating={handleSubmitRating} currentTarget={currentTarget} />
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-4 border-2 border-neon-orange border-dashed rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-neon-orange rounded-full animate-pulse" />
                </div>
                <h3 className="text-lg font-semibold text-neon-orange mb-2">Waiting for Session</h3>
                <p className="text-sm text-muted-foreground">
                  The conference session will begin shortly. You'll be able to participate once a resume is being reviewed.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RateInputPage;