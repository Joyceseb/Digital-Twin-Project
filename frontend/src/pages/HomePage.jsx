import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
    const navigate = useNavigate();

    return (
        <div className="h-full bg-slate-50 dark:bg-slate-950 overflow-y-auto transition-colors duration-200">
            {/* Hero Section */}
            <div className="relative bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 overflow-hidden min-h-[600px] flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-pangea-teal/5 to-pangea-purple/5 dark:from-indigo-950/20 dark:to-slate-900 opacity-50"></div>

                {/* --- DIGITAL ORBIT ANIMATION START --- */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
                    {/* Glowing Core */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pangea-teal/10 rounded-full blur-[80px] animate-pulse"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-pangea-purple/20 rounded-full blur-[40px] animate-pulse animation-delay-2000"></div>

                    {/* Orbit Ring 1 (Small) */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-pangea-teal/10 rounded-full animate-orbit-slow">
                        {/* Orbiting Satellite 1 */}
                        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-pangea-teal rounded-full shadow-[0_0_15px_rgba(12,100,117,0.6)] animate-pulse"></div>
                    </div>

                    {/* Orbit Ring 2 (Medium) */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-pangea-purple/10 rounded-full animate-orbit-reverse">
                        {/* Orbiting Satellite 2 */}
                        <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-4 h-4 bg-pangea-purple rounded-full shadow-[0_0_20px_rgba(79,52,89,0.5)]"></div>
                    </div>

                    {/* Orbit Ring 3 (Large) */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] border border-slate-200/20 dark:border-white/5 rounded-full animate-orbit-slow animation-delay-4000">
                        {/* Orbiting Satellite 3 */}
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 bg-pangea-red/80 rounded-full shadow-[0_0_25px_rgba(224,62,45,0.6)]"></div>
                    </div>
                </div>
                {/* --- DIGITAL ORBIT ANIMATION END --- */}

                <div className="max-w-6xl mx-auto px-6 py-24 relative z-10 animate-float">
                    <div className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-pangea-teal/10 dark:bg-indigo-900/30 text-pangea-teal dark:text-indigo-400 rounded-full text-sm font-semibold mb-4 animate-bounce">
                            <span className="w-2 h-2 bg-pangea-teal dark:bg-indigo-400 rounded-full"></span>
                            New: AI Judge Evaluation
                        </div>

                        <h1 className="text-5xl md:text-7xl font-extrabold text-pangea-dark dark:text-white tracking-tight">
                            Digital Twin <span className="text-transparent bg-clip-text bg-gradient-to-r from-pangea-teal to-pangea-purple">Multi-Model Chat</span>
                        </h1>

                        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
                            Experience the power of three leading AI models side-by-side.
                            Compare responses, analyze performance with AI Judges, and leverage your own documents for context.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <button
                                onClick={() => navigate('/chat')}
                                className="px-8 py-4 bg-pangea-teal text-white rounded-xl font-bold text-lg shadow-lg shadow-pangea-teal/20 dark:shadow-none hover:bg-pangea-teal-light hover:shadow-xl transition-all transform hover:-translate-y-1"
                            >
                                Start Chatting
                            </button>
                            <button
                                onClick={() => navigate('/compare')}
                                className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-lg hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all"
                            >
                                Compare Models
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div className="max-w-6xl mx-auto px-6 py-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Feature 1: Multi-Model Chat */}
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 hover:border-pangea-teal/50 transition-all group relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-pangea-teal opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-12 h-12 bg-pangea-teal/5 rounded-lg flex items-center justify-center mb-6 group-hover:bg-pangea-teal/10 transition-colors">
                            <svg className="w-6 h-6 text-pangea-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-pangea-dark dark:text-white mb-3 group-hover:text-pangea-teal transition-colors">Multi-Model Chat</h3>
                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
                            Orchestrate conversations with OpenAI, Mistral, and DeepSeek. Seamlessly switch models while retaining full context history.
                        </p>
                    </div>

                    {/* Feature 2: Smart Comparison */}
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 hover:border-pangea-purple/50 transition-all group relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-pangea-purple opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-12 h-12 bg-pangea-purple/5 rounded-lg flex items-center justify-center mb-6 group-hover:bg-pangea-purple/10 transition-colors">
                            <svg className="w-6 h-6 text-pangea-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-pangea-dark dark:text-white mb-3 group-hover:text-pangea-purple transition-colors">Smart Comparison</h3>
                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
                            Analyze model performance side-by-side. Compare reasoning capabilities and response quality in real-time.
                        </p>
                    </div>

                    {/* Feature 3: AI Judge Evaluation */}
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 hover:border-pangea-teal/50 transition-all group relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-pangea-teal to-pangea-purple opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="w-12 h-12 bg-pangea-teal/5 rounded-lg flex items-center justify-center mb-6 group-hover:bg-pangea-teal/10 transition-colors">
                            <svg className="w-6 h-6 text-pangea-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-pangea-dark dark:text-white mb-3 group-hover:text-pangea-teal transition-colors">AI Judge Evaluation</h3>
                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm">
                            Deploy impartial AI Judges (Claude/Gemini) to score responses on accuracy, safety, and reasoning quality with detailed critiques.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
