// Enhanced audio manager with realistic sound synthesis
class AudioManager {
  private audioContext: AudioContext | null = null;
  
  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  // Create realistic drum roll using noise and filtering
  private async createDrumRoll(): Promise<void> {
    const ctx = this.getAudioContext();
    const duration = 2.0;
    
    // Create noise buffer for snare drum
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Generate white noise
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    // Create multiple hits with increasing frequency
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    
    // High-pass filter for snare sound
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 200;
    filter.Q.value = 1;
    
    // Gain envelope for drum roll acceleration
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    source.start();
    source.stop(ctx.currentTime + duration);
    
    return new Promise(resolve => setTimeout(resolve, duration * 1000));
  }

  // Create realistic applause using multiple noise bursts
  private async createApplause(): Promise<void> {
    const ctx = this.getAudioContext();
    const duration = 3.0;
    
    // Create multiple clap sounds
    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        const bufferSize = ctx.sampleRate * 0.1;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        // Generate burst of noise for clap
        for (let j = 0; j < bufferSize; j++) {
          data[j] = (Math.random() * 2 - 1) * Math.exp(-j / (bufferSize * 0.3));
        }
        
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1000 + Math.random() * 2000;
        filter.Q.value = 2;
        
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.1 + Math.random() * 0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        
        source.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        
        source.start();
        source.stop(ctx.currentTime + 0.1);
      }, i * 50 + Math.random() * 100);
    }
    
    return new Promise(resolve => setTimeout(resolve, duration * 1000));
  }

  // Create air horn sound
  private async createAirHorn(): Promise<void> {
    const ctx = this.getAudioContext();
    const duration = 1.5;
    
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(220, ctx.currentTime);
    oscillator.frequency.linearRampToValueAtTime(180, ctx.currentTime + duration);
    
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    
    oscillator.start();
    oscillator.stop(ctx.currentTime + duration);
    
    return new Promise(resolve => setTimeout(resolve, duration * 1000));
  }

  // Create ding sound
  private async createDing(): Promise<void> {
    const ctx = this.getAudioContext();
    const duration = 1.0;
    
    // Create bell-like sound with multiple harmonics
    const frequencies = [800, 1200, 1600, 2000];
    
    frequencies.forEach((freq, index) => {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.value = freq;
      
      const volume = 0.3 / (index + 1); // Decreasing volume for harmonics
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      
      oscillator.start();
      oscillator.stop(ctx.currentTime + duration);
    });
    
    return new Promise(resolve => setTimeout(resolve, duration * 1000));
  }

  // Create woosh sound
  private async createWoosh(): Promise<void> {
    const ctx = this.getAudioContext();
    const duration = 0.8;
    
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Generate filtered noise that sweeps frequency
    for (let i = 0; i < bufferSize; i++) {
      const t = i / bufferSize;
      const noise = Math.random() * 2 - 1;
      const envelope = Math.sin(t * Math.PI) * Math.exp(-t * 3);
      data[i] = noise * envelope * 0.3;
    }
    
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2000, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + duration);
    
    source.connect(filter);
    filter.connect(ctx.destination);
    
    source.start();
    
    return new Promise(resolve => setTimeout(resolve, duration * 1000));
  }

  // Create fanfare sound
  private async createFanfare(): Promise<void> {
    const ctx = this.getAudioContext();
    const duration = 2.0;
    
    // Trumpet fanfare chord progression
    const chords = [
      [262, 330, 392], // C major
      [294, 370, 440], // D major  
      [330, 415, 494], // E major
      [349, 440, 523]  // F major
    ];
    
    chords.forEach((chord, chordIndex) => {
      setTimeout(() => {
        chord.forEach((freq, noteIndex) => {
          const oscillator = ctx.createOscillator();
          const gain = ctx.createGain();
          
          oscillator.type = 'sawtooth';
          oscillator.frequency.value = freq;
          
          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
          
          oscillator.connect(gain);
          gain.connect(ctx.destination);
          
          oscillator.start();
          oscillator.stop(ctx.currentTime + 0.4);
        });
      }, chordIndex * 300);
    });
    
    return new Promise(resolve => setTimeout(resolve, duration * 1000));
  }

  // Create boing sound
  private async createBoing(): Promise<void> {
    const ctx = this.getAudioContext();
    const duration = 0.6;
    
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + duration);
    
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    
    oscillator.start();
    oscillator.stop(ctx.currentTime + duration);
    
    return new Promise(resolve => setTimeout(resolve, duration * 1000));
  }

  // Create cricket sound
  private async createCricket(): Promise<void> {
    const ctx = this.getAudioContext();
    
    // Create chirping pattern
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.value = 3000 + Math.random() * 1000;
        
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        
        oscillator.connect(gain);
        gain.connect(ctx.destination);
        
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.1);
      }, i * 200);
    }
    
    return new Promise(resolve => setTimeout(resolve, 1200));
  }

  // Create sad trombone
  private async createTrombone(): Promise<void> {
    const ctx = this.getAudioContext();
    const duration = 1.5;
    
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(220, ctx.currentTime);
    oscillator.frequency.linearRampToValueAtTime(180, ctx.currentTime + 0.5);
    oscillator.frequency.linearRampToValueAtTime(150, ctx.currentTime + 1.0);
    oscillator.frequency.linearRampToValueAtTime(120, ctx.currentTime + duration);
    
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    
    oscillator.start();
    oscillator.stop(ctx.currentTime + duration);
    
    return new Promise(resolve => setTimeout(resolve, duration * 1000));
  }

  // Create confetti sound
  private async createConfetti(): Promise<void> {
    const ctx = this.getAudioContext();
    
    // Create sparkly popping sounds
    for (let i = 0; i < 15; i++) {
      setTimeout(() => {
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.value = 1000 + Math.random() * 2000;
        
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        
        oscillator.connect(gain);
        gain.connect(ctx.destination);
        
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.05);
      }, i * 50 + Math.random() * 100);
    }
    
    return new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Create buzzer sound
  private async createBuzzer(): Promise<void> {
    const ctx = this.getAudioContext();
    const duration = 1.0;
    
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    
    oscillator.type = 'square';
    oscillator.frequency.value = 150;
    
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    
    oscillator.start();
    oscillator.stop(ctx.currentTime + duration);
    
    return new Promise(resolve => setTimeout(resolve, duration * 1000));
  }

  // Create cheer sound
  private async createCheer(): Promise<void> {
    const ctx = this.getAudioContext();
    const duration = 2.0;
    
    // Create crowd noise using filtered noise
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      const t = i / bufferSize;
      const noise = Math.random() * 2 - 1;
      const envelope = Math.sin(t * Math.PI * 2) * Math.exp(-t * 2);
      data[i] = noise * envelope * 0.2;
    }
    
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 800;
    filter.Q.value = 2;
    
    source.connect(filter);
    filter.connect(ctx.destination);
    
    source.start();
    
    return new Promise(resolve => setTimeout(resolve, duration * 1000));
  }

  async playSound(soundName: string): Promise<void> {
    try {
      // Resume audio context if suspended (required by browsers)
      const ctx = this.getAudioContext();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      switch (soundName) {
        case 'applause':
          await this.createApplause();
          break;
        case 'airhorn':
          await this.createAirHorn();
          break;
        case 'drumroll':
          await this.createDrumRoll();
          break;
        case 'ding':
          await this.createDing();
          break;
        case 'woosh':
          await this.createWoosh();
          break;
        case 'fanfare':
          await this.createFanfare();
          break;
        case 'boing':
          await this.createBoing();
          break;
        case 'cricket':
          await this.createCricket();
          break;
        case 'trombone':
          await this.createTrombone();
          break;
        case 'confetti':
          await this.createConfetti();
          break;
        case 'buzzer':
          await this.createBuzzer();
          break;
        case 'cheer':
          await this.createCheer();
          break;
        default:
          // Simple beep fallback
          await this.generateSimpleBeep(440, 0.3);
      }
    } catch (error) {
      console.error(`Error playing sound ${soundName}:`, error);
      // Fallback to simple beep
      await this.generateSimpleBeep(440, 0.3);
    }
  }

  private async generateSimpleBeep(frequency: number, duration: number): Promise<void> {
    return new Promise((resolve) => {
      try {
        const ctx = this.getAudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
        
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + duration);
        
        setTimeout(resolve, duration * 1000);
      } catch (error) {
        console.warn('Audio generation failed:', error);
        resolve();
      }
    });
  }
}

// Create singleton instance
export const audioManager = new AudioManager();