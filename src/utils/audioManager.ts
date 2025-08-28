import { Howl } from 'howler';

interface SoundConfig {
  name: string;
  urls: string[];
  volume?: number;
  loop?: boolean;
}

class AudioManager {
  private sounds: Map<string, Howl> = new Map();
  private initialized = false;

  // Sound configurations with multiple fallback URLs
  private soundConfigs: SoundConfig[] = [
    {
      name: 'applause',
      urls: [
        'https://www.soundjay.com/misc/sounds/applause-8.mp3',
        'https://freesound.org/data/previews/316/316847_5123451-lq.mp3',
        'https://www.zapsplat.com/wp-content/uploads/2015/sound-effects-one/applause_audience_clapping_medium_crowd_001.mp3'
      ],
      volume: 0.7
    },
    {
      name: 'airhorn',
      urls: [
        'https://www.soundjay.com/misc/sounds/air-horn-1.mp3',
        'https://freesound.org/data/previews/316/316847_5123451-lq.mp3'
      ],
      volume: 0.8
    },
    {
      name: 'drumroll',
      urls: [
        'https://www.soundjay.com/misc/sounds/drum-roll.mp3',
        'https://freesound.org/data/previews/316/316847_5123451-lq.mp3'
      ],
      volume: 0.6
    },
    {
      name: 'ding',
      urls: [
        'https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3',
        'https://freesound.org/data/previews/316/316847_5123451-lq.mp3'
      ],
      volume: 0.5
    },
    {
      name: 'woosh',
      urls: [
        'https://www.soundjay.com/misc/sounds/woosh-1.mp3',
        'https://freesound.org/data/previews/316/316847_5123451-lq.mp3'
      ],
      volume: 0.6
    },
    {
      name: 'fanfare',
      urls: [
        'https://www.soundjay.com/misc/sounds/fanfare-1.mp3',
        'https://freesound.org/data/previews/316/316847_5123451-lq.mp3'
      ],
      volume: 0.7
    },
    {
      name: 'boing',
      urls: [
        'https://www.soundjay.com/misc/sounds/boing-1.mp3',
        'https://freesound.org/data/previews/316/316847_5123451-lq.mp3'
      ],
      volume: 0.6
    },
    {
      name: 'cricket',
      urls: [
        'https://www.soundjay.com/misc/sounds/cricket-1.mp3',
        'https://freesound.org/data/previews/316/316847_5123451-lq.mp3'
      ],
      volume: 0.4
    },
    {
      name: 'trombone',
      urls: [
        'https://www.soundjay.com/misc/sounds/sad-trombone.mp3',
        'https://freesound.org/data/previews/316/316847_5123451-lq.mp3'
      ],
      volume: 0.7
    },
    {
      name: 'confetti',
      urls: [
        'https://www.soundjay.com/misc/sounds/party-horn-1.mp3',
        'https://freesound.org/data/previews/316/316847_5123451-lq.mp3'
      ],
      volume: 0.6
    },
    {
      name: 'buzzer',
      urls: [
        'https://www.soundjay.com/misc/sounds/buzzer-1.mp3',
        'https://freesound.org/data/previews/316/316847_5123451-lq.mp3'
      ],
      volume: 0.8
    },
    {
      name: 'cheer',
      urls: [
        'https://www.soundjay.com/misc/sounds/crowd-cheer-1.mp3',
        'https://freesound.org/data/previews/316/316847_5123451-lq.mp3'
      ],
      volume: 0.7
    }
  ];

  private async initializeSounds(): Promise<void> {
    if (this.initialized) return;

    console.log('AudioManager: Initializing sounds with Howler.js...');

    // Initialize each sound with fallback URLs
    for (const config of this.soundConfigs) {
      try {
        const howl = new Howl({
          src: config.urls,
          volume: config.volume || 0.5,
          preload: true,
          html5: true, // Use HTML5 Audio for better compatibility
          onload: () => {
            console.log(`AudioManager: Successfully loaded ${config.name}`);
          },
          onloaderror: (id, error) => {
            console.warn(`AudioManager: Failed to load ${config.name}:`, error);
            // Create a simple fallback tone
            this.createFallbackSound(config.name);
          }
        });

        this.sounds.set(config.name, howl);
      } catch (error) {
        console.error(`AudioManager: Error creating sound ${config.name}:`, error);
        this.createFallbackSound(config.name);
      }
    }

    this.initialized = true;
    console.log('AudioManager: Initialization complete');
  }

  private createFallbackSound(soundName: string): void {
    // Create distinctive fallback tones for each sound
    const fallbackFrequencies: Record<string, number[]> = {
      applause: [800, 1200, 1600], // Chord
      airhorn: [220], // Low horn
      drumroll: [150], // Low rumble
      ding: [800, 1200, 1600, 2000], // Bell harmonics
      woosh: [400], // Mid frequency
      fanfare: [523, 659, 784], // C major chord
      boing: [800], // High to low slide
      cricket: [3000], // High chirp
      trombone: [220], // Low brass
      confetti: [1000, 1500, 2000], // High sparkles
      buzzer: [150], // Low buzz
      cheer: [600, 800, 1000] // Mid range crowd
    };

    const frequencies = fallbackFrequencies[soundName] || [440];
    
    const howl = new Howl({
      src: ['data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT'],
      volume: 0.3
    });

    this.sounds.set(soundName, howl);
  }

  async playSound(soundName: string): Promise<void> {
    try {
      await this.initializeSounds();
      
      const sound = this.sounds.get(soundName);
      if (sound) {
        // Stop any currently playing instance of this sound
        sound.stop();
        // Play the sound
        sound.play();
        console.log(`AudioManager: Playing ${soundName}`);
      } else {
        console.warn(`AudioManager: Sound ${soundName} not found`);
        // Play a simple fallback beep
        this.playFallbackBeep();
      }
    } catch (error) {
      console.error(`AudioManager: Error playing ${soundName}:`, error);
      this.playFallbackBeep();
    }
  }

  private playFallbackBeep(): void {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.error('AudioManager: Fallback beep failed:', error);
    }
  }

  // Preload all sounds (call this when the app starts)
  async preloadSounds(): Promise<void> {
    await this.initializeSounds();
  }

  // Stop all currently playing sounds
  stopAllSounds(): void {
    this.sounds.forEach(sound => {
      sound.stop();
    });
  }

  // Set global volume
  setGlobalVolume(volume: number): void {
    this.sounds.forEach(sound => {
      sound.volume(Math.max(0, Math.min(1, volume)));
    });
  }
}

// Create singleton instance
export const audioManager = new AudioManager();

// Preload sounds when the module loads
audioManager.preloadSounds().catch(console.error);