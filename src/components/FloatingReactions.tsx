import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FloatingReaction {
  id: string;
  emoji: string;
  x: number;
  y: number;
  timestamp: number;
}

interface FloatingReactionsProps {
  currentTarget: string | null;
}

export function FloatingReactions({ currentTarget }: FloatingReactionsProps) {
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);
  const processedReactions = useRef<Set<string>>(new Set());
  
  // Debug: Log current state
  console.log('FloatingReactions component rendered, reactions count:', floatingReactions.length);

  const addFloatingReaction = (emoji: string, timestamp: string) => {
    const reactionId = `${emoji}-${timestamp}-${Math.random()}`;
    console.log('Adding floating reaction:', { emoji, timestamp, reactionId });
    
    // Prevent duplicates
    if (processedReactions.current.has(reactionId)) {
      console.log('Duplicate reaction prevented:', reactionId);
      return;
    }
    
    processedReactions.current.add(reactionId);
    
    const newFloatingReaction: FloatingReaction = {
      id: reactionId,
      emoji: emoji,
      x: Math.random() * 70 + 15, // Random position between 15% and 85%
      y: Math.random() * 50 + 25, // Random position between 25% and 75%
      timestamp: Date.now()
    };

    console.log('New floating reaction created:', newFloatingReaction);
    setFloatingReactions(prev => [...prev, newFloatingReaction]);

    // Remove the reaction after 4 seconds
    setTimeout(() => {
      setFloatingReactions(prev => prev.filter(fr => fr.id !== reactionId));
    }, 3000);
  };

  useEffect(() => {
    console.log('FloatingReactions: Setting up global floating reactions subscription');

    // Subscribe to ALL rating inserts and filter in code for better debugging
    const channel = supabase
      .channel('floating-reactions-all')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ratings'
        },
        (payload) => {
          const newRating = payload.new;
          console.log('FloatingReactions: Received ANY rating insert:', newRating);
          
          // Process global quick reactions (ratings with GLOBAL_REACTIONS target and null overall)
          if (newRating.reaction && newRating.target_person === 'GLOBAL_REACTIONS' && newRating.overall === null) {
            console.log('FloatingReactions: Processing global reaction:', newRating.reaction);
            addFloatingReaction(newRating.reaction, newRating.created_at);
          } else {
            console.log('FloatingReactions: Not a global quick reaction, ignoring:', {
              reaction: newRating.reaction,
              target: newRating.target_person,
              overall: newRating.overall,
              isGlobalTarget: newRating.target_person === 'GLOBAL_REACTIONS',
              hasReaction: !!newRating.reaction,
              hasNullOverall: newRating.overall === null
            });
          }
        }
      )
      .subscribe();

    console.log('FloatingReactions: Subscription created for all ratings');

    return () => {
      console.log('FloatingReactions: Cleaning up subscription');
      supabase.removeChannel(channel);
    };
  }, []); // No dependencies - global reactions work regardless of target

  console.log('FloatingReactions: Rendering with reactions:', floatingReactions);

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      <div className="absolute top-4 left-4 bg-black/50 text-white p-2 rounded text-sm z-50">
        Debug: {floatingReactions.length} reactions
      </div>
      {floatingReactions.map((reaction) => (
        <div
          key={reaction.id}
          className="absolute animate-float-up pointer-events-none bg-red-500/20 border border-red-500"
          style={{
            left: `${reaction.x}%`,
            top: `${reaction.y}%`,
            animationDuration: '4s',
            animationTimingFunction: 'ease-out'
          }}
        >
          <div className="text-8xl filter drop-shadow-2xl animate-pulse-scale bg-blue-500/20 border border-blue-500">
            {reaction.emoji}
          </div>
        </div>
      ))}
    </div>
  );
}