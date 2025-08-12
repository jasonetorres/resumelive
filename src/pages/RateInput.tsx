import React, { useState, useEffect } from 'react';
import { RatingInput } from '@/components/RatingInput';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Users, Wifi } from 'lucide-react';

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
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch current target
    const fetchCurrentTarget = async () => {
      console.log('RateInputPage: Fetching current target...');
      const { data } = await (supabase as any)
        .from('current_target')
        .select('target_person')
        .eq('id', 1)
        .single();
      
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-sm sm:max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-neon-purple to-neon-pink bg-clip-text text-transparent mb-2">
            User Vote
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
                {participantCount} rating{participantCount !== 1 ? 's' : ''}
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
                Rate the content for
              </p>
              <p className="text-lg sm:text-2xl font-bold text-neon-green px-2 break-words">
                {currentTarget}
              </p>
              <div className="mt-2 text-xs text-muted-foreground bg-neon-green/10 px-2 py-1 rounded mx-auto inline-block">
                ✅ Updates automatically
              </div>
            </div>
          ) : (
            <div>
              <p className="text-muted-foreground mb-2 text-sm sm:text-base">
                Waiting for target to be set...
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <div className="w-2 h-2 bg-neon-orange rounded-full animate-pulse" />
                Listening for updates
              </div>
            </div>
          )}
        </div>
        <RatingInput onSubmit={handleSubmitRating} currentTarget={currentTarget} />
      </div>
    </div>
  );
};

export default RateInputPage;