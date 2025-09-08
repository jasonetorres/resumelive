import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { validateQuestion } from '@/utils/validation';
import { ContentModerator } from '@/utils/contentModerator';
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

  console.log('QuickQuestionInput: Component rendered with currentTarget:', currentTarget);

  // Get user's first name from session storage and populate author name
  React.useEffect(() => {
    console.log('QuickQuestionInput: Component MOUNTED');
    
    // Get the user's first name from session storage
    const leadData = sessionStorage.getItem('leadData');
    if (leadData) {
      try {
        const parsedLeadData = JSON.parse(leadData);
        if (parsedLeadData.firstName) {
          setAuthorName(parsedLeadData.firstName);
        }
      } catch (error) {
        console.error('Error parsing lead data:', error);
      }
    }
    
    return () => console.log('QuickQuestionInput: Component UNMOUNTED');
  }, []);

  const handleSubmitQuestion = async () => {
    console.log('QuickQuestionInput: handleSubmitQuestion called', { question: question.trim(), currentTarget });
    
    if (!question.trim() || !currentTarget) {
      console.log('QuickQuestionInput: Validation failed', { hasQuestion: !!question.trim(), hasTarget: !!currentTarget });
      return;
    }

    // Validate question content
    const questionValidation = validateQuestion(question);
    if (!questionValidation.isValid) {
      toast({
        title: "Question not allowed",
        description: questionValidation.reason,
        variant: "destructive"
      });
      await ContentModerator.logModerationAction(
        'question_validation_failed',
        question,
        'question',
        questionValidation.reason || 'Question validation failed',
        { severity: questionValidation.severity }
      );
      return;
    }

    // Moderate the question content
    const moderation = ContentModerator.moderateText(question);
    if (moderation.flags.includes('blocked')) {
      toast({
        title: "Question blocked",
        description: "Your question contains inappropriate content and cannot be submitted.",
        variant: "destructive"
      });
      await ContentModerator.logModerationAction(
        'question_blocked',
        question,
        'question',
        'Question blocked due to inappropriate content',
        { flags: moderation.flags, severity: moderation.severity }
      );
      return;
    }

    console.log('QuickQuestionInput: Starting submission...');
    setIsSubmitting(true);
    
    try {
      console.log('QuickQuestionInput: Inserting question into database...');
      const { error } = await supabase
        .from('questions')
        .insert({
          target_person: currentTarget,
          question: moderation.filtered,
          author_name: authorName.trim() || null,
          moderation_status: moderation.wasModerated ? 'pending' : 'approved'
        });

      if (error) {
        console.error('QuickQuestionInput: Database error:', error);
        throw error;
      }

      console.log('QuickQuestionInput: Question submitted successfully!');
      
      // Log the action
      await ContentModerator.logModerationAction(
        'question_submission_success',
        'question',
        'question',
        'Question successfully submitted',
        { 
          question: moderation.filtered,
          wasModerated: moderation.wasModerated,
          flags: moderation.flags
        }
      );

      setQuestion('');
      // Keep the author name so they don't have to re-enter it for subsequent questions
      toast({
        title: "Question Sent! 📝",
        description: "Your question will appear on the conference display!"
      });
    } catch (error) {
      console.error('QuickQuestionInput: Error submitting question:', error);
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
            readOnly={!!authorName}
            disabled={!!authorName}
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
            onClick={() => {
              console.log('QuickQuestionInput: Button clicked');
              handleSubmitQuestion();
            }}
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