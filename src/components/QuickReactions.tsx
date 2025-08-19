import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function QuickReactions() {
  const { toast } = useToast();

  // Handle immediate reaction sending
  const handleQuickReaction = async (emoji: string) => {
    console.log('QuickReactions: Sending global quick reaction:', emoji);

    try {
      // Send reaction immediately to database for real-time display
      const { error } = await supabase
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

      console.log('QuickReactions: Quick reaction sent successfully');

      toast({
        title: "Reaction Sent! 🎉",
        description: `Your ${emoji} reaction is now floating on the stream!`
      });
    } catch (error) {
      console.error('QuickReactions: Error sending reaction:', error);
      toast({
        title: "Failed to Send Reaction",
        description: "Please try again!",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="glow-effect border-neon-orange/30 bg-card/90 backdrop-blur">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl bg-gradient-to-r from-neon-orange to-neon-pink bg-clip-text text-transparent">
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
  );
}