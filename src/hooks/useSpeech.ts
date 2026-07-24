import { useState, useEffect, useCallback } from 'react';

// Global set to remember which texts have been spoken
const spokenTexts = new Set<string>();

// Cute anime sound chime generator using Web Audio API
function playAnimeChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // High energetic ascending kawaii anime sparkle chime (C6 -> E6 -> G6 -> C7)
    const now = ctx.currentTime;
    const notes = [1046.5, 1318.5, 1567.98, 2093];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);
      gain.gain.setValueAtTime(0.12, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.2);
    });
  } catch (e) {
    // Ignore audio context errors if blocked by browser policy
  }
}

export function getHumanBabyVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const maleKeywords = [
    'david', 'george', 'mark', 'alex', 'fred', 'daniel', 'male', 'guy', 'richard', 
    'james', 'tom', 'oliver', 'brian', 'arthur', 'ryan', 'paul', 'steven', 'michael',
    'espeak male', 'man', 'father', 'grandpa'
  ];

  const isMale = (v: SpeechSynthesisVoice) => {
    const name = v.name.toLowerCase();
    return maleKeywords.some(kw => name.includes(kw));
  };

  const femaleOrChildVoices = voices.filter(v => !isMale(v));

  const scored = femaleOrChildVoices.map(v => {
    const name = v.name.toLowerCase();
    const lang = v.lang.toLowerCase();
    let score = 0;

    // High priority: Neural/Natural child & young female voices
    if (['ana', 'ivy', 'child', 'kid', 'young', 'girl', 'junior', 'baby', 'chime', 'cute', 'mini'].some(kw => name.includes(kw))) {
      score += 250;
    }

    // High priority: Premium Natural/Neural human voices (Google/Microsoft/Apple Neural)
    if (['natural', 'neural', 'online (natural)'].some(kw => name.includes(kw))) {
      score += 180;
    }

    // Gentle human female voices
    if (['samantha', 'aria', 'jenny', 'victoria', 'siri', 'zira', 'karen', 'fiona', 'moira', 'tessa', 'google us english', 'google uk english female'].some(kw => name.includes(kw))) {
      score += 120;
    }

    // English language preference for clarity
    if (lang.startsWith('en')) score += 50;

    // Reject low quality / robotic espeak voices
    if (name.includes('espeak') || name.includes('mbrola')) score -= 200;

    return { voice: v, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.voice || femaleOrChildVoices[0] || voices[0] || null;
}

// Backward compatibility alias
export const getAnimeVoice = getHumanBabyVoice;

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
      
      // Sweet & Gentle Human Baby Voice Parameters:
      // Natural pitch boost (1.20) and gentle human cadence (0.98) avoids artificial digital robot artifacts
      utterance.rate = options.rate ?? (useCute ? 1.0 : 0.95); 
      utterance.pitch = options.pitch ?? (useCute ? 1.22 : 1.0); 
      utterance.volume = 1.0;
      
      utterance.onstart = () => {
        setIsSpeaking(true);
        spokenTexts.add(id);
        if (useCute) {
          playAnimeChime();
        }
      };
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (e) => {
        console.warn("Speech synthesis error or interrupted:", e);
        setIsSpeaking(false);
      };

      const trySpeak = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        const bestVoice = getHumanBabyVoice(availableVoices);

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

