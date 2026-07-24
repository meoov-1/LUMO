import React, { useState, useRef, useEffect } from 'react';
import { Mascot, Tree } from './Assets';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Map, Book, PenTool, User, Lock, ArrowLeft, Star, Briefcase, Users } from 'lucide-react';

export function HomeScreen({ progress, onNavigate }: { progress: number, onNavigate: (screen: string) => void }) {
  const isComplete = progress >= 30;

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
            <div className="bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/60 shadow-sm flex items-center gap-2">
              <span className="text-base">🔥</span>
              <span className="text-xs font-black text-[#2C3E28]">{progress} Day Streak</span>
            </div>
          </div>

          {/* Prominent Large Tree Frame - Perfectly fitted to phone screen frame */}
          <div 
            onClick={handleTreeClick} 
            className="relative w-full max-w-[320px] sm:max-w-[350px] h-[270px] sm:h-[290px] z-10 mx-auto my-0 cursor-pointer transition-transform active:scale-98 group flex items-center justify-center overflow-visible"
            title="Tap Tree for Status"
          >
            <Tree progress={progress} />
            <div className="absolute top-1 right-2 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full border border-[#8BC34A] text-xs font-black text-[#2C3E28] shadow-md flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <span>🍎 {Math.min(Math.max(1, progress), 30)} Apples Grown</span>
            </div>
          </div>

          {/* Grassy Mound & Quick Action Frame */}
          <div className="w-full flex items-end justify-between px-2 z-20 mt-[-10px]">
            {/* Duolingo Mascot */}
            <Mascot size={90} />

            {/* Quick Level Jump Button */}
            <button 
              onClick={() => onNavigate('journey')} 
              className="bg-[#2C3E28] text-[#D5F0C0] px-4 py-2.5 rounded-2xl font-black text-xs shadow-lg flex items-center gap-2 active:scale-95 transition-transform border border-[#8BC34A]/50 mb-2"
            >
              <span>Career Path</span>
              <span className="text-sm">➔</span>
            </button>
          </div>

          <AnimatePresence>
            {isComplete && (
              <motion.div 
                initial={{scale: 0.8, opacity: 0}} 
                animate={{scale: 1, opacity: 1}} 
                className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/95 p-5 rounded-3xl shadow-2xl text-center backdrop-blur-md z-30 border-4 border-[#8BC34A] w-80 space-y-3"
              >
                <div className="w-12 h-12 bg-[#f0fae6] text-[#58cc02] rounded-2xl flex items-center justify-center mx-auto text-2xl shadow-sm border border-[#cbe3be]">
                  🏆
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#2C3E28]">30 Days Completed! 🎉</h3>
                  <p className="text-[#4A6546] text-xs font-semibold leading-relaxed mt-1">
                    Your 30-day reflection journey is complete! Your personalized 360° AI Career Path & Synthesis is now fully unlocked.
                  </p>
                </div>
                <button
                  onClick={() => onNavigate('career-advisor')}
                  className="w-full bg-[#2C3E28] text-[#D5F0C0] py-2.5 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-transform shadow-md cursor-pointer border border-[#8BC34A]/50"
                >
                  <span>✨ View My 30-Day Career Path</span>
                  <span className="text-sm">➔</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Stats & Dashboard Section */}
        <div className="bg-[#E8F5D3] px-6 pt-6 pb-8 z-30">
          <div className="w-12 h-1.5 bg-[#c2dfa9] rounded-full mx-auto mb-5"></div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-extrabold text-[#2C3E28]">Good day, Aria</h1>
              <p className="text-[#6b8e5c] text-xs font-bold mt-0.5">Day {progress} · Stage {Math.floor(progress/7) + 1} · Flowers Blooming 🌸</p>
            </div>
            <div className="bg-[#4c8435] text-white px-3 py-1.5 rounded-2xl text-xs font-black shadow-sm">
              Lvl {progress}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div className="bg-white p-4.5 rounded-3xl shadow-sm border border-[#cbe3b3] flex flex-col justify-between">
               <span className="text-2xl mb-2">🌱</span>
               <div>
                 <div className="text-xl font-black text-[#4c8435]">{Math.min(100, Math.round((progress/30)*100))}%</div>
                 <div className="text-[10px] text-[#6b8e5c] font-extrabold uppercase tracking-wide mt-0.5">Tree Health</div>
               </div>
            </div>
            <div className="bg-white p-4.5 rounded-3xl shadow-sm border border-[#cbe3b3] flex flex-col justify-between">
               <span className="text-2xl mb-2">🌙</span>
               <div>
                 <div className="text-xl font-black text-[#866ba8]">Calm</div>
                 <div className="text-[10px] text-[#6b8e5c] font-extrabold uppercase tracking-wide mt-0.5">Today's Mood</div>
               </div>
            </div>
            <div className="bg-white p-4.5 rounded-3xl shadow-sm border border-[#cbe3b3] flex flex-col justify-between">
               <span className="text-2xl mb-2">🔥</span>
               <div>
                 <div className="text-xl font-black text-[#d66b2a]">{progress} days</div>
                 <div className="text-[10px] text-[#6b8e5c] font-extrabold uppercase tracking-wide mt-0.5">Streak</div>
               </div>
            </div>
            <div className="bg-white p-4.5 rounded-3xl shadow-sm border border-[#cbe3b3] flex flex-col justify-between">
               <span className="text-2xl mb-2">✨</span>
               <div>
                 <div className="text-xl font-black text-[#d4af37]">3 / 5</div>
                 <div className="text-[10px] text-[#6b8e5c] font-extrabold uppercase tracking-wide mt-0.5">Goals Met</div>
               </div>
            </div>
          </div>

          {/* Quick Action CBT & AI Career Cards */}
          <div className="mt-4 space-y-3">
            <div 
              onClick={() => onNavigate('career-advisor')}
              className="bg-gradient-to-r from-[#2C3E28] via-[#3d5937] to-[#4c7045] text-[#D5F0C0] p-4.5 rounded-3xl shadow-md cursor-pointer flex items-center justify-between active:scale-98 transition-transform border border-[#8BC34A]/40"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-[#8BC34A] text-[#2C3E28] rounded-2xl flex items-center justify-center font-bold text-xl shadow-inner">
                  🤖
                </div>
                <div>
                  <div className="font-extrabold text-sm text-white flex items-center gap-1.5">
                    <span>AI Career Advice</span>
                    <span className="bg-[#8BC34A] text-[#2C3E28] text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase">Gemini AI</span>
                  </div>
                  <div className="text-xs text-[#b8e8a0]">Analyzes your daily journals & events</div>
                </div>
              </div>
              <div className="text-lg text-[#8BC34A] font-bold">➔</div>
            </div>

            <div 
              onClick={() => onNavigate('cbt')}
              className="bg-white text-[#2C3E28] p-4 rounded-3xl shadow-xs border border-[#cbe3b3] cursor-pointer flex items-center justify-between active:scale-98 transition-transform"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#E8F5D3] text-[#2C3E28] rounded-2xl flex items-center justify-center font-bold text-lg">
                  ⚡
                </div>
                <div>
                  <div className="font-extrabold text-sm text-[#2C3E28]">Anxiety Buster</div>
                  <div className="text-xs text-[#6b8e5c]">Spill the tea & reframe thoughts</div>
                </div>
              </div>
              <div className="text-lg text-[#4c8435]">➔</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="flex justify-around items-center bg-[#f2f8ea] p-3.5 rounded-t-3xl shadow-[0_-4px_10px_rgba(0,0,0,0.05)] text-[#86a674] z-40 border-t border-[#c2dfa9]">
        <button className="flex flex-col items-center text-[#4c8435] font-bold">
          <Home size={22} />
          <span className="text-[10px] mt-1 font-extrabold">Home</span>
        </button>
        <button onClick={() => onNavigate('journey')} className="flex flex-col items-center active:scale-95 transition-transform">
          <Briefcase size={22} />
          <span className="text-[10px] mt-1 font-semibold">Career</span>
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
                      className="mb-1.5 bg-[#2C3E28] text-[#D5F0C0] text-[10px] font-black px-2.5 py-1 rounded-xl shadow-md border border-[#8BC34A]/50 flex items-center gap-1 z-30 relative"
                    >
                      <Mascot size={18} />
                      <span>START ➔</span>
                      {/* Triangle pointer */}
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#2C3E28] rotate-45"></div>
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
          <Briefcase size={22} />
          <span className="text-[10px] mt-1 font-bold">Career</span>
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

export function JournalScreen({ level, initialText = '', onSave, onBack }: { level: number, initialText?: string, onSave: (text: string) => void, onBack: () => void }) {
  const [text, setText] = useState(initialText);
  const [showCelebration, setShowCelebration] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [showMotivation, setShowMotivation] = useState(false);
  const [motivationQuote, setMotivationQuote] = useState("");
  const isEditing = !!initialText;

  const MOTIVATION_QUOTES = [
    "Cheer up! It's just a bad day, not a bad life! 🌿 Lumo is right here with you every step of the way. Take a deep breath — you're doing great! ✨",
    "Rainy days help the flowers grow! 🌧️🌸 Take a gentle breath, be kind to yourself, and remember tomorrow is a fresh start! 💕",
    "Even the sun needs to hide behind clouds sometimes. ☀️ Give yourself permission to rest. You are so special and strong! 🌟",
    "Tough times never last, but tough people do! 💪 Lumo is sending you a huge warm hug right now. Everything will be okay! 💖",
    "Don't forget how far you've come! 🌈 Every small step counts. Be proud of yourself today! 🌿",
    "Storms make trees grow deeper roots! 🌳 Be gentle with your heart today — you are doing so much better than you realize! ✨",
    "One bad moment doesn't define your story! 📖 Take it one easy breath at a time, Lumo is right here with you! 🧸"
  ];

  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood);
    if (mood === 'not_good') {
      const randomIndex = Math.floor(Math.random() * MOTIVATION_QUOTES.length);
      setMotivationQuote(MOTIVATION_QUOTES[randomIndex]);
      setShowMotivation(true);
    }
  };

  const handleSave = () => {
    if (!text.trim()) return;
    setShowCelebration(true);
    setTimeout(() => {
      onSave(text);
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F9FDF7] relative">
      <div className="flex items-center p-6 pb-2 pt-10">
        <button onClick={() => onBack()} className="w-12 h-12 bg-white shadow-sm rounded-full flex items-center justify-center text-[#2C3E28] active:scale-95 transition-transform border border-gray-100">
          <ArrowLeft size={24} />
        </button>
        <h2 className="flex-1 text-center font-extrabold text-2xl text-[#2C3E28]">Level {level}</h2>
        <div className="w-12"></div>
      </div>

      <div className="flex flex-col items-center px-6 py-2">
         <Mascot 
           size={110} 
           bubbleText={isEditing ? "Editing your entry! ✏️" : "Level " + level + " Journaling! 🌸"}
         />
         <div className="bg-white p-4 rounded-3xl shadow-sm border border-[#D5F0C0] mt-3 relative w-full text-center">
           <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-5 h-5 bg-white border-t border-l border-[#D5F0C0] rotate-45"></div>
           <p className="text-[#4A6546] font-bold text-base mb-3">How are you feeling right now?</p>
           
           <div className="flex justify-center gap-2">
             <button
               onClick={() => handleMoodSelect('good')}
               className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${selectedMood === 'good' ? 'bg-[#D5F0C0] border-[#8BC34A] text-[#2C3E28] scale-105' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
             >
               😊 Good
             </button>
             <button
               onClick={() => handleMoodSelect('okay')}
               className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${selectedMood === 'okay' ? 'bg-[#E0F2FE] border-[#38BDF8] text-[#0369A1] scale-105' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
             >
               🌤️ Okay
             </button>
             <button
               onClick={() => handleMoodSelect('not_good')}
               className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${selectedMood === 'not_good' ? 'bg-[#FFEBEE] border-[#FF8A80] text-[#C62828] scale-105 ring-2 ring-[#FF8A80]/50' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
             >
               🌧️ Not so good
             </button>
           </div>
         </div>
      </div>

      <div className="flex-1 px-6 pb-8 flex flex-col mt-3">
         <textarea 
           value={text}
           onChange={(e) => setText(e.target.value)}
           placeholder="Dear journal..."
           className="flex-1 bg-white border-2 border-[#D5F0C0] rounded-[32px] p-5 text-[#2C3E28] text-base focus:outline-none focus:ring-4 focus:ring-[#D5F0C0]/50 resize-none shadow-sm transition-all"
         />
         <div className="flex gap-4 mt-4">
            <button onClick={handleSave} className="w-full bg-[#2C3E28] text-[#D5F0C0] py-4 rounded-2xl font-bold text-lg shadow-md active:scale-95 transition-transform">{isEditing ? 'Save Changes' : 'Save Entry'}</button>
         </div>
      </div>

      <AnimatePresence>
        {showMotivation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-6 z-50"
            onClick={() => setShowMotivation(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              className="bg-white p-6 rounded-3xl shadow-2xl border-4 border-[#FFCDD2] max-w-xs w-full text-center relative overflow-hidden flex flex-col items-center gap-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 bg-[#FFEBEE] text-[#C62828] rounded-full flex items-center justify-center text-2xl font-bold mb-1">
                💖
              </div>
              
              <h3 className="text-xl font-extrabold text-[#2C3E28]">Cheer Up! 🌸</h3>
              
              <p className="text-sm font-bold text-[#4c8435] leading-relaxed bg-[#F4F9EE] p-3.5 rounded-2xl border border-[#D5F0C0]">
                "{motivationQuote}"
              </p>

              <button
                onClick={() => setShowMotivation(false)}
                className="w-full bg-[#2C3E28] text-[#D5F0C0] py-3 rounded-2xl font-black text-sm shadow-md active:scale-95 transition-transform mt-2"
              >
                Thank you, Lumo! 💕
              </button>
            </motion.div>
          </motion.div>
        )}

        {showCelebration && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 bg-[#2C3E28]/95 backdrop-blur-sm flex flex-col items-center justify-center text-center p-8"
          >
             <motion.div 
               initial={{ scale: 0, rotate: -180 }}
               animate={{ scale: 1, rotate: 0 }}
               transition={{ type: "spring", damping: 12 }}
               className="w-56 h-56 bg-[#D5F0C0] rounded-full flex items-center justify-center mb-8 shadow-[0_0_120px_rgba(213,240,192,0.6)]"
             >
                <Star size={120} fill="#FFC107" className="text-[#FFC107]" />
             </motion.div>
             <motion.h2 
               initial={{ y: 50, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ delay: 0.2 }}
               className="text-5xl font-extrabold text-white mb-6"
             >
               Sweet!
             </motion.h2>
             <motion.p 
               initial={{ y: 50, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ delay: 0.4 }}
               className="text-[#D5F0C0] text-xl font-medium"
             >
               Journal entry saved. <br/><br/> See you tomorrow for Level {level + 1}!
             </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
