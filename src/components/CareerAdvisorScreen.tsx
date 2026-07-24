import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Sparkles, Briefcase, Compass, CheckCircle, Target, RefreshCw, BookOpen, ChevronRight } from 'lucide-react';
import { CareerAdviceData } from '../types';

interface CareerAdvisorScreenProps {
  journals: Record<number, string>;
  events?: string[];
  userName?: string;
  onBack: () => void;
  onNavigateToJournal: () => void;
}

export function CareerAdvisorScreen({
  journals,
  events = [],
  userName = "Aria",
  onBack,
  onNavigateToJournal,
}: CareerAdvisorScreenProps) {
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<CareerAdviceData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const totalJournalCount = Object.keys(journals).length;

  const fetchCareerAdvice = async (customJournals?: Record<number, string>) => {
    setLoading(true);
    setError(null);

    const activeJournals = customJournals || journals;

    try {
      const response = await fetch('/api/career-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          journals: activeJournals,
          events: events,
          userName: userName
        }),
      });

      const resData = await response.json();

      if (resData.success && resData.data) {
        setAdvice(resData.data);
      } else {
        setError(resData.error || 'Failed to generate career advice.');
      }
    } catch (err: any) {
      console.error(err);
      setError('Unable to connect to AI Server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCareerAdvice();
  }, []);

  const handleUseSampleJournals = () => {
    const samples: Record<number, string> = {
      1: "I felt really energized today while helping my teammate design a clear visual mockup. I love organizing thoughts into beautiful, intuitive systems.",
      2: "I had a stressful moment, but I reframed my anxiety into excitement about problem-solving. I enjoy deep analytical thinking and empathy.",
      3: "Explored a new passion project today combining psychological well-being and tech tools. I feel deeply motivated when my work improves people's lives.",
      10: "Led a cross-functional workshop today. I noticed I excel at translating complex technical requirements into user-friendly stories.",
      20: "Reflected on long-term growth. I want to build human-centered AI products that blend ethical design, high performance, and continuous learning.",
      30: "Completed 30 days of mindful career journaling! I feel super confident in my direction towards Product Strategy and User Experience Leadership."
    };
    fetchCareerAdvice(samples);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F4F9EE] relative overflow-hidden">
      {/* Top Header */}
      <div className="bg-[#2C3E28] text-white p-5 pt-9 pb-4 flex items-center justify-between shadow-md z-30 border-b-4 border-[#8BC34A]">
        <button
          onClick={onBack}
          className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center text-white active:scale-95 transition-transform"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
          <Sparkles size={20} className="text-[#8BC34A] animate-pulse" />
          <h1 className="text-xl font-extrabold tracking-wide">AI Career Advisor</h1>
        </div>
        <button
          onClick={() => fetchCareerAdvice()}
          disabled={loading}
          className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center text-[#8BC34A] active:scale-95 transition-transform"
          title="Refresh Analysis"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-5 pb-12 space-y-5 scrollbar-hide">
        {/* Career Detective Header Banner */}
        <div className="bg-white p-4 rounded-3xl shadow-sm border-2 border-[#D5F0C0]">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-black text-[#4c8435] uppercase tracking-wider">AI Detective</span>
            </div>
            <p className="text-xs text-[#2C3E28] font-semibold leading-relaxed">
              {advice?.encouragingQuote || "I've scanned your journal entries & events to detect your unique career superpowers!"}
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#D5F0C0] text-center space-y-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="w-14 h-14 border-4 border-[#8BC34A] border-t-transparent rounded-full mx-auto"
            />
            <h3 className="text-lg font-bold text-[#2C3E28]">Analyzing Your Mind & Reflections...</h3>
            <p className="text-xs text-[#6b8e5c] max-w-xs mx-auto">
              Gemini is reviewing your journal entries, cognitive reframes, and daily events to craft your personalized career roadmap.
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 p-5 rounded-3xl border border-red-200 text-center space-y-3">
            <p className="text-sm font-bold text-red-700">{error}</p>
            <button
              onClick={() => fetchCareerAdvice()}
              className="bg-red-600 text-white px-5 py-2 rounded-2xl text-xs font-bold active:scale-95 transition-transform"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Journal Count Alert / Sample Load */}
        {!loading && totalJournalCount === 0 && (
          <div className="bg-gradient-to-br from-[#eaf7d9] to-[#d8f0be] p-5 rounded-3xl border-2 border-[#8BC34A] shadow-sm text-center space-y-3">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto text-2xl shadow-sm">
              📖
            </div>
            <h3 className="text-base font-extrabold text-[#2C3E28]">Write More Daily Journals!</h3>
            <p className="text-xs text-[#4A6546] font-medium leading-relaxed">
              You haven't written any daily journals yet! Write your thoughts in Level journals so Gemini AI can give you deeper personal insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                onClick={onNavigateToJournal}
                className="flex-1 bg-[#2C3E28] text-[#D5F0C0] py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
              >
                <BookOpen size={15} />
                <span>Write Journal Now</span>
              </button>
              <button
                onClick={handleUseSampleJournals}
                className="flex-1 bg-white text-[#2C3E28] border border-[#8BC34A] py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-transform"
              >
                <Sparkles size={15} className="text-[#8BC34A]" />
                <span>Try Sample Reflections</span>
              </button>
            </div>
          </div>
        )}

        {/* AI Career Advice Output */}
        {!loading && advice && (
          <div className="space-y-5">
            {/* Executive Synthesis Summary */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-[#D5F0C0] space-y-2">
              <div className="flex items-center gap-2">
                <Compass className="text-[#4c8435]" size={18} />
                <h2 className="text-sm font-extrabold text-[#2C3E28] uppercase tracking-wider">
                  Your AI Personal Synthesis
                </h2>
              </div>
              <p className="text-xs text-[#3a5435] leading-relaxed font-medium bg-[#F7FCF2] p-3.5 rounded-2xl border border-[#e2f3d3]">
                "{advice.summary}"
              </p>
            </div>

            {/* Strengths Badges */}
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-[#D5F0C0] space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="text-[#d66b2a]" size={18} />
                <h2 className="text-sm font-extrabold text-[#2C3E28] uppercase tracking-wider">
                  Detected Career Superpowers
                </h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {advice.detectedStrengths.map((strength, i) => (
                  <span
                    key={i}
                    className="bg-[#E8F5D3] text-[#2C3E28] px-3 py-1.5 rounded-full text-xs font-black border border-[#b8e8a0] flex items-center gap-1.5 shadow-2xs"
                  >
                    <span>✨</span>
                    <span>{strength}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Recommended Career Paths */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <Briefcase className="text-[#2C3E28]" size={18} />
                  <h2 className="text-sm font-extrabold text-[#2C3E28] uppercase tracking-wider">
                    Recommended Career Paths
                  </h2>
                </div>
                <span className="text-[11px] font-bold text-[#6b8e5c]">Top Matches</span>
              </div>

              {advice.recommendedPaths.map((pathItem, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white p-5 rounded-3xl shadow-sm border-2 border-[#D5F0C0] space-y-3 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-black text-[#6b8e5c] uppercase tracking-widest">
                        Option 0{idx + 1}
                      </span>
                      <h3 className="text-lg font-black text-[#2C3E28]">{pathItem.title}</h3>
                    </div>
                    <div className="bg-[#2C3E28] text-[#D5F0C0] px-3 py-1 rounded-full text-xs font-black shadow-xs flex items-center gap-1">
                      <span>🎯</span>
                      <span>{pathItem.matchPercentage}% Match</span>
                    </div>
                  </div>

                  <p className="text-xs text-[#4A6546] font-medium leading-relaxed bg-[#F7FCF2] p-3 rounded-2xl border border-[#e2f3d3]">
                    <strong className="text-[#2C3E28]">Why it fits you: </strong>
                    {pathItem.whyItFits}
                  </p>

                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-[#6b8e5c]">Skills to leverage:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {pathItem.keySkillsToLeverage.map((skill, sIdx) => (
                        <span key={sIdx} className="bg-gray-100 text-gray-800 text-[10px] font-bold px-2.5 py-0.5 rounded-lg">
                          #{skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center gap-2 text-xs font-extrabold text-[#4c8435]">
                    <ChevronRight size={16} />
                    <span>Next step: {pathItem.firstStep}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Actionable Next Steps */}
            <div className="bg-gradient-to-br from-[#2C3E28] to-[#3a5435] text-white p-5 rounded-3xl shadow-md space-y-3">
              <div className="flex items-center gap-2">
                <Target className="text-[#8BC34A]" size={18} />
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#D5F0C0]">
                  Actionable Steps For Today
                </h2>
              </div>
              <div className="space-y-2">
                {advice.actionableNextSteps.map((stepText, stIdx) => (
                  <div key={stIdx} className="flex items-start gap-2.5 text-xs font-medium text-[#e8f5d3]">
                    <CheckCircle size={16} className="text-[#8BC34A] shrink-0 mt-0.5" />
                    <span>{stepText}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
