import React, { useState, useEffect } from 'react';
import { LiveDisplay } from '@/components/LiveDisplay';
import { TargetManager } from '@/components/TargetManager';
import { FloatingReactions } from '@/components/FloatingReactions';
import { supabase } from '@/integrations/supabase/client';

interface Rating {
  id: string;
  target_person: string;
  overall: number;
  presentation: number;
  content: number;
  feedback?: string;
  category: 'resume' | 'linkedin';
  agreement?: 'agree' | 'disagree' | null;
  reaction?: string;
  created_at: string;
}

const LiveDisplayPage = () => {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [currentTarget, setCurrentTarget] = useState<string | null>(null);

  useEffect(() => {
    console.log('LiveDisplayPage: Setting up subscriptions and fetching data');
    
    // Fetch initial data
    const fetchInitialData = async () => {
      // Get current target
      const { data: targetData } = await supabase
        .from('current_target')
        .select('target_person')
        .eq('id', 1)
        .single();
      
      console.log('LiveDisplayPage: Initial target fetched:', targetData?.target_person);
      setCurrentTarget(targetData?.target_person || null);

      // Get ratings for current target (only real ratings, not quick reactions)
      if (targetData?.target_person) {
        const { data: ratingsData } = await supabase
          .from('ratings')
          .select('*')
          .eq('target_person', targetData.target_person)
          .not('overall', 'is', null)
          .order('created_at', { ascending: false });
        
        console.log('LiveDisplayPage: Initial ratings fetched:', ratingsData?.length || 0);
        setRatings((ratingsData || []) as Rating[]);
      }
    };

    fetchInitialData();

    // Subscribe to target changes
    const targetChannel = supabase
      .channel('target-changes-display')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'current_target'
        },
        async (payload) => {
          const newTarget = payload.new.target_person;
          console.log('LiveDisplayPage: Target changed to:', newTarget);
          setCurrentTarget(newTarget);
          
          // Fetch ratings for new target (only real ratings)
          if (newTarget) {
            const { data: ratingsData } = await supabase
              .from('ratings')
              .select('*')
              .eq('target_person', newTarget)
              .not('overall', 'is', null)
              .order('created_at', { ascending: false });
            
            console.log('LiveDisplayPage: New ratings fetched for target:', ratingsData?.length || 0);
            setRatings((ratingsData || []) as Rating[]);
          } else {
            setRatings([]);
          }
        }
      )
      .subscribe((status) => {
        console.log('LiveDisplayPage: Target subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('LiveDisplayPage: Successfully subscribed to target updates!');
        }
      });

    // Subscribe to new ratings
    const ratingsChannel = supabase
      .channel('ratings-changes-display')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ratings'
        },
        (payload) => {
          const newRating = payload.new as Rating;
          console.log('LiveDisplayPage: New rating received:', newRating);
          // Only add if it's for the current target AND it's a real rating (not a quick reaction)
          if (newRating.target_person === currentTarget && newRating.overall !== null && newRating.overall > 0) {
            console.log('LiveDisplayPage: Adding rating to display');
            setRatings(prev => [newRating, ...prev]);
          }
        }
      )
      .subscribe((status) => {
        console.log('LiveDisplayPage: Ratings subscription status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('LiveDisplayPage: Successfully subscribed to rating updates!');
        }
      });

    return () => {
      console.log('LiveDisplayPage: Cleaning up subscriptions');
      supabase.removeChannel(targetChannel);
      supabase.removeChannel(ratingsChannel);
    };
  }, [currentTarget]);

  // Transform ratings to match the LiveDisplay component's expected format
  const transformedRatings = ratings.map(rating => ({
    id: rating.id,
    overall: rating.overall,
    presentation: rating.presentation,
    content: rating.content,
    feedback: rating.feedback,
    category: rating.category,
    agreement: rating.agreement,
    reaction: rating.reaction,
    timestamp: rating.created_at
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="max-w-7xl mx-auto">
        <TargetManager 
          currentTarget={currentTarget}
          onTargetChange={setCurrentTarget}
        />
        <LiveDisplay ratings={transformedRatings} />
        {/* Global floating reactions - work regardless of target */}
        <FloatingReactions currentTarget={null} />
      </div>
    </div>
  );
};

export default LiveDisplayPage;