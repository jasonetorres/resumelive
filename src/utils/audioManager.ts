// Audio manager for soundboard effects using real audio files
class AudioManager {
  private audioCache: Map<string, HTMLAudioElement> = new Map();
  
  // Free sound URLs from various sources
  private soundUrls: Record<string, string> = {
    applause: "https://www.soundjay.com/misc/sounds/applause-01.wav",
    airhorn: "https://www.soundjay.com/misc/sounds/air-horn-01.wav", 
    drumroll: "https://www.soundjay.com/misc/sounds/drum-roll-01.wav",
    ding: "https://www.soundjay.com/misc/sounds/bell-ding-01.wav",
    woosh: "https://www.soundjay.com/misc/sounds/woosh-01.wav",
    fanfare: "https://www.soundjay.com/misc/sounds/fanfare-01.wav",
    boing: "https://www.soundjay.com/misc/sounds/boing-01.wav",
    cricket: "https://www.soundjay.com/misc/sounds/cricket-01.wav",
    trombone: "https://www.soundjay.com/misc/sounds/sad-trombone-01.wav",
    confetti: "https://www.soundjay.com/misc/sounds/party-horn-01.wav",
    buzzer: "https://www.soundjay.com/misc/sounds/buzzer-01.wav",
    cheer: "https://www.soundjay.com/misc/sounds/cheer-01.wav"
  };

  // Fallback to simple beep tones if external sounds fail
  private generateSimpleBeep(frequency: number, duration: number): Promise<void> {
    return new Promise((resolve) => {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
        
        setTimeout(resolve, duration * 1000);
      } catch (error) {
        console.warn('Audio generation failed:', error);
        resolve();
      }
    });
  }

  private async loadAudio(soundName: string): Promise<HTMLAudioElement> {
    // Check cache first
    if (this.audioCache.has(soundName)) {
      return this.audioCache.get(soundName)!;
    }

    const audio = new Audio();
    
    // Set up audio properties
    audio.preload = 'auto';
    audio.volume = 0.7;
    
    // Try to load the sound URL
    const soundUrl = this.soundUrls[soundName];
    if (soundUrl) {
      audio.src = soundUrl;
      
      // Test if the audio loads successfully
      try {
        await new Promise((resolve, reject) => {
          audio.addEventListener('canplaythrough', resolve, { once: true });
          audio.addEventListener('error', reject, { once: true });
          audio.load();
          
          // Timeout after 3 seconds
          setTimeout(() => reject(new Error('Audio load timeout')), 3000);
        });
        
        this.audioCache.set(soundName, audio);
        return audio;
      } catch (error) {
        console.warn(`Failed to load audio for ${soundName}:`, error);
      }
    }
    
    // Fallback: return null to use beep sounds
    return null as any;
  }

  async playSound(soundName: string): Promise<void> {
    try {
      const audio = await this.loadAudio(soundName);
      
      if (audio) {
        // Reset audio to beginning and play
        audio.currentTime = 0;
        await audio.play();
      } else {
        // Fallback to simple beep tones
        await this.playFallbackSound(soundName);
      }
    } catch (error) {
      console.warn(`Failed to play sound ${soundName}:`, error);
      // Try fallback beep
      await this.playFallbackSound(soundName);
    }
  }

  private async playFallbackSound(soundName: string): Promise<void> {
    // Simple beep tones as fallback
    const fallbackTones: Record<string, { freq: number; duration: number }> = {
      applause: { freq: 400, duration: 0.5 },
      airhorn: { freq: 220, duration: 1.0 },
      drumroll: { freq: 150, duration: 0.8 },
      ding: { freq: 800, duration: 0.3 },
      woosh: { freq: 300, duration: 0.6 },
      fanfare: { freq: 523, duration: 0.8 },
      boing: { freq: 200, duration: 0.5 },
      cricket: { freq: 3000, duration: 0.2 },
      trombone: { freq: 180, duration: 1.2 },
      confetti: { freq: 1000, duration: 0.4 },
      buzzer: { freq: 150, duration: 0.8 },
      cheer: { freq: 500, duration: 0.6 }
    };

    const tone = fallbackTones[soundName] || { freq: 440, duration: 0.3 };
    await this.generateSimpleBeep(tone.freq, tone.duration);
  }
}

// Create singleton instance
export const audioManager = new AudioManager();