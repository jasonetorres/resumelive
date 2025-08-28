import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Play, Pause, RotateCcw, Timer as TimerIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TimerState {
  minutes: number;
  seconds: number;
  is_running: boolean;
  started_at: string | null;
  paused_at: string | null;
}

export function TimerController() {
  const { toast } = useToast();
  const [timerState, setTimerState] = useState<TimerState>({
    minutes: 5,
    seconds: 0,
    is_running: false,
    started_at: null,
    paused_at: null
  });
  
  const [inputMinutes, setInputMinutes] = useState(5);
  const [inputSeconds, setInputSeconds] = useState(0);

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
        setInputMinutes(data.minutes);
        setInputSeconds(data.seconds);
      }
    };

    fetchTimerState();

    // Subscribe to timer updates
    const channel = supabase
      .channel('timer-controller-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'timer'
        },
        (payload) => {
          const newState = payload.new as TimerState;
          setTimerState(newState);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const startTimer = async () => {
    const { error } = await supabase
      .from('timer')
      .update({
        is_running: true,
        started_at: new Date().toISOString(),
        paused_at: null,
        minutes: inputMinutes,
        seconds: inputSeconds
      })
      .eq('id', 1);

    if (!error) {
      toast({
        title: "Timer Started! ⏰",
        description: `Timer set for ${inputMinutes}:${inputSeconds.toString().padStart(2, '0')}`,
      });
    }
  };

  const pauseTimer = async () => {
    const { error } = await supabase
      .from('timer')
      .update({
        is_running: false,
        paused_at: new Date().toISOString()
      })
      .eq('id', 1);

    if (!error) {
      toast({
        title: "Timer Paused ⏸️",
        description: "Timer has been paused",
      });
    }
  };

  const resetTimer = async () => {
    const { error } = await supabase
      .from('timer')
      .update({
        is_running: false,
        started_at: null,
        paused_at: null,
        minutes: inputMinutes,
        seconds: inputSeconds
      })
      .eq('id', 1);

    if (!error) {
      toast({
        title: "Timer Reset! 🔄",
        description: `Timer reset to ${inputMinutes}:${inputSeconds.toString().padStart(2, '0')}`,
      });
    }
  };

  const updateTimerSettings = async () => {
    if (!timerState.is_running) {
      const { error } = await supabase
        .from('timer')
        .update({
          minutes: inputMinutes,
          seconds: inputSeconds
        })
        .eq('id', 1);

      if (!error) {
        toast({
          title: "Timer Updated! ⚙️",
          description: `Timer set to ${inputMinutes}:${inputSeconds.toString().padStart(2, '0')}`,
        });
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <TimerIcon className="w-5 h-5 text-neon-blue" />
        <span className="font-semibold">Timer Control</span>
      </div>

      {/* Time Input */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="minutes">Minutes</Label>
          <Input
            id="minutes"
            type="number"
            min="0"
            max="60"
            value={inputMinutes}
            onChange={(e) => setInputMinutes(Math.max(0, Math.min(60, parseInt(e.target.value) || 0)))}
            disabled={timerState.is_running}
          />
        </div>
        <div>
          <Label htmlFor="seconds">Seconds</Label>
          <Input
            id="seconds"
            type="number"
            min="0"
            max="59"
            value={inputSeconds}
            onChange={(e) => setInputSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
            disabled={timerState.is_running}
          />
        </div>
      </div>

      {/* Update Settings Button (only when timer is stopped) */}
      {!timerState.is_running && (
        <Button
          onClick={updateTimerSettings}
          variant="outline"
          className="w-full"
        >
          Update Timer Settings
        </Button>
      )}

      {/* Control Buttons */}
      <div className="flex gap-2">
        {!timerState.is_running ? (
          <Button
            onClick={startTimer}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            <Play className="w-4 h-4 mr-2" />
            Start
          </Button>
        ) : (
          <Button
            onClick={pauseTimer}
            className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            <Pause className="w-4 h-4 mr-2" />
            Pause
          </Button>
        )}
        
        <Button
          onClick={resetTimer}
          variant="outline"
          className="flex-1"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      {/* Current Status */}
      <div className="text-center p-3 bg-muted/20 rounded-lg">
        <p className="text-sm font-medium">
          Current Timer: {timerState.minutes}:{timerState.seconds.toString().padStart(2, '0')}
        </p>
        <p className={`text-xs ${timerState.is_running ? 'text-green-600' : 'text-muted-foreground'}`}>
          {timerState.is_running ? '🟢 Running' : '⚫ Stopped'}
        </p>
      </div>
    </div>
  );
}