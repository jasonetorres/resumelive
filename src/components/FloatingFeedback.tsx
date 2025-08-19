import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FloatingFeedbackMessage {
  id: string;
  feedback: string;
  category: string;
  x: number;
  y: number;
  timestamp: number;
}

interface FloatingFeedbackProps {
  currentTarget: string | null;
}

export function FloatingFeedback({ currentTarget }: FloatingFeedbackProps) {
  const [floatingFeedback, setFloatingFeedback] = useState<FloatingFeedbackMessage[]>([]);
  const processedFeedback = useRef<Set<string>>(new Set());

  const addFloatingFeedback = (feedback: string, category: string, feedbackId: string) => {
    console.log('FloatingFeedback: Adding feedback:', { feedback, category, feedbackId });
    
    // Prevent duplicates
    if (processedFeedback.current.has(feedbackId)) {
      console.log('FloatingFeedback: Duplicate prevented');
      return;
    }
    
    processedFeedback.current.add(feedbackId);
    
    const newFloatingFeedback: FloatingFeedbackMessage = {
      id: feedbackId,
      feedback: feedback,
      category: category,
      x: Math.random() * 50 + 25, // Random position between 25% and 75%
      y: Math.random() * 50 + 25, // Random position between 25% and 75%
      timestamp: Date.now()
    };

    console.log('FloatingFeedback: New feedback created:', newFloatingFeedback);
    setFloatingFeedback(prev => [...prev, newFloatingFeedback]);

    // Remove the feedback after 10 seconds
    setTimeout(() => {
      console.log('FloatingFeedback: Removing feedback:', feedbackId);
      setFloatingFeedback(prev => prev.filter(ff => ff.id !== feedbackId));
      processedFeedback.current.delete(feedbackId);
    }, 10000);
  };

  useEffect(() => {
    if (!currentTarget) {
      setFloatingFeedback([]);
      processedFeedback.current.clear();
      return;
    }

    console.log('FloatingFeedback: Setting up subscription for feedback');
    
    const channel = supabase
      .channel('floating-feedback-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ratings'
        },
        (payload) => {
          const newRating = payload.new;
          console.log('FloatingFeedback: Received rating insert:', newRating);
          
          // Only show feedback for current target that has actual feedback text
          if (newRating.target_person === currentTarget && newRating.feedback && newRating.feedback.trim().length > 0) {
            console.log('FloatingFeedback: Processing feedback:', newRating.feedback);
            addFloatingFeedback(newRating.feedback, newRating.category, newRating.id);
          } else {
            console.log('FloatingFeedback: No feedback or not for current target, ignoring');
          }
        }
      )
      .subscribe((status) => {
        console.log('FloatingFeedback: Subscription status:', status);
      });

    console.log('FloatingFeedback: Subscription created');

    return () => {
      console.log('FloatingFeedback: Cleaning up subscription');
      supabase.removeChannel(channel);
    };
  }, [currentTarget]);

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {floatingFeedback.map((feedbackMessage) => (
        <div
          key={feedbackMessage.id}
          className="absolute animate-fade-in pointer-events-none"
          style={{
            left: `${feedbackMessage.x}%`,
            top: `${feedbackMessage.y}%`,
            animationDuration: '10s',
            animationTimingFunction: 'ease-out'
          }}
        >
          <div className="bg-gradient-to-r from-neon-purple/95 to-neon-pink/95 backdrop-blur-sm text-white px-6 py-4 rounded-2xl shadow-2xl border-2 border-neon-purple/50 max-w-sm">
            <div className="text-sm font-bold text-neon-cyan mb-1 uppercase tracking-wide">
              {feedbackMessage.category} Feedback
            </div>
            <div className="text-base font-medium break-words leading-relaxed">
              "{feedbackMessage.feedback}"
            </div>
            {/* Feedback bubble tail */}
            <div className="absolute -bottom-2 left-6 w-4 h-4 bg-gradient-to-r from-neon-purple/95 to-neon-pink/95 rotate-45 border-r-2 border-b-2 border-neon-purple/50"></div>
          </div>
        </div>
      ))}
    </div>
  );
}