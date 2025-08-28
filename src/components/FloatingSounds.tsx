import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface FloatingSound {
  id: string;
  emoji: string;
  position: { left: number; top: number };
  timestamp: number;
}

const SOUND_EMOJIS: Record<string, string> = {
  applause: "👏",
  airhorn: "📯",
  drumroll: "🥁",
  ding: "🔔",
  woosh: "💨",
  fanfare: "🎺",
  boing: "🤸",
  cricket: "🦗",
  trombone: "📯",
  confetti: "🎉",
  buzzer: "❌",
  cheer: "🎊",
};

export const FloatingSounds = () => {
  const [floatingSounds, setFloatingSounds] = useState<FloatingSound[]>([]);

  const addFloatingSound = (soundName: string) => {
    const emoji = SOUND_EMOJIS[soundName] || "🎵";
    const newSound: FloatingSound = {
      id: `${Date.now()}-${Math.random()}`,
      emoji,
      position: {
        left: Math.random() * 80 + 10, // 10% to 90%
        top: Math.random() * 60 + 20,  // 20% to 80%
      },
      timestamp: Date.now(),
    };

    setFloatingSounds(prev => [...prev, newSound]);

    // Play sound if audio file exists
    const audio = new Audio(`/sounds/${soundName}.mp3`);
    audio.play().catch(() => {
      // Fallback beep or silence if audio file doesn't exist
      console.log(`Sound effect: ${soundName}`);
    });

    // Remove after animation duration
    setTimeout(() => {
      setFloatingSounds(prev => prev.filter(sound => sound.id !== newSound.id));
    }, 3000);
  };

  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sounds',
        },
        (payload) => {
          const soundData = payload.new as { sound_name: string; target_person: string };
          if (soundData.target_person === 'GLOBAL') {
            addFloatingSound(soundData.sound_name);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {floatingSounds.map((sound) => (
        <div
          key={sound.id}
          className="absolute text-6xl animate-bounce-and-fade"
          style={{
            left: `${sound.position.left}%`,
            top: `${sound.position.top}%`,
            animation: 'bounceAndFade 3s ease-out forwards',
          }}
        >
          {sound.emoji}
        </div>
      ))}
    </div>
  );
};