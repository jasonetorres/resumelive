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
    // Fetch initial data
    const fetchInitialData = async () => {
      // Get current target
      const { data: targetData } = await (supabase as any)
        .from('current_target')
        .select('target_person')
        .eq('id', 1)
        .maybeSingle();
      
      setCurrentTarget(targetData?.target_person || null);

      // Get ratings for current target
      if (targetData?.target_person) {
        const { data: ratingsData } = await (supabase as any)
          .from('ratings')
          .select('*')
          .eq('target_person', targetData.target_person)
          .order('created_at', { ascending: false });
        
        setRatings((ratingsData || []) as Rating[]);
      }
    };

    fetchInitialData();

    // Subscribe to target changes
    const targetChannel = supabase
      .channel('target-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'current_target'
        },
        async (payload) => {
          const newTarget = payload.new.target_person;
          setCurrentTarget(newTarget);
          
          // Fetch ratings for new target
          if (newTarget) {
            const { data: ratingsData } = await (supabase as any)
              .from('ratings')
              .select('*')
              .eq('target_person', newTarget)
              .order('created_at', { ascending: false });
            
            setRatings((ratingsData || []) as Rating[]);
          } else {
            setRatings([]);
          }
        }
      )
      .subscribe();

    // Subscribe to new ratings
    const ratingsChannel = supabase
      .channel('ratings-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ratings'
        },
        (payload) => {
          const newRating = payload.new as Rating;
          // Only add if it's for the current target
          if (newRating.target_person === currentTarget) {
            setRatings(prev => [newRating, ...prev]);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'ratings'
        },
        (payload) => {
          const deletedRating = payload.old as Rating;
          // Remove from current ratings if it was for current target
          if (deletedRating.target_person === currentTarget) {
            setRatings(prev => prev.filter(r => r.id !== deletedRating.id));
          }
        }
      )
      .subscribe();

    return () => {
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
        {/* Direct floating reactions with current target */}
        <FloatingReactions currentTarget={currentTarget} />
      </div>
    </div>
  );
};

export default LiveDisplayPage;