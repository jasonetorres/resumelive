import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, ThumbsUp, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Question {
  id: string;
  question: string;
  author_name: string | null;
  upvotes: number;
  created_at: string;
  is_answered: boolean;
  target_person: string;
}

interface QuestionsSectionProps {
  currentTarget: string | null;
  showControls?: boolean;
}

export function QuestionsSection({ currentTarget, showControls = false }: QuestionsSectionProps) {
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    if (!currentTarget) {
      setQuestions([]);
      return;
    }

    // Fetch initial questions
    const fetchQuestions = async () => {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('target_person', currentTarget)
        .order('upvotes', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setQuestions(data);
      }
    };

    fetchQuestions();

    // Subscribe to real-time updates - use a unique channel name with timestamp
    const channel = supabase
      .channel(`questions-display-${currentTarget.replace(/[^a-zA-Z0-9]/g, '')}-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'questions',
          filter: `target_person=eq.${currentTarget}`
        },
        (payload) => {
          console.log('QuestionsSection: New question added:', payload);
          const newQuestion = payload.new as Question;
          setQuestions(prev => [newQuestion, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'questions'
        },
        (payload) => {
          console.log('QuestionsSection: Question deleted from display:', payload);
          const deletedQuestion = payload.old as Question;
          setQuestions(prev => prev.filter(q => q.id !== deletedQuestion.id));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'questions',
          filter: `target_person=eq.${currentTarget}`
        },
        (payload) => {
          const updatedQuestion = payload.new as Question;
          setQuestions(prev => prev.map(q => q.id === updatedQuestion.id ? updatedQuestion : q));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentTarget]);

  const markAsAnswered = async (questionId: string) => {
    // Delete the question instead of just marking as answered
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', questionId);
    
    if (!error) {
      setQuestions(prev => prev.filter(q => q.id !== questionId));
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  if (!currentTarget) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        Select a target to view questions
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-neon-cyan" />
          Questions ({questions.length})
        </h3>
        <Badge variant="outline" className="text-xs">Live Q&A</Badge>
      </div>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {questions.length === 0 ? (
          <div className="text-center p-4 text-muted-foreground">
            No questions yet
          </div>
        ) : (
          questions.map((question) => (
            <Card key={question.id} className={`p-3 ${question.is_answered ? 'bg-green-50 border-green-200' : ''}`}>
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium flex-1">{question.question}</p>
                  {showControls && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => markAsAnswered(question.id)}
                      className="text-xs"
                    >
                      Answered
                    </Button>
                  )}
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-3">
                    {question.author_name && (
                      <span>by {question.author_name}</span>
                    )}
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(question.created_at)}
                    </div>
                  </div>
                  
                  {question.upvotes > 0 && (
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" />
                      <span>{question.upvotes}</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}