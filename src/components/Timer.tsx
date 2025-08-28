import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Timer as TimerIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TimerState {
  minutes: number;
  seconds: number;
  is_running: boolean;
  started_at: string | null;
  paused_at: string | null;
}

export function Timer() {
  const [timerState, setTimerState] = useState<TimerState>({
    minutes: 5,
    seconds: 0,
    is_running: false,
    started_at: null,
    paused_at: null
  });
  
  const [displayMinutes, setDisplayMinutes] = useState(5);
  const [displaySeconds, setDisplaySeconds] = useState(0);

  useEffect(() => {
    // Fetch initial timer state
    const fetchTimerState = async () => {
      const { data, error } = await supabase
        .from('timer')
        .select('*')
        .eq('id', 1)
        .single();
      
      if (!error && data) {
        setTimerState(data);
        
        // If timer is running, calculate current time
        if (data.is_running && data.started_at) {
          const startTime = new Date(data.started_at).getTime();
          const currentTime = Date.now();
          const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
          const totalSeconds = data.minutes * 60 + data.seconds;
          const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds);
          
          setDisplayMinutes(Math.floor(remainingSeconds / 60));
          setDisplaySeconds(remainingSeconds % 60);
        } else {
          setDisplayMinutes(data.minutes);
          setDisplaySeconds(data.seconds);
        }
      }
    };

    fetchTimerState();

    // Subscribe to timer updates
    const channel = supabase
      .channel('timer-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'timer'
        },
         (payload) => {
           console.log('Timer: Received timer update:', payload);
           const newState = payload.new as TimerState;
           setTimerState(newState);
           
           if (newState.is_running && newState.started_at) {
             const startTime = new Date(newState.started_at).getTime();
             const currentTime = Date.now();
             const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
             const totalSeconds = newState.minutes * 60 + newState.seconds;
             const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds);
             
             setDisplayMinutes(Math.floor(remainingSeconds / 60));
             setDisplaySeconds(remainingSeconds % 60);
             console.log('Timer: Updated display time to:', Math.floor(remainingSeconds / 60), ':', remainingSeconds % 60);
           } else {
             setDisplayMinutes(newState.minutes);
             setDisplaySeconds(newState.seconds);
             console.log('Timer: Set display time to initial:', newState.minutes, ':', newState.seconds);
           }
         }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Update display time when timer is running
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (timerState.is_running && timerState.started_at) {
      interval = setInterval(() => {
        const startTime = new Date(timerState.started_at!).getTime();
        const currentTime = Date.now();
        const elapsedSeconds = Math.floor((currentTime - startTime) / 1000);
        const totalSeconds = timerState.minutes * 60 + timerState.seconds;
        const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds);
        
        setDisplayMinutes(Math.floor(remainingSeconds / 60));
        setDisplaySeconds(remainingSeconds % 60);
        
        // Auto-stop when timer reaches 0
        if (remainingSeconds <= 0) {
          supabase
            .from('timer')
            .update({ is_running: false })
            .eq('id', 1);
        }
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timerState.is_running, timerState.started_at, timerState.minutes, timerState.seconds]);

  const formatTime = (minutes: number, seconds: number) => {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const isTimeUp = displayMinutes === 0 && displaySeconds === 0 && timerState.is_running;

  return (
    <Card className={`border-2 ${isTimeUp ? 'border-red-500 bg-red-50 animate-pulse' : 'border-neon-blue/30'} bg-card/80 backdrop-blur`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-center gap-3">
          <TimerIcon className={`w-6 h-6 ${isTimeUp ? 'text-red-600' : 'text-neon-blue'}`} />
          <div className={`text-4xl font-mono font-bold ${isTimeUp ? 'text-red-600' : 'text-neon-blue'}`}>
            {formatTime(displayMinutes, displaySeconds)}
          </div>
        </div>
        
        <div className="text-center mt-2">
          <div className={`text-sm font-medium ${isTimeUp ? 'text-red-600' : timerState.is_running ? 'text-green-600' : 'text-muted-foreground'}`}>
            {isTimeUp ? 'TIME UP!' : timerState.is_running ? 'Running' : 'Stopped'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}