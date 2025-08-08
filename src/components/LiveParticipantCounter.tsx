import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Users, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface LiveParticipantCounterProps {
  currentTarget: string | null;
}

export function LiveParticipantCounter({ currentTarget }: LiveParticipantCounterProps) {
  const [participantCount, setParticipantCount] = useState(0);

  useEffect(() => {
    if (!currentTarget) {
      setParticipantCount(0);
      return;
    }

    // Create a channel for presence tracking specific to the current target
    const channel = supabase.channel(`presence-${currentTarget}`, {
      config: {
        presence: {
          key: `user-${Date.now()}-${Math.random()}`, // Unique key for each connection
        },
      },
    });

    // Track our presence
    const trackPresence = async () => {
      await channel.track({
        user_id: `anonymous-${Date.now()}`,
        online_at: new Date().toISOString(),
        page: 'rating',
        target: currentTarget,
      });
    };

    // Listen for presence changes
    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const count = Object.keys(presenceState).length;
        setParticipantCount(count);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('User joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('User left:', leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await trackPresence();
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentTarget]);

  if (!currentTarget) {
    return null;
  }

  return (
    <Badge 
      variant="outline" 
      className="border-neon-green text-neon-green bg-neon-green/10 flex items-center gap-2"
    >
      <div className="flex items-center gap-1">
        <div className="w-2 h-2 bg-neon-green rounded-full animate-pulse" />
        <Eye className="w-3 h-3" />
      </div>
      <span className="font-semibold">{participantCount}</span>
      <span className="text-xs">
        {participantCount === 1 ? 'viewer' : 'viewers'}
      </span>
    </Badge>
  );
}