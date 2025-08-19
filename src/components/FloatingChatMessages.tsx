import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FloatingChatMessage {
  id: string;
  message: string;
  x: number;
  y: number;
  timestamp: number;
}

interface FloatingChatMessagesProps {
  currentTarget: string | null;
}

export function FloatingChatMessages({ currentTarget }: FloatingChatMessagesProps) {
  const [floatingMessages, setFloatingMessages] = useState<FloatingChatMessage[]>([]);
  const processedMessages = useRef<Set<string>>(new Set());

  const addFloatingMessage = (message: string, messageId: string) => {
    console.log('FloatingChatMessages: Adding message:', { message, messageId });
    
    // Prevent duplicates
    if (processedMessages.current.has(messageId)) {
      console.log('FloatingChatMessages: Duplicate prevented');
      return;
    }
    
    processedMessages.current.add(messageId);
    
    const newFloatingMessage: FloatingChatMessage = {
      id: messageId,
      message: message,
      x: Math.random() * 60 + 20, // Random position between 20% and 80%
      y: Math.random() * 40 + 30, // Random position between 30% and 70%
      timestamp: Date.now()
    };

    console.log('FloatingChatMessages: New message created:', newFloatingMessage);
    setFloatingMessages(prev => [...prev, newFloatingMessage]);

    // Remove the message after 8 seconds
    setTimeout(() => {
      console.log('FloatingChatMessages: Removing message:', messageId);
      setFloatingMessages(prev => prev.filter(fm => fm.id !== messageId));
      processedMessages.current.delete(messageId);
    }, 8000);
  };

  useEffect(() => {
    if (!currentTarget) {
      setFloatingMessages([]);
      processedMessages.current.clear();
      return;
    }

    console.log('FloatingChatMessages: Setting up subscription for chat messages');
    
    const channel = supabase
      .channel('floating-chat-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        (payload) => {
          const newMessage = payload.new;
          console.log('FloatingChatMessages: Received chat message insert:', newMessage);
          
          // Only show messages for current target
          if (newMessage.target_person === currentTarget) {
            console.log('FloatingChatMessages: Processing chat message:', newMessage.message);
            addFloatingMessage(newMessage.message, newMessage.id);
          } else {
            console.log('FloatingChatMessages: Not for current target, ignoring');
          }
        }
      )
      .subscribe((status) => {
        console.log('FloatingChatMessages: Subscription status:', status);
      });

    console.log('FloatingChatMessages: Subscription created');

    return () => {
      console.log('FloatingChatMessages: Cleaning up subscription');
      supabase.removeChannel(channel);
    };
  }, [currentTarget]);

  return (
    <div className="fixed inset-0 pointer-events-none z-30 overflow-hidden">
      {floatingMessages.map((chatMessage) => (
        <div
          key={chatMessage.id}
          className="absolute animate-float-up pointer-events-none"
          style={{
            left: `${chatMessage.x}%`,
            top: `${chatMessage.y}%`,
            animationDuration: '8s',
            animationTimingFunction: 'ease-out'
          }}
        >
          <div className="bg-gradient-to-r from-neon-cyan/90 to-neon-green/90 backdrop-blur-sm text-white px-4 py-2 rounded-full shadow-lg border border-neon-cyan/30 max-w-xs">
            <div className="text-sm font-medium break-words">
              {chatMessage.message}
            </div>
            {/* Chat bubble tail */}
            <div className="absolute -bottom-1 left-4 w-3 h-3 bg-gradient-to-r from-neon-cyan/90 to-neon-green/90 rotate-45 border-r border-b border-neon-cyan/30"></div>
          </div>
        </div>
      ))}
    </div>
  );
}