import React, { useState } from 'react';
import {
    Shield, Users, BarChart3, Settings,
    Search, Filter, ExternalLink, Activity,
    Database, AlertTriangle, CheckCircle2, QrCode // Added QrCode
} from 'lucide-react';

import { fetchAllUsers, fetchSystemStats, fetchRecentActivity } from '../../../services/userService';
import { UserProfile, ActivityLog } from '../../../types';

interface AdminDashboardScreenProps {
    userProfile: any;
}

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ userProfile }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'league' | 'system'>('overview');
    const [systemStats, setSystemStats] = useState({ totalUsers: 0, activeUsers: 0, totalPoints: 0 });
    const [leagueUsers, setLeagueUsers] = useState<UserProfile[]>([]);
    const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    React.useEffect(() => {
        const loadDashboard = async () => {
            const stats = await fetchSystemStats();
            setSystemStats(stats);
            const users = await fetchAllUsers();
            setLeagueUsers(users);
            const activity = await fetchRecentActivity();
            setRecentActivity(activity);
        };
        loadDashboard();
    }, []);

    const filteredLeagueUsers = leagueUsers
        .filter(u => u.handle?.toLowerCase().includes(searchTerm.toLowerCase()) || u.uid.includes(searchTerm))
        .sort((a, b) => (b.stats?.seasonPoints || 0) - (a.stats?.seasonPoints || 0));

    const stats = [
        { label: 'Total Users', value: systemStats.totalUsers.toLocaleString(), icon: Users, color: 'text-blue-400' },
        { label: 'Active Users', value: systemStats.activeUsers.toString(), icon: Activity, color: 'text-primary' },
        { label: 'Total Points', value: systemStats.totalPoints.toLocaleString(), icon: Database, color: 'text-purple-400' },
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
            <div className="flex gap-2 mb-6 bg-black/40 p-1 rounded-xl overflow-x-auto">
                {(['overview', 'users', 'league', 'system'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-2 px-4 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all whitespace-nowrap ${activeTab === tab
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

                        <div className="space-y-2">
                            {recentActivity.length === 0 ? (
                                <div className="text-center py-10 opacity-50">
                                    <p className="text-xs uppercase tracking-widest">No recent activity found.</p>
                                </div>
                            ) : (
                                recentActivity.map((log) => (
                                    <div key={log.id} className="flex justify-between items-center bg-black/20 p-3 rounded-lg border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${log.verificationMethod === 'qr' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-slate-700/50 text-slate-400'}`}>
                                                {log.verificationMethod === 'qr' ? <QrCode className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-white uppercase">{log.type.replace('_', ' ')}</p>
                                                <p className="text-[10px] text-slate-500 font-mono">
                                                    User: {log.userId.substring(0, 6)}... {log.venueId ? `@ ${log.venueId}` : ''}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                {log.verificationMethod === 'qr' && (
                                                    <span className="text-[9px] font-black bg-yellow-500 text-black px-1.5 rounded uppercase">Verified</span>
                                                )}
                                                <span className="text-primary font-black font-mono text-xs">+{log.points}</span>
                                            </div>
                                            <p className="text-[9px] text-slate-600">{new Date(log.timestamp).toLocaleTimeString()}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                        <Users className="w-12 h-12 mb-4 text-slate-600" />
                        <p className="text-sm font-bold uppercase tracking-widest">User Management</p>
                        <p className="text-[10px] text-slate-500">System Role Management (Coming Soon)</p>
                    </div>
                )}

                {activeTab === 'league' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-white/5">
                            <h2 className="text-lg font-black font-league uppercase">League Roster</h2>
                            <div className="relative">
                                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Find Member..."
                                    className="bg-slate-800 border-none rounded-lg py-2 pl-9 pr-4 text-xs font-bold text-white focus:ring-1 focus:ring-primary outline-none"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-[9px] text-slate-500 uppercase tracking-widest border-b border-white/10">
                                        <th className="p-3">Rank</th>
                                        <th className="p-3">Handle</th>
                                        <th className="p-3 text-right">Points</th>
                                        <th className="p-3 text-right">Role</th>
                                        <th className="p-3 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredLeagueUsers.map((user, idx) => (
                                        <tr key={user.uid} className="hover:bg-white/5 transition-colors">
                                            <td className="p-3 font-mono font-bold text-slate-400">#{idx + 1}</td>
                                            <td className="p-3 font-bold text-white">{user.handle || 'Unknown'}</td>
                                            <td className="p-3 text-right font-mono text-primary font-black">
                                                {(user.stats?.seasonPoints || 0).toLocaleString()}
                                            </td>
                                            <td className="p-3 text-right text-[10px] uppercase font-bold text-slate-500">
                                                {user.role}
                                            </td>
                                            <td className="p-3 text-center">
                                                <div className={`w-2 h-2 rounded-full mx-auto ${user.role !== 'guest' ? 'bg-green-500' : 'bg-slate-700'}`} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredLeagueUsers.length === 0 && (
                                <div className="text-center py-8 text-slate-500 text-xs uppercase">No members found</div>
                            )}
                        </div>
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
                            {/* <div className="p-3 bg-black/20 border border-white/5 rounded-xl flex justify-between items-center">
                                <span className="text-[10px] font-bold uppercase">Gemini SDK</span>
                                <span className="text-[10px] font-mono text-green-400">READY</span>
                             </div> */}
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
