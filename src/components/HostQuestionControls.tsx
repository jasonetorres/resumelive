import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, ThumbsUp, Clock, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Question {
  id: string;
  question: string;
  author_name: string | null;
  upvotes: number;
  created_at: string;
  is_answered: boolean;
  target_person: string;
}

interface HostQuestionControlsProps {
  currentTarget: string | null;
}

export function HostQuestionControls({ currentTarget }: HostQuestionControlsProps) {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isResultsHidden, setIsResultsHidden] = useState(false);

  useEffect(() => {
    // Fetch initial display settings
    const fetchDisplaySettings = async () => {
      const { data } = await supabase
        .from('display_settings')
        .select('results_hidden')
        .eq('id', 1)
        .single();
      
      if (data) {
        setIsResultsHidden(data.results_hidden);
      }
    };

    fetchDisplaySettings();

    // Subscribe to display settings changes
    const settingsChannel = supabase
      .channel('display-settings-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'display_settings'
        },
        (payload) => {
          setIsResultsHidden(payload.new.results_hidden);
        }
      )
      .subscribe();

    if (!currentTarget) {
      setQuestions([]);
      return () => {
        supabase.removeChannel(settingsChannel);
      };
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

    // Subscribe to real-time updates
    const channel = supabase
      .channel('host-questions-section')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'questions'
        },
        (payload) => {
          const newQuestion = payload.new as Question;
          if (newQuestion.target_person === currentTarget) {
            setQuestions(prev => [newQuestion, ...prev]);
          }
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
          const deletedQuestion = payload.old as Question;
          setQuestions(prev => prev.filter(q => q.id !== deletedQuestion.id));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(settingsChannel);
    };
  }, [currentTarget]);

  const toggleResultsVisibility = async () => {
    const newHiddenState = !isResultsHidden;
    
    const { error } = await supabase
      .from('display_settings')
      .update({ results_hidden: newHiddenState })
      .eq('id', 1);
    
    if (!error) {
      setIsResultsHidden(newHiddenState);
      toast({
        title: newHiddenState ? "Results Hidden! 🙈" : "Results Shown! 👁️",
        description: newHiddenState ? "Results are now hidden from display" : "Results are now visible on display",
      });
    }
  };

  const markAsAnswered = async (questionId: string) => {
    console.log('HostQuestionControls: Marking question as answered:', questionId);
    
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', questionId);
    
    if (!error) {
      setQuestions(prev => prev.filter(q => q.id !== questionId));
      toast({
        title: "Question Answered! ✅",
        description: "Question removed from display",
      });
    } else {
      console.error('Error deleting question:', error);
      toast({
        title: "Error",
        description: "Failed to remove question",
        variant: "destructive",
      });
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
        Select a target to manage questions
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Results Visibility Control */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-neon-cyan" />
            Question Management ({questions.length})
          </h3>
        </div>
        <Button
          onClick={toggleResultsVisibility}
          variant={isResultsHidden ? "default" : "outline"}
          size="sm"
        >
          {isResultsHidden ? (
            <>
              <Eye className="w-4 h-4 mr-2" />
              Show Results
            </>
          ) : (
            <>
              <EyeOff className="w-4 h-4 mr-2" />
              Hide Results
            </>
          )}
        </Button>
      </div>
      
      {/* Questions List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {questions.length === 0 ? (
          <div className="text-center p-4 text-muted-foreground">
            No questions yet
          </div>
        ) : (
          questions.map((question) => (
            <Card key={question.id} className="p-3">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium flex-1">{question.question}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => markAsAnswered(question.id)}
                    className="text-xs bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                  >
                    Answered
                  </Button>
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