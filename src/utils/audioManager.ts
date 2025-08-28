import { Howl } from 'howler';

class AudioManager {
  private userInteracted = false;
  private sounds: Map<string, Howl> = new Map();

  constructor() {
    this.setupUserInteractionListener();
  }

  private setupUserInteractionListener(): void {
    const enableAudio = () => {
      if (this.userInteracted) return;
      
      this.userInteracted = true;
      console.log('AudioManager: Audio enabled by user interaction');
      
      // Remove listeners after first interaction
      document.removeEventListener('click', enableAudio);
      document.removeEventListener('touchstart', enableAudio);
      document.removeEventListener('keydown', enableAudio);
    };

    document.addEventListener('click', enableAudio);
    document.addEventListener('touchstart', enableAudio);
    document.addEventListener('keydown', enableAudio);
  }

  private createSound(soundName: string): Howl {
    // Use free sound effect URLs from various sources
    const soundUrls: Record<string, string[]> = {
      applause: [
        'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
        'https://freesound.org/data/previews/316/316847_5123451-lq.mp3'
      ],
      airhorn: [
        'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
      ],
      drumroll: [
        'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
      ],
      ding: [
        'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
      ],
      woosh: [
        'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
      ],
      fanfare: [
        'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
      ],
      boing: [
        'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
      ],
      cricket: [
        'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
      ],
      trombone: [
        'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
      ],
      confetti: [
        'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
      ],
      buzzer: [
        'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
      ],
      cheer: [
        'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'
      ]
    };

    const urls = soundUrls[soundName] || [];
    
    const sound = new Howl({
      src: urls,
      volume: 0.7,
      preload: false, // Load on demand to avoid autoplay issues
      onload: () => {
        console.log(`AudioManager: ${soundName} loaded successfully`);
      },
      onloaderror: (id, error) => {
        console.log(`AudioManager: Failed to load ${soundName}, using fallback tone`);
        this.createFallbackTone(soundName);
      },
      onplayerror: (id, error) => {
        console.log(`AudioManager: Failed to play ${soundName}, using fallback tone`);
        this.createFallbackTone(soundName);
      }
    });

    return sound;
  }

  private createFallbackTone(soundName: string): void {
    if (!this.userInteracted) {
      console.log('AudioManager: Cannot play fallback - no user interaction yet');
      return;
    }

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Different tones for different sounds
      const frequencies: Record<string, number> = {
        applause: 800,
        airhorn: 220,
        drumroll: 150,
        ding: 1000,
        woosh: 400,
        fanfare: 523,
        boing: 600,
        cricket: 3000,
        trombone: 174,
        confetti: 1200,
        buzzer: 100,
        cheer: 880
      };

      oscillator.frequency.value = frequencies[soundName] || 440;
      oscillator.type = soundName === 'buzzer' ? 'square' : 'sine';
      
      // Louder volume
      const now = audioContext.currentTime;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.5, now + 0.01); // Louder
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      
      oscillator.start(now);
      oscillator.stop(now + 0.3);
      
      console.log(`AudioManager: Played fallback tone for ${soundName} at ${frequencies[soundName] || 440}Hz`);
    } catch (error) {
      console.error('AudioManager: Error creating fallback tone:', error);
    }
  }

  async playSound(soundName: string): Promise<void> {
    console.log(`AudioManager: Attempting to play ${soundName}`);
    
    if (!this.userInteracted) {
      console.log('AudioManager: No user interaction yet - audio will be blocked');
      // Just play the fallback tone since external audio won't work anyway
      this.createFallbackTone(soundName);
      return;
    }

    // Try to get or create the sound
    let sound = this.sounds.get(soundName);
    if (!sound) {
      sound = this.createSound(soundName);
      this.sounds.set(soundName, sound);
    }

    try {
      // Try to play the Howler sound
      sound.play();
      console.log(`AudioManager: Playing Howler sound for ${soundName}`);
    } catch (error) {
      console.log(`AudioManager: Howler failed for ${soundName}, using fallback`);
      this.createFallbackTone(soundName);
    }
  }
}

export const audioManager = new AudioManager();