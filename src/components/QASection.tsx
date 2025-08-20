import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, ThumbsUp, Send, Clock, CheckCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface Question {
  id: string;
  question: string;
  author_name: string | null;
  created_at: string;
  upvotes: number;
  is_answered: boolean;
  user_has_upvoted?: boolean;
}

interface QASectionProps {
  currentTarget: string | null;
}

export function QASection({ currentTarget }: QASectionProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Generate a unique user ID for this session
  const [userId] = useState(() => `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    if (!currentTarget) {
      setQuestions([]);
      return;
    }

    fetchQuestions();

    // Subscribe to new questions
    const questionsChannel = supabase
      .channel('questions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'questions',
          filter: `target_person=eq.${currentTarget}`
        },
        () => {
          fetchQuestions();
        }
      )
      .subscribe();

    // Subscribe to upvote changes
    const upvotesChannel = supabase
      .channel('upvotes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'question_upvotes'
        },
        () => {
          fetchQuestions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(questionsChannel);
      supabase.removeChannel(upvotesChannel);
    };
  }, [currentTarget]);

  const fetchQuestions = async () => {
    if (!currentTarget) return;

    try {
      // Fetch questions with upvote counts
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        .select('*')
        .eq('target_person', currentTarget)
        .order('upvotes', { ascending: false })
        .order('created_at', { ascending: false });

      if (questionsError) throw questionsError;

      // Fetch user's upvotes
      const { data: userUpvotes, error: upvotesError } = await supabase
        .from('question_upvotes')
        .select('question_id')
        .eq('user_id', userId);

      if (upvotesError) throw upvotesError;

      const userUpvoteIds = new Set(userUpvotes?.map(uv => uv.question_id) || []);
      setUserVotes(userUpvoteIds);

      const questionsWithVotes = (questionsData || []).map(q => ({
        ...q,
        user_has_upvoted: userUpvoteIds.has(q.id)
      }));

      setQuestions(questionsWithVotes);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const handleSubmitQuestion = async () => {
    if (!newQuestion.trim() || !currentTarget) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('questions')
        .insert({
          target_person: currentTarget,
          question: newQuestion.trim(),
          author_name: authorName.trim() || null
        });

      if (error) throw error;

      setNewQuestion('');
      setAuthorName('');
      toast({
        title: "Question Submitted! 📝",
        description: "Your question has been added to the Q&A queue."
      });
    } catch (error) {
      console.error('Error submitting question:', error);
      toast({
        title: "Submission Failed",
        description: "Please try again!",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpvote = async (questionId: string, currentlyUpvoted: boolean) => {
    try {
      if (currentlyUpvoted) {
        // Remove upvote
        const { error } = await supabase
          .from('question_upvotes')
          .delete()
          .eq('question_id', questionId)
          .eq('user_id', userId);

        if (error) throw error;

        // Update local upvote count
        await supabase
          .from('questions')
          .update({ upvotes: questions.find(q => q.id === questionId)!.upvotes - 1 })
          .eq('id', questionId);
      } else {
        // Add upvote
        const { error } = await supabase
          .from('question_upvotes')
          .insert({
            question_id: questionId,
            user_id: userId
          });

        if (error) throw error;

        // Update local upvote count
        await supabase
          .from('questions')
          .update({ upvotes: questions.find(q => q.id === questionId)!.upvotes + 1 })
          .eq('id', questionId);
      }
    } catch (error) {
      console.error('Error handling upvote:', error);
      toast({
        title: "Upvote Failed",
        description: "Please try again!",
        variant: "destructive"
      });
    }
  };

  if (!currentTarget) {
    return (
      <Card className="border border-neon-orange/20 bg-neon-orange/5 glow-effect">
        <CardContent className="text-center py-6">
          <MessageSquare className="w-8 h-8 mx-auto mb-3 text-neon-orange" />
          <h3 className="text-lg font-semibold text-neon-orange mb-2">
            Q&A Coming Soon
          </h3>
          <p className="text-sm text-muted-foreground">
            Questions and answers will be available when a presenter is active.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Submit Question */}
      <Card className="glow-effect border-neon-blue/30 bg-card/90 backdrop-blur">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg bg-gradient-to-r from-neon-blue to-neon-cyan bg-clip-text text-transparent flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-neon-blue" />
            Ask a Question
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3">
            <Input
              placeholder="Your name (optional)"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="bg-input/50 border-neon-blue/30 focus:border-neon-blue"
              maxLength={50}
            />
            <Textarea
              placeholder="What would you like to ask this presenter?"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              className="bg-input/50 border-neon-blue/30 focus:border-neon-blue resize-none"
              rows={isMobile ? 2 : 3}
              maxLength={500}
            />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">
              {500 - newQuestion.length} characters left
            </span>
            <Button
              onClick={handleSubmitQuestion}
              disabled={!newQuestion.trim() || isSubmitting}
              className="bg-gradient-to-r from-neon-blue to-neon-cyan hover:from-neon-cyan hover:to-neon-blue text-primary-foreground font-medium"
              size={isMobile ? "sm" : "default"}
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Ask
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      {questions.length > 0 && (
        <Card className="glow-effect border-neon-purple/30 bg-card/90 backdrop-blur">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-neon-purple flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Questions ({questions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {questions.map((question) => (
              <div key={question.id} className="p-3 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground mb-2 break-words">
                      {question.question}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {question.author_name && (
                        <Badge variant="outline" className="text-xs">
                          {question.author_name}
                        </Badge>
                      )}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {new Date(question.created_at).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                      {question.is_answered && (
                        <Badge className="text-xs bg-neon-green/20 text-neon-green border-neon-green/50">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Answered
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleUpvote(question.id, question.user_has_upvoted || false)}
                    className={`flex items-center gap-1 px-2 py-1 h-auto ${
                      question.user_has_upvoted 
                        ? 'text-neon-blue bg-neon-blue/20 hover:bg-neon-blue/30' 
                        : 'text-muted-foreground hover:text-neon-blue hover:bg-neon-blue/20'
                    }`}
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span className="text-xs font-medium">{question.upvotes}</span>
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}