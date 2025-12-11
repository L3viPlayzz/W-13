import { useCallback, useRef, useEffect } from 'react';
import { useSystemSettings } from './SystemSettingsContext';

type SoundType = 'click' | 'open' | 'close' | 'minimize' | 'notification' | 'error' | 'startup' | 'hover';

interface SoundConfig {
  frequency: number;
  duration: number;
  type: OscillatorType;
  volume: number;
  attack?: number;
  decay?: number;
  secondFrequency?: number;
}

const soundConfigs: Record<SoundType, SoundConfig> = {
  click: {
    frequency: 800,
    duration: 0.05,
    type: 'sine',
    volume: 0.15,
    attack: 0.005,
    decay: 0.04,
  },
  hover: {
    frequency: 600,
    duration: 0.03,
    type: 'sine',
    volume: 0.08,
    attack: 0.005,
    decay: 0.025,
  },
  open: {
    frequency: 400,
    duration: 0.15,
    type: 'sine',
    volume: 0.2,
    attack: 0.01,
    decay: 0.14,
    secondFrequency: 600,
  },
  close: {
    frequency: 500,
    duration: 0.12,
    type: 'sine',
    volume: 0.18,
    attack: 0.01,
    decay: 0.11,
    secondFrequency: 350,
  },
  minimize: {
    frequency: 600,
    duration: 0.1,
    type: 'sine',
    volume: 0.15,
    attack: 0.01,
    decay: 0.09,
    secondFrequency: 400,
  },
  notification: {
    frequency: 880,
    duration: 0.3,
    type: 'sine',
    volume: 0.25,
    attack: 0.02,
    decay: 0.28,
    secondFrequency: 1100,
  },
  error: {
    frequency: 200,
    duration: 0.25,
    type: 'sawtooth',
    volume: 0.2,
    attack: 0.01,
    decay: 0.24,
  },
  startup: {
    frequency: 440,
    duration: 0.6,
    type: 'sine',
    volume: 0.3,
    attack: 0.1,
    decay: 0.5,
    secondFrequency: 660,
  },
};

export function useSoundEffects() {
  const { settings } = useSystemSettings();
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      audioContextRef.current = new AudioContext();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  const playSound = useCallback((type: SoundType) => {
    if (settings.sound.isMuted || !settings.sound.systemSounds) {
      return;
    }

    const config = soundConfigs[type];
    const volumeMultiplier = settings.sound.masterVolume / 100;
    const finalVolume = config.volume * volumeMultiplier;

    if (finalVolume <= 0) return;

    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = config.type;
      oscillator.frequency.setValueAtTime(config.frequency, now);

      if (config.secondFrequency) {
        oscillator.frequency.linearRampToValueAtTime(
          config.secondFrequency,
          now + config.duration
        );
      }

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(finalVolume, now + (config.attack || 0.01));
      gainNode.gain.linearRampToValueAtTime(0, now + config.duration);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(now);
      oscillator.stop(now + config.duration + 0.05);
    } catch (e) {
      console.warn('Sound playback failed:', e);
    }
  }, [settings.sound, getAudioContext]);

  const playNotificationSound = useCallback(() => {
    if (settings.sound.isMuted || !settings.sound.notificationSounds) {
      return;
    }
    playSound('notification');
  }, [settings.sound, playSound]);

  return {
    playClick: useCallback(() => playSound('click'), [playSound]),
    playHover: useCallback(() => playSound('hover'), [playSound]),
    playOpen: useCallback(() => playSound('open'), [playSound]),
    playClose: useCallback(() => playSound('close'), [playSound]),
    playMinimize: useCallback(() => playSound('minimize'), [playSound]),
    playNotification: playNotificationSound,
    playError: useCallback(() => playSound('error'), [playSound]),
    playStartup: useCallback(() => playSound('startup'), [playSound]),
    playSound,
  };
}
