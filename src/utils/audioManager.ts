// Audio manager for soundboard effects
class AudioManager {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();

  constructor() {
    // Initialize audio context on first user interaction
    this.initAudioContext();
  }

  private initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  // Generate sound using Web Audio API
  private generateSound(type: string): AudioBuffer | null {
    if (!this.audioContext) return null;

    const sampleRate = this.audioContext.sampleRate;
    let duration = 1; // Default 1 second
    let buffer: AudioBuffer;

    switch (type) {
      case 'applause':
        duration = 2;
        buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        this.generateApplause(buffer);
        break;
      case 'airhorn':
        duration = 1.5;
        buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        this.generateAirhorn(buffer);
        break;
      case 'drumroll':
        duration = 3;
        buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        this.generateDrumroll(buffer);
        break;
      case 'ding':
        duration = 0.5;
        buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        this.generateDing(buffer);
        break;
      case 'woosh':
        duration = 1;
        buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        this.generateWoosh(buffer);
        break;
      case 'fanfare':
        duration = 2;
        buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        this.generateFanfare(buffer);
        break;
      case 'boing':
        duration = 0.8;
        buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        this.generateBoing(buffer);
        break;
      case 'cricket':
        duration = 1.5;
        buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        this.generateCricket(buffer);
        break;
      case 'trombone':
        duration = 2;
        buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        this.generateTrombone(buffer);
        break;
      case 'confetti':
        duration = 1.5;
        buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        this.generateConfetti(buffer);
        break;
      case 'buzzer':
        duration = 1;
        buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        this.generateBuzzer(buffer);
        break;
      case 'cheer':
        duration = 2;
        buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
        this.generateCheer(buffer);
        break;
      default:
        return null;
    }

    return buffer;
  }

  private generateApplause(buffer: AudioBuffer) {
    const data = buffer.getChannelData(0);
    const sampleRate = buffer.sampleRate;
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      // Create realistic applause with multiple clap bursts
      const clapFreq = 8 + Math.sin(t * 3) * 2; // Varying clap frequency
      const burst = Math.sin(t * clapFreq * Math.PI) > 0.7 ? 1 : 0;
      const noise = (Math.random() * 2 - 1) * burst;
      const envelope = Math.exp(-t * 0.8) * (0.3 + Math.sin(t * 15) * 0.2);
      data[i] = noise * envelope * 0.4;
    }
  }

  private generateAirhorn(buffer: AudioBuffer) {
    const data = buffer.getChannelData(0);
    const sampleRate = buffer.sampleRate;
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      // More realistic air horn with harmonics
      const fundamental = 220;
      const harmonic1 = Math.sin(2 * Math.PI * fundamental * t);
      const harmonic2 = Math.sin(2 * Math.PI * fundamental * 2 * t) * 0.5;
      const harmonic3 = Math.sin(2 * Math.PI * fundamental * 3 * t) * 0.25;
      const envelope = t < 0.1 ? t * 10 : (t > 1.2 ? Math.max(0, (1.5 - t) * 3) : 1);
      data[i] = (harmonic1 + harmonic2 + harmonic3) * envelope * 0.6;
    }
  }

  private generateDrumroll(buffer: AudioBuffer) {
    const data = buffer.getChannelData(0);
    const sampleRate = buffer.sampleRate;
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      // Create realistic drum roll with increasing intensity
      const rollSpeed = 20 + t * 40; // Speed increases over time
      const hit = Math.sin(t * rollSpeed * Math.PI);
      const snare = hit > 0.9 ? (Math.random() * 2 - 1) * 0.8 : 0;
      const lowFreq = Math.sin(2 * Math.PI * 80 * t) * 0.3;
      const envelope = Math.min(1, t * 3) * (1 - Math.pow(t / 3, 2));
      data[i] = (snare + lowFreq) * envelope * 0.5;
    }
  }

  private generateDing(buffer: AudioBuffer) {
    const data = buffer.getChannelData(0);
    const sampleRate = buffer.sampleRate;
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      // Bell-like sound with multiple harmonics
      const fundamental = 800;
      const harmonic1 = Math.sin(2 * Math.PI * fundamental * t);
      const harmonic2 = Math.sin(2 * Math.PI * fundamental * 2.4 * t) * 0.6;
      const harmonic3 = Math.sin(2 * Math.PI * fundamental * 4.2 * t) * 0.3;
      const envelope = Math.exp(-t * 4);
      data[i] = (harmonic1 + harmonic2 + harmonic3) * envelope * 0.4;
    }
  }

  private generateWoosh(buffer: AudioBuffer) {
    const data = buffer.getChannelData(0);
    const sampleRate = buffer.sampleRate;
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      // Wind-like whoosh with filtered noise
      const frequency = 400 - t * 300; // Descending sweep
      const noise = (Math.random() * 2 - 1);
      const tone = Math.sin(2 * Math.PI * frequency * t);
      const envelope = Math.sin(Math.PI * t); // Bell curve envelope
      data[i] = (noise * 0.7 + tone * 0.3) * envelope * 0.3;
    }
  }

  private generateFanfare(buffer: AudioBuffer) {
    const data = buffer.getChannelData(0);
    const sampleRate = buffer.sampleRate;
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      // Triumphant fanfare with brass-like timbre
      const phase = t * 2; // Two measures
      let note1, note2, note3;
      
      if (phase < 0.5) {
        note1 = Math.sin(2 * Math.PI * 523 * t); // C5
        note2 = Math.sin(2 * Math.PI * 659 * t); // E5
        note3 = Math.sin(2 * Math.PI * 784 * t); // G5
      } else {
        note1 = Math.sin(2 * Math.PI * 698 * t); // F5
        note2 = Math.sin(2 * Math.PI * 880 * t); // A5
        note3 = Math.sin(2 * Math.PI * 1047 * t); // C6
      }
      
      // Add brass-like harmonics
      const brass = (note1 + note2 * 0.8 + note3 * 0.6) * 0.3;
      const envelope = Math.min(1, t * 8) * Math.max(0, 1 - Math.pow((t - 1) / 1, 2));
      data[i] = brass * envelope;
    }
  }

  private generateBoing(buffer: AudioBuffer) {
    const data = buffer.getChannelData(0);
    const sampleRate = buffer.sampleRate;
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      // Spring boing with realistic bounce physics
      const bounceFreq = 8; // Number of bounces
      const decay = Math.exp(-t * 4);
      const bounce = Math.abs(Math.sin(t * bounceFreq * Math.PI)) * decay;
      const frequency = 150 + bounce * 300;
      const envelope = decay * (1 - t * 0.8);
      data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.4;
    }
  }

  private generateCricket(buffer: AudioBuffer) {
    const data = buffer.getChannelData(0);
    const sampleRate = buffer.sampleRate;
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      // More realistic cricket chirps
      const chirpRate = 12; // Chirps per second
      const chirpPhase = (t * chirpRate) % 1;
      const isChirping = chirpPhase < 0.1; // Short chirp duration
      const frequency = 3000 + Math.sin(t * 50) * 200;
      const chirp = isChirping ? Math.sin(2 * Math.PI * frequency * t) * 0.15 : 0;
      data[i] = chirp;
    }
  }

  private generateTrombone(buffer: AudioBuffer) {
    const data = buffer.getChannelData(0);
    const sampleRate = buffer.sampleRate;
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      // Classic "wah wah wah" sad trombone
      const baseFreq = 220;
      const slide = Math.exp(-t * 1.5); // Exponential slide down
      const frequency = baseFreq * slide;
      const vibrato = 1 + Math.sin(t * 12 * Math.PI) * 0.05;
      const envelope = Math.max(0, 1 - t * 0.5);
      data[i] = Math.sin(2 * Math.PI * frequency * vibrato * t) * envelope * 0.4;
    }
  }

  private generateConfetti(buffer: AudioBuffer) {
    const data = buffer.getChannelData(0);
    const sampleRate = buffer.sampleRate;
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      // Sparkly celebration with high frequency pops
      const popRate = 25;
      const isPop = Math.sin(t * popRate * Math.PI) > 0.8;
      const frequency = 1000 + Math.random() * 2000;
      const pop = isPop ? Math.sin(2 * Math.PI * frequency * t) * 0.3 : 0;
      const envelope = Math.max(0, 1 - t * 0.7);
      data[i] = pop * envelope;
    }
  }

  private generateBuzzer(buffer: AudioBuffer) {
    const data = buffer.getChannelData(0);
    const sampleRate = buffer.sampleRate;
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      // Game show style buzzer
      const frequency = 150;
      const square = Math.sign(Math.sin(2 * Math.PI * frequency * t));
      const envelope = t < 0.8 ? 1 : Math.max(0, (1 - t) * 5);
      data[i] = square * envelope * 0.5;
    }
  }

  private generateCheer(buffer: AudioBuffer) {
    const data = buffer.getChannelData(0);
    const sampleRate = buffer.sampleRate;
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      // Crowd cheer with realistic dynamics
      const intensity = 0.3 + Math.sin(t * 4) * 0.4 + Math.sin(t * 7) * 0.2;
      const noise = (Math.random() * 2 - 1);
      const envelope = Math.min(1, t * 5) * Math.max(0, 1 - Math.pow((t - 1) / 1, 2));
      data[i] = noise * intensity * envelope * 0.4;
    }
  }

  async playSound(soundName: string) {
    if (!this.audioContext) {
      console.warn('Audio context not available');
      return;
    }

    // Resume audio context if suspended (required by browsers)
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    // Get or generate sound
    let audioBuffer = this.sounds.get(soundName);
    if (!audioBuffer) {
      audioBuffer = this.generateSound(soundName);
      if (audioBuffer) {
        this.sounds.set(soundName, audioBuffer);
      }
    }

    if (!audioBuffer) {
      console.warn(`Sound not found: ${soundName}`);
      return;
    }

    // Play the sound
    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    
    source.buffer = audioBuffer;
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    // Set volume
    gainNode.gain.value = 0.5;
    
    source.start();
  }
}

// Create singleton instance
export const audioManager = new AudioManager();