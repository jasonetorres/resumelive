import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ChatMessage {
  id: string;
  message: string;
  target_person: string;
  first_name?: string;
  created_at: string;
}

interface LiveChatProps {
  currentTarget: string | null;
  viewOnly?: boolean;
}

export function LiveChat({ currentTarget, viewOnly = false }: LiveChatProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Fetch existing messages when target changes
  useEffect(() => {
    if (!currentTarget) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('target_person', currentTarget)
        .order('created_at', { ascending: true })
        .limit(50);
      
      setMessages(data || []);
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel('live-chat-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          if (newMessage.target_person === currentTarget) {
            setMessages(prev => [...prev, newMessage]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentTarget]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

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
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          target_person: currentTarget,
          message: message.trim(),
        });

      if (error) throw error;

      setMessage('');
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
    <Card className="h-full flex flex-col border-neon-cyan/30 overflow-hidden">
      <CardHeader className="pb-2 flex-shrink-0">
        <CardTitle className="text-sm bg-gradient-to-r from-neon-cyan to-neon-green bg-clip-text text-transparent flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-neon-cyan" />
          Live Chat ({messages.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-2 gap-2 min-h-0">
        {/* Messages Area */}
        <ScrollArea ref={scrollAreaRef} className="flex-1 pr-2 min-h-0">
          <div className="space-y-1">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground text-xs py-2">
                {currentTarget ? "No messages yet. Be the first to chat!" : "Waiting for session to start..."}
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="bg-muted/30 rounded-lg p-2 break-words">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                    <span className="font-medium text-neon-cyan">{msg.first_name || 'Anonymous'}</span>
                    <span>{new Date(msg.created_at).toLocaleTimeString()}</span>
                  </div>
                  <div className="text-xs">{msg.message}</div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Input Area - Only show if not view-only */}
        {!viewOnly && (
          <>
            <div className="flex gap-2">
              <Input
                placeholder={currentTarget ? "Type your message..." : "Waiting for session..."}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isSending || !currentTarget}
                className="flex-1 border-neon-cyan/30 focus:border-neon-cyan text-sm"
                maxLength={200}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isSending || !message.trim() || !currentTarget}
                className="bg-gradient-to-r from-neon-cyan to-neon-green hover:from-neon-green hover:to-neon-cyan text-primary-foreground px-3"
                size="sm"
              >
                {isSending ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
            
            {message.length > 0 && (
              <div className="text-xs text-muted-foreground text-right">
                {message.length}/200 characters
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}