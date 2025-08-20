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
    <Card className="h-full flex flex-col border-neon-cyan/30 overflow-hidden bg-gradient-to-b from-background to-muted/20">
      <CardHeader className="pb-3 flex-shrink-0 border-b border-border/50">
        <CardTitle className="text-sm bg-gradient-to-r from-neon-cyan to-neon-green bg-clip-text text-transparent flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-neon-cyan" />
          Live Chat
          <span className="ml-auto text-xs text-muted-foreground font-normal">
            {messages.length} {messages.length === 1 ? 'message' : 'messages'}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-4 gap-4 min-h-0">
        {/* Messages Area */}
        <ScrollArea ref={scrollAreaRef} className="flex-1 pr-2 min-h-0">
          <div className="space-y-3 pb-2">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground text-sm py-8">
                <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="w-6 h-6" />
                </div>
                {currentTarget ? "No messages yet. Start the conversation!" : "Waiting for session to start..."}
              </div>
            ) : (
              messages.map((msg, index) => {
                const isConsecutive = index > 0 && 
                  messages[index - 1].first_name === msg.first_name &&
                  new Date(msg.created_at).getTime() - new Date(messages[index - 1].created_at).getTime() < 120000; // 2 minutes
                
                return (
                  <div key={msg.id} className="flex items-start gap-3 animate-fade-in">
                    {/* Avatar */}
                    <div className={`flex-shrink-0 transition-opacity duration-200 ${isConsecutive ? 'opacity-0' : 'opacity-100'}`}>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 border border-neon-cyan/30 flex items-center justify-center">
                        <span className="text-xs font-medium text-neon-cyan">
                          {(msg.first_name || 'A').charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    
                    {/* Message Content */}
                    <div className="flex-1 min-w-0">
                      {!isConsecutive && (
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-foreground/80">
                            {msg.first_name || 'Anonymous'}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(msg.created_at).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                      )}
                      
                      {/* Message Bubble */}
                      <div className="relative group">
                        <div className="bg-muted/80 backdrop-blur-sm rounded-2xl rounded-tl-md px-4 py-2.5 border border-border/50 shadow-sm hover:shadow-md transition-all duration-200">
                          <p className="text-sm leading-relaxed break-words text-foreground/90">
                            {msg.message}
                          </p>
                        </div>
                        
                        {/* Hover timestamp */}
                        <div className="absolute right-0 -bottom-5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <span className="text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md border border-border/30">
                            {new Date(msg.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        {/* Input Area - Only show if not view-only */}
        {!viewOnly && (
          <div className="flex-shrink-0 space-y-2">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <Input
                  placeholder={currentTarget ? "Message..." : "Waiting for session..."}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isSending || !currentTarget}
                  className="rounded-2xl border-border/50 bg-muted/50 backdrop-blur-sm focus:bg-background/80 focus:border-neon-cyan/50 text-sm py-3 pl-4 pr-12 resize-none transition-all duration-200"
                  maxLength={200}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <Button
                    onClick={handleSendMessage}
                    disabled={isSending || !message.trim() || !currentTarget}
                    className="rounded-full w-8 h-8 p-0 bg-gradient-to-r from-neon-cyan to-neon-green hover:from-neon-green hover:to-neon-cyan disabled:opacity-30 transition-all duration-200 hover:scale-105"
                    size="sm"
                  >
                    {isSending ? (
                      <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
            
            {message.length > 0 && (
              <div className="text-xs text-muted-foreground text-right px-1 animate-fade-in">
                {message.length}/200
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}