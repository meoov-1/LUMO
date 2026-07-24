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

      {/* Duolingo Mascot Container - Calm, Grounded & Reassuring */}
      <motion.div
        animate={{
          y: [0, -3, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: 4.0,
          ease: "easeInOut"
        }}
        className="relative"
      >
        <svg 
          width={size} 
          height={size} 
          viewBox="0 0 100 100" 
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-lg overflow-visible"
        >
          {/* Soft Ground Shadow */}
          <ellipse 
            cx="50" cy="95" rx="26" ry="4.5" fill="rgba(0,0,0,0.12)"
          />

          <g stroke="#1A3300" strokeWidth="2.8" strokeLinejoin="round" strokeLinecap="round">
            {/* Left Wing / Hand - Calm & Tucked */}
            <g>
              <path 
                d="M 22,58 C 12,62 10,72 18,78 C 24,76 28,70 30,62 Z" 
                fill="#78C800" 
              />
            </g>

            {/* Right Wing / Hand - Calm & Tucked */}
            <g>
              <path 
                d="M 78,58 C 88,62 90,72 82,78 C 76,76 72,70 70,62 Z" 
                fill="#78C800" 
              />
            </g>

            {/* Left Foot - Planted steadily */}
            <path 
              d="M 36,84 C 32,96 42,98 47,89" 
              fill="#589B00"
            />
            {/* Right Foot - Planted steadily */}
            <path 
              d="M 64,84 C 68,96 58,98 53,89" 
              fill="#589B00"
            />

            {/* Main Body - Duolingo Bright Green Owl Body */}
            <path d="M 50,20 C 88,20 94,62 78,85 C 68,95 32,95 22,85 C 6,62 12,20 50,20 Z" fill="#78C800" />
          </g>
          
          {/* Creamy Belly Patch with Feather Texture */}
          <path d="M 34,85 C 38,68 62,68 66,85 C 60,92 40,92 34,85 Z" fill="#FFFDEB" />
          <path d="M 44,76 C 47,79 53,79 56,76 M 42,82 C 46,85 54,85 58,82" stroke="#E2DBA2" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity="0.6" />

          {/* Leaf Crown / Feathers on Head */}
          <g stroke="#1A3300" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round">
            <path 
              d="M 50,20 C 44,6 28,4 23,15 C 34,23 44,23 50,20 Z" 
              fill="#437700" 
            />
            <path 
              d="M 50,20 C 56,4 68,0 75,7 C 68,18 57,21 50,20 Z" 
              fill="#589B00" 
            />
            <path d="M 50,20 C 50,6 60,1 55,11 C 52,18 52,20 50,20 Z" fill="#8EE000" />
          </g>

          {/* Gentle Eyebrows */}
          <g>
            <path d="M 26,37 Q 34,34 41,37" stroke="#1A3300" strokeWidth="2.6" strokeLinecap="round" fill="none" />
            <path d="M 59,37 Q 66,34 74,37" stroke="#1A3300" strokeWidth="2.6" strokeLinecap="round" fill="none" />
          </g>

          {/* Eyes - Large, expressive Duolingo owl eyes */}
          <g>
            {/* Left Eye Base */}
            <circle cx="34" cy="50" r="9.5" fill="#1A3300"/>
            {/* Right Eye Base */}
            <circle cx="66" cy="50" r="9.5" fill="#1A3300"/>

            {!blink ? (
              /* Both pupils with soft catchlights */
              <g>
                {/* Left Eye Pupils */}
                <circle cx="35.5" cy={48} r="3.4" fill="#FFFFFF"/>
                <circle cx="32" cy={52} r="1.6" fill="#FFFFFF"/>

                {/* Right Eye Pupils */}
                <circle cx="64.5" cy={48} r="3.4" fill="#FFFFFF"/>
                <circle cx="68" cy={52} r="1.6" fill="#FFFFFF"/>
              </g>
            ) : (
              /* Natural soft blink lines */
              <g stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round">
                <line x1="26" y1="50" x2="42" y2="50" />
                <line x1="58" y1="50" x2="74" y2="50" />
              </g>
            )}
          </g>

          {/* Rosy Cheeks */}
          <ellipse cx="22" cy="58" rx="5.5" ry="3.8" fill="#FF5252" opacity="0.8" />
          <ellipse cx="78" cy="58" rx="5.5" ry="3.8" fill="#FF5252" opacity="0.8" />
          
          {/* Gentle, Slow Mouth Movement When Speaking */}
          {isSpeaking ? (
            <g>
              <motion.path 
                d="M 42,57 Q 50,68 58,57 Z" 
                fill="#FF8F00" 
                stroke="#1A3300"
                strokeWidth="2.2"
                strokeLinejoin="round"
                animate={{ d: [
                  "M 43,58 Q 50,62 57,58 Z",
                  "M 41,56 Q 50,70 59,56 Z",
                  "M 43,58 Q 50,62 57,58 Z"
                ] }}
                transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut" }}
              />
            </g>
          ) : (
            <path 
              d="M 43,58 Q 50,65 57,58 Z" 
              fill="#FF8F00" 
              stroke="#1A3300" 
              strokeWidth="2.2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          )}
        </svg>
      </motion.div>
    </div>
  );
}

export function Tree({ progress, isFalling = false }: { progress: number; isFalling?: boolean }) {
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
        animate={isFalling ? { rotate: [0, -2, 2, -1, 1, 0] } : { rotate: [-0.5, 0.5, -0.5] }}
        transition={isFalling ? { duration: 0.8 } : { repeat: Infinity, duration: 5, ease: "easeInOut" }}
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

        {/* Render Apples/Fruits securely positioned ON the tree canopy or FALLING down */}
        {spots.slice(0, visibleApplesCount).map((spot, i) => {
          const fallY = 88 + (i % 3) * 2;
          const fallX = spot.x + ((i % 4) - 1.5) * 4;
          return (
            <motion.g 
              key={i} 
              initial={{ x: spot.x, y: spot.y }}
              animate={isFalling ? {
                x: fallX,
                y: fallY,
                rotate: [0, 45, 90 + (i * 20) % 180]
              } : {
                x: spot.x,
                y: spot.y,
                rotate: 0
              }}
              transition={isFalling ? {
                type: "spring",
                stiffness: 90,
                damping: 10,
                delay: (i % 8) * 0.05
              } : {
                duration: 0.35,
                delay: i * 0.02
              }}
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
          );
        })}

      </motion.svg>
    </div>
  );
}

