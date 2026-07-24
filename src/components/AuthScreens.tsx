import React, { useState } from 'react';
import { Mascot } from './Assets';
import { motion, AnimatePresence } from 'motion/react';
import { useSpeech } from '../hooks/useSpeech';

export function LandingScreen({ onNext }: { onNext: () => void }) {
  const greetingText = "Hii, I am Lumo, welcome!";
  const { isSpeaking, triggerSpeech } = useSpeech(greetingText, "landing-cute-welcome", { isCute: true, pitch: 1.20, rate: 1.0 });

  return (
    <motion.div initial={{opacity: 0}} animate={{opacity: 1}} className="flex-1 flex flex-col items-center justify-center bg-[#D5F0C0] p-6 text-center relative overflow-hidden">
      <div className="absolute top-6 right-6 z-20">
        <button 
          onClick={(e) => { e.stopPropagation(); triggerSpeech(); }} 
          className="bg-white/90 hover:bg-white text-[#1D3222] p-3 rounded-full shadow-md flex items-center justify-center border border-[#8BC34A] active:scale-90 transition-transform cursor-pointer"
          title="Listen to Lumo's sweet greeting"
        >
          <span className="text-xl">{isSpeaking ? "🔊" : "🔈"}</span>
        </button>
      </div>

      <div className="relative group cursor-pointer" onClick={(e) => { e.stopPropagation(); triggerSpeech(); }}>
        <Mascot size={180} isSpeaking={isSpeaking} />
      </div>

      <h1 className="text-4xl font-extrabold mt-6 text-[#1D3222]">Lumo</h1>
      <p className="mt-2 text-[#4A6546] text-base font-semibold">
        Mental health & career growth
      </p>

      <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="mt-12 bg-[#1A3022] text-[#D5F0C0] px-10 py-4 rounded-full font-extrabold shadow-xl text-lg active:scale-95 transition-transform border-2 border-[#8BC34A]/50 cursor-pointer">
        Start Journey ➔
      </button>
    </motion.div>
  );
}

export function QuestionnaireScreen({ onNext }: { onNext: () => void }) {
  const [feelingValue, setFeelingValue] = useState<number>(4); // Default = 4 (Neutral)
  const [showMotivation, setShowMotivation] = useState<boolean>(false);
  const [motivationQuote, setMotivationQuote] = useState<string>("");

  const MOODS = [
    { val: 6, label: "Happy", emoji: "😄", color: "text-[#1B5E20]", activeBg: "bg-[#E8F5E9]", activeBorder: "border-[#81C784]" },
    { val: 5, label: "Calm", emoji: "🧘", color: "text-[#00796B]", activeBg: "bg-[#E0F2F1]", activeBorder: "border-[#4DB6AC]" },
    { val: 4, label: "Neutral", emoji: "😐", color: "text-[#0277BD]", activeBg: "bg-[#E0F2FE]", activeBorder: "border-[#4FC3F7]" },
    { val: 3, label: "Anxious", emoji: "😰", color: "text-[#6A1B9A]", activeBg: "bg-[#F3E5F5]", activeBorder: "border-[#BA68C8]" },
    { val: 2, label: "Sad", emoji: "😢", color: "text-[#E65100]", activeBg: "bg-[#FFF3E0]", activeBorder: "border-[#FFB74D]" },
    { val: 1, label: "Angry", emoji: "😡", color: "text-[#C62828]", activeBg: "bg-[#FFEBEE]", activeBorder: "border-[#E57373]" },
  ];

  const MOTIVATION_QUOTES = [
    "Cheer up! It's just a bad day, not a bad life! 🌿 Lumo is right here with you every step of the way. Take a deep breath — you're doing great! ✨",
    "Rainy days help the flowers grow! 🌧️🌸 Take a gentle breath, be kind to yourself, and remember tomorrow is a fresh start! 💕",
    "Even the sun needs to hide behind clouds sometimes. ☀️ Give yourself permission to rest. You are so special and strong! 🌟",
    "Tough times never last, but tough people do! 💪 Lumo is sending you a huge warm hug right now. Everything will be okay! 💖",
    "Don't forget how far you've come! 🌈 Every small step counts. Be proud of yourself today! 🌿",
    "Storms make trees grow deeper roots! 🌳 Be gentle with your heart today — you are doing so much better than you realize! ✨",
    "One bad moment doesn't define your story! 📖 Take it one easy breath at a time, Lumo is right here with you! 🧸"
  ];

  const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * MOTIVATION_QUOTES.length);
    return MOTIVATION_QUOTES[randomIndex];
  };

  const handleFeelingChange = (val: number) => {
    setFeelingValue(val);
    if (val <= 3) {
      setMotivationQuote(getRandomQuote());
      setShowMotivation(true);
    }
  };

  const currentMood = MOODS.find(m => m.val === feelingValue) || MOODS[2];

  return (
    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} className="flex-1 flex flex-col items-center justify-center bg-white p-6 text-center relative">
      {/* Mascot Element */}
      <div className="mb-3 relative">
        <Mascot size={120} />
      </div>

      <h2 className="text-2xl font-extrabold text-[#1D3222] mb-1">How are you feeling today?</h2>
      <p className="text-xs text-[#4A6546] font-semibold mb-5">Scroll or tap the feeling index below to tell Lumo!</p>

      {/* Feeling Index Container */}
      <div className="w-full max-w-sm bg-[#F4F9EE] border-2 border-[#D5F0C0] p-4 sm:p-5 rounded-3xl shadow-xs mb-5 flex flex-col items-center gap-3.5">
        {/* Dynamic Mood Badge */}
        <div className={`px-4 py-1.5 rounded-full font-extrabold text-sm bg-white shadow-2xs border ${currentMood.activeBorder} ${currentMood.color} transition-all duration-300 flex items-center gap-1.5`}>
          <span>{currentMood.emoji}</span>
          <span>{currentMood.label}</span>
        </div>

        {/* Interactive Feeling Index Range Slider */}
        <div className="w-full px-2">
          <input
            type="range"
            min="1"
            max="6"
            step="1"
            value={feelingValue}
            onChange={(e) => handleFeelingChange(Number(e.target.value))}
            className="w-full h-3 bg-gradient-to-r from-[#FFCDD2] via-[#E0F2FE] to-[#C8E6C9] rounded-lg appearance-none cursor-pointer accent-[#58CC02]"
          />
        </div>

        {/* 6 Quick Feeling Buttons (3x2 Grid) */}
        <div className="grid grid-cols-3 gap-2 w-full mt-1">
          {MOODS.map((mood) => {
            const isActive = feelingValue === mood.val;
            return (
              <button
                key={mood.label}
                onClick={() => handleFeelingChange(mood.val)}
                className={`py-2 px-1 rounded-xl font-bold text-xs border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  isActive
                    ? `${mood.activeBg} ${mood.activeBorder} ${mood.color} shadow-2xs scale-102 ring-2 ring-offset-1 ring-[#8BC34A]/30`
                    : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="text-sm">{mood.emoji}</span>
                <span className="text-[11px] font-extrabold">{mood.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <button onClick={onNext} className="w-full max-w-sm bg-[#1A3022] text-[#D5F0C0] py-3.5 rounded-2xl font-extrabold text-base shadow-md active:scale-95 transition-transform cursor-pointer">
        Continue ➔
      </button>

      {/* Motivational Popup Modal when Sad */}
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
      </AnimatePresence>
    </motion.div>
  );
}

export function LoginScreen({ onNext }: { onNext: () => void }) {
  const [isRegister, setIsRegister] = useState(false);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please fill in required fields.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
    const body = isRegister 
      ? { email, password, fullName: fullName || email.split("@")[0], username: username || fullName?.toLowerCase().replace(/\s+/g, '') }
      : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Authentication failed. Please try again.");
      }

      if (data.token) {
        localStorage.setItem("lumo_token", data.token);
      }
      if (data.user) {
        if (data.user.fullName) localStorage.setItem("lumo_user_name", data.user.fullName);
        if (data.user.username) localStorage.setItem("lumo_username", data.user.username);
      }

      onNext();
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{opacity: 0, y: 50}} animate={{opacity: 1, y: 0}} className="flex-1 flex flex-col bg-white overflow-y-auto relative scrollbar-hide">
      <div className="h-[38%] bg-[#D5F0C0] rounded-b-[50px] flex flex-col items-center justify-center relative p-4 flex-shrink-0">
         <div className="absolute top-6 left-6 w-16 h-16 bg-[#2C3E28] rounded-full opacity-10"></div>
         <div className="absolute bottom-6 right-6 w-20 h-20 bg-white rounded-full opacity-40"></div>
         <Mascot size={130} className="z-10 drop-shadow-md" />
      </div>

      <div className="flex-1 p-6 flex flex-col justify-center">
        <h2 className="text-2xl font-extrabold text-[#2C3E28] mb-1">
          {isRegister ? "Create Account" : "Ready for focus?"}
        </h2>
        <p className="text-[#4A6546] text-xs font-semibold mb-5">
          {isRegister ? "Join Lumo to start your 30-day reflection quest!" : "Sign in to sync your 24h progress."}
        </p>

        {errorMsg && (
          <div className="bg-[#FFEBEE] border border-[#FFCDD2] text-[#C62828] text-xs font-bold p-3 rounded-2xl mb-4 text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {isRegister && (
            <>
              <input 
                type="text" 
                placeholder="Full Name" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="bg-gray-100 p-3.5 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D5F0C0] transition-all font-medium text-[#2C3E28]" 
              />
              <input 
                type="text" 
                placeholder="Username (e.g. snehagiri)" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-gray-100 p-3.5 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D5F0C0] transition-all font-medium text-[#2C3E28]" 
              />
            </>
          )}

          <input 
            type={isRegister ? "email" : "text"} 
            placeholder={isRegister ? "Email Address" : "Email or Username"} 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-gray-100 p-3.5 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D5F0C0] transition-all font-medium text-[#2C3E28]" 
          />

          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-gray-100 p-3.5 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D5F0C0] transition-all font-medium text-[#2C3E28]" 
          />

          <button 
            type="submit" 
            disabled={loading}
            className="bg-[#2C3E28] text-[#D5F0C0] py-3.5 rounded-2xl font-black text-base shadow-md active:scale-95 transition-transform mt-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? "Connecting..." : isRegister ? "Sign Up ➔" : "Sign In ➔"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500 mt-5">
          {isRegister ? "Already have an account? " : "Don't have an account? "}
          <span 
            onClick={() => { setIsRegister(!isRegister); setErrorMsg(null); }} 
            className="font-extrabold text-[#2C3E28] cursor-pointer underline"
          >
            {isRegister ? "Sign In" : "Sign Up"}
          </span>
        </p>

        <div className="mt-4 text-center">
          <button 
            type="button"
            onClick={onNext}
            className="text-[11px] font-extrabold text-[#527847] hover:underline"
          >
            Continue as Guest ➔
          </button>
        </div>
      </div>
    </motion.div>
  );
}
