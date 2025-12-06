import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, MapPin, Flame, Brain, Gamepad2, MessageCircle, Mic, Users, Trophy, CheckCircle, 
  Info, Send, Music, Beer, ChevronRight, Camera, Menu, Target, X, Calendar, Compass, Grid, 
  Star, Share2, Shield, Cookie, Settings, Bell, Heart, ThumbsUp, User, Lock, Phone, Mail, Edit2, LogOut, Medal, Crown, ArrowLeft, ExternalLink, Globe, Hash, Home, Zap, Radio, Sliders, AlertTriangle, Plus, Minus, RefreshCw, HelpCircle, FileText, Smartphone
} from 'lucide-react';
import { getArtieResponse } from './services/geminiService';
import { Venue, VenueStatus, Message, CheckInRecord, UserAlertPreferences, PointsReason, UserProfile, UserRole } from './types';
import { MOCK_VENUES } from './services/mockData';
import { saveAlertPreferences, logUserActivity, syncCheckIns } from './services/apiPlaceholders';
import OwnerMarketingPromotions from './components/OwnerMarketingPromotions';

// --- Helper Functions ---

const renderIconForOnboarding = (step: number) => {
  switch (step) {
    case 1: return <Flame className="w-10 h-10 text-[#ffaa00]" strokeWidth={3} />;
    case 2: return <Clock className="w-10 h-10 text-[#ffaa00]" strokeWidth={3} />;
    case 3: return <Trophy className="w-10 h-10 text-[#ffaa00]" strokeWidth={3} />;
    case 4: return <MessageCircle className="w-10 h-10 text-[#ffaa00]" strokeWidth={3} />;
    default: return <Star className="w-10 h-10 text-[#ffaa00]" strokeWidth={3} />;
  }
};

const renderOnboardingContent = (step: number) => {
  switch (step) {
    case 1: return { 
        title: "Welcome to OlyBars!", 
        text: "The Oly Pulse shows you where the crowd is right now. Find the 'Buzzing' spots and never walk into an empty bar again." 
    };
    case 2: return { 
        title: "The Buzz Clock", 
        text: "We track every Happy Hour in town. Long-running deals are pushed to the bottom so you see what's ending soonest." 
    };
    case 3: return { 
        title: "The League", 
        text: "Clock In to venues (max 2/night) and take Vibe Photos to earn points. Compete for the season champion trophy." 
    };
    case 4: return { 
        title: "Ask Artie", 
        text: "Artie is your personal AI concierge (powered by Well 80). Ask him for directions, food recommendations, or today's hottest deal." 
    };
    default: return { title: "Welcome", text: "Let's get started." };
  }
};

// --- Components ---

const BuzzClock = ({ venues }: { venues: Venue[] }) => {
  // Logic: Deals ending soonest first, but deals > 4 hours (240 mins) go to the bottom
  const activeDeals = venues
    .filter(v => v.deal && v.dealEndsIn && v.dealEndsIn > 0)
    .sort((a, b) => {
        const aTime = a.dealEndsIn || 0;
        const bTime = b.dealEndsIn || 0;
        const aLong = aTime >= 240;
        const bLong = bTime >= 240;
        
        if (aLong !== bLong) return aLong ? 1 : -1;
        return aTime - bTime;
    });

  return (
    <div className="bg-[#ffaa00] border-b-2 border-black p-4 shadow-[0px_4px_0px_0px_#000] z-20 relative">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-6 h-6 text-black animate-pulse" strokeWidth={3} />
          <div className="flex flex-col">
             <h2 className="text-2xl font-['Bangers'] text-black tracking-wider leading-none">THE BUZZ CLOCK</h2>
             <span className="text-[10px] text-black font-['Roboto_Condensed'] font-bold uppercase tracking-widest">Live Countdown • Focused Deals</span>
          </div>
        </div>
        <div className="text-right">
             <span className="text-[10px] font-mono text-white bg-black px-2 py-1 font-bold border-2 border-white transform -skew-x-12 inline-block">
               LIVE
             </span>
        </div>
      </div>
      
      {activeDeals.length > 0 ? (
        <div className="space-y-2">
          {activeDeals.slice(0, 2).map((venue) => (
            <div key={venue.id} className="flex justify-between items-center bg-white p-2 border-2 border-black shadow-[3px_3px_0px_0px_#000]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-['Bangers'] text-black text-lg tracking-wide">{venue.name}</span>
                  {venue.isHQ && <span className="text-[9px] bg-black text-white px-1.5 py-0.5 font-bold uppercase border border-black">HQ</span>}
                </div>
                <p className="text-xs text-black font-bold font-['Roboto_Condensed'] uppercase">{venue.deal}</p>
              </div>
              <div className="text-right pl-2">
                <span className={`font-mono font-black text-lg ${venue.dealEndsIn! < 60 ? 'text-red-600' : 'text-green-600'}`}>
                  {Math.floor(venue.dealEndsIn! / 60)}h {venue.dealEndsIn! % 60}m
                </span>
                <p className="text-[9px] text-black uppercase font-bold">Left</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-black text-xs italic p-2 font-bold bg-white/20 border border-black/10">All quiet. Check back at 4PM for the 5PM Bell.</div>
      )}
    </div>
  );
};

const PulseMeter = ({ status }: { status: VenueStatus }) => {
  if (status === 'chill') return <div className="flex items-center gap-1 text-black bg-blue-300 px-2 py-0.5 border-2 border-black shadow-[2px_2px_0px_0px_#000]"><Beer className="w-3 h-3" strokeWidth={3} /> <span className="text-[10px] font-black uppercase font-['Bangers'] tracking-widest">Chill</span></div>;
  if (status === 'lively') return <div className="flex items-center gap-1 text-black bg-[#ffaa00] px-2 py-0.5 border-2 border-black shadow-[2px_2px_0px_0px_#000]"><Users className="w-3 h-3" strokeWidth={3} /> <span className="text-[10px] font-black uppercase font-['Bangers'] tracking-widest">Lively</span></div>;
  return <div className="flex items-center gap-1 text-white bg-red-600 px-2 py-0.5 border-2 border-black shadow-[2px_2px_0px_0px_#000]"><Flame className="w-3 h-3 animate-pulse" strokeWidth={3} /> <span className="text-[10px] font-black uppercase font-['Bangers'] tracking-widest">Buzzing</span></div>;
};

// --- Login Modal Component ---

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  loginMode: 'user' | 'owner';
  setLoginMode: (mode: 'user' | 'owner') => void;
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  venues: Venue[];
  onOwnerSuccess: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ 
  isOpen, 
  onClose, 
  loginMode, 
  setLoginMode, 
  userProfile, 
  setUserProfile, 
  venues,
  onOwnerSuccess
}) => {
  const [email, setEmail] = useState(userProfile.email || '');
  const [handle, setHandle] = useState(userProfile.handle || '');
  const [phone, setPhone] = useState(userProfile.phone || '');
  const [drink, setDrink] = useState(userProfile.favoriteDrink || '');
  const [homeBase, setHomeBase] = useState(userProfile.homeBase || '');
  const [ownerPin, setOwnerPin] = useState('');

  if (!isOpen) return null;

  const saveUser = () => {
    if (!handle.trim()) { alert('You need a Handle for the League!'); return; }
    if (!email.includes('@')) { alert('Please enter a valid email.'); return; }
    
    setUserProfile(prev => ({
        ...prev,
        role: 'user',
        handle,
        email,
        phone,
        homeBase,
        favoriteDrink: drink
    }));
    onClose();
  };

  const checkOwnerPin = () => {
    if (ownerPin === '0423') {
        setUserProfile(prev => ({ ...prev, role: 'owner' }));
        onClose();
        onOwnerSuccess();
    } else {
        alert('Incorrect PIN. Try 0423.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-in zoom-in-95">
        <div className="bg-white w-full max-w-sm border-4 border-black shadow-[8px_8px_0px_0px_#39ff14] relative flex flex-col max-h-[90vh] overflow-hidden">
            
            {/* Header Tabs */}
            <div className="flex border-b-4 border-black bg-black">
                <button 
                  onClick={() => setLoginMode('user')}
                  className={`flex-1 py-4 text-center text-lg font-['Bangers'] uppercase tracking-wider transition-all
                  ${loginMode === 'user' 
                    ? 'bg-[#39ff14] text-black' 
                    : 'bg-slate-900 text-slate-500 hover:bg-slate-800'}`}
                >
                    League ID
                </button>
                <button 
                  onClick={() => setLoginMode('owner')}
                  className={`flex-1 py-4 text-center text-lg font-['Bangers'] uppercase tracking-wider transition-all
                  ${loginMode === 'owner' 
                    ? 'bg-[#39ff14] text-black' 
                    : 'bg-slate-900 text-slate-500 hover:bg-slate-800'}`}
                >
                    Owner Access
                </button>
            </div>

            <div className="p-6 overflow-y-auto bg-white text-black">
                <button onClick={onClose} className="absolute top-3 right-3 z-10 text-black hover:scale-110 bg-white rounded-full p-1 border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                    <X className="w-5 h-5" strokeWidth={3} />
                </button>

                {loginMode === 'user' ? (
                    <div className="space-y-5">
                        <div className="text-center mb-4">
                            <div className="inline-block p-3 rounded-full bg-black border-2 border-[#39ff14] mb-2 shadow-[4px_4px_0px_0px_#000]">
                              <User className="w-8 h-8 text-[#39ff14]" strokeWidth={3} />
                            </div>
                            <h3 className="text-2xl font-['Bangers'] text-black uppercase tracking-wide">Citizen Registration</h3>
                            <p className="text-xs font-bold text-slate-600 font-['Roboto_Condensed'] uppercase">Join the Olympia Bar League</p>
                        </div>

                        <div>
                            <label className="block text-xs uppercase text-black font-black mb-1 font-['Roboto_Condensed'] bg-[#39ff14] inline-block px-1 border border-black transform -skew-x-12">League Handle *</label>
                            <div className="relative mt-1">
                                <Hash className="w-4 h-4 absolute left-3 top-3 text-black" strokeWidth={3} />
                                <input 
                                  type="text" 
                                  value={handle}
                                  onChange={(e) => setHandle(e.target.value)}
                                  placeholder="BarFly_99"
                                  className="w-full bg-white border-2 border-black focus:shadow-[4px_4px_0px_0px_#000] focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all rounded-none py-2.5 pl-10 text-sm text-black outline-none font-bold"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs uppercase text-black font-black mb-1 font-['Roboto_Condensed']">Home Base</label>
                            <div className="relative">
                                <Home className="w-4 h-4 absolute left-3 top-3 text-black" strokeWidth={3} />
                                <select 
                                  value={homeBase}
                                  onChange={(e) => setHomeBase(e.target.value)}
                                  className="w-full bg-white border-2 border-black focus:shadow-[4px_4px_0px_0px_#000] rounded-none py-2.5 pl-10 text-sm text-black outline-none font-bold appearance-none"
                                >
                                    <option value="">Select a Venue...</option>
                                    {venues.map(v => (
                                        <option key={v.id} value={v.id}>{v.name}</option>
                                    ))}
                                </select>
                                <ChevronRight className="w-4 h-4 absolute right-3 top-3 text-black rotate-90" strokeWidth={3} />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs uppercase text-black font-black mb-1 font-['Roboto_Condensed']">Vibe Signature (Fav Drink)</label>
                            <div className="relative">
                                <Beer className="w-4 h-4 absolute left-3 top-3 text-black" strokeWidth={3} />
                                <input 
                                  type="text" 
                                  value={drink}
                                  onChange={(e) => setDrink(e.target.value)}
                                  placeholder="Rainier, IPA, Cider..."
                                  className="w-full bg-white border-2 border-black focus:shadow-[4px_4px_0px_0px_#000] rounded-none py-2.5 pl-10 text-sm text-black outline-none font-bold"
                                />
                            </div>
                        </div>

                        <div className="pt-2 border-t-2 border-black border-dashed">
                            <label className="block text-xs uppercase text-black font-black mb-1 font-['Roboto_Condensed'] bg-[#ffaa00] inline-block px-1 border border-black transform -skew-x-12">Secure Comms (Email) *</label>
                            <div className="relative mb-3 mt-1">
                                <Mail className="w-4 h-4 absolute left-3 top-3 text-black" strokeWidth={3} />
                                <input 
                                  type="email" 
                                  value={email}
                                  onChange={(e) => setEmail(e.target.value)}
                                  placeholder="you@olybars.com"
                                  className="w-full bg-white border-2 border-black focus:shadow-[4px_4px_0px_0px_#000] rounded-none py-2.5 pl-10 text-sm text-black outline-none font-bold"
                                />
                            </div>
                            
                            <label className="block text-xs uppercase text-black font-black mb-1 font-['Roboto_Condensed']">Hololine (Phone - Optional)</label>
                            <div className="relative">
                                <Phone className="w-4 h-4 absolute left-3 top-3 text-black" strokeWidth={3} />
                                <input 
                                  type="tel" 
                                  value={phone}
                                  onChange={(e) => setPhone(e.target.value)}
                                  placeholder="(360) 555-0123"
                                  className="w-full bg-white border-2 border-black focus:shadow-[4px_4px_0px_0px_#000] rounded-none py-2.5 pl-10 text-sm text-black outline-none font-bold"
                                />
                            </div>
                        </div>

                        <button onClick={saveUser} className="w-full bg-[#39ff14] hover:bg-green-400 text-black font-['Bangers'] text-xl uppercase tracking-wider py-3 border-2 border-black shadow-[4px_4px_0px_0px_#000] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all mt-2">
                            MINT IDENTITY
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-red-100 border-2 border-red-600 p-4 text-xs text-red-900 mb-2 font-mono font-bold">
                            <Shield className="w-5 h-5 mb-1 text-red-600" strokeWidth={3} />
                            WARNING: RESTRICTED AREA.<br/>
                            AUTHORIZED VENUE STAFF ONLY.
                        </div>
                        <div>
                            <label className="block text-xs uppercase text-black font-black mb-1 font-['Roboto_Condensed']">Access Code</label>
                            <div className="relative">
                                <Lock className="w-4 h-4 absolute left-3 top-3 text-black" strokeWidth={3} />
                                <input 
                                  type="password" 
                                  value={ownerPin}
                                  onChange={(e) => setOwnerPin(e.target.value)}
                                  placeholder="••••"
                                  className="w-full bg-white border-2 border-black focus:shadow-[4px_4px_0px_0px_#000] rounded-none py-2.5 pl-10 text-sm text-black focus:outline-none font-mono tracking-[0.5em] text-center"
                                  maxLength={4}
                                />
                            </div>
                        </div>
                        <button onClick={checkOwnerPin} className="w-full bg-black hover:bg-slate-800 text-white font-['Bangers'] text-xl uppercase tracking-wider py-3 border-2 border-black shadow-[4px_4px_0px_0px_#39ff14] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all">
                            ACCESS DASHBOARD
                        </button>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

// --- Owner Dashboard Component ---

interface OwnerDashboardProps {
    isOpen: boolean;
    onClose: () => void;
    venues: Venue[];
    updateVenue: (venueId: string, updates: Partial<Venue>) => void;
    openInfo: (title: string, text: string) => void;
    onViewPage: (venueId: string) => void;
}

const OwnerDashboard: React.FC<OwnerDashboardProps> = ({ isOpen, onClose, venues, updateVenue, openInfo, onViewPage }) => {
    // For this mock, we assume the owner owns "Hannah's" (id: 'hannahs')
    const myVenue = venues.find(v => v.id === 'hannahs') || venues[0];
    const [dealText, setDealText] = useState('');
    const [dealDuration, setDealDuration] = useState(60); // minutes
    const [showArtieCommands, setShowArtieCommands] = useState(false);
    const [dashboardView, setDashboardView] = useState<'main' | 'marketing'>('main');
    
    // Dynamic Pulse Score Calculation
    const calculatePulseScore = () => {
        let score = 50;
        if (myVenue.status === 'buzzing') score += 30;
        if (myVenue.status === 'lively') score += 15;
        if (myVenue.status === 'chill') score += 5;
        if (myVenue.deal) score += 10;
        if (myVenue.leagueEvent) score += 10;
        score += (myVenue.checkIns * 1.5);
        return Math.min(100, score).toFixed(1);
    };

    const pulseScore = calculatePulseScore();

    if (!isOpen || !myVenue) return null;

    const handlePublishDeal = () => {
        if (!dealText) return;
        updateVenue(myVenue.id, {
            deal: dealText,
            dealEndsIn: dealDuration
        });
        setDealText('');
        alert('FLASH DEAL BROADCASTED TO NETWORK');
    };

    const clearDeal = () => {
        updateVenue(myVenue.id, { deal: undefined, dealEndsIn: 0 });
    }

    const adjustCheckIns = (delta: number) => {
        const newCount = Math.max(0, myVenue.checkIns + delta);
        updateVenue(myVenue.id, { checkIns: newCount });
    };

    const DEAL_PRESETS = [
        "$1 Off Drafts", "$5 Well Drinks", "Half-Price Apps", "BOGO Burgers", "Industry Night"
    ];

    // Mock Data for Analytics
    const WEEKLY_STATS = {
        totalCheckIns: 142,
        newMembers: 18,
        returnRate: "34%",
        topNights: "Fri, Sat"
    };

    const TOP_PLAYERS = [
        { rank: 1, handle: "BarFly_99", visits: 4 },
        { rank: 2, handle: "TriviaKing", visits: 3 },
        { rank: 3, handle: "PNW_Hiker", visits: 3 },
        { rank: 4, handle: "OlyOlyOxen", visits: 2 },
        { rank: 5, handle: "RainierFan", visits: 2 },
    ];

    return (
        <div className="fixed inset-0 bg-slate-900 z-[80] flex flex-col animate-in slide-in-from-bottom duration-300">
            {/* Command Header - Fixed at Top */}
            <div className="bg-slate-900 border-b-4 border-[#39ff14] p-4 shadow-lg flex justify-between items-center shrink-0 z-20">
                <div className="flex items-center gap-3">
                    <div className="bg-[#39ff14] p-2 border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                        <Settings className="w-6 h-6 text-black" strokeWidth={3} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-['Bangers'] text-white uppercase tracking-wider leading-none flex items-center gap-2">
                             COMMAND CENTER
                             <button onClick={() => openInfo(
                                 "How this dashboard works", 
                                 "Most of your traffic comes from people checking in and playing in the League. Use quick SMS commands to add tonight’s events or promos."
                             )}>
                                <HelpCircle className="w-4 h-4 text-slate-500 hover:text-white" />
                             </button>
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                            <p className="text-[10px] text-[#39ff14] font-bold uppercase tracking-widest font-['Roboto_Condensed']">Admin: {myVenue.name}</p>
                            <div className="flex items-center gap-2 bg-black px-2 py-0.5 border border-[#39ff14]">
                                <span className="text-[#39ff14] text-[10px] font-black uppercase tracking-wide">League Status: Active</span>
                                <button onClick={() => openInfo("League Status", "Your venue’s participation status in the Olympia Bar League. ‘Active’ means players can earn points tonight.")} className="text-[#39ff14] hover:text-white">
                                    <HelpCircle className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="text-slate-500 hover:text-white">
                    <X className="w-8 h-8" strokeWidth={3} />
                </button>
            </div>

            {/* Sticky Dashboard Nav */}
            <div className="flex border-b-4 border-black bg-white shadow-md shrink-0 z-10">
                <button 
                    onClick={() => setDashboardView('main')} 
                    className={`flex-1 py-3 text-sm font-['Bangers'] uppercase tracking-wider transition-all border-r-2 border-black
                    ${dashboardView === 'main' ? 'bg-[#ffaa00] text-black' : 'bg-slate-200 text-slate-500 hover:bg-slate-300'}`}
                >
                    Overview
                </button>
                <button 
                    onClick={() => setDashboardView('marketing')} 
                    title="This section helps owners promote league nights with AI-generated posts and assets."
                    className={`flex-1 py-3 text-sm font-['Bangers'] uppercase tracking-wider transition-all
                    ${dashboardView === 'marketing' ? 'bg-[#ffaa00] text-black' : 'bg-slate-200 text-slate-500 hover:bg-slate-300'}`}
                >
                    Marketing & Promos
                </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-900">
                {dashboardView === 'main' ? (
                    <div className="p-4 space-y-6 pb-20">
                    
                        {/* 1. Tonight at a Glance (Strip) */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-800 p-3 border-2 border-black shadow-[4px_4px_0px_0px_#000] relative">
                                <p className="text-[9px] uppercase font-bold text-slate-400 font-['Roboto_Condensed']">Live Check-ins (Today)</p>
                                <p className="text-2xl font-['Bangers'] text-white">{myVenue.checkIns}</p>
                            </div>
                            <div className="bg-slate-800 p-3 border-2 border-black shadow-[4px_4px_0px_0px_#000] relative">
                                <div className="flex items-center gap-1 absolute top-3 right-3">
                                     <button onClick={() => openInfo("Live Vibe", "Live Vibe is based on recent player check-ins at your venue. Players can vote ‘Chill, Lively, Buzzing, Slammed’ once per visit. The system smooths votes over time and watches for obvious abuse.")}><HelpCircle className="w-3 h-3 text-slate-500" /></button>
                                </div>
                                <p className="text-[9px] uppercase font-bold text-slate-400 font-['Roboto_Condensed']">Live Vibe</p>
                                <p className={`text-xl font-['Bangers'] uppercase tracking-wide ${myVenue.status === 'buzzing' ? 'text-red-500' : myVenue.status === 'lively' ? 'text-[#ffaa00]' : 'text-blue-400'}`}>
                                    {myVenue.status}
                                </p>
                            </div>
                            <div className="bg-slate-800 p-3 border-2 border-black shadow-[4px_4px_0px_0px_#000] relative">
                                <p className="text-[9px] uppercase font-bold text-slate-400 font-['Roboto_Condensed']">Active Promo</p>
                                {myVenue.deal ? (
                                    <div>
                                        <p className="text-sm font-bold text-white truncate">{myVenue.deal}</p>
                                        <p className="text-[10px] text-[#39ff14] font-mono">{myVenue.dealEndsIn}m left</p>
                                    </div>
                                ) : (
                                    <p className="text-sm font-bold text-slate-500 italic">None</p>
                                )}
                            </div>
                            <div className="bg-slate-800 p-3 border-2 border-black shadow-[4px_4px_0px_0px_#000] relative">
                                <p className="text-[9px] uppercase font-bold text-slate-400 font-['Roboto_Condensed']">Next League Event</p>
                                {myVenue.leagueEvent ? (
                                    <p className="text-sm font-bold text-white uppercase">{myVenue.leagueEvent}</p>
                                ) : (
                                    <p className="text-sm font-bold text-slate-500 italic">None Scheduled</p>
                                )}
                            </div>
                        </div>

                        {/* 2. This Week's Performance */}
                        <div className="bg-slate-800/50 p-4 border border-slate-700">
                            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Trophy className="w-3 h-3 text-[#ffaa00]" /> This Week at a Glance
                            </h3>
                            <div className="grid grid-cols-4 gap-2">
                                {[
                                    { l: 'Total Check-ins', v: WEEKLY_STATS.totalCheckIns },
                                    { l: 'New Members', v: WEEKLY_STATS.newMembers },
                                    { l: 'Return Rate', v: WEEKLY_STATS.returnRate },
                                    { l: 'Top Nights', v: WEEKLY_STATS.topNights },
                                ].map((stat, i) => (
                                    <div key={i} className="bg-slate-900 p-2 border border-slate-600 text-center">
                                        <p className="text-[8px] text-slate-400 uppercase font-bold mb-1">{stat.l}</p>
                                        <p className="text-sm font-['Bangers'] text-white tracking-wide">{stat.v}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 3. Top League Players */}
                        <div className="bg-slate-800/50 p-4 border border-slate-700">
                            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-3">
                                League Players at {myVenue.name}
                            </h3>
                            <div className="overflow-hidden border border-slate-600">
                                <table className="w-full text-left text-[10px] uppercase font-bold">
                                    <thead className="bg-black text-[#ffaa00]">
                                        <tr>
                                            <th className="p-2">Rank</th>
                                            <th className="p-2">Handle</th>
                                            <th className="p-2 text-right">Visits</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-slate-900 text-white divide-y divide-slate-700">
                                        {TOP_PLAYERS.map(p => (
                                            <tr key={p.rank}>
                                                <td className="p-2">#{p.rank}</td>
                                                <td className="p-2">{p.handle}</td>
                                                <td className="p-2 text-right">{p.visits}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* 4. Events & Promos Panel */}
                        <div className="bg-slate-800 border-2 border-black p-4 shadow-[4px_4px_0px_0px_#000]">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="text-lg font-['Bangers'] text-white uppercase tracking-wide">Events & Promos</h3>
                                <button 
                                    onClick={() => setShowArtieCommands(true)}
                                    className="bg-[#39ff14] text-black text-[10px] font-black uppercase px-2 py-1 border border-black shadow-[2px_2px_0px_0px_#000] active:shadow-none active:translate-x-[1px] active:translate-y-[1px] flex items-center gap-1"
                                >
                                    <Smartphone className="w-3 h-3" /> Manage via Text
                                </button>
                            </div>
                            
                            <div className="space-y-2 mb-4">
                                {/* Mock Upcoming Events */}
                                <div className="bg-slate-900 p-2 border border-slate-700 flex justify-between items-center text-xs text-slate-300 font-bold">
                                    <span>FRI 9PM: Karaoke League Night</span>
                                    <span className="text-[#39ff14]">Double Points</span>
                                </div>
                                <div className="bg-slate-900 p-2 border border-slate-700 flex justify-between items-center text-xs text-slate-300 font-bold">
                                    <span>WED 7PM: Pub Trivia</span>
                                    <span className="text-slate-500">Regular</span>
                                </div>
                            </div>
                        </div>

                        {/* 5. Manual Override Console (Existing Logic Preserved) */}
                        <div className="border-t-2 border-dashed border-slate-700 pt-6">
                            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Manual Override Console</h3>
                            
                            {/* Manual Headcount */}
                            <div className="bg-slate-800 p-4 border-2 border-black shadow-[4px_4px_0px_0px_#000] rounded-sm mb-4">
                                 <p className="text-[10px] text-slate-400 uppercase font-bold mb-1 flex items-center gap-1 font-['Roboto_Condensed']">
                                     <Users className="w-3 h-3 text-slate-400" /> Manual Headcount Adjust
                                 </p>
                                 <div className="flex items-center justify-between mt-1">
                                     <button onClick={() => adjustCheckIns(-1)} className="w-8 h-8 flex items-center justify-center bg-black border border-slate-600 hover:bg-slate-700 text-white active:scale-95"><Minus className="w-4 h-4"/></button>
                                     <p className="text-2xl font-['Bangers'] text-white">{myVenue.checkIns}</p>
                                     <button onClick={() => adjustCheckIns(1)} className="w-8 h-8 flex items-center justify-center bg-[#39ff14] border border-black text-black shadow-[2px_2px_0px_0px_#000] active:shadow-none active:translate-x-[1px] active:translate-y-[1px]"><Plus className="w-4 h-4" strokeWidth={3} /></button>
                                 </div>
                            </div>

                            {/* Flash Deal Console */}
                            <div className="bg-slate-800 p-4 border-2 border-dashed border-slate-600 rounded-sm relative">
                                <div className="absolute -top-3 left-4 bg-slate-900 px-2 text-xs font-black text-[#39ff14] uppercase tracking-widest flex items-center gap-2 font-['Roboto_Condensed'] border border-[#39ff14]">
                                     <Zap className="w-3 h-3" /> Quick Flash Deal
                                </div>
                                
                                {myVenue.deal ? (
                                    <div className="text-center py-4">
                                        <p className="text-slate-400 text-xs uppercase mb-2 font-bold">Active Broadcast</p>
                                        <h4 className="text-xl font-['Bangers'] text-white mb-1 tracking-wide">{myVenue.deal}</h4>
                                        <p className="text-[#39ff14] font-mono text-sm font-bold mb-4">{myVenue.dealEndsIn}m remaining</p>
                                        <button onClick={clearDeal} className="bg-red-900 text-red-200 border-2 border-red-500 px-4 py-2 text-xs font-bold uppercase hover:bg-red-800 shadow-[2px_2px_0px_0px_#000]">
                                            TERMINATE DEAL
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4 pt-2">
                                         <div>
                                            <label className="block text-[10px] uppercase text-slate-400 font-bold mb-2">Deal Payload</label>
                                            <div className="flex gap-2 overflow-x-auto pb-2 mb-2 scrollbar-hide">
                                                {DEAL_PRESETS.map(preset => (
                                                    <button 
                                                        key={preset}
                                                        onClick={() => setDealText(preset)}
                                                        className="px-3 py-1 bg-slate-900 border-2 border-slate-600 text-[10px] font-bold text-slate-300 hover:border-[#39ff14] hover:text-white whitespace-nowrap"
                                                    >
                                                        {preset}
                                                    </button>
                                                ))}
                                            </div>
                                            <input 
                                                type="text" 
                                                value={dealText}
                                                onChange={(e) => setDealText(e.target.value)}
                                                placeholder="Type custom deal..."
                                                className="w-full bg-black border-2 border-slate-600 focus:border-[#39ff14] p-3 text-sm text-white font-bold outline-none font-['Roboto_Condensed']"
                                            />
                                         </div>
                                         <div className="flex gap-2">
                                             {[30, 60, 120].map(mins => (
                                                 <button 
                                                     key={mins}
                                                     onClick={() => setDealDuration(mins)}
                                                     className={`flex-1 py-2 text-xs font-bold border-2 transition-all
                                                     ${dealDuration === mins 
                                                         ? 'bg-[#39ff14] border-black text-black shadow-[2px_2px_0px_0px_#000]' 
                                                         : 'bg-slate-900 border-slate-600 text-slate-400'}`}
                                                 >
                                                     {mins}m
                                                 </button>
                                             ))}
                                         </div>
                                         <button 
                                            onClick={handlePublishDeal}
                                            disabled={!dealText}
                                            className={`w-full font-['Bangers'] text-xl uppercase tracking-wider py-3 border-2 border-black shadow-[4px_4px_0px_0px_#000] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all flex items-center justify-center gap-2
                                            ${dealText ? 'bg-[#ffaa00] hover:bg-amber-400 text-black' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
                                         >
                                            <Zap className="w-5 h-5 fill-current" /> BROADCAST
                                         </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 6. Integrity Panel */}
                        <div className="border border-red-900/30 bg-red-900/10 p-3">
                            <h4 className="text-red-500 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Shield className="w-3 h-3" /> League Integrity
                            </h4>
                            <div className="text-[10px] font-mono text-red-300 space-y-1">
                                <p>Suspicious check-ins this week: [0]</p>
                                <p>Manual audits: [1] (Last: Today 2:00PM by League HQ)</p>
                                {/* TODO: Hook up to Integrity Backend */}
                            </div>
                        </div>

                        <div className="bg-white text-black font-['Bangers'] tracking-wide border-2 border-black shadow-[2px_2px_0px_0px_#000] text-center py-2 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none hover:bg-gray-100 cursor-pointer" onClick={() => onViewPage(myVenue.id)}>
                            VIEW PUBLIC PAGE
                        </div>
                    </div>
                ) : (
                    <div className="pb-20">
                        <OwnerMarketingPromotions />
                    </div>
                )}
            </div>

            {/* Artie Commands Modal */}
            {showArtieCommands && (
                <div className="fixed inset-0 bg-black/90 z-[90] flex items-center justify-center p-6 animate-in fade-in">
                    <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#39ff14] w-full max-w-sm relative p-6">
                        <button onClick={() => setShowArtieCommands(false)} className="absolute top-3 right-3 text-black"><X className="w-6 h-6" strokeWidth={3} /></button>
                        <h3 className="text-2xl font-['Bangers'] text-black uppercase mb-4">Manage via Text</h3>
                        <p className="text-xs font-bold text-slate-600 mb-4 font-['Roboto_Condensed']">
                            Text these commands to Artie (555-0199) to update your venue instantly.
                        </p>
                        <div className="space-y-3 font-mono text-xs text-black">
                            <div className="bg-slate-100 p-2 border border-slate-300">
                                <p className="text-slate-500 mb-1">Set Event:</p>
                                <p className="font-bold">"karaoke league night Friday 9-11pm double points"</p>
                            </div>
                            <div className="bg-slate-100 p-2 border border-slate-300">
                                <p className="text-slate-500 mb-1">Cancel Event:</p>
                                <p className="font-bold">"cancel trivia tonight – low staff"</p>
                            </div>
                            <div className="bg-slate-100 p-2 border border-slate-300">
                                <p className="text-slate-500 mb-1">Award Winner:</p>
                                <p className="font-bold">"karaoke winner @BarFly_99"</p>
                            </div>
                            <div className="bg-slate-100 p-2 border border-slate-300">
                                <p className="text-slate-500 mb-1">Report Issue:</p>
                                <p className="font-bold">"flag checkin #1234 possible bot"</p>
                            </div>
                        </div>
                        <button onClick={() => setShowArtieCommands(false)} className="w-full mt-6 bg-black text-white font-['Bangers'] py-3 text-xl uppercase">Got it</button>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Main App Component ---

export default function OlyBarsApp() {
  const [activeTab, setActiveTab] = useState<'pulse' | 'karaoke' | 'trivia' | 'arcade' | 'events' | 'league'>('pulse');
  const [venues, setVenues] = useState<Venue[]>(MOCK_VENUES);
  const [showClockInModal, setShowClockInModal] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [viewVenueDetail, setViewVenueDetail] = useState<string | null>(null); // New state for detail view
  const [pulseFilter, setPulseFilter] = useState('all');
  
  // Persisted State
  const [userPoints, setUserPoints] = useState(() => parseInt(localStorage.getItem('oly_points') || '1250'));
  const [checkInHistory, setCheckInHistory] = useState<CheckInRecord[]>(() => JSON.parse(localStorage.getItem('oly_checkins') || '[]'));
  const [alertPrefs, setAlertPrefs] = useState<UserAlertPreferences>(() => JSON.parse(localStorage.getItem('oly_prefs') || '{"nightlyDigest":true,"followedVenues":[],"interests":[]}'));
  
  // User Profile State
  const [userProfile, setUserProfile] = useState<UserProfile>(() => JSON.parse(localStorage.getItem('oly_profile') || '{"role":"guest"}'));
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginMode, setLoginMode] = useState<'user' | 'owner'>('user');
  const [showOwnerDashboard, setShowOwnerDashboard] = useState(false);
  
  // Menu State
  const [showMenu, setShowMenu] = useState(false);

  // Compliance State
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(() => localStorage.getItem('oly_terms') === 'true');
  const [hasAcceptedCookies, setHasAcceptedCookies] = useState(() => localStorage.getItem('oly_cookies') === 'true');

  const [clockedInVenue, setClockedInVenue] = useState<string | null>(null);
  
  // Camera State
  const [showCamera, setShowCamera] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cameraError, setCameraError] = useState(false);

  // Onboarding State
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const MAX_ONBOARDING_STEPS = 4;

  // Chat State
  const [showArtie, setShowArtie] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [artieMessages, setArtieMessages] = useState<{sender: string, text: string}[]>([
    { sender: 'artie', text: "Cheers! I'm Artie, your local guide powered by Well 80 Artesian Water. Looking for a dive, a cocktail, or the Pac-Man League?" }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Info Modal State
  const [infoContent, setInfoContent] = useState<{title: string, text: string} | null>(null);

  // League HQ State
  const [leagueTab, setLeagueTab] = useState<'overview' | 'schedule' | 'standings' | 'bars' | 'rules'>('overview');

  const openInfo = (title: string, text: string) => {
      setInfoContent({title, text});
  };

  // --- Effects ---

  useEffect(() => { localStorage.setItem('oly_points', userPoints.toString()); }, [userPoints]);
  useEffect(() => { 
      localStorage.setItem('oly_checkins', JSON.stringify(checkInHistory)); 
      syncCheckIns(checkInHistory); // SYNC TO BACKEND
  }, [checkInHistory]);
  useEffect(() => { localStorage.setItem('oly_profile', JSON.stringify(userProfile)); }, [userProfile]);
  
  useEffect(() => { 
      localStorage.setItem('oly_prefs', JSON.stringify(alertPrefs));
      saveAlertPreferences(alertPrefs); // Async sync
  }, [alertPrefs]);

  useEffect(() => {
    if (showOnboarding || !hasAcceptedTerms) return; // Wait for setup

    const timer = setTimeout(() => {
      if (!showArtie) {
        setShowArtie(true);
        if (artieMessages.length === 1) {
             setArtieMessages(prev => [...prev, {sender: 'artie', text: "Psst... The Brotherhood just updated their Happy Hour. Want to see?"}]);
        }
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [showArtie, showOnboarding, hasAcceptedTerms]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [artieMessages]);

  // --- Handlers ---

  const handleUpdateVenue = (venueId: string, updates: Partial<Venue>) => {
      setVenues(prev => prev.map(v => v.id === venueId ? { ...v, ...updates } : v));
  };

  const handleChatSend = async () => {
    if (!chatInput.trim()) return;
    
    const userText = chatInput;
    setChatInput('');
    setArtieMessages(prev => [...prev, { sender: 'user', text: userText }]);

    try {
        const historyForService: Message[] = artieMessages.map(m => ({
            id: Math.random().toString(),
            role: m.sender === 'user' ? 'user' : 'model',
            text: m.text,
            timestamp: new Date()
        }));

        const response = await getArtieResponse(userText, historyForService);
        setArtieMessages(prev => [...prev, { sender: 'artie', text: response }]);
    } catch (e) {
        setArtieMessages(prev => [...prev, { sender: 'artie', text: "Sorry, I'm having trouble connecting to the network." }]);
    }
  };

  const awardPoints = (reason: PointsReason) => {
    const delta = reason === 'checkin' ? 10 : reason === 'photo' ? 10 : reason === 'share' ? 5 : 0;
    setUserPoints(prev => prev + delta);
    logUserActivity({ type: reason, timestamp: Date.now() });
  };

  const handleClockIn = (venue: Venue) => {
    // Check-in Limit Logic: Max 2 per 12 hours
    const now = Date.now();
    const twelveHoursAgo = now - 12 * 60 * 60 * 1000;
    const recentChecks = checkInHistory.filter(c => c.timestamp >= twelveHoursAgo);

    if (recentChecks.length >= 2) {
        alert("Whoa there! Max 2 check-ins per 12 hours. We want you safe. Come back later!");
        return;
    }

    if (clockedInVenue === venue.id) {
        alert("You're already checked in here!");
        return;
    }

    setSelectedVenue(venue);
    setShowClockInModal(true);
    setCapturedPhoto(null); // Reset photo state
    setShowCamera(false);
  };

  const startCamera = async () => {
    setCameraError(false);
    setShowCamera(true);
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
            await videoRef.current.play();
        }
    } catch (err) {
        console.error("Camera access denied", err);
        setCameraError(true);
    }
  };

  const capturePhoto = () => {
      if (videoRef.current && canvasRef.current) {
          const context = canvasRef.current.getContext('2d');
          if (context) {
              canvasRef.current.width = videoRef.current.videoWidth;
              canvasRef.current.height = videoRef.current.videoHeight;
              context.drawImage(videoRef.current, 0, 0);
              const dataUrl = canvasRef.current.toDataURL('image/jpeg');
              setCapturedPhoto(dataUrl);
              awardPoints('photo');
              
              // Stop stream
              const stream = videoRef.current.srcObject as MediaStream;
              stream?.getTracks().forEach(track => track.stop());
              setShowCamera(false);
          }
      }
  };

  const handleShare = async () => {
      if (!selectedVenue) return;
      
      awardPoints('share');
      
      const shareData = {
          title: `OlyBars Check-in: ${selectedVenue.name}`,
          text: `I'm earning points at ${selectedVenue.name} on OlyBars!`,
          url: window.location.href
      };

      if (navigator.share) {
          try { await navigator.share(shareData); } catch (e) { console.log('Share cancelled'); }
      } else {
          alert("Link copied to clipboard! (+5 Points)");
      }
  };

  const confirmClockIn = () => {
    if (selectedVenue) {
      awardPoints('checkin');
      setCheckInHistory(prev => [...prev, { venueId: selectedVenue.id, timestamp: Date.now() }]);
      setClockedInVenue(selectedVenue.id);
      setVenues(prev => prev.map(v => v.id === selectedVenue.id ? { ...v, checkIns: v.checkIns + 1 } : v));
      setShowClockInModal(false);
      
      setArtieMessages(prev => [...prev, { 
        sender: 'artie', 
        text: `You're clocked in at ${selectedVenue.name}. Points added! Don't forget to hydrate.` 
      }]);
      setShowArtie(true);
    }
  };

  const handleAcceptTerms = () => {
      localStorage.setItem('oly_terms', 'true');
      setHasAcceptedTerms(true);
  };

  const handleAcceptCookies = () => {
      localStorage.setItem('oly_cookies', 'true');
      setHasAcceptedCookies(true);
  };

  const toggleInterest = (interest: string) => {
      setAlertPrefs(prev => {
          const exists = prev.interests.includes(interest);
          return {
              ...prev,
              interests: exists ? prev.interests.filter(i => i !== interest) : [...prev.interests, interest]
          };
      });
  };

  const toggleFollowVenue = (venueId: string) => {
      setAlertPrefs(prev => {
          const exists = prev.followedVenues.includes(venueId);
          return {
              ...prev,
              followedVenues: exists ? prev.followedVenues.filter(id => id !== venueId) : [...prev.followedVenues, venueId]
          };
      });
  };

  const handleLogout = () => {
      if (confirm('Are you sure you want to sign out? This will clear your profile preferences on this device.')) {
          setUserProfile({ role: 'guest' });
          setAlertPrefs({ nightlyDigest: true, followedVenues: [], interests: [] });
          setShowMenu(false);
      }
  };

  // --- Renderers ---

  const renderInfoPopup = () => {
      if (!infoContent) return null;
      return (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200" onClick={() => setInfoContent(null)}>
           <div className="bg-white border-4 border-black p-6 shadow-[8px_8px_0px_0px_#000] max-w-sm w-full relative" onClick={e => e.stopPropagation()}>
              <button onClick={() => setInfoContent(null)} className="absolute top-3 right-3 text-black hover:scale-110"><X className="w-5 h-5" strokeWidth={3} /></button>
              <h3 className="text-xl font-['Bangers'] text-black uppercase tracking-wide mb-3 flex items-center gap-2">
                <Info className="w-5 h-5 text-[#39ff14]" strokeWidth={3} /> {infoContent.title}
              </h3>
              <p className="text-sm text-black font-['Roboto_Condensed'] font-bold leading-relaxed">
                {infoContent.text}
              </p>
           </div>
        </div>
      );
  };

  const renderVenueDetail = () => {
    const venue = venues.find(v => v.id === viewVenueDetail);
    if (!venue) return null;

    return (
      <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col animate-in slide-in-from-right duration-200">
        {/* Detail Header */}
        <div className="bg-slate-900 border-b-2 border-black p-3 flex items-center justify-between sticky top-0 z-10">
           <button onClick={() => setViewVenueDetail(null)} className="flex items-center gap-1 text-[#39ff14] hover:text-white font-['Bangers'] uppercase tracking-wider">
              <ArrowLeft className="w-5 h-5" strokeWidth={3} /> Back
           </button>
           <span className="font-['Bangers'] text-lg text-white uppercase tracking-wide truncate max-w-[200px]">{venue.name}</span>
           <div className="w-12"></div>
        </div>

        <div className="flex-1 overflow-y-auto pb-24 bg-slate-900">
          {/* Hero Section */}
          <div className="relative h-48 bg-slate-800 w-full overflow-hidden border-b-2 border-black">
             <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                 <div className="text-slate-600 flex flex-col items-center">
                    <Camera className="w-8 h-8 mb-2 opacity-50" strokeWidth={3} />
                    <span className="text-xs uppercase tracking-widest font-bold">Venue Image</span>
                 </div>
             </div>
             
             <div className="absolute bottom-4 left-4 z-20">
                <div className="flex items-center gap-2 mb-1">
                   {venue.isHQ && <span className="bg-black text-white text-[10px] font-bold px-2 py-0.5 border border-white shadow-[2px_2px_0px_0px_#000]">LEAGUE HQ</span>}
                   <PulseMeter status={venue.status} />
                </div>
                <h1 className="text-4xl font-['Bangers'] text-white leading-none shadow-black drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] uppercase">{venue.name}</h1>
                <p className="text-[#39ff14] font-bold text-sm uppercase mt-1 font-['Roboto_Condensed'] bg-black inline-block px-1">{venue.type}</p>
             </div>
          </div>

          <div className="p-4 space-y-6">
             {/* Action Bar */}
             <div className="flex gap-2">
                 <button 
                    onClick={() => handleClockIn(venue)}
                    disabled={clockedInVenue === venue.id}
                    className={`flex-1 py-3 font-['Bangers'] text-xl uppercase tracking-wider flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_#000] border-2 border-black transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
                    ${clockedInVenue === venue.id ? 'bg-green-600 text-white' : 'bg-[#39ff14] text-black hover:bg-green-400'}`}
                 >
                    {clockedInVenue === venue.id ? 'CHECKED IN' : 'CLOCK IN (+10)'}
                 </button>
                 <button onClick={() => toggleFollowVenue(venue.id)} className={`p-3 border-2 border-black shadow-[4px_4px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${alertPrefs.followedVenues.includes(venue.id) ? 'bg-[#ffaa00] text-black' : 'bg-white text-black'}`}>
                    <Heart className={`w-6 h-6 ${alertPrefs.followedVenues.includes(venue.id) ? 'fill-current' : ''}`} strokeWidth={3} />
                 </button>
             </div>

             {/* Bio / Description */}
             <div className="bg-white p-4 border-2 border-black shadow-[4px_4px_0px_0px_#000]">
                <h3 className="text-xs font-black text-black uppercase tracking-widest mb-2 font-['Roboto_Condensed'] bg-[#ffaa00] inline-block px-1 border border-black transform -skew-x-6">The Vibe</h3>
                <p className="text-sm text-black leading-relaxed font-bold font-['Roboto_Condensed']">
                   {venue.description || "A local favorite spot in downtown Olympia. Great for gathering with friends."}
                </p>
                
                {venue.alertTags && (
                   <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t-2 border-black border-dashed">
                      {venue.alertTags.map(tag => (
                         <span key={tag} className="text-[10px] font-black uppercase bg-black text-white px-2 py-1 border border-black shadow-[2px_2px_0px_0px_#888]">
                            #{tag}
                         </span>
                      ))}
                   </div>
                )}
             </div>

             {/* Deal Card */}
             {venue.deal && (
                <div className="bg-[#ffaa00] p-4 border-2 border-black shadow-[4px_4px_0px_0px_#000] relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-2 opacity-10">
                      <Clock className="w-20 h-20 text-black" />
                   </div>
                   <h3 className="text-black font-black text-xs uppercase tracking-widest mb-1 flex items-center gap-2 border-b-2 border-black pb-1 inline-block">
                      <Flame className="w-3 h-3" strokeWidth={3} /> Live Deal
                   </h3>
                   <p className="text-xl font-['Bangers'] text-black mb-1 uppercase tracking-wide">{venue.deal}</p>
                   <p className="text-xs text-black font-mono font-bold bg-white inline-block px-1 border border-black">Ends in {Math.floor(venue.dealEndsIn! / 60)}h {venue.dealEndsIn! % 60}m</p>
                </div>
             )}

             {/* Info Grid */}
             <div className="grid grid-cols-1 gap-4">
                <div className="bg-white p-4 border-2 border-black shadow-[4px_4px_0px_0px_#000] flex items-start gap-3">
                   <MapPin className="w-6 h-6 text-black shrink-0" strokeWidth={3} />
                   <div>
                      <h4 className="text-xs font-black text-black uppercase mb-1">Location</h4>
                      <p className="text-sm text-black font-bold font-['Roboto_Condensed']">{venue.address || "Downtown Olympia"}</p>
                   </div>
                </div>

                <div className="bg-white p-4 border-2 border-black shadow-[4px_4px_0px_0px_#000] flex items-start gap-3">
                   <Clock className="w-6 h-6 text-black shrink-0" strokeWidth={3} />
                   <div>
                      <h4 className="text-xs font-black text-black uppercase mb-1">Hours</h4>
                      <p className="text-sm text-black font-bold font-['Roboto_Condensed']">{venue.hours || "Open Today"}</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSideMenu = () => (
      <div className={`fixed inset-0 z-[60] flex justify-end transition-opacity duration-300 ${showMenu ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowMenu(false)}></div>
          
          {/* Drawer */}
          <div className={`relative w-80 bg-slate-900 h-full border-l-4 border-black flex flex-col transition-transform duration-300 transform ${showMenu ? 'translate-x-0' : 'translate-x-full'}`}>
              <div className="p-5 border-b-4 border-black flex justify-between items-center bg-[#39ff14]">
                  <h2 className="text-2xl font-['Bangers'] text-black tracking-wide uppercase">SETTINGS & PROFILE</h2>
                  <button onClick={() => setShowMenu(false)} className="text-black hover:scale-110"><X className="w-8 h-8" strokeWidth={3} /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-8 bg-slate-900">
                  
                  {/* Identity Card */}
                  <div className="bg-white p-5 border-2 border-black shadow-[4px_4px_0px_0px_#000] relative overflow-hidden group">
                      <div className="flex items-center justify-between mb-4 relative z-10">
                          <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center border-2 border-[#39ff14] text-[#39ff14]">
                                  <User className="w-6 h-6" strokeWidth={3} />
                              </div>
                              <div>
                                  <h3 className="font-['Bangers'] text-black text-xl leading-none uppercase tracking-wide">
                                      {userProfile.handle || (userProfile.email ? userProfile.email.split('@')[0] : 'Guest User')}
                                  </h3>
                                  <p className="text-xs text-[#ffaa00] font-black uppercase tracking-wide bg-black px-1 inline-block mt-1">
                                      {userProfile.role === 'owner' ? 'Venue Owner' : 'League Member'}
                                  </p>
                              </div>
                          </div>
                      </div>

                      {userProfile.email ? (
                          <div className="space-y-2 relative z-10 font-bold font-['Roboto_Condensed']">
                              <div className="flex items-center gap-2 text-xs text-black">
                                  <Mail className="w-3 h-3" /> {userProfile.email}
                              </div>
                              {userProfile.homeBase && (
                                  <div className="flex items-center gap-2 text-xs text-black">
                                      <Home className="w-3 h-3" /> HQ: <span className="text-black bg-[#39ff14] px-1 border border-black">{venues.find(v => v.id === userProfile.homeBase)?.name || 'Unknown'}</span>
                                  </div>
                              )}
                          </div>
                      ) : (
                          <div className="mt-2 relative z-10">
                              <p className="text-xs text-black mb-3 font-bold">Create your profile to save favorites.</p>
                              <button 
                                  onClick={() => { setLoginMode('user'); setShowLoginModal(true); setShowMenu(false); }}
                                  className="w-full bg-[#39ff14] hover:bg-green-400 text-black text-sm font-['Bangers'] tracking-wider py-2 border-2 border-black shadow-[2px_2px_0px_0px_#000]"
                              >
                                  CREATE PROFILE
                              </button>
                          </div>
                      )}
                  </div>

                  {/* Notification Settings */}
                  <div>
                      <h3 className="text-sm font-['Bangers'] text-white uppercase tracking-widest mb-3 flex items-center gap-2">
                          <Bell className="w-4 h-4 text-[#ffaa00]" strokeWidth={3} /> Alert Preferences
                      </h3>
                      <div className="bg-slate-800 p-4 border-2 border-black shadow-[4px_4px_0px_0px_#000]">
                          <div className="flex items-center justify-between">
                              <div>
                                  <p className="font-bold text-sm text-white font-['Roboto_Condensed']">Nightly OlyBars Buzz</p>
                              </div>
                              <button 
                                  onClick={() => setAlertPrefs(p => ({...p, nightlyDigest: !p.nightlyDigest}))}
                                  className={`w-12 h-6 border-2 border-black relative transition-colors shadow-[2px_2px_0px_0px_#000] ${alertPrefs.nightlyDigest ? 'bg-[#39ff14]' : 'bg-slate-600'}`}
                              >
                                  <div className={`absolute top-0.5 w-4 h-4 bg-black border border-white transition-all ${alertPrefs.nightlyDigest ? 'left-6' : 'left-0.5'}`} />
                              </button>
                          </div>
                      </div>
                  </div>

                  {/* Following */}
                  <div>
                      <h3 className="text-sm font-['Bangers'] text-white uppercase tracking-widest mb-3 flex items-center gap-2">
                          <Star className="w-4 h-4 text-[#ffaa00]" strokeWidth={3} /> Following ({alertPrefs.followedVenues.length})
                      </h3>
                      <div className="bg-slate-800 border-2 border-black shadow-[4px_4px_0px_0px_#000]">
                          {venues.map(venue => (
                              <div key={venue.id} className="flex items-center justify-between p-3 border-b-2 border-black last:border-0 hover:bg-slate-700/50">
                                  <span className="text-xs font-bold text-white uppercase">{venue.name}</span>
                                  <button
                                      onClick={() => toggleFollowVenue(venue.id)}
                                      className={`p-1 transition-colors ${alertPrefs.followedVenues.includes(venue.id) ? 'text-[#ffaa00]' : 'text-slate-500'}`}
                                  >
                                      {alertPrefs.followedVenues.includes(venue.id) ? <ThumbsUp className="w-4 h-4" strokeWidth={3} /> : <Star className="w-4 h-4" strokeWidth={3} />}
                                  </button>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-5 border-t-4 border-black space-y-3 bg-black">
                  {userProfile.role === 'owner' ? (
                      <button 
                          onClick={() => { setShowOwnerDashboard(true); setShowMenu(false); }}
                          className="w-full bg-[#ffaa00] p-3 text-left font-['Bangers'] text-lg text-black border-2 border-black flex justify-between items-center shadow-[4px_4px_0px_0px_#fff]"
                      >
                          <span className="flex items-center gap-2"><Settings className="w-5 h-5" strokeWidth={3} /> OWNER DASHBOARD</span>
                          <ChevronRight className="w-5 h-5" strokeWidth={3} />
                      </button>
                  ) : (
                      <button 
                          onClick={() => { setLoginMode('owner'); setShowLoginModal(true); setShowMenu(false); }}
                          className="w-full bg-slate-800 p-3 text-left font-bold text-xs border-2 border-slate-600 flex justify-between items-center hover:bg-slate-700 text-slate-400 font-['Roboto_Condensed'] uppercase"
                      >
                          Venue Admin Login <Lock className="w-3 h-3 text-slate-500" />
                      </button>
                  )}
                  
                  {userProfile.role !== 'guest' && (
                      <button onClick={handleLogout} className="w-full text-center text-xs text-red-500 font-black uppercase py-2 hover:text-red-400 border border-red-900 bg-red-900/10">
                          SIGN OUT
                      </button>
                  )}
              </div>
          </div>
      </div>
  );

  const renderHomeFeed = () => {
    const filteredVenues = venues.filter(v => {
        if (pulseFilter === 'all') return true;
        if (pulseFilter === 'buzzing') return v.status === 'buzzing';
        if (pulseFilter === 'lively') return v.status === 'lively';
        if (pulseFilter === 'chill') return v.status === 'chill';
        if (pulseFilter === 'deals') return !!v.deal;
        if (pulseFilter === 'events') return !!v.leagueEvent;
        return true;
    });

    return (
    <div className="space-y-4 p-4 pb-28">
      {/* Header and Filter Row */}
      <div className="space-y-3 mb-4">
          <div className="flex justify-between items-end border-b-4 border-black pb-2">
             <div className="flex items-center gap-2">
                 <h3 className="text-white text-2xl font-['Bangers'] uppercase tracking-wider">The Oly Pulse</h3>
                 <button onClick={(e) => {
                     e.stopPropagation();
                     openInfo("The Oly Pulse", "This shows how busy each bar feels right now. It’s based mostly on real check-ins.")
                 }}>
                     <Info className="w-4 h-4 text-[#39ff14] hover:text-white" strokeWidth={3} />
                 </button>
             </div>
             <span className="text-[12px] font-black text-black bg-[#39ff14] px-2 border border-black transform -skew-x-12">{filteredVenues.length} SPOTS</span>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
            {[
                { id: 'all', label: 'ALL' },
                { id: 'buzzing', label: '🔥 BUZZING' },
                { id: 'deals', label: '💰 DEALS' },
                { id: 'events', label: '🏆 LEAGUE' },
                { id: 'lively', label: '👥 LIVELY' },
                { id: 'chill', label: '🧊 CHILL' }
            ].map(f => (
                <button
                    key={f.id}
                    onClick={() => setPulseFilter(f.id)}
                    className={`px-3 py-1 text-sm font-['Bangers'] tracking-wider border-2 border-black transition-all whitespace-nowrap shadow-[2px_2px_0px_0px_#000]
                    ${pulseFilter === f.id 
                        ? 'bg-[#39ff14] text-black translate-x-[1px] translate-y-[1px] shadow-none' 
                        : 'bg-white text-black hover:bg-slate-200'}`}
                >
                    {f.label}
                </button>
            ))}
          </div>
      </div>
      
      {filteredVenues.length === 0 ? (
          <div className="text-center py-12 border-4 border-dashed border-slate-800 bg-slate-900/50">
              <p className="text-slate-500 text-lg font-['Bangers'] mb-2 uppercase">No venues found matching that vibe.</p>
              <button onClick={() => setPulseFilter('all')} className="text-[#39ff14] font-bold text-sm hover:underline uppercase">
                  Reset Filters
              </button>
          </div>
      ) : (
          filteredVenues.map(venue => (
            <div 
              key={venue.id} 
              onClick={() => setViewVenueDetail(venue.id)}
              className="bg-slate-800 border-2 border-black p-4 shadow-[6px_6px_0px_0px_#000] transition-all cursor-pointer active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#000] mb-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-['Bangers'] text-2xl text-white tracking-wide uppercase">{venue.name}</h4>
                    {venue.isHQ && <span className="text-[10px] bg-[#ffaa00] text-black px-1.5 py-0.5 border border-black font-black uppercase">HQ</span>}
                  </div>
                  <p className="text-xs text-[#39ff14] mt-0.5 uppercase tracking-wider font-bold">{venue.type}</p>
                  <div className="flex items-center gap-1 mt-1">
                     <div className="w-2 h-2 bg-slate-500 border border-black"></div>
                     <p className="text-[11px] text-slate-400 italic font-bold">"{venue.vibe}"</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <PulseMeter status={venue.status} />
                  <span className="text-[10px] text-black font-black bg-white px-2 py-0.5 border border-black">{venue.checkIns} HERE</span>
                </div>
              </div>
              
              {venue.leagueEvent && (
                <div className="mt-3 bg-slate-900 px-3 py-2 flex items-center justify-between border-2 border-black border-dashed">
                   <div className="flex items-center gap-2">
                     <Trophy className="w-4 h-4 text-[#ffaa00]" strokeWidth={3} />
                     <span className="text-xs font-black text-white uppercase tracking-wide">
                       League: {venue.leagueEvent}
                     </span>
                   </div>
                   <button 
                     onClick={(e) => {
                        e.stopPropagation();
                        if (['cornhole', 'openmic', 'bingo'].includes(venue.leagueEvent!)) setActiveTab('events');
                        else if (venue.leagueEvent === 'arcade') setActiveTab('arcade');
                        else if (venue.leagueEvent === 'karaoke') setActiveTab('karaoke');
                        else if (venue.leagueEvent === 'trivia') setActiveTab('trivia');
                     }}
                     className="text-[10px] text-black bg-[#ffaa00] font-bold hover:bg-amber-400 flex items-center px-2 py-1 border border-black shadow-[2px_2px_0px_0px_#000]"
                   >
                     GO <ChevronRight className="w-3 h-3 ml-1" strokeWidth={3} />
                   </button>
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleClockIn(venue); }}
                  disabled={clockedInVenue === venue.id}
                  className={`flex-1 py-3 font-['Bangers'] text-lg uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-black shadow-[4px_4px_0px_0px_#000] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all
                    ${clockedInVenue === venue.id 
                      ? 'bg-green-700 text-white cursor-default' 
                      : 'bg-[#39ff14] hover:bg-green-400 text-black'}`}
                >
                  {clockedInVenue === venue.id ? (
                    <> <CheckCircle className="w-5 h-5" strokeWidth={3} /> CHECKED IN </>
                  ) : (
                    <> <MapPin className="w-5 h-5" strokeWidth={3} /> CLOCK IN (+10) </>
                  )}
                </button>
              </div>
            </div>
          ))
      )}
    </div>
    );
  };

  const renderArcadeHub = () => (
      <div className="p-4 pb-28 space-y-4">
        <div className="bg-[#39ff14] border-2 border-black p-4 shadow-[4px_4px_0px_0px_#000]">
           <h2 className="text-3xl font-['Bangers'] text-black uppercase tracking-wider leading-none">ARCADE SECTOR</h2>
           <p className="font-['Roboto_Condensed'] font-bold text-black text-sm">HIGH SCORES & TOKENS</p>
        </div>
        {venues.filter(v => v.leagueEvent === 'arcade').map(v => (
            <div key={v.id} onClick={() => setViewVenueDetail(v.id)} className="bg-slate-800 border-2 border-black p-4 shadow-[4px_4px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer">
                <div className="flex justify-between items-start">
                    <h3 className="text-xl font-['Bangers'] text-white tracking-wide">{v.name}</h3>
                    <Gamepad2 className="w-6 h-6 text-[#39ff14]" strokeWidth={3} />
                </div>
                <p className="text-slate-300 font-bold text-sm mt-1">{v.deal || "Open Play Available"}</p>
            </div>
        ))}
        {venues.filter(v => v.leagueEvent === 'arcade').length === 0 && (
             <div className="text-center p-8 border-2 border-dashed border-slate-700 font-['Roboto_Condensed'] text-slate-500 font-bold uppercase">No Active Arcades</div>
        )}
      </div>
  );

  const renderKaraokeHub = () => (
      <div className="p-4 pb-28 space-y-4">
        <div className="bg-[#ff00ff] border-2 border-black p-4 shadow-[4px_4px_0px_0px_#000]">
           <h2 className="text-3xl font-['Bangers'] text-white uppercase tracking-wider leading-none">KARAOKE LOUNGE</h2>
           <p className="font-['Roboto_Condensed'] font-bold text-white text-sm">MIC IS HOT</p>
        </div>
        {venues.filter(v => v.leagueEvent === 'karaoke').map(v => (
            <div key={v.id} onClick={() => setViewVenueDetail(v.id)} className="bg-slate-800 border-2 border-black p-4 shadow-[4px_4px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer">
                <div className="flex justify-between items-start">
                    <h3 className="text-xl font-['Bangers'] text-white tracking-wide">{v.name}</h3>
                    <Mic className="w-6 h-6 text-[#ff00ff]" strokeWidth={3} />
                </div>
                <p className="text-slate-300 font-bold text-sm mt-1">{v.description?.substring(0,60)}...</p>
            </div>
        ))}
        {venues.filter(v => v.leagueEvent === 'karaoke').length === 0 && (
             <div className="text-center p-8 border-2 border-dashed border-slate-700 font-['Roboto_Condensed'] text-slate-500 font-bold uppercase">No Active Karaoke</div>
        )}
      </div>
  );

  const renderTriviaHub = () => (
      <div className="p-4 pb-28 space-y-4">
        <div className="bg-[#00ffff] border-2 border-black p-4 shadow-[4px_4px_0px_0px_#000]">
           <h2 className="text-3xl font-['Bangers'] text-black uppercase tracking-wider leading-none">TRIVIA BLOCK</h2>
           <p className="font-['Roboto_Condensed'] font-bold text-black text-sm">KNOWLEDGE IS POWER</p>
        </div>
        {venues.filter(v => v.leagueEvent === 'trivia').map(v => (
            <div key={v.id} onClick={() => setViewVenueDetail(v.id)} className="bg-slate-800 border-2 border-black p-4 shadow-[4px_4px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer">
                <div className="flex justify-between items-start">
                    <h3 className="text-xl font-['Bangers'] text-white tracking-wide">{v.name}</h3>
                    <Brain className="w-6 h-6 text-[#00ffff]" strokeWidth={3} />
                </div>
                <p className="text-slate-300 font-bold text-sm mt-1">Starts 7PM / Teams of 6</p>
            </div>
        ))}
        {venues.filter(v => v.leagueEvent === 'trivia').length === 0 && (
             <div className="text-center p-8 border-2 border-dashed border-slate-700 font-['Roboto_Condensed'] text-slate-500 font-bold uppercase">No Active Trivia</div>
        )}
      </div>
  );

  const renderEventsHub = () => (
      <div className="p-4 pb-28 space-y-4">
        <div className="bg-[#ffaa00] border-2 border-black p-4 shadow-[4px_4px_0px_0px_#000]">
           <h2 className="text-3xl font-['Bangers'] text-black uppercase tracking-wider leading-none">EVENT WIRE</h2>
           <p className="font-['Roboto_Condensed'] font-bold text-black text-sm">CITYWIDE FEEDS</p>
        </div>
        {venues.filter(v => v.leagueEvent && !['arcade', 'karaoke', 'trivia'].includes(v.leagueEvent)).map(v => (
            <div key={v.id} onClick={() => setViewVenueDetail(v.id)} className="bg-slate-800 border-2 border-black p-4 shadow-[4px_4px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer">
                <div className="flex justify-between items-start">
                    <h3 className="text-xl font-['Bangers'] text-white tracking-wide">{v.name}</h3>
                    <Calendar className="w-6 h-6 text-[#ffaa00]" strokeWidth={3} />
                </div>
                <span className="bg-white text-black font-black text-xs px-2 py-1 border border-black uppercase mt-2 inline-block shadow-[2px_2px_0px_0px_#000]">{v.leagueEvent}</span>
            </div>
        ))}
        {venues.filter(v => v.leagueEvent && !['arcade', 'karaoke', 'trivia'].includes(v.leagueEvent)).length === 0 && (
             <div className="text-center p-8 border-2 border-dashed border-slate-700 font-['Roboto_Condensed'] text-slate-500 font-bold uppercase">No Other Events</div>
        )}
      </div>
  );

  const renderLeagueHQ = () => {
    const hqVenue = venues.find(v => v.isHQ);

    return (
      <div className="p-4 pb-28 text-white space-y-6">
          
          {/* Hero Section */}
          <div className="text-center mb-6">
              <h1 className="text-5xl font-['Bangers'] text-[#39ff14] uppercase tracking-wide leading-none mb-2 drop-shadow-[4px_4px_0px_#000]">Olympia Bar League</h1>
              <p className="text-white text-sm font-bold font-['Roboto_Condensed'] leading-relaxed max-w-xs mx-auto bg-black border-2 border-white p-2 transform rotate-1">
                  Your playbook for league nights in Olympia.
              </p>
              
              <div className="flex gap-2 mt-6 justify-center">
                  <button onClick={() => setLeagueTab('schedule')} className="bg-[#39ff14] text-black font-['Bangers'] text-lg px-4 py-2 border-2 border-black shadow-[4px_4px_0px_0px_#000] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]">
                      Tonight
                  </button>
                  <button onClick={() => setLeagueTab('overview')} className="bg-white text-black font-['Bangers'] text-lg px-4 py-2 border-2 border-black shadow-[4px_4px_0px_0px_#000] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]">
                      How it Works
                  </button>
              </div>
          </div>

          {/* Sub Nav */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar border-b-4 border-black">
              {['overview', 'schedule', 'standings', 'bars', 'rules'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setLeagueTab(tab as any)}
                    className={`px-4 py-2 text-sm font-['Bangers'] uppercase tracking-wider whitespace-nowrap transition-all border-2 border-black
                    ${leagueTab === tab 
                        ? 'bg-[#ffaa00] text-black shadow-[2px_2px_0px_0px_#000] translate-y-[-2px]' 
                        : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}
                  >
                      {tab}
                  </button>
              ))}
          </div>

          {/* Content Sections */}
          <div className="space-y-8 min-h-[400px] bg-slate-800 p-4 border-2 border-black shadow-[6px_6px_0px_0px_#000]">
              
              {leagueTab === 'overview' && (
                  <div className="space-y-6">
                      <h2 className="text-3xl font-['Bangers'] text-white mb-4 border-b-2 border-white inline-block">HOW IT WORKS</h2>
                      <div className="space-y-4">
                          {[{t:'Who',d:'Open to anyone 21+. Just create a handle.'}, {t:'What',d:'Check-ins, trivia, karaoke points.'}, {t:'How',d:'Clock in (max 2/12hrs), snap pics, play events.'}].map(i => (
                              <div key={i.t} className="bg-slate-900 p-3 border-2 border-black">
                                  <h3 className="text-[#39ff14] font-black text-xs uppercase mb-1 bg-black inline-block px-1">{i.t}</h3>
                                  <p className="text-sm text-white font-bold font-['Roboto_Condensed']">{i.d}</p>
                              </div>
                          ))}
                      </div>
                  </div>
              )}

              {leagueTab === 'schedule' && (
                  <div className="space-y-4">
                      <h2 className="text-3xl font-['Bangers'] text-white px-2">UPCOMING NIGHTS</h2>
                      <div className="bg-white p-4 border-2 border-black shadow-[4px_4px_0px_0px_#9333ea]">
                          <div className="flex justify-between items-start mb-2">
                              <div>
                                  <h3 className="font-['Bangers'] text-black text-xl">Karaoke Championship</h3>
                                  <p className="text-xs font-bold text-black uppercase">China Clipper</p>
                              </div>
                              <span className="text-[10px] font-black bg-purple-600 text-white px-2 py-1 border border-black">TONIGHT 9PM</span>
                          </div>
                          <p className="text-xs text-black font-bold">Double points for all singers.</p>
                      </div>
                  </div>
              )}

              {leagueTab === 'standings' && (
                  <div>
                      <h2 className="text-3xl font-['Bangers'] text-white px-2 mb-4">LEADERBOARD</h2>
                      <div className="bg-white border-2 border-black">
                          <div className="divide-y-2 divide-black">
                              {[
                                  { rank: 1, name: "BarFly_99", points: 4520, badge: "👑" },
                                  { rank: 2, name: "IPA_Lover", points: 3890, badge: "🥈" },
                                  { rank: 3, name: "TriviaKing", points: 3650, badge: "🥉" },
                              ].map((player) => (
                                  <div key={player.rank} className="flex items-center justify-between p-4 text-black">
                                      <div className="flex items-center gap-4">
                                          <span className="font-['Bangers'] text-2xl w-8 text-center text-[#ffaa00] drop-shadow-[1px_1px_0px_#000]">#{player.rank}</span>
                                          <p className="font-black text-sm uppercase">{player.name} {player.badge}</p>
                                      </div>
                                      <span className="font-mono font-black text-sm">{player.points.toLocaleString()}</span>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
              )}

              {/* ... other tabs ... */}
              {leagueTab === 'bars' && (
                  <div className="space-y-4">
                     <h2 className="text-3xl font-['Bangers'] text-white px-2 mb-4">VENUES</h2>
                     {venues.map(v => (
                         <div key={v.id} className="bg-slate-900 border-2 border-black p-3 flex justify-between items-center hover:bg-slate-800 cursor-pointer" onClick={() => setViewVenueDetail(v.id)}>
                             <span className="font-['Bangers'] text-white text-lg tracking-wide">{v.name}</span>
                             {v.isHQ && <Crown className="w-5 h-5 text-[#ffaa00]" strokeWidth={3} />}
                         </div>
                     ))}
                  </div>
              )}

               {leagueTab === 'rules' && (
                  <div className="space-y-4">
                     <h2 className="text-3xl font-['Bangers'] text-white px-2 mb-4">RULES</h2>
                     <div className="bg-red-600 border-2 border-black p-4 shadow-[4px_4px_0px_0px_#000]">
                         <h3 className="font-['Bangers'] text-white text-xl uppercase">Respect the Staff</h3>
                         <p className="font-bold text-white text-sm">Bartenders are the referees.</p>
                     </div>
                  </div>
              )}
          </div>
      </div>
    );
  };

  if (!hasAcceptedTerms) {
      return (
          <div className="fixed inset-0 bg-slate-900 z-[100] flex items-center justify-center p-6 text-center">
              <div className="max-w-sm w-full space-y-6">
                  <Shield className="w-20 h-20 text-[#39ff14] mx-auto drop-shadow-[4px_4px_0px_#000]" strokeWidth={3} />
                  <div>
                      <h1 className="text-5xl font-['Bangers'] text-white tracking-wide leading-none drop-shadow-[4px_4px_0px_#000]">OLYBARS</h1>
                      <p className="text-[#39ff14] mt-2 text-sm uppercase tracking-widest font-black bg-black inline-block px-2 transform -skew-x-12">The Nightlife OS</p>
                  </div>
                  
                  <div className="bg-slate-800 p-6 border-4 border-black shadow-[8px_8px_0px_0px_#39ff14] space-y-4">
                      <p className="text-2xl font-['Bangers'] text-white uppercase">21+ Adults Only</p>
                      <p className="text-sm text-slate-300 leading-relaxed font-bold font-['Roboto_Condensed']">
                          By continuing, you agree to our Terms of Use and Privacy Policy.
                      </p>
                      <div className="bg-black p-3 text-[10px] text-slate-400 border border-slate-700 font-mono">
                          We do not encourage excessive drinking. Max 2 check-ins allowed per 12 hours. No purchase necessary.
                      </div>
                      <button 
                          onClick={handleAcceptTerms}
                          className="w-full bg-[#39ff14] hover:bg-green-400 text-black font-['Bangers'] text-2xl uppercase tracking-wider py-3 border-2 border-black shadow-[4px_4px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
                      >
                          I AM 21+ & AGREE
                      </button>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-[#111827] text-white font-sans max-w-md mx-auto relative shadow-2xl overflow-hidden border-x-4 border-black flex flex-col">
      
      {/* HEADER & CLOCK (STICKY) */}
      <div className="sticky top-0 z-30 bg-black shadow-md border-b-2 border-black">
        <div className="p-3 flex justify-between items-center bg-black">
            <div className="font-['Bangers'] text-3xl tracking-wide text-white flex items-center gap-1 drop-shadow-md">
                OLYBARS<span className="text-[#39ff14]">.COM</span>
            </div>
            <button onClick={() => setShowMenu(true)} className="text-white hover:text-[#39ff14] transition-colors">
                <Menu className="w-8 h-8" strokeWidth={3} />
            </button>
        </div>
        <BuzzClock venues={venues} />
        
        {/* 2x3 LEAGUE GRID NAV (STICKY) */}
        <div className="bg-black p-1 border-b-4 border-black">
            <div className="grid grid-cols-3 gap-1">
                {[
                    { id: 'pulse', label: 'PULSE', icon: Flame },
                    { id: 'karaoke', label: 'KARAOKE', icon: Mic },
                    { id: 'trivia', label: 'TRIVIA', icon: Brain },
                    { id: 'arcade', label: 'ARCADE', icon: Gamepad2 },
                    { id: 'events', label: 'EVENTS', icon: Calendar },
                    { id: 'league', label: 'LEAGUE HQ', icon: Crown },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex flex-col items-center justify-center py-2 transition-all border-2
                        ${activeTab === tab.id 
                            ? 'bg-white border-black text-black shadow-[2px_2px_0px_0px_#39ff14] translate-y-[-2px]' 
                            : 'bg-slate-900 border-slate-800 text-slate-500 hover:bg-slate-800 hover:text-slate-200'}`}
                    >
                        <tab.icon className={`w-5 h-5 mb-1 ${activeTab === tab.id ? 'text-black' : 'text-slate-500'}`} strokeWidth={3} />
                        <span className="text-[10px] font-black font-['Bangers'] tracking-wider">{tab.label}</span>
                    </button>
                ))}
            </div>
        </div>
      </div>

      {/* Main Content Area (Scrollable) */}
      <div className="flex-1 overflow-y-auto bg-[#1a1a1a] relative">
        {activeTab === 'pulse' && renderHomeFeed()}
        {activeTab === 'arcade' && renderArcadeHub()}
        {activeTab === 'karaoke' && renderKaraokeHub()}
        {activeTab === 'trivia' && renderTriviaHub()}
        {activeTab === 'events' && renderEventsHub()}
        {activeTab === 'league' && renderLeagueHQ()}
        
        {/* Venue Detail Overlay (Conditionally Rendered) */}
        {viewVenueDetail && renderVenueDetail()}
      </div>

      {/* Artie FAB */}
      <div className="fixed bottom-20 right-4 z-30">
        <button 
          onClick={() => setShowArtie(!showArtie)}
          className="bg-white hover:bg-slate-100 text-black p-3 rounded-full shadow-[4px_4px_0px_0px_#000] border-2 border-black transition-transform hover:scale-110 active:scale-95"
        >
          <div className="relative">
             <MessageCircle className="w-8 h-8" strokeWidth={3} />
             <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full border border-black animate-ping" />
             <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full border border-black" />
          </div>
        </button>
      </div>

      {/* Artie Chat Window */}
      {showArtie && (
        <div className="fixed bottom-36 right-4 w-72 bg-slate-800 border-2 border-black shadow-[8px_8px_0px_0px_#000] z-40 overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-[#ffaa00] p-3 flex justify-between items-center border-b-2 border-black">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-full overflow-hidden border-2 border-black flex items-center justify-center shadow-sm">
                 <span className="text-black font-black text-xs">A</span>
              </div>
              <div>
                <span className="font-['Bangers'] text-black block text-lg tracking-wide leading-none">Artie</span>
                <span className="text-[9px] text-black font-bold uppercase tracking-wider">Powered by Well 80</span>
              </div>
            </div>
            <button onClick={() => setShowArtie(false)} className="text-black hover:text-white transition-colors"><X className="w-6 h-6" strokeWidth={3} /></button>
          </div>
          <div className="p-4 h-64 overflow-y-auto space-y-3 bg-slate-900">
            {artieMessages.map((msg, idx) => (
              <div key={idx} className={`text-xs p-3 font-bold border-2 border-black shadow-[2px_2px_0px_0px_#000] max-w-[90%] leading-relaxed ${msg.sender === 'artie' ? 'bg-white text-black self-start' : 'bg-[#39ff14] text-black self-end ml-auto'}`}>
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="p-2 bg-black border-t-2 border-black flex gap-2">
             <input 
               type="text" 
               value={chatInput}
               onChange={(e) => setChatInput(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
               placeholder="Ask Artie..." 
               className="flex-1 bg-white text-black font-bold text-xs px-3 py-2 border-2 border-black focus:border-[#39ff14] outline-none transition-colors rounded-none" 
             />
             <button onClick={handleChatSend} className="p-2 bg-[#ffaa00] text-black border-2 border-black hover:bg-amber-400 transition-colors shadow-[2px_2px_0px_0px_#fff] active:shadow-none active:translate-x-[1px] active:translate-y-[1px]">
               <Send className="w-4 h-4" strokeWidth={3} />
             </button>
          </div>
        </div>
      )}

      {/* LOGIN / PROFILE MODAL */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        loginMode={loginMode}
        setLoginMode={setLoginMode}
        userProfile={userProfile}
        setUserProfile={setUserProfile}
        venues={venues}
        onOwnerSuccess={() => setShowOwnerDashboard(true)}
      />

      {/* OWNER DASHBOARD */}
      <OwnerDashboard
        isOpen={showOwnerDashboard}
        onClose={() => setShowOwnerDashboard(false)}
        venues={venues}
        updateVenue={handleUpdateVenue}
        openInfo={openInfo}
        onViewPage={(id) => {
            setShowOwnerDashboard(false);
            setViewVenueDetail(id);
        }}
      />

      {/* SIDE MENU (HAMBURGER DRAWER) */}
      {renderSideMenu()}

      {/* ONBOARDING MODAL */}
      {showOnboarding && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[60] flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-sm overflow-hidden border-4 border-black shadow-[8px_8px_0px_0px_#ffaa00] p-6 relative">
                <button onClick={() => setShowOnboarding(false)} className="absolute top-4 right-4 text-black hover:scale-110 transition-transform">
                    <X className="w-6 h-6" strokeWidth={3} />
                </button>
                
                <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-[#ffaa00] shadow-[4px_4px_0px_0px_#000]">
                        {renderIconForOnboarding(onboardingStep)}
                    </div>
                    
                    <h2 className="text-3xl font-['Bangers'] text-black mb-2 uppercase tracking-wide">
                        {renderOnboardingContent(onboardingStep).title}
                    </h2>
                    
                    <p className="text-sm text-slate-800 font-bold font-['Roboto_Condensed'] leading-relaxed px-2">
                        {renderOnboardingContent(onboardingStep).text}
                    </p>
                </div>

                <div className="flex gap-2">
                    {onboardingStep < MAX_ONBOARDING_STEPS ? (
                        <button 
                            onClick={() => setOnboardingStep(prev => prev + 1)}
                            className="w-full bg-slate-200 hover:bg-slate-300 text-black font-['Bangers'] text-xl uppercase tracking-wider py-3 border-2 border-black shadow-[4px_4px_0px_0px_#000] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                        >
                            NEXT ({onboardingStep}/{MAX_ONBOARDING_STEPS})
                        </button>
                    ) : (
                        <button 
                            onClick={() => setShowOnboarding(false)}
                            className="w-full bg-[#39ff14] hover:bg-green-400 text-black font-['Bangers'] text-xl uppercase tracking-wider py-3 border-2 border-black shadow-[4px_4px_0px_0px_#000] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                        >
                            GET STARTED
                        </button>
                    )}
                </div>
                
                <div className="flex justify-center gap-2 mt-6">
                    {[1, 2, 3, 4].map(step => (
                        <div key={step} className={`w-3 h-3 border-2 border-black transition-colors ${onboardingStep === step ? 'bg-[#ffaa00]' : 'bg-white'}`} />
                    ))}
                </div>
            </div>
        </div>
      )}

      {/* Clock In Modal */}
      {showClockInModal && selectedVenue && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-in zoom-in-95 duration-200">
          <div className="bg-white w-full max-w-sm overflow-hidden border-4 border-black shadow-[8px_8px_0px_0px_#000] relative">
            
            {/* Camera Overlay */}
            {showCamera && (
                 <div className="absolute inset-0 z-50 bg-black flex flex-col">
                     <video ref={videoRef} autoPlay playsInline className="flex-1 object-cover w-full" />
                     <canvas ref={canvasRef} className="hidden" />
                     <div className="p-6 bg-black/80 flex justify-between items-center absolute bottom-0 w-full border-t-4 border-[#39ff14]">
                         <button onClick={() => {setShowCamera(false); const stream = videoRef.current?.srcObject as MediaStream; stream?.getTracks().forEach(t => t.stop());}} className="text-white font-['Bangers'] uppercase tracking-wider text-xl">Cancel</button>
                         <button onClick={capturePhoto} className="w-20 h-20 bg-white rounded-full border-4 border-black shadow-[0px_0px_0px_4px_#39ff14] active:scale-95 transition-transform"></button>
                         <div className="w-10"></div>
                     </div>
                 </div>
            )}

            <div className="bg-[#ffaa00] p-6 text-center border-b-4 border-black relative">
              <button onClick={() => setShowClockInModal(false)} className="absolute top-4 right-4 text-black hover:scale-110"><X className="w-6 h-6" strokeWidth={3}/></button>
              <h2 className="text-2xl font-['Bangers'] text-black uppercase tracking-wider mb-1">Clock In Check</h2>
              <p className="text-black text-xs font-black uppercase bg-white inline-block px-1 border border-black">Limit: 2 per 12 hours</p>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="text-center">
                <p className="text-slate-500 text-[10px] uppercase tracking-widest mb-2 font-black">You are confirming location:</p>
                <h3 className="text-3xl font-['Bangers'] text-black uppercase">{selectedVenue.name}</h3>
                <p className="text-[#39ff14] text-xs mt-1 font-black bg-black inline-block px-2 py-0.5 uppercase transform -skew-x-12">{selectedVenue.type}</p>
              </div>

              {/* PHOTO PROOF UI */}
              <div 
                  onClick={capturedPhoto ? undefined : startCamera}
                  className={`border-4 border-dashed rounded-sm p-6 text-center transition-all cursor-pointer group relative overflow-hidden
                  ${capturedPhoto ? 'border-[#39ff14] bg-black' : 'border-black bg-slate-100 hover:bg-white hover:border-[#39ff14]'}`}
              >
                  {capturedPhoto ? (
                      <div className="relative">
                          <img src={capturedPhoto} alt="Vibe Check" className="w-full h-40 object-cover border-2 border-white mb-2" />
                          <div className="flex gap-2">
                             <button onClick={() => setCapturedPhoto(null)} className="flex-1 text-xs text-slate-400 py-2 hover:text-white font-bold uppercase">Retake</button>
                             <button onClick={handleShare} className="flex-1 bg-[#ffaa00] text-black text-xs font-black py-2 border-2 border-black flex items-center justify-center gap-1 hover:bg-amber-400 shadow-[2px_2px_0px_0px_#fff]">
                                 <Share2 className="w-3 h-3" strokeWidth={3} /> SHARE (+5 PTS)
                             </button>
                          </div>
                      </div>
                  ) : (
                    <>
                        {cameraError ? (
                            <div className="py-4">
                                <p className="text-red-600 text-xs mb-2 font-bold">Camera access denied.</p>
                                <input type="file" accept="image/*" capture="environment" className="text-xs text-black" onChange={(e) => {
                                    if(e.target.files?.[0]) {
                                        const reader = new FileReader();
                                        reader.onload = (ev) => { if(ev.target?.result) { setCapturedPhoto(ev.target.result as string); awardPoints('photo'); }};
                                        reader.readAsDataURL(e.target.files[0]);
                                    }
                                }}/>
                            </div>
                        ) : (
                            <>
                                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-[#39ff14] transition-colors shadow-[4px_4px_0px_0px_#000] border-2 border-black">
                                    <Camera className="w-8 h-8 text-white group-hover:text-black" strokeWidth={3} />
                                </div>
                                <p className="text-sm font-['Bangers'] text-black uppercase tracking-wide">Take Vibe Photo (+10 Pts)</p>
                                <p className="text-[10px] text-slate-500 mt-1 font-bold font-['Roboto_Condensed'] uppercase">Logo, Menu, or Selfie</p>
                            </>
                        )}
                    </>
                  )}
              </div>

              {/* Legal Protocol */}
              <div className="bg-slate-100 p-3 text-[10px] text-slate-500 border-2 border-black flex gap-2 items-start leading-tight">
                 <Info className="w-4 h-4 shrink-0 text-black" strokeWidth={3} />
                 <p className="font-bold">
                   Clocking in earns League points. 
                   <span className="text-black block mt-1 font-black uppercase">Max 2 check-ins per 12 hours. No purchase required.</span>
                 </p>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={confirmClockIn}
                  className="w-full bg-[#39ff14] hover:bg-green-400 text-black font-['Bangers'] text-xl uppercase tracking-wider py-4 border-2 border-black shadow-[4px_4px_0px_0px_#000] active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                  <MapPin className="w-6 h-6" strokeWidth={3} /> CONFIRM I AM HERE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Popup Overlay */}
      {renderInfoPopup()}

      {/* Cookies Consent */}
      {!hasAcceptedCookies && hasAcceptedTerms && (
          <div className="fixed bottom-14 left-0 right-0 p-4 z-50">
              <div className="bg-white border-2 border-black p-3 shadow-[4px_4px_0px_0px_#000] flex items-center justify-between gap-4 max-w-md mx-auto">
                  <div className="flex items-center gap-3">
                      <Cookie className="w-6 h-6 text-black" strokeWidth={3} />
                      <p className="text-xs text-black font-bold font-['Roboto_Condensed']">We use cookies for essential functionality.</p>
                  </div>
                  <button onClick={handleAcceptCookies} className="bg-black hover:bg-slate-800 text-white text-xs font-black uppercase px-3 py-1.5 transition-colors whitespace-nowrap border-2 border-white shadow-[2px_2px_0px_0px_#999]">
                      Got it
                  </button>
              </div>
          </div>
      )}

      {/* Footer / Points */}
      <div className="fixed bottom-0 w-full max-w-md bg-black border-t-4 border-[#39ff14] p-3 flex justify-between items-center z-20 shadow-2xl">
         <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-2 border-2 border-white relative shadow-sm">
               <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#39ff14] rounded-full border border-black"></div>
               <Trophy className="w-5 h-5 text-[#ffaa00]" strokeWidth={3} />
            </div>
            <div>
               <p className="text-[9px] text-slate-400 uppercase tracking-wide font-black flex items-center gap-1">
                   My League Points
                   <button onClick={() => openInfo("My League Points", "Earn points by checking in, joining League Nights, and sharing vibe photos. Points are for fun and bragging rights.")}>
                       <HelpCircle className="w-3 h-3 text-white hover:text-[#39ff14]" />
                   </button>
               </p>
               <p className="font-mono font-black text-xl text-white leading-none">{userPoints.toLocaleString()}</p>
            </div>
         </div>
         <div className="text-right">
            <p className="text-[9px] text-slate-500 font-bold uppercase">Season ends Dec 31</p>
            <p className="text-[10px] text-black font-black bg-[#ffaa00] border-2 border-white px-1 mt-0.5 inline-block transform skew-x-12">RANK: #42</p>
         </div>
      </div>
    </div>
  );
}