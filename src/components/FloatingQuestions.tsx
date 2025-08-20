import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare, ThumbsUp } from 'lucide-react';

interface FloatingQuestion {
  id: string;
  question: string;
  author_name: string | null;
  upvotes: number;
  x: number;
  y: number;
  timestamp: number;
}

interface FloatingQuestionsProps {
  currentTarget: string | null;
}

export function FloatingQuestions({ currentTarget }: FloatingQuestionsProps) {
  const [floatingQuestions, setFloatingQuestions] = useState<FloatingQuestion[]>([]);
  const processedQuestions = useRef<Set<string>>(new Set());

  const addFloatingQuestion = (question: string, author_name: string | null, upvotes: number, questionId: string) => {
    console.log('FloatingQuestions: Adding question:', { question, author_name, upvotes, questionId });
    
    // Prevent duplicates
    if (processedQuestions.current.has(questionId)) {
      console.log('FloatingQuestions: Duplicate prevented');
      return;
    }
    
    processedQuestions.current.add(questionId);
    
    const newFloatingQuestion: FloatingQuestion = {
      id: questionId,
      question: question,
      author_name: author_name,
      upvotes: upvotes,
      x: Math.random() * 50 + 25, // Random position between 25% and 75%
      y: Math.random() * 40 + 20, // Random position between 20% and 60%
      timestamp: Date.now()
    };

    console.log('FloatingQuestions: New question created:', newFloatingQuestion);
    setFloatingQuestions(prev => [...prev, newFloatingQuestion]);

    // Remove the question after 12 seconds (longer than chat for readability)
    setTimeout(() => {
      console.log('FloatingQuestions: Removing question:', questionId);
      setFloatingQuestions(prev => prev.filter(fq => fq.id !== questionId));
      processedQuestions.current.delete(questionId);
    }, 12000);
  };

  useEffect(() => {
    if (!currentTarget) {
      setFloatingQuestions([]);
      processedQuestions.current.clear();
      return;
    }

    console.log('FloatingQuestions: Setting up subscription for questions');
    
    const channel = supabase
      .channel('floating-questions')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'questions'
        },
        (payload) => {
          const newQuestion = payload.new;
          console.log('FloatingQuestions: Received question insert:', newQuestion);
          
          // Only show questions for current target
          if (newQuestion.target_person === currentTarget) {
            console.log('FloatingQuestions: Processing question:', newQuestion.question);
            addFloatingQuestion(
              newQuestion.question, 
              newQuestion.author_name, 
              newQuestion.upvotes || 0, 
              newQuestion.id
            );
          } else {
            console.log('FloatingQuestions: Not for current target, ignoring');
          }
        }
      )
      .subscribe((status) => {
        console.log('FloatingQuestions: Subscription status:', status);
      });

    console.log('FloatingQuestions: Subscription created');

    return () => {
      console.log('FloatingQuestions: Cleaning up subscription');
      supabase.removeChannel(channel);
    };
  }, [currentTarget]);

  return (
    <div className="fixed inset-0 pointer-events-none z-20 overflow-hidden">
      {floatingQuestions.map((floatingQuestion) => (
        <div
          key={floatingQuestion.id}
          className="absolute animate-float-up pointer-events-none"
          style={{
            left: `${floatingQuestion.x}%`,
            top: `${floatingQuestion.y}%`,
            animationDuration: '12s',
            animationTimingFunction: 'ease-out'
          }}
        >
          <div className="bg-gradient-to-r from-neon-blue/95 to-neon-purple/95 backdrop-blur-sm text-white px-6 py-4 rounded-2xl shadow-2xl border-2 border-neon-blue/50 max-w-sm">
            {/* Question Header */}
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-5 h-5 text-neon-cyan flex-shrink-0" />
              <span className="text-sm font-medium text-neon-cyan">Question</span>
              {floatingQuestion.upvotes > 0 && (
                <div className="flex items-center gap-1 ml-auto bg-white/20 px-2 py-1 rounded-full">
                  <ThumbsUp className="w-3 h-3" />
                  <span className="text-xs font-bold">{floatingQuestion.upvotes}</span>
                </div>
              )}
            </div>
            
            {/* Question Content */}
            <div className="text-base font-semibold break-words leading-relaxed mb-2">
              {floatingQuestion.question}
            </div>
            
            {/* Author */}
            {floatingQuestion.author_name && (
              <div className="text-xs text-white/80 italic">
                — {floatingQuestion.author_name}
              </div>
            )}
            
            {/* Question bubble tail */}
            <div className="absolute -bottom-2 left-6 w-4 h-4 bg-gradient-to-r from-neon-blue/95 to-neon-purple/95 rotate-45 border-r-2 border-b-2 border-neon-blue/50"></div>
          </div>
        </div>
      ))}
    </div>
  );
}