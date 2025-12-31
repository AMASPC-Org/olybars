import React, { useEffect, useState } from 'react';
import { ArrowLeft, History, MapPin, Receipt, Sparkles, Trophy } from 'lucide-react';
import { fetchUserPointHistory } from '../../../services/userService';
import { ActivityLog } from '../../../types/user';
import { format } from 'date-fns';

interface PointHistoryScreenProps {
    onBack: () => void;
}

export const PointHistoryScreen: React.FC<PointHistoryScreenProps> = ({ onBack }) => {
    const [history, setHistory] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const data = await fetchUserPointHistory();
                setHistory(data);
            } catch (e) {
                console.error('Failed to load history:', e);
            } finally {
                setLoading(false);
            }
        };
        loadHistory();
    }, []);

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'check_in': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'vibe': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            case 'photo': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            case 'play': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        }
    };

    const getArtieNote = (item: ActivityLog) => {
        if (item.type === 'check_in') return "You clocked in and joined the Pulse! 🍻";
        if (item.type === 'vibe') return "Thanks for the heads-up on the vibe! 🕯️";
        if (item.type === 'play') return `Game on! Verified at ${item.metadata?.amenityName || 'the venue'}. 🎯`;
        if (item.type === 'photo') return "Visual proof! Your photo is rocking the feed. 📸";
        return "Great activity for the League! 🌟";
    };

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-[#020617]/80 backdrop-blur-md border-b border-slate-800 p-4 flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-slate-800 rounded-full transition-colors"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-amber-400" />
                    <h1 className="text-xl font-bold font-display tracking-tight">Point History</h1>
                </div>
            </div>

            <div className="p-4 max-w-2xl mx-auto space-y-6">
                {/* Stats Summary */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center space-y-1">
                        <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Season Points</span>
                        <div className="flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-amber-500" />
                            <span className="text-2xl font-bold text-white">
                                {history.reduce((acc, item) => acc + item.points, 0)}
                            </span>
                        </div>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center space-y-1">
                        <span className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Activities</span>
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-purple-400" />
                            <span className="text-2xl font-bold text-white">{history.length}</span>
                        </div>
                    </div>
                </div>

                {/* Timeline */}
                <div className="space-y-4">
                    <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest px-1">Your Activity Ledger</h2>

                    {loading ? (
                        <div className="py-12 flex flex-col items-center justify-center space-y-4">
                            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                            <p className="text-slate-400 animate-pulse">Consulting Artie's records...</p>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="py-12 text-center space-y-4">
                            <Receipt className="w-12 h-12 text-slate-700 mx-auto" />
                            <p className="text-slate-400">No point transactions found yet.<br />Go clock in and start earning!</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {history.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-slate-900/40 border border-slate-800/50 rounded-2xl p-4 hover:border-slate-700 transition-all group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Receipt className="w-12 h-12" />
                                    </div>

                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                                            <span>{format(item.timestamp, 'MMM d, h:mm a')}</span>
                                        </div>
                                        <div className="text-lg font-bold text-white">
                                            +{item.points} pts
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 mb-3">
                                        <div className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold border ${getTypeColor(item.type)}`}>
                                            {item.type.replace('_', ' ')}
                                        </div>
                                        {item.venueId && (
                                            <div className="flex items-center gap-1 text-sm text-amber-200/80 font-medium">
                                                <MapPin className="w-3.5 h-3.5" />
                                                <span>Venue ID: {item.venueId}</span>
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-slate-300 text-sm italic leading-relaxed">
                                        “{getArtieNote(item)}”
                                    </p>

                                    <div className="mt-3 pt-3 border-t border-slate-800/50 flex justify-between items-center">
                                        <span className="text-[10px] text-slate-600 font-mono">ID: {item.id.slice(0, 8)}</span>
                                        <div className="flex gap-2">
                                            {item.verificationMethod === 'qr' && (
                                                <div className="p-1 px-2 bg-amber-500/10 border border-amber-500/20 rounded-md text-[9px] text-amber-500 font-bold">
                                                    QR VERIFIED
                                                </div>
                                            )}
                                            {item.verificationMethod === 'gps' && (
                                                <div className="p-1 px-2 bg-blue-500/10 border border-blue-500/20 rounded-md text-[9px] text-blue-500 font-bold">
                                                    GPS VERIFIED
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
