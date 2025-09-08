import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { StarRating } from './StarRating';
import { Badge } from '@/components/ui/badge';
import { Send, Zap, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface RatingInputProps {
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

export function RatingInput({ onSubmit, currentTarget }: RatingInputProps) {
  const [overall, setOverall] = useState(0);
  const [resumeQuality, setResumeQuality] = useState(0);
  const [layout, setLayout] = useState(0);
  const [content, setContent] = useState(0);
  const [agreement, setAgreement] = useState<'agree' | 'disagree' | undefined>();
  const [reaction, setReaction] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Handle immediate reaction sending
  const handleQuickReaction = async (emoji: string) => {
    console.log('RatingInput: Sending global quick reaction:', emoji);

    try {
      // Send reaction immediately to database for real-time display
      const { error } = await (supabase as any)
        .from('ratings')
        .insert({
          target_person: 'GLOBAL_REACTIONS', // Use a special identifier for global reactions
          overall: null, // NULL indicates this is a quick reaction, not a rating
          presentation: null,
          content: null,
          category: 'resume',
          reaction: emoji,
          feedback: null // No feedback for quick reactions
        });

      if (error) throw error;

      console.log('RatingInput: Quick reaction sent successfully');

      toast({
        title: "Reaction Sent! 🎉",
        description: `Your ${emoji} reaction is now floating on the stream!`
      });
    } catch (error) {
      console.error('RatingInput: Error sending reaction:', error);
      toast({
        title: "Failed to Send Reaction",
        description: "Please try again!",
        variant: "destructive"
      });
    }
  };

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
        presentation: resumeQuality, // Map to existing field
        content,
        category: 'resume', // Always resume now
        agreement
      });
      
      // Don't reset form - let users vote multiple times with same data
      // Only clear agreement for next vote
      setAgreement(undefined);
      
      toast({
        title: "Vote Submitted! 🎉",
        description: "Your vote has been cast! You can vote again with different ratings.",
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

  return (
    <div className="space-y-6">
      {/* Quick Reactions Section - Outside the voting form */}
      <Card className="glow-effect border-neon-orange/30 bg-card/90 backdrop-blur">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl text-primary">
            Quick Reactions
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Tap to send instant reactions that float on stream!
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-3">
            {[
              { emoji: '👍', label: 'Like' },
              { emoji: '🔥', label: 'Fire' },
              { emoji: '💯', label: 'Perfect' },
              { emoji: '👎', label: 'Dislike' },
              { emoji: '💩', label: 'Poop' },
              { emoji: '😍', label: 'Love' },
              { emoji: '😂', label: 'Laughing' },
              { emoji: '🤔', label: 'Thinking' },
              { emoji: '👏', label: 'Clap' },
              { emoji: '⚡', label: 'Lightning' }
            ].map(({ emoji, label }) => (
              <Button
                key={emoji}
                type="button"
                variant="outline"
                onClick={() => handleQuickReaction(emoji)}
                className="aspect-square text-3xl transition-all duration-200 hover:scale-110 hover:bg-neon-orange/20 hover:border-neon-orange/50 active:scale-95"
                title={label}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Voting Form - Only show when target is set */}
      {currentTarget ? (
        <Card className="glow-effect border-neon-purple/30 bg-card/90 backdrop-blur">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-primary">
              Cast Your Vote
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-foreground">Overall Score</span>
                <StarRating value={overall} onChange={setOverall} size="lg" />
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-foreground">Resume Quality</span>
                <StarRating value={resumeQuality} onChange={setResumeQuality} size="lg" />
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-foreground">Layout & Design</span>
                <StarRating value={layout} onChange={setLayout} size="lg" />
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

            {/* Agreement Section */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Do you agree with our feedback?</label>
               <div className="flex gap-3">
                 <Button
                   type="button"
                   variant={agreement === 'agree' ? 'agree' : 'outline'}
                   onClick={() => setAgreement(agreement === 'agree' ? undefined : 'agree')}
                   className="flex-1"
                 >
                   <ThumbsUp className="w-4 h-4 mr-2" />
                   Agree
                 </Button>
                 <Button
                   type="button"
                   variant={agreement === 'disagree' ? 'disagree' : 'outline'}
                   onClick={() => setAgreement(agreement === 'disagree' ? undefined : 'disagree')}
                   className="flex-1"
                 >
                   <ThumbsDown className="w-4 h-4 mr-2" />
                   Disagree
                 </Button>
               </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || overall === 0 || resumeQuality === 0 || layout === 0 || content === 0}
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
      ) : (
        <Card className="border border-neon-orange/20 bg-neon-orange/5">
          <CardContent className="text-center py-6">
            <h3 className="text-lg font-semibold text-neon-orange mb-2">
              🎯 No Active Rating Session
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              No resume is currently being reviewed, but you can still send quick reactions above!
            </p>
            <p className="text-xs text-neon-orange">
              Your reactions will appear live on the conference display ✨
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}