import React, { useState } from 'react';
import {
    Shield, Users, BarChart3, Settings,
    Search, Filter, ExternalLink, Activity,
    Database, AlertTriangle, CheckCircle2
} from 'lucide-react';

interface AdminDashboardScreenProps {
    userProfile: any;
}

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ userProfile }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'system'>('overview');

    const stats = [
        { label: 'Total Users', value: '1,284', icon: Users, color: 'text-blue-400' },
        { label: 'Active tonight', value: '142', icon: Activity, color: 'text-primary' },
        { label: 'Total Points', value: '8.4M', icon: Database, color: 'text-purple-400' },
        { label: 'System Health', value: '100%', icon: CheckCircle2, color: 'text-green-400' },
    ];

    return (
        <div className="min-h-screen bg-[#0f172a] text-white p-6 font-sans">
            {/* Header */}
            <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Shield className="w-5 h-5 text-primary" />
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">Global Admin</span>
                    </div>
                    <h1 className="text-3xl font-black font-league uppercase tracking-tight">System Dashboard</h1>
                </div>
                <div className="text-right">
                    <p className="text-sm font-bold text-white uppercase">{userProfile.handle || 'Ryan Admin'}</p>
                    <p className="text-[10px] text-slate-400 font-mono">SUPER-ADMIN PRIVILEGES</p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-slate-900/50 border border-white/5 p-4 rounded-2xl shadow-xl">
                        <div className="flex justify-between items-start mb-2">
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <p className="text-2xl font-black font-mono">{stat.value}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 bg-black/40 p-1 rounded-xl">
                {(['overview', 'users', 'system'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === tab
                                ? 'bg-primary text-black shadow-lg'
                                : 'text-slate-500 hover:text-white'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 min-h-[300px] shadow-2xl">
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-black font-league uppercase">Live Activity Loop</h2>
                            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-[10px] font-bold">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                Live
                            </span>
                        </div>

                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-black text-xs text-primary">
                                        U{i}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[11px] font-bold">User_{i} checked into <span className="text-primary">The Crypt</span></p>
                                        <p className="text-[9px] text-slate-500 font-medium">2 minutes ago • us-west1-a</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black font-mono text-green-400">+10pts</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button className="w-full py-4 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                            View All Insights <ExternalLink className="w-3 h-3" />
                        </button>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                        <Users className="w-12 h-12 mb-4 text-slate-600" />
                        <p className="text-sm font-bold uppercase tracking-widest">User Management</p>
                        <p className="text-[10px] text-slate-500">Feature locked for Super-Admin only</p>
                    </div>
                )}

                {activeTab === 'system' && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-black font-league uppercase">Infrastructure State</h2>
                        <div className="grid grid-cols-1 gap-2">
                            <div className="p-3 bg-black/20 border border-white/5 rounded-xl flex justify-between items-center">
                                <span className="text-[10px] font-bold uppercase">Cloud Run</span>
                                <span className="text-[10px] font-mono text-green-400">OPERATIONAL</span>
                            </div>
                            <div className="p-3 bg-black/20 border border-white/5 rounded-xl flex justify-between items-center">
                                <span className="text-[10px] font-bold uppercase">Firestore</span>
                                <span className="text-[10px] font-mono text-green-400">OPERATIONAL</span>
                            </div>
                            <div className="p-3 bg-black/20 border border-white/5 rounded-xl flex justify-between items-center">
                                <span className="text-[10px] font-bold uppercase">Gemini SDK</span>
                                <span className="text-[10px] font-mono text-green-400">READY</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-8 p-4 bg-amber-400/10 border border-amber-400/20 rounded-2xl flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                    <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">Audit Warning</p>
                    <p className="text-[11px] text-slate-300 font-medium">All admin actions are logged to Secret Manager and Cloud Audit. Proceed with League Integrity in mind.</p>
                </div>
            </div>
        </div>
    );
};
