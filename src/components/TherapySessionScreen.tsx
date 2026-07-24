import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Play, Pause, RotateCcw, Volume2, VolumeX, 
  Sparkles, CheckCircle2, Send, Star, Wind, 
  Gamepad2, BookOpen, CheckSquare, ShieldCheck, Heart, Smartphone, Users, Moon, Coffee, Brain
} from 'lucide-react';
import { Mascot } from './Assets';
import { soundEngine } from '../utils/audioSynth';
import confetti from 'canvas-confetti';

interface TherapySessionScreenProps {
  level: number;
  initialText?: string;
  canJournalToday?: boolean;
  onSave: (text: string, updatedStatus?: any) => void;
  onBack: () => void;
}

// User-provided verbatim anxiety & therapy script split into sequential paragraphs
// Level 1 anxiety & therapy script
const LEVEL_1_SCRIPT = [
  "Everyone gets anxious from time to time. It's completely normal and it can feel slightly different for everyone. Anxiety is a feeling of unease, such as fear or worry. It's one of the body's natural responses to stress.",
  "Most of the time, feelings of anxiety will pass naturally and you will start to feel OK again. Taking breaks from your phone, talking to someone you trust, and focusing on your breathing helps soothe your mind.",
  "Remember, feeling anxious from time to time is completely normal. Using our tips can help manage that. Try and find out what works best for you!"
];

// Level 2 Advanced Cognitive Restructuring & Reframing script
const LEVEL_2_SCRIPT = [
  "Welcome to Level 2 Therapy! In Level 1, we recognized that anxiety is normal. In Level 2, we learn how to master our thoughts through Cognitive Restructuring.",
  "When anxiety spikes, our mind often triggers Cognitive Distortions — automatic traps like Catastrophizing ('What if the worst happens?'), Mind Reading ('Everyone is judging me'), or All-or-Nothing thinking.",
  "Cognitive reframing is like putting on a new pair of glasses. We ask ourselves: 'What is the actual evidence?' and 'What is a balanced, compassionate view?'",
  "By catching the anxious thought, identifying the distortion, and building a balanced reframe, we rewire our neural response from fear to empowered action. Let's practice now!"
];

// Interactive tasks for overcoming anxiety based on Lumo's tips
const ANXIETY_TASKS = [
  {
    id: "phone_detox",
    icon: Smartphone,
    title: "Bedtime Digital Detox Challenge",
    desc: "Put your phone away out of sight at least 30 minutes before bed tonight. Read or listen to soothing music instead.",
    reward: "+25 XP & Night Peace Badge"
  },
  {
    id: "connect_someone",
    icon: Users,
    title: "Open Communication Connection",
    desc: "Reach out to a family member, trusted friend, or adult to share how you're feeling today or just catch up.",
    reward: "+20 XP & Warm Connection"
  },
  {
    id: "breath_count",
    icon: Moon,
    title: "5-Second Slow Breath Practice",
    desc: "Take 5 slow, deep breaths counting to 5 on each inhale and exhale to soothe your nervous system.",
    reward: "+15 XP & Somatic Calm"
  },
  {
    id: "control_focus",
    icon: Coffee,
    title: "Control Focus Action",
    desc: "Identify 1 small thing in your day that you CAN control, and complete it gently with zero pressure.",
    reward: "+20 XP & Mindful Control"
  }
];

// Level 2 Cognitive Reframing Scenarios
const REFRAME_SCENARIOS = [
  {
    id: 'exam_fail',
    thought: "What if I fail completely and mess up my future?",
    distortion: "Catastrophizing & Black-and-White Thinking",
    evidence: "You have prepared and overcome tough challenges before. One single test does not define your entire value.",
    reframe: "I am prepared. I will do my best, and I can handle whatever comes one step at a time."
  },
  {
    id: 'people_judging',
    thought: "Everyone is looking at me and judging my mistakes.",
    distortion: "Mind Reading & Spotlight Effect",
    evidence: "Most people are focused on their own thoughts and worries, not judging you.",
    reframe: "People are generally supportive or busy with themselves. I am allowed to be human and imperfect."
  },
  {
    id: 'workload_overwhelm',
    thought: "I have way too much to do, I'll never finish in time.",
    distortion: "Overgeneralization & Emotional Reasoning",
    evidence: "Feeling overwhelmed doesn't mean it's impossible. Breaking tasks into 10-minute micro-steps works every time.",
    reframe: "I don't need to finish everything at once. I just need to complete the next small step."
  }
];

// 5-4-3-2-1 Grounding Items
const GROUNDING_ITEMS = [
  { sense: '5 Things You SEE 👁️', items: ['A warm desk light', 'Green leaves on plant', 'Pattern on carpet', 'Your shoes', 'Cloud outside window'] },
  { sense: '4 Things You TOUCH 🖐️', items: ['Soft fabric of shirt', 'Cool surface of phone/keys', 'Smooth wooden desk', 'Your warm pulse'] },
  { sense: '3 Things You HEAR 👂', items: ['Distant traffic or breeze', 'Soft hum of air/fan', 'Your own gentle breath'] },
  { sense: '2 Things You SMELL 👃', items: ['Fresh morning air', 'Herbal tea or soap'] },
  { sense: '1 Thing You TASTE 👅', items: ['Sip of clean water'] },
];

export function TherapySessionScreen({
  level,
  initialText = '',
  canJournalToday = true,
  onSave,
  onBack
}: TherapySessionScreenProps) {

  // Active Therapy Session Level (1: Foundation, 2: Advanced Reframing)
  const [sessionLevel, setSessionLevel] = useState<number>(level >= 2 ? 2 : 1);

  // Script selection based on session level
  const activeScript = sessionLevel === 2 ? LEVEL_2_SCRIPT : LEVEL_1_SCRIPT;

  // Active Step: 'video' | 'reframe' | 'game' | 'journal' | 'task'
  const [activeStep, setActiveStep] = useState<'video' | 'reframe' | 'game' | 'journal' | 'task'>('video');

  // Video Stream State
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentLineIdx, setCurrentLineIdx] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);

  // Level 2 Interactive Reframer State
  const [activeScenarioIdx, setActiveScenarioIdx] = useState(0);
  const [flippedScenarios, setFlippedScenarios] = useState<Record<string, boolean>>({});
  const [customAnxiousThought, setCustomAnxiousThought] = useState("");
  const [customReframeResult, setCustomReframeResult] = useState<string | null>(null);

  // Level 2 5-4-3-2-1 Grounding Checked State
  const [checkedGrounding, setCheckedGrounding] = useState<Record<string, boolean>>({});

  // Journal State
  const [journalText, setJournalText] = useState(initialText);
  const [selectedMood, setSelectedMood] = useState<string>('Calm');
  const [saving, setSaving] = useState(false);
  const [cooldownError, setCooldownError] = useState<string | null>(null);

  // Interactive Mini Game State
  const [breathingPhase, setBreathingPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [breathingCycle, setBreathingCycle] = useState(0);

  // Selected Anxiety Task Challenge State
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);

  // Video playback progress effect - calm and relaxed pace for natural reading
  useEffect(() => {
    let interval: any;
    if (isPlaying && activeStep === 'video') {
      interval = setInterval(() => {
        setVideoProgress(prev => {
          if (prev >= 100) {
            if (currentLineIdx < activeScript.length - 1) {
              const nextLine = currentLineIdx + 1;
              setCurrentLineIdx(nextLine);
              if (!isMuted) {
                soundEngine.speakLumoVoice(activeScript[nextLine]);
              }
              return 0;
            } else {
              setIsPlaying(false);
              return 100;
            }
          }
          return prev + 0.85; // unhurried, comfortable reading pace matching slower speech rate
        });
      }, 300);
    }
    return () => clearInterval(interval);
  }, [isPlaying, activeStep, currentLineIdx, isMuted, activeScript]);

  // Speech synthesis sync
  useEffect(() => {
    if (activeStep === 'video' && isPlaying && !isMuted) {
      soundEngine.speakLumoVoice(activeScript[currentLineIdx]);
    } else if (isMuted) {
      soundEngine.stopSpeaking();
    }
    return () => {
      soundEngine.stopSpeaking();
    };
  }, [currentLineIdx, activeStep, isMuted, activeScript]);

  // Breathing timer sync
  useEffect(() => {
    if (activeStep === 'game') {
      const bInterval = setInterval(() => {
        setBreathingPhase(prev => {
          if (prev === 'Inhale') return 'Hold';
          if (prev === 'Hold') return 'Exhale';
          setBreathingCycle(c => c + 1);
          return 'Inhale';
        });
      }, 3000);
      return () => clearInterval(bInterval);
    }
  }, [activeStep]);

  const handleTogglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      soundEngine.stopSpeaking();
    } else {
      setIsPlaying(true);
      if (!isMuted) {
        soundEngine.speakLumoVoice(activeScript[currentLineIdx]);
      }
    }
  };

  const handleRestartVideo = () => {
    setCurrentLineIdx(0);
    setVideoProgress(0);
    setIsPlaying(true);
    soundEngine.playTherapyTone();
    if (!isMuted) {
      soundEngine.speakLumoVoice(activeScript[0]);
    }
  };

  const handleToggleTaskCheck = (taskId: string) => {
    soundEngine.playPopSound();
    if (completedTasks.includes(taskId)) {
      setCompletedTasks(prev => prev.filter(id => id !== taskId));
    } else {
      setCompletedTasks(prev => [...prev, taskId]);
      try {
        confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
      } catch (e) {}
    }
  };

  const handleFinalSubmitSession = async (bypassCooldown: boolean = false) => {
    if (!journalText.trim()) {
      setActiveStep('journal');
      return;
    }
    setSaving(true);
    setCooldownError(null);

    try {
      const token = localStorage.getItem("lumo_token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/journal/submit", {
        method: "POST",
        headers,
        body: JSON.stringify({
          content: journalText.trim(),
          moodTag: selectedMood,
          reflectionScore: 5,
          bypassCooldown
        })
      });

      const data = await res.json();

      if (res.status === 429 || !res.ok) {
        setCooldownError(data.error || "You can write 1 reflection entry per 24 hours.");
        setSaving(false);
        return;
      }

      soundEngine.playChime();
      try {
        confetti({ particleCount: 100, spread: 90, origin: { y: 0.5 } });
      } catch (e) {}

      setTimeout(() => {
        onSave(journalText, data.userStatus);
      }, 1500);
    } catch (e: any) {
      setCooldownError(e.message || "Failed to submit therapy session. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const STEPS = sessionLevel === 2 ? [
    { id: 'video', label: 'Stream', icon: Play },
    { id: 'reframe', label: 'Reframer', icon: Brain },
    { id: 'game', label: 'Grounding', icon: Heart },
    { id: 'journal', label: 'Journal', icon: BookOpen },
    { id: 'task', label: 'Action Task', icon: CheckSquare },
  ] : [
    { id: 'video', label: 'Stream', icon: Play },
    { id: 'game', label: 'Grounding', icon: Heart },
    { id: 'journal', label: 'Journal', icon: BookOpen },
    { id: 'task', label: 'Action Task', icon: CheckSquare },
  ];

  return (
    <div className="flex-1 flex flex-col bg-[#F7FAF6] text-[#1E2B22] relative overflow-hidden select-none font-sans">
      
      {/* Top Refined Header */}
      <div className="bg-white/90 backdrop-blur-md text-[#1C3322] px-4 pt-5 pb-3 z-30 shadow-xs border-b border-[#E2EFE0]">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onBack}
            className="w-9 h-9 bg-[#F0F7EC] hover:bg-[#E4F2DE] rounded-xl flex items-center justify-center text-[#1C3322] active:scale-95 transition-all cursor-pointer border border-[#D3E8CD]"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5">
              <Sparkles size={15} className="text-[#10B981] animate-pulse" />
              <h1 className="text-xs sm:text-sm font-extrabold text-[#1C3322] tracking-wider uppercase font-outfit">
                Therapy Session • Level {sessionLevel}
              </h1>
            </div>
            <p className="text-[11px] text-[#527059] font-medium">
              {sessionLevel === 2 ? "Cognitive Reframing & Empowered Action" : "Understanding & Somatic Grounding"}
            </p>
          </div>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="w-9 h-9 bg-[#F0F7EC] hover:bg-[#E4F2DE] rounded-xl flex items-center justify-center text-[#1C3322] active:scale-95 transition-all cursor-pointer border border-[#D3E8CD]"
            title={isMuted ? "Unmute Voice" : "Mute Voice"}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>

        {/* Level Toggle Pills */}
        <div className="flex bg-[#F0F6EE] p-1 rounded-2xl border border-[#DAECCD] gap-1 max-w-xs mx-auto">
          <button
            type="button"
            onClick={() => {
              setSessionLevel(1);
              setCurrentLineIdx(0);
              setVideoProgress(0);
              if (activeStep === 'reframe') setActiveStep('video');
            }}
            className={`flex-1 py-1.5 px-3 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
              sessionLevel === 1
                ? 'bg-[#1C3829] text-[#E3F4DF] shadow-xs'
                : 'text-[#4F6C56] hover:text-[#1C3322]'
            }`}
          >
            Level 1: Grounding
          </button>
          <button
            type="button"
            onClick={() => {
              setSessionLevel(2);
              setCurrentLineIdx(0);
              setVideoProgress(0);
            }}
            className={`flex-1 py-1.5 px-3 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
              sessionLevel === 2
                ? 'bg-[#1C3829] text-[#E3F4DF] shadow-xs'
                : 'text-[#4F6C56] hover:text-[#1C3322]'
            }`}
          >
            Level 2: Reframing ✨
          </button>
        </div>
      </div>

      {/* Sleek Segmented Step Navigation Bar */}
      <div className="bg-white px-3 py-2 border-b border-[#E2EFE0] flex items-center justify-between z-20 shadow-2xs gap-1.5 overflow-x-auto scrollbar-hide">
        {STEPS.map((step) => {
          const isActive = activeStep === step.id;
          const IconComp = step.icon;
          return (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id as any)}
              className={`flex-1 min-w-[72px] py-2 px-2.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 whitespace-nowrap ${
                isActive
                  ? 'bg-[#1C3829] text-[#E3F4DF] shadow-xs scale-[1.01]'
                  : 'bg-[#F2F7F0] text-[#527059] hover:bg-[#E6F0E3] hover:text-[#1C3322]'
              }`}
            >
              <IconComp size={13} className={isActive ? 'text-[#10B981]' : 'text-[#527059]'} />
              <span>{step.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Viewport */}
      <div className="flex-1 overflow-y-auto p-4 pb-8 space-y-4 scrollbar-hide">
        
        {/* STEP 1: ANIMATED MASCOT THERAPY STREAM */}
        {activeStep === 'video' && (
          <div className="space-y-4 animate-fade-in">
            {/* Main Stage Card */}
            <div className="relative w-full rounded-3xl bg-gradient-to-b from-[#FAFDF9] via-[#F2F8EE] to-[#E5F3DF] border border-[#D3E8CD] p-5 shadow-sm overflow-hidden min-h-[410px] flex flex-col justify-between">
              
              {/* Soft Ambient Radial Background */}
              <div className="absolute top-0 right-0 w-60 h-60 bg-[#A7F3D0]/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-60 h-60 bg-[#86EFAC]/20 rounded-full blur-3xl pointer-events-none" />

              {/* Stream Header Indicator */}
              <div className="flex items-center justify-between z-10">
                <span className="bg-white/90 border border-[#D3E8CD] text-[#1C3322] text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-2 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
                  Lumo Therapy Guide
                </span>
                <span className="text-[10px] font-bold text-[#4F6C56] bg-white/90 px-3 py-1 rounded-full border border-[#D3E8CD] shadow-2xs">
                  Part {currentLineIdx + 1} of {activeScript.length}
                </span>
              </div>

              {/* Mascot Center Stage */}
              <div className="my-5 flex flex-col items-center justify-center z-10 relative">
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 3.8, ease: "easeInOut" }}
                  className="relative flex justify-center items-center cursor-pointer"
                  onClick={handleTogglePlay}
                >
                  <Mascot
                    size={210}
                    isSpeaking={isPlaying}
                    emotion="happy"
                    bubbleText={undefined}
                  />
                </motion.div>
              </div>

              {/* Subtitle Caption Card */}
              <div className="bg-white/95 backdrop-blur-md border border-[#D3E8CD] rounded-2xl p-4 z-10 text-center shadow-xs relative min-h-[96px] flex items-center justify-center">
                <p className="text-xs sm:text-sm font-medium text-[#1E2B22] leading-relaxed font-outfit animate-fade-in">
                  "{activeScript[currentLineIdx]}"
                </p>
              </div>

              {/* Playback Controls & Progress */}
              <div className="mt-4 space-y-2.5 z-10">
                {/* Progress Bar */}
                <div className="w-full bg-white h-2 rounded-full overflow-hidden border border-[#D3E8CD]">
                  <motion.div
                    className="h-full bg-[#10B981] rounded-full"
                    style={{
                      width: `${((currentLineIdx + videoProgress / 100) / activeScript.length) * 100}%`
                    }}
                  />
                </div>

                {/* Control Buttons */}
                <div className="flex items-center justify-between pt-1 gap-2">
                  <button
                    onClick={handleRestartVideo}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-[#F2F7F0] text-[#1C3322] border border-[#D3E8CD] text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-95"
                  >
                    <RotateCcw size={14} /> Replay
                  </button>

                  <button
                    onClick={handleTogglePlay}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1C3829] hover:bg-[#12271c] text-[#E3F4DF] font-bold text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
                  >
                    {isPlaying ? <Pause size={15} /> : <Play size={15} />}
                    <span>{isPlaying ? "Pause Stream" : "Play Stream"}</span>
                  </button>

                  <button
                    onClick={() => setActiveStep(sessionLevel === 2 ? 'reframe' : 'game')}
                    className="flex items-center gap-1 px-4 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                  >
                    Next ➔
                  </button>
                </div>
              </div>
            </div>

            {/* Core Lesson Summary Banner */}
            <div className="p-4 rounded-2xl bg-white border border-[#E2EFE0] text-xs space-y-1 shadow-2xs">
              <span className="font-extrabold text-[#1C3322] flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#10B981]" /> Today's Core Lesson:
              </span>
              <p className="text-[#4F6C56] font-medium leading-relaxed">
                {sessionLevel === 2 
                  ? "Cognitive reframing transforms catastrophic fear into grounded action. Catch the thought, check the evidence, and reframe with self-compassion!"
                  : "Anxiety is a normal body response. By opening up to someone you trust, taking phone breaks, and focusing on gentle slow breathing, you can manage anxious feelings effectively!"
                }
              </p>
            </div>
          </div>
        )}

        {/* STEP 2 (LEVEL 2): COGNITIVE REFRAMING WHEEL */}
        {activeStep === 'reframe' && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-5 rounded-3xl bg-white border border-[#E2EFE0] shadow-2xs space-y-4">
              <div className="flex items-center gap-3 border-b border-[#F0F7EC] pb-3">
                <div className="w-10 h-10 rounded-2xl bg-[#1C3829] text-[#E3F4DF] flex items-center justify-center font-bold shadow-2xs">
                  <Brain size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#1C3322] font-outfit">Level 2 Cognitive Reframer</h3>
                  <p className="text-[11px] text-[#527059] font-medium">Unpack distortions & flip catastrophic thoughts into empowered action</p>
                </div>
              </div>

              {/* Scenario Selection Tabs */}
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pt-1">
                {REFRAME_SCENARIOS.map((sc, idx) => (
                  <button
                    key={sc.id}
                    onClick={() => setActiveScenarioIdx(idx)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer border ${
                      activeScenarioIdx === idx
                        ? 'bg-[#1C3829] text-[#E3F4DF] border-[#1C3829] shadow-2xs'
                        : 'bg-[#F2F7F0] text-[#527059] border-[#E2EFE0] hover:bg-[#E6F0E3]'
                    }`}
                  >
                    Scenario {idx + 1}
                  </button>
                ))}
              </div>

              {/* Interactive Reframer Flip Card */}
              {(() => {
                const sc = REFRAME_SCENARIOS[activeScenarioIdx];
                const isFlipped = !!flippedScenarios[sc.id];

                return (
                  <div className="relative bg-gradient-to-br from-[#FAFCF9] to-[#F0F7EC] rounded-2xl p-4 sm:p-5 border border-[#D3E8CD] shadow-2xs space-y-3">
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[#FEF2F2] text-[#DC2626] px-2.5 py-1 rounded-full border border-[#FCA5A5]">
                        {sc.distortion}
                      </span>
                      <span className="text-[11px] font-bold text-[#527059]">
                        {isFlipped ? "✨ Reframed View" : "⚡ Anxious Thought"}
                      </span>
                    </div>

                    {!isFlipped ? (
                      <div className="space-y-2.5 py-1">
                        <div className="bg-white p-3.5 rounded-xl border border-[#FECDD3] shadow-2xs">
                          <p className="text-xs font-semibold text-[#9F1239] italic leading-relaxed">
                            "{sc.thought}"
                          </p>
                        </div>
                        <p className="text-[11px] text-[#527059] font-medium leading-relaxed">
                          Notice how anxiety exaggerates risk. Tap below to examine the objective evidence and flip this thought!
                        </p>
                      </div>
                    ) : (
                      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="space-y-2.5 py-1">
                        <div className="bg-[#EAF5E5] p-3 rounded-xl border border-[#C2E4B6]">
                          <span className="text-[10px] font-black uppercase text-[#166534] block mb-1">
                            🔍 Objective Evidence Check:
                          </span>
                          <p className="text-xs font-bold text-[#14532D] leading-relaxed">
                            {sc.evidence}
                          </p>
                        </div>

                        <div className="bg-white p-3.5 rounded-xl border border-[#10B981] shadow-2xs">
                          <span className="text-[10px] font-black uppercase text-[#059669] block mb-1">
                            🌱 Empowered Reframe:
                          </span>
                          <p className="text-xs font-extrabold text-[#1C3322] leading-relaxed">
                            "{sc.reframe}"
                          </p>
                        </div>
                      </motion.div>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playChime();
                        if (!isFlipped) {
                          try { confetti({ particleCount: 35, spread: 55, origin: { y: 0.6 } }); } catch (e) {}
                        }
                        setFlippedScenarios(prev => ({ ...prev, [sc.id]: !isFlipped }));
                      }}
                      className="w-full py-2.5 rounded-xl bg-[#1C3829] hover:bg-[#12271c] text-[#E3F4DF] font-bold text-xs shadow-2xs active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Sparkles size={15} className="text-[#10B981]" />
                      <span>{isFlipped ? "Flip Back to Challenge" : "Flip & Apply Reframed View 🔄"}</span>
                    </button>
                  </div>
                );
              })()}

              {/* Custom Stressful Thought Interactive Converter */}
              <div className="bg-[#F2F7F0] p-4 rounded-2xl border border-[#E2EFE0] space-y-2.5">
                <span className="text-xs font-bold text-[#1C3322] block">
                  ✍️ Try Reframing Your Own Thought Today:
                </span>
                <input
                  type="text"
                  value={customAnxiousThought}
                  onChange={(e) => setCustomAnxiousThought(e.target.value)}
                  placeholder="e.g. I feel stressed about tomorrow's presentation..."
                  className="w-full bg-white border border-[#D3E8CD] p-3 rounded-xl text-xs font-medium text-[#1C3322] focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                />
                <button
                  type="button"
                  disabled={!customAnxiousThought.trim()}
                  onClick={() => {
                    soundEngine.playPopSound();
                    setCustomReframeResult(`"I acknowledge my stress regarding '${customAnxiousThought.trim()}'. It shows I care deeply. I am equipped to handle this step by step."`);
                  }}
                  className="w-full py-2.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl font-bold text-xs shadow-2xs active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                >
                  Generate Personal Balanced Reframe ✨
                </button>

                {customReframeResult && (
                  <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="p-3 bg-white rounded-xl border border-[#10B981] text-xs font-bold text-[#1C3322] leading-relaxed shadow-2xs">
                    <span className="text-[10px] font-black text-[#059669] uppercase block mb-1">Your Reframed Affirmation:</span>
                    {customReframeResult}
                  </motion.div>
                )}
              </div>

              <button
                onClick={() => setActiveStep('game')}
                className="w-full py-3 rounded-xl bg-[#1C3829] text-[#E3F4DF] font-bold text-xs shadow-2xs active:scale-95 transition-transform cursor-pointer"
              >
                Proceed to Somatic Grounding ➔
              </button>
            </div>
          </div>
        )}

        {/* STEP 2/3: GROUNDING MINI-GAME */}
        {activeStep === 'game' && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-5 rounded-3xl bg-white border border-[#E2EFE0] shadow-2xs space-y-4 text-center relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#F0F7EC] pb-3 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#F0F7EC] border border-[#D3E8CD] flex items-center justify-center text-[#10B981] shadow-2xs">
                    <Gamepad2 size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#1C3322] font-outfit">Somatic Grounding Breathwork</h3>
                    <p className="text-[11px] text-[#527059] font-medium">5-second rhythmic breathing cycle to calm your nervous system</p>
                  </div>
                </div>
              </div>

              {/* BREATHING GAME ANIMATION */}
              <div className="py-6 flex flex-col items-center justify-center space-y-5">
                <div className="relative flex items-center justify-center">
                  <motion.div
                    animate={{
                      scale: breathingPhase === 'Inhale' ? 1.4 : breathingPhase === 'Hold' ? 1.4 : 0.95,
                      opacity: breathingPhase === 'Hold' ? 0.8 : 0.6
                    }}
                    transition={{ duration: 3, ease: 'easeInOut' }}
                    className="w-36 h-36 rounded-full bg-[#10B981]/20 blur-md absolute"
                  />
                  <motion.div
                    animate={{
                      scale: breathingPhase === 'Inhale' ? 1.25 : breathingPhase === 'Hold' ? 1.25 : 1.0
                    }}
                    transition={{ duration: 3, ease: 'easeInOut' }}
                    className="w-28 h-28 rounded-full border-2 border-[#10B981] flex flex-col items-center justify-center bg-[#F7FAF6] z-10 shadow-sm"
                  >
                    <Wind size={26} className="text-[#1C3322] mb-1 animate-pulse" />
                    <span className="text-[11px] font-extrabold text-[#1C3322] uppercase tracking-widest font-outfit">
                      {breathingPhase}
                    </span>
                  </motion.div>
                </div>

                <div className="bg-[#F0F7EC] px-4 py-2 rounded-xl border border-[#D3E8CD] text-xs font-bold text-[#1C3322]">
                  Grounding Cycles Completed: {breathingCycle} 🧘
                </div>
              </div>

              {/* 5-4-3-2-1 Sensory Grounding Matrix */}
              <div className="bg-[#F2F7F0] p-4 rounded-2xl border border-[#E2EFE0] text-left space-y-3">
                <div className="flex items-center justify-between border-b border-[#E2EFE0] pb-2">
                  <span className="text-xs font-bold text-[#1C3322] flex items-center gap-1.5">
                    ✨ 5-4-3-2-1 Sensory Grounding Matrix
                  </span>
                  <span className="text-[10px] font-extrabold text-[#059669] bg-white px-2.5 py-0.5 rounded-full border border-[#D3E8CD]">
                    {Object.keys(checkedGrounding).filter(k => checkedGrounding[k]).length} Checked
                  </span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide pr-1">
                  {GROUNDING_ITEMS.map((gGroup) => (
                    <div key={gGroup.sense} className="bg-white p-2.5 rounded-xl border border-[#E2EFE0] space-y-1.5">
                      <span className="text-[11px] font-bold text-[#166534] block">{gGroup.sense}</span>
                      <div className="flex flex-wrap gap-1.5">
                        {gGroup.items.map((item) => {
                          const isChecked = !!checkedGrounding[item];
                          return (
                            <button
                              key={item}
                              type="button"
                              onClick={() => {
                                soundEngine.playPopSound();
                                setCheckedGrounding(prev => ({ ...prev, [item]: !isChecked }));
                              }}
                              className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                                isChecked
                                  ? 'bg-[#EAF5E5] border-[#10B981] text-[#14532D] line-through opacity-80'
                                  : 'bg-[#FAFDF9] border-[#D3E8CD] text-[#2C3E28] hover:bg-[#F0F7EC]'
                              }`}
                            >
                              <span>{isChecked ? "✓" : "○"}</span>
                              <span>{item}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setActiveStep('journal')}
                className="w-full py-3 rounded-xl bg-[#1C3829] text-[#E3F4DF] font-bold text-xs shadow-2xs active:scale-95 transition-transform cursor-pointer"
              >
                Continue to Reflection Journal ➔
              </button>
            </div>
          </div>
        )}

        {/* STEP 3/4: REFLECTION JOURNAL */}
        {activeStep === 'journal' && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-5 rounded-3xl bg-white border border-[#E2EFE0] shadow-2xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#F0F7EC] border border-[#D3E8CD] flex items-center justify-center text-[#10B981] shadow-2xs">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#1C3322] font-outfit">Level {level} Reflection Journal</h3>
                  <p className="text-[11px] text-[#527059] font-medium">What made you feel anxious recently, and which tip will you try?</p>
                </div>
              </div>

              {/* Mood Selection */}
              <div className="bg-[#F2F7F0] p-3.5 rounded-2xl border border-[#E2EFE0] space-y-2">
                <span className="text-[11px] font-bold text-[#1C3322]">How do you feel after today's session?</span>
                <div className="flex justify-around gap-2 pt-0.5">
                  {['😊 Good', '🧘 Calm', '🌧️ Reflective'].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setSelectedMood(m)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        selectedMood === m
                          ? 'bg-[#1C3829] border-[#1C3829] text-[#E3F4DF] shadow-2xs'
                          : 'bg-white border-[#E2EFE0] text-[#1C3322] hover:bg-[#E6F0E3]'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Journal Textarea */}
              <textarea
                value={journalText}
                onChange={(e) => setJournalText(e.target.value)}
                placeholder="Dear Lumo, today in therapy I learned that anxiety is normal, and I plan to..."
                className="w-full h-36 bg-white border border-[#D3E8CD] rounded-2xl p-4 text-xs text-[#1C3322] focus:outline-none focus:border-[#10B981] transition-colors resize-none shadow-2xs font-medium leading-relaxed"
              />

              <button
                onClick={() => setActiveStep('task')}
                disabled={!journalText.trim()}
                className="w-full bg-[#1C3829] text-[#E3F4DF] py-3 rounded-xl font-bold text-xs shadow-2xs active:scale-95 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>Proceed to Overcoming Anxiety Task ➔</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 4/5: OVERCOMING ANXIETY TASK CHALLENGE */}
        {activeStep === 'task' && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-5 rounded-3xl bg-white border border-[#E2EFE0] shadow-2xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#F0F7EC] border border-[#D3E8CD] flex items-center justify-center text-[#10B981] shadow-2xs">
                  <CheckSquare size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#1C3322] font-outfit">Overcoming Anxiety Action Task</h3>
                  <p className="text-[11px] text-[#527059] font-medium">Choose & commit to 1 or more self-care tasks today:</p>
                </div>
              </div>

              {/* Clean, Redesigned Non-Overlapping Task Cards List */}
              <div className="space-y-3">
                {ANXIETY_TASKS.map((t) => {
                  const Icon = t.icon;
                  const isChecked = completedTasks.includes(t.id);
                  return (
                    <div
                      key={t.id}
                      onClick={() => handleToggleTaskCheck(t.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                        isChecked
                          ? 'bg-[#F0F7EC] border-[#10B981] shadow-xs'
                          : 'bg-white border-[#E2EFE0] hover:border-[#D3E8CD]'
                      }`}
                    >
                      {/* Top Header Row: Checkbox + Title + Clean Reward Pill */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div className={`w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 border transition-colors ${
                            isChecked ? 'bg-[#10B981] border-[#10B981] text-white' : 'bg-white border-[#C2D8BA]'
                          }`}>
                            {isChecked ? <CheckCircle2 size={14} /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />}
                          </div>

                          <h4 className="text-xs font-bold text-[#1C3322] leading-snug flex items-center gap-1.5">
                            <Icon size={14} className="text-[#10B981] flex-shrink-0" />
                            <span>{t.title}</span>
                          </h4>
                        </div>

                        <span className="text-[10px] font-extrabold text-[#059669] bg-[#E3F4DF] border border-[#C2E4B6] px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0">
                          {t.reward}
                        </span>
                      </div>

                      {/* Description Text */}
                      <p className="text-[11px] text-[#527059] font-medium leading-relaxed pl-7">
                        {t.desc}
                      </p>
                    </div>
                  );
                })}
              </div>

              {cooldownError && (
                <div className="p-3.5 rounded-2xl bg-[#FEF2F2] border border-[#FCA5A5] text-[#B91C1C] text-xs font-bold text-center">
                  {cooldownError}
                </div>
              )}

              {/* Complete Therapy Session Button */}
              <button
                onClick={() => handleFinalSubmitSession(false)}
                disabled={saving}
                className="w-full bg-[#10B981] hover:bg-[#059669] text-white py-3.5 rounded-2xl font-black text-xs shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
              >
                <Send size={15} />
                <span>{saving ? 'Completing Session...' : `Commit Task & Complete Level ${level} Session 🎉`}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

}
