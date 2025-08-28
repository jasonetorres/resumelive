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
    for (let i = 0; i < data.length; i++) {
      // Generate random noise with envelope
      const envelope = Math.max(0, 1 - (i / data.length));
      data[i] = (Math.random() * 2 - 1) * envelope * 0.3;
    }
  }

  private generateAirhorn(buffer: AudioBuffer) {
    const data = buffer.getChannelData(0);
    const sampleRate = buffer.sampleRate;
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const frequency = 440 + Math.sin(t * 10) * 100; // Varying frequency
      data[i] = Math.sin(2 * Math.PI * frequency * t) * 0.5;
    }
  }

  private generateDrumroll(buffer: AudioBuffer) {
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      // Rapid noise bursts
      const burst = Math.sin(i * 0.1) > 0.8 ? (Math.random() * 2 - 1) * 0.4 : 0;
      data[i] = burst;
    }
  }

  private generateDing(buffer: AudioBuffer) {
    const data = buffer.getChannelData(0);
    const sampleRate = buffer.sampleRate;
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 5); // Decay envelope
      data[i] = Math.sin(2 * Math.PI * 800 * t) * envelope * 0.3;
    }
  }

  private generateWoosh(buffer: AudioBuffer) {
    const data = buffer.getChannelData(0);
    const sampleRate = buffer.sampleRate;
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const frequency = 200 - t * 150; // Descending frequency
      data[i] = (Math.random() * 2 - 1) * Math.sin(2 * Math.PI * frequency * t) * 0.2;
    }
  }

  private generateFanfare(buffer: AudioBuffer) {
    const data = buffer.getChannelData(0);
    const sampleRate = buffer.sampleRate;
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const note1 = Math.sin(2 * Math.PI * 523 * t); // C5
      const note2 = Math.sin(2 * Math.PI * 659 * t); // E5
      const note3 = Math.sin(2 * Math.PI * 784 * t); // G5
      data[i] = (note1 + note2 + note3) * 0.2;
    }
  }

  private generateBoing(buffer: AudioBuffer) {
    const data = buffer.getChannelData(0);
    const sampleRate = buffer.sampleRate;
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const frequency = 100 + Math.sin(t * 20) * 200; // Bouncing frequency
      const envelope = Math.exp(-t * 3);
      data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.3;
    }
  }

  private generateCricket(buffer: AudioBuffer) {
    const data = buffer.getChannelData(0);
    const sampleRate = buffer.sampleRate;
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const chirp = Math.sin(t * 100) > 0.9 ? Math.sin(2 * Math.PI * 3000 * t) * 0.1 : 0;
      data[i] = chirp;
    }
  }

  private generateTrombone(buffer: AudioBuffer) {
    const data = buffer.getChannelData(0);
    const sampleRate = buffer.sampleRate;
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      const frequency = 200 - t * 50; // Descending sad trombone
      data[i] = Math.sin(2 * Math.PI * frequency * t) * 0.3;
    }
  }

  private generateConfetti(buffer: AudioBuffer) {
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      // Sparkly random bursts
      const sparkle = Math.random() > 0.95 ? (Math.random() * 2 - 1) * 0.2 : 0;
      data[i] = sparkle;
    }
  }

  private generateBuzzer(buffer: AudioBuffer) {
    const data = buffer.getChannelData(0);
    const sampleRate = buffer.sampleRate;
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;
      // Harsh buzzer sound
      data[i] = Math.sign(Math.sin(2 * Math.PI * 150 * t)) * 0.4;
    }
  }

  private generateCheer(buffer: AudioBuffer) {
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      // Crowd-like noise with varying intensity
      const intensity = 0.5 + Math.sin(i * 0.001) * 0.3;
      data[i] = (Math.random() * 2 - 1) * intensity * 0.3;
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