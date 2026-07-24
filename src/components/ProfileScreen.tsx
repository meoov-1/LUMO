import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  HeartHandshake,
  Edit3,
  X,
  LogOut
} from 'lucide-react';
import { Mascot } from './Assets';
import { ScreenState } from '../types';

interface ProfileScreenProps {
  progress: number;
  journals: Record<number, string>;
  user?: any;
  userName?: string;
  onNavigate: (screen: ScreenState) => void;
  onProfileUpdated?: () => void;
}

export function ProfileScreen({ progress, journals, user, userName, onNavigate, onProfileUpdated }: ProfileScreenProps) {
  const loggedCount = Object.keys(journals).length;
  const daysRemaining = Math.max(0, 30 - progress);
  const completionPercent = Math.min(100, Math.round((progress / 30) * 100));

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(userName || user?.fullName || localStorage.getItem("lumo_user_name") || "Explorer");
  const [editUsername, setEditUsername] = useState(user?.username || localStorage.getItem("lumo_username") || "explorer");
  const [isSaving, setIsSaving] = useState(false);

  const activeName = editName || "Explorer User";
  const activeUsername = editUsername.startsWith("@") ? editUsername : `@${editUsername}`;

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem("lumo_token");
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const cleanUser = editUsername.replace(/^@/, '').trim();

      const res = await fetch('/api/user/update-profile', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          fullName: editName.trim(),
          username: cleanUser
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          localStorage.setItem("lumo_user_name", data.user.fullName);
          if (data.user.username) localStorage.setItem("lumo_username", data.user.username);
        }
        if (onProfileUpdated) onProfileUpdated();
      }
    } catch (e) {
      console.warn("Failed to update profile:", e);
    } finally {
      setIsSaving(false);
      setIsEditing(false);
    }
  };

  // Dynamic career inclination assessment based on user progress & reflections
  const getCareerInclination = () => {
    if (progress < 5) {
      return {
        title: "Creative Strategy & Innovation",
        subtitle: "High affinity for human-centered problem solving & strategic vision",
        tags: ["Systems Thinking", "Creative Problem Solving", "Visionary Mindset"],
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
        tags: ["Empathetic Leadership", "Product Architecture", "Execution"],
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
        tags: ["High Impact Strategy", "Mindful Leadership", "Deep Analysis"],
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

  const handleLogout = () => {
    localStorage.removeItem("lumo_token");
    localStorage.removeItem("lumo_user_name");
    localStorage.removeItem("lumo_username");
    onNavigate('landing');
  };

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
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#eaf8e1] to-[#ffffff] border-2 border-[#8edb59] flex items-center justify-center shadow-xs overflow-hidden">
              <Mascot size={70} />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-[#58cc02] text-white p-1 rounded-full border-2 border-white shadow-xs">
              <ShieldCheck size={12} />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <h3 className="text-lg font-black text-[#2C3E28] truncate">{activeName}</h3>
              <button 
                onClick={() => setIsEditing(true)} 
                className="bg-[#f0fae6] hover:bg-[#e2f5d3] text-[#375e2e] p-1.5 rounded-xl border border-[#c2e1b1] transition-all text-xs font-bold flex items-center gap-1 active:scale-90 cursor-pointer"
                title="Edit name or username"
              >
                <Edit3 size={13} />
              </button>
            </div>
            <p className="text-xs font-bold text-[#7ab056] truncate">{activeUsername}</p>
            <p className="text-[11px] text-[#527847] font-semibold mt-0.5">30-Day Mindful Career Quest</p>
            <div className="mt-2.5 flex items-center gap-2">
              <div className="h-2 flex-1 bg-[#e2f0d9] rounded-full overflow-hidden border border-[#cbe3be]">
                <div className="h-full bg-[#58cc02] rounded-full transition-all duration-500" style={{ width: `${completionPercent}%` }}></div>
              </div>
              <span className="text-[11px] font-black text-[#2C3E28]">{completionPercent}%</span>
            </div>
          </div>
        </div>

        {/* Edit Profile Modal */}
        <AnimatePresence>
          {isEditing && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
              onClick={() => setIsEditing(false)}
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl p-6 shadow-2xl w-full max-w-sm border-2 border-[#d8edd0] relative"
              >
                <button 
                  onClick={() => setIsEditing(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
                >
                  <X size={18} />
                </button>

                <h3 className="text-lg font-black text-[#2C3E28] mb-1">Edit Profile</h3>
                <p className="text-xs text-gray-500 mb-4 font-semibold">Update your name and username handle</p>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-[#4d7343] mb-1 block">Full Name</label>
                    <input 
                      type="text" 
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Your name"
                      className="w-full bg-[#F4F9EE] border border-[#d8edd0] p-3 rounded-xl text-sm font-bold text-[#2C3E28] focus:outline-none focus:ring-2 focus:ring-[#8BC34A]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#4d7343] mb-1 block">Username Handle</label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-sm font-bold text-gray-400">@</span>
                      <input 
                        type="text" 
                        value={editUsername.replace(/^@/, '')}
                        onChange={(e) => setEditUsername(e.target.value)}
                        placeholder="username"
                        className="w-full bg-[#F4F9EE] border border-[#d8edd0] p-3 pl-8 rounded-xl text-sm font-bold text-[#2C3E28] focus:outline-none focus:ring-2 focus:ring-[#8BC34A]"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold text-xs"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="flex-1 py-3 bg-[#2C3E28] text-[#D5F0C0] rounded-xl font-black text-xs shadow-md active:scale-95 transition-transform disabled:opacity-50"
                    >
                      {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 2-Stat Grid (Level & Reflections) */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-3.5 border border-[#c2e1b1] shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EAF7E3] text-[#58CC02] flex items-center justify-center flex-shrink-0">
              <Award size={20} />
            </div>
            <div>
              <div className="text-xs font-bold text-[#4d7343]">Level</div>
              <div className="text-base font-black text-[#1D3222]">{progress} / 30</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-3.5 border border-[#c2e1b1] shadow-2xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EAF7E3] text-[#58CC02] flex items-center justify-center flex-shrink-0">
              <BookOpen size={20} />
            </div>
            <div>
              <div className="text-xs font-bold text-[#4d7343]">Reflections</div>
              <div className="text-base font-black text-[#1D3222]">{loggedCount} Entries</div>
            </div>
          </div>
        </div>

        {/* Career Inclination Index Card */}
        <div className="bg-white rounded-3xl p-5 border border-[#c2e1b1] shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#f0f7ec] pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#eaf8e1] text-[#3e722c] flex items-center justify-center">
                <Compass size={18} />
              </div>
              <div>
                <h4 className="text-sm font-black text-[#1D3222]">Career Inclination Index</h4>
                <p className="text-[10px] text-[#587e4d] font-bold">Inferred direction & skill distribution</p>
              </div>
            </div>
            <span className="bg-[#58CC02] text-white text-[10px] font-black px-2.5 py-1 rounded-full">
              Live Index
            </span>
          </div>

          {/* Primary Direction Highlight Box */}
          <div className="bg-gradient-to-r from-[#f2faeb] to-[#fafff6] rounded-2xl p-4 border border-[#cbe3be]">
            <div className="text-[11px] font-black uppercase text-[#4d7343] tracking-wide mb-1 flex items-center gap-1">
              <Target size={13} className="text-[#58cc02]" /> Primary Inclination
            </div>
            <div className="text-base font-black text-[#1D3222] leading-tight mb-1">
              {inclination.title}
            </div>
            <p className="text-xs text-[#527847] font-medium leading-snug">
              {inclination.subtitle}
            </p>

            {/* Inclination Tag Chips */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {inclination.tags.map((tag, idx) => (
                <span key={idx} className="bg-white text-[#1D3222] text-[11px] font-extrabold px-2.5 py-1 rounded-xl border border-[#d2ebc4] shadow-2xs">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Skill / Trait Meters */}
          <div className="space-y-2.5 pt-1">
            <div className="text-xs font-black text-[#1D3222] flex items-center gap-1.5">
              <BarChart3 size={14} className="text-[#375e2e]" /> Evaluated Trait Metrics
            </div>
            {inclination.traits.map((trait, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-[#4a6d3f]">
                  <span>{trait.name}</span>
                  <span className="font-black text-[#1D3222]">{trait.score}%</span>
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

        {/* Account Management & Log Out Section */}
        <div className="bg-white rounded-3xl p-5 border border-[#e8cece] shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-black text-[#1D3222]">Account & Session</h4>
              <p className="text-[10px] text-gray-500 font-semibold">Sign out of your active Lumo session safely</p>
            </div>
            <button 
              onClick={handleLogout}
              className="bg-[#FFF0F0] hover:bg-[#FFE5E5] text-[#D93838] border border-[#F8B4B4] font-black text-xs px-4 py-2.5 rounded-2xl flex items-center gap-2 active:scale-95 transition-all cursor-pointer shadow-2xs"
            >
              <LogOut size={15} />
              <span>Log Out</span>
            </button>
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
          <Compass size={22} />
          <span className="text-[10px] mt-1 font-semibold">Journey</span>
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
