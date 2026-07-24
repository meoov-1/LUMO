import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { GamesTab } from './GamesTab';

interface SensoryGamesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SensoryGamesModal({ isOpen, onClose }: SensoryGamesModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-hidden"
        onClick={onClose}
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="w-full max-w-md rounded-[32px] bg-[#F9FDF7] text-[#1E2E21] shadow-2xl overflow-hidden border-2 border-[#C8E8B6] flex flex-col justify-between max-h-[92vh] relative select-none"
          onClick={e => e.stopPropagation()}
        >
          {/* Close Button Header */}
          <div className="p-4 pb-2 flex justify-between items-center z-10 border-b border-[#E1F0D7] bg-[#EAF7E3]">
            <span className="text-xs font-black text-[#1D3222] uppercase tracking-wider px-2">Stress Relief Arcade</span>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#D5E8CB] hover:bg-[#C4DFB8] flex items-center justify-center text-[#1D3222] transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Games Content */}
          <div className="p-4 overflow-y-auto max-h-[82vh]">
            <GamesTab />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
