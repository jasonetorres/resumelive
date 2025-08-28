class AudioManager {
  private audioContext: AudioContext | null = null;
  private userInteracted = false;

  constructor() {
    // Setup user interaction listener
    this.setupUserInteractionListener();
  }

  private setupUserInteractionListener(): void {
    const enableAudio = async () => {
      if (this.userInteracted) return;
      
      try {
        // Create and resume audio context
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        if (this.audioContext.state === 'suspended') {
          await this.audioContext.resume();
        }
        
        this.userInteracted = true;
        console.log('AudioManager: Audio enabled by user interaction');
        
        // Remove listeners after first interaction
        document.removeEventListener('click', enableAudio);
        document.removeEventListener('touchstart', enableAudio);
        document.removeEventListener('keydown', enableAudio);
      } catch (error) {
        console.error('AudioManager: Failed to initialize audio:', error);
      }
    };

    document.addEventListener('click', enableAudio);
    document.addEventListener('touchstart', enableAudio);
    document.addEventListener('keydown', enableAudio);
  }

  private createTone(frequency: number, duration: number, type: OscillatorType = 'sine'): void {
    if (!this.audioContext || !this.userInteracted) {
      console.log('AudioManager: Audio not ready yet');
      return;
    }

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = type;
      
      // Envelope for smooth sound
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

  private createDrumRoll(): void {
    if (!this.audioContext || !this.userInteracted) return;

    try {
      // Create multiple quick hits that speed up
      const baseDelay = 0.1;
      for (let i = 0; i < 20; i++) {
        const delay = i * (baseDelay * (1 - i * 0.03)); // Speed up over time
        setTimeout(() => {
          this.createTone(200 + Math.random() * 100, 0.05, 'square');
        }, delay * 1000);
      }
    } catch (error) {
      console.error('AudioManager: Error creating drum roll:', error);
    }
  }

  private createApplause(): void {
    if (!this.audioContext || !this.userInteracted) return;

    try {
      // Create multiple claps
      for (let i = 0; i < 15; i++) {
        setTimeout(() => {
          this.createTone(800 + Math.random() * 400, 0.1, 'square');
        }, Math.random() * 2000);
      }
    } catch (error) {
      console.error('AudioManager: Error creating applause:', error);
    }
  }

  async playSound(soundName: string): Promise<void> {
    console.log(`AudioManager: Attempting to play ${soundName}`);
    
    if (!this.userInteracted) {
      console.log('AudioManager: Waiting for user interaction...');
      return;
    }

    try {
      switch (soundName) {
        case 'applause':
          this.createApplause();
          break;
        case 'drumroll':
          this.createDrumRoll();
          break;
        case 'airhorn':
          this.createTone(220, 1.0, 'sawtooth');
          break;
        case 'ding':
          this.createTone(800, 0.5);
          setTimeout(() => this.createTone(1200, 0.3), 100);
          break;
        case 'woosh':
          // Frequency sweep
          if (this.audioContext) {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            const now = this.audioContext.currentTime;
            oscillator.frequency.setValueAtTime(1000, now);
            oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.5);
            
            gainNode.gain.setValueAtTime(0.3, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
            
            oscillator.start(now);
            oscillator.stop(now + 0.5);
          }
          break;
        case 'fanfare':
          this.createTone(523, 0.3); // C
          setTimeout(() => this.createTone(659, 0.3), 300); // E
          setTimeout(() => this.createTone(784, 0.5), 600); // G
          break;
        case 'boing':
          if (this.audioContext) {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            const now = this.audioContext.currentTime;
            oscillator.frequency.setValueAtTime(800, now);
            oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.3);
            
            gainNode.gain.setValueAtTime(0.3, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            
            oscillator.start(now);
            oscillator.stop(now + 0.3);
          }
          break;
        case 'cricket':
          for (let i = 0; i < 3; i++) {
            setTimeout(() => this.createTone(3000, 0.1), i * 200);
          }
          break;
        case 'trombone':
          this.createTone(220, 0.3, 'sawtooth');
          setTimeout(() => this.createTone(196, 0.3, 'sawtooth'), 300);
          setTimeout(() => this.createTone(174, 0.4, 'sawtooth'), 600);
          break;
        case 'confetti':
          for (let i = 0; i < 8; i++) {
            setTimeout(() => {
              this.createTone(1500 + Math.random() * 1000, 0.1);
            }, i * 50);
          }
          break;
        case 'buzzer':
          this.createTone(150, 0.8, 'square');
          break;
        case 'cheer':
          for (let i = 0; i < 10; i++) {
            setTimeout(() => {
              this.createTone(600 + Math.random() * 400, 0.2);
            }, Math.random() * 1000);
          }
          break;
        default:
          this.createTone(440, 0.3);
      }
    } catch (error) {
      console.error(`AudioManager: Error playing ${soundName}:`, error);
    }
  }
}

export const audioManager = new AudioManager();