import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

    // Remove the question after 15 seconds
    setTimeout(() => {
      console.log('FloatingQuestions: Removing question:', questionId);
      setFloatingQuestions(prev => prev.filter(fq => fq.id !== questionId));
      processedQuestions.current.delete(questionId);
    }, 15000);
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
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20 w-full max-w-2xl px-4 space-y-3 pointer-events-none flex flex-col items-start">
      {floatingQuestions.map((floatingQuestion) => (
        <div
          key={floatingQuestion.id}
          className="bg-primary/95 text-primary-foreground rounded-2xl rounded-bl-sm px-5 py-4 shadow-xl animate-fade-in pointer-events-auto w-full max-w-xl"
        >
          <p className="text-base mb-1 break-words">{floatingQuestion.question}</p>
          {floatingQuestion.author_name && (
            <p className="text-sm opacity-80 mt-2">— {floatingQuestion.author_name}</p>
          )}
        </div>
      ))}
    </div>
  );
}