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

  private createFallbackSound(soundName: string): void {
    if (!this.userInteracted) return;

    // Create Web Audio context if needed
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    const now = audioContext.currentTime;

    switch (soundName) {
      case 'applause':
        this.createApplauseEffect(audioContext, now);
        break;
      case 'airhorn':
        this.createAirhornEffect(audioContext, now);
        break;
      case 'drumroll':
        this.createDrumrollEffect(audioContext, now);
        break;
      case 'ding':
        this.createDingEffect(audioContext, now);
        break;
      case 'woosh':
        this.createWooshEffect(audioContext, now);
        break;
      case 'fanfare':
        this.createFanfareEffect(audioContext, now);
        break;
      case 'boing':
        this.createBoingEffect(audioContext, now);
        break;
      case 'crickets':
        this.createCricketEffect(audioContext, now);
        break;
      case 'trombone':
        this.createTromboneEffect(audioContext, now);
        break;
      case 'confetti':
        this.createConfettiEffect(audioContext, now);
        break;
      case 'buzzer':
        this.createBuzzerEffect(audioContext, now);
        break;
      case 'cheer':
        this.createCheerEffect(audioContext, now);
        break;
      default:
        this.createTone(audioContext, 440, 0.3, now);
    }
  }

  private createApplauseEffect(ctx: AudioContext, startTime: number): void {
    // Create multiple short noise bursts to simulate clapping
    for (let i = 0; i < 30; i++) {
      const bufferSize = 2048;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      
      for (let j = 0; j < bufferSize; j++) {
        data[j] = (Math.random() * 2 - 1) * 0.15;
      }
      
      const source = ctx.createBufferSource();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      source.buffer = buffer;
      filter.type = 'bandpass';
      filter.frequency.value = 800 + Math.random() * 1200;
      
      source.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      const time = startTime + (i * 0.05) + (Math.random() * 0.02);
      gainNode.gain.setValueAtTime(0.2, time);
      gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
      
      source.start(time);
      source.stop(time + 0.1);
    }
  }

  private createAirhornEffect(ctx: AudioContext, startTime: number): void {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(150, startTime);
    oscillator.frequency.linearRampToValueAtTime(300, startTime + 0.1);
    oscillator.frequency.setValueAtTime(300, startTime + 0.1);
    oscillator.frequency.linearRampToValueAtTime(150, startTime + 1.2);
    
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.6, startTime + 0.01);
    gainNode.gain.setValueAtTime(0.6, startTime + 1.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 1.2);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + 1.2);
  }

  private createDrumrollEffect(ctx: AudioContext, startTime: number): void {
    // Rapid low-frequency noise bursts
    for (let i = 0; i < 60; i++) {
      const bufferSize = 512;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      
      for (let j = 0; j < bufferSize; j++) {
        data[j] = (Math.random() * 2 - 1) * 0.3;
      }
      
      const source = ctx.createBufferSource();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      source.buffer = buffer;
      filter.type = 'lowpass';
      filter.frequency.value = 150;
      
      source.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      const time = startTime + (i * 0.03);
      gainNode.gain.setValueAtTime(0.2, time);
      gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.03);
      
      source.start(time);
      source.stop(time + 0.03);
    }
  }

  private createDingEffect(ctx: AudioContext, startTime: number): void {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.value = 1000;
    
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.5, startTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 1.5);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + 1.5);
  }

  private createWooshEffect(ctx: AudioContext, startTime: number): void {
    const bufferSize = 8192;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.3;
    }
    
    const source = ctx.createBufferSource();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    
    source.buffer = buffer;
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2000, startTime);
    filter.frequency.exponentialRampToValueAtTime(200, startTime + 0.8);
    
    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.4, startTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.8);
    
    source.start(startTime);
    source.stop(startTime + 0.8);
  }

  private createFanfareEffect(ctx: AudioContext, startTime: number): void {
    // Play a triumphant chord progression
    const frequencies = [523, 659, 784]; // C, E, G major chord
    
    frequencies.forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = 'triangle';
      oscillator.frequency.value = freq;
      
      const time = startTime + (index * 0.1);
      gainNode.gain.setValueAtTime(0, time);
      gainNode.gain.linearRampToValueAtTime(0.3, time + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, time + 1);
      
      oscillator.start(time);
      oscillator.stop(time + 1);
    });
  }

  private createBoingEffect(ctx: AudioContext, startTime: number): void {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, startTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, startTime + 0.5);
    
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.4, startTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + 0.5);
  }

  private createCricketEffect(ctx: AudioContext, startTime: number): void {
    // High frequency chirps
    for (let i = 0; i < 5; i++) {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.value = 3000 + Math.random() * 1000;
      
      const time = startTime + (i * 0.2);
      gainNode.gain.setValueAtTime(0, time);
      gainNode.gain.linearRampToValueAtTime(0.2, time + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
      
      oscillator.start(time);
      oscillator.stop(time + 0.1);
    }
  }

  private createTromboneEffect(ctx: AudioContext, startTime: number): void {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(174, startTime); // Low F
    oscillator.frequency.linearRampToValueAtTime(87, startTime + 1); // Drop an octave
    
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.4, startTime + 0.1);
    gainNode.gain.setValueAtTime(0.4, startTime + 0.8);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 1);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + 1);
  }

  private createConfettiEffect(ctx: AudioContext, startTime: number): void {
    // Sparkly ascending tones
    for (let i = 0; i < 8; i++) {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.value = 400 + (i * 100);
      
      const time = startTime + (i * 0.05);
      gainNode.gain.setValueAtTime(0, time);
      gainNode.gain.linearRampToValueAtTime(0.3, time + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
      
      oscillator.start(time);
      oscillator.stop(time + 0.2);
    }
  }

  private createBuzzerEffect(ctx: AudioContext, startTime: number): void {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.type = 'square';
    oscillator.frequency.value = 100;
    
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.5, startTime + 0.01);
    gainNode.gain.setValueAtTime(0.5, startTime + 0.8);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 1);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + 1);
  }

  private createCheerEffect(ctx: AudioContext, startTime: number): void {
    // Multiple overlapping tones for crowd effect
    const frequencies = [200, 300, 400, 500, 600];
    
    frequencies.forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = 'triangle';
      oscillator.frequency.value = freq + Math.random() * 50;
      
      const time = startTime + (index * 0.02);
      gainNode.gain.setValueAtTime(0, time);
      gainNode.gain.linearRampToValueAtTime(0.2, time + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, time + 1.5);
      
      oscillator.start(time);
      oscillator.stop(time + 1.5);
    });
  }

  private createTone(ctx: AudioContext, frequency: number, duration: number, startTime: number): void {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + duration);
  }

  async playSound(soundName: string): Promise<void> {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    console.log(`AudioManager: Attempting to play ${soundName}`);
    console.log(`AudioManager: userInteracted = ${this.userInteracted}`);
    console.log(`AudioManager: isMobile = ${isMobile}`);
    
    if (!this.userInteracted) {
      console.warn('AudioManager: User has not interacted with the page yet. Audio is disabled.');
      return;
    }

    const sound = this.sounds[soundName];
    console.log(`AudioManager: Sound object exists: ${!!sound}`);
    console.log(`AudioManager: Sound state: ${sound ? sound.state() : 'N/A'}`);
    
    // On mobile devices, force fallback to Web Audio API for better compatibility
    if (isMobile) {
      console.log(`AudioManager: Mobile device detected, using Web Audio API fallback for ${soundName}`);
      this.createFallbackSound(soundName);
      return;
    }
    
    // Check if the sound is loaded. If not, use the fallback.
    if (sound && sound.state() === 'loaded') {
      try {
        sound.play();
        console.log(`AudioManager: Playing preloaded audio for ${soundName}`);
      } catch (error) {
        console.error(`AudioManager: Error playing preloaded audio for ${soundName}:`, error);
        console.log(`AudioManager: Falling back to Web Audio API for ${soundName}`);
        this.createFallbackSound(soundName);
      }
    } else {
      console.warn(`AudioManager: Audio for ${soundName} not loaded or failed to load. Using fallback.`);
      console.log(`AudioManager: Sound state: ${sound ? sound.state() : 'sound object missing'}`);
      this.createFallbackSound(soundName);
    }
  }
}

export const audioManager = new AudioManager();