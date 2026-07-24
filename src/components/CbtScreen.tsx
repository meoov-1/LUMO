import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Mic, MicOff, Paperclip, Send, Home, Briefcase, 
  Users, User, Volume2, VolumeX, X, Loader2, Sparkles, Wind, Edit3, 
  Activity, RefreshCw, FileText, File, Presentation,
  Headphones, CheckCircle2, MessageSquare, Radio, HelpCircle, Award, StopCircle, Upload, Keyboard, AlertCircle, Zap, Music, Gamepad2
} from 'lucide-react';
import { Mascot } from './Assets';
import { SoothingMusicModal } from './SoothingMusicModal';
import { SensoryGamesModal } from './SensoryGamesModal';
import { getAnimeVoice } from '../hooks/useSpeech';

interface CbtScreenProps {
  onBack: () => void;
  onNavigate?: (screen: any) => void;
}

interface AttachedFile {
  fileName: string;
  mimeType: string;
  base64: string;
  url?: string;
  isImage?: boolean;
  isPdf?: boolean;
  isPresentation?: boolean;
  fileCategory?: 'resume' | 'presentation' | 'job_desc' | 'notes' | 'other';
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  file?: AttachedFile;
  feedback?: {
    clarityScore?: number;
    confidenceScore?: number;
    tip?: string;
  };
}

function TracePadCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#E28B6D'; // Soft peach/coral stroke
    ctx.lineWidth = 4;
  }, []);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setHasDrawn(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  return (
    <div className="relative w-full h-80 rounded-[32px] bg-[#FAFDF8] border border-[#e2f2db] shadow-xs flex items-center justify-center overflow-hidden touch-none select-none">
      {!hasDrawn && (
        <p className="absolute text-[#EBB097] text-xl font-serif italic text-center px-6 pointer-events-none select-none tracking-wide leading-relaxed">
          Trace your finger here to clear your mind...
        </p>
      )}
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className="w-full h-full cursor-crosshair relative z-10"
      />
      {hasDrawn && (
        <button
          onClick={clearCanvas}
          className="absolute bottom-3 right-3 z-20 text-xs font-bold text-[#E28B6D] bg-[#FFF5F2] hover:bg-[#FEECE6] border border-[#FCD2C4] px-3.5 py-1.5 rounded-full shadow-2xs active:scale-95 transition-all"
        >
          Clear 🧹
        </button>
      )}
    </div>
  );
}

export function CbtScreen({ onBack, onNavigate }: CbtScreenProps) {
  // Screen View Mode: 'landing' (Socio main landing), 'chat' (Text & document chat), 'voice_coach' (Live Voice Coach HUD)
  const [viewMode, setViewMode] = useState<'landing' | 'chat' | 'voice_coach'>('landing');

  // Landing prompt state
  const [landingInput, setLandingInput] = useState("");

  // Practice Mode selection
  const [coachingMode, setCoachingMode] = useState<'general' | 'interview' | 'presentation' | 'viva'>('general');

  // Chat conversation state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: "Hey friend! I'm Lumo. I'm right here to support you — whether you want to talk about how you're feeling, practice for an interview, or rehearse a presentation together. How are you doing today?"
    }
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Voice & Speech State
  const [isRecording, setIsRecording] = useState(false);
  const [isMascotSpeaking, setIsMascotSpeaking] = useState(false);
  const [isVoiceCoachActive, setIsVoiceCoachActive] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [micNotice, setMicNotice] = useState<string | null>(null);
  const [showVoiceTextInput, setShowVoiceTextInput] = useState(false);

  // Quick Reply Suggestion Pills for easy one-tap responses
  const quickSuggestions = [
    "I'm feeling a bit nervous today...",
    "Can you give me a pep talk?",
    "Let's practice my interview answers!",
    "How do I sound so far?",
    "Can we reframe my anxious thoughts?"
  ];
  
  // Attached files
  const [attachedFile, setAttachedFile] = useState<AttachedFile | null>(null);

  // Modals for 5-minute reset tools & sensory games
  const [activeModal, setActiveModal] = useState<'reframes' | 'breathe' | 'scribble' | 'shake' | 'music' | 'sensory' | null>(null);

  // Reframes State
  const [reframeOutput, setReframeOutput] = useState<string[]>([]);
  const [isGeneratingReframe, setIsGeneratingReframe] = useState(false);

  // Reset Tool States
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [breathTimer, setBreathTimer] = useState(60);
  const [scribbleText, setScribbleText] = useState("");
  const [shakeTimer, setShakeTimer] = useState(120);
  const [shakeCount, setShakeCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const isVoiceCoachRef = useRef(isVoiceCoachActive);
  const isRecordingRef = useRef(isRecording);
  const sessionIdRef = useRef<string>(`session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);

  useEffect(() => {
    isVoiceCoachRef.current = isVoiceCoachActive;
  }, [isVoiceCoachActive]);

  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  // Auto scroll to bottom when messages update
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (viewMode === 'chat' || viewMode === 'voice_coach') {
      scrollToBottom();
    }
  }, [messages, isLoading, viewMode]);

  // Setup Web Speech Recognition safely
  useEffect(() => {
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = 'en-US';

        rec.onresult = (event: any) => {
          let transcript = '';
          for (let i = 0; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          if (transcript.trim()) {
            if (viewMode === 'landing') {
              setLandingInput(transcript);
            } else {
              setInput(transcript);
            }
          }
        };

        rec.onerror = (event: any) => {
          console.warn("Speech recognition error:", event.error);
          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            isRecordingRef.current = false;
            setIsRecording(false);
            setMicNotice("Microphone permission was denied or restricted. You can type or use quick responses!");
            setShowVoiceTextInput(true);
          }
        };

        rec.onend = () => {
          // Continuous listening: keep mic open until explicitly stopped by user
          if (isRecordingRef.current) {
            try {
              rec.start();
            } catch (e) {
              console.warn("Could not restart speech recognition automatically:", e);
              setIsRecording(false);
              isRecordingRef.current = false;
            }
          } else {
            setIsRecording(false);
          }
        };

        recognitionRef.current = rec;
      }
    } catch (e) {
      console.warn("Speech recognition not supported in environment:", e);
    }
  }, [viewMode]);

  const toggleRecording = async () => {
    setMicNotice(null);

    if (isRecording) {
      isRecordingRef.current = false;
      setIsRecording(false);
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      return;
    }

    isRecordingRef.current = true;
    setIsRecording(true);

    // Request browser audio permission directly to trigger permission dialog if needed
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Release stream so SpeechRecognition can take over
        stream.getTracks().forEach(track => track.stop());
      }
    } catch (err: any) {
      console.warn("Microphone access permission error:", err);
      setMicNotice("Microphone permission is restricted in this browser window. Use the text input box or quick response chips below!");
      setShowVoiceTextInput(true);
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setMicNotice(null);
      } catch (err) {
        console.warn("Speech recognition start error:", err);
      }
    } else {
      setMicNotice("Voice speech-to-text is restricted in this browser frame. Type your answer or tap quick replies below!");
      setShowVoiceTextInput(true);
    }
  };

  // Launch Full Live Voice Coach Mode
  const startVoiceCoach = (mode: 'general' | 'interview' | 'presentation' | 'viva' = 'general') => {
    setCoachingMode(mode);
    setIsVoiceCoachActive(true);
    setViewMode('voice_coach');
    setTtsEnabled(true);

    let introPrompt = "Hello! I'm your AI Voice Coach. Let me know what you'd like to practice, or speak freely!";
    if (mode === 'interview' || attachedFile?.fileCategory === 'resume') {
      introPrompt = "Welcome to your Mock Interview session! I'll ask questions based on your resume and experience. Tell me about yourself to get started!";
    } else if (mode === 'presentation' || attachedFile?.isPresentation) {
      introPrompt = "Welcome to Presentation Rehearsal! Walk me through your key slides or topic, and I'll give you feedback on delivery and clarity!";
    } else if (mode === 'viva') {
      introPrompt = "Welcome to your Viva Voce practice! Ask or introduce your topic, and I'll ask deep, interactive questions!";
    }

    speakText(introPrompt, () => {
      // Auto start listening after intro
      if (recognitionRef.current) {
        try {
          isRecordingRef.current = true;
          setIsRecording(true);
          recognitionRef.current.start();
        } catch (e) {}
      }
    });
  };

  // End Voice Coach Session
  const stopVoiceCoach = () => {
    setIsVoiceCoachActive(false);
    setIsMascotSpeaking(false);
    window.speechSynthesis?.cancel();
    isRecordingRef.current = false;
    setIsRecording(false);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    setViewMode('chat');
  };

  // Text-To-Speech helper with sweet human voice settings & speech start/end events
  const speakText = (text: string, onEndCallback?: () => void) => {
    if (!ttsEnabled || !('speechSynthesis' in window)) {
      if (onEndCallback) onEndCallback();
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0; // Warm natural human rate
      utterance.pitch = 1.20; // Sweet natural human child/female pitch
      utterance.volume = 1.0;
      
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = getAnimeVoice(voices);
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => {
        setIsMascotSpeaking(true);
      };

      utterance.onend = () => {
        setIsMascotSpeaking(false);
        if (onEndCallback) {
          onEndCallback();
        } else if (isVoiceCoachRef.current && recognitionRef.current) {
          // Continuous Voice Loop: Listen for user response right after Mascot finishes speaking!
          setTimeout(() => {
            try {
              isRecordingRef.current = true;
              setIsRecording(true);
              recognitionRef.current.start();
            } catch (e) {}
          }, 350);
        }
      };

      utterance.onerror = () => {
        setIsMascotSpeaking(false);
        if (onEndCallback) onEndCallback();
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis error:", e);
      setIsMascotSpeaking(false);
      if (onEndCallback) onEndCallback();
    }
  };

  // Handle file attachment (PDF, Resume, Presentation, Image, Doc, TXT)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        const type = file.type || '';
        const name = file.name.toLowerCase();

        const isImg = type.startsWith('image/');
        const isPdf = type === 'application/pdf' || name.endsWith('.pdf');
        const isPres = name.endsWith('.ppt') || name.endsWith('.pptx') || name.includes('slide') || name.includes('presentation');
        
        let fileCategory: 'resume' | 'presentation' | 'job_desc' | 'notes' | 'other' = 'other';
        if (name.includes('resume') || name.includes('cv') || name.includes('biodata')) {
          fileCategory = 'resume';
          setCoachingMode('interview');
        } else if (isPres || name.includes('deck') || name.includes('pitch')) {
          fileCategory = 'presentation';
          setCoachingMode('presentation');
        } else if (name.includes('job') || name.includes('jd') || name.includes('description')) {
          fileCategory = 'job_desc';
          setCoachingMode('interview');
        } else {
          fileCategory = 'notes';
        }

        const docFile: AttachedFile = {
          fileName: file.name,
          mimeType: type || (isPdf ? 'application/pdf' : 'application/octet-stream'),
          base64,
          url: isImg ? result : undefined,
          isImage: isImg,
          isPdf,
          isPresentation: isPres,
          fileCategory
        };

        setAttachedFile(docFile);

        // Automatically start AI Interview Coach workflow driven by the uploaded document!
        autoStartInterviewForDocument(docFile);
      };
      reader.readAsDataURL(file);
    }
  };

  // Auto-Start AI Interview Coach Workflow for Uploaded Document
  const autoStartInterviewForDocument = async (docFile: AttachedFile) => {
    setViewMode('chat');
    setIsLoading(true);

    const docTypeLabel = docFile.fileCategory === 'resume' ? 'Resume / CV' : docFile.isPresentation ? 'Presentation Deck' : docFile.fileCategory === 'job_desc' ? 'Job Description' : 'Document';

    const userDocMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: `Uploaded ${docFile.fileName} (${docTypeLabel}). Extracting & analyzing content to start mock interview...`,
      file: docFile
    };

    setMessages(prev => [...prev, userDocMsg]);
    setAttachedFile(null);

    try {
      const modePromptPrefix = "[AI Interview Coach Document Analysis] ";
      const promptText = `${modePromptPrefix}I have uploaded my ${docTypeLabel}: "${docFile.fileName}". Extract and analyze all its content thoroughly using Gemini multimodal capabilities. Immediately begin my mock interview session with a confirmation review message (e.g., "I've reviewed your ${docTypeLabel.toLowerCase()}. Let's begin your mock interview!") and follow it up immediately with Question #1 generated specifically from details in this document.`;

      const response = await fetch("/api/socio-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: promptText,
          history: messages.map(m => ({ sender: m.sender, text: m.text })),
          fileData: {
            base64: docFile.base64,
            mimeType: docFile.mimeType,
            fileName: docFile.fileName
          }
        })
      });

      const data = await response.json();

      if (data.success && data.text) {
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: data.text
        };
        setMessages(prev => [...prev, aiMessage]);
        speakText(data.text);
      } else {
        throw new Error(data.error || "Failed to analyze document");
      }
    } catch (error: any) {
      console.error("Error auto-starting document interview:", error);
      const fallbackMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: `I've reviewed your ${docTypeLabel}! Let's begin your mock interview. To start off: tell me about your background and key achievements from your document!`
      };
      setMessages(prev => [...prev, fallbackMsg]);
      speakText(fallbackMsg.text);
    } finally {
      setIsLoading(false);
    }
  };

  // Open Chat from Landing Page
  const openChatWithPrompt = (initialText?: string) => {
    const prompt = initialText || landingInput.trim();
    setViewMode('chat');
    if (prompt || attachedFile) {
      sendUserMessage(prompt);
      setLandingInput("");
    }
  };

  // Send message to Gemini API
  const sendUserMessage = async (customText?: string) => {
    const textToSend = customText !== undefined ? customText : input.trim();
    if ((!textToSend && !attachedFile) || isLoading) return;

    const currentAttachedFile = attachedFile;
    const historyBeforeNewMessage = messages; // History prior to current turn

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      file: currentAttachedFile || undefined
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setAttachedFile(null);
    setIsLoading(true);

    if (isRecording && recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e){}
      setIsRecording(false);
      isRecordingRef.current = false;
    }

    try {
      // Context instructions based on current mode
      let modePromptPrefix = "";
      if (coachingMode === 'interview') {
        modePromptPrefix = "[Mock Interview Mode] ";
      } else if (coachingMode === 'presentation') {
        modePromptPrefix = "[Presentation Rehearsal Mode] ";
      } else if (coachingMode === 'viva') {
        modePromptPrefix = "[Viva Voce Practice Mode] ";
      }

      console.log("[Client UI] Sending message to /api/socio-chat:", {
        sessionId: sessionIdRef.current,
        message: modePromptPrefix + textToSend,
        historyCount: historyBeforeNewMessage.length,
        hasAttachment: !!currentAttachedFile
      });

      const response = await fetch("/api/socio-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionIdRef.current,
          message: modePromptPrefix + textToSend,
          history: historyBeforeNewMessage.map(m => ({ sender: m.sender, text: m.text })),
          fileData: currentAttachedFile ? {
            base64: currentAttachedFile.base64,
            mimeType: currentAttachedFile.mimeType,
            fileName: currentAttachedFile.fileName
          } : undefined
        })
      });

      const data = await response.json();
      console.log("[Client UI] Received response from /api/socio-chat:", data);

      if (data.success && data.text) {
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: data.text
        };
        setMessages(prev => [...prev, aiMessage]);
        speakText(data.text);
      } else {
        throw new Error(data.error || "Failed to receive response from AI server.");
      }
    } catch (error: any) {
      console.error("[Client UI] Error communicating with Gemini AI:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: `(Connection error: ${error?.message || 'Unable to reach AI service'}. Please try sending your message again.)`
      };
      setMessages(prev => [...prev, errorMessage]);
      speakText("I had trouble reaching my AI server. Please try sending your message again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Dynamic Gemini Reframes
  const handleReframes = async () => {
    setIsGeneratingReframe(true);
    setActiveModal('reframes');

    const lastUserMsg = [...messages].reverse().find(m => m.sender === 'user')?.text || input || "I feel nervous about speaking and answering questions";

    try {
      const response = await fetch("/api/generate-reframe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userThought: lastUserMsg,
          context: coachingMode === 'interview' ? 'Mock Interview Practice' : 'Presentation Practice'
        })
      });

      const data = await response.json();
      if (data.success && Array.isArray(data.reframes) && data.reframes.length > 0) {
        setReframeOutput(data.reframes);
      } else {
        throw new Error("Failed to parse reframes");
      }
    } catch (err) {
      console.error("Error generating reframes:", err);
      setReframeOutput([
        `"Feeling nervous is a natural signal that you care deeply about performing well."`,
        `"Instead of focusing on perfection, focus on sharing your genuine story and knowledge."`,
        `"Each response is a building block that strengthens your communication confidence."`
      ]);
    } finally {
      setIsGeneratingReframe(false);
    }
  };

  // Reset Tool Handlers
  useEffect(() => {
    let interval: any;
    if (activeModal === 'breathe' && breathTimer > 0) {
      interval = setInterval(() => setBreathTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [activeModal, breathTimer]);

  useEffect(() => {
    let breathInterval: any;
    if (activeModal === 'breathe') {
      const cycle = () => {
        setBreathPhase('Inhale');
        setTimeout(() => {
          setBreathPhase('Hold');
          setTimeout(() => {
            setBreathPhase('Exhale');
          }, 3000);
        }, 4000);
      };
      cycle();
      breathInterval = setInterval(cycle, 11000);
    }
    return () => clearInterval(breathInterval);
  }, [activeModal]);

  useEffect(() => {
    let interval: any;
    if (activeModal === 'shake' && shakeTimer > 0) {
      interval = setInterval(() => setShakeTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [activeModal, shakeTimer]);

  // Render attachment badge
  const renderFileBadge = (file: AttachedFile, onRemove?: () => void) => {
    return (
      <div className="bg-[#f0f9eb] border border-[#d2eaaf] rounded-2xl p-3 flex items-center justify-between gap-3 text-xs font-semibold text-[#2C3E28]">
        <div className="flex items-center gap-2.5 overflow-hidden">
          {file.isImage && file.url ? (
            <img src={file.url} alt="Attached" className="w-10 h-10 object-cover rounded-xl" />
          ) : file.fileCategory === 'resume' ? (
            <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center font-bold shadow-2xs">
              <Briefcase size={20} />
            </div>
          ) : file.isPresentation ? (
            <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center font-bold shadow-2xs">
              <Presentation size={20} />
            </div>
          ) : (
            <div className="w-10 h-10 bg-emerald-100 text-emerald-800 rounded-xl flex items-center justify-center font-bold shadow-2xs">
              <FileText size={20} />
            </div>
          )}
          <div className="flex flex-col truncate">
            <span className="font-bold text-[#1b2b1d] truncate text-sm">{file.fileName}</span>
            <span className="text-[11px] text-[#5c7a52] font-semibold">
              {file.fileCategory === 'resume' ? '📄 Resume / CV Attached' : file.isPresentation ? '📊 Presentation Deck' : '📁 Reference Document'}
            </span>
          </div>
        </div>
        {onRemove && (
          <button 
            onClick={onRemove}
            className="p-1.5 hover:bg-gray-200/80 rounded-full text-gray-500 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F6FBF4] text-[#1E2E21] relative overflow-hidden h-full">
      
      {/* ------------------------------------------------------------- */}
      {/* VIEW MODE 1: SOCIO LANDING PAGE                               */}
      {/* ------------------------------------------------------------- */}
      {viewMode === 'landing' && (
        <div className="flex-1 flex flex-col justify-between overflow-y-auto scrollbar-hide p-1">
          {/* Top Bar */}
          <div className="pt-6 pb-2 px-4 flex items-center justify-between">
            <button 
              onClick={onBack} 
              className="w-9 h-9 bg-white rounded-2xl flex items-center justify-center text-[#1D3222] shadow-2xs border border-[#C8E8B6] active:scale-95 transition-transform cursor-pointer"
            >
              <ArrowLeft size={18} />
            </button>

            {/* AI Voice Coach Launch Button */}
            <button 
              onClick={() => startVoiceCoach(coachingMode)}
              className="px-3.5 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 bg-[#58CC02] hover:bg-[#4ea602] text-white shadow-2xs transition-all active:scale-95 cursor-pointer"
            >
              <Headphones size={15} className="animate-bounce" />
              <span>AI Voice Coach</span>
            </button>
          </div>

          {/* Center Mascot */}
          <div className="flex flex-col items-center justify-center my-auto px-4 py-2">
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="cursor-pointer relative"
              onClick={() => startVoiceCoach('general')}
            >
              <Mascot className="w-24 h-24 drop-shadow-2xs" />
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-white/95 text-[#1D3222] text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-2xs border border-[#C8E8B6] flex items-center gap-1 whitespace-nowrap">
                <Radio size={11} className="text-[#58CC02] animate-pulse" />
                <span>Tap for Voice Practice</span>
              </div>
            </motion.div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-black text-[#1D3222] tracking-tight text-center mt-5 mb-3">
              What's on your mind?
            </h1>

            {/* Practice Mode Chips */}
            <div className="flex items-center gap-2 mb-3 overflow-x-auto max-w-sm w-full px-1 scrollbar-hide justify-center">
              <button
                onClick={() => setCoachingMode('general')}
                className={`px-3 py-1 rounded-full text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                  coachingMode === 'general' ? 'bg-[#1A3022] text-[#D5F0C0]' : 'bg-white text-[#3A523E] border border-[#C8E8B6] hover:bg-[#EAF7E3]'
                }`}
              >
                <MessageSquare size={13} />
                <span>Chat</span>
              </button>
              <button
                onClick={() => setCoachingMode('interview')}
                className={`px-3 py-1 rounded-full text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                  coachingMode === 'interview' ? 'bg-[#1A3022] text-[#D5F0C0]' : 'bg-white text-[#3A523E] border border-[#C8E8B6] hover:bg-[#EAF7E3]'
                }`}
              >
                <Briefcase size={13} />
                <span>Mock Interview</span>
              </button>
              <button
                onClick={() => setCoachingMode('presentation')}
                className={`px-3 py-1 rounded-full text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
                  coachingMode === 'presentation' ? 'bg-[#1A3022] text-[#D5F0C0]' : 'bg-white text-[#3A523E] border border-[#C8E8B6] hover:bg-[#EAF7E3]'
                }`}
              >
                <Presentation size={13} />
                <span>Presentation</span>
              </button>
            </div>

            {/* Prompt Input Card */}
            <div className="w-full max-w-sm bg-white rounded-2xl p-4 shadow-2xs border-2 border-[#C8E8B6] flex flex-col gap-2.5">
              <textarea
                value={landingInput}
                onChange={(e) => setLandingInput(e.target.value)}
                placeholder={
                  coachingMode === 'interview' 
                    ? "Upload your Resume / CV or type target job role..." 
                    : coachingMode === 'presentation' 
                    ? "Upload your Presentation slides or topic..." 
                    : "I'm just feeling a bit..."
                }
                className="w-full bg-transparent resize-none outline-none text-[#1D3222] placeholder-[#7d9972] text-sm font-semibold h-18"
              />

              {/* Attachment preview if selected */}
              {attachedFile && renderFileBadge(attachedFile, () => setAttachedFile(null))}
              
              <div className="flex items-center justify-between pt-1 border-t border-[#E1F0D7]">
                {/* Left icons */}
                <div className="flex items-center gap-1">
                  <button 
                    onClick={toggleRecording} 
                    className={`p-2 rounded-full transition-colors cursor-pointer ${isRecording ? 'bg-red-100 text-red-600 animate-pulse' : 'text-[#4A634E] hover:bg-[#EAF7E3]'}`}
                    title="Voice input"
                  >
                    <Mic size={18} />
                  </button>
                  <button 
                    onClick={() => fileInputRef.current?.click()} 
                    className="p-2 text-[#4A634E] hover:bg-[#EAF7E3] rounded-full transition-colors relative cursor-pointer"
                    title="Upload Resume, Presentation, or Document"
                  >
                    <Paperclip size={18} />
                  </button>
                </div>

                {/* Right Action Pill Buttons */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleReframes}
                    className="flex items-center gap-1.5 bg-[#EAF7E3] hover:bg-[#E2F0D9] text-[#1D3222] border border-[#B3E099] px-3 py-1.5 rounded-full text-xs font-black transition-all active:scale-95 cursor-pointer"
                  >
                    <Sparkles size={14} className="text-[#58CC02]" />
                    <span>Reframes</span>
                  </button>
                  
                  <button 
                    onClick={() => openChatWithPrompt()}
                    className="flex items-center gap-1.5 bg-[#58CC02] hover:bg-[#4ea602] text-white font-black px-3.5 py-1.5 rounded-full text-xs shadow-2xs transition-all active:scale-95 cursor-pointer"
                  >
                    <span>Chat</span>
                    <Send size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 5-MINUTE RESET SECTION */}
          <div className="px-4 mb-4 max-w-sm mx-auto w-full">
            <div className="text-[10px] font-black uppercase text-[#1D3222] tracking-widest mb-2 px-1 flex items-center justify-between">
              <span>ANXIETY & STRESS RELIEF</span>
              <span className="text-[10px] text-[#4A634E] font-black">4 TOOLS</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {/* Sensory Calm Games Card */}
              <div 
                onClick={() => setActiveModal('sensory')}
                className="bg-gradient-to-b from-white to-[#EAF7E3] p-3 rounded-2xl border-2 border-[#C8E8B6] shadow-2xs flex flex-col items-center gap-1 cursor-pointer active:scale-95 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-[#EAF7E3] text-[#58CC02] border border-[#B3E099] flex items-center justify-center shadow-2xs">
                  <Gamepad2 size={20} className="animate-pulse" />
                </div>
                <div className="text-center">
                  <span className="text-[#1D3222] font-black text-xs block">Sensory Games</span>
                  <span className="text-[#4A634E] text-[9px] font-extrabold uppercase tracking-wider block mt-0.5">Bubble Pop & Zen</span>
                </div>
              </div>

              {/* Breathe Card */}
              <div 
                onClick={() => {
                  setBreathTimer(60);
                  setActiveModal('breathe');
                }}
                className="bg-gradient-to-b from-white to-[#F0F7FE] p-3 rounded-2xl border-2 border-[#C4E1F8] shadow-2xs flex flex-col items-center gap-1 cursor-pointer active:scale-95 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-[#EBF3FE] text-[#2563EB] flex items-center justify-center shadow-2xs">
                  <Wind size={20} />
                </div>
                <div className="text-center">
                  <span className="text-[#1D3222] font-black text-xs block">Breathe</span>
                  <span className="text-[#4A634E] text-[9px] font-extrabold uppercase block mt-0.5">1 MIN BOX</span>
                </div>
              </div>

              {/* Scribble Card */}
              <div 
                onClick={() => setActiveModal('scribble')}
                className="bg-gradient-to-b from-white to-[#FEF8F2] p-3 rounded-2xl border-2 border-[#FCE3D1] shadow-2xs flex flex-col items-center gap-1 cursor-pointer active:scale-95 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-[#FFF2E6] text-[#E67E22] flex items-center justify-center shadow-2xs">
                  <Edit3 size={20} />
                </div>
                <div className="text-center">
                  <span className="text-[#1D3222] font-black text-xs block">TracePad</span>
                  <span className="text-[#4A634E] text-[9px] font-extrabold uppercase block mt-0.5">3 MINS DRAW</span>
                </div>
              </div>

              {/* Shake It Card */}
              <div 
                onClick={() => {
                  setShakeTimer(120);
                  setShakeCount(0);
                  setActiveModal('shake');
                }}
                className="bg-gradient-to-b from-white to-[#F0FAF4] p-3 rounded-2xl border-2 border-[#C8E8B6] shadow-2xs flex flex-col items-center gap-1 cursor-pointer active:scale-95 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-[#EAF7E3] text-[#58CC02] flex items-center justify-center shadow-2xs">
                  <Activity size={20} />
                </div>
                <div className="text-center">
                  <span className="text-[#1D3222] font-black text-xs block">Shake It</span>
                  <span className="text-[#4A634E] text-[9px] font-extrabold uppercase block mt-0.5">2 MINS RESET</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VIEW MODE 2: LIVE AI VOICE COACH HUD (ChatGPT Voice Style)    */}
      {/* ------------------------------------------------------------- */}
      {viewMode === 'voice_coach' && (
        <div className="flex-1 flex flex-col bg-[#111e13] text-white p-6 justify-between z-30 relative overflow-hidden">
          {/* Top Bar */}
          <div className="flex items-center justify-between z-10 pt-4">
            <button 
              onClick={stopVoiceCoach}
              className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-2 bg-black/40 px-3.5 py-1.5 rounded-full border border-white/10 text-xs font-bold text-[#a2e372]">
              <Radio size={14} className="animate-pulse" />
              <span>AI Voice Coach Active</span>
            </div>
            <button 
              onClick={() => setTtsEnabled(!ttsEnabled)}
              className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
              {ttsEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </button>
          </div>

          {/* Center Soundwave & Mascot Orb */}
          <div className="flex flex-col items-center justify-center my-auto z-10 gap-6">
            <div className="relative flex items-center justify-center">
              {/* Animated Glowing Ring */}
              <motion.div 
                animate={{ 
                  scale: isMascotSpeaking ? [1, 1.35, 1] : isRecording ? [1, 1.15, 1] : 1,
                  opacity: isMascotSpeaking ? [0.4, 0.8, 0.4] : 0.2
                }}
                transition={{ repeat: Infinity, duration: isMascotSpeaking ? 1.2 : 2.5, ease: "easeInOut" }}
                className="absolute w-52 h-52 rounded-full bg-gradient-to-tr from-[#8edb59] to-[#00d2ff] blur-xl"
              />

              <div className="relative w-36 h-36 rounded-full bg-[#1b2d1f] border-4 border-[#8edb59]/40 flex items-center justify-center shadow-2xl">
                <Mascot className="w-24 h-24 drop-shadow-md" />
              </div>
            </div>

            {/* Status indicator */}
            <div className="text-center">
              <h2 className="text-xl font-bold text-white mb-1">
                {isMascotSpeaking ? "Mascot is speaking..." : isRecording ? "Listening to you..." : isLoading ? "Analyzing..." : "Ready to practice"}
              </h2>
              <p className="text-xs text-[#a2e372] font-semibold">
                {coachingMode === 'interview' ? '💼 Mock Interview Practice' : coachingMode === 'presentation' ? '📊 Presentation Rehearsal' : '🌱 Conversational Practice'}
              </p>
            </div>

            {/* Live Waveform visualizer */}
            <div className="flex items-center gap-1.5 h-10 my-2">
              {[0, 1, 2, 3, 4, 5, 6].map((idx) => (
                <motion.div
                  key={idx}
                  animate={{ 
                    height: isMascotSpeaking || isRecording ? [10, 36, 8, 28, 12][idx % 5] : 8
                  }}
                  transition={{ repeat: Infinity, duration: 0.5 + idx * 0.1, ease: "easeInOut" }}
                  className="w-1.5 bg-[#8edb59] rounded-full"
                />
              ))}
            </div>

            {/* Transcript Preview */}
            <div className="max-w-xs text-center bg-black/30 border border-white/10 p-4 rounded-2xl text-xs text-gray-200 italic leading-relaxed backdrop-blur-xs">
              "{messages[messages.length - 1]?.text || 'Speak out loud...'}"
            </div>
          </div>

          {/* Mic Restriction Banner or Voice Coach Text Input Overlay */}
          <div className="z-10 px-2 flex flex-col gap-2 max-w-sm mx-auto w-full">
            {micNotice && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#2a1d12] border border-amber-500/30 text-amber-200 text-[11px] p-3 rounded-2xl flex items-start justify-between gap-2 shadow-lg"
              >
                <div className="flex items-start gap-2">
                  <AlertCircle size={15} className="text-amber-400 mt-0.5 shrink-0" />
                  <span>{micNotice}</span>
                </div>
                <button onClick={() => setMicNotice(null)} className="text-amber-400/80 hover:text-amber-200 p-0.5">
                  <X size={14} />
                </button>
              </motion.div>
            )}

            {/* Quick Reply Chips in Voice Coach HUD */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-hide">
              {quickSuggestions.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => {
                    sendUserMessage(suggestion);
                  }}
                  className="shrink-0 bg-white/10 hover:bg-white/20 active:scale-95 text-[#a2e372] text-[11px] font-bold px-3 py-1.5 rounded-full border border-[#8edb59]/30 transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {/* Optional Keyboard Input Drawer for Voice Coach */}
            {showVoiceTextInput && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex items-center gap-2 bg-black/50 border border-white/20 rounded-full px-3.5 py-1.5"
              >
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && input.trim()) {
                      sendUserMessage(input.trim());
                    }
                  }}
                  placeholder="Type your response to Mascot..."
                  className="flex-1 bg-transparent text-white placeholder-gray-400 text-xs outline-none"
                />
                <button
                  onClick={() => {
                    if (input.trim()) sendUserMessage(input.trim());
                  }}
                  className="bg-[#8edb59] text-[#111e13] p-1.5 rounded-full font-bold hover:brightness-110 active:scale-95"
                >
                  <Send size={13} />
                </button>
              </motion.div>
            )}
          </div>

          {/* Controls Bar */}
          <div className="flex items-center justify-center gap-5 z-10 pb-6 pt-2">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-3.5 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all active:scale-95"
              title="Upload Document"
            >
              <Paperclip size={20} />
            </button>

            <button 
              onClick={() => setShowVoiceTextInput(!showVoiceTextInput)}
              className={`p-3.5 rounded-full transition-all active:scale-95 ${
                showVoiceTextInput ? 'bg-[#8edb59] text-[#111e13]' : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              title="Toggle Text Input Box"
            >
              <Keyboard size={20} />
            </button>

            {/* Main Mic Button */}
            <button 
              onClick={toggleRecording}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-2xl active:scale-95 ${
                isRecording 
                  ? 'bg-red-500 text-white animate-pulse ring-8 ring-red-500/30' 
                  : 'bg-[#8edb59] text-[#111e13] ring-8 ring-[#8edb59]/20'
              }`}
              title="Toggle Microphone"
            >
              {isRecording ? <MicOff size={28} /> : <Mic size={28} />}
            </button>

            <button 
              onClick={stopVoiceCoach}
              className="p-3.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-full transition-all active:scale-95"
              title="End Voice Coach"
            >
              <StopCircle size={20} />
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VIEW MODE 3: FULL CONVERSATION VIEW (Text & Audio History)    */}
      {/* ------------------------------------------------------------- */}
      {viewMode === 'chat' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header */}
          <div className="pt-8 pb-1 px-5 flex items-center justify-between z-20">
            <button 
              onClick={() => setViewMode('landing')} 
              className="w-10 h-10 bg-white/80 rounded-full flex items-center justify-center text-[#2C3E28] shadow-xs border border-black/5 active:scale-95 transition-transform"
            >
              <ArrowLeft size={18} />
            </button>

            {/* Controls Header */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => startVoiceCoach(coachingMode)}
                className="px-3.5 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 bg-[#a2e372] text-[#1a3314] shadow-2xs border border-[#8edb59]"
              >
                <Headphones size={15} />
                <span>Voice Coach</span>
              </button>

              <button 
                onClick={() => {
                  if (ttsEnabled) {
                    window.speechSynthesis?.cancel();
                  }
                  setTtsEnabled(!ttsEnabled);
                }}
                className={`p-2 rounded-full shadow-2xs border transition-all ${
                  ttsEnabled ? 'bg-white/80 text-[#3d5932] border-[#cbe8a8]' : 'bg-gray-100 text-gray-500 border-gray-200'
                }`}
                title={ttsEnabled ? "Mute Mascot voice" : "Unmute Mascot voice"}
              >
                {ttsEnabled ? <Volume2 size={16} className="text-[#64aa38]" /> : <VolumeX size={16} />}
              </button>
            </div>
          </div>

          {/* Mascot Avatar Top */}
          <div className="flex justify-center -mt-2 mb-2">
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            >
              <Mascot className="w-16 h-16 drop-shadow-xs" />
            </motion.div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-2 flex flex-col gap-4 scrollbar-hide">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25 }}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                {msg.sender === 'user' ? (
                  <div className="bg-[#b8e88e] text-[#1b2b1d] font-sans font-semibold text-sm px-4 py-2.5 rounded-[22px] max-w-[85%] shadow-2xs leading-relaxed flex flex-col gap-2">
                    {msg.file && renderFileBadge(msg.file)}
                    {msg.text && <div>{msg.text}</div>}
                  </div>
                ) : (
                  <div className="bg-white/95 text-[#2d4027] font-serif italic text-[15px] p-5 rounded-[24px] shadow-sm border border-[#d2eaaf] max-w-[88%] leading-relaxed tracking-wide">
                    {msg.text}
                  </div>
                )}
              </motion.div>
            ))}

            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="self-start bg-white/90 text-[#5c7a52] px-4 py-3 rounded-[20px] shadow-2xs border border-[#d2eaaf] flex items-center gap-2 text-xs font-bold"
              >
                <Loader2 size={16} className="animate-spin text-[#64aa38]" />
                <span>Mascot is thinking...</span>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Mic Notice Banner in Chat View */}
          {micNotice && (
            <div className="mx-4 mb-2 bg-[#fff8ed] border border-amber-300 text-amber-900 text-xs p-2.5 rounded-2xl flex items-start justify-between gap-2 shadow-2xs">
              <div className="flex items-start gap-2">
                <AlertCircle size={15} className="text-amber-600 mt-0.5 shrink-0" />
                <span>{micNotice}</span>
              </div>
              <button onClick={() => setMicNotice(null)} className="text-amber-700 hover:text-amber-900 p-0.5">
                <X size={14} />
              </button>
            </div>
          )}

          {/* Quick Reply Suggestions Chips */}
          <div className="mx-4 mb-2 flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-hide">
            {quickSuggestions.map((suggestion, i) => (
              <button
                key={i}
                onClick={() => sendUserMessage(suggestion)}
                className="shrink-0 bg-white/90 hover:bg-[#eaf7de] text-[#2C3E28] text-xs font-bold px-3 py-1.5 rounded-full border border-[#d2eaaf] shadow-2xs active:scale-95 transition-all"
              >
                {suggestion}
              </button>
            ))}
          </div>

          {/* Attached File Preview */}
          {attachedFile && (
            <div className="mx-6 mb-2">
              {renderFileBadge(attachedFile, () => setAttachedFile(null))}
            </div>
          )}

          {/* Floating Bottom Input Bar */}
          <div className="mx-4 mb-3 bg-white/95 border border-[#d2eaaf] shadow-md rounded-full px-3 py-2 flex items-center gap-2 relative z-20">
            <button
              onClick={toggleRecording}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                isRecording 
                  ? 'bg-red-500 text-white animate-pulse shadow-md' 
                  : 'bg-[#f0f9eb] text-[#5c7a52] hover:bg-[#e2f3da]'
              }`}
              title={isRecording ? "Listening... click to stop" : "Voice input"}
            >
              {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-[#5c7a52] hover:bg-[#f0f9eb] rounded-full transition-colors"
              title="Attach PDF, Resume, Presentation or Document"
            >
              <Paperclip size={18} />
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendUserMessage()}
              placeholder={isRecording ? "Listening to your voice..." : "Type or ask questions..."}
              className="flex-1 bg-transparent text-[#2C3E28] placeholder-[#7d9972] text-sm font-medium outline-none px-2"
            />

            <button
              onClick={() => sendUserMessage()}
              disabled={!input.trim() && !attachedFile}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-2xs ${
                input.trim() || attachedFile 
                  ? 'bg-[#a2e372] text-[#1a3314] hover:bg-[#8edb59]' 
                  : 'bg-[#e5f3da] text-[#91b384] cursor-not-allowed'
              }`}
            >
              <Send size={15} className="ml-0.5" />
            </button>
          </div>
        </div>
      )}

      {/* Hidden File Input for PDF, Resume, Presentation, Image, Doc */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*,application/pdf,.pdf,.doc,.docx,.txt,.ppt,.pptx" 
        className="hidden" 
      />

      {/* ------------------------------------------------------------- */}
      {/* RESET & REFRAME MODALS                                        */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {/* Reframes Modal */}
        {activeModal === 'reframes' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-5"
            onClick={() => setActiveModal(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-6 shadow-2xl max-w-sm w-full border-4 border-[#d8edc4] flex flex-col gap-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[#f0f7e8] pb-3">
                <div className="flex items-center gap-2 text-[#2C3E28] font-black text-lg">
                  <Sparkles size={20} className="text-[#64aa38]" />
                  <span>Cognitive Reframes</span>
                </div>
                <button onClick={() => setActiveModal(null)} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>

              {isGeneratingReframe ? (
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                  <RefreshCw size={28} className="animate-spin text-[#64aa38]" />
                  <p className="text-xs font-bold text-[#5c7a52]">Reframing your perspective...</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3 my-1">
                  {reframeOutput.map((quote, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.15 }}
                      className="bg-[#F4F9EE] p-4 rounded-2xl border border-[#D5F0C0] text-sm font-bold text-[#2C3E28] leading-relaxed shadow-2xs"
                    >
                      {quote}
                    </motion.div>
                  ))}
                </div>
              )}

              <button 
                onClick={() => setActiveModal(null)}
                className="w-full bg-[#2C3E28] text-[#D5F0C0] py-3 rounded-2xl font-black text-sm active:scale-95 transition-transform"
              >
                I Feel Better! 🌿
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* Breathe Modal */}
        {activeModal === 'breathe' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gradient-to-b from-[#eaf5e3] via-[#e5f3dc] to-[#daf0d0] z-50 flex flex-col justify-between p-6 overflow-hidden"
            onClick={() => setActiveModal(null)}
          >
            {/* Top Navigation */}
            <div className="flex items-center justify-start w-full pt-2">
              <button 
                onClick={() => setActiveModal(null)}
                className="w-11 h-11 bg-white text-gray-700 rounded-full shadow-xs flex items-center justify-center cursor-pointer hover:bg-gray-50 active:scale-95 transition-transform"
              >
                <ArrowLeft size={20} />
              </button>
            </div>

            {/* Center Breathing Circle */}
            <div 
              className="flex-1 flex flex-col items-center justify-center text-center my-4 relative select-none"
              onClick={e => e.stopPropagation()}
            >
              <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
                {/* Outer Ambient Glow Ring */}
                <motion.div 
                  animate={{ 
                    scale: breathPhase === 'Inhale' ? 1.35 : breathPhase === 'Hold' ? 1.35 : 0.8,
                    opacity: breathPhase === 'Inhale' ? 0.6 : breathPhase === 'Hold' ? 0.7 : 0.3
                  }}
                  transition={{ 
                    duration: breathPhase === 'Inhale' ? 4 : breathPhase === 'Hold' ? 3 : 4, 
                    ease: 'easeInOut' 
                  }}
                  className="absolute w-64 h-64 sm:w-72 sm:h-72 rounded-full bg-[#fafff6] filter blur-xl"
                />

                {/* Main Expanding / Shrinking Circle */}
                <motion.div 
                  animate={{ 
                    scale: breathPhase === 'Inhale' ? 1.25 : breathPhase === 'Hold' ? 1.25 : 0.82
                  }}
                  transition={{ 
                    duration: breathPhase === 'Inhale' ? 4 : breathPhase === 'Hold' ? 3 : 4, 
                    ease: 'easeInOut' 
                  }}
                  className="w-56 h-56 sm:w-64 sm:h-64 rounded-full bg-gradient-to-tr from-[#ffffff] via-[#f7fdf3] to-[#ffffff] shadow-[0_0_50px_rgba(255,255,255,0.95)] flex items-center justify-center border border-white/90 relative z-10"
                />

                {/* Animated Inner Phase Text */}
                <AnimatePresence mode="wait">
                  <motion.span 
                    key={breathPhase}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    transition={{ duration: 0.5 }}
                    className="absolute z-20 font-serif italic text-4xl sm:text-5xl font-normal text-[#2C3E28] tracking-wide"
                  >
                    {breathPhase}
                  </motion.span>
                </AnimatePresence>
              </div>

              <p className="mt-10 text-[#486341] font-medium text-center text-sm max-w-xs leading-relaxed">
                Follow the circle. Inhale as it grows,<br />exhale as it shrinks.
              </p>
            </div>

            {/* Bottom Feeling Better Button */}
            <div className="flex justify-center pb-8" onClick={e => e.stopPropagation()}>
              <button 
                onClick={() => setActiveModal(null)}
                className="bg-white text-[#2C3E28] font-bold text-sm px-10 py-3.5 rounded-full shadow-xs border border-[#e1f1db] hover:bg-[#f4fcf0] active:scale-95 transition-all cursor-pointer"
              >
                Feeling Better
              </button>
            </div>
          </motion.div>
        )}

        {/* Scribble / Trace Modal */}
        {activeModal === 'scribble' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gradient-to-b from-[#eaf5e3] via-[#e5f3dc] to-[#daf0d0] z-50 flex flex-col justify-between p-6 overflow-hidden"
            onClick={() => setActiveModal(null)}
          >
            {/* Top Navigation */}
            <div className="flex items-center justify-start w-full pt-2">
              <button 
                onClick={() => setActiveModal(null)}
                className="w-11 h-11 bg-white text-gray-700 rounded-full shadow-xs flex items-center justify-center cursor-pointer hover:bg-gray-50 active:scale-95 transition-transform"
              >
                <ArrowLeft size={20} />
              </button>
            </div>

            {/* Central Tracing Card */}
            <div 
              className="flex-1 flex items-center justify-center my-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-full max-w-sm relative">
                <TracePadCanvas />
              </div>
            </div>

            {/* Bottom Return Button */}
            <div className="flex justify-center pb-8" onClick={e => e.stopPropagation()}>
              <button 
                onClick={() => setActiveModal(null)}
                className="bg-white text-[#2C3E28] font-bold text-sm px-12 py-3.5 rounded-full shadow-xs border border-[#e1f1db] hover:bg-[#f4fcf0] active:scale-95 transition-all"
              >
                Return
              </button>
            </div>
          </motion.div>
        )}

        {/* Shake It Modal */}
        {activeModal === 'shake' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-5"
            onClick={() => setActiveModal(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 10 }}
              className="bg-white/95 text-[#1b2b1d] rounded-[32px] p-6 shadow-2xl max-w-sm w-full text-center flex flex-col items-center border border-[#c2e8a3] relative overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center w-full mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#eafaf1] text-[#2ecc71] flex items-center justify-center font-bold">
                    <Activity size={16} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-[#21331d]">2-Min Shake It Reset</span>
                </div>
                <button onClick={() => setActiveModal(null)} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-full">
                  <X size={18} />
                </button>
              </div>

              {/* Animated Mascot / Icon */}
              <div className="my-2 relative flex items-center justify-center">
                <motion.div
                  animate={{ 
                    rotate: [-12, 12, -12, 12, 0],
                    y: [0, -6, 0, -6, 0],
                    scale: [1, 1.08, 1]
                  }}
                  transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut" }}
                  className="cursor-pointer select-none"
                  onClick={() => {
                    setShakeCount(prev => prev + 1);
                    if (navigator.vibrate) navigator.vibrate(35);
                  }}
                >
                  <Mascot className="w-24 h-24 drop-shadow-md" />
                </motion.div>

                {/* Energy pulses */}
                <motion.div 
                  animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0.7, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                  className="absolute w-28 h-28 rounded-full border-2 border-[#2ecc71]/40 pointer-events-none"
                />
              </div>

              {/* Dynamic Step Instruction */}
              <div className="bg-[#f2f9ed] border border-[#d3ebd0] rounded-2xl p-3.5 my-2 w-full text-center">
                <p className="text-xs font-extrabold text-[#2C3E28] leading-relaxed">
                  {shakeTimer > 90 ? "👋 Step 1: Shake out your hands & wrists! Let go of typing tension." :
                   shakeTimer > 60 ? "🙆 Step 2: Roll your shoulders back & shake your arms freely!" :
                   shakeTimer > 30 ? "🦵 Step 3: Bounce on your toes & shake all physical stress away!" :
                   "🧘 Step 4: Take a deep breath & feel the fresh energy flowing!"}
                </p>
              </div>

              {/* Interactive Tap-to-Shake Button & Counter */}
              <div className="flex items-center justify-between w-full px-2 my-2">
                <button
                  onClick={() => {
                    setShakeCount(prev => prev + 1);
                    if (navigator.vibrate) navigator.vibrate(40);
                  }}
                  className="bg-[#2ecc71] hover:bg-[#27ae60] text-white font-black px-4 py-2 rounded-full text-xs flex items-center gap-1.5 shadow-xs active:scale-90 transition-all"
                >
                  <Zap size={14} className="animate-bounce" />
                  <span>Tap to Shake!</span>
                </button>

                <div className="bg-[#eafaf1] text-[#27ae60] font-black text-xs px-3 py-1.5 rounded-full border border-[#b8eac9]">
                  Shakes: {shakeCount} ⚡
                </div>
              </div>

              {/* Countdown Timer Bar */}
              <div className="w-full bg-[#e8f5e1] h-2.5 rounded-full overflow-hidden my-3">
                <motion.div 
                  className="bg-gradient-to-r from-[#8edb59] to-[#2ecc71] h-full rounded-full"
                  animate={{ width: `${(shakeTimer / 120) * 100}%` }}
                  transition={{ duration: 1, ease: "linear" }}
                />
              </div>

              <div className="text-2xl font-black text-[#2C3E28] mb-3">
                {Math.floor(shakeTimer / 60)}:{(shakeTimer % 60).toString().padStart(2, '0')}
              </div>

              <button 
                onClick={() => setActiveModal(null)}
                className="w-full bg-[#a2e372] hover:bg-[#8edb59] text-[#1a3314] py-3 rounded-2xl font-black text-sm shadow-2xs active:scale-95 transition-transform"
              >
                Refreshed & Ready! 💃
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Soothing Anxiety Music Modal & Sensory Games Modal */}
      <SoothingMusicModal isOpen={activeModal === 'music'} onClose={() => setActiveModal(null)} />
      <SensoryGamesModal isOpen={activeModal === 'sensory'} onClose={() => setActiveModal(null)} />

      {/* Bottom Nav Bar */}
      {viewMode !== 'voice_coach' && (
        <div className="flex justify-around items-center bg-white/95 backdrop-blur-md px-3 py-2.5 border-t border-[#C8E8B6] text-[#4A634E] z-30 mt-auto shadow-2xs">
          <button onClick={() => onNavigate?.('home')} className="flex flex-col items-center active:scale-95 transition-transform cursor-pointer">
            <Home size={20} />
            <span className="text-[10px] mt-0.5 font-extrabold">Home</span>
          </button>
          <button onClick={() => onNavigate?.('journey')} className="flex flex-col items-center active:scale-95 transition-transform cursor-pointer">
            <Briefcase size={20} />
            <span className="text-[10px] mt-0.5 font-extrabold">Career</span>
          </button>
          <button 
            onClick={() => setViewMode('landing')}
            className="flex flex-col items-center text-[#58CC02] font-black cursor-pointer"
          >
            <Users size={20} />
            <span className="text-[10px] mt-0.5 font-black">Socio</span>
          </button>
          <button onClick={() => onNavigate?.('profile')} className="flex flex-col items-center active:scale-95 transition-transform cursor-pointer">
            <User size={20} />
            <span className="text-[10px] mt-0.5 font-extrabold">Profile</span>
          </button>
        </div>
      )}
    </div>
  );
}
