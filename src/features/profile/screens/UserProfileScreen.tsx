import React, { useState, useEffect } from 'react';
import {
    User, Mail, Smartphone, Beer, Home, Trophy, Shield,
    Settings, Save, Lock, ChevronRight, Info, AlertTriangle,
    History, LogOut, CheckCircle2, X, Zap
} from 'lucide-react';
import { UserProfile, UserRole, Venue } from '../../../types';
import { updatePassword, updateEmail } from 'firebase/auth';
import { auth } from '../../../lib/firebase';
import { updateUserProfile } from '../../../services/userService';

interface UserProfileScreenProps {
    userProfile: UserProfile;
    setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
    venues: Venue[];
}

const UserProfileScreen: React.FC<UserProfileScreenProps> = ({ userProfile, setUserProfile, venues }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'league'>('overview');

    // Form State
    const [handle, setHandle] = useState(userProfile.handle || '');
    const [email, setEmail] = useState(userProfile.email || '');
    const [phone, setPhone] = useState(userProfile.phone || '');
    const [favoriteDrinks, setFavoriteDrinks] = useState<string[]>(userProfile.favoriteDrinks || (userProfile.favoriteDrink ? [userProfile.favoriteDrink] : []));
    const [weeklyBuzz, setWeeklyBuzz] = useState(userProfile.weeklyBuzz ?? false);
    const [homeBase, setHomeBase] = useState(userProfile.homeBase || '');
    const [newPassword, setNewPassword] = useState('');

    const [leaguePrefs, setLeaguePrefs] = useState<string[]>(userProfile.leaguePreferences || ['karaoke', 'trivia', 'arcade', 'live_music']);

    const isSuperAdmin = userProfile.role === 'super-admin' || userProfile.email === 'ryan@amaspc.com';

    // Handle Change Logic
    const lastChanged = userProfile.handleLastChanged || 0;
    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
    const cooldownActive = (Date.now() - lastChanged) < thirtyDaysInMs;
    const daysRemaining = Math.ceil((thirtyDaysInMs - (Date.now() - lastChanged)) / (24 * 60 * 60 * 1000));

    const handleRoleSwitch = (newRole: UserRole) => {
        setUserProfile(prev => ({ ...prev, role: newRole }));
        alert(`View Switched to: ${newRole.toUpperCase()}`);
    }

    const handleSaveProfile = async () => {
        setIsLoading(true);
        try {
            const updates: any = {
                phone,
                favoriteDrinks,
                weeklyBuzz,
                leaguePreferences: leaguePrefs,
                updatedAt: Date.now(),
            };

            // Handle change logic
            if (handle !== userProfile.handle) {
                if (cooldownActive && !isSuperAdmin) {
                    throw new Error(`Handle change locked! Wait ${daysRemaining} more days.`);
                }
                updates.handle = handle;
                updates.handleLastChanged = Date.now();
            }

            // 1. Update Profile via Backend
            const result = await updateUserProfile(userProfile.uid, updates);

            if (!result.success) throw new Error(result.error || "Update failed");

            // 2. Update Auth (Sensitive)
            if (email !== userProfile.email && auth.currentUser) {
                await updateEmail(auth.currentUser, email);
                updates.email = email;
            }
            if (newPassword && auth.currentUser) {
                await updatePassword(auth.currentUser, newPassword);
                setNewPassword('');
            }

            // 3. Update Local State (with server-confirmed updates)
            setUserProfile(prev => ({ ...prev, ...result.updates }));
            setIsEditing(false);
            alert("Profile Optimized!");
        } catch (e: any) {
            alert(e.message);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleLeaguePref = (prefId: string) => {
        setLeaguePrefs(prev =>
            prev.includes(prefId) ? prev.filter(p => p !== prefId) : [...prev, prefId]
        );
    };

    return (
        <div className="min-h-screen bg-background text-white pb-32">
            {/* Premium Header */}
            <div className="relative h-48 bg-slate-900 border-b border-white/10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-60" />
                <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />

                <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-slate-800 rounded-2xl border-4 border-background overflow-hidden relative group">
                            <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                                <User className="w-10 h-10" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-3xl font-black uppercase tracking-tighter font-league">
                                {userProfile.handle || 'Legend'}
                            </h1>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded">
                                    {userProfile.role.replace('-', ' ')}
                                </span>
                                <span className="text-[10px] font-bold text-slate-500 uppercase">Season Rank: #42</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs font-bold text-slate-500 uppercase mb-1">League Points</p>
                        <p className="text-3xl font-black font-mono text-white">
                            {(userProfile.stats?.seasonPoints || 0).toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Super-Admin Switcher */}
            {isSuperAdmin && (
                <div className="m-6 p-4 bg-primary/5 border-2 border-primary/20 rounded-2xl">
                    <div className="flex items-center gap-2 mb-3">
                        <Shield className="w-4 h-4 text-primary" />
                        <span className="text-xs font-black uppercase tracking-widest text-primary font-league">View Mode Switcher</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                        {(['admin', 'owner', 'manager', 'user'] as UserRole[]).map((role) => (
                            <button
                                key={role}
                                onClick={() => handleRoleSwitch(role)}
                                className={`py-2 px-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${userProfile.role === role
                                    ? 'bg-primary text-black border-primary'
                                    : 'bg-white/5 text-slate-400 border-white/10'
                                    }`}
                            >
                                {role}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex px-6 border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-10">
                {(['overview', 'settings', 'league'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-slate-500'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="p-6 space-y-8">
                {activeTab === 'overview' && (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-surface p-4 rounded-2xl border border-white/5 shadow-xl">
                            <History className="w-5 h-5 text-blue-400 mb-3" />
                            <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Check-ins</p>
                            <p className="text-2xl font-black font-league">{userProfile.stats?.lifetimeCheckins || 0}</p>
                        </div>
                        <div className="bg-surface p-4 rounded-2xl border border-white/5 shadow-xl">
                            <Zap className="w-5 h-5 text-yellow-400 mb-3" />
                            <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Streak</p>
                            <p className="text-2xl font-black font-league">{userProfile.stats?.currentStreak || 0}D</p>
                        </div>

                        {/* Vibe Profile Card */}
                        <div className="col-span-2 bg-gradient-to-br from-slate-900 to-black p-6 rounded-3xl border border-white/10 relative overflow-hidden">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-xl font-black uppercase tracking-tight font-league">Vibe Profile</h3>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Favorite Spots & Sips</p>
                                </div>
                                <button onClick={() => { setActiveTab('settings'); setIsEditing(true); }} className="p-2 bg-white/5 rounded-lg hover:bg-white/10">
                                    <Settings className="w-4 h-4 text-slate-400" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                        <Beer className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-500 uppercase">Drink Choices</p>
                                        <p className="text-sm font-black uppercase font-league">
                                            {favoriteDrinks.length > 0 ? favoriteDrinks.join(', ') : 'Not Set'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                                        <Home className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-500 uppercase">Home Base</p>
                                        <p className="text-sm font-black uppercase font-league">
                                            {venues.find(v => v.id === userProfile.homeBase)?.name || 'Not Set'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-black uppercase tracking-tight font-league">Profile Intel</h3>
                            <button
                                onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                                disabled={isLoading}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${isEditing ? 'bg-primary text-black' : 'bg-white/5 text-slate-400'}`}
                            >
                                {isLoading ? <Zap className="w-4 h-4 animate-spin" /> : isEditing ? <Save className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
                                {isEditing ? 'Sync Changes' : 'Edit Profile'}
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Handle Field with 30-Day Logic */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1">League Handle</label>
                                    {cooldownActive && !isSuperAdmin && (
                                        <div className="flex items-center gap-1 text-[9px] font-bold text-primary uppercase">
                                            <Lock className="w-3 h-3" /> Lock: {daysRemaining}D
                                        </div>
                                    )}
                                </div>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                                        <span className="font-league font-black text-lg">#</span>
                                    </div>
                                    <input
                                        type="text"
                                        value={handle}
                                        onChange={(e) => setHandle(e.target.value)}
                                        disabled={!isEditing || (cooldownActive && !isSuperAdmin)}
                                        className={`w-full bg-slate-900 border ${isEditing && (!cooldownActive || isSuperAdmin) ? 'border-primary' : 'border-white/5'} rounded-2xl py-4 pl-10 pr-4 text-sm font-black uppercase font-league outline-none disabled:opacity-50`}
                                    />
                                    {isEditing && cooldownActive && !isSuperAdmin && (
                                        <div className="absolute -bottom-6 left-0 text-[9px] text-primary font-bold uppercase flex items-center gap-1">
                                            <Info className="w-3 h-3" /> Handles can only be optimized once every 30 days.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Email & Phone */}
                            <div className="grid grid-cols-1 gap-4 pt-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Secure Contact (Email)</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            disabled={!isEditing}
                                            className="w-full bg-slate-900 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold outline-none disabled:opacity-50"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Dispatch Line (Phone)</label>
                                    <div className="relative">
                                        <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            disabled={!isEditing}
                                            placeholder="555-555-5555"
                                            className="w-full bg-slate-900 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold outline-none disabled:opacity-50 font-mono"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 pt-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Preferred Sips (Comma Separated)</label>
                                    <div className="relative">
                                        <Beer className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input
                                            type="text"
                                            value={favoriteDrinks.join(', ')}
                                            onChange={(e) => setFavoriteDrinks(e.target.value.split(',').map(s => s.trim()).filter(s => s !== ''))}
                                            disabled={!isEditing}
                                            placeholder="Old Fashioned, Well 80, Cider..."
                                            className="w-full bg-slate-900 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-black uppercase font-league outline-none disabled:opacity-50"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/5">
                                <div className="flex items-center justify-between bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <Zap className={`w-5 h-5 ${weeklyBuzz ? 'text-primary' : 'text-slate-600'}`} />
                                        <div>
                                            <p className="text-xs font-black uppercase font-league">Weekly Buzz Signup</p>
                                            <p className="text-[9px] text-slate-500 font-bold uppercase">The best of Oly in your inbox</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => isEditing && setWeeklyBuzz(!weeklyBuzz)}
                                        disabled={!isEditing}
                                        className={`w-12 h-6 rounded-full p-1 transition-all ${weeklyBuzz ? 'bg-primary' : 'bg-slate-800'}`}
                                    >
                                        <div className={`w-4 h-4 rounded-full bg-white transition-all ${weeklyBuzz ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </button>
                                </div>
                            </div>

                            {/* Password Management */}
                            {isEditing && (
                                <div className="pt-6 mt-6 border-t border-white/5 space-y-4">
                                    <div className="flex items-center gap-2 text-primary">
                                        <Lock className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase">Security Update</span>
                                    </div>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Set New League Password"
                                        className="w-full bg-slate-900 border border-primary/30 rounded-2xl py-4 px-4 text-sm font-bold outline-none"
                                    />
                                    <p className="text-[9px] text-slate-500 font-bold uppercase italic">Leave blank to keep your current access key.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'league' && (
                    <div className="space-y-8">
                        <header>
                            <h3 className="text-2xl font-black uppercase tracking-tighter font-league">League Commissions</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Control your active participation</p>
                        </header>

                        <div className="space-y-4">
                            {[
                                { id: 'karaoke', label: 'Karaoke League', icon: '🎤', desc: 'Sync with Tuesday/Thursday stage times' },
                                { id: 'trivia', label: 'Trivia Knights', icon: '🧠', desc: 'Aggregate scores across venues' },
                                { id: 'live_music', label: 'Live Pulse', icon: '🎸', desc: 'Notifications for local bands' },
                            ].map(league => (
                                <div key={league.id} className="bg-surface p-6 rounded-3xl border border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="text-3xl">{league.icon}</div>
                                        <div>
                                            <h4 className="text-lg font-black uppercase font-league tracking-wide leading-none">{league.label}</h4>
                                            <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase">{league.desc}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => toggleLeaguePref(league.id)}
                                        className={`w-12 h-6 rounded-full p-1 transition-all ${leaguePrefs.includes(league.id) ? 'bg-primary' : 'bg-slate-800'}`}
                                    >
                                        <div className={`w-4 h-4 rounded-full bg-white transition-all ${leaguePrefs.includes(league.id) ? 'translate-x-6' : 'translate-x-0'}`} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleSaveProfile}
                            className="w-full bg-primary text-black font-black py-4 rounded-2xl uppercase tracking-widest text-lg font-league shadow-2xl shadow-primary/20"
                        >
                            Sync Preferences
                        </button>
                    </div>
                )}
            </div>

            {/* Wipe Data Option */}
            <div className="px-6 mt-12">
                <button
                    onClick={() => {
                        if (confirm("THIS WILL WIPE YOUR LEAGUE DATA. ARE YOU SURE?")) {
                            localStorage.clear();
                            window.location.href = '/';
                        }
                    }}
                    className="w-full flex items-center justify-center gap-3 p-4 bg-red-500/5 border border-red-500/20 text-red-500 font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-red-500/10"
                >
                    <LogOut className="w-4 h-4" />
                    Retire League Account
                </button>
            </div>
        </div>
    );
};

export default UserProfileScreen;
