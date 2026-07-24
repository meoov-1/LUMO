import React, { useState } from 'react';
import { LandingScreen, QuestionnaireScreen, LoginScreen } from './components/AuthScreens';
import { HomeScreen, JourneyScreen, JournalScreen } from './components/MainScreens';
import { CbtScreen } from './components/CbtScreen';
import { CareerAdvisorScreen } from './components/CareerAdvisorScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { ScreenState } from './types';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [screen, setScreen] = useState<ScreenState>('landing');
  const [progress, setProgress] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  
  const [journals, setJournals] = useState<Record<number, string>>({});

  const navigate = (newScreen: ScreenState) => setScreen(newScreen);

  const handleSelectLevel = (level: number) => {
    if (level <= progress + 1) {
      setCurrentLevel(level);
      navigate('journal');
    } else {
      setAlertMessage("This level is locked. Complete the previous levels first to unlock it!");
    }
  };

  const handleSaveJournal = (text: string) => {
    setJournals(prev => ({ ...prev, [currentLevel]: text }));
    if (currentLevel > progress) {
      setProgress(p => Math.min(p + 1, 30));
    }
    navigate('home');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center sm:p-6 font-sans relative">
      <div className="w-full h-[100dvh] sm:h-[850px] sm:max-w-[420px] sm:rounded-[48px] bg-white overflow-hidden shadow-2xl relative flex flex-col sm:border-[12px] border-gray-900">
        {screen === 'landing' && <LandingScreen onNext={() => navigate('login')} />}
        {screen === 'login' && <LoginScreen onNext={() => navigate('questionnaire')} />}
        {screen === 'questionnaire' && <QuestionnaireScreen onNext={() => navigate('home')} />}
        
        {screen === 'home' && <HomeScreen progress={progress} onNavigate={navigate} />}
        {screen === 'journey' && <JourneyScreen progress={progress} canJournalToday={true} onNavigate={navigate} onSelectLevel={handleSelectLevel} />}
        {screen === 'journal' && <JournalScreen level={currentLevel} initialText={journals[currentLevel] || ''} onBack={() => navigate('journey')} onSave={handleSaveJournal} />}
        {screen === 'cbt' && <CbtScreen onBack={() => navigate('home')} onNavigate={navigate} />}
        {screen === 'profile' && <ProfileScreen progress={progress} journals={journals} onNavigate={navigate} />}
        {screen === 'career-advisor' && (
          <CareerAdvisorScreen 
            journals={journals} 
            onBack={() => navigate('home')} 
            onNavigateToJournal={() => {
              setCurrentLevel(progress + 1);
              navigate('journal');
            }} 
          />
        )}
        
        <AnimatePresence>
          {alertMessage && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[9999] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
              onClick={() => setAlertMessage(null)}
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-3xl p-6 shadow-2xl max-w-sm w-full text-center border-4 border-[#e8f5d3]"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="w-16 h-16 bg-[#F09B9B] text-white rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
                  !
                </div>
                <h3 className="text-2xl font-bold text-[#2C3E28] mb-4">Oh oh...</h3>
                <p className="text-[#4A6546] font-medium mb-6 text-sm">{alertMessage}</p>
                <button 
                  onClick={() => setAlertMessage(null)}
                  className="bg-[#2C3E28] text-[#D5F0C0] px-8 py-3 rounded-2xl font-bold active:scale-95 transition-transform w-full"
                >
                  Got it
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

