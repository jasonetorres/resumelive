import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Send } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface QuickQuestionInputProps {
  currentTarget: string | null;
}

export function QuickQuestionInput({ currentTarget }: QuickQuestionInputProps) {
  const [question, setQuestion] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleSubmitQuestion = async () => {
    if (!question.trim() || !currentTarget) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('questions')
        .insert({
          target_person: currentTarget,
          question: question.trim(),
          author_name: authorName.trim() || null
        });

      if (error) throw error;

      setQuestion('');
      setAuthorName('');
      toast({
        title: "Question Sent! 📝",
        description: "Your question will appear on the conference display!"
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

  if (!currentTarget) {
    return (
      <Card className="border border-neon-orange/20 bg-neon-orange/5 glow-effect">
        <CardContent className="text-center py-6">
          <MessageSquare className="w-8 h-8 mx-auto mb-3 text-neon-orange" />
          <h3 className="text-lg font-semibold text-neon-orange mb-2">
            Questions Coming Soon
          </h3>
          <p className="text-sm text-muted-foreground">
            You can ask questions when a presenter is active.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glow-effect border-neon-blue/30 bg-card/90 backdrop-blur">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg bg-gradient-to-r from-neon-blue to-neon-cyan bg-clip-text text-transparent flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-neon-blue" />
          Ask a Question
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Your question will appear live on the conference display!
        </p>
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
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="bg-input/50 border-neon-blue/30 focus:border-neon-blue resize-none"
            rows={isMobile ? 2 : 3}
            maxLength={200}
          />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">
            {200 - question.length} characters left
          </span>
          <Button
            onClick={handleSubmitQuestion}
            disabled={!question.trim() || isSubmitting}
            className="bg-gradient-to-r from-neon-blue to-neon-cyan hover:from-neon-cyan hover:to-neon-blue text-primary-foreground font-medium"
            size={isMobile ? "sm" : "default"}
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Question
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}