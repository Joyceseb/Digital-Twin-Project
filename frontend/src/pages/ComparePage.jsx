import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useChat from '../hooks/useChat';
import DocumentSelector from '../components/DocumentSelector';
import { compareModels, judgeModels, generateDocument } from '../utils/api';
import PageBackground from '../components/PageBackground';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ComparePage = () => {
    const navigate = useNavigate();
    const { globalDocuments, compareState, setCompareState } = useChat();
    const { question, selectedDocIds, results } = compareState;

    const [loading, setLoading] = useState(false);
    const [judging, setJudging] = useState(false);

    const setQuestion = (val) => setCompareState(prev => ({ ...prev, question: val }));
    const setSelectedDocIds = (valOrFn) => setCompareState(prev => {
        const newIds = typeof valOrFn === 'function' ? valOrFn(prev.selectedDocIds) : valOrFn;
        return { ...prev, selectedDocIds: newIds };
    });

    const setResults = (val) => setCompareState(prev => ({ ...prev, results: val }));

    const handleDocToggle = (id) => {
        setSelectedDocIds(prev =>
            prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
        );
    };

    const handleClear = () => {
        setCompareState({
            question: "",
            selectedDocIds: [],
            results: null
        });
    };

    const handleCompare = async () => {
        if (!question.trim()) return;
        if (selectedDocIds.length === 0) {
            alert("Please select at least one document.");
            return;
        }

        setLoading(true);
        try {
            const selectedDocs = globalDocuments.filter(d => selectedDocIds.includes(d.id));
            const data = await compareModels(question, selectedDocs);
            setResults(data);
        } catch (error) {
            console.error("Comparison failed:", error);
            alert("Comparison failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleJudge = async () => {
        if (!results) return;

        setJudging(true);
        try {
            const payload = {
                question,
                openai_answer: results.openai?.content || results.openai,
                mistral_answer: results.mistral?.content || results.mistral
            };

            const judgeData = await judgeModels(payload);
            navigate('/judge-results', { state: judgeData });
        } catch (error) {
            console.error("Judging failed:", error);
            alert("Judging failed. Please try again.");
        } finally {
            setJudging(false);
        }
    };

    const handleDownloadPDF = async (content, title) => {
        try {
            await generateDocument(content, title);
        } catch (error) {
            console.error("Download failed:", error);
            alert("Failed to download PDF.");
        }
    };

    return (
        <div className="h-full overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950 transition-colors duration-200 relative">
            <PageBackground variant="compare" />
            <div className="max-w-6xl mx-auto space-y-8 relative z-10">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Compare Models</h1>
                    <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                        Ask one question and see how OpenAI, Mistral, and DeepSeek respond side by side.
                        Select documents to provide context.
                    </p>
                </div>

                {/* Input Section */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
                    {/* Document Selector */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            1. Select Context Documents
                        </label>
                        <DocumentSelector
                            documents={globalDocuments}
                            selectedIds={selectedDocIds}
                            onToggle={handleDocToggle}
                        />
                    </div>

                    {/* Question Input */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                            2. Ask a Question
                        </label>
                        <textarea
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="e.g., Summarize the key points from these documents..."
                            className="w-full p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 min-h-[100px] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        />
                    </div>

                    {/* Action Button */}
                    <div className="flex gap-4">
                        <button
                            onClick={handleClear}
                            disabled={loading}
                            className="px-6 py-3 rounded-lg font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700"
                        >
                            Clear
                        </button>
                        <button
                            onClick={handleCompare}
                            disabled={loading || !question.trim() || selectedDocIds.length === 0}
                            className={`
                  flex-1 py-3 rounded-lg font-semibold text-white shadow-sm transition-all
                  ${loading || !question.trim() || selectedDocIds.length === 0
                                    ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-md'
                                }
                `}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Comparing Models...
                                </span>
                            ) : 'Compare Models'}
                        </button>
                    </div>
                </div>

                {/* Results Section */}
                {results && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* OpenAI Card */}
                            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-blue-100 dark:border-blue-900/30 overflow-hidden flex flex-col h-[600px]">
                                <div className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-900/30 flex items-center justify-between flex-shrink-0">
                                    <span className="font-semibold text-blue-900 dark:text-blue-300">OpenAI</span>
                                    <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full">GPT-4</span>
                                </div>
                                <div className="p-4 flex-1 overflow-y-auto prose dark:prose-invert max-w-none text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {results.openai?.content || results.openai}
                                    </ReactMarkdown>
                                </div>
                                <div className="px-4 py-2 border-t border-blue-50 dark:border-blue-900/30 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center flex-shrink-0">
                                    <div className="flex gap-3 text-xs text-slate-500 dark:text-slate-400">
                                        <span>⏱️ {results.openai?.metrics?.time || 0}s</span>
                                        <span>📝 ~{results.openai?.metrics?.tokens || 0} tokens</span>
                                    </div>
                                    <button
                                        onClick={() => handleDownloadPDF(results.openai?.content || results.openai, "OpenAI_Response")}
                                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                    >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                        Download PDF
                                    </button>
                                </div>
                            </div>

                            {/* Mistral Card */}
                            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-purple-100 dark:border-purple-900/30 overflow-hidden flex flex-col h-[600px]">
                                <div className="px-4 py-3 bg-purple-50 dark:bg-purple-900/20 border-b border-purple-100 dark:border-purple-900/30 flex items-center justify-between flex-shrink-0">
                                    <span className="font-semibold text-purple-900 dark:text-purple-300">Mistral</span>
                                    <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full">Large</span>
                                </div>
                                <div className="p-4 flex-1 overflow-y-auto prose dark:prose-invert max-w-none text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {results.mistral?.content || results.mistral}
                                    </ReactMarkdown>
                                </div>
                                <div className="px-4 py-2 border-t border-purple-50 dark:border-purple-900/30 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center flex-shrink-0">
                                    <div className="flex gap-3 text-xs text-slate-500 dark:text-slate-400">
                                        <span>⏱️ {results.mistral?.metrics?.time || 0}s</span>
                                        <span>📝 ~{results.mistral?.metrics?.tokens || 0} tokens</span>
                                    </div>
                                    <button
                                        onClick={() => handleDownloadPDF(results.mistral?.content || results.mistral, "Mistral_Response")}
                                        className="text-xs text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                                    >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                        Download PDF
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-center pt-4 space-y-2">
                            <button
                                onClick={handleJudge}
                                disabled={judging}
                                className={`
                  px-8 py-3 rounded-lg font-semibold text-white shadow-lg transition-all transform hover:-translate-y-0.5
                  ${judging
                                        ? 'bg-slate-400 dark:bg-slate-600 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:shadow-xl'
                                    }
                `}
                            >
                                {judging ? 'Running Judges...' : '✨ Evaluate with Judges'}
                            </button>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Powered by Gemini • Calculates average scores & rankings
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ComparePage;
