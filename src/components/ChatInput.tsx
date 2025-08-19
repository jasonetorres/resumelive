import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ChatInputProps {
  currentTarget: string | null;
}

export function ChatInput({ currentTarget }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    if (!currentTarget) {
      toast({
        title: "No Active Session",
        description: "Wait for a session to start before sending messages.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    
    try {
      const { error } = await (supabase as any)
        .from('chat_messages')
        .insert({
          target_person: currentTarget,
          message: message.trim(),
        });

      if (error) throw error;

      setMessage('');
      toast({
        title: "Message Sent! 💬",
        description: "Your message will appear on the live display",
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Failed to Send Message",
        description: "Please try again!",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="glow-effect border-neon-cyan/30 bg-card/90 backdrop-blur">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl bg-gradient-to-r from-neon-cyan to-neon-green bg-clip-text text-transparent">
          Live Chat
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Send messages that appear live on the conference display!
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Input
            placeholder={currentTarget ? "Type your message..." : "Waiting for session to start..."}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isSending || !currentTarget}
            className="flex-1 border-neon-cyan/30 focus:border-neon-cyan"
            maxLength={200}
          />
          <Button
            onClick={handleSendMessage}
            disabled={isSending || !message.trim() || !currentTarget}
            className="bg-gradient-to-r from-neon-cyan to-neon-green hover:from-neon-green hover:to-neon-cyan text-primary-foreground"
          >
            {isSending ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        
        {!currentTarget && (
          <div className="mt-3 text-center">
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <MessageCircle className="w-4 h-4" />
              Chat will be available when a session starts
            </div>
          </div>
        )}
        
        {message.length > 0 && (
          <div className="mt-2 text-xs text-muted-foreground text-right">
            {message.length}/200 characters
          </div>
        )}
      </CardContent>
    </Card>
  );
}