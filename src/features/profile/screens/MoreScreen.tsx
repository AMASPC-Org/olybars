import React from 'react';
import {
  ChevronRight,
  HelpCircle,
  Shield,
  Eye,
  LogOut,
  Settings,
  User,
  Coffee,
  ExternalLink,
  Trophy
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserProfile, UserRole } from '../../../types';

interface MoreScreenProps {
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
}

const MoreScreen: React.FC<MoreScreenProps> = ({ userProfile, setUserProfile }) => {
  const navigate = useNavigate();

  const isAdmin = userProfile.email === 'ryan@amaspc.com';

  const menuItems = [
    { id: 'profile', label: 'My League ID', icon: User, path: '/profile', color: 'text-primary' },
    { id: 'faq', label: 'Help & FAQ', icon: HelpCircle, path: '/faq', color: 'text-blue-400' },
    { id: 'settings', label: 'Alert Settings', icon: Settings, path: '/', color: 'text-slate-400' },
    { id: 'terms', label: 'Terms of Service', icon: Shield, path: '/terms', color: 'text-slate-400' },
    { id: 'privacy', label: 'Privacy Policy', icon: Eye, path: '/privacy', color: 'text-slate-400' },
  ];

  const handleRoleSwitch = (newRole: UserRole) => {
    setUserProfile(prev => ({ ...prev, role: newRole }));
  };

  return (
    <div className="min-h-screen bg-background text-white p-6 pb-32">
      <header className="mb-10">
        <h1 className="text-4xl font-black uppercase tracking-tighter font-league mb-2">
          MORE <span className="text-primary">VIBES</span>
        </h1>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Settings & Information</p>
      </header>

      {userProfile.role !== 'guest' && (
        <div className="mb-10 bg-slate-900 border-2 border-primary/20 p-6 rounded-3xl shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] text-primary font-black uppercase tracking-widest mb-1 block">Your Point Wallet</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono text-white">{(userProfile.stats?.seasonPoints || 0).toLocaleString()}</span>
              <span className="text-xs font-bold text-slate-500 uppercase">Pts</span>
            </div>
            <p className="text-[10px] text-slate-500 font-bold mt-2 uppercase tracking-tighter">Season Rank: <span className="text-white">#42 of 1.2k</span></p>
          </div>
          <div className="bg-primary/10 p-3 rounded-2xl border border-primary/20">
            <Trophy className="w-8 h-8 text-primary" strokeWidth={3} />
          </div>
        </div>
      )}

      {/* Admin Role Switcher */}
      {isAdmin && (
        <div className="mb-10 p-4 border-2 border-primary/20 bg-primary/5 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="text-sm font-black uppercase tracking-widest font-league text-primary">Admin Role Switcher</h2>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {(['admin', 'owner', 'manager', 'user', 'guest'] as UserRole[]).map((role) => (
              <button
                key={role}
                onClick={() => handleRoleSwitch(role)}
                className={`py-2 px-3 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${userProfile.role === role
                  ? 'bg-primary text-black border-primary'
                  : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20'
                  }`}
              >
                {role}
              </button>
            ))}
          </div>
          <p className="mt-3 text-[9px] text-slate-500 font-bold uppercase text-center">
            Currently viewing as: <span className="text-primary">{userProfile.role}</span>
          </p>
        </div>
      )}

      <div className="space-y-3">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className="w-full bg-surface border border-white/5 p-5 rounded-2xl flex items-center justify-between group hover:border-white/20 transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-xl bg-white/5 ${item.color}`}>
                <item.icon className="w-5 h-5" strokeWidth={2.5} />
              </div>
              <span className="text-sm font-black uppercase tracking-tight font-league group-hover:text-primary transition-colors">
                {item.label}
              </span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-primary transition-colors" />
          </button>
        ))}
      </div>

      <div className="mt-12 space-y-6">
        <div className="bg-gradient-to-br from-slate-900 to-[#0f172a] border border-white/10 p-6 rounded-3xl relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
          <Coffee className="w-8 h-8 text-primary mb-4" />
          <h3 className="text-lg font-black uppercase tracking-tight font-league text-white mb-2">Powered by Hannah's Bar & Grill</h3>
          <p className="text-xs text-slate-400 leading-relaxed font-body mb-4">
            OlyBars is a community project built for the love of Downtown Olympia. Support your local establishments and drink responsible.
          </p>
          <a
            href="https://well80.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-widest hover:underline"
          >
            Visit Well80.com <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = '/';
          }}
          className="w-full py-4 flex items-center justify-center gap-3 text-red-500 font-black uppercase tracking-widest text-[10px] bg-red-500/5 rounded-xl border border-red-500/20 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Wipe Local Data & Sign Out
        </button>
      </div>

      <footer className="mt-12 text-center">
        <p className="text-[10px] text-slate-700 font-mono">v1.0.42-stable | OlyBars Protocol</p>
      </footer>
    </div>
  );
};

export default MoreScreen;
