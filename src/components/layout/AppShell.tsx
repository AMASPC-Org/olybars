import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  Clock,
  Flame,
  Mic,
  Brain,
  Music,
  List,
  Ticket,
  Crown,
  Trophy,
  X,
  Map as MapIcon,
  MoreHorizontal,
  User,
  LogIn,
  LogOut,
  Search,
  Star,
  Bell,
  Lock,
  ChevronRight,
  Settings as SettingsIcon,
  Bot,
  Info,
  Home,
  ShoppingBag,
  Hammer
} from 'lucide-react';
import { Venue, UserProfile } from '../../types';
import { ArtieChatModal } from '../../features/venues/components/ArtieChatModal';
import { ArtieHoverIcon } from '../../features/artie/components/ArtieHoverIcon';
import { CookieBanner } from '../ui/CookieBanner';
import { Footer } from './Footer';

interface AppShellProps {
  venues: Venue[];
  userProfile: UserProfile;
  userPoints: number;
  userRank?: number;
  // if undefined, we default to showing the scoreboard for now
  isLeagueMember?: boolean;
  alertPrefs: any;
  setAlertPrefs: (prefs: any) => void;
  onProfileClick?: () => void;
  onOwnerLoginClick?: () => void;
  onMemberLoginClick?: (mode?: 'login' | 'signup') => void;
  userRole?: string;
  userHandle?: string;
  onLogout?: () => void;
  onToggleFavorite?: (venueId: string) => void;
  onToggleWeeklyBuzz?: () => void;
  showArtie?: boolean;
  setShowArtie?: (show: boolean) => void;
}

// --- The App Shell Component ---
export const AppShell: React.FC<AppShellProps> = ({
  venues,
  userProfile,
  userPoints,
  userRank,
  isLeagueMember,
  alertPrefs,
  setAlertPrefs,
  onProfileClick,
  onOwnerLoginClick,
  onMemberLoginClick,
  userRole,
  userHandle,
  onLogout,
  onToggleFavorite,
  onToggleWeeklyBuzz,
  showArtie,
  setShowArtie
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);

  // Pulse & Buzz Logic
  const activeDeals = venues
    .filter((v) => v.deal && v.dealEndsIn && v.dealEndsIn > 0)
    .sort((a, b) => (a.dealEndsIn || 0) - (b.dealEndsIn || 0));

  const getPulseStatus = () => {
    if (activeDeals.length > 0) return 'buzzing';

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const nextHH = venues
      .filter(v => v.happyHour && !v.deal)
      .map(v => {
        const [h, m] = v.happyHour!.startTime.split(':').map(Number);
        const startMinutes = h * 60 + m;
        return { venue: v, startMinutes, diff: startMinutes - currentMinutes };
      })
      .filter(v => v.diff > 0 && v.diff < 180)
      .sort((a, b) => a.diff - b.diff)[0];

    return nextHH ? 'lively' : 'quiet';
  };

  const pulseStatus = getPulseStatus();

  const getActiveTab = () => {
    const path = location.pathname.split('/')[1];
    return path === '' ? 'pulse' : path;
  };

  const activeTab = getActiveTab();

  const navItems = [
    { id: 'pulse', label: 'PULSE', icon: Flame, path: '/' },
    { id: 'bars', label: 'BARS', icon: Search, path: '/bars' },
    { id: 'map', label: 'MAP', icon: MapIcon, path: '/map' },
    { id: 'league', label: 'LEAGUE', icon: Crown, path: '/league' },
    { id: 'events', label: 'EVENTS', icon: Ticket, path: '/events' },
    { id: 'trivia', label: 'PLAY', icon: Brain, path: '/trivia' },
    { id: 'makers', label: 'MAKERS', icon: Hammer, path: '/makers' },
    { id: 'live', label: 'LIVE', icon: Music, path: '/live' },
  ];

  const handleMenuNavigation = (path: string) => {
    navigate(path);
    setShowMenu(false);
  };

  // default to "true" so behaviour stays same until we wire real roles
  const leagueMember = isLeagueMember ?? true;

  const leagueEventVenue = venues.find((v) => v.leagueEvent);
  const leaguePromoText = leagueEventVenue
    ? `${(leagueEventVenue.leagueEvent || '').toUpperCase()} tonight at ${leagueEventVenue.name
    }`
    : 'Join the Olympia Bar League for local events & prizes.';

  return (
    <div className="h-full bg-background text-white font-sans max-w-md mx-auto relative shadow-2xl overflow-hidden border-x-4 border-black flex flex-col">
      {/* Header Area */}
      <div className="sticky top-0 z-40 bg-background shadow-lg">
        <div className="p-3 flex justify-between items-center bg-black border-b-2 border-primary">
          <div
            onClick={() => navigate('/')}
            className="text-3xl font-black tracking-wide text-white flex items-center gap-1 drop-shadow-md cursor-pointer hover:opacity-80 transition-opacity"
          >
            OLYBARS<span className="text-primary">.COM</span>
          </div>
          <button
            onClick={() => setShowMenu(true)}
            className="text-white hover:text-primary transition-colors"
          >
            <Menu className="w-8 h-8" strokeWidth={3} />
          </button>
        </div>

        {/* Restored Buzz Bar: Happy Hour Utility */}
        <div className="bg-black border-b border-primary/20 p-2 flex justify-between items-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-primary/5 animate-pulse" />
          <div className="flex items-center gap-2 z-10">
            <Clock className="w-3.5 h-3.5 text-primary animate-pulse" />
            <div className="flex flex-col">
              <h2 className="text-[10px] font-black text-primary/80 leading-none uppercase tracking-widest font-league">
                The Pulse
              </h2>
              <span className="text-[10px] text-white font-bold uppercase tracking-tight">
                {activeDeals.length} Happy Hours Active — {venues.filter(v => v.status === 'buzzing').length} Spots Buzzing
              </span>
            </div>
          </div>
          {activeDeals.length > 0 && (
            <div className="z-10 bg-primary/20 border border-primary/50 rounded-lg px-2 py-1 flex items-center gap-1.5">
              <span className="text-[9px] font-black text-primary uppercase">Ending in</span>
              <span className="text-[11px] font-mono font-black text-white">{activeDeals[0].dealEndsIn}m</span>
            </div>
          )}
        </div>

        {/* Fixed 2x4 Grid Navigation: Legibility Focus */}
        <div className="bg-background border-b-2 border-black">
          <div className="grid grid-cols-4 gap-[1px] bg-black/40">
            {navItems.map((tab) => (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className={`flex flex-col items-center justify-center py-3.5 transition-all relative overflow-hidden ${activeTab === tab.id
                  ? 'bg-primary text-black shadow-inner'
                  : tab.id === 'pulse' && pulseStatus === 'buzzing'
                    ? 'bg-primary/10 text-primary'
                    : 'bg-surface text-slate-400 hover:bg-surface/80'
                  }`}
              >
                {tab.id === 'pulse' && (pulseStatus === 'buzzing' || pulseStatus === 'lively') && (
                  <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ${pulseStatus === 'buzzing' ? 'bg-primary animate-ping' : 'bg-blue-400'}`} />
                )}
                <tab.icon className="w-4 h-4 mb-1" strokeWidth={activeTab === tab.id ? 4 : 3} />
                <span className={`text-[10px] font-black tracking-widest font-league uppercase leading-none ${activeTab === tab.id ? 'text-black' : ''}`}>
                  {tab.id === 'pulse' && pulseStatus !== 'quiet' ? pulseStatus : tab.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content (Outlet) */}
      <div className="flex-1 overflow-y-auto relative flex flex-col">
        <div className="flex-1">
          <Outlet context={{ venues, onAskArtie: () => setShowArtie?.(true) }} />
        </div>
        {location.pathname !== '/map' && <Footer />}
      </div>

      {/* Footer / League Bar */}
      <div className="sticky bottom-0 w-full max-w-md bg-black border-t-4 border-primary p-3 z-20 shadow-2xl">
        {leagueMember ? (
          <div className="flex justify-between items-center">
            <div
              className="flex items-center gap-3 cursor-pointer hover:bg-slate-900/50 p-1 rounded-lg transition-all active:scale-95"
              onClick={() => navigate('/profile')}
            >
              <div className="bg-slate-900 p-2 border-2 border-white relative shadow-sm">
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full border border-black" />
                <Trophy className="w-5 h-5 text-primary" strokeWidth={3} />
              </div>
              <div className="flex flex-col">
                <span className="text-[8px] text-primary font-black uppercase tracking-widest leading-none mb-1">League Points</span>
                <p key={userPoints} className="font-mono font-black text-2xl text-white leading-none animate-in zoom-in-95 duration-300">
                  {userPoints.toLocaleString()}
                </p>
              </div>
            </div>
            <div
              className="text-right cursor-pointer hover:bg-slate-900/50 p-1 rounded-lg transition-all active:scale-95"
              onClick={() => navigate('/league?tab=standings')}
            >
              <p className="text-[9px] text-slate-500 font-bold uppercase mx-1">
                Season ends Feb 28, 2026
              </p>
              <div className="flex items-center justify-end gap-1 mt-0.5">
                <span className="text-[10px] text-black font-black bg-primary border-2 border-white px-2 py-0.5 transform -skew-x-12 inline-block">
                  RANK: #{userRank || '-'}
                </span>
                <Star className="w-4 h-4 text-primary fill-primary" />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-center gap-3">
            <div>
              <p className="text-[9px] text-slate-400 font-bold uppercase">
                Olympia Bar League
              </p>
              <p className="text-sm font-black text-white leading-snug">
                {leaguePromoText}
              </p>
            </div>
            <button
              onClick={onProfileClick}
              className="bg-primary text-black text-[11px] font-black uppercase tracking-wider px-3 py-2 border-2 border-black shadow-[3px_3px_0px_0px_#000]"
            >
              View League
            </button>
          </div>
        )}
      </div>

      {/* Hamburger Menu Overlay */}
      {
        showMenu && (
          <div
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm"
            onClick={() => setShowMenu(false)}
          >
            <div
              className="absolute top-0 right-0 w-[85%] max-w-sm bg-[#0f172a] h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 1. TOP SECTION: PROFILE & CLOSE */}
              <div className="bg-primary p-6 flex justify-between items-start border-b border-black/20">
                <div
                  className="flex items-center gap-3 cursor-pointer group"
                  onClick={() => {
                    if (userRole === 'guest') {
                      onMemberLoginClick?.('signup');
                    } else {
                      onProfileClick?.();
                    }
                    setShowMenu(false);
                  }}
                >
                  <div className="w-12 h-12 bg-black rounded-full border-2 border-white flex items-center justify-center group-hover:scale-105 transition-transform">
                    <User className="w-6 h-6 text-primary" strokeWidth={3} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xl font-black text-black leading-none uppercase font-league">
                      {userHandle || "CREATE OLYBARS ID"}
                    </span>
                    <span className="text-[10px] font-black text-black/60 uppercase tracking-widest mt-0.5">
                      {userRole === 'guest' ? "GUEST USER" : userRole?.toUpperCase() || "MEMBER"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowMenu(false)}
                  className="text-black hover:rotate-90 transition-all p-1"
                >
                  <X className="w-8 h-8" strokeWidth={4} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-8">
                {/* 1. LEAGUE HQ PROMINENT LINK */}
                <button
                  onClick={() => handleMenuNavigation('/league')}
                  title="Access rankings, rewards, and the full Bar League leaderboard."
                  className="w-full bg-gradient-to-r from-primary to-yellow-500 p-4 rounded-xl flex items-center justify-between group shadow-lg active:scale-95 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-black/20 p-2 rounded-lg">
                      <Crown className="w-6 h-6 text-black" strokeWidth={3} />
                    </div>
                    <div className="text-left">
                      <span className="block text-black font-black text-sm uppercase tracking-tighter">THE LEAGUE HQ</span>
                      <span className="block text-black/60 text-[8px] font-bold uppercase tracking-widest">Rankings & Rewards</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-black/40 group-hover:text-black transition-colors" />
                </button>

                {/* [NEW] ABOUT OLYBARS */}
                <button
                  onClick={() => handleMenuNavigation('/about')}
                  className="w-full bg-slate-900 border border-white/10 p-4 rounded-xl flex items-center justify-between group hover:border-primary/50 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Info className="w-5 h-5 text-primary" strokeWidth={2} />
                    </div>
                    <div className="text-left">
                      <span className="block text-white font-black text-xs uppercase tracking-tight">ABOUT THE 98501</span>
                      <span className="block text-slate-500 text-[8px] font-bold uppercase tracking-widest">Our Story & Artie Wells</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-primary transition-colors" />
                </button>

                {/* [NEW] MEET ARTIE: THE LEGACY */}
                <button
                  onClick={() => handleMenuNavigation('/meet-artie')}
                  title="The 98501 Legend: Artie Actual"
                  className="w-full bg-slate-900 border border-white/10 p-4 rounded-xl flex items-center justify-between group hover:border-primary/50 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <User className="w-5 h-5 text-primary" strokeWidth={2} />
                    </div>
                    <div className="text-left">
                      <span className="block text-white font-black text-xs uppercase tracking-tight">MEET ARTIE</span>
                      <span className="block text-slate-500 text-[8px] font-bold uppercase tracking-widest">Values & Legend</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-primary transition-colors" />
                </button>

                {/* [NEW] THE MERCH STAND */}
                <button
                  onClick={() => handleMenuNavigation('/merch')}
                  className="w-full bg-slate-900 border border-white/10 p-4 rounded-xl flex items-center justify-between group hover:border-blue-500/50 transition-all shadow-[0_4px_20px_-5px_rgba(59,130,246,0.2)]"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-500/10 p-2 rounded-lg">
                      <ShoppingBag className="w-5 h-5 text-blue-400" strokeWidth={2.5} />
                    </div>
                    <div className="text-left">
                      <span className="block text-white font-black text-xs uppercase tracking-tight group-hover:text-blue-400 transition-colors">MERCH STAND</span>
                      <span className="block text-slate-500 text-[8px] font-bold uppercase tracking-widest leading-none mt-1">Gears & Apparel</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-colors" />
                </button>

                {/* 2. THE PLAYBOOK (Renamed from FAQ) */}
                <button
                  onClick={() => handleMenuNavigation('/faq')}
                  title="The Field Guide: How to play, rules of the well, and FAQ."
                  className="w-full bg-slate-900 border border-white/10 p-4 rounded-xl flex items-center justify-between group hover:border-primary/50 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Brain className="w-5 h-5 text-primary" strokeWidth={2} />
                    </div>
                    <div className="text-left">
                      <span className="block text-white font-black text-xs uppercase tracking-tight">THE PLAYBOOK</span>
                      <span className="block text-slate-500 text-[8px] font-bold uppercase tracking-widest">Help & Field Guide</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-primary transition-colors" />
                </button>

                {/* 3. DISCOVERY LINKS */}
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1 mb-1">Discovery</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Map', icon: MapIcon, path: '/map' },
                      { label: 'Events', icon: Ticket, path: '/events' },
                      { label: 'Play', icon: Brain, path: '/trivia' },
                      { label: 'Makers', icon: Hammer, path: '/makers' },
                      { label: 'Live Music', icon: Music, path: '/live' },
                      { label: 'Bars', icon: Search, path: '/bars' },
                    ].map((item) => (
                      <button
                        key={item.label}
                        onClick={() => handleMenuNavigation(item.path)}
                        title={`Go to ${item.label}`}
                        className="bg-white/5 border border-white/5 py-3 px-4 rounded-xl flex items-center gap-3 hover:bg-white/10 transition-all group"
                      >
                        <item.icon className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-black text-slate-200 uppercase tracking-widest">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. YOUR ACCOUNT */}
                <div className="space-y-3">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-1 mb-3">Your Account</h3>
                  <button
                    onClick={() => {
                      onProfileClick?.();
                      setShowMenu(false);
                    }}
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-between group hover:border-primary/50 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <User className="w-5 h-5 text-primary" strokeWidth={2} />
                      <span className="text-white font-black text-xs uppercase tracking-tight">My Profile</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </button>

                  <div className="bg-surface/30 border border-white/5 rounded-xl p-4 space-y-4 text-left">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Bell className="w-4 h-4 text-slate-500" />
                        <div>
                          <span className="block text-[10px] text-slate-300 font-black uppercase tracking-widest">Weekly Buzz</span>
                          <span className="block text-[8px] text-slate-500 font-bold uppercase mt-0.5">Standings & Artie's Weekly Recs</span>
                        </div>
                      </div>
                      <button
                        onClick={() => onToggleWeeklyBuzz?.()}
                        title="Receive a weekly summary of league standings and upcoming events."
                        className={`w-10 h-5 rounded-full p-1 transition-colors ${userProfile.weeklyBuzz ? 'bg-primary' : 'bg-slate-700'}`}
                      >
                        <div className={`w-3 h-3 bg-black rounded-full transition-transform ${userProfile.weeklyBuzz ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 5. FAVORITE SPOTS */}
                <div className="space-y-3">
                  <h3 className="text-primary font-black flex items-center gap-2 uppercase tracking-widest text-[10px] font-league px-1">
                    <Star className="w-3.5 h-3.5" strokeWidth={3} /> FAVORITE SPOTS
                  </h3>
                  <div className="bg-surface/30 border border-white/5 rounded-xl overflow-hidden divide-y divide-white/5">
                    {(() => {
                      const favIds = userProfile.favorites || [];
                      const favVenues = venues.filter(v => favIds.includes(v.id));

                      // Prioritization: Home Base First
                      const sortedFavs = [...favVenues].sort((a, b) => {
                        if (a.id === userProfile.homeBase) return -1;
                        if (b.id === userProfile.homeBase) return 1;
                        return a.name.localeCompare(b.name);
                      });

                      return sortedFavs.length > 0 ? (
                        sortedFavs.map((venue) => (
                          <div
                            key={venue.id}
                            className="p-3.5 flex justify-between items-center group cursor-pointer hover:bg-slate-800 transition-colors"
                            onClick={() => onToggleFavorite?.(venue.id)}
                          >
                            <div className="flex items-center gap-2">
                              {venue.id === userProfile.homeBase && <Home className="w-3 h-3 text-primary" />}
                              <span className={`font-bold text-xs tracking-tight font-league ${venue.id === userProfile.homeBase ? 'text-primary' : 'text-white'}`}>
                                {venue.name.toUpperCase()}
                              </span>
                            </div>
                            <Star className="w-4 h-4 text-primary fill-primary" strokeWidth={3} />
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center">
                          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">No favorites yet</p>
                          <p className="text-[8px] text-slate-600 uppercase mt-1">Star the spots you love to track them here.</p>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* 6. SIDEBAR FOOTER: ADMIN & LEGAL */}
              <div className="p-4 bg-black border-t border-white/10 space-y-3">
                {/* ADMIN DASHBOARD (Conditional) */}
                {userRole === 'super-admin' && (
                  <button
                    onClick={() => handleMenuNavigation('/admin')}
                    className="w-full bg-red-900/20 border border-red-500/30 p-3 flex items-center justify-between group rounded-md hover:bg-red-900/40 transition-all"
                  >
                    <span className="text-red-500 font-black text-[10px] uppercase tracking-widest font-league">
                      ADMIN DASHBOARD
                    </span>
                    <ChevronRight className="w-4 h-4 text-red-500" />
                  </button>
                )}

                <button
                  onClick={() => {
                    onOwnerLoginClick?.();
                    setShowMenu(false);
                  }}
                  className="w-full bg-surface border border-white/10 p-3 flex items-center justify-between group rounded-md hover:border-slate-500 transition-all"
                >
                  <span className="text-slate-500 font-bold text-[10px] uppercase tracking-widest font-league group-hover:text-white">
                    VENUE LOGIN
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-white" />
                </button>

                {userRole === 'guest' && (
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        if (onMemberLoginClick) onMemberLoginClick('login');
                        else onProfileClick?.();
                        setShowMenu(false);
                      }}
                      className="w-full bg-slate-800 border border-white/10 p-3 flex items-center justify-between group rounded-md hover:border-primary/50 transition-all font-league"
                    >
                      <span className="text-white font-bold text-[10px] uppercase tracking-widest group-hover:text-primary">
                        MEMBER LOGIN
                      </span>
                      <LogIn className="w-4 h-4 text-slate-500 group-hover:text-primary transition-colors" />
                    </button>
                  </div>
                )}

                {userRole !== 'guest' && (
                  <button
                    onClick={() => {
                      onLogout?.();
                      setShowMenu(false);
                    }}
                    className="w-full bg-slate-900/40 border border-white/5 p-3 flex items-center justify-between group rounded-md hover:border-red-500/50 transition-all"
                  >
                    <span className="text-slate-600 font-bold text-[10px] uppercase tracking-widest font-league group-hover:text-red-500">
                      LOGOUT SESSION
                    </span>
                    <LogOut className="w-4 h-4 text-slate-800 group-hover:text-red-500 transition-colors" />
                  </button>
                )}

                <div className="flex justify-center gap-4 py-2">
                  <button onClick={() => handleMenuNavigation('/terms')} className="text-[9px] text-slate-600 font-bold uppercase hover:text-primary">TERMS</button>
                  <button onClick={() => handleMenuNavigation('/privacy')} className="text-[9px] text-slate-600 font-bold uppercase hover:text-primary">PRIVACY</button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Santa Artie Festive FAB */}
      <ArtieHoverIcon onClick={() => setShowArtie?.(true)} />

      {/* Artie Chat Modal */}
      <ArtieChatModal isOpen={showArtie} onClose={() => setShowArtie?.(false)} />

      <CookieBanner />
    </div>
  );
};
