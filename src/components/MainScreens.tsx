import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mascot, Tree } from './Assets';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Map, Book, PenTool, User, Lock, ArrowLeft, Star, Briefcase, Users, Music, Sprout, Moon, Flame, Sparkles, Apple, Heart, Zap, Flower2, Compass } from 'lucide-react';
import { SoothingMusicModal } from './SoothingMusicModal';
import { TherapySessionScreen } from './TherapySessionScreen';

export function HomeScreen({ 
  progress, 
  userName, 
  onNavigate,
  onResetProgress
}: { 
  progress: number; 
  userName?: string; 
  onNavigate: (screen: string) => void;
  onResetProgress?: () => void;
}) {
  const isComplete = progress >= 30;
  const [showCongrats, setShowCongrats] = useState(false);
  const [isFalling, setIsFalling] = useState(false);
  const [timeLeft, setTimeLeft] = useState(5);
  const [isResetting, setIsResetting] = useState(false);
  const [showMusicModal, setShowMusicModal] = useState(false);

  const handleAutoDismiss = useCallback(async () => {
    setIsResetting(true);
    setShowCongrats(false);
    setIsFalling(false);
    
    try {
      const token = localStorage.getItem("lumo_token");
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch('/api/user/complete-cycle', {
        method: 'POST',
        headers
      });
    } catch (e) {
      console.warn("Failed to complete cycle on backend:", e);
    }

    if (onResetProgress) {
      onResetProgress();
    }
    setIsResetting(false);
  }, [onResetProgress]);

  useEffect(() => {
    if (isComplete && !isResetting) {
      setShowCongrats(true);
      setIsFalling(true);
      setTimeLeft(5);

      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleAutoDismiss();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isComplete, isResetting, handleAutoDismiss]);

  const handleTreeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="flex-1 flex flex-col bg-[#E8F5D3] overflow-hidden relative">
      
      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto scrollbar-hide block" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
        
        {/* Top Graphic Stage Frame for Tree & Mascot */}
        <div className="relative w-full bg-gradient-to-b from-[#a1e3e3] via-[#c6f0d6] to-[#7ab056] pt-7 pb-4 px-4 flex flex-col items-center justify-between border-b-4 border-[#558B2F] shadow-md min-h-[420px]">
          {/* Header Bar */}
          <div className="w-full flex items-center justify-between z-20 mb-1">
            <div className="bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/60 shadow-sm flex items-center gap-1.5">
              <Sprout size={14} className="text-[#58CC02]" />
              <span className="text-xs font-black text-[#1D3222]">Hi, {userName || "Explorer"}!</span>
            </div>
            <div className="bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/60 shadow-sm flex items-center gap-1.5">
              <Flame size={14} className="text-[#58CC02]" />
              <span className="text-xs font-black text-[#1D3222]">{progress} Day Streak</span>
            </div>
          </div>

          {/* Prominent Large Tree Frame - Perfectly fitted to phone screen frame */}
          <div 
            onClick={handleTreeClick} 
            className="relative w-full max-w-[320px] sm:max-w-[350px] h-[270px] sm:h-[290px] z-10 mx-auto my-0 cursor-pointer transition-transform active:scale-98 group flex items-center justify-center overflow-visible"
            title="Tap Tree for Status"
          >
            <Tree progress={progress} isFalling={isFalling} />
            <div className="absolute top-1 right-2 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full border border-[#8BC34A] text-xs font-black text-[#1D3222] shadow-md flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <Apple size={14} className="text-[#58CC02]" />
              <span>{Math.min(Math.max(1, progress), 30)} Apples Grown</span>
            </div>
          </div>

          {/* Grassy Mound & Quick Action Frame */}
          <div className="w-full flex items-end justify-between px-2 z-20 mt-[-10px]">
            {/* Duolingo Mascot */}
            <Mascot size={90} />

            {/* Quick Level Jump Button */}
            <button 
              onClick={() => onNavigate('journey')} 
              className="bg-[#58CC02] hover:bg-[#4ea602] text-white px-4 py-2.5 rounded-2xl font-black text-xs shadow-md flex items-center gap-2 active:scale-95 transition-transform mb-2 cursor-pointer border border-[#8BC34A]"
            >
              <span>Growth Journey</span>
              <span className="text-sm">➔</span>
            </button>
          </div>

          {/* Auto-dismissing Congratulations Popup Overlay */}
          <AnimatePresence>
            {showCongrats && (
              <motion.div 
                initial={{scale: 0.8, opacity: 0, y: 20}} 
                animate={{scale: 1, opacity: 1, y: 0}} 
                exit={{scale: 0.8, opacity: 0, y: -20}}
                className="absolute inset-x-4 top-16 bg-white/95 p-5 rounded-3xl shadow-2xl text-center backdrop-blur-md z-50 border-4 border-[#8BC34A] space-y-3"
              >
                <div className="w-14 h-14 bg-[#EAF7E3] text-[#58CC02] rounded-2xl flex items-center justify-center mx-auto shadow-sm border border-[#C8E8B6] animate-bounce">
                  <Apple size={28} />
                </div>
                <div>
                  <div className="inline-block bg-[#8BC34A] text-[#1D3222] px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider mb-1">
                    30-Day Harvest
                  </div>
                  <h3 className="text-xl font-black text-[#1D3222] flex items-center justify-center gap-1.5">
                    Congratulations! <Sparkles size={18} className="text-[#58CC02]" />
                  </h3>
                  <p className="text-[#4A6546] text-xs font-semibold leading-relaxed mt-1">
                    Your 30 days are complete and your tree has borne golden apples! All your reflections & 360° AI career insights are permanently saved.
                  </p>
                </div>

                {/* Shrinking Timer Bar */}
                <div className="w-full bg-[#e2f0d9] h-2 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: 5, ease: "linear" }}
                    className="h-full bg-[#58cc02] rounded-full"
                  />
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <span className="text-[10px] font-bold text-[#6b8e5c]">
                    Closing in {timeLeft}s & starting fresh cycle...
                  </span>
                  <button
                    onClick={handleAutoDismiss}
                    className="bg-[#1A3022] text-[#D5F0C0] px-4 py-2 rounded-xl font-black text-xs active:scale-95 transition-transform shadow-md cursor-pointer border border-[#8BC34A]/50"
                  >
                    Start New Cycle ➔
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Stats & Dashboard Section */}
        <div className="bg-[#E8F5D3] px-6 pt-6 pb-8 z-30">
          <div className="w-12 h-1.5 bg-[#c2dfa9] rounded-full mx-auto mb-5"></div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-extrabold text-[#1D3222]">Good day, {userName || "Explorer"}</h1>
              <p className="text-[#6b8e5c] text-xs font-bold mt-0.5 flex items-center gap-1">
                <span>Day {progress} · Stage {Math.floor(progress/7) + 1} · Flowers Blooming</span>
                <Flower2 size={13} className="text-pink-400" />
              </p>
            </div>
            <div className="bg-[#58CC02] text-white px-3 py-1.5 rounded-2xl text-xs font-black shadow-sm">
              Lvl {progress}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div className="bg-white p-4.5 rounded-3xl shadow-sm border border-[#cbe3b3] flex flex-col justify-between">
               <div className="w-9 h-9 rounded-xl bg-[#EAF7E3] text-[#58CC02] flex items-center justify-center mb-2">
                 <Sprout size={20} />
               </div>
               <div>
                 <div className="text-xl font-black text-[#58CC02]">{Math.min(100, Math.round((progress/30)*100))}%</div>
                 <div className="text-[10px] text-[#6b8e5c] font-extrabold uppercase tracking-wide mt-0.5">Tree Health</div>
               </div>
            </div>
            <div className="bg-white p-4.5 rounded-3xl shadow-sm border border-[#cbe3b3] flex flex-col justify-between">
               <div className="w-9 h-9 rounded-xl bg-[#F0EBF9] text-[#866ba8] flex items-center justify-center mb-2">
                 <Moon size={20} />
               </div>
               <div>
                 <div className="text-xl font-black text-[#866ba8]">Calm</div>
                 <div className="text-[10px] text-[#6b8e5c] font-extrabold uppercase tracking-wide mt-0.5">Today's Mood</div>
               </div>
            </div>
            <div className="bg-white p-4.5 rounded-3xl shadow-sm border border-[#cbe3b3] flex flex-col justify-between">
               <div className="w-9 h-9 rounded-xl bg-[#FDF0E9] text-[#d66b2a] flex items-center justify-center mb-2">
                 <Flame size={20} />
               </div>
               <div>
                 <div className="text-xl font-black text-[#d66b2a]">{progress} days</div>
                 <div className="text-[10px] text-[#6b8e5c] font-extrabold uppercase tracking-wide mt-0.5">Streak</div>
               </div>
            </div>
            <div className="bg-white p-4.5 rounded-3xl shadow-sm border border-[#cbe3b3] flex flex-col justify-between">
               <div className="w-9 h-9 rounded-xl bg-[#FEF9E7] text-[#d4af37] flex items-center justify-center mb-2">
                 <Sparkles size={20} />
               </div>
               <div>
                 <div className="text-xl font-black text-[#d4af37]">3 / 5</div>
                 <div className="text-[10px] text-[#6b8e5c] font-extrabold uppercase tracking-wide mt-0.5">Goals Met</div>
               </div>
            </div>
          </div>

          {/* Quick Action CBT & Encouraging Words Cards */}
          <div className="mt-4 space-y-3">
            <div 
              onClick={() => onNavigate('career-advisor')}
              className="bg-gradient-to-r from-[#EAF7E3] via-white to-[#F2F8EE] text-[#1D3222] p-4 rounded-2xl shadow-2xs cursor-pointer flex items-center justify-between active:scale-98 transition-transform border-2 border-[#B3E099]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#58CC02] text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-2xs">
                  <Heart size={20} className="fill-current" />
                </div>
                <div>
                  <div className="font-extrabold text-sm text-[#1D3222] flex items-center gap-1.5">
                    <span>Encouraging Words</span>
                    <span className="bg-[#58CC02] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase">Gemini AI</span>
                  </div>
                  <div className="text-xs text-[#4A634E] font-medium">Personalized affirmations & gentle boosts</div>
                </div>
              </div>
              <div className="text-lg text-[#58CC02] font-bold">➔</div>
            </div>

            <div 
              onClick={() => onNavigate('cbt')}
              className="bg-white text-[#1D3222] p-4 rounded-3xl shadow-xs border border-[#cbe3b3] cursor-pointer flex items-center justify-between active:scale-98 transition-transform"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#E8F5D3] text-[#58CC02] rounded-2xl flex items-center justify-center font-bold text-lg">
                  <Zap size={20} className="fill-current text-[#58CC02]" />
                </div>
                <div>
                  <div className="font-extrabold text-sm text-[#1D3222]">Anxiety Buster</div>
                  <div className="text-xs text-[#6b8e5c]">Spill the tea & reframe thoughts</div>
                </div>
              </div>
              <div className="text-lg text-[#58CC02]">➔</div>
            </div>

            <div 
              onClick={() => setShowMusicModal(true)}
              className="bg-gradient-to-r from-[#EAF7E3] via-[#F5FCF0] to-[#E2F5D8] text-[#1D3222] p-4 rounded-3xl shadow-2xs border-2 border-[#B3E099] cursor-pointer flex items-center justify-between active:scale-98 transition-transform"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#58CC02] text-white rounded-2xl flex items-center justify-center font-bold text-lg shadow-2xs">
                  <Music size={20} className="animate-pulse" />
                </div>
                <div>
                  <div className="font-extrabold text-sm text-[#1D3222] flex items-center gap-1.5">
                    <span>Soothing Anxiety Music</span>
                    <span className="bg-[#58CC02] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase">4 Tracks</span>
                  </div>
                  <div className="text-xs text-[#4A634E] font-medium">432Hz pads, rain chords & singing bowls</div>
                </div>
              </div>
              <div className="text-lg text-[#58CC02] font-bold">➔</div>
            </div>
          </div>
        </div>
      </div>

      {/* Soothing Anxiety Music Modal */}
      <SoothingMusicModal isOpen={showMusicModal} onClose={() => setShowMusicModal(false)} />

      {/* Bottom Nav */}
      <div className="flex justify-around items-center bg-[#f2f8ea] p-3.5 rounded-t-3xl shadow-[0_-4px_10px_rgba(0,0,0,0.05)] text-[#86a674] z-40 border-t border-[#c2dfa9]">
        <button className="flex flex-col items-center text-[#4c8435] font-bold">
          <Home size={22} />
          <span className="text-[10px] mt-1 font-extrabold">Home</span>
        </button>
        <button onClick={() => onNavigate('journey')} className="flex flex-col items-center active:scale-95 transition-transform cursor-pointer">
          <Compass size={22} />
          <span className="text-[10px] mt-1 font-semibold">Journey</span>
        </button>
        <button onClick={() => onNavigate('cbt')} className="flex flex-col items-center active:scale-95 transition-transform">
          <Users size={22} />
          <span className="text-[10px] mt-1 font-semibold">Socio</span>
        </button>
        <button onClick={() => onNavigate('profile')} className="flex flex-col items-center active:scale-95 transition-transform cursor-pointer">
          <User size={22} />
          <span className="text-[10px] mt-1 font-semibold">Profile</span>
        </button>
      </div>
    </motion.div>
  );
}

export function JourneyScreen({ progress, canJournalToday, onNavigate, onSelectLevel }: { progress: number, canJournalToday: boolean, onNavigate: (screen: string) => void, onSelectLevel: (level: number) => void }) {
  const nodes = Array.from({length: 30}).map((_, i) => i + 1);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const activeIndex = Math.min(progress, 29);
      const yPosFromBottom = activeIndex * 110 + 60;
      const containerHeight = 3400;
      const viewportHeight = scrollRef.current.clientHeight || 600;
      const scrollTop = containerHeight - yPosFromBottom - viewportHeight / 2;
      scrollRef.current.scrollTop = Math.max(0, scrollTop);
    }
  }, [progress]);

  // Calculate SVG path for the winding road
  const pathD = nodes.map((level, i) => {
    const yPos = i * 110 + 60;
    const ySvg = 3400 - yPos;
    const xOffset = Math.sin(i * 0.9) * 100;
    const xSvg = 200 + xOffset; // Assuming width 400
    return `${i === 0 ? 'M' : 'L'} ${xSvg},${ySvg}`;
  }).join(' ');
  
  return (
    <div className="flex-1 flex flex-col bg-[#eaf5e3] relative overflow-hidden">
      {/* Static Header Bar */}
      <div className="bg-white/90 backdrop-blur-md border-b border-[#d2ebc4] pt-5 pb-3 px-4 z-30 flex items-center shadow-xs flex-shrink-0 relative">
        <button onClick={(e) => { e.stopPropagation(); onNavigate('home'); }} className="w-9 h-9 bg-white text-[#2C3E28] border border-[#d2ebc4] rounded-xl flex items-center justify-center mr-3 active:scale-95 transition-all shadow-2xs flex-shrink-0 cursor-pointer">
          <ArrowLeft size={18} strokeWidth={2.5} />
        </button>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h2 className="text-[#2C3E28] text-base font-extrabold uppercase tracking-wide whitespace-nowrap">Career Journey</h2>
            <span className="text-xs font-black text-[#58cc02] bg-[#f0fae6] px-2.5 py-1 rounded-full border border-[#d3f2b8]">
              {Math.min(100, Math.round((progress/30)*100))}%
            </span>
          </div>
          <div className="flex items-center mt-1.5">
            <div className="h-2.5 flex-1 bg-[#e1f0d8] rounded-full overflow-hidden border border-[#c2e1b1] mr-2 shadow-inner">
              <div className="h-full bg-gradient-to-r from-[#78c800] to-[#58cc02] rounded-full transition-all duration-500 shadow-xs" style={{ width: `${(progress/30)*100}%` }}></div>
            </div>
            <p className="text-[#375e2e] font-black text-xs">{progress}/30</p>
          </div>
        </div>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto scrollbar-hide relative bg-gradient-to-b from-[#eaf5e3] via-[#e2f3d8] to-[#d8ebd0]" 
        style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}
      >
         <div className="relative w-full overflow-hidden" style={{ height: '3400px', minWidth: '320px' }}>
            <svg className="absolute top-0 left-0 w-full h-full" style={{ zIndex: 0 }} viewBox="0 0 400 3400" preserveAspectRatio="none">
               {/* Base road outline */}
               <path d={pathD} fill="none" stroke="#bde0ab" strokeWidth="14" strokeLinecap="round" />
               {/* Inner road dashed track */}
               <path d={pathD} fill="none" stroke="#f2faeb" strokeWidth="6" strokeLinecap="round" strokeDasharray="8 8" />
               {/* Active progress path */}
               <path d={nodes.slice(0, Math.max(1, progress)).map((level, i) => {
                  const yPos = i * 110 + 60;
                  const ySvg = 3400 - yPos;
                  const xOffset = Math.sin(i * 0.9) * 90;
                  const xSvg = 200 + xOffset;
                  return `${i === 0 ? 'M' : 'L'} ${xSvg},${ySvg}`;
               }).join(' ')} fill="none" stroke="#58cc02" strokeWidth="8" strokeLinecap="round" />
            </svg>
            
            {nodes.map((level, i) => {
              const xOffset = Math.sin(i * 0.9) * 90;
              const isCompleted = level <= progress;
              const isCurrent = level === progress + 1;
              const isLocked = level > progress + 1;

              const title = [
                "Self Awareness", "Values & Strengths", "Exploring Interests", 
                "Career Vision", "Goal Setting", "Time Management", "Networking",
                "Skill Building", "Mindset Shift", "Confidence Boost", "Creative Flow",
                "Problem Solving", "Leadership", "Habit Stacking", "Focus Mastery"
              ][i % 15];

              return (
                <div key={level} className="absolute flex flex-col items-center" style={{ 
                    bottom: i * 110 + 60 - 45, // center offset
                    left: `calc(50% + ${xOffset}px - 60px)`,
                    width: '120px'
                  }}>
                  {/* Speech bubble for Current Active Level */}
                  {isCurrent && (
                    <motion.div 
                      initial={{ y: -5 }}
                      animate={{ y: [0, -4, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                      className={`mb-1.5 text-[10px] font-black px-2.5 py-1 rounded-xl shadow-md border flex items-center gap-1 z-30 relative ${
                        canJournalToday 
                          ? 'bg-[#2C3E28] text-[#D5F0C0] border-[#8BC34A]/50' 
                          : 'bg-[#D84315] text-white border-[#FF7043]'
                      }`}
                    >
                      <Mascot size={18} />
                      <span>{canJournalToday ? 'START ➔' : '⏳ 24h LOCK'}</span>
                      {/* Triangle pointer */}
                      <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 ${
                        canJournalToday ? 'bg-[#2C3E28]' : 'bg-[#D84315]'
                      }`}></div>
                    </motion.div>
                  )}

                  {/* Node Button */}
                  <motion.button 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: Math.min(i * 0.02, 0.5) }}
                    onClick={() => onSelectLevel(level)}
                    className={`relative rounded-3xl flex items-center justify-center font-black transition-all active:scale-90 cursor-pointer ${
                      isCurrent 
                        ? 'w-18 h-18 bg-[#ffc800] border-b-4 border-[#e5a900] text-[#5c4000] shadow-lg ring-4 ring-[#ffc800]/40 z-20' 
                        : isCompleted 
                        ? 'w-16 h-16 bg-[#58cc02] border-b-4 border-[#46a302] text-white shadow-md z-10' 
                        : 'w-15 h-15 bg-[#e2edd4] border-b-4 border-[#c0d2ad] text-[#869970] shadow-2xs z-10 opacity-85'
                    }`}
                  >
                    {isLocked ? (
                      <Lock size={18} className="text-[#889972]" />
                    ) : isCompleted ? (
                      <span className="text-xl">🌿</span>
                    ) : (
                      <Star size={26} fill="#ffffff" className="text-white drop-shadow-xs" />
                    )}
                  </motion.button>

                  {/* Level Title Tag */}
                  <div className="mt-2 text-center w-36">
                    <div className={`inline-block rounded-2xl px-2.5 py-1 shadow-2xs border ${
                      isCurrent 
                        ? 'bg-white border-[#ffc800] text-[#2C3E28] font-black shadow-xs' 
                        : isCompleted 
                        ? 'bg-white/95 border-[#c5e6ad] text-[#2C3E28] font-extrabold' 
                        : 'bg-white/70 border-[#d3e3c7] text-[#637554] font-bold'
                    }`}>
                      <div className="text-[11px] leading-tight tracking-wide">{title}</div>
                    </div>
                    <div className="text-[10px] text-[#4d7343] font-black uppercase tracking-wider mt-0.5">Lvl {level}</div>
                  </div>
                </div>
              );
            })}
         </div>
      </div>
      

      {/* Bottom Nav */}
      <div className="flex justify-around items-center bg-white/95 backdrop-blur-md p-3.5 border-t border-[#e2ebd9] shadow-lg text-[#86a674] z-50 relative">
        <button onClick={() => onNavigate('home')} className="flex flex-col items-center cursor-pointer">
          <Home size={22} />
          <span className="text-[10px] mt-1">Home</span>
        </button>
        <button className="flex flex-col items-center text-[#2C3E28] font-bold cursor-pointer">
          <Compass size={22} />
          <span className="text-[10px] mt-1 font-bold">Journey</span>
        </button>
        <button onClick={() => onNavigate('cbt')} className="flex flex-col items-center cursor-pointer">
          <Users size={22} />
          <span className="text-[10px] mt-1">Socio</span>
        </button>
        <button onClick={() => onNavigate('profile')} className="flex flex-col items-center cursor-pointer active:scale-95 transition-transform">
          <User size={22} />
          <span className="text-[10px] mt-1">Profile</span>
        </button>
      </div>
    </div>
  );
}

export function JournalScreen({ 
  level, 
  initialText = '', 
  canJournalToday = true,
  onSave, 
  onBack 
}: { 
  level: number, 
  initialText?: string, 
  canJournalToday?: boolean,
  onSave: (text: string, updatedStatus?: any) => void, 
  onBack: () => void 
}) {
  return (
    <TherapySessionScreen
      level={level}
      initialText={initialText}
      canJournalToday={canJournalToday}
      onSave={onSave}
      onBack={onBack}
    />
  );
}
