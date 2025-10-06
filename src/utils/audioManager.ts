import { Howl } from 'howler';

class AudioManager {
  private sounds: Record<string, Howl> = {};
  private userInteracted = false;

  constructor() {
    this.setupUserInteractionListener();
    this.initializeSounds();
  }

  private setupUserInteractionListener(): void {
    const enableAudio = () => {
      if (this.userInteracted) return;
      
      this.userInteracted = true;
      console.log('AudioManager: Audio enabled by user interaction');
      console.log('AudioManager: User agent:', navigator.userAgent);
      console.log('AudioManager: Is mobile:', /iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
      
      // Try to unlock audio context immediately on mobile
      if (typeof window !== 'undefined' && (window.AudioContext || (window as any).webkitAudioContext)) {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const tempContext = new AudioContext();
        if (tempContext.state === 'suspended') {
          tempContext.resume().then(() => {
            console.log('AudioManager: Audio context resumed successfully');
            tempContext.close();
          }).catch(err => {
            console.error('AudioManager: Failed to resume audio context:', err);
            tempContext.close();
          });
        } else {
          tempContext.close();
        }
      }
      
      // Remove listeners after first interaction
      document.removeEventListener('click', enableAudio, { passive: true } as any);
      document.removeEventListener('touchstart', enableAudio, { passive: true } as any);
      document.removeEventListener('touchend', enableAudio, { passive: true } as any);
      document.removeEventListener('keydown', enableAudio);
    };

    // Add more mobile-friendly event listeners
    document.addEventListener('click', enableAudio, { passive: true } as any);
    document.addEventListener('touchstart', enableAudio, { passive: true } as any);
    document.addEventListener('touchend', enableAudio, { passive: true } as any);
    document.addEventListener('keydown', enableAudio);
    
    console.log('AudioManager: User interaction listeners set up');
  }

  private initializeSounds(): void {
    // These URLs now point to local files in the `public/sounds/` directory.
    // Make sure you have these files in that location!
    const soundUrls = {
      applause: '/sounds/applause.mp3',
      airhorn: '/sounds/airhorn.mp3',
      drumroll: '/sounds/drumroll.mp3',
      ding: '/sounds/ding.mp3',
      woosh: '/sounds/woosh.mp3',
      fanfare: '/sounds/fanfare.mp3',
      boing: '/sounds/boing.mp3',
      crickets: '/sounds/crickets.mp3',
      trombone: '/sounds/trombone.mp3',
      confetti: '/sounds/confetti.mp3',
      buzzer: '/sounds/buzzer.mp3',
      cheer: '/sounds/cheer.mp3',
    };

    // Initialize Howl instances for each sound
    Object.entries(soundUrls).forEach(([name, url]) => {
      this.sounds[name] = new Howl({
        src: [url],
        volume: 0.7,
        preload: true, // Preloading is great for local files
        onloaderror: (id, error) => {
          console.error(`AudioManager: Error loading sound "${name}" from "${url}". Error: ${error}`);
        },
        onload: () => {
          console.log(`AudioManager: Successfully loaded sound "${name}" from "${url}"`);
        }
      });
    });
  }















  async playSound(soundName: string): Promise<void> {
    console.log(`AudioManager: Attempting to play ${soundName}`);
    console.log(`AudioManager: userInteracted = ${this.userInteracted}`);
    
    if (!this.userInteracted) {
      console.warn('AudioManager: User has not interacted with the page yet. Audio is disabled.');
      return;
    }

    const sound = this.sounds[soundName];
    console.log(`AudioManager: Sound object exists: ${!!sound}`);
    console.log(`AudioManager: Sound state: ${sound ? sound.state() : 'N/A'}`);
    
    if (sound && sound.state() === 'loaded') {
      try {
        sound.play();
        console.log(`AudioManager: Playing preloaded mp3 for ${soundName}`);
      } catch (error) {
        console.error(`AudioManager: Error playing mp3 for ${soundName}:`, error);
      }
    } else {
      console.warn(`AudioManager: Audio file for ${soundName} not loaded yet`);
    }
  }
}

export const audioManager = new AudioManager();