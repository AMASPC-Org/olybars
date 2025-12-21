import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  Clock,
  Flame,
  Mic,
  Brain,
  Music,
  Calendar,
  Crown,
  Trophy,
  X,
  Map as MapIcon,
  MoreHorizontal,
  User,
  LogIn,
  Star,
  Bell,
  Lock,
  ChevronRight,
  Settings as SettingsIcon,
} from 'lucide-react';
import { Venue } from '../../types';

interface AppShellProps {
  venues: Venue[];
  userPoints: number;
  // if undefined, we default to showing the scoreboard for now
  isLeagueMember?: boolean;
  alertPrefs: any;
  setAlertPrefs: (prefs: any) => void;
  onProfileClick?: () => void;
  onOwnerLoginClick?: () => void;
}

// --- Component: BuzzClock ---
const BuzzClock: React.FC<{ venues: Venue[] }> = ({ venues }) => {
  const activeDeals = venues
    .filter((v) => v.deal && v.dealEndsIn && v.dealEndsIn > 0)
    .sort((a, b) => (a.dealEndsIn || 0) - (b.dealEndsIn || 0));

  const getNextHappyHour = () => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    return venues
      .filter(v => v.happyHour && !v.deal)
      .map(v => {
        const [h, m] = v.happyHour!.startTime.split(':').map(Number);
        const startMinutes = h * 60 + m;
        return { venue: v, startMinutes, diff: startMinutes - currentMinutes };
      })
      .filter(v => v.diff > 0 && v.diff < 180) // Starts within 3 hours
      .sort((a, b) => a.diff - b.diff)[0];
  };

  const nextHH = getNextHappyHour();
  const featuredVenue = venues[0]; // Fallback to first venue as featured

  return (
    <div className="bg-primary border-b-2 border-black p-3 shadow-md z-20 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className={`w-5 h-5 text-black ${activeDeals.length > 0 ? 'animate-pulse' : ''}`} strokeWidth={3} />
          <div className="flex flex-col">
            <h2 className="text-sm font-bold text-black leading-none uppercase">
              {activeDeals.length > 0 ? 'THE BUZZ CLOCK' : nextHH ? 'UPCOMING BUZZ' : 'FEATURED SPOT'}
            </h2>
            <span className="text-[10px] text-black font-medium uppercase">
              {activeDeals.length > 0
                ? `${activeDeals[0].name}: ${activeDeals[0].deal}`
                : nextHH
                  ? `${nextHH.venue.name} Happy Hour in ${nextHH.diff} mins`
                  : featuredVenue
                    ? `Visit ${featuredVenue.name} tonight!`
                    : 'Loading OlyBuzz...'}
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold tracking-wider text-white bg-black px-2 py-0.5 transform -skew-x-12 inline-block">
            {activeDeals.length > 0 ? 'DEAL(S)' : nextHH ? 'PREP' : 'SPOTLIGHT'}
          </span>
        </div>
      </div>
    </div>
  );
};

// --- The App Shell Component ---
export const AppShell: React.FC<AppShellProps> = ({
  venues,
  userPoints,
  isLeagueMember,
  alertPrefs,
  setAlertPrefs,
  onProfileClick,
  onOwnerLoginClick,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);

  const getActiveTab = () => {
    const path = location.pathname.split('/')[1];
    return path === '' ? 'pulse' : path;
  };

  const activeTab = getActiveTab();

  const navItems = [
    { id: 'pulse', label: 'PULSE', icon: Flame, path: '/' },
    { id: 'league', label: 'LEAGUE HQ', icon: Crown, path: '/league' },
    { id: 'map', label: 'MAP', icon: MapIcon, path: '/map' },
    { id: 'events', label: 'EVENTS', icon: Calendar, path: '/events' },
    { id: 'trivia', label: 'TRIVIA', icon: Brain, path: '/trivia' },
    { id: 'karaoke', label: 'KARAOKE', icon: Mic, path: '/karaoke' },
    { id: 'more', label: 'MORE', icon: MoreHorizontal, path: '/more' },
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
          <div className="text-3xl font-black tracking-wide text-white flex items-center gap-1 drop-shadow-md">
            OLYBARS<span className="text-primary">.COM</span>
          </div>
          <button
            onClick={() => setShowMenu(true)}
            className="text-white hover:text-primary transition-colors"
          >
            <Menu className="w-8 h-8" strokeWidth={3} />
          </button>
        </div>

        <BuzzClock venues={venues} />

        {/* Tab Navigation */}
        <div className="bg-background p-1 border-b-4 border-black">
          <div className="grid grid-cols-4 gap-1">
            {navItems.map((tab) => (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                className={`flex flex-col items-center justify-center py-2 transition-all border-2 border-black ${activeTab === tab.id
                  ? 'bg-primary text-black shadow-[2px_2px_0px_0px_#000]'
                  : 'bg-surface text-slate-200 hover:bg-surface/80'
                  }`}
              >
                <tab.icon className="w-5 h-5 mb-1" strokeWidth={3} />
                <span className="text-[10px] font-black tracking-wider font-league uppercase">
                  {tab.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content (Outlet) */}
      <div className="flex-1 overflow-y-auto relative">
        <Outlet />
      </div>

      {/* Footer / League Bar */}
      <div className="sticky bottom-0 w-full max-w-md bg-black border-t-4 border-primary p-3 z-20 shadow-2xl">
        {leagueMember ? (
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 p-2 border-2 border-white relative shadow-sm">
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full border border-black" />
                <Trophy className="w-5 h-5 text-primary" strokeWidth={3} />
              </div>
              <p className="font-mono font-black text-xl text-white leading-none">
                {userPoints.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-slate-500 font-bold uppercase">
                Season ends Dec 31
              </p>
              <p className="text-[10px] text-black font-black bg-primary border-2 border-white px-1 mt-0.5 inline-block transform skew-x-12">
                RANK: #42
              </p>
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
      {showMenu && (
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
                  onProfileClick?.();
                  setShowMenu(false);
                }}
              >
                <div className="w-12 h-12 bg-black rounded-full border-2 border-white flex items-center justify-center group-hover:scale-105 transition-transform">
                  <User className="w-6 h-6 text-primary" strokeWidth={3} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-black text-black leading-none uppercase font-league">
                    CREATE PROFILE
                  </span>
                  <span className="text-[10px] font-black text-black/60 uppercase tracking-widest mt-0.5">
                    GUEST USER
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

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* 2. PRIMARY NAV LINKS */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleMenuNavigation('/')}
                  className="bg-surface border border-white/10 p-4 rounded-lg flex flex-col items-center gap-2 group hover:border-primary transition-all"
                >
                  <Flame className="w-5 h-5 text-primary" strokeWidth={3} />
                  <span className="text-white font-black text-[10px] tracking-widest uppercase font-league">PULSE</span>
                </button>
                <button
                  onClick={() => handleMenuNavigation('/map')}
                  className="bg-surface border border-white/10 p-4 rounded-lg flex flex-col items-center gap-2 group hover:border-primary transition-all"
                >
                  <MapIcon className="w-5 h-5 text-primary" strokeWidth={3} />
                  <span className="text-white font-black text-[10px] tracking-widest uppercase font-league">VENUE MAP</span>
                </button>
              </div>

              {/* 3. SETTINGS & MORE LIST */}
              <div className="space-y-2">
                <h3 className="text-primary font-black flex items-center gap-2 uppercase tracking-widest text-[10px] font-league px-1 mb-3">
                  <SettingsIcon className="w-3.5 h-3.5" strokeWidth={3} /> SETTINGS & MORE
                </h3>
                <div className="grid grid-cols-1 gap-1">
                  {[
                    { label: 'LEAGUE HQ', path: '/league', icon: Crown },
                    { label: 'EVENTS', path: '/events', icon: Calendar },
                    { label: 'TRIVIA', path: '/trivia', icon: Brain },
                    { label: 'KARAOKE', path: '/karaoke', icon: Mic },
                    { label: 'ARCADE', path: '/arcade', icon: Music },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => handleMenuNavigation(item.path)}
                      className="w-full bg-surface/50 hover:bg-surface border border-white/5 p-3 rounded-md flex items-center justify-between group transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="w-4 h-4 text-slate-400 group-hover:text-primary" strokeWidth={2.5} />
                        <span className="text-white font-bold text-xs font-league tracking-wide">{item.label}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-700 group-hover:text-primary" />
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. FOLLOWING / FAVORITES */}
              <div className="space-y-3">
                <h3 className="text-primary font-black flex items-center gap-2 uppercase tracking-widest text-[10px] font-league px-1">
                  <Star className="w-3.5 h-3.5" strokeWidth={3} /> FAVORITE SPOTS
                </h3>
                <div className="bg-surface/30 border border-white/5 rounded-lg overflow-hidden divide-y divide-white/5">
                  {venues.map((venue) => {
                    const isFav = alertPrefs.followedVenues?.includes(venue.id);
                    return (
                      <div
                        key={venue.id}
                        className="p-3.5 flex justify-between items-center group cursor-pointer hover:bg-slate-800 transition-colors"
                        onClick={() => {
                          const followed = alertPrefs.followedVenues || [];
                          const newFollowed = isFav
                            ? followed.filter((id: string) => id !== venue.id)
                            : [...followed, venue.id];
                          setAlertPrefs({ ...alertPrefs, followedVenues: newFollowed });
                        }}
                      >
                        <span className="text-white font-bold text-xs tracking-tight font-league">{venue.name.toUpperCase()}</span>
                        <Star className={`w-4 h-4 transition-all ${isFav ? 'text-primary fill-primary' : 'text-slate-700 group-hover:text-primary/50'}`} strokeWidth={3} />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 5. ALERT PREFS QUICK TOGGLE */}
              <div className="bg-surface border border-white/10 p-4 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest font-league">Nightly Buzz</span>
                  <button
                    onClick={() => setAlertPrefs({ ...alertPrefs, nightlyDigest: !alertPrefs.nightlyDigest })}
                    className={`w-10 h-5 rounded-full p-1 transition-colors ${alertPrefs.nightlyDigest ? 'bg-primary' : 'bg-slate-700'}`}
                  >
                    <div className={`w-3 h-3 bg-black rounded-full transition-transform ${alertPrefs.nightlyDigest ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* 6. SIDEBAR FOOTER: ADMIN & PROFILE */}
            <div className="p-4 bg-black border-t border-white/10 space-y-3">
              <button
                onClick={() => {
                  onProfileClick?.();
                  setShowMenu(false);
                }}
                className="w-full bg-primary border-2 border-black p-4 flex items-center justify-between group rounded-md shadow-[4px_4px_0px_0px_#000] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000] transition-all"
              >
                <span className="text-black font-black text-sm uppercase tracking-wider font-league">
                  MY PROFILE
                </span>
                <User className="w-5 h-5 text-black" strokeWidth={3} />
              </button>

              <button
                onClick={() => {
                  onOwnerLoginClick?.();
                  setShowMenu(false);
                }}
                className="w-full bg-surface border border-white/10 p-3 flex items-center justify-between group rounded-md hover:border-slate-500 transition-all"
              >
                <span className="text-slate-500 font-bold text-[10px] uppercase tracking-widest font-league group-hover:text-white">
                  OWNER LOGIN
                </span>
                <Lock className="w-4 h-4 text-slate-700 group-hover:text-white" />
              </button>

              <div className="flex justify-center gap-4 py-2">
                <button onClick={() => handleMenuNavigation('/terms')} className="text-[9px] text-slate-600 font-bold uppercase hover:text-primary">TERMS</button>
                <button onClick={() => handleMenuNavigation('/privacy')} className="text-[9px] text-slate-600 font-bold uppercase hover:text-primary">PRIVACY</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
