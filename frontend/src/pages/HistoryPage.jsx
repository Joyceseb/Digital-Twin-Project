import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import PageBackground from '../components/PageBackground';

const ArenaPage = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedBattle, setSelectedBattle] = useState(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch('http://127.0.0.1:8000/api/arena/stats/');
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const deleteBattle = async (timestamp) => {
        if (!window.confirm("Are you sure you want to delete this battle record?")) return;

        try {
            // Updated URL to ensure correctness
            const res = await fetch('http://127.0.0.1:8000/api/arena/delete/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ timestamp })
            });

            // Check if response is actually JSON
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                const data = await res.json();
                if (res.ok) {
                    setStats(data.stats);
                    if (selectedBattle && selectedBattle.timestamp === timestamp) {
                        setSelectedBattle(null);
                    }
                } else {
                    alert(data.error || "Failed to delete battle");
                }
            } else {
                // Not JSON (e.g., 404 HTML page)
                const text = await res.text();
                console.error("Non-JSON response:", text);
                alert(`Error: Server returned ${res.status} ${res.statusText}. Check console for details.`);
            }
        } catch (error) {
            console.error("Delete error:", error);
            alert("Error deleting battle");
        }
    };

    const COLORS = {
        openai: '#0C6475', // Pangea Teal
        mistral: '#4F3459', // Pangea Purple
    };

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center relative">
                <PageBackground variant="battle" />
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin z-10"></div>
            </div>
        );
    }

    return (
        <div className="h-full p-6 bg-slate-50 dark:bg-slate-950 overflow-y-auto relative">
            <PageBackground variant="battle" />
            <div className="max-w-6xl mx-auto space-y-8 relative z-10">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-pangea-dark dark:text-white flex items-center gap-3">
                            <span className="p-2 bg-pangea-purple/10 rounded-lg">
                                <svg className="w-8 h-8 text-pangea-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </span>
                            The Arena
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1 ml-14">
                            Battle logs and win rates from your model comparisons.
                        </p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <p className="text-xs text-slate-400 uppercase font-semibold">Total Battles</p>
                        <p className="text-2xl font-bold text-pangea-teal dark:text-white">{stats?.total_battles || 0}</p>
                    </div>
                </div>

                {/* Win Rate Chart - Improved Styling */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-pangea-teal"></div>
                    <h2 className="text-lg font-semibold text-pangea-dark dark:text-white mb-6">Champion Win Rates</h2>
                    <div className="h-64">
                        {stats?.win_rates?.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.win_rates} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                                    <YAxis hide />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                return (
                                                    <div className="bg-slate-800 text-white text-xs rounded-lg py-2 px-3 shadow-xl">
                                                        <p className="font-semibold mb-1 capitalize">{payload[0].payload.name}</p>
                                                        <p>Win Rate: <span className="font-bold text-pangea-teal-light">{payload[0].value}%</span></p>
                                                        <p className="text-slate-400 mt-1">{payload[0].payload.wins} Wins</p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Bar dataKey="percentage" radius={[4, 4, 0, 0]} barSize={60}>
                                        {stats.win_rates.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#CBD5E1'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-400">
                                No battles recorded yet.
                            </div>
                        )}
                    </div>
                </div>

                {/* Battle Log Table */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Battles</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Time</th>
                                    <th className="px-6 py-3 font-medium">Winner</th>
                                    <th className="px-6 py-3 font-medium">Scores (OpenAI / Mistral)</th>
                                    <th className="px-6 py-3 font-medium">Question</th>
                                    <th className="px-6 py-3 font-medium text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {stats?.history?.map((battle, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{battle.date}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${battle.winner === 'openai' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300'
                                                    : battle.winner === 'mistral' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300'
                                                        : 'bg-slate-100 text-slate-800'}
                      `}>
                                                {battle.winner}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-mono">
                                            {battle.scores?.openai || 0} / {battle.scores?.mistral || 0}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300 max-w-xs truncate" title={battle.question}>
                                            {battle.question}
                                        </td>
                                        <td className="px-6 py-4 text-right flex items-center justify-end gap-3">
                                            <button
                                                onClick={() => setSelectedBattle(battle)}
                                                className="text-xs font-medium text-pangea-teal hover:text-pangea-dark dark:hover:text-white transition-colors"
                                            >
                                                View Report
                                            </button>
                                            <button
                                                onClick={() => deleteBattle(battle.timestamp)}
                                                className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                                                title="Delete Battle"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {(!stats?.history || stats.history.length === 0) && (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-slate-400">
                                            No battles fought yet. Go to <a href="/compare" className="text-indigo-500 hover:underline">Compare</a> to start one!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Detail Modal */}
                {selectedBattle && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
                            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                                <h3 className="font-bold text-lg text-pangea-dark dark:text-white">Battle Report</h3>
                                <button onClick={() => setSelectedBattle(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                            <div className="p-6 overflow-y-auto space-y-6">
                                <div>
                                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Question</h4>
                                    <p className="text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 p-4 rounded-lg text-sm border border-slate-100 dark:border-slate-700">
                                        {selectedBattle.question}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800/50">
                                        <div className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-1">OpenAI Score</div>
                                        <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">{selectedBattle.scores?.openai}</div>
                                    </div>
                                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800/50">
                                        <div className="text-xs text-purple-600 dark:text-purple-400 font-semibold mb-1">Mistral Score</div>
                                        <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{selectedBattle.scores?.mistral}</div>
                                    </div>
                                </div>

                                {selectedBattle.dimensions && (
                                    <div>
                                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Score Breakdown</h4>
                                        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 overflow-hidden">
                                            <table className="w-full text-sm text-left">
                                                <thead className="bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400">
                                                    <tr>
                                                        <th className="px-4 py-2 font-medium">Metric</th>
                                                        <th className="px-4 py-2 font-medium text-indigo-600 dark:text-indigo-400">OpenAI</th>
                                                        <th className="px-4 py-2 font-medium text-purple-600 dark:text-purple-400">Mistral</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                                    {Object.keys(selectedBattle.dimensions.openai || {}).map(key => (
                                                        <tr key={key}>
                                                            <td className="px-4 py-2 capitalize font-medium text-slate-700 dark:text-slate-300">{key}</td>
                                                            <td className="px-4 py-2 text-indigo-600 dark:text-indigo-400">{selectedBattle.dimensions.openai[key]}</td>
                                                            <td className="px-4 py-2 text-purple-600 dark:text-purple-400">{selectedBattle.dimensions.mistral[key]}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Detailed Analysis</h4>
                                    <div className="prose prose-sm dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
                                        <pre className="whitespace-pre-wrap font-sans text-sm">{selectedBattle.detailed_analysis}</pre>
                                    </div>
                                </div>
                            </div>
                            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
                                <button
                                    onClick={() => setSelectedBattle(null)}
                                    className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                                >
                                    Close Report
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default ArenaPage;
