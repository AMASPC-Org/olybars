import React, { useState, useEffect } from 'react';
import {
    Settings, Bell, Zap, Percent, Clock, ChevronLeft,
    Save, Shield, Smartphone, Mail, Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserProfile, NotificationSettings } from '../../../types';
import { updateUserProfile } from '../../../services/userService';
import { useToast } from '../../../components/ui/BrandedToast';

interface SettingsScreenProps {
    userProfile: UserProfile;
    setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ userProfile, setUserProfile }) => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    // Initial state from profile or defaults
    const [notifs, setNotifs] = useState<NotificationSettings>(userProfile.notificationSettings || {
        allow_league_intel: true,
        allow_pulse_alerts: true,
        vibe_alive_alerts: true,
        favorite_deal_alerts: true,
        quiet_hours_start: "23:00",
        quiet_hours_end: "08:00"
    });

    const [smsOptIn, setSmsOptIn] = useState(userProfile.sms_opt_in ?? false);

    const handleSave = async () => {
        if (userProfile.uid === 'guest') {
            showToast("Settings saved locally (Guest Mode)", "info");
            setUserProfile(prev => ({ ...prev, notificationSettings: notifs, sms_opt_in: smsOptIn }));
            return;
        }

        setIsLoading(true);
        try {
            const updates = {
                notificationSettings: notifs,
                sms_opt_in: smsOptIn,
                updatedAt: Date.now()
            };
            const result = await updateUserProfile(userProfile.uid, updates);
            if (result.success) {
                setUserProfile(prev => ({ ...prev, ...result.updates }));
                showToast("Preferences Locked In!", "success");
            }
        } catch (e: any) {
            showToast(e.message || "Failed to update settings", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleNotif = (key: keyof NotificationSettings) => {
        if (typeof notifs[key] === 'boolean') {
            setNotifs(prev => ({ ...prev, [key]: !prev[key] }));
        }
    };

    return (
        <div className="min-h-screen bg-background text-white p-6 pb-24 font-body">
            <header className="flex justify-between items-center mb-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity uppercase font-black tracking-widest text-xs"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                </button>
                <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="bg-primary text-black px-6 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20 flex items-center gap-2 hover:bg-yellow-400 active:scale-95 transition-all"
                >
                    {isLoading ? <Zap className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                    Save Changes
                </button>
            </header>

            <div className="max-w-xl mx-auto space-y-8">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter font-league text-white leading-none">SYSTEM <span className="text-primary">SETTINGS</span></h1>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-2 px-1">Configure your Nightlife OS Experience</p>
                </div>

                {/* Notification Group */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 text-primary ml-1">
                        <Bell className="w-4 h-4" />
                        <h2 className="text-xs font-black uppercase tracking-widest font-league">Dispatch Preferences</h2>
                    </div>

                    <div className="bg-slate-900/50 border border-white/5 rounded-3xl overflow-hidden divide-y divide-white/5 shadow-xl">
                        {/* behavioral trigger 1 */}
                        <div className="p-5 flex items-center justify-between group hover:bg-white/[0.02] transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`p-2.5 rounded-xl transition-colors ${notifs.vibe_alive_alerts ? 'bg-primary/20 text-primary' : 'bg-slate-800 text-slate-500'}`}>
                                    <Zap className="w-5 h-5" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-black uppercase font-league">Tell me when the Vibe is Alive</p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Alerts for rapid Buzz growth & Packed status</p>
                                </div>
                            </div>
                            <button
                                onClick={() => toggleNotif('vibe_alive_alerts')}
                                className={`w-12 h-6 rounded-full p-1 transition-all ${notifs.vibe_alive_alerts ? 'bg-primary' : 'bg-slate-800'}`}
                            >
                                <div className={`w-4 h-4 rounded-full bg-white transition-all ${notifs.vibe_alive_alerts ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>

                        {/* behavioral trigger 2 */}
                        <div className="p-5 flex items-center justify-between group hover:bg-white/[0.02] transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`p-2.5 rounded-xl transition-colors ${notifs.favorite_deal_alerts ? 'bg-primary/20 text-primary' : 'bg-slate-800 text-slate-500'}`}>
                                    <Percent className="w-5 h-5" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-black uppercase font-league">Favorite Venue Deals</p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Alert me when a Favorite drops a Deal</p>
                                </div>
                            </div>
                            <button
                                onClick={() => toggleNotif('favorite_deal_alerts')}
                                className={`w-12 h-6 rounded-full p-1 transition-all ${notifs.favorite_deal_alerts ? 'bg-primary' : 'bg-slate-800'}`}
                            >
                                <div className={`w-4 h-4 rounded-full bg-white transition-all ${notifs.favorite_deal_alerts ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>

                        {/* League Intel */}
                        <div className="p-5 flex items-center justify-between group hover:bg-white/[0.02] transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`p-2.5 rounded-xl transition-colors ${notifs.allow_league_intel ? 'bg-primary/20 text-primary' : 'bg-slate-800 text-slate-500'}`}>
                                    <Shield className="w-5 h-5" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-black uppercase font-league">League Intelligence</p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Gameplay hints, event invites & level updates</p>
                                </div>
                            </div>
                            <button
                                onClick={() => toggleNotif('allow_league_intel')}
                                className={`w-12 h-6 rounded-full p-1 transition-all ${notifs.allow_league_intel ? 'bg-primary' : 'bg-slate-800'}`}
                            >
                                <div className={`w-4 h-4 rounded-full bg-white transition-all ${notifs.allow_league_intel ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>
                    </div>
                </section>

                {/* SMS Channel */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 text-primary ml-1">
                        <Smartphone className="w-4 h-4" />
                        <h2 className="text-xs font-black uppercase tracking-widest font-league">SMS Dispatch</h2>
                    </div>

                    <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-5 shadow-xl space-y-4">
                        <div className="flex items-center justify-between pb-4 border-b border-white/5">
                            <div className="space-y-1">
                                <p className="text-sm font-black uppercase font-league">SMS Notifications</p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Receive priority alerts via text message</p>
                            </div>
                            <button
                                onClick={() => setSmsOptIn(!smsOptIn)}
                                className={`w-12 h-6 rounded-full p-1 transition-all ${smsOptIn ? 'bg-primary' : 'bg-slate-800'}`}
                            >
                                <div className={`w-4 h-4 rounded-full bg-white transition-all ${smsOptIn ? 'translate-x-6' : 'translate-x-0'}`} />
                            </button>
                        </div>
                        <p className="text-[10px] text-slate-600 font-bold uppercase italic flex items-center gap-2">
                            <Info className="w-3 h-3" /> Msg & data rates may apply. SMS is reserved for "Flash Bounties" and emergency Vibe updates.
                        </p>
                    </div>
                </section>

                {/* Quiet Hours */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2 text-primary ml-1">
                        <Clock className="w-4 h-4" />
                        <h2 className="text-xs font-black uppercase tracking-widest font-league">Quiet Hours</h2>
                    </div>

                    <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-5 shadow-xl">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Do Not Disturb From</label>
                                <input
                                    type="time"
                                    value={notifs.quiet_hours_start}
                                    onChange={(e) => setNotifs(prev => ({ ...prev, quiet_hours_start: e.target.value }))}
                                    className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-sm font-bold text-white outline-none focus:border-primary/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase ml-1">Ends At</label>
                                <input
                                    type="time"
                                    value={notifs.quiet_hours_end}
                                    onChange={(e) => setNotifs(prev => ({ ...prev, quiet_hours_end: e.target.value }))}
                                    className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-4 text-sm font-bold text-white outline-none focus:border-primary/50"
                                />
                            </div>
                        </div>
                        <p className="text-[9px] text-slate-600 font-bold uppercase mt-4 text-center">Dispatch is automatically suspended during these hours.</p>
                    </div>
                </section>

                {/* Privacy Card */}
                <div className="pt-8 border-t border-white/5 text-center">
                    <p className="text-[10px] text-slate-700 font-bold uppercase tracking-[0.2em] mb-4">
                        OlyBars Ecosystem Privacy Protocol v1.2.0
                    </p>
                    <div className="flex justify-center gap-6">
                        <button onClick={() => navigate('/privacy')} className="text-[9px] font-black text-slate-500 uppercase hover:text-primary transition-colors">Privacy Policy</button>
                        <button onClick={() => navigate('/terms')} className="text-[9px] font-black text-slate-500 uppercase hover:text-primary transition-colors">Terms of Service</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsScreen;
