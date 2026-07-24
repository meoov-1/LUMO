import React from 'react';
import { motion } from 'motion/react';
import { 
  Home, 
  Briefcase, 
  Users, 
  User, 
  Compass, 
  Brain, 
  Sparkles, 
  Award, 
  Flame, 
  BookOpen, 
  ShieldCheck, 
  ChevronRight, 
  ArrowLeft,
  Target,
  BarChart3,
  CheckCircle2,
  Lock,
  HeartHandshake
} from 'lucide-react';
import { Mascot } from './Assets';
import { ScreenState } from '../types';

interface ProfileScreenProps {
  progress: number;
  journals: Record<number, string>;
  onNavigate: (screen: ScreenState) => void;
}

export function ProfileScreen({ progress, journals, onNavigate }: ProfileScreenProps) {
  const loggedCount = Object.keys(journals).length;
  const daysRemaining = Math.max(0, 30 - progress);
  const completionPercent = Math.min(100, Math.round((progress / 30) * 100));

  // Dynamic career inclination assessment based on user progress & reflections
  const getCareerInclination = () => {
    if (progress < 5) {
      return {
        title: "Creative Strategy & Innovation",
        subtitle: "High affinity for human-centered problem solving & strategic vision",
        tags: ["🧩 Systems Thinking", "🎨 Creative Problem Solving", "💡 Visionary Mindset"],
        traits: [
          { name: "Creative Problem Solving", score: 88, color: "bg-[#78C800]" },
          { name: "Strategic Thinking", score: 82, color: "bg-[#2ECC71]" },
          { name: "Empathetic Communication", score: 90, color: "bg-[#3498DB]" },
          { name: "Adaptability & Resilience", score: 85, color: "bg-[#F39C12]" },
        ]
      };
    } else if (progress < 15) {
      return {
        title: "Product Strategy & Human Experience",
        subtitle: "Strong inclination towards guiding teams, designing systems, and impactful leadership",
        tags: ["👥 Empathetic Leadership", "📐 Product Architecture", "🚀 Execution"],
        traits: [
          { name: "Creative Problem Solving", score: 91, color: "bg-[#78C800]" },
          { name: "Strategic Thinking", score: 88, color: "bg-[#2ECC71]" },
          { name: "Empathetic Communication", score: 94, color: "bg-[#3498DB]" },
          { name: "Adaptability & Resilience", score: 89, color: "bg-[#F39C12]" },
        ]
      };
    } else {
      return {
        title: "Strategic Product & Growth Leadership",
        subtitle: "High maturity in cross-functional strategy, empathetic direction, and long-term vision",
        tags: ["🎯 High Impact Strategy", "🌱 Mindful Leadership", "🔬 Deep Analysis"],
        traits: [
          { name: "Creative Problem Solving", score: 95, color: "bg-[#78C800]" },
          { name: "Strategic Thinking", score: 94, color: "bg-[#2ECC71]" },
          { name: "Empathetic Communication", score: 96, color: "bg-[#3498DB]" },
          { name: "Adaptability & Resilience", score: 92, color: "bg-[#F39C12]" },
        ]
      };
    }
  };

  const inclination = getCareerInclination();

  return (
    <div className="flex-1 flex flex-col bg-[#eaf5e3] relative overflow-hidden select-none">
      {/* Top Bar */}
      <div className="bg-white/90 backdrop-blur-md border-b border-[#d2ebc4] pt-5 pb-3 px-4 z-30 flex items-center shadow-xs flex-shrink-0">
        <button 
          onClick={() => onNavigate('home')} 
          className="w-9 h-9 bg-white text-[#2C3E28] border border-[#d2ebc4] rounded-xl flex items-center justify-center mr-3 active:scale-95 transition-all shadow-2xs flex-shrink-0 cursor-pointer"
        >
          <ArrowLeft size={18} strokeWidth={2.5} />
        </button>
        <div className="flex-1">
          <h2 className="text-[#2C3E28] text-base font-black uppercase tracking-wide">My Profile</h2>
          <p className="text-[11px] text-[#4d7343] font-bold">Career & Mindset Intelligence</p>
        </div>
        <div className="bg-[#f0fae6] border border-[#cbe3be] text-[#375e2e] text-xs font-black px-2.5 py-1 rounded-full flex items-center gap-1">
          <Sparkles size={12} className="text-[#58cc02]" />
          <span>Tier {Math.min(3, Math.floor(progress / 10) + 1)}</span>
        </div>
      </div>

      {/* Main Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-6 scrollbar-hide">
        {/* User Identity Header Card */}
        <div className="bg-white rounded-3xl p-5 border border-[#d8edd0] shadow-2xs flex items-center gap-4 relative overflow-hidden">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#eaf8e1] to-[#ffffff] border-2 border-[#8edb59] flex items-center justify-center shadow-xs overflow-hidden">
              <Mascot size={70} />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-[#58cc02] text-white p-1 rounded-full border-2 border-white shadow-xs">
              <ShieldCheck size={12} />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-[#2C3E28] truncate">Explorer User</h3>
              <span className="bg-[#e8f7de] text-[#375e2e] text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-[#c2e1b1]">
                Active
              </span>
            </div>
            <p className="text-xs text-[#527847] font-semibold mt-0.5">30-Day Mindful Career Quest</p>
            <div className="mt-2.5 flex items-center gap-2">
              <div className="h-2 flex-1 bg-[#e2f0d9] rounded-full overflow-hidden border border-[#cbe3be]">
                <div className="h-full bg-[#58cc02] rounded-full transition-all duration-500" style={{ width: `${completionPercent}%` }}></div>
              </div>
              <span className="text-[11px] font-black text-[#2C3E28]">{completionPercent}%</span>
            </div>
          </div>
        </div>

        {/* 4-Stat Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-3.5 border border-[#d8edd0] shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFF3E0] text-[#E65100] flex items-center justify-center flex-shrink-0">
              <Flame size={20} />
            </div>
            <div>
              <div className="text-xs font-bold text-[#688a5d]">Streak</div>
              <div className="text-base font-black text-[#2C3E28]">{Math.max(1, Math.min(progress, 7))} Days 🔥</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-3.5 border border-[#d8edd0] shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center flex-shrink-0">
              <Award size={20} />
            </div>
            <div>
              <div className="text-xs font-bold text-[#688a5d]">Level</div>
              <div className="text-base font-black text-[#2C3E28]">{progress} / 30</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-3.5 border border-[#d8edd0] shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E0F2FE] text-[#0277BD] flex items-center justify-center flex-shrink-0">
              <BookOpen size={20} />
            </div>
            <div>
              <div className="text-xs font-bold text-[#688a5d]">Reflections</div>
              <div className="text-base font-black text-[#2C3E28]">{loggedCount} Entries</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-3.5 border border-[#d8edd0] shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F3E5F5] text-[#7B1FA2] flex items-center justify-center flex-shrink-0">
              <HeartHandshake size={20} />
            </div>
            <div>
              <div className="text-xs font-bold text-[#688a5d]">Mindset Vibe</div>
              <div className="text-base font-black text-[#2C3E28]">Calm & Purpose</div>
            </div>
          </div>
        </div>

        {/* Career Inclination Index Card */}
        <div className="bg-white rounded-3xl p-5 border border-[#d8edd0] shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#f0f7ec] pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#eaf8e1] text-[#3e722c] flex items-center justify-center">
                <Compass size={18} />
              </div>
              <div>
                <h4 className="text-sm font-black text-[#2C3E28]">Career Inclination Index</h4>
                <p className="text-[10px] text-[#587e4d] font-bold">Inferred direction & skill distribution</p>
              </div>
            </div>
            <span className="bg-[#2C3E28] text-[#D5F0C0] text-[10px] font-black px-2.5 py-1 rounded-full">
              Live Index
            </span>
          </div>

          {/* Primary Direction Highlight Box */}
          <div className="bg-gradient-to-r from-[#f2faeb] to-[#fafff6] rounded-2xl p-4 border border-[#cbe3be]">
            <div className="text-[11px] font-black uppercase text-[#4d7343] tracking-wide mb-1 flex items-center gap-1">
              <Target size={13} className="text-[#58cc02]" /> Primary Inclination
            </div>
            <div className="text-base font-black text-[#2C3E28] leading-tight mb-1">
              {inclination.title}
            </div>
            <p className="text-xs text-[#527847] font-medium leading-snug">
              {inclination.subtitle}
            </p>

            {/* Inclination Tag Chips */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {inclination.tags.map((tag, idx) => (
                <span key={idx} className="bg-white text-[#2C3E28] text-[11px] font-extrabold px-2.5 py-1 rounded-xl border border-[#d2ebc4] shadow-2xs">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Skill / Trait Meters */}
          <div className="space-y-2.5 pt-1">
            <div className="text-xs font-black text-[#2C3E28] flex items-center gap-1.5">
              <BarChart3 size={14} className="text-[#375e2e]" /> Evaluated Trait Metrics
            </div>
            {inclination.traits.map((trait, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-[#4a6d3f]">
                  <span>{trait.name}</span>
                  <span className="font-black text-[#2C3E28]">{trait.score}%</span>
                </div>
                <div className="h-2 w-full bg-[#edf5e8] rounded-full overflow-hidden border border-[#dbeccf]">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${trait.score}%` }}
                    transition={{ duration: 0.8, delay: idx * 0.1 }}
                    className={`h-full ${trait.color} rounded-full`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 30-Day AI Data Intelligence Engine Card */}
        <div className="bg-[#1e2f1b] text-white rounded-3xl p-5 shadow-sm space-y-4 border border-[#3b5934] relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#58cc02] text-[#1e2f1b] flex items-center justify-center font-black">
                <Brain size={18} />
              </div>
              <div>
                <h4 className="text-sm font-black text-white">30-Day AI Intelligence Engine</h4>
                <p className="text-[10px] text-[#a1d890] font-bold">Accumulating contextual reflection data</p>
              </div>
            </div>
            <div className="bg-[#58cc02]/20 border border-[#58cc02]/40 text-[#8edb59] text-[10px] font-black px-2.5 py-1 rounded-full">
              Day {progress} / 30
            </div>
          </div>

          {/* Progress Tracker Bar */}
          <div className="bg-white/5 rounded-2xl p-3.5 border border-white/10 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-extrabold text-[#c8e8bc]">AI Data Collection</span>
              <span className="font-black text-[#8edb59]">{progress}/30 Days</span>
            </div>
            <div className="h-2.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/10">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(progress / 30) * 100}%` }}
                className="h-full bg-gradient-to-r from-[#78c800] to-[#58cc02] rounded-full"
              />
            </div>
            <p className="text-[11px] text-[#aedb9e] leading-relaxed pt-1 font-medium">
              As you write daily reflections over these 30 days, Lumo AI analyzes your emerging values, problem-solving styles, and emotional resilience to construct a high-precision 360° Career & Mindset Blueprint.
            </p>
          </div>

          {/* AI Synthesis Status Teaser */}
          {daysRemaining > 0 ? (
            <div className="bg-[#2a4026] rounded-2xl p-3.5 border border-[#43663d] flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Lock size={15} />
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-black text-amber-200">
                  {daysRemaining} More Days for Full 360° AI Blueprint
                </div>
                <p className="text-[11px] text-[#c2e2b8] font-medium leading-normal">
                  Keep logging daily reflections in your Career Journey! Every journal entry gives the AI more fruitful data to refine your personalized career recommendations.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-[#2ecc71]/20 rounded-2xl p-3.5 border border-[#2ecc71]/40 flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-[#2ecc71] text-[#1e2f1b] flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle2 size={16} />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-black text-[#a6f3c5]">
                  Full 30-Day Synthesis Complete!
                </div>
                <p className="text-[11px] text-[#d1f7e0] font-medium leading-normal">
                  Your complete 360° AI Career & Mindset Report is ready. Access deep tailored recommendations in your AI Advisor!
                </p>
                <button 
                  onClick={() => onNavigate('career-advisor')}
                  className="mt-1 bg-[#58cc02] text-[#1e2f1b] font-black text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1 active:scale-95 transition-transform cursor-pointer"
                >
                  View Full AI Report <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Discovered Core Values & Drivers Card */}
        <div className="bg-white rounded-3xl p-5 border border-[#d8edd0] shadow-2xs space-y-3">
          <div className="flex items-center gap-2 border-b border-[#f0f7ec] pb-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#f0fae6] text-[#3e722c] flex items-center justify-center">
              <Sparkles size={18} />
            </div>
            <div>
              <h4 className="text-sm font-black text-[#2C3E28]">Discovered Core Values</h4>
              <p className="text-[10px] text-[#587e4d] font-bold">Key motivators extracted from reflections</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {[
              "🌱 Continuous Learning",
              "🗽 Autonomy & Freedom",
              "💡 Creative Expression",
              "🌍 Meaningful Impact",
              "🧘 Work-Life Balance",
              "🧠 Growth Mindset"
            ].map((value, idx) => (
              <span key={idx} className="bg-[#f2faeb] text-[#2C3E28] border border-[#cbe3be] text-xs font-extrabold px-3 py-1.5 rounded-2xl shadow-2xs">
                {value}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="flex justify-around items-center bg-white/95 backdrop-blur-md p-3.5 border-t border-[#e2ebd9] shadow-lg text-[#86a674] z-50 relative">
        <button onClick={() => onNavigate('home')} className="flex flex-col items-center cursor-pointer active:scale-95 transition-transform">
          <Home size={22} />
          <span className="text-[10px] mt-1 font-semibold">Home</span>
        </button>
        <button onClick={() => onNavigate('journey')} className="flex flex-col items-center cursor-pointer active:scale-95 transition-transform">
          <Briefcase size={22} />
          <span className="text-[10px] mt-1 font-semibold">Career</span>
        </button>
        <button onClick={() => onNavigate('cbt')} className="flex flex-col items-center cursor-pointer active:scale-95 transition-transform">
          <Users size={22} />
          <span className="text-[10px] mt-1 font-semibold">Socio</span>
        </button>
        <button className="flex flex-col items-center text-[#2C3E28] font-bold cursor-pointer">
          <User size={22} />
          <span className="text-[10px] mt-1 font-black">Profile</span>
        </button>
      </div>
    </div>
  );
}
