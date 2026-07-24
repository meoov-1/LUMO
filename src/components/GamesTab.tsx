import React, { useState, useEffect, useRef } from 'react';
import { soundEngine } from '../utils/audioSynth';
import { Sparkles, Gamepad2, Circle, RefreshCw, Star, Palette, Wind, Layers, Grid, Send, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface GamesTabProps {
  setUserXP?: (xp: number | ((prev: number) => number)) => void;
  userXP?: number;
}

export function GamesTab({ setUserXP, userXP = 0 }: GamesTabProps) {
  const [activeGame, setActiveGame] = useState<'bubbles' | 'thought' | 'gradient' | 'memory' | 'pebbles' | 'canvas'>('bubbles'); 

  // local XP fallback if not passed
  const [localXP, setLocalXP] = useState(() => {
    return parseInt(localStorage.getItem('lumo_user_xp') || '0', 10);
  });

  const addXP = (amount: number) => {
    if (setUserXP) {
      setUserXP((prev: number) => prev + amount);
    } else {
      setLocalXP(prev => {
        const next = prev + amount;
        localStorage.setItem('lumo_user_xp', next.toString());
        return next;
      });
    }
  };

  /* ==========================================
     GAME 1: ZEN BUBBLE WRAP
  ========================================== */
  const [bubbles, setBubbles] = useState(() => Array.from({ length: 24 }, (_, i) => ({ id: i, popped: false })));
  const [popCount, setPopCount] = useState(0);

  const resetBubbles = () => {
    soundEngine.playChime();
    setBubbles(Array.from({ length: 24 }, (_, i) => ({ id: i, popped: false })));
  };

  const popBubble = (id: number) => {
    setBubbles(prev => prev.map(b => b.id === id ? { ...b, popped: true } : b));
    soundEngine.playPopSound();
    setPopCount(c => c + 1);
    addXP(1);
  };

  /* ==========================================
     GAME 2: THOUGHT BALLOON RELEASE (CBT/Anxiety)
  ========================================== */
  const [thoughtInput, setThoughtInput] = useState('');
  const [balloons, setBalloons] = useState([
    { id: 1, text: "Fear of judgment", color: "from-purple-500 to-indigo-600", x: 20 },
    { id: 2, text: "Overthinking tomorrow", color: "from-pink-500 to-rose-600", x: 70 }
  ]);

  const handleLaunchBalloon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!thoughtInput.trim()) return;

    soundEngine.playChime();
    const colors = [
      "from-purple-500 to-indigo-600",
      "from-pink-500 to-rose-600",
      "from-cyan-500 to-blue-600",
      "from-amber-500 to-orange-600",
      "from-emerald-500 to-teal-600"
    ];
    const newB = {
      id: Date.now(),
      text: thoughtInput.trim(),
      color: colors[Math.floor(Math.random() * colors.length)],
      x: Math.floor(Math.random() * 70) + 15
    };
    setBalloons(prev => [...prev, newB]);
    setThoughtInput('');
    addXP(10);
  };

  const popBalloon = (id: number) => {
    soundEngine.playPopSound();
    try {
      confetti({ particleCount: 35, spread: 50, origin: { y: 0.6 } });
    } catch (e) {}
    setBalloons(prev => prev.filter(b => b.id !== id));
    addXP(5);
  };

  /* ==========================================
     GAME 3: COLOR GRADIENT SHIFTER (OCD/Symmetry)
  ========================================== */
  const initialPalette = [
    { id: 0, color: '#818cf8', correctIdx: 0 }, // Violet
    { id: 1, color: '#c084fc', correctIdx: 1 }, // Purple
    { id: 2, color: '#f472b6', correctIdx: 2 }, // Pink
    { id: 3, color: '#fb7185', correctIdx: 3 }, // Rose
    { id: 4, color: '#38bdf8', correctIdx: 4 }  // Cyan
  ];

  const [tiles, setTiles] = useState(() => [...initialPalette].sort(() => Math.random() - 0.5));
  const [selectedTileIdx, setSelectedTileIdx] = useState<number | null>(null);
  const [gradientComplete, setGradientComplete] = useState(false);

  const swapTile = (idx: number) => {
    soundEngine.playPopSound();
    if (selectedTileIdx === null) {
      setSelectedTileIdx(idx);
    } else {
      const newTiles = [...tiles];
      const temp = newTiles[selectedTileIdx];
      newTiles[selectedTileIdx] = newTiles[idx];
      newTiles[idx] = temp;
      setTiles(newTiles);
      setSelectedTileIdx(null);

      // Check if perfectly sorted
      const isSorted = newTiles.every((t, i) => t.correctIdx === i);
      if (isSorted) {
        soundEngine.playChime();
        try {
          confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
        } catch (e) {}
        setGradientComplete(true);
        addXP(25);
      }
    }
  };

  const shuffleGradient = () => {
    soundEngine.playChime();
    setTiles([...initialPalette].sort(() => Math.random() - 0.5));
    setGradientComplete(false);
    setSelectedTileIdx(null);
  };

  /* ==========================================
     GAME 4: CONSTELLATION MEMORY MATCH (ADHD)
  ========================================== */
  const [memorySequence, setMemorySequence] = useState<number[]>([]);
  const [playerInput, setPlayerInput] = useState<number[]>([]);
  const [memoryActiveIndex, setMemoryActiveIndex] = useState<number | null>(null);
  const [memoryScore, setMemoryScore] = useState(0);
  const [memoryStatus, setMemoryStatus] = useState('Press Start to Play');

  const starNodes = [1, 2, 3, 4];

  const startMemoryGame = () => {
    setMemoryScore(0);
    nextMemoryRound([]);
  };

  const nextMemoryRound = (currentSeq: number[]) => {
    setPlayerInput([]);
    setMemoryStatus('Watch the pattern...');
    const nextNode = Math.floor(Math.random() * 4) + 1;
    const newSeq = [...currentSeq, nextNode];
    setMemorySequence(newSeq);

    // Play back sequence
    newSeq.forEach((node, i) => {
      setTimeout(() => {
        setMemoryActiveIndex(node);
        soundEngine.playPopSound();
        setTimeout(() => setMemoryActiveIndex(null), 400);
      }, (i + 1) * 700);
    });

    setTimeout(() => {
      setMemoryStatus('Your Turn! Repeat the pattern');
    }, (newSeq.length + 1) * 700);
  };

  const tapMemoryNode = (nodeId: number) => {
    soundEngine.playPopSound();
    setMemoryActiveIndex(nodeId);
    setTimeout(() => setMemoryActiveIndex(null), 250);

    const newInput = [...playerInput, nodeId];
    setPlayerInput(newInput);

    const stepIdx = newInput.length - 1;
    if (newInput[stepIdx] !== memorySequence[stepIdx]) {
      setMemoryStatus('Oops! Pattern reset. Try again!');
      setMemorySequence([]);
      setPlayerInput([]);
      return;
    }

    if (newInput.length === memorySequence.length) {
      soundEngine.playChime();
      setMemoryScore(s => s + 1);
      addXP(15);
      setMemoryStatus(`Awesome! Round ${memoryScore + 1} Cleared 🎉`);
      setTimeout(() => nextMemoryRound(memorySequence), 1000);
    }
  };

  /* ==========================================
     GAME 5: ZEN PEBBLE STACKING
  ========================================== */
  const [stackedPebbles, setStackedPebbles] = useState<{ id: number; width: string; color: string }[]>([]);

  const addPebble = () => {
    if (stackedPebbles.length >= 6) return;
    soundEngine.playPopSound();
    const colors = [
      'bg-[#58CC02] border-[#4ea602]',
      'bg-[#8BC34A] border-[#7cb342]',
      'bg-[#4CAF50] border-[#388E3C]',
      'bg-[#009688] border-[#00796B]',
      'bg-[#00BCD4] border-[#0097A7]',
      'bg-[#26A69A] border-[#00897B]'
    ];
    const widths = ['w-48', 'w-40', 'w-32', 'w-24', 'w-16', 'w-12'];
    const newIdx = stackedPebbles.length;
    setStackedPebbles(prev => [
      ...prev,
      { id: Date.now(), width: widths[newIdx], color: colors[newIdx] }
    ]);
    addXP(5);

    if (newIdx === 5) {
      soundEngine.playChime();
      try {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      } catch (e) {}
    }
  };

  const clearPebbles = () => {
    soundEngine.playChime();
    setStackedPebbles([]);
  };

  /* ==========================================
     GAME 6: FLOW CANVAS PARTICLES
  ========================================== */
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (activeGame !== 'canvas') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = canvas.parentElement?.clientWidth || 320;
    canvas.height = 320;

    let particles: Array<{ x: number; y: number; vx: number; vy: number; radius: number; color: string; alpha: number }> = [];

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      let clientX = 0;
      let clientY = 0;
      if ('touches' in e && e.touches[0]) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = (e as MouseEvent).clientX;
        clientY = (e as MouseEvent).clientY;
      }
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      for (let i = 0; i < 4; i++) {
        particles.push({
          x, y,
          vx: (Math.random() - 0.5) * 3,
          vy: (Math.random() - 0.5) * 3,
          radius: Math.random() * 6 + 2,
          color: `hsl(${Math.random() * 60 + 240}, 80%, 70%)`,
          alpha: 1
        });
      }
    };

    canvas.addEventListener('mousemove', handlePointerMove);
    canvas.addEventListener('touchmove', handlePointerMove);

    let animationFrame: number;
    const render = () => {
      ctx.fillStyle = 'rgba(242, 248, 238, 0.25)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.02;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      particles = particles.filter(p => p.alpha > 0);
      animationFrame = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrame);
      canvas?.removeEventListener('mousemove', handlePointerMove);
      canvas?.removeEventListener('touchmove', handlePointerMove);
    };
  }, [activeGame]);

  return (
    <div className="space-y-4 animate-fade-in pb-4 select-none">
      {/* Header Banner */}
      <div className="p-4 rounded-2xl bg-[#EAF7E3] border border-[#B3E099] shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-[#1D3222] font-outfit flex items-center gap-1.5">
            <span>Stress Relief Arcade</span> 🎮
          </h2>
          <p className="text-[11px] text-[#4A634E] font-medium mt-0.5">Interactive games designed for Anxiety, OCD, ADHD & Panic Relief</p>
        </div>
        <div className="bg-white border border-[#B3E099] text-[#1D3222] px-3 py-1 rounded-full text-xs font-black shadow-2xs">
          ⭐ {userXP || localXP} XP
        </div>
      </div>

      {/* Game Mode Selector Grid */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => setActiveGame('bubbles')}
          className={`py-2 px-2 rounded-xl text-[11px] font-black transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
            activeGame === 'bubbles'
              ? 'bg-[#1A3022] text-[#D5F0C0] shadow-sm'
              : 'bg-white border border-[#E1F0D7] text-[#3A523E] hover:bg-[#F2F8EE]'
          }`}
        >
          <Circle className="w-4 h-4 text-[#58CC02]" /> Bubble Wrap
        </button>

        <button
          onClick={() => setActiveGame('thought')}
          className={`py-2 px-2 rounded-xl text-[11px] font-black transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
            activeGame === 'thought'
              ? 'bg-[#1A3022] text-[#D5F0C0] shadow-sm'
              : 'bg-white border border-[#E1F0D7] text-[#3A523E] hover:bg-[#F2F8EE]'
          }`}
        >
          <Wind className="w-4 h-4 text-teal-600" /> Release Thought
        </button>

        <button
          onClick={() => setActiveGame('gradient')}
          className={`py-2 px-2 rounded-xl text-[11px] font-black transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
            activeGame === 'gradient'
              ? 'bg-[#1A3022] text-[#D5F0C0] shadow-sm'
              : 'bg-white border border-[#E1F0D7] text-[#3A523E] hover:bg-[#F2F8EE]'
          }`}
        >
          <Grid className="w-4 h-4 text-purple-600" /> OCD Harmony
        </button>

        <button
          onClick={() => setActiveGame('memory')}
          className={`py-2 px-2 rounded-xl text-[11px] font-black transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
            activeGame === 'memory'
              ? 'bg-[#1A3022] text-[#D5F0C0] shadow-sm'
              : 'bg-white border border-[#E1F0D7] text-[#3A523E] hover:bg-[#F2F8EE]'
          }`}
        >
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" /> ADHD Memory
        </button>

        <button
          onClick={() => setActiveGame('pebbles')}
          className={`py-2 px-2 rounded-xl text-[11px] font-black transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
            activeGame === 'pebbles'
              ? 'bg-[#1A3022] text-[#D5F0C0] shadow-sm'
              : 'bg-white border border-[#E1F0D7] text-[#3A523E] hover:bg-[#F2F8EE]'
          }`}
        >
          <Layers className="w-4 h-4 text-emerald-600" /> Zen Stack
        </button>

        <button
          onClick={() => setActiveGame('canvas')}
          className={`py-2 px-2 rounded-xl text-[11px] font-black transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
            activeGame === 'canvas'
              ? 'bg-[#1A3022] text-[#D5F0C0] shadow-sm'
              : 'bg-white border border-[#E1F0D7] text-[#3A523E] hover:bg-[#F2F8EE]'
          }`}
        >
          <Palette className="w-4 h-4 text-indigo-600" /> Flow Canvas
        </button>
      </div>

      {/* GAME 1: ZEN BUBBLE WRAP */}
      {activeGame === 'bubbles' && (
        <div className="p-4 rounded-2xl bg-white border border-[#E1F0D7] shadow-sm text-center">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold text-[#1D3222]">Total Popped: <b className="text-[#58CC02] font-black">{popCount}</b></span>
            <button
              onClick={resetBubbles}
              className="flex items-center gap-1 px-3 py-1 rounded-xl bg-[#F2F8EE] border border-[#E1F0D7] text-[#1D3222] text-xs font-bold hover:bg-[#E5F2DE] cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset Sheet
            </button>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 p-3 rounded-2xl bg-[#F2F8EE] border border-[#E1F0D7]">
            {bubbles.map((b) => (
              <button
                key={b.id}
                disabled={b.popped}
                onClick={() => popBubble(b.id)}
                className={`w-full aspect-square rounded-full flex items-center justify-center transition-all duration-200 ${
                  b.popped
                    ? 'bg-[#E1F0D7] border border-[#C8E8B6] opacity-40 scale-90 shadow-inner'
                    : 'bg-gradient-to-tr from-[#58CC02] via-[#78C800] to-[#8BC34A] hover:scale-105 active:scale-95 shadow-md cursor-pointer animate-pulse'
                }`}
              >
                {!b.popped && <div className="w-2.5 h-2.5 rounded-full bg-white/50 -translate-x-1 -translate-y-1"></div>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* GAME 2: THOUGHT BALLOON RELEASE */}
      {activeGame === 'thought' && (
        <div className="p-4 rounded-2xl bg-white border border-[#E1F0D7] shadow-sm space-y-3">
          <div>
            <h3 className="text-sm font-black text-[#1D3222] font-outfit">Thought Balloon Release</h3>
            <p className="text-xs text-[#4A634E]">Type a stressful thought, inflate it into a balloon, and tap to release it!</p>
          </div>

          <form onSubmit={handleLaunchBalloon} className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Fear of failing or what others think..."
              value={thoughtInput}
              onChange={(e) => setThoughtInput(e.target.value)}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-[#E1F0D7] text-xs text-[#1D3222] focus:border-[#58CC02] focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-[#58CC02] hover:bg-[#4ea602] text-white font-black text-xs shadow-md flex items-center gap-1 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" /> Float
            </button>
          </form>

          {/* Floating Balloons Container */}
          <div className="relative w-full h-60 rounded-2xl bg-gradient-to-b from-[#EAF7E3] via-[#F2F8EE] to-[#E2F0D9] border border-[#E1F0D7] overflow-hidden flex items-end justify-center p-4">
            {balloons.map((b) => (
              <div
                key={b.id}
                onClick={() => popBalloon(b.id)}
                style={{ left: `${b.x}%` }}
                className={`absolute bottom-6 -translate-x-1/2 p-3.5 rounded-full bg-gradient-to-tr ${b.color} text-white shadow-lg cursor-pointer flex flex-col items-center justify-center hover:scale-105 transition-transform max-w-[130px] text-center`}
              >
                <span className="text-[11px] font-black leading-tight drop-shadow-xs">{b.text}</span>
                <span className="text-[9px] opacity-90 mt-0.5">Tap to Pop ✨</span>
                <div className="w-0.5 h-6 bg-white/60 absolute -bottom-6"></div>
              </div>
            ))}

            {balloons.length === 0 && (
              <p className="text-xs text-[#4A634E] mb-20 font-semibold italic">All thought balloons released! Your sky is clear 🌈</p>
            )}
          </div>
        </div>
      )}

      {/* GAME 3: COLOR GRADIENT SHIFTER */}
      {activeGame === 'gradient' && (
        <div className="p-4 rounded-2xl bg-white border border-[#E1F0D7] shadow-sm space-y-3 text-center">
          <div>
            <h3 className="text-sm font-black text-[#1D3222] font-outfit">OCD Color Gradient Harmony</h3>
            <p className="text-xs text-[#4A634E]">Tap two tiles to swap them until they form a smooth spectrum!</p>
          </div>

          <div className="flex justify-center gap-2 my-3">
            {tiles.map((t, idx) => (
              <button
                key={t.id}
                onClick={() => swapTile(idx)}
                style={{ backgroundColor: t.color }}
                className={`w-12 h-20 rounded-xl border-2 shadow-md transition-all duration-300 cursor-pointer ${
                  selectedTileIdx === idx ? 'scale-105 border-[#1D3222] ring-2 ring-[#58CC02]' : 'border-transparent hover:scale-102'
                }`}
              />
            ))}
          </div>

          {gradientComplete ? (
            <div className="p-3 rounded-xl bg-[#EAF7E3] border border-[#B3E099] text-[#1D3222] text-xs font-black flex items-center justify-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#58CC02]" /> Perfect Gradient Restored! (+25 XP)
            </div>
          ) : (
            <button
              onClick={shuffleGradient}
              className="px-4 py-2 rounded-xl bg-[#F2F8EE] border border-[#E1F0D7] text-[#1D3222] text-xs font-bold hover:bg-[#E5F2DE] cursor-pointer"
            >
              Reshuffle Spectrum 🔄
            </button>
          )}
        </div>
      )}

      {/* GAME 4: CONSTELLATION MEMORY MATCH */}
      {activeGame === 'memory' && (
        <div className="p-4 rounded-2xl bg-white border border-[#E1F0D7] shadow-sm space-y-3 text-center">
          <div>
            <h3 className="text-sm font-black text-[#1D3222] font-outfit">ADHD Constellation Memory</h3>
            <p className="text-xs text-[#4A634E]">Watch the star light sequence and repeat the pattern.</p>
          </div>

          <div className="p-2 rounded-xl bg-[#F2F8EE] border border-[#E1F0D7] text-xs font-extrabold text-[#1D3222]">
            {memoryStatus} (Score: {memoryScore})
          </div>

          <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto my-3">
            {starNodes.map((id) => (
              <button
                key={id}
                onClick={() => tapMemoryNode(id)}
                className={`h-20 rounded-2xl border-2 flex items-center justify-center transition-all duration-200 cursor-pointer ${
                  memoryActiveIndex === id
                    ? 'bg-[#58CC02] border-[#4ea602] text-white scale-105 shadow-md'
                    : 'bg-[#F2F8EE] border-[#E1F0D7] text-[#3A523E] hover:border-[#58CC02]'
                }`}
              >
                <Star className={`w-7 h-7 ${memoryActiveIndex === id ? 'fill-white' : ''}`} />
              </button>
            ))}
          </div>

          <button
            onClick={startMemoryGame}
            className="px-5 py-2 rounded-xl bg-[#1A3022] text-[#D5F0C0] text-xs font-black shadow-md cursor-pointer"
          >
            Start New Game ✨
          </button>
        </div>
      )}

      {/* GAME 5: ZEN PEBBLE STACKING */}
      {activeGame === 'pebbles' && (
        <div className="p-4 rounded-2xl bg-white border border-[#E1F0D7] shadow-sm space-y-3 text-center">
          <div>
            <h3 className="text-sm font-black text-[#1D3222] font-outfit">Zen River Pebble Stacker</h3>
            <p className="text-xs text-[#4A634E]">Stack river stones smoothly to calm an overactive mind.</p>
          </div>

          {/* Tower Area */}
          <div className="w-full h-52 rounded-2xl bg-[#F2F8EE] border border-[#E1F0D7] flex flex-col-reverse items-center p-3 overflow-hidden">
            {stackedPebbles.map((p) => (
              <div
                key={p.id}
                className={`h-7 rounded-full border shadow-xs my-0.5 transition-all duration-300 ${p.width} ${p.color}`}
              />
            ))}
          </div>

          <div className="flex justify-center gap-2">
            <button
              disabled={stackedPebbles.length >= 6}
              onClick={addPebble}
              className="px-4 py-2 rounded-xl bg-[#58CC02] hover:bg-[#4ea602] disabled:opacity-40 text-white font-black text-xs shadow-md cursor-pointer"
            >
              Add Pebble 🪨
            </button>
            <button
              onClick={clearPebbles}
              className="px-4 py-2 rounded-xl bg-[#F2F8EE] border border-[#E1F0D7] text-[#1D3222] font-extrabold text-xs hover:bg-[#E5F2DE] cursor-pointer"
            >
              Reset Tower
            </button>
          </div>
        </div>
      )}

      {/* GAME 6: FLOW CANVAS PARTICLES */}
      {activeGame === 'canvas' && (
        <div className="p-4 rounded-2xl bg-white border border-[#E1F0D7] shadow-sm text-center">
          <p className="text-xs text-[#4A634E] font-medium mb-2.5">
            Swipe or move your finger/cursor across the canvas below to create soothing particles.
          </p>
          <canvas
            ref={canvasRef}
            className="w-full rounded-2xl bg-[#F2F8EE] border border-[#E1F0D7] cursor-crosshair touch-none"
          />
        </div>
      )}
    </div>
  );
}

export default GamesTab;
