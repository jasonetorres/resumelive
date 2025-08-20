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

  console.log('FloatingQuestions: Component rendered with currentTarget:', currentTarget, 'Questions count:', floatingQuestions.length);

  // Add this to ensure we can see the component is mounting
  React.useEffect(() => {
    console.log('FloatingQuestions: Component MOUNTED');
    return () => console.log('FloatingQuestions: Component UNMOUNTED');
  }, []);

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

    // Remove the question after 30 seconds (longer for better readability)
    setTimeout(() => {
      console.log('FloatingQuestions: Removing question:', questionId);
      setFloatingQuestions(prev => prev.filter(fq => fq.id !== questionId));
      processedQuestions.current.delete(questionId);
    }, 30000);
  };

  useEffect(() => {
    if (!currentTarget) {
      console.log('FloatingQuestions: No current target, clearing questions');
      setFloatingQuestions([]);
      processedQuestions.current.clear();
      return;
    }

    console.log('FloatingQuestions: Setting up subscription for questions, target:', currentTarget);
    
    const channel = supabase
      .channel('floating-questions-channel')
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
            console.log('FloatingQuestions: Processing question for current target:', newQuestion.question);
            addFloatingQuestion(
              newQuestion.question, 
              newQuestion.author_name, 
              newQuestion.upvotes || 0, 
              newQuestion.id
            );
          } else {
            console.log('FloatingQuestions: Question for different target, ignoring. Expected:', currentTarget, 'Got:', newQuestion.target_person);
          }
        }
      )
      .subscribe((status) => {
        console.log('FloatingQuestions: Subscription status:', status);
      });

    console.log('FloatingQuestions: Subscription created for target:', currentTarget);

    return () => {
      console.log('FloatingQuestions: Cleaning up subscription for target:', currentTarget);
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
            animationDuration: '30s',
            animationTimingFunction: 'linear'
          }}
        >
          <div className="backdrop-blur-sm text-white px-12 py-8 rounded-3xl shadow-2xl border-4 max-w-2xl" style={{ backgroundColor: '#0044ff', borderColor: '#0044ff' }}>
            {/* Question Header */}
            <div className="flex items-center gap-4 mb-4">
              <MessageSquare className="w-10 h-10 text-neon-cyan flex-shrink-0" />
              <span className="text-2xl font-bold text-neon-cyan">Question</span>
              {floatingQuestion.upvotes > 0 && (
                <div className="flex items-center gap-2 ml-auto bg-white/20 px-4 py-2 rounded-full">
                  <ThumbsUp className="w-6 h-6" />
                  <span className="text-xl font-bold">{floatingQuestion.upvotes}</span>
                </div>
              )}
            </div>
            
            {/* Question Content */}
            <div className="text-3xl font-bold break-words leading-relaxed mb-4">
              {floatingQuestion.question}
            </div>
            
            {/* Author */}
            {floatingQuestion.author_name && (
              <div className="text-lg text-white/80 italic">
                — {floatingQuestion.author_name}
              </div>
            )}
            
            {/* Question bubble tail */}
            <div className="absolute -bottom-4 left-12 w-8 h-8 rotate-45 border-r-4 border-b-4" style={{ backgroundColor: '#0044ff', borderColor: '#0044ff' }}></div>
          </div>
        </div>
      ))}
    </div>
  );
}