class AudioManager {
  private userInteracted = false;
  private audioContext: AudioContext | null = null;

  constructor() {
    this.setupUserInteractionListener();
  }

  private setupUserInteractionListener(): void {
    const enableAudio = () => {
      if (this.userInteracted) return;
      
      this.userInteracted = true;
      this.initializeAudioContext();
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

  private initializeAudioContext(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }
      
      console.log('AudioManager: Audio context initialized');
    } catch (error) {
      console.error('AudioManager: Failed to initialize audio context:', error);
    }
  }

  private createTone(frequency: number, duration: number = 0.3): void {
    if (!this.audioContext || !this.userInteracted) {
      console.log('AudioManager: Audio not ready yet');
      return;
    }

    try {
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      // Envelope for better sound
      const now = this.audioContext.currentTime;
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
      
      oscillator.start(now);
      oscillator.stop(now + duration);
      
      console.log(`AudioManager: Played tone at ${frequency}Hz for ${duration}s`);
    } catch (error) {
      console.error('AudioManager: Error creating tone:', error);
    }
  }

  async playSound(soundName: string): Promise<void> {
    console.log(`AudioManager: Attempting to play ${soundName}`);
    
    if (!this.userInteracted) {
      console.log('AudioManager: No user interaction yet - click any button to enable audio');
      return;
    }

    // Different frequencies for different sounds
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

    const frequency = frequencies[soundName] || 440;
    this.createTone(frequency);
  }
}

export const audioManager = new AudioManager();