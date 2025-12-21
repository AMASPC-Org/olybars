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
                  ? 'bg-primary text-black'
                  : 'bg-surface text-slate-200 hover:bg-surface/80'
                  }`}
              >
                <tab.icon className="w-5 h-5 mb-1" strokeWidth={3} />
                <span className="text-[10px] font-black tracking-wider font-league">
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
            className="absolute top-0 right-0 w-[90%] max-w-sm bg-[#0f172a] h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Menu Header: Oly Gold Premium */}
            <div className="bg-primary p-6 flex justify-between items-start border-b border-white/10">
              <div className="flex flex-col">
                <span className="text-3xl font-black text-black leading-tight uppercase tracking-tighter font-league">
                  SETTINGS &
                </span>
                <span className="text-3xl font-black text-black leading-none uppercase tracking-tighter font-league">
                  PROFILE
                </span>
              </div>
              <button
                onClick={() => setShowMenu(false)}
                className="text-black hover:scale-110 transition-transform"
              >
                <X className="w-10 h-10" strokeWidth={4} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Profile Card */}
              <div className="bg-surface border border-white/10 p-5 rounded-lg relative">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-primary rounded-full border-2 border-white flex items-center justify-center">
                    <User className="w-8 h-8 text-black" strokeWidth={3} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xl font-black text-white uppercase leading-none mb-1 font-league">
                      GUEST USER
                    </span>
                    <span className="bg-primary text-black text-[10px] font-black px-2 py-0.5 tracking-widest inline-block select-none transform -skew-x-12">
                      LEAGUE MEMBER
                    </span>
                  </div>
                </div>
                <p className="text-slate-400 text-xs font-medium leading-tight mb-4 font-body">
                  Create your profile to save favorites and track points.
                </p>
                <button
                  onClick={() => {
                    onProfileClick?.();
                    setShowMenu(false);
                  }}
                  className="w-full bg-primary text-black font-black py-4 rounded-md transition-all uppercase tracking-wider font-league hover:bg-yellow-400 active:scale-[0.98]"
                >
                  CREATE PROFILE
                </button>
              </div>

              {/* Alert Preferences */}
              <div className="space-y-4">
                <h3 className="text-primary font-black flex items-center gap-2 uppercase tracking-widest text-sm font-league">
                  <Menu className="w-4 h-4" strokeWidth={3} /> MAIN MENU
                </h3>
                <button
                  onClick={() => handleMenuNavigation('/more')}
                  className="w-full bg-surface border border-white/10 p-4 rounded-lg flex items-center justify-between group hover:border-primary transition-all"
                >
                  <span className="text-white font-bold text-sm font-league">EXPLORE MORE VIBES</span>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-primary" />
                </button>

                <h3 className="text-primary font-black flex items-center gap-2 uppercase tracking-widest text-sm font-league">
                  <Bell className="w-4 h-4" strokeWidth={3} /> ALERT PREFERENCES
                </h3>
                <div className="bg-surface border border-white/10 p-4 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-white font-bold text-sm font-league block">NIGHTLY OLYBARS BUZZ</span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Highlights from tonight's pulse</span>
                  </div>
                  <button
                    onClick={() => setAlertPrefs({ ...alertPrefs, nightlyDigest: !alertPrefs.nightlyDigest })}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${alertPrefs.nightlyDigest ? 'bg-primary' : 'bg-slate-700'}`}
                  >
                    <div className={`w-4 h-4 bg-black rounded-full transition-transform ${alertPrefs.nightlyDigest ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="bg-surface border border-white/10 p-4 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="text-white font-bold text-sm font-league block">ARTIE'S WEEKLY BUZZ</span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Weekly recommendations & stats</span>
                  </div>
                  <button
                    onClick={() => setAlertPrefs({ ...alertPrefs, weeklyDigest: !alertPrefs.weeklyDigest })}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${alertPrefs.weeklyDigest ? 'bg-primary' : 'bg-slate-700'}`}
                  >
                    <div className={`w-4 h-4 bg-black rounded-full transition-transform ${alertPrefs.weeklyDigest ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>

              {/* Following List */}
              <div className="space-y-4">
                <h3 className="text-primary font-black flex items-center gap-2 uppercase tracking-widest text-sm font-league">
                  <Star className="w-4 h-4" strokeWidth={3} /> FOLLOWING (0)
                </h3>
                <div className="border border-white/10 rounded-lg overflow-hidden divide-y divide-white/5">
                  {[
                    "HANNAH'S BAR & GRILLE",
                    "LEGENDS ARCADE",
                    "CHINA CLIPPER",
                    "WELL 80 BREWHOUSE",
                    "THE BROTHERHOOD",
                    "THREE MAGNETS"
                  ].map((venue, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        if (!isLeagueMember) {
                          setShowMenu(false);
                          setTimeout(() => {
                            onProfileClick?.();
                          }, 100);
                        }
                      }}
                      className="bg-surface p-4 flex justify-between items-center group cursor-pointer hover:bg-slate-700 transition-colors"
                    >
                      <span className="text-white font-bold text-xs tracking-tight font-league">{venue}</span>
                      <Star className={`w-4 h-4 transition-colors ${isLeagueMember ? 'text-slate-600 group-hover:text-primary' : 'text-slate-700 group-hover:text-primary/50'}`} strokeWidth={3} />
                    </div>
                  ))}
                </div>
                {!isLeagueMember && (
                  <p className="text-[9px] text-slate-500 font-bold uppercase text-center mt-2 italic">
                    Log in as a League Member to save your favorites!
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Legal Links */}
          <div className="px-6 py-4 bg-black/40 border-t border-white/5 flex justify-center gap-6">
            <button
              onClick={() => handleMenuNavigation('/terms')}
              className="text-[10px] text-slate-500 font-bold uppercase tracking-widest hover:text-primary transition-colors"
            >
              Terms
            </button>
            <button
              onClick={() => handleMenuNavigation('/privacy')}
              className="text-[10px] text-slate-500 font-bold uppercase tracking-widest hover:text-primary transition-colors"
            >
              Privacy
            </button>
          </div>

          {/* Bottom Admin Link */}
          <div className="p-6 bg-black">
            <button
              onClick={() => {
                onOwnerLoginClick?.();
                setShowMenu(false);
              }}
              className="w-full bg-surface p-4 border border-white/10 flex items-center justify-between group rounded-lg hover:border-primary transition-all active:scale-[0.98]"
            >
              <span className="text-slate-400 font-bold text-xs uppercase tracking-widest group-hover:text-white font-league">
                VENUE ADMIN LOGIN
              </span>
              <Lock className="w-4 h-4 text-slate-600 group-hover:text-white" />
            </button>
          </div>
        </div>
        </div>
  )
}
    </div >
  );
};
