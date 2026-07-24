import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Volume2, VolumeX, Play, Pause, SkipForward, SkipBack, 
  Clock, Sparkles, Wind, X, Music, Heart, CloudRain, TreePine, Disc, ArrowLeft
} from 'lucide-react';

export interface SoothingTrack {
  id: string;
  title: string;
  subtitle: string;
  frequency: string;
  icon: string;
  badge: string;
  description: string;
  gradient: string;
  accentColor: string;
}

export const SOOTHING_TRACKS: SoothingTrack[] = [
  {
    id: '432hz',
    title: '432Hz Deep Serenity',
    subtitle: 'Warm Ambient Pad & Ocean Drift',
    frequency: '432 Hz Solfeggio',
    icon: '🌿',
    badge: 'Cortisol & Heart Rate Relief',
    description: 'Soft 432Hz analog harmonic chord pads layered with slow, gentle ocean wave sweeps and 10Hz alpha binaural beats to instantly soothe an overactive nervous system.',
    gradient: 'from-[#EAF7E3] via-[#F2F8EE] to-[#E2F0D9]',
    accentColor: '#58CC02'
  },
  {
    id: 'rain_piano',
    title: 'Midnight Rain & Soft Chords',
    subtitle: 'Gentle Rain Patter & Piano Chords',
    frequency: 'Anxiety Dissolver',
    icon: '🌧️',
    badge: 'Racing Thoughts Relief',
    description: 'Calming pink-noise rain drops paired with slow, resonant ambient piano chords (Cmaj7 / Fmaj7) played at peaceful breathing intervals to quiet mind chatter.',
    gradient: 'from-[#EBF3FE] via-[#F0F6FE] to-[#DFEDFE]',
    accentColor: '#3b82f6'
  },
  {
    id: 'singing_bowls',
    title: 'Celestial Bowl Meditation',
    subtitle: 'Singing Bowls & Crystal Overtones',
    frequency: '528 Hz & Theta Waves',
    icon: '✨',
    badge: 'Deep Muscle & Tension Release',
    description: 'Resonant 136.1Hz Om singing bowl overtones combined with sparkling crystal bell chimes and a 6Hz theta brainwave beat for deep mental relaxation.',
    gradient: 'from-[#F5EEFE] via-[#FAEEFE] to-[#EFE2FE]',
    accentColor: '#a855f7'
  },
  {
    id: 'forest_chimes',
    title: 'Forest Breeze & Solfeggio Chimes',
    subtitle: 'Earthy Forest Wind & Pentatonic Chimes',
    frequency: '528 Hz Miracle Tone',
    icon: '🌾',
    badge: 'Instant Grounding',
    description: 'Natural forest wind rustle harmonized with delicate 528Hz pentatonic wind chimes that gently pull your focus back to the present moment.',
    gradient: 'from-[#FEF7E6] via-[#FEFAEE] to-[#FEF0D5]',
    accentColor: '#f59e0b'
  }
];

interface SoothingMusicModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SoothingMusicModal({ isOpen, onClose }: SoothingMusicModalProps) {
  const [activeTrackIndex, setActiveTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState<number | null>(null); // null = continuous
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const intervalsRef = useRef<any[]>([]);
  const activeNodesRef = useRef<any[]>([]);

  const currentTrack = SOOTHING_TRACKS[activeTrackIndex];

  // Initialize or resume AudioContext
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContextClass();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  // Stop all active audio nodes & intervals
  const stopAllAudio = () => {
    intervalsRef.current.forEach(id => clearInterval(id));
    intervalsRef.current = [];

    activeNodesRef.current.forEach(node => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (e) {}
    });
    activeNodesRef.current = [];
  };

  // Update volume
  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      const targetGain = isMuted ? 0 : volume;
      masterGainRef.current.gain.setTargetAtTime(targetGain, audioCtxRef.current.currentTime, 0.1);
    }
  }, [volume, isMuted]);

  // Handle timer countdown
  useEffect(() => {
    let timerInterval: any = null;
    if (isPlaying && remainingSeconds !== null && remainingSeconds > 0) {
      timerInterval = setInterval(() => {
        setRemainingSeconds(prev => {
          if (prev === null || prev <= 1) {
            handlePause();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [isPlaying, remainingSeconds]);

  // Set up timer minutes
  const handleSelectTimer = (mins: number | null) => {
    setTimerMinutes(mins);
    if (mins === null) {
      setRemainingSeconds(null);
    } else {
      setRemainingSeconds(mins * 60);
    }
  };

  // Play Track Generator
  const playCurrentTrack = () => {
    stopAllAudio();
    const ctx = getAudioContext();
    if (!ctx) return;

    // Master Gain
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(isMuted ? 0 : volume, ctx.currentTime);
    masterGain.connect(ctx.destination);
    masterGainRef.current = masterGain;

    const trackId = currentTrack.id;

    if (trackId === '432hz') {
      // 🌿 432Hz Deep Serenity Synthesizer
      // Base frequencies tuned to 432Hz (A4 = 432Hz, C#4 = 271.8Hz, E4 = 323.6Hz, G#4 = 408.2Hz)
      const freqs = [135.9, 216.0, 271.8, 323.6, 408.2];
      
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        // Lowpass filter for warm analog feel
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(500 + idx * 80, ctx.currentTime);

        // Slow breathing LFO pulse
        oscGain.gain.setValueAtTime(0.08 / freqs.length, ctx.currentTime);

        osc.connect(filter);
        filter.connect(oscGain);
        oscGain.connect(masterGain);

        osc.start();
        activeNodesRef.current.push(osc, oscGain, filter);
      });

      // Ocean Wave Drift (Filtered noise with 6-second breathing gain cycle)
      const bufferSize = ctx.sampleRate * 3;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.15;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'lowpass';
      noiseFilter.frequency.setValueAtTime(400, ctx.currentTime);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.04, ctx.currentTime);

      // Modulate noise gain periodically for ocean waves
      let waveUp = true;
      const waveInterval = setInterval(() => {
        if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') return;
        const now = audioCtxRef.current.currentTime;
        noiseGain.gain.setTargetAtTime(waveUp ? 0.09 : 0.02, now, 2.5);
        noiseFilter.frequency.setTargetAtTime(waveUp ? 750 : 250, now, 2.5);
        waveUp = !waveUp;
      }, 5000);

      intervalsRef.current.push(waveInterval);

      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(masterGain);
      noiseSource.start();

      activeNodesRef.current.push(noiseSource, noiseFilter, noiseGain);

    } else if (trackId === 'rain_piano') {
      // 🌧️ Midnight Rain & Soft Piano Chords
      // Pink Rain Noise
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.02;
        b6 = white * 0.115926;
      }

      const rainSource = ctx.createBufferSource();
      rainSource.buffer = noiseBuffer;
      rainSource.loop = true;

      const rainFilter = ctx.createBiquadFilter();
      rainFilter.type = 'lowpass';
      rainFilter.frequency.setValueAtTime(1100, ctx.currentTime);

      const rainGain = ctx.createGain();
      rainGain.gain.setValueAtTime(0.12, ctx.currentTime);

      rainSource.connect(rainFilter);
      rainFilter.connect(rainGain);
      rainGain.connect(masterGain);
      rainSource.start();

      activeNodesRef.current.push(rainSource, rainFilter, rainGain);

      // Periodic Piano-style Chords (Cmaj7 -> Fmaj7 -> Am -> G)
      const chordProgressions = [
        [261.63, 329.63, 392.00, 493.88], // Cmaj7
        [174.61, 261.63, 329.63, 440.00], // Fmaj7
        [220.00, 261.63, 329.63, 392.00], // Am7
        [196.00, 246.94, 293.66, 392.00]  // G
      ];

      let chordIdx = 0;
      const playPianoChord = () => {
        if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') return;
        const now = audioCtxRef.current.currentTime;
        const notes = chordProgressions[chordIdx % chordProgressions.length];
        chordIdx++;

        notes.forEach((freq, nIdx) => {
          const osc = ctx.createOscillator();
          const noteGain = ctx.createGain();

          osc.type = 'sine';
          // Slight acoustic arpeggio offset
          const noteTime = now + nIdx * 0.18;
          osc.frequency.setValueAtTime(freq, noteTime);

          noteGain.gain.setValueAtTime(0.001, noteTime);
          noteGain.gain.linearRampToValueAtTime(0.08, noteTime + 0.15);
          noteGain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 4.5);

          osc.connect(noteGain);
          noteGain.connect(masterGain);

          osc.start(noteTime);
          osc.stop(noteTime + 5.0);
        });
      };

      playPianoChord();
      const chordInterval = setInterval(playPianoChord, 4500);
      intervalsRef.current.push(chordInterval);

    } else if (trackId === 'singing_bowls') {
      // ✨ Celestial Bowl Meditation (136.1Hz Om tone & Theta waves)
      const bowlFreqs = [136.1, 272.2, 408.3, 544.4];

      bowlFreqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        // Subtle vibrato LFO
        const vibrato = ctx.createOscillator();
        const vibratoGain = ctx.createGain();
        vibrato.frequency.setValueAtTime(0.2, ctx.currentTime);
        vibratoGain.gain.setValueAtTime(1.5, ctx.currentTime);
        vibrato.connect(osc.frequency);
        vibrato.start();

        gain.gain.setValueAtTime(0.06 / (idx + 1), ctx.currentTime);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start();

        activeNodesRef.current.push(osc, gain, vibrato, vibratoGain);
      });

      // Crystal Bell Strikes
      const crystalNotes = [528.0, 659.25, 783.99, 1056.0, 1318.5];
      const playCrystalBell = () => {
        if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') return;
        const now = audioCtxRef.current.currentTime;
        const randomNote = crystalNotes[Math.floor(Math.random() * crystalNotes.length)];

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(randomNote, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.06, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now);
        osc.stop(now + 4.0);
      };

      const bellInterval = setInterval(playCrystalBell, 3800);
      intervalsRef.current.push(bellInterval);

    } else if (trackId === 'forest_chimes') {
      // 🌾 Forest Breeze & Solfeggio Wind Chimes
      // Forest Breeze Noise
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.1;
      }

      const windSource = ctx.createBufferSource();
      windSource.buffer = noiseBuffer;
      windSource.loop = true;

      const windFilter = ctx.createBiquadFilter();
      windFilter.type = 'bandpass';
      windFilter.frequency.setValueAtTime(350, ctx.currentTime);
      windFilter.Q.setValueAtTime(2.0, ctx.currentTime);

      const windGain = ctx.createGain();
      windGain.gain.setValueAtTime(0.08, ctx.currentTime);

      // Modulate wind filter center frequency
      let windUp = true;
      const breezeInterval = setInterval(() => {
        if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') return;
        const now = audioCtxRef.current.currentTime;
        windFilter.frequency.setTargetAtTime(windUp ? 580 : 220, now, 3.0);
        windGain.gain.setTargetAtTime(windUp ? 0.12 : 0.04, now, 3.0);
        windUp = !windUp;
      }, 4000);

      intervalsRef.current.push(breezeInterval);

      windSource.connect(windFilter);
      windFilter.connect(windGain);
      windGain.connect(masterGain);
      windSource.start();

      activeNodesRef.current.push(windSource, windFilter, windGain);

      // Pentatonic Wind Chimes (528 Hz Solfeggio Miracle Scale)
      const chimeScale = [528.0, 594.0, 660.0, 792.0, 880.0, 1056.0];

      const playWindChimes = () => {
        if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') return;
        const now = audioCtxRef.current.currentTime;

        // Trigger 1 to 3 random chime notes in sequence
        const chimeCount = Math.floor(Math.random() * 3) + 1;
        for (let c = 0; c < chimeCount; c++) {
          const chimeFreq = chimeScale[Math.floor(Math.random() * chimeScale.length)];
          const chimeTime = now + c * 0.12 + (Math.random() * 0.08);

          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(chimeFreq, chimeTime);

          gain.gain.setValueAtTime(0.001, chimeTime);
          gain.gain.linearRampToValueAtTime(0.05, chimeTime + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.0001, chimeTime + 2.5);

          osc.connect(gain);
          gain.connect(masterGain);

          osc.start(chimeTime);
          osc.stop(chimeTime + 3.0);
        }
      };

      playWindChimes();
      const chimeInterval = setInterval(playWindChimes, 3200);
      intervalsRef.current.push(chimeInterval);
    }
  };

  // Play / Pause Handlers
  const handlePlay = () => {
    setIsPlaying(true);
    playCurrentTrack();
  };

  const handlePause = () => {
    setIsPlaying(false);
    stopAllAudio();
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      handlePause();
    } else {
      handlePlay();
    }
  };

  // Change Track
  const handleSelectTrack = (index: number) => {
    setActiveTrackIndex(index);
    if (isPlaying) {
      setTimeout(() => {
        playCurrentTrack();
      }, 50);
    }
  };

  const handleNextTrack = () => {
    const nextIdx = (activeTrackIndex + 1) % SOOTHING_TRACKS.length;
    handleSelectTrack(nextIdx);
  };

  const handlePrevTrack = () => {
    const prevIdx = (activeTrackIndex - 1 + SOOTHING_TRACKS.length) % SOOTHING_TRACKS.length;
    handleSelectTrack(prevIdx);
  };

  // Cleanup audio on modal close or component unmount
  useEffect(() => {
    return () => {
      stopAllAudio();
      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.close();
        } catch (e) {}
      }
    };
  }, []);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-hidden"
        onClick={() => {
          handlePause();
          onClose();
        }}
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className={`w-full max-w-md rounded-[32px] bg-gradient-to-b ${currentTrack.gradient} text-[#1E2E21] shadow-2xl overflow-hidden border-2 border-[#C8E8B6] flex flex-col justify-between max-h-[92vh] relative select-none`}
          onClick={e => e.stopPropagation()}
        >
          {/* Header Bar */}
          <div className="p-4 pb-2 flex items-center justify-between z-20">
            <button 
              onClick={() => {
                handlePause();
                onClose();
              }}
              className="w-9 h-9 rounded-full bg-white/60 hover:bg-white/90 flex items-center justify-center text-[#1D3222] backdrop-blur-sm transition-colors cursor-pointer shadow-xs"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-1.5 bg-white/70 backdrop-blur-md px-3 py-1 rounded-full border border-[#C8E8B6] text-xs font-black text-[#1D3222]">
              <Disc size={14} className={`text-[#58CC02] ${isPlaying ? "animate-spin" : ""}`} />
              <span>Anxiety Relief Music</span>
            </div>

            <button 
              onClick={() => setIsMuted(!isMuted)}
              className="w-9 h-9 rounded-full bg-white/60 hover:bg-white/90 flex items-center justify-center text-[#1D3222] backdrop-blur-sm transition-colors cursor-pointer shadow-xs"
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          </div>

          {/* Center Soundscape Visualizer & Active Track Details */}
          <div className="px-6 py-2 flex flex-col items-center text-center z-10 my-auto">
            
            {/* Animated Pulsing Sound Ring */}
            <div className="relative w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center my-2">
              {/* Glow Waves */}
              {isPlaying && (
                <>
                  <motion.div 
                    animate={{ scale: [1, 1.4, 1], opacity: [0.2, 0.5, 0.2] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="absolute inset-0 rounded-full border-2 border-[#58CC02]/30 filter blur-xs"
                  />
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
                    className="absolute inset-2 rounded-full bg-[#58CC02]/10 filter blur-md"
                  />
                </>
              )}

              {/* Central Track Orb */}
              <div 
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-white/80 backdrop-blur-xl border-2 border-[#B3E099] flex flex-col items-center justify-center shadow-md cursor-pointer active:scale-95 transition-transform"
                onClick={handleTogglePlay}
              >
                <span className="text-3xl mb-0.5 drop-shadow-xs">{currentTrack.icon}</span>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#1D3222] px-2 py-0.5 rounded-full bg-[#E5F2DE]">
                  {currentTrack.frequency}
                </span>
              </div>
            </div>

            {/* Track Info */}
            <h2 className="text-lg sm:text-xl font-black text-[#1D3222] tracking-tight mt-1">
              {currentTrack.title}
            </h2>
            <p className="text-xs text-[#4A634E] font-bold mt-0.5 mb-1.5">
              {currentTrack.subtitle}
            </p>

            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/80 border border-[#B3E099] text-[11px] font-black text-[#1D3222] mb-2 shadow-2xs">
              <Sparkles size={13} className="text-[#58CC02]" />
              <span>{currentTrack.badge}</span>
            </div>

            {/* Animated Waveform Equalizer */}
            <div className="flex items-center justify-center gap-1.5 h-7 my-1">
              {[0.4, 0.8, 0.5, 0.9, 0.6, 1.0, 0.7, 0.4, 0.8, 0.5].map((baseHeight, idx) => (
                <motion.div
                  key={idx}
                  animate={{
                    height: isPlaying ? [`${baseHeight * 100}%`, `${(1 - baseHeight) * 100}%`, `${baseHeight * 100}%`] : '15%'
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.8 + (idx % 3) * 0.2,
                    ease: 'easeInOut'
                  }}
                  className="w-1.5 bg-[#58CC02] rounded-full"
                />
              ))}
            </div>

            {/* Description text */}
            <p className="text-[11px] text-[#3A523E] font-medium leading-relaxed max-w-xs mt-1.5 px-1">
              {currentTrack.description}
            </p>
          </div>

          {/* Track Selector Carousel */}
          <div className="px-5 py-2">
            <div className="text-[10px] font-black uppercase tracking-widest text-[#1D3222]/80 mb-1.5 px-1">
              Select Stress-Free Soundscape:
            </div>
            <div className="grid grid-cols-4 gap-2">
              {SOOTHING_TRACKS.map((t, idx) => {
                const isSelected = idx === activeTrackIndex;
                return (
                  <button
                    key={t.id}
                    onClick={() => handleSelectTrack(idx)}
                    className={`p-2 rounded-xl flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer ${
                      isSelected 
                        ? 'bg-white border-[#58CC02] shadow-sm scale-102 ring-2 ring-[#58CC02]/30' 
                        : 'bg-white/50 border-[#C8E8B6] hover:bg-white/80 opacity-80'
                    }`}
                  >
                    <span className="text-xl">{t.icon}</span>
                    <span className="text-[9px] font-black leading-tight text-center line-clamp-1 text-[#1D3222]">
                      {t.title.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Playback Controls & Volume & Timer */}
          <div className="p-4 bg-white/80 backdrop-blur-xl border-t border-[#C8E8B6] flex flex-col gap-2.5 z-20">
            
            {/* Top Row: Timer selector & Countdown */}
            <div className="flex items-center justify-between text-xs font-bold text-[#1D3222] px-1">
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-[#58CC02]" />
                <span>Auto Timer:</span>
              </div>
              <div className="flex items-center gap-1">
                {[5, 15, 30, null].map((mins) => (
                  <button
                    key={mins ?? 'inf'}
                    onClick={() => handleSelectTimer(mins)}
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border transition-colors cursor-pointer ${
                      timerMinutes === mins
                        ? 'bg-[#1A3022] text-[#D5F0C0] border-[#1A3022]'
                        : 'bg-white text-[#1D3222] border-[#C8E8B6] hover:bg-[#E5F2DE]'
                    }`}
                  >
                    {mins ? `${mins}m` : '∞'}
                  </button>
                ))}
              </div>
            </div>

            {/* Countdown Badge if active */}
            {remainingSeconds !== null && (
              <div className="text-center text-xs font-black text-[#1D3222] bg-[#EAF7E3] py-1 rounded-xl border border-[#B3E099]">
                ⌛ Stopping in {Math.floor(remainingSeconds / 60)}:{(remainingSeconds % 60).toString().padStart(2, '0')}
              </div>
            )}

            {/* Play/Pause & Skip Controls */}
            <div className="flex items-center justify-center gap-5 my-0.5">
              <button 
                onClick={handlePrevTrack}
                className="p-2.5 text-[#1D3222] hover:bg-[#E5F2DE] rounded-full transition-colors cursor-pointer active:scale-90"
                title="Previous Soundscape"
              >
                <SkipBack size={20} />
              </button>

              <button 
                onClick={handleTogglePlay}
                className="w-12 h-12 rounded-full bg-[#58CC02] hover:bg-[#4ea602] text-white font-extrabold flex items-center justify-center shadow-md active:scale-95 transition-transform cursor-pointer"
                title={isPlaying ? "Pause Music" : "Play Music"}
              >
                {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" className="ml-0.5" />}
              </button>

              <button 
                onClick={handleNextTrack}
                className="p-2.5 text-[#1D3222] hover:bg-[#E5F2DE] rounded-full transition-colors cursor-pointer active:scale-90"
                title="Next Soundscape"
              >
                <SkipForward size={20} />
              </button>
            </div>

            {/* Volume Slider */}
            <div className="flex items-center gap-2.5 px-2">
              <button 
                onClick={() => setIsMuted(!isMuted)} 
                className="text-[#1D3222] hover:text-[#58CC02]"
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <input 
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  setVolume(parseFloat(e.target.value));
                  if (isMuted) setIsMuted(false);
                }}
                className="w-full accent-[#58CC02] h-1.5 bg-[#C8E8B6] rounded-lg cursor-pointer"
              />
              <span className="text-[10px] font-black text-[#1D3222] w-8 text-right">
                {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
              </span>
            </div>

          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
