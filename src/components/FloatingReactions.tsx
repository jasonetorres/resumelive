import React, { useState, useEffect } from 'react';

interface FloatingReaction {
  id: string;
  emoji: string;
  x: number;
  y: number;
  timestamp: number;
}

interface FloatingReactionsProps {
  reactions: { emoji: string; timestamp: string }[];
}

export function FloatingReactions({ reactions }: FloatingReactionsProps) {
  const [floatingReactions, setFloatingReactions] = useState<FloatingReaction[]>([]);

  useEffect(() => {
    // Add new reactions as floating elements
    reactions.forEach(reaction => {
      const reactionId = `${reaction.emoji}-${reaction.timestamp}`;
      
      // Check if we already added this reaction
      if (!floatingReactions.find(fr => fr.id === reactionId)) {
        const newFloatingReaction: FloatingReaction = {
          id: reactionId,
          emoji: reaction.emoji,
          x: Math.random() * 80 + 10, // Random position between 10% and 90%
          y: Math.random() * 60 + 20, // Random position between 20% and 80%
          timestamp: Date.now()
        };

        setFloatingReactions(prev => [...prev, newFloatingReaction]);

        // Remove the reaction after 4 seconds
        setTimeout(() => {
          setFloatingReactions(prev => prev.filter(fr => fr.id !== reactionId));
        }, 4000);
      }
    });
  }, [reactions]);

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {floatingReactions.map((reaction) => (
        <div
          key={reaction.id}
          className="absolute animate-float-up"
          style={{
            left: `${reaction.x}%`,
            top: `${reaction.y}%`,
            animationDuration: '4s',
            animationTimingFunction: 'ease-out'
          }}
        >
          <div className="text-6xl filter drop-shadow-lg animate-pulse-scale">
            {reaction.emoji}
          </div>
        </div>
      ))}
    </div>
  );
}