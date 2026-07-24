import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, VolumeX, Sparkles, Heart } from 'lucide-react';

export function Mascot({ 
  className = "", 
  size = 120, 
  isSpeaking = false,
  bubbleText,
  emotion = "happy",
  walkHorizontal = true,
  onTap
}: { 
  className?: string; 
  size?: number; 
  isSpeaking?: boolean; 
  bubbleText?: string;
  emotion?: "happy" | "excited" | "proud" | "thinking" | "concerning";
  walkHorizontal?: boolean;
  onTap?: () => void;
}) {
  const [blink, setBlink] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [showHearts, setShowHearts] = useState(false);

  // Periodic automatic blinking (both eyes synchronized together)
  useEffect(() => {
    const interval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 220);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsJumping(true);
    setShowHearts(true);
    setTimeout(() => setIsJumping(false), 700);
    setTimeout(() => setShowHearts(false), 1200);
    if (onTap) onTap();
  };

  return (
    <div className={`relative inline-flex flex-col items-center select-none cursor-pointer ${className}`} onClick={handleClick}>
      {/* Heart & Sparkle Particle Burst on Tap */}
      <AnimatePresence>
        {showHearts && (
          <>
            <motion.div
              initial={{ opacity: 1, scale: 0.5, y: 0, x: -15 }}
              animate={{ opacity: 0, scale: 1.4, y: -40, x: -30 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute -top-6 left-2 text-pink-500 z-40 pointer-events-none"
            >
              <Heart size={20} fill="#EC4899" />
            </motion.div>
            <motion.div
              initial={{ opacity: 1, scale: 0.5, y: 0, x: 15 }}
              animate={{ opacity: 0, scale: 1.5, y: -45, x: 30 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute -top-6 right-2 text-yellow-400 z-40 pointer-events-none"
            >
              <Sparkles size={22} fill="#FBBF24" />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Duolingo-style Speech Bubble */}
      <AnimatePresence>
        {bubbleText && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 5 }}
            className="absolute -top-16 z-30 bg-white border-2 border-[#78C800] rounded-2xl px-3.5 py-2 shadow-xl flex items-center gap-2 max-w-[210px] whitespace-normal pointer-events-auto"
            onClick={handleClick}
          >
            <div className="flex-1 text-xs font-black text-[#2B4C00] leading-tight">
              {bubbleText}
            </div>
            {isSpeaking ? (
              <motion.div 
                animate={{ scale: [1, 1.3, 1] }} 
                transition={{ repeat: Infinity, duration: 0.4 }} 
                className="text-[#78C800] flex-shrink-0"
              >
                <Volume2 size={16} />
              </motion.div>
            ) : (
              <div className="text-gray-400 flex-shrink-0">
                <VolumeX size={14} />
              </div>
            )}
            {/* Bubble Tail pointing down */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[8px] border-t-white drop-shadow-sm" />
            <div className="absolute -bottom-[10px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[9px] border-t-[#78C800] -z-10" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Duolingo Mascot Container - Calm, Gentle Side-to-Side Sway */}
      <motion.div
        animate={
          isJumping
            ? { 
                y: [0, -26, 0], 
                scaleY: [1, 0.88, 1.12, 1], 
                scaleX: [1, 1.08, 0.94, 1],
                rotate: [0, -6, 6, 0]
              }
            : isSpeaking
            ? { 
                y: [0, -4, 0], 
                rotate: [-2, 2, -2], 
                scale: [1, 1.02, 1]
              }
            : { 
                x: [-5, 5, -5],
                rotate: [-3, 3, -3],
                y: [0, -2, 0]
              }
        }
        transition={
          isJumping
            ? { duration: 0.6, ease: "easeOut" }
            : isSpeaking
            ? { repeat: Infinity, duration: 1.2, ease: "easeInOut" }
            : { repeat: Infinity, duration: 3.8, ease: "easeInOut" }
        }
        className="relative"
      >
        <svg 
          width={size} 
          height={size} 
          viewBox="0 0 100 100" 
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-xl overflow-visible"
        >
          {/* Ground Shadow */}
          <ellipse cx="50" cy="94" rx="28" ry="5" fill="rgba(0,0,0,0.15)" />

          <g stroke="#1F3A00" strokeWidth="2.8" strokeLinejoin="round" strokeLinecap="round">
            {/* Hands / Wings - Drawn BEHIND body (tucked at the back) */}
            <path 
              d="M 22,58 C 12,62 10,72 18,78 C 24,76 28,70 30,62 Z" 
              fill="#78C800" 
            />
            <path 
              d="M 78,58 C 88,62 90,72 82,78 C 76,76 72,70 70,62 Z" 
              fill="#78C800" 
            />

            {/* Feet - Planted steadily */}
            <path 
              d="M 36,84 C 32,96 42,98 47,89" 
              fill="#589B00" 
            />
            <path 
              d="M 64,84 C 68,96 58,98 53,89" 
              fill="#589B00" 
            />

            {/* Main Body - Duolingo Bright Green Owl Body */}
            <path d="M 50,20 C 88,20 94,62 78,85 C 68,95 32,95 22,85 C 6,62 12,20 50,20 Z" fill="#78C800" />
          </g>
          
          {/* Creamy Belly Patch */}
          <path d="M 34,85 C 38,68 62,68 66,85 C 60,92 40,92 34,85 Z" fill="#FFFDEB" />
          
          {/* Leaf Crown / Feathers on Head */}
          <g stroke="#1F3A00" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round">
            <motion.path 
              d="M 50,20 C 44,6 28,4 23,15 C 34,23 44,23 50,20 Z" 
              fill="#437700" 
              animate={{ rotate: [-3, 5, -3] }}
              style={{ originX: "50px", originY: "20px" }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
            <motion.path 
              d="M 50,20 C 56,4 68,0 75,7 C 68,18 57,21 50,20 Z" 
              fill="#589B00" 
              animate={{ rotate: [3, -5, 3] }}
              style={{ originX: "50px", originY: "20px" }}
              transition={{ repeat: Infinity, duration: 2.2 }}
            />
            <path d="M 50,20 C 50,6 60,1 55,11 C 52,18 52,20 50,20 Z" fill="#8EE000" />
          </g>

          {/* Eyes - Large, expressive Duolingo owl eyes - Solid position with subtle gaze */}
          <g>
            {/* Left Eye Base */}
            <circle cx="34" cy="50" r="9" fill="#1F3A00"/>
            {/* Right Eye Base */}
            <circle cx="66" cy="50" r="9" fill="#1F3A00"/>

            {!blink ? (
              /* Both pupils gliding gently and slowly together inside the eyes */
              <motion.g
                animate={{ x: [-1.2, 1.2, -1.2] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              >
                {/* Left Eye Pupils */}
                <circle cx="36" cy={47} r="3.2" fill="#FFFFFF"/>
                <circle cx="32" cy={52} r="1.6" fill="#FFFFFF"/>

                {/* Right Eye Pupils */}
                <circle cx="64" cy={47} r="3.2" fill="#FFFFFF"/>
                <circle cx="68" cy={52} r="1.6" fill="#FFFFFF"/>
              </motion.g>
            ) : (
              /* Synchronized clean blink lines on both eyes */
              <g stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round">
                <line x1="27" y1="50" x2="41" y2="50" />
                <line x1="59" y1="50" x2="73" y2="50" />
              </g>
            )}
          </g>
          
          {/* Cheeks */}
          <ellipse cx="22" cy="58" rx="6" ry="4" fill="#FF5252" opacity="0.8" />
          <ellipse cx="78" cy="58" rx="6" ry="4" fill="#FF5252" opacity="0.8" />
          
          {/* Talking Mouth / Orange Beak (Moves Slowly) */}
          {isSpeaking ? (
            <motion.path 
              d="M 42,58 Q 50,72 58,58 Z" 
              fill="#FF8F00" 
              stroke="#1F3A00"
              strokeWidth="2"
              animate={{ d: [
                "M 43,58 Q 50,62 57,58 Z",
                "M 41,57 Q 50,72 59,57 Z",
                "M 43,58 Q 50,62 57,58 Z"
              ] }}
              transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }}
            />
          ) : (
            <motion.path 
              d="M 43,58 Q 50,66 57,58 Z" 
              fill="#FF8F00" 
              stroke="#1F3A00" 
              strokeWidth="2.2" 
              strokeLinecap="round" 
              animate={{ d: [
                "M 43,58 Q 50,63 57,58 Z",
                "M 43,58 Q 50,67 57,58 Z",
                "M 43,58 Q 50,63 57,58 Z"
              ] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
            />
          )}
        </svg>
      </motion.div>
    </div>
  );
}

export function Tree({ progress }: { progress: number }) {
  // 30 predefined spots securely nestled inside the lush expanded foliage canopy
  const spots = [
    {x: 50, y: 20}, {x: 36, y: 24}, {x: 64, y: 24}, {x: 50, y: 32}, {x: 28, y: 32},
    {x: 72, y: 32}, {x: 40, y: 38}, {x: 60, y: 38}, {x: 22, y: 42}, {x: 78, y: 42},
    {x: 32, y: 48}, {x: 68, y: 48}, {x: 50, y: 46}, {x: 42, y: 26}, {x: 58, y: 26},
    {x: 44, y: 16}, {x: 56, y: 16}, {x: 30, y: 22}, {x: 70, y: 22}, {x: 50, y: 12},
    {x: 36, y: 40}, {x: 64, y: 40}, {x: 52, y: 24}, {x: 42, y: 52}, {x: 58, y: 52},
    {x: 20, y: 36}, {x: 80, y: 36}, {x: 30, y: 16}, {x: 70, y: 16}, {x: 50, y: 56}
  ];

  // Each completed level / progress step adds +1 apple to the tree (1 starting apple at step 0)
  const visibleApplesCount = Math.min(Math.max(1, progress), 30);

  return (
    <div className="relative w-full h-full flex items-center justify-center p-0">
      <motion.svg 
        viewBox="-12 -12 124 112" 
        className="w-full h-full drop-shadow-xl overflow-visible" 
        preserveAspectRatio="xMidYMid meet" 
        xmlns="http://www.w3.org/2000/svg"
        animate={{ rotate: [-0.5, 0.5, -0.5] }}
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
      >
        {/* Soft Hill Base */}
        <ellipse cx="50" cy="95" rx="48" ry="7" fill="#4B8B1E" opacity="0.4" />

        {/* Sturdy Thick Tree Trunk */}
        <path d="M 41,95 Q 46,70 46,50 L 37,34 L 46,38 L 50,20 L 54,38 L 63,34 L 54,50 Q 54,70 59,95 L 68,98 L 32,98 Z" fill="#5D3A1A" />
        <path d="M 46,95 Q 48,72 48,50 M 52,95 Q 52,72 52,50" fill="none" stroke="#422810" strokeWidth="1.5" opacity="0.6" />
        
        {/* Extended Branches */}
        <path d="M 46,50 Q 26,36 14,28" fill="none" stroke="#5D3A1A" strokeWidth="5.5" strokeLinecap="round" />
        <path d="M 54,50 Q 74,36 86,28" fill="none" stroke="#5D3A1A" strokeWidth="5.5" strokeLinecap="round" />
        <path d="M 47,38 Q 28,24 20,14" fill="none" stroke="#5D3A1A" strokeWidth="4" strokeLinecap="round" />
        <path d="M 53,38 Q 72,24 80,14" fill="none" stroke="#5D3A1A" strokeWidth="4" strokeLinecap="round" />

        {/* Dense, Grand & Full Canopy Foliage Layers */}
        {/* Base Outer Shadow Layer */}
        <circle cx="26" cy="32" r="26" fill="#1B5E20"/>
        <circle cx="74" cy="32" r="26" fill="#1B5E20"/>
        <circle cx="50" cy="18" r="28" fill="#1B5E20"/>
        <circle cx="16" cy="44" r="21" fill="#1B5E20"/>
        <circle cx="84" cy="44" r="21" fill="#1B5E20"/>
        <circle cx="50" cy="40" r="27" fill="#1B5E20"/>
        <circle cx="34" cy="52" r="19" fill="#1B5E20"/>
        <circle cx="66" cy="52" r="19" fill="#1B5E20"/>

        {/* Middle Vibrant Green Layer */}
        <circle cx="26" cy="29" r="24" fill="#2E7D32"/>
        <circle cx="74" cy="29" r="24" fill="#2E7D32"/>
        <circle cx="50" cy="15" r="26" fill="#2E7D32"/>
        <circle cx="16" cy="41" r="19" fill="#2E7D32"/>
        <circle cx="84" cy="41" r="19" fill="#2E7D32"/>
        <circle cx="50" cy="37" r="25" fill="#2E7D32"/>
        <circle cx="34" cy="49" r="17" fill="#2E7D32"/>
        <circle cx="66" cy="49" r="17" fill="#2E7D32"/>

        {/* Top Bright Leaf Crowns */}
        <circle cx="26" cy="26" r="21" fill="#43A047"/>
        <circle cx="74" cy="26" r="21" fill="#43A047"/>
        <circle cx="50" cy="12" r="23" fill="#43A047"/>
        <circle cx="16" cy="38" r="16" fill="#43A047"/>
        <circle cx="84" cy="38" r="16" fill="#43A047"/>
        <circle cx="50" cy="34" r="22" fill="#43A047"/>
        <circle cx="34" cy="46" r="15" fill="#43A047"/>
        <circle cx="66" cy="46" r="15" fill="#43A047"/>
        
        {/* Sunlit Top Highlights */}
        <circle cx="50" cy="7" r="15" fill="#66BB6A"/>
        <circle cx="26" cy="19" r="14" fill="#66BB6A"/>
        <circle cx="74" cy="19" r="14" fill="#66BB6A"/>
        <circle cx="50" cy="27" r="14" fill="#81C784"/>

        {/* Render Apples/Fruits securely positioned ON the tree canopy */}
        {spots.slice(0, visibleApplesCount).map((spot, i) => (
          <g key={i} transform={`translate(${spot.x}, ${spot.y})`}>
            <motion.g 
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.35, delay: i * 0.02 }}
            >
              {/* Bright Red Apple Body - Proportionate & Neat */}
              <circle cx="0" cy="0" r="3.6" fill="#FF1744" stroke="#B71C1C" strokeWidth="0.5" />
              {/* Apple Stem */}
              <path d="M 0,-3.6 Q 0.8,-5.5 1.8,-6" fill="none" stroke="#3E2723" strokeWidth="0.9" strokeLinecap="round" />
              {/* Tiny Bright Green Leaf */}
              <path d="M 0.6,-5 Q 2.4,-6.2 3.2,-4.5 Q 1.8,-4.2 0.6,-5" fill="#76FF03" stroke="#33691E" strokeWidth="0.3" />
              {/* Glossy White Reflection Highlight */}
              <circle cx="-1.2" cy="-1.2" r="1.1" fill="#FFFFFF" opacity="0.9" />
            </motion.g>
          </g>
        ))}


      </motion.svg>
    </div>
  );
}

