import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { useLocation, useNavigate } from 'react-router-dom';
import { generateDocument } from '../utils/api';


const JudgeResultsPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const results = location.state;

    if (!results) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h2 className="text-xl font-semibold text-slate-900 mb-2">No Results Found</h2>
                <p className="text-slate-500 mb-6">Please run a comparison first to see judge results.</p>
                <button
                    onClick={() => navigate('/compare')}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                    Go to Compare
                </button>
            </div>
        );
    }

    const { winner, ranking, detailed_analysis } = results;

    // Markdown rendering (simple pre-wrap for now)
    const AnalysisBlock = ({ text }) => (
        <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">
            {text}
        </div>
    );

    return (
        <div className="h-full overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Evaluation Results</h1>
                        <p className="text-slate-500 dark:text-slate-400">AI Judges (Claude & Gemini) have analyzed the responses.</p>
                    </div>

                    {/* Winner Badge */}
                    <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/40 dark:to-yellow-900/40 border border-amber-200 dark:border-amber-700/50 rounded-xl shadow-sm">
                        <div className="p-2 bg-amber-500/10 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-amber-500">
                                <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Overall Winner</p>
                            <p className="text-lg font-bold text-amber-900 dark:text-amber-100 capitalize">{winner}</p>
                        </div>
                    </div>
                </div>

                {/* Graphs Section - Restored & Fixed */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Bar Chart (Fixed Dimensions) */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-6 w-full text-left">Score Comparison</h3>
                        <div className="w-full flex justify-center overflow-x-auto">
                            <BarChart width={500} height={300} data={ranking} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="model" axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                                <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend />
                                <Bar dataKey="score" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={50} name="Total Score" />
                            </BarChart>
                        </div>
                    </div>

                    {/* Radar Chart (Fixed Dimensions) */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-6 w-full text-left">Metric Analysis</h3>
                        <div className="w-full flex justify-center overflow-x-auto">
                            {(() => {
                                // Transform dimensions data for Radar Chart
                                const dims = results.dimensions || {};
                                const models = Object.keys(dims);
                                if (models.length === 0) return <p className="text-slate-500">No metric data available.</p>;

                                // Assume all models have same metrics keys
                                const metrics = Object.keys(dims[models[0]] || {});

                                const radarData = metrics.map(metric => {
                                    const entry = { metric: metric.charAt(0).toUpperCase() + metric.slice(1) }; // Capitalize
                                    models.forEach(model => {
                                        entry[model] = dims[model][metric];
                                    });
                                    return entry;
                                });

                                const colors = ['#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444']; // Purple, Cyan, Amber, Red

                                return (
                                    <RadarChart cx={250} cy={150} outerRadius={100} width={500} height={300} data={radarData}>
                                        <PolarGrid stroke="#E2E8F0" />
                                        <PolarAngleAxis dataKey="metric" tick={{ fill: '#64748B', fontSize: 12 }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                                        <Tooltip />
                                        <Legend />
                                        {models.map((model, index) => (
                                            <Radar
                                                key={model}
                                                name={model}
                                                dataKey={model}
                                                stroke={colors[index % colors.length]}
                                                fill={colors[index % colors.length]}
                                                fillOpacity={0.3}
                                            />
                                        ))}
                                    </RadarChart>
                                );
                            })()}
                        </div>
                    </div>
                </div>                {/* Ranking Table */}
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Detailed Ranking</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-3 font-semibold">Rank</th>
                                    <th className="px-6 py-3 font-semibold">Model</th>
                                    <th className="px-6 py-3 font-semibold">Score</th>
                                    <th className="px-6 py-3 font-semibold">Strengths</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {ranking && ranking.map((item, index) => (
                                    <tr key={item.model} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">#{index + 1}</td>
                                        <td className="px-6 py-4 text-sm font-medium capitalize text-slate-900 dark:text-white">{item.model}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 font-semibold">{item.score ? item.score.toFixed(1) : 'N/A'}/10</td>
                                        <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                                            High accuracy across all tests
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                {/* Analysis Text */}
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Judge's Detailed Critique</h3>
                        <button
                            onClick={() => generateDocument(detailed_analysis, `Judge_Analysis_${winner}`)}
                            className="text-sm px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            Download Report
                        </button>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
                        <AnalysisBlock text={detailed_analysis || "No detailed analysis available."} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JudgeResultsPage;