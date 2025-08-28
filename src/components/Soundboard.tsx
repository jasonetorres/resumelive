import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Volume2 } from "lucide-react";
import { audioManager } from "@/utils/audioManager";

// Add audio initialization on component mount
import { useEffect } from "react";

const SOUND_OPTIONS = [
  { name: "applause", emoji: "👏", label: "Applause" },
  { name: "airhorn", emoji: "📯", label: "Air Horn" },
  { name: "drumroll", emoji: "🥁", label: "Drum Roll" },
  { name: "ding", emoji: "🔔", label: "Ding" },
  { name: "woosh", emoji: "💨", label: "Woosh" },
  { name: "fanfare", emoji: "🎺", label: "Fanfare" },
  { name: "boing", emoji: "🌀", label: "Boing" },
  { name: "cricket", emoji: "🦗", label: "Cricket" },
  { name: "trombone", emoji: "📯", label: "Sad Trombone" },
  { name: "confetti", emoji: "🎉", label: "Confetti" },
  { name: "buzzer", emoji: "❌", label: "Buzzer" },
  { name: "cheer", emoji: "🎊", label: "Cheer" },
];

const Soundboard = () => {
  useEffect(() => {
    // Show user they need to interact first
    console.log('Soundboard: Ready - click any button to enable audio');
  }, []);

  const playSound = async (soundName: string) => {
    try {
      console.log(`Soundboard: Playing sound ${soundName}`);
      
      // Play the actual audio sound
      await audioManager.playSound(soundName);
      
      // Also send to database for visual effects on display
      const { error } = await supabase
        .from('sounds')
        .insert({
          sound_name: soundName,
          target_person: 'GLOBAL'
        });

      if (error) throw error;

      console.log(`Soundboard: Sound ${soundName} sent to database`);

      toast.success(`Played ${soundName} sound`);
    } catch (error) {
      console.error('Error playing sound:', error);
      toast.error('Failed to play sound');
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {SOUND_OPTIONS.map((sound) => (
          <Button
            key={sound.name}
            variant="outline"
            className="h-16 flex flex-col items-center justify-center space-y-1 hover:scale-105 transition-transform"
            onClick={() => playSound(sound.name)}
          >
            <span className="text-2xl">{sound.emoji}</span>
            <span className="text-xs font-medium">{sound.label}</span>
          </Button>
        ))}
      </div>
      
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Volume2 className="h-4 w-4" />
        <span>Click any button to enable audio • Sounds appear as floating animations</span>
      </div>
    </div>
  );
};

export { Soundboard };