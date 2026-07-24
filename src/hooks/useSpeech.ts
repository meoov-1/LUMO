import { useState, useEffect, useCallback } from 'react';

// Global set to remember which texts have been spoken
const spokenTexts = new Set<string>();

// Cute girl sound chime generator using Web Audio API
function playCuteChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // Gentle high double chime
    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(784, now); // G5
    osc1.frequency.exponentialRampToValueAtTime(1046.5, now + 0.1); // C6
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.15);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1046.5, now + 0.08); // C6
    osc2.frequency.exponentialRampToValueAtTime(1318.5, now + 0.2); // E6
    gain2.gain.setValueAtTime(0.15, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.25);
  } catch (e) {
    // Ignore audio context errors if blocked by browser policy
  }
}

export function useSpeech(
  text: string | null, 
  id: string = "default", 
  options: { isCute?: boolean; pitch?: number; rate?: number } = { isCute: true }
) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = useCallback((manualText?: string, overrideCute?: boolean) => {
    const textToSpeak = manualText || text;
    if (!textToSpeak || !('speechSynthesis' in window)) return;

    // Fix Chrome speech synthesis stuck state
    try {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      window.speechSynthesis.cancel();
    } catch (e) {
      console.error(e);
    }
    
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      const useCute = overrideCute !== undefined ? overrideCute : (options.isCute ?? true);
      
      // Tiny anime mascot / Duolingo-style companion settings:
      // Pitch +55-60% (1.60) + cheerful rate (1.18) imitates a bright, energetic small kid mascot
      utterance.rate = options.rate ?? (useCute ? 1.18 : 0.95); 
      utterance.pitch = options.pitch ?? (useCute ? 1.60 : 1.0); 
      
      utterance.onstart = () => {
        setIsSpeaking(true);
        spokenTexts.add(id);
        if (useCute) {
          playCuteChime();
        }
      };
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (e) => {
        console.warn("Speech synthesis error or interupted:", e);
        setIsSpeaking(false);
      };

      const trySpeak = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        
        // Exclude male adult voices completely
        const maleKeywords = [
          'david', 'george', 'mark', 'alex', 'fred', 'daniel', 'male', 'guy', 'richard', 
          'james', 'tom', 'oliver', 'brian', 'arthur', 'ryan', 'paul', 'steven', 'michael',
          'espeak male', 'man', 'father', 'grandpa'
        ];

        const isMale = (v: SpeechSynthesisVoice) => {
          const name = v.name.toLowerCase();
          return maleKeywords.some(kw => name.includes(kw));
        };

        const femaleOrChildVoices = availableVoices.filter(v => v.lang.startsWith('en') && !isMale(v));

        // Score voices to find the youngest-sounding child/girl/mascot voice
        const scoredVoices = femaleOrChildVoices.map(v => {
          const name = v.name.toLowerCase();
          let score = 0;

          // Tier 1: Explicit child/young/girl keywords
          if (['child', 'kid', 'young', 'girl', 'junior', 'ivy', 'chime', 'small', 'baby', 'cute', 'kawaii', 'little', 'mini'].some(kw => name.includes(kw))) {
            score += 100;
          }

          // Tier 2: Crisp female voices that pitch-shift smoothly into tiny mascot tones
          if (['siri', 'samantha', 'victoria', 'zira', 'tessa', 'moira', 'fiona', 'karen', 'jenny', 'aria'].some(kw => name.includes(kw))) {
            score += 50;
          }

          // Penalty: Standard Google adult narrator voices if better alternatives exist
          if (name.includes('google us english') || name.includes('google uk english female')) {
            score -= 30;
          }

          return { voice: v, score };
        });

        scoredVoices.sort((a, b) => b.score - a.score);

        const bestVoice = scoredVoices[0]?.voice || femaleOrChildVoices[0] || availableVoices.find(v => v.lang.startsWith('en') && !isMale(v));

        if (bestVoice) {
          utterance.voice = bestVoice;
        }

        try {
          if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
          }
          window.speechSynthesis.speak(utterance);
        } catch (err) {
          console.error("Failed to execute speak:", err);
        }
      };

      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0 && 'onvoiceschanged' in window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = () => {
          trySpeak();
        };
      } else {
        trySpeak();
      }
    }, 100);
  }, [text, id, options.isCute, options.pitch, options.rate]);

  useEffect(() => {
    const hasSpoken = typeof window !== 'undefined' && sessionStorage.getItem('spoken_' + id);
    if (text && !spokenTexts.has(id) && !hasSpoken) {
      spokenTexts.add(id);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('spoken_' + id, 'true');
      }
      speak();
    }
  }, [text, id, speak]);

  const triggerSpeech = (manualText?: string, overrideCute?: boolean) => {
    speak(manualText, overrideCute);
  };

  return { isSpeaking, triggerSpeech };
}

