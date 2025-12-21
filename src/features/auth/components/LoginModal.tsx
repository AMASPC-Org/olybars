import React, { useState } from 'react';
import {
  X, User, Hash, Home, Beer, Mail, Phone, ChevronRight, Shield, Lock
} from 'lucide-react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../../lib/firebase';
import { UserProfile, Venue } from '../../../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  loginMode: 'user' | 'owner';
  setLoginMode: (mode: 'user' | 'owner') => void;
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  venues: Venue[];
  alertPrefs: any;
  setAlertPrefs: (prefs: any) => void;
  openInfo: (title: string, text: string) => void;
  onOwnerSuccess: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  loginMode,
  setLoginMode,
  userProfile,
  setUserProfile,
  venues,
  alertPrefs,
  setAlertPrefs,
  openInfo,
  onOwnerSuccess
}) => {
  const [email, setEmail] = useState(userProfile.email || '');
  const [password, setPassword] = useState('');
  const [handle, setHandle] = useState(userProfile.handle || '');
  const [phone, setPhone] = useState(userProfile.phone || '');
  const [drink, setDrink] = useState(userProfile.favoriteDrink || '');
  const [homeBase, setHomeBase] = useState(userProfile.homeBase || '');

  const [ownerPassword, setOwnerPassword] = useState('');

  // Onboarding specific state
  const [joinLeague, setJoinLeague] = useState(true);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [weeklyBuzz, setWeeklyBuzz] = useState(true);

  const interestOptions = [
    { id: 'karaoke', label: 'Karaoke', icon: '🎤' },
    { id: 'trivia', label: 'Trivia', icon: '🧠' },
    { id: 'live_music', label: 'Live Music', icon: '🎸' },
    { id: 'arcade', label: 'Arcade', icon: '👾' },
  ];

  if (!isOpen) return null;

  const saveUser = async () => {
    if (!handle.trim()) { alert('You need a Handle for the League!'); return; }
    if (!email.includes('@')) { alert('Please enter a valid email.'); return; }
    if (password.length < 6) { alert('Password must be at least 6 characters.'); return; }

    try {
      // 1. Create Auth User
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // 2. Prepare Profile Object
      const newProfile: UserProfile = {
        uid: uid,
        role: joinLeague ? 'user' : 'guest',
        handle,
        email,
        phone,
        homeBase,
        favoriteDrink: drink,
        stats: joinLeague ? {
          seasonPoints: 50, // Welcome bonus
          lifetimeCheckins: 0,
          currentStreak: 0
        } : undefined
      };

      // 3. Update Alert Prefs
      setAlertPrefs({
        ...alertPrefs,
        weeklyDigest: weeklyBuzz,
        interests: selectedInterests
      });

      // 4. Save to Firestore
      await setDoc(doc(db, 'users', uid), newProfile);

      // 4. Update Local State & Close
      setUserProfile(newProfile);
      onClose();
      const welcomeMsg = joinLeague
        ? `Welcome to the League, ${handle}! You've earned 50 starting points.`
        : `Welcome to OlyBars, ${handle}!`;
      alert(welcomeMsg);

    } catch (error: any) {
      console.error("Registration Error:", error);
      alert(error.message);
    }
  };

  const handleOwnerLogin = async () => {
    if (!ownerEmail.includes('@')) {
      alert('Please enter a valid email.');
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, ownerEmail, ownerPassword);
      const uid = userCredential.user.uid;

      // Fetch the real profile from Firestore to get the Role
      const profileSnap = await getDoc(doc(db, 'users', uid));

      if (profileSnap.exists()) {
        const profileData = profileSnap.data() as UserProfile;
        setUserProfile(profileData);

        if (profileData.role === 'admin' || profileData.role === 'owner' || profileData.role === 'manager') {
          onOwnerSuccess();
          onClose();
          alert(`Logged in as ${profileData.role.toUpperCase()}: ${profileData.handle || profileData.email}`);
        } else {
          // It's a regular user who logged in via the staff portal
          alert(`Access Denied: Member account detected. Staff login required.`);
          onClose();
        }
      } else {
        alert('Profile not found in Firestore. Contact Admin.');
      }
    } catch (error: any) {
      console.error('Login Error:', error);
      if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        alert('Access Denied: Invalid email or password.');
      } else if (error.message === 'Permission Denied') {
        alert('Access Denied: Your account does not have Admin/Staff permissions.');
      } else {
        alert(`Login Failed: ${error.message}`);
      }
    }
  };

  const inputClasses = "w-full bg-slate-100 border border-slate-300 focus:border-primary transition-all rounded-md py-2.5 pl-10 text-sm text-black outline-none font-bold";

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4 animate-in zoom-in-95">
      <div className="bg-surface w-full max-w-sm border-2 border-slate-700 shadow-lg rounded-xl relative flex flex-col max-h-[90vh] overflow-hidden">

        {/* Header Tabs */}
        <div className="flex border-b-2 border-slate-700">
          <button
            onClick={() => setLoginMode('user')}
            className={`flex-1 py-3 text-center text-md font-bold uppercase tracking-wider transition-all
                  ${loginMode === 'user'
                ? 'bg-primary text-black'
                : 'bg-surface text-slate-400 hover:bg-slate-700'}`}
          >
            OlyBars ID
          </button>
          <button
            onClick={() => setLoginMode('owner')}
            className={`flex-1 py-3 text-center text-md font-bold uppercase tracking-wider transition-all
                  ${loginMode === 'owner'
                ? 'bg-primary text-black'
                : 'bg-surface text-slate-400 hover:bg-slate-700'}`}
          >
            Staff & Admin
          </button>
        </div>

        <div className="p-6 overflow-y-auto text-white">
          <button onClick={onClose} className="absolute top-3 right-3 z-10 text-slate-500 hover:text-white hover:scale-110 transition-transform">
            <X className="w-5 h-5" />
          </button>

          {loginMode === 'user' ? (
            <div className="space-y-5">
              <div className="text-center mb-4">
                <div className="inline-block p-3 rounded-full bg-primary/10 border-2 border-primary/20 mb-2">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-white uppercase tracking-wide">
                  Create Your OlyBars ID
                </h3>
                <p className="text-xs font-semibold text-slate-400 uppercase">
                  Find happy hours, trivia nights & local spots.
                </p>
                <p className="text-[10px] font-semibold text-slate-500 mt-1 uppercase">
                  Optional: Join the Olympia Bar League to compete for prizes.
                </p>
              </div>

              <div>
                <label className="block text-xs uppercase text-primary font-bold mb-1">
                  OlyBars Handle *
                </label>
                <div className="relative mt-1">
                  <Hash className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    placeholder="BarFly_99"
                    className={inputClasses}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase text-slate-400 font-bold mb-1">
                  Home Bar (Optional)
                </label>
                <div className="relative">
                  <Home className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                  <select
                    value={homeBase}
                    onChange={(e) => setHomeBase(e.target.value)}
                    className={`${inputClasses} appearance-none`}
                  >
                    <option value="">Select a venue…</option>
                    {venues.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                  <ChevronRight className="w-4 h-4 absolute right-3 top-3.5 text-slate-400 rotate-90" />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase text-slate-400 font-bold mb-1">
                  Favorite Drink (Optional)
                </label>
                <div className="relative">
                  <Beer className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={drink}
                    onChange={(e) => setDrink(e.target.value)}
                    placeholder="Rainier, IPA, cider…"
                    className={inputClasses}
                  />
                </div>
              </div>

              <div className="pt-4 border-t-2 border-slate-700 border-dashed">
                <label className="block text-xs uppercase text-primary font-bold mb-1">
                  Email *
                </label>
                <div className="relative mb-3 mt-1">
                  <Mail className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase text-primary font-bold mb-1">
                    Password *
                  </label>
                  <div className="relative mb-3 mt-1">
                    <Lock className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={inputClasses}
                    />
                  </div>
                </div>

              </div>
            </div>

              {/* League Onboarding Section */}
          <div className="pt-6 border-t-2 border-slate-700 border-dashed space-y-4">
            <div className="flex items-center justify-between bg-primary/5 p-4 rounded-lg border border-primary/20">
              <div>
                <h4 className="text-sm font-black text-primary uppercase font-league">Join the Olympia Bar League?</h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Earn points, win prizes, track stats.</p>
              </div>
              <button
                onClick={() => setJoinLeague(!joinLeague)}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${joinLeague ? 'bg-primary' : 'bg-slate-700'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${joinLeague ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            {joinLeague && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div>
                  <label className="block text-[10px] uppercase text-slate-400 font-black mb-2 tracking-widest text-center">What are you into?</label>
                  <div className="grid grid-cols-2 gap-2">
                    {interestOptions.map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setSelectedInterests(prev =>
                            prev.includes(opt.id) ? prev.filter(i => i !== opt.id) : [...prev, opt.id]
                          );
                        }}
                        className={`p-2 rounded-md border-2 transition-all flex items-center justify-center gap-2 text-[11px] font-black uppercase ${selectedInterests.includes(opt.id)
                            ? 'bg-primary border-primary text-black'
                            : 'bg-surface border-slate-700 text-slate-400 hover:border-slate-500'
                          }`}
                      >
                        <span>{opt.icon}</span> {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-surface p-3 rounded-md border border-white/5">
                  <input
                    type="checkbox"
                    id="weeklyBuzz"
                    checked={weeklyBuzz}
                    onChange={(e) => setWeeklyBuzz(e.target.checked)}
                    className="w-4 h-4 accent-primary"
                  />
                  <label htmlFor="weeklyBuzz" className="text-[11px] font-bold text-slate-300 cursor-pointer">
                    Subscribe to Artie's Weekly Recommendations
                  </label>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={saveUser}
            className="w-full bg-primary hover:bg-yellow-400 text-black font-bold text-lg uppercase tracking-wider py-3 rounded-md shadow-md active:scale-95 transition-all mt-2"
          >
            Create Account
          </button>
        </div>
        ) : (
        <div className="space-y-6">
          <div className="bg-red-900/20 border border-red-800 p-4 text-xs text-red-300 mb-2 font-mono font-semibold rounded-md">
            <Shield className="w-5 h-5 mb-1 text-red-400" />
            WARNING: RESTRICTED AREA. AUTHORIZED VENUE STAFF ONLY.
          </div>

          <div>
            <label className="block text-xs uppercase text-slate-400 font-bold mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
              <input
                type="email"
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
                placeholder="you@venue.com"
                className={inputClasses}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase text-slate-400 font-bold mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
              <input
                type="password"
                value={ownerPassword}
                onChange={(e) => setOwnerPassword(e.target.value)}
                placeholder="••••••••"
                className={inputClasses}
              />
            </div>
          </div>

          <button
            onClick={handleOwnerLogin}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-lg uppercase tracking-wider py-3 rounded-md shadow-md active:scale-95 transition-all"
          >
            ACCESS DASHBOARD
          </button>
        </div>
          )}
      </div>
    </div>
    </div >
  );
};