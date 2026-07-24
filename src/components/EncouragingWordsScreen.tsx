import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Sparkles, Heart, RefreshCw, Copy, Check, ShieldCheck, Sun, Feather, Smile, Lightbulb } from 'lucide-react';
import { EncouragingWordsData } from '../types';

interface EncouragingWordsScreenProps {
  journals: Record<number, string>;
  userName?: string;
  onBack: () => void;
  onNavigateToJournal?: () => void;
}

const CATEGORIES = [
  { id: 'general', label: 'General Boost', mood: 'Calm & Seeking Inspiration' },
  { id: 'self_care', label: 'Self-Care & Love', mood: 'Gentle Comfort & Rest' },
  { id: 'courage', label: 'Strength & Courage', mood: 'Overcoming Anxiety & Fear' },
  { id: 'mindfulness', label: 'Peace of Mind', mood: 'Stillness & Quiet Thoughts' },
  { id: 'motivation', label: 'Daily Motivation', mood: 'Focus & Positive Steps' },
];

export function EncouragingWordsScreen({
  journals,
  userName,
  onBack,
  onNavigateToJournal,
}: EncouragingWordsScreenProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<EncouragingWordsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const [copied, setCopied] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('lumo_favorite_affirmations');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const activeName = userName || localStorage.getItem("lumo_user_name") || "Explorer";

  const fetchEncouragingWords = async (categoryMood?: string) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("lumo_token");
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch('/api/encouraging-words', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          journals,
          mood: categoryMood || selectedCategory.mood,
          userName: activeName
        }),
      });

      const resData = await response.json();

      if (resData.success && resData.data) {
        setData(resData.data);
      } else {
        // Fallback default response if backend API key or network fails
        setData({
          greeting: `Dear ${activeName}, take a deep breath. You are doing so much better than you realize.`,
          mainAffirmation: "I am safe, capable, and taking gentle steps forward every single day.",
          encouragingMessages: [
            "Your continuous willingness to reflect shows remarkable strength and self-awareness.",
            "Remember that healing isn't linear. Every small moment of peace is a milestone.",
            "You don't need to carry tomorrow's burdens today. Be present in this quiet moment."
          ],
          dailyStrengths: [
            "Deep Emotional Awareness",
            "Resilience under Stress",
            "Courage to Face Thoughts",
            "Kindness Towards Yourself"
          ],
          upliftingQuote: "You are allowed to take up space, move at your own speed, and rest whenever you need to.",
          gentleTips: [
            "Unclench your jaw and drop your shoulders right now.",
            "Acknowledge one thing you did well today, no matter how small.",
            "Treat yourself with the same warmth you offer to a close friend."
          ]
        });
      }
    } catch (err: any) {
      console.error(err);
      // Soft fallback for offline/preview
      setData({
        greeting: `Dear ${activeName}, take a deep breath. You are doing so much better than you realize.`,
        mainAffirmation: "I am safe, capable, and taking gentle steps forward every single day.",
        encouragingMessages: [
          "Your continuous willingness to reflect shows remarkable strength and self-awareness.",
          "Remember that healing isn't linear. Every small moment of peace is a milestone.",
          "You don't need to carry tomorrow's burdens today. Be present in this quiet moment."
        ],
        dailyStrengths: [
          "Deep Emotional Awareness",
          "Resilience under Stress",
          "Courage to Face Thoughts",
          "Kindness Towards Yourself"
        ],
        upliftingQuote: "You are allowed to take up space, move at your own speed, and rest whenever you need to.",
        gentleTips: [
          "Unclench your jaw and drop your shoulders right now.",
          "Acknowledge one thing you did well today, no matter how small.",
          "Treat yourself with the same warmth you offer to a close friend."
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEncouragingWords();
  }, []);

  const handleSelectCategory = (cat: typeof CATEGORIES[0]) => {
    setSelectedCategory(cat);
    fetchEncouragingWords(cat.mood);
  };

  const handleCopyAffirmation = () => {
    if (!data?.mainAffirmation) return;
    navigator.clipboard.writeText(data.mainAffirmation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleFavorite = (text: string) => {
    let updated: string[];
    if (favorites.includes(text)) {
      updated = favorites.filter(f => f !== text);
    } else {
      updated = [...favorites, text];
    }
    setFavorites(updated);
    localStorage.setItem('lumo_favorite_affirmations', JSON.stringify(updated));
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F6FBF4] text-[#1E2E21] relative overflow-hidden font-sans select-none">
      {/* Top Header */}
      <div className="bg-[#EAF7E3] text-[#1D3222] p-4 pt-6 pb-3 flex items-center justify-between border-b border-[#C8E8B6] z-30 shadow-2xs">
        <button
          onClick={onBack}
          className="w-9 h-9 bg-white hover:bg-[#F2F8EE] rounded-2xl flex items-center justify-center text-[#1D3222] active:scale-95 transition-all cursor-pointer border border-[#C8E8B6]"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="text-center">
          <div className="flex items-center justify-center gap-1.5">
            <Sparkles size={16} className="text-[#58CC02] animate-pulse" />
            <h1 className="text-sm font-black text-[#1D3222] tracking-wide font-outfit uppercase">
              Encouraging Words
            </h1>
          </div>
          <p className="text-[11px] text-[#4A634E] font-extrabold">Daily Uplifting Support & Affirmations</p>
        </div>

        <button
          onClick={() => fetchEncouragingWords()}
          disabled={loading}
          className="w-9 h-9 bg-white hover:bg-[#F2F8EE] rounded-2xl flex items-center justify-center text-[#1D3222] active:scale-95 transition-all cursor-pointer border border-[#C8E8B6]"
          title="Refresh Encouragement"
        >
          <RefreshCw size={17} className={loading ? 'animate-spin text-[#58CC02]' : ''} />
        </button>
      </div>

      {/* Main Content Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 pb-12 space-y-4 scrollbar-hide">
        
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory.id === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleSelectCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#58CC02] text-white shadow-2xs scale-102'
                    : 'bg-white border border-[#E1F0D7] text-[#3A523E] hover:bg-[#F2F8EE]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="bg-white p-8 rounded-2xl shadow-xs border border-[#E1F0D7] text-center space-y-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.4, ease: "linear" }}
              className="w-10 h-10 border-3 border-[#58CC02] border-t-transparent rounded-full mx-auto"
            />
            <p className="text-xs font-bold text-[#1D3222]">Gathering warm, encouraging thoughts for you...</p>
          </div>
        )}

        {/* Main Content when loaded */}
        {!loading && data && (
          <div className="space-y-4 animate-fade-in">
            
            {/* Main Highlight Affirmation Card */}
            <div className="bg-gradient-to-br from-[#EAF7E3] via-white to-[#F2F8EE] p-5 rounded-3xl border-2 border-[#B3E099] shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#58CC02] bg-white border border-[#B3E099] px-2.5 py-0.5 rounded-full">
                  Today's Core Affirmation
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleCopyAffirmation}
                    className="p-1.5 rounded-full bg-white border border-[#E1F0D7] text-[#1D3222] hover:bg-[#F2F8EE] transition-colors cursor-pointer"
                    title="Copy Affirmation"
                  >
                    {copied ? <Check size={14} className="text-[#58CC02]" /> : <Copy size={14} />}
                  </button>
                  <button
                    onClick={() => toggleFavorite(data.mainAffirmation)}
                    className="p-1.5 rounded-full bg-white border border-[#E1F0D7] text-[#1D3222] hover:bg-[#F2F8EE] transition-colors cursor-pointer"
                    title="Favorite Affirmation"
                  >
                    <Heart size={14} className={favorites.includes(data.mainAffirmation) ? "fill-[#F09B9B] text-[#F09B9B]" : ""} />
                  </button>
                </div>
              </div>

              <h2 className="text-base sm:text-lg font-black text-[#1D3222] leading-snug my-2">
                "{data.mainAffirmation}"
              </h2>

              <p className="text-xs text-[#4A634E] font-medium leading-relaxed italic mt-2 border-t border-[#E1F0D7] pt-2">
                {data.greeting}
              </p>
            </div>

            {/* Encouraging Messages Grid */}
            <div className="bg-white p-4 rounded-2xl border border-[#E1F0D7] shadow-xs space-y-3">
              <div className="flex items-center gap-2 border-b border-[#F2F8EE] pb-2">
                <Sun size={16} className="text-[#58CC02]" />
                <h3 className="text-xs font-black text-[#1D3222] uppercase tracking-wider">
                  Words of Encouragement
                </h3>
              </div>

              <div className="space-y-2">
                {data.encouragingMessages.map((msg, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-[#F8FCF6] border border-[#E1F0D7] text-xs font-semibold text-[#1D3222] leading-relaxed flex items-start gap-2">
                    <span className="text-[#58CC02] font-black text-sm leading-none">✨</span>
                    <p className="flex-1">{msg}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recognized Strengths */}
            <div className="bg-white p-4 rounded-2xl border border-[#E1F0D7] shadow-xs space-y-3">
              <div className="flex items-center gap-2 border-b border-[#F2F8EE] pb-2">
                <ShieldCheck size={16} className="text-[#58CC02]" />
                <h3 className="text-xs font-black text-[#1D3222] uppercase tracking-wider">
                  Your Inner Strengths
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {data.dailyStrengths.map((strength, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-[#EAF7E3] border border-[#B3E099] text-[11px] font-black text-[#1D3222] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#58CC02]" />
                    <span>{strength}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mascot Quote Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#EAF7E3] to-[#F2F8EE] text-[#1D3222] border-2 border-[#B3E099] shadow-2xs flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#58CC02] text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Sparkles size={20} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-black italic leading-relaxed text-[#1D3222]">
                  "{data.upliftingQuote}"
                </p>
                <span className="text-[10px] font-extrabold text-[#4A634E] block mt-1">— Lumo Gentle Reminder</span>
              </div>
            </div>

            {/* Gentle Self-Care Tips */}
            <div className="bg-white p-4 rounded-2xl border border-[#E1F0D7] shadow-xs space-y-2.5">
              <div className="flex items-center gap-2 border-b border-[#F2F8EE] pb-2">
                <Lightbulb size={16} className="text-[#58CC02]" />
                <h3 className="text-xs font-black text-[#1D3222] uppercase tracking-wider">
                  Gentle Self-Care Reminders
                </h3>
              </div>

              <div className="space-y-1.5">
                {data.gentleTips.map((tip, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-[#3A523E]">
                    <span className="w-5 h-5 rounded-full bg-[#F2F8EE] text-[#1D3222] font-black text-[10px] flex items-center justify-center border border-[#E1F0D7]">
                      {idx + 1}
                    </span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Generate Button Footer */}
        <div className="pt-2">
          <button
            onClick={() => fetchEncouragingWords()}
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-[#58CC02] hover:bg-[#4ea602] text-white font-black text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-transform"
          >
            <Sparkles size={16} />
            <span>Receive New Encouraging Words</span>
          </button>
        </div>

      </div>
    </div>
  );
}
