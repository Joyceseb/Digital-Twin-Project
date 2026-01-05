import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';
import DocumentSelector from '../components/DocumentSelector';
import useChat from '../hooks/useChat';

const VoiceChatPage = () => {
    const { theme } = useTheme();
    const { globalDocuments } = useChat();

    // Session State
    const [isSessionActive, setIsSessionActive] = useState(false);

    // Activity State
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const [transcript, setTranscript] = useState('');
    const [response, setResponse] = useState('');
    const [selectedDocIds, setSelectedDocIds] = useState([]);

    const recognitionRef = useRef(null);
    const synthRef = useRef(window.speechSynthesis);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onstart = () => {
                setIsListening(true);
            };

            recognition.onresult = (event) => {
                const current = event.resultIndex;
                const transcriptText = event.results[current][0].transcript;
                setTranscript(transcriptText);
            };

            recognition.onend = () => {
                setIsListening(false);
                // Note: We don't auto-restart here effectively because we need to process the text first.
                // The flow is: Listen -> End -> Process -> Speak -> End -> Listen (if session active)
            };

            recognition.onerror = (event) => {
                if (event.error === 'no-speech' || event.error === 'aborted') {
                    setIsListening(false);
                    // If no speech and session is active, we might want to just restart listening?
                    // But 'no-speech' usually means timeout. Let's restart if session is active to keep "listening"
                    // checking isSessionActive via ref to avoid stale closure if needed, but state should work in effect dep
                    return;
                }
                console.error("Speech recognition error", event.error);
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        }

        return () => {
            if (recognitionRef.current) recognitionRef.current.abort();
            if (synthRef.current) synthRef.current.cancel();
        };
    }, []);

    // Effect to handle the "Loop"
    // We basically drive the state machine here.

    // 1. Handling Transcript Finalization (User stopped speaking)
    useEffect(() => {
        if (!isListening && transcript && isSessionActive && !isProcessing && !isSpeaking) {
            // User finished speaking a phrase
            handleSendMessage(transcript);
        } else if (!isListening && isSessionActive && !isProcessing && !isSpeaking) {
            // If stopped listening (e.g. silence timeout) explicitly but session is active, 
            // and we have NO transcript (or it was cleared), we should probably restart listening?
            // BUT: triggers loop if we are not careful.
            // Let's rely on handleSendMessage clearing transcript to restart via the logic below.

            // Actually, best place to restart listening is ONLY after AI finishes speaking OR if silence timeout happened.
            // If error 'no-speech' happened, we want to restart.
            // Let's do a check:
            const timeout = setTimeout(() => {
                if (isSessionActive && !isListening && !isSpeaking && !isProcessing) {
                    try {
                        recognitionRef.current.start();
                    } catch (e) {
                        // ignore if already started
                    }
                }
            }, 500);
            return () => clearTimeout(timeout);
        }
    }, [isListening, isSessionActive, isProcessing, isSpeaking, transcript]);


    const toggleSession = () => {
        if (isSessionActive) {
            // STOP EVERYTHING
            setIsSessionActive(false);
            recognitionRef.current.stop();
            synthRef.current.cancel();
            setIsListening(false);
            setIsSpeaking(false);
            setIsProcessing(false);
        } else {
            // START
            setIsSessionActive(true);
            setTranscript('');
            setResponse('');
            try {
                recognitionRef.current.start();
            } catch (e) { console.error(e); }
        }
    };

    const handleSendMessage = async (text) => {
        if (!text.trim()) return;

        setIsProcessing(true);

        const formData = new FormData();
        let finalPrompt = text;
        if (selectedDocIds.length > 0) {
            const selectedDocs = globalDocuments.filter(d => selectedDocIds.includes(d.id));
            const docNames = selectedDocs.map(d => d.name || d.filename).join(', ');
            if (docNames) {
                finalPrompt = `Regarding document(s) "${docNames}": ${text}`;
            }
        }
        formData.append('prompt', finalPrompt);

        // Clear transcript so we don't re-submit same text
        setTranscript('');

        try {
            const res = await fetch('http://127.0.0.1:8000/api/chat/gemini/', {
                method: 'POST',
                body: formData,
            });

            const responseData = await res.json();
            console.log("Voice Chat Response:", responseData); // Debugging

            // Backend returns 'content' via LLMOrchestrator wrapper, or 'response' in some paths.
            const aiText = responseData.response || responseData.content || "I didn't catch that.";

            setResponse(aiText);

            setIsProcessing(false); // Done processing
            speak(aiText); // Start speaking

        } catch (error) {
            console.error(error);
            setIsProcessing(false);
            setResponse("Sorry, I had an error.");
            speak("Sorry, I had an error.");
        }
    };

    const speak = (text) => {
        if (!synthRef.current) return;
        synthRef.current.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => {
            setIsSpeaking(false);
            // The useEffect will pick this up: isSpeaking became false, isSessionActive is true -> restart listening
        };

        const voices = synthRef.current.getVoices();
        const preferredVoice = voices.find(v => v.name.includes('Google US English')) || voices.find(v => v.lang === 'en-US');
        if (preferredVoice) utterance.voice = preferredVoice;

        synthRef.current.speak(utterance);
    };

    const toggleDocSelection = (id) => {
        setSelectedDocIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [id]
        );
    };

    // Status Text Helper
    const getStatusText = () => {
        if (!isSessionActive) return "Ready to Chat";
        if (isSpeaking) return "AI is Speaking...";
        if (isProcessing) return "Processing...";
        if (isListening) return "Listening...";
        return "Waiting...";
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-sm shrink-0">
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
                    Voice Discussion
                </h1>
                <div className="w-80 z-20">
                    <DocumentSelector
                        documents={globalDocuments}
                        selectedIds={selectedDocIds}
                        onToggle={toggleDocSelection}
                    />
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden">
                {/* Background Decorations */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className={`absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl transition-all duration-1000 ${isListening ? 'scale-125 opacity-100' : 'scale-100 opacity-50'}`}></div>
                    <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl transition-all duration-1000 ${isSpeaking ? 'scale-125 opacity-100' : 'scale-100 opacity-50'}`}></div>
                </div>

                {/* Status Indicator */}
                <div className="z-10 mb-12 text-center h-48 flex flex-col justify-end">
                    <span className={`text-lg font-medium transition-colors duration-300 ${isListening ? 'text-indigo-500 animate-pulse' :
                            isSpeaking ? 'text-purple-500' :
                                isProcessing ? 'text-amber-500' :
                                    'text-slate-400'
                        }`}>
                        {getStatusText()}
                    </span>

                    {/* Visualizer Placeholder / Waveform could go here instead of text */}
                    <div className="mt-4 min-h-[4rem] flex items-center justify-center">
                        {isSpeaking && (
                            <div className="flex gap-1">
                                <span className="w-1 h-8 bg-purple-500 rounded-full animate-wave"></span>
                                <span className="w-1 h-12 bg-purple-500 rounded-full animate-wave" style={{ animationDelay: '0.1s' }}></span>
                                <span className="w-1 h-6 bg-purple-500 rounded-full animate-wave" style={{ animationDelay: '0.2s' }}></span>
                                <span className="w-1 h-10 bg-purple-500 rounded-full animate-wave" style={{ animationDelay: '0.3s' }}></span>
                                <span className="w-1 h-8 bg-purple-500 rounded-full animate-wave" style={{ animationDelay: '0.4s' }}></span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Central Interaction Button */}
                <div className="z-10 relative group">
                    {/* Ripple Effects for Active Session */}
                    {isSessionActive && (
                        <>
                            <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping-slow"></div>
                        </>
                    )}

                    <button
                        onClick={toggleSession}
                        className={`relative w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 ${isSessionActive
                            ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/50'
                            : 'bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-indigo-500/50'
                            }`}
                    >
                        {isSessionActive ? (
                            // Stop Icon
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <rect x="6" y="6" width="12" height="12" rx="2" strokeWidth="2" />
                            </svg>
                        ) : (
                            // Mic Icon
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                        )}
                    </button>
                </div>

                <p className="mt-8 text-sm text-slate-500 dark:text-slate-400 font-medium">
                    {isSessionActive ? 'Tap to end conversation' : 'Tap to start conversation'}
                </p>
            </div>
        </div>
    );
};

export default VoiceChatPage;
