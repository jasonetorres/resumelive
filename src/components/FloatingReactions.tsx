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

  const addFloatingReaction = (emoji: string, timestamp: string) => {
    const reactionId = `${emoji}-${timestamp}-${Math.random()}`;
    
    // Prevent duplicates
    if (processedReactions.current.has(reactionId)) {
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

    setFloatingReactions(prev => [...prev, newFloatingReaction]);

    // Remove the reaction after 4 seconds
    setTimeout(() => {
      setFloatingReactions(prev => prev.filter(fr => fr.id !== reactionId));
    }, 3000);
  };

  useEffect(() => {
    if (!currentTarget) return;

    // Subscribe to real-time rating inserts with reactions
    const channel = supabase
      .channel('floating-reactions')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ratings',
          filter: `target_person=eq.${currentTarget}`
        },
        (payload) => {
          const newRating = payload.new;
          // Only process quick reactions (ratings with null overall values)
          if (newRating.reaction && newRating.target_person === currentTarget && newRating.overall === null) {
            console.log('Real-time reaction received:', newRating.reaction);
            addFloatingReaction(newRating.reaction, newRating.created_at);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentTarget]);

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {floatingReactions.map((reaction) => (
        <div
          key={reaction.id}
          className="absolute animate-float-up pointer-events-none"
          style={{
            left: `${reaction.x}%`,
            top: `${reaction.y}%`,
            animationDuration: '4s',
            animationTimingFunction: 'ease-out'
          }}
        >
          <div className="text-8xl filter drop-shadow-2xl animate-pulse-scale">
            {reaction.emoji}
          </div>
        </div>
      ))}
    </div>
  );
}