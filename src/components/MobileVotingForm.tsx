import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { StarRating } from './StarRating';
import { Send, Zap, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface MobileVotingFormProps {
  onSubmit: (rating: { 
    overall: number; 
    presentation: number; 
    content: number; 
    category: 'resume' | 'linkedin';
    agreement?: 'agree' | 'disagree';
    reaction?: string;
  }) => Promise<void>;
  currentTarget: string | null;
}

export function MobileVotingForm({ onSubmit, currentTarget }: MobileVotingFormProps) {
  const [overall, setOverall] = useState(0);
  const [resumeQuality, setResumeQuality] = useState(0);
  const [layout, setLayout] = useState(0);
  const [content, setContent] = useState(0);
  const [agreement, setAgreement] = useState<'agree' | 'disagree' | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (overall === 0 || resumeQuality === 0 || layout === 0 || content === 0) {
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
        presentation: resumeQuality,
        content,
        category: 'resume',
        agreement
      });
      
      setAgreement(undefined);
      
      toast({
        title: "Vote Submitted! 🎉",
        description: "Your vote has been cast!",
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

  const averageRating = (overall + resumeQuality + layout + content) / 4;

  if (!currentTarget) {
    return (
      <Card className="border border-neon-orange/20 bg-neon-orange/5 glow-effect">
        <CardContent className="text-center py-6">
          <h3 className="text-lg font-semibold text-neon-orange mb-2">
            🎯 No Active Rating Session
          </h3>
          <p className="text-sm text-muted-foreground">
            No resume is currently being reviewed.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glow-effect border-neon-purple/30 bg-card/90 backdrop-blur">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl text-primary">
          Cast Your Vote
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Ratings - Optimized for mobile with vertical layout */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Overall Score</span>
              <Badge variant="outline" className="text-xs">
                {overall > 0 ? `${overall}/5` : 'Not rated'}
              </Badge>
            </div>
            <div className="flex justify-center">
              <StarRating value={overall} onChange={setOverall} size="lg" />
            </div>
          </div>
          
          <Separator className="opacity-50" />
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Resume Quality</span>
              <Badge variant="outline" className="text-xs">
                {resumeQuality > 0 ? `${resumeQuality}/5` : 'Not rated'}
              </Badge>
            </div>
            <div className="flex justify-center">
              <StarRating value={resumeQuality} onChange={setResumeQuality} size="lg" />
            </div>
          </div>
          
          <Separator className="opacity-50" />
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Layout & Design</span>
              <Badge variant="outline" className="text-xs">
                {layout > 0 ? `${layout}/5` : 'Not rated'}
              </Badge>
            </div>
            <div className="flex justify-center">
              <StarRating value={layout} onChange={setLayout} size="lg" />
            </div>
          </div>
          
          <Separator className="opacity-50" />
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Content Quality</span>
              <Badge variant="outline" className="text-xs">
                {content > 0 ? `${content}/5` : 'Not rated'}
              </Badge>
            </div>
            <div className="flex justify-center">
              <StarRating value={content} onChange={setContent} size="lg" />
            </div>
          </div>
        </div>

        {/* Average Score Display */}
        {averageRating > 0 && (
          <div className="text-center p-4 rounded-lg bg-secondary border border-border">
            <div className="text-2xl font-bold text-primary">
              {averageRating.toFixed(1)}/5
            </div>
            <div className="text-sm text-muted-foreground">Average Score</div>
          </div>
        )}

        {/* Agreement - Mobile optimized buttons */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            Do you agree with our feedback?
          </label>
           <div className="grid grid-cols-2 gap-2">
             <Button
               type="button"
               variant={agreement === 'agree' ? 'agree' : 'outline'}
               onClick={() => setAgreement(agreement === 'agree' ? undefined : 'agree')}
               size="sm"
             >
               <ThumbsUp className="w-4 h-4 mr-2" />
               Agree
             </Button>
             <Button
               type="button"
               variant={agreement === 'disagree' ? 'disagree' : 'outline'}
               onClick={() => setAgreement(agreement === 'disagree' ? undefined : 'disagree')}
               size="sm"
             >
               <ThumbsDown className="w-4 h-4 mr-2" />
               Disagree
             </Button>
           </div>
        </div>

        {/* Submit Button - Full width for mobile */}
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || overall === 0 || resumeQuality === 0 || layout === 0 || content === 0}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 text-base glow-effect"
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