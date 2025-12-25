import React, { useState, useEffect } from 'react';
import { Activity, Shield, Bot, Globe } from 'lucide-react';

interface AiLog {
    id: string;
    botName: string;
    resource: string;
    timestamp: string;
    method: string;
    ip: string;
}

export const AiAccessTab: React.FC = () => {
    const [logs, setLogs] = useState<AiLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/ai/access-logs`);
                const data = await response.json();
                setLogs(data);
            } catch (error) {
                console.error('Failed to fetch AI logs:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-white/5">
                <h2 className="text-lg font-black font-league uppercase">AI Crawler Intelligence</h2>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                    Tracking Live
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-black/20 border border-white/5 p-4 rounded-xl flex items-center gap-4">
                    <Bot className="w-6 h-6 text-blue-400" />
                    <div>
                        <div className="text-[10px] text-slate-500 uppercase font-black">Bots Seen</div>
                        <div className="text-xl font-league text-white font-black">{new Set(logs.map(l => l.botName)).size}</div>
                    </div>
                </div>
                <div className="bg-black/20 border border-white/5 p-4 rounded-xl flex items-center gap-4">
                    <Globe className="w-6 h-6 text-purple-400" />
                    <div>
                        <div className="text-[10px] text-slate-500 uppercase font-black">Unique Paths</div>
                        <div className="text-xl font-league text-white font-black">{new Set(logs.map(l => l.resource)).size}</div>
                    </div>
                </div>
                <div className="bg-black/20 border border-white/5 p-4 rounded-xl flex items-center gap-4">
                    <Shield className="w-6 h-6 text-green-400" />
                    <div>
                        <div className="text-[10px] text-slate-500 uppercase font-black">Audit Status</div>
                        <div className="text-xl font-league text-white font-black uppercase">Secure</div>
                    </div>
                </div>
            </div>

            {/* Access Log Table */}
            <div className="bg-black/20 border border-white/5 rounded-xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-white/10">
                            <tr>
                                <th className="px-6 py-4">Bot Agent</th>
                                <th className="px-6 py-4">Resource</th>
                                <th className="px-6 py-4">Time (Local)</th>
                                <th className="px-6 py-4 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 font-mono text-xs">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500 italic">
                                        Querying the Artesian bot logs...
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500 uppercase tracking-widest text-[10px]">
                                        No machine agent activity found in current audit window.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr
                                        key={log.id}
                                        className="hover:bg-white/5 transition-colors group"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-amber-500 font-bold">{log.botName}</span>
                                        </td>
                                        <td className="px-6 py-4 truncate max-w-xs text-slate-400">
                                            {log.resource}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 text-[10px] tabular-nums">
                                            {new Date(log.timestamp).toLocaleTimeString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[9px] font-black rounded border border-green-500/20 uppercase tracking-tighter">
                                                Audit Logged
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
