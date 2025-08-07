import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { StarRating } from './StarRating';
import { Badge } from '@/components/ui/badge';
import { Send, Zap, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RatingInputProps {
  onSubmit: (rating: { 
    overall: number; 
    presentation: number; 
    content: number; 
    feedback?: string;
    category: 'resume' | 'linkedin';
    agreement?: 'agree' | 'disagree';
  }) => Promise<void>;
}

export function RatingInput({ onSubmit }: RatingInputProps) {
  const [overall, setOverall] = useState(0);
  const [presentation, setPresentation] = useState(0);
  const [content, setContent] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [category, setCategory] = useState<'resume' | 'linkedin'>('resume');
  const [agreement, setAgreement] = useState<'agree' | 'disagree' | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (overall === 0 || presentation === 0 || content === 0) {
      toast({
        title: "Incomplete Rating",
        description: "Please rate all categories before submitting!",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit({
        overall,
        presentation,
        content,
        feedback: feedback.trim() || undefined,
        category,
        agreement
      });
      
      // Reset form
      setOverall(0);
      setPresentation(0);
      setContent(0);
      setFeedback('');
      setAgreement(undefined);
      
      toast({
        title: "Vote Submitted! 🎉",
        description: "Your anonymous vote has been cast and will appear on stream!"
      });
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Something went wrong. Please try again!",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const averageRating = (overall + presentation + content) / 3;

  return (
    <Card className="glow-effect border-neon-purple/30 bg-card/90 backdrop-blur">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl bg-gradient-to-r from-neon-purple to-neon-pink bg-clip-text text-transparent">
          Cast Your Vote ⚡
        </CardTitle>
        <div className="flex justify-center gap-2 mt-2">
          <Badge 
            variant={category === 'resume' ? 'default' : 'outline'}
            className={category === 'resume' ? 'bg-neon-purple text-primary-foreground' : 'border-neon-purple/50'}
            onClick={() => setCategory('resume')}
          >
            Resume
          </Badge>
          <Badge 
            variant={category === 'linkedin' ? 'default' : 'outline'}
            className={category === 'linkedin' ? 'bg-neon-cyan text-primary-foreground' : 'border-neon-cyan/50'}
            onClick={() => setCategory('linkedin')}
          >
            LinkedIn
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-foreground">Overall Score</span>
            <StarRating value={overall} onChange={setOverall} size="lg" />
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-foreground">Presentation</span>
            <StarRating value={presentation} onChange={setPresentation} size="lg" />
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-foreground">Content Quality</span>
            <StarRating value={content} onChange={setContent} size="lg" />
          </div>
        </div>

        {averageRating > 0 && (
          <div className="text-center p-4 rounded-lg bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 border border-neon-purple/30">
            <div className="text-2xl font-bold text-neon-orange">
              {averageRating.toFixed(1)}/5
            </div>
            <div className="text-sm text-muted-foreground">Average Score</div>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Optional Feedback
          </label>
          <Textarea
            placeholder="Add your voice to the conversation... (This will appear on stream! 💬)"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="bg-input/50 border-neon-purple/30 focus:border-neon-purple transition-all duration-300 hover:shadow-lg hover:shadow-neon-purple/20"
            rows={3}
          />
        </div>

        {/* Agreement Section */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Do you agree with our feedback?</label>
          <div className="flex gap-3">
            <Button
              type="button"
              variant={agreement === 'agree' ? 'default' : 'outline'}
              onClick={() => setAgreement(agreement === 'agree' ? undefined : 'agree')}
              className={`flex-1 ${
                agreement === 'agree' 
                  ? 'bg-neon-green hover:bg-neon-green/90 text-primary-foreground border-neon-green' 
                  : 'border-neon-green/50 text-neon-green hover:bg-neon-green/20'
              }`}
            >
              <ThumbsUp className="w-4 h-4 mr-2" />
              Agree
            </Button>
            <Button
              type="button"
              variant={agreement === 'disagree' ? 'default' : 'outline'}
              onClick={() => setAgreement(agreement === 'disagree' ? undefined : 'disagree')}
              className={`flex-1 ${
                agreement === 'disagree' 
                  ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground border-destructive' 
                  : 'border-destructive/50 text-destructive hover:bg-destructive/20'
              }`}
            >
              <ThumbsDown className="w-4 h-4 mr-2" />
              Disagree
            </Button>
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || overall === 0 || presentation === 0 || content === 0}
          className="w-full bg-gradient-to-r from-neon-purple to-neon-pink hover:from-neon-pink hover:to-neon-purple text-primary-foreground font-bold py-3 glow-effect transform transition-all duration-200 hover:scale-105 active:scale-95"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Casting Vote...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              Cast Your Vote! 🗳️
              <Zap className="w-4 h-4" />
            </div>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}