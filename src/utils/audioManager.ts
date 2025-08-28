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
  private audioContext: AudioContext | null = null;
  private userInteracted = false;

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

  // Initialize audio context on first user interaction
  private async initializeAudioContext(): Promise<void> {
    if (this.audioContext || this.userInteracted) return;
    
    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Resume audio context if suspended
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      this.userInteracted = true;
      console.log('AudioManager: Audio context initialized and resumed');
    } catch (error) {
      console.error('AudioManager: Failed to initialize audio context:', error);
    }
  }

  private async initializeSounds(): Promise<void> {
    if (this.initialized) return;

    // Ensure audio context is ready
    await this.initializeAudioContext();

    console.log('AudioManager: Initializing sounds with Howler.js...');

    // Initialize each sound with fallback URLs
    for (const config of this.soundConfigs) {
      try {
        const howl = new Howl({
          src: config.urls,
          volume: config.volume || 0.5,
          preload: false, // Don't preload to avoid autoplay issues
          html5: true, // Use HTML5 Audio for better compatibility
          format: ['mp3', 'wav'],
          onload: () => {
            console.log(`AudioManager: Successfully loaded ${config.name}`);
          },
          onloaderror: (id, error) => {
            console.warn(`AudioManager: Failed to load ${config.name}, using fallback`);
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
      src: ['data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAAAQESAAEAEgAABAAgAZGF0YQQAAAAAAA=='],
      volume: 0.3
    });

    this.sounds.set(soundName, howl);
  }

  async playSound(soundName: string): Promise<void> {
    try {
      // Ensure user has interacted and audio context is ready
      await this.initializeAudioContext();
      
      await this.initializeSounds();
      
      const sound = this.sounds.get(soundName);
      if (sound) {
        // Stop any currently playing instance of this sound
        sound.stop();
        
        // Load the sound if not already loaded
        if (sound.state() === 'unloaded') {
          sound.load();
        }
        
        // Play the sound
        const playId = sound.play();
        console.log(`AudioManager: Playing ${soundName}`);
        
        // Handle play failure
        sound.once('playerror', () => {
          console.warn(`AudioManager: Playback failed for ${soundName}, trying fallback`);
          this.playFallbackBeep(soundName);
        });
      } else {
        console.warn(`AudioManager: Sound ${soundName} not found`);
        // Play a simple fallback beep
        this.playFallbackBeep(soundName);
      }
    } catch (error) {
      console.error(`AudioManager: Error playing ${soundName}:`, error);
      this.playFallbackBeep(soundName);
    }
  }

  private playFallbackBeep(soundName: string): void {
    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const audioContext = this.audioContext;
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Different frequencies for different sounds
      const frequencies: Record<string, number> = {
        applause: 800,
        airhorn: 220,
        drumroll: 150,
        ding: 1200,
        woosh: 400,
        fanfare: 523,
        boing: 800,
        cricket: 3000,
        trombone: 220,
        confetti: 1500,
        buzzer: 150,
        cheer: 600
      };
      
      oscillator.frequency.value = frequencies[soundName] || 440;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
      
      console.log(`AudioManager: Played fallback beep for ${soundName}`);
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