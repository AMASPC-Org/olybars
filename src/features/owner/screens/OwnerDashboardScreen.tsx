import React, { useState } from 'react';
import {
    Beer, Settings, HelpCircle, X, Trophy, Users, Smartphone, Zap, Plus, Minus, Shield, ChevronRight, Info,
    QrCode, Download, Printer
} from 'lucide-react';
import { Venue, UserProfile } from '../../../types';
import { OwnerMarketingPromotions } from '../../../components/OwnerMarketingPromotions';
import { useToast } from '../../../components/ui/BrandedToast';
import { ListingManagementTab } from '../components/ListingManagementTab';
import { LocalMakerManagementTab } from '../components/LocalMakerManagementTab'; // New Component
import { LeagueHostManagementTab } from '../components/LeagueHostManagementTab'; // New Component
import { isVenueOwner } from '../../../types/auth_schema';
import { Layout } from 'lucide-react';

interface OwnerDashboardProps {
    isOpen: boolean;
    onClose: () => void;
    venues: Venue[];
    updateVenue: (venueId: string, updates: Partial<Venue>) => void;
    userProfile: UserProfile;
    initialVenueId?: string | null;
    initialView?: 'main' | 'marketing' | 'listing';
}

const WEEKLY_STATS = { totalCheckIns: 142, newMembers: 18, returnRate: "34%", topNights: "Fri, Sat" };
const TOP_PLAYERS = [
    { rank: 1, handle: "BarFly_99", visits: 4 }, { rank: 2, handle: "TriviaKing", visits: 3 },
    { rank: 3, handle: "PNW_Hiker", visits: 3 }, { rank: 4, handle: "OlyOlyOxen", visits: 2 },
];
const DEAL_PRESETS = ["$1 Off Drafts", "$5 Well Drinks", "Half-Price Apps", "BOGO Burgers", "Industry Night"];

const calculatePulseScore = (venue: Venue): number => {
    let score = 50;
    switch (venue.status) {
        case 'buzzing': score += 30; break;
        case 'lively': score += 15; break;
        case 'chill': score += 5; break;
    }
    if (venue.deal) score += 10;
    if (venue.leagueEvent) score += 10;
    score += (venue.checkIns || 0) * 1.5;
    return Math.min(Math.round(score), 100);
};

export const OwnerDashboardScreen: React.FC<OwnerDashboardProps> = ({
    isOpen, onClose, venues, updateVenue, userProfile,
    initialVenueId, initialView = 'main'
}) => {
    const accessibleVenues = venues.filter(v => {
        if (userProfile.role === 'admin' || userProfile.role === 'super-admin') return true;
        if (userProfile.role === 'owner' && v.ownerId === userProfile.uid) return true;
        if (userProfile.role === 'manager' && v.managerIds?.includes(userProfile.uid)) return true;
        return false;
    });

    const [selectedVenueId, setSelectedVenueId] = useState<string | null>(initialVenueId || null);

    // Effect to auto-select first venue if none selected
    React.useEffect(() => {
        if (!selectedVenueId && accessibleVenues.length > 0) {
            setSelectedVenueId(accessibleVenues[0].id);
        }
    }, [accessibleVenues, selectedVenueId]);

    const myVenue = accessibleVenues.find(v => v.id === selectedVenueId) || accessibleVenues[0];

    // Gatekeeper Notice State (Session based for demo simplicity)
    const [showWelcome, setShowWelcome] = useState(true);

    const [dealText, setDealText] = useState('');
    const [dealDuration, setDealDuration] = useState(60);
    const [showArtieCommands, setShowArtieCommands] = useState(false);
    const [dashboardView, setDashboardView] = useState<'main' | 'marketing' | 'listing' | 'maker' | 'host' | 'qr'>(initialView as any); // Added 'host', 'qr'
    const [statsPeriod, setStatsPeriod] = useState<'day' | 'week' | 'month' | 'year'>('week');
    const [activityStats, setActivityStats] = useState({ earned: 0, redeemed: 0, activeUsers: 0 });
    const [isRefreshing, setIsRefreshing] = useState(false);
    const { showToast } = useToast();

    React.useEffect(() => {
        if (isOpen) {
            if (initialVenueId) setSelectedVenueId(initialVenueId);
            if (initialView) setDashboardView(initialView);
        }
    }, [isOpen, initialVenueId, initialView]);

    React.useEffect(() => {
        if (dashboardView === 'marketing' && myVenue) {
            refreshStats();
        }
    }, [dashboardView, statsPeriod, myVenue?.id]);

    const refreshStats = async () => {
        if (!myVenue) return;
        setIsRefreshing(true);
        const { fetchActivityStats } = await import('../../../services/userService');
        const stats = await fetchActivityStats(myVenue.id, statsPeriod);
        setActivityStats(stats);
        setIsRefreshing(false);
    };

    const handleTogglePhotoApproval = async (photoId: string, field: 'isApprovedForFeed' | 'isApprovedForSocial', currentVal: boolean) => {
        if (!myVenue) return;
        const { updatePhotoApproval } = await import('../../../services/userService');
        try {
            await updatePhotoApproval(myVenue.id, photoId, { [field]: !currentVal });
            updateVenue(myVenue.id, {
                photos: myVenue.photos?.map(p => p.id === photoId ? { ...p, [field]: !currentVal } : p)
            });
        } catch (e) {
            showToast("Failed to update photo status.", 'error');
        }
    };

    if (!isOpen) return null;
    if (!myVenue && accessibleVenues.length === 0) {
        return (
            <div className="fixed inset-0 z-[80] bg-background text-white flex flex-col items-center justify-center p-6">
                <Shield className="w-16 h-16 text-red-500 mb-4" />
                <h2 className="text-xl font-bold uppercase">Access Denied</h2>
                <p className="text-slate-400 text-center mt-2 max-w-xs">Your account does not have management permissions for any active venues.</p>
                <button onClick={onClose} className="mt-8 bg-slate-800 px-6 py-2 rounded-md font-bold uppercase">Back to Pulse</button>
            </div>
        );
    }

    const handlePublishDeal = () => {
        if (!dealText || !myVenue) return;
        updateVenue(myVenue.id, { deal: dealText, dealEndsIn: dealDuration });
        setDealText('');
        showToast('FLASH DEAL BROADCASTED TO NETWORK', 'success');
    };

    const clearDeal = () => {
        if (!myVenue) return;
        updateVenue(myVenue.id, { deal: undefined, dealEndsIn: 0 });
    }

    const adjustCheckIns = (delta: number) => {
        if (!myVenue) return;
        const newCount = Math.max(0, myVenue.checkIns + delta);
        updateVenue(myVenue.id, { checkIns: newCount });
    };

    return (
        <div className="fixed inset-0 z-[80] bg-[#0f172a] text-white flex flex-col animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex justify-between items-start shrink-0 bg-black">
                <div className="flex items-center gap-4">
                    <div className="bg-primary p-3 rounded-lg border border-white/20">
                        <Beer className="w-8 h-8 text-black" strokeWidth={2.5} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter font-league leading-none">
                                THE BREW HOUSE
                            </h2>
                            <HelpCircle className="w-4 h-4 text-slate-500" />
                        </div>
                        <div className="flex flex-col mt-1">
                            {accessibleVenues.length > 1 ? (
                                <div className="relative inline-block">
                                    <select
                                        value={selectedVenueId || ''}
                                        onChange={(e) => setSelectedVenueId(e.target.value)}
                                        className="bg-transparent text-primary text-xs font-black uppercase tracking-widest outline-none appearance-none pr-6 cursor-pointer font-league"
                                    >
                                        {accessibleVenues.map(v => (
                                            <option key={v.id} value={v.id} className="bg-[#0f172a]">{v.name}</option>
                                        ))}
                                    </select>
                                    <ChevronRight className="w-3 h-3 text-primary absolute right-0 top-1 rotate-90 pointer-events-none" />
                                </div>
                            ) : (
                                <p className="text-xs text-primary font-black uppercase tracking-widest font-league">
                                    ADMIN: {myVenue?.name}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                    <X className="w-10 h-10" strokeWidth={4} />
                </button>
            </div>

            {/* Gatekeeper Welcome Notice */}
            {showWelcome && (
                <div className="bg-blue-900/20 border-b border-blue-500/20 p-4 relative animate-in fade-in slide-in-from-top-2">
                    <div className="flex gap-4 items-start max-w-4xl mx-auto">
                        <Info className="w-6 h-6 text-blue-400 shrink-0 mt-1" />
                        <div>
                            <h4 className="text-blue-400 font-black uppercase tracking-widest text-sm mb-1">Welcome to The Brew House</h4>
                            <p className="text-slate-300 text-xs leading-relaxed">
                                This is where the 98501 League is crafted.
                                <span className="block mt-2 text-slate-400">
                                    <strong>Note:</strong> League Host tools and Local Maker designations are gated features.
                                    To activate these for your venue, click the "Request Activation" button in your settings.
                                    The Commish manually vets all hosts to ensure we maintain the quality of the Artesian Anchor network.
                                </span>
                            </p>
                        </div>
                        <button onClick={() => setShowWelcome(false)} className="ml-auto text-slate-500 hover:text-white">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex bg-black px-4 border-b border-white/5">
                <button
                    onClick={() => setDashboardView('main')}
                    className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${dashboardView === 'main' ? 'text-primary border-b-2 border-primary' : 'text-slate-500'}`}
                >
                    Operations
                </button>
                <button
                    onClick={() => setDashboardView('marketing')}
                    className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${dashboardView === 'marketing' ? 'text-primary border-b-2 border-primary' : 'text-slate-500'}`}
                >
                    Marketing
                </button>
                <button
                    onClick={() => setDashboardView('listing')}
                    className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${dashboardView === 'listing' ? 'text-primary border-b-2 border-primary' : 'text-slate-500'}`}
                >
                    Listing
                </button>
                {myVenue && isVenueOwner(userProfile, myVenue.id) && (
                    <>
                        {/* Only show Maker tab if they are already active or verified */}
                        {(myVenue.isLocalMaker || myVenue.isVerifiedMaker) && (
                            <button
                                onClick={() => setDashboardView('maker')}
                                className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${dashboardView === 'maker' ? 'text-primary border-b-2 border-primary' : 'text-slate-500'}`}
                            >
                                Maker
                            </button>
                        )}
                        <button
                            onClick={() => setDashboardView('host')}
                            className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${dashboardView === 'host' ? 'text-primary border-b-2 border-primary' : 'text-slate-500'}`}
                        >
                            League
                        </button>
                        <button
                            onClick={() => setDashboardView('qr')}
                            className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${dashboardView === 'qr' ? 'text-primary border-b-2 border-primary' : 'text-slate-500'}`}
                        >
                            QR Assets
                        </button>
                    </>
                )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-8 p-6 pb-24 scrollbar-hide">
                {myVenue && dashboardView === 'main' && (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-surface p-4 border border-white/10 rounded-lg shadow-xl">
                                <p className="text-[10px] uppercase font-black text-slate-500 mb-1 font-league">Live Check-ins</p>
                                <p className="text-4xl font-black text-white font-league">{myVenue.checkIns || 0}</p>
                            </div>
                            <div className="bg-surface p-4 border border-white/10 rounded-lg shadow-xl">
                                <p className="text-[10px] uppercase font-black text-slate-500 mb-1 font-league">Live Vibe</p>
                                <p className={`text-2xl font-black uppercase font-league leading-none mt-1 ${myVenue.status === 'buzzing' ? 'text-red-500' : 'text-primary'}`}>
                                    {myVenue.status.toUpperCase()}
                                </p>
                            </div>
                        </div>

                        {/* Manual Override Console */}
                        <div className="bg-surface p-6 border border-white/10 rounded-lg shadow-2xl">
                            <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-widest font-league mb-4">Manual Headcount Adjust</h3>
                            <div className="flex items-center justify-between">
                                <button onClick={() => adjustCheckIns(-1)} className="w-14 h-14 flex items-center justify-center bg-black border border-white/10 text-white rounded-lg active:scale-95">
                                    <Minus className="w-8 h-8" />
                                </button>
                                <p className="text-5xl font-black text-white font-league">{myVenue.checkIns || 0}</p>
                                <button onClick={() => adjustCheckIns(1)} className="w-14 h-14 flex items-center justify-center bg-primary text-black rounded-lg active:scale-95">
                                    <Plus className="w-8 h-8" />
                                </button>
                            </div>
                        </div>

                        {/* Flash Deal Section */}
                        <div className="bg-surface p-6 border border-white/10 border-dashed rounded-lg shadow-2xl relative">
                            <div className="absolute -top-4 left-6 bg-[#0f172a] border border-primary px-3 py-1 flex items-center gap-2 rounded-md">
                                <Zap className="w-4 h-4 text-primary fill-current" />
                                <span className="text-primary text-[10px] font-black uppercase tracking-widest font-league">QUICK FLASH DEAL</span>
                            </div>

                            {myVenue.deal ? (
                                <div className="text-center py-4">
                                    <h4 className="text-2xl font-black text-white mb-1 font-league uppercase">{myVenue.deal}</h4>
                                    <p className="text-primary font-black mb-6 font-league">{myVenue.dealEndsIn}M REMAINING</p>
                                    <button onClick={clearDeal} className="w-full bg-red-600 text-white py-3 rounded-lg font-black uppercase tracking-widest">Terminate</button>
                                </div>
                            ) : (
                                <div className="space-y-4 pt-4">
                                    <input
                                        type="text"
                                        value={dealText}
                                        onChange={(e) => setDealText(e.target.value)}
                                        placeholder="EX: $5 DRAFTS..."
                                        className="w-full bg-black border border-white/10 rounded-lg p-4 text-primary font-black placeholder:text-slate-800 outline-none font-league"
                                    />
                                    <div className="flex gap-2 overflow-x-auto pb-2">
                                        {DEAL_PRESETS.map(preset => (
                                            <button key={preset} onClick={() => setDealText(preset)} className="px-4 py-1.5 bg-black border border-white/10 rounded-full text-[10px] font-black text-slate-500 uppercase font-league whitespace-nowrap">{preset}</button>
                                        ))}
                                    </div>
                                    <button onClick={handlePublishDeal} className="w-full bg-primary text-black font-black py-4 rounded-lg uppercase tracking-widest text-lg font-league">Publish Deal</button>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {myVenue && dashboardView === 'marketing' && (
                    <div className="space-y-10">
                        {/* Points Reporting Section */}
                        <section className="space-y-6">
                            <div className="flex justify-between items-end">
                                <div>
                                    <h3 className="text-2xl font-black text-white uppercase font-league leading-none">POINTS ANALYSIS</h3>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest">Revenue & Engagement metrics</p>
                                </div>
                                <div className="flex bg-black p-1 rounded-lg border border-white/10">
                                    {['day', 'week', 'month', 'year'].map(p => (
                                        <button
                                            key={p}
                                            onClick={() => setStatsPeriod(p as any)}
                                            className={`px-3 py-1.5 text-[10px] font-black uppercase rounded-md transition-all ${statsPeriod === p ? 'bg-primary text-black' : 'text-slate-500'}`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-surface p-4 border border-white/10 rounded-xl">
                                    <p className="text-[9px] font-black text-slate-500 uppercase font-league mb-1">Earned</p>
                                    <p className="text-2xl font-black text-primary font-league">+{activityStats.earned.toLocaleString()}</p>
                                </div>
                                <div className="bg-surface p-4 border border-white/10 rounded-xl">
                                    <p className="text-[9px] font-black text-slate-500 uppercase font-league mb-1">Redeemed</p>
                                    <p className="text-2xl font-black text-red-500 font-league">-{activityStats.redeemed.toLocaleString()}</p>
                                </div>
                                <div className="bg-surface p-4 border border-white/10 rounded-xl">
                                    <p className="text-[9px] font-black text-slate-500 uppercase font-league mb-1">Active</p>
                                    <p className="text-2xl font-black text-white font-league">{activityStats.activeUsers}</p>
                                </div>
                            </div>
                        </section>

                        {/* Photo Curation Section */}
                        <section className="space-y-6">
                            <div>
                                <h3 className="text-2xl font-black text-white uppercase font-league leading-none">PHOTO CURATION</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest">Manage User-submitted Content</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {myVenue.photos?.filter(p => p.allowMarketingUse).map(photo => (
                                    <div key={photo.id} className="bg-surface border border-white/10 rounded-xl overflow-hidden group">
                                        <div className="aspect-square bg-black relative">
                                            <img src={photo.url} alt="User vibe" className="w-full h-full object-cover" />
                                            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-black text-primary uppercase">
                                                CONSENT GRANTED
                                            </div>
                                        </div>
                                        <div className="p-3 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[9px] font-black text-slate-500 uppercase">Public Feed</span>
                                                <button
                                                    onClick={() => handleTogglePhotoApproval(photo.id, 'isApprovedForFeed', !!photo.isApprovedForFeed)}
                                                    className={`w-10 h-5 rounded-full p-1 transition-all ${photo.isApprovedForFeed ? 'bg-primary' : 'bg-slate-800'}`}
                                                >
                                                    <div className={`w-3 h-3 rounded-full bg-white transition-all ${photo.isApprovedForFeed ? 'translate-x-5' : 'translate-x-0'}`} />
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[9px] font-black text-slate-500 uppercase">Social Media</span>
                                                <button
                                                    disabled={userProfile.role !== 'admin'}
                                                    onClick={() => handleTogglePhotoApproval(photo.id, 'isApprovedForSocial', !!photo.isApprovedForSocial)}
                                                    className={`w-10 h-5 rounded-full p-1 transition-all ${photo.isApprovedForSocial ? 'bg-[#fbbf24]' : 'bg-slate-800'} ${userProfile.role !== 'admin' ? 'opacity-30 cursor-not-allowed' : ''}`}
                                                >
                                                    <div className={`w-3 h-3 rounded-full bg-white transition-all ${photo.isApprovedForSocial ? 'translate-x-5' : 'translate-x-0'}`} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {(!myVenue.photos || myVenue.photos.filter(p => p.allowMarketingUse).length === 0) && (
                                    <div className="col-span-2 py-12 text-center border-2 border-dashed border-white/5 rounded-2xl">
                                        <p className="text-slate-600 font-bold uppercase text-xs tracking-widest font-league">No approved marketing photos yet</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                )}

                {myVenue && dashboardView === 'listing' && (
                    <ListingManagementTab venue={myVenue} onUpdate={updateVenue} />
                )}

                {myVenue && dashboardView === 'maker' && isVenueOwner(userProfile, myVenue.id) && (
                    <LocalMakerManagementTab venue={myVenue} onUpdate={updateVenue} venues={venues} />
                )}

                {myVenue && dashboardView === 'host' && isVenueOwner(userProfile, myVenue.id) && (
                    <LeagueHostManagementTab venue={myVenue} onUpdate={updateVenue} />
                )}

                {myVenue && dashboardView === 'qr' && (
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-2xl font-black text-white uppercase font-league leading-none">Vibe Check QR</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest">Physical Assets for On-Premise Verification</p>
                        </div>

                        <div className="bg-surface border border-white/10 rounded-2xl p-8 flex flex-col items-center text-center space-y-6">
                            <div className="bg-white p-4 rounded-xl shadow-2xl">
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://olybars.com/vc/${myVenue.id}`}
                                    alt="Venue QR Code"
                                    className="w-48 h-48"
                                />
                            </div>
                            <div>
                                <p className="text-primary font-black uppercase tracking-widest text-sm mb-2">Scan Target</p>
                                <code className="bg-black/50 px-3 py-1 rounded text-slate-400 text-xs font-mono">https://olybars.com/vc/{myVenue.id}</code>
                            </div>

                            <div className="flex gap-4 w-full">
                                <a
                                    href={`https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=https://olybars.com/vc/${myVenue.id}&format=png`}
                                    download={`${myVenue.name.replace(/\s+/g, '_')}_QR.png`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 bg-slate-800 text-white font-black py-4 rounded-xl uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors"
                                >
                                    <Download className="w-4 h-4" />
                                    Download PNG
                                </a>
                                <button
                                    onClick={() => showToast('Printer integration coming in V2', 'info')}
                                    className="flex-1 bg-surface border border-white/10 text-slate-500 font-black py-4 rounded-xl uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:bg-white/5 transition-colors"
                                >
                                    <Printer className="w-4 h-4" />
                                    Print Label
                                </button>
                            </div>

                            <div className="bg-blue-900/20 border border-blue-500/20 p-4 rounded-xl text-left w-full">
                                <div className="flex gap-3">
                                    <Info className="w-5 h-5 text-blue-400 shrink-0" />
                                    <div>
                                        <p className="text-blue-400 font-black uppercase tracking-widest text-xs mb-1">Placement Guide</p>
                                        <ul className="text-slate-400 text-[10px] space-y-1 list-disc pl-4">
                                            <li>Place near the entrance or at the bar.</li>
                                            <li>Ensure good lighting for easy scanning.</li>
                                            <li>This code is permanent for your venue.</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-black border-t border-white/10 shrink-0">
                <button
                    onClick={onClose}
                    className="w-full bg-white text-[#0f172a] font-black py-4 rounded-lg shadow-xl uppercase tracking-widest font-league text-lg active:scale-95"
                >
                    Back to Pulse
                </button>
            </div>

            {/* Artie Commands Modal */}
            {
                showArtieCommands && (
                    <div className="fixed inset-0 bg-black/95 z-[90] flex items-center justify-center p-6 animate-in fade-in" onClick={() => setShowArtieCommands(false)}>
                        <div className="bg-surface border border-white/10 shadow-2xl w-full max-w-sm relative p-8 rounded-2xl" onClick={e => e.stopPropagation()}>
                            <button onClick={() => setShowArtieCommands(false)} className="absolute top-4 right-4 text-slate-500">
                                <X className="w-8 h-8" />
                            </button>
                            <h3 className="text-3xl font-black text-primary uppercase mb-6 font-league text-center">Manage via Text</h3>
                            <p className="text-sm text-slate-400 mb-8 text-center">Text These commands to Artie to update your venue instantly.</p>
                            <div className="space-y-4">
                                <div className="bg-black/50 p-4 border border-white/10 rounded-xl">
                                    <p className="text-slate-500 mb-1 text-[10px] font-black uppercase font-league">Set Event:</p>
                                    <p className="font-bold text-white text-xs italic">"karaoke league night Friday 9pm"</p>
                                </div>
                            </div>
                            <button onClick={() => setShowArtieCommands(false)} className="w-full mt-10 bg-primary text-black font-black py-4 uppercase rounded-xl font-league">Got it</button>
                        </div>
                    </div>
                )
            }
        </div >
    );
};