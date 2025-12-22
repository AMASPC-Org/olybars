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

  const [ownerEmail, setOwnerEmail] = useState('');
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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      const newProfile: UserProfile = {
        uid: uid,
        role: joinLeague ? 'user' : 'guest',
        handle,
        email,
        phone,
        homeBase,
        favoriteDrink: drink,
        stats: joinLeague ? {
          seasonPoints: 50,
          lifetimeCheckins: 0,
          currentStreak: 0
        } : undefined
      };

      setAlertPrefs({
        ...alertPrefs,
        weeklyDigest: weeklyBuzz,
        interests: selectedInterests
      });

      await setDoc(doc(db, 'users', uid), newProfile);
      setUserProfile(newProfile);
      onClose();
      alert(joinLeague ? `Welcome to the League, ${handle}!` : `Welcome to OlyBars, ${handle}!`);
    } catch (error: any) {
      console.error("Registration Error:", error);
      alert(error.message);
    }
  };

  const handleOwnerLogin = async () => {
    if (!ownerEmail.includes('@')) { alert('Please enter a valid email.'); return; }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, ownerEmail, ownerPassword);
      const uid = userCredential.user.uid;
      const profileSnap = await getDoc(doc(db, 'users', uid));
      if (profileSnap.exists()) {
        const profileData = profileSnap.data() as UserProfile;
        setUserProfile(profileData);
        if (['admin', 'owner', 'manager'].includes(profileData.role)) {
          onOwnerSuccess();
          onClose();
          alert(`Logged in as ${profileData.role.toUpperCase()}`);
        } else {
          alert(`Access Denied: Staff account required.`);
          onClose();
        }
      } else {
        alert('Profile not found.');
      }
    } catch (error: any) {
      alert(`Login Failed: ${error.message}`);
    }
  };

  const inputClasses = "w-full bg-slate-100 border border-slate-300 focus:border-primary rounded-md py-2 text-sm text-black outline-none font-bold pl-10";

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
      <div className="bg-surface w-full max-w-sm border-2 border-slate-700 shadow-lg rounded-xl relative flex flex-col max-h-[90vh] overflow-hidden">
        <div className="flex border-b-2 border-slate-700">
          <button onClick={() => setLoginMode('user')} className={`flex-1 py-3 font-bold uppercase ${loginMode === 'user' ? 'bg-primary text-black' : 'text-slate-400'}`}>OlyBars ID</button>
          <button onClick={() => setLoginMode('owner')} className={`flex-1 py-3 font-bold uppercase ${loginMode === 'owner' ? 'bg-primary text-black' : 'text-slate-400'}`}>Staff</button>
        </div>

        <div className="p-6 overflow-y-auto text-white">
          <button onClick={onClose} className="absolute top-3 right-3 text-slate-500"><X className="w-5 h-5" /></button>
          {loginMode === 'user' ? (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-xl font-bold uppercase">Create OlyBars ID</h3>
                <p className="text-[10px] text-slate-400 uppercase">Save favorites & earn points</p>
              </div>
              <div className="relative">
                <Hash className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input type="text" value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="Handle" className={inputClasses} />
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className={inputClasses} />
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className={inputClasses} />
              </div>

              <div className="pt-4 border-t border-slate-700 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase">Join League?</span>
                  <button onClick={() => setJoinLeague(!joinLeague)} className={`w-10 h-5 rounded-full p-1 ${joinLeague ? 'bg-primary' : 'bg-slate-700'}`}>
                    <div className={`w-3 h-3 bg-white rounded-full transition-transform ${joinLeague ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
                {joinLeague && (
                  <div className="grid grid-cols-2 gap-2">
                    {interestOptions.map(opt => (
                      <button key={opt.id} onClick={() => setSelectedInterests(prev => prev.includes(opt.id) ? prev.filter(i => i !== opt.id) : [...prev, opt.id])}
                        className={`p-2 border rounded text-[10px] font-bold uppercase ${selectedInterests.includes(opt.id) ? 'bg-primary text-black' : 'border-slate-700 text-slate-400'}`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={saveUser} className="w-full bg-primary text-black font-bold py-3 rounded mt-4 uppercase">Create Account</button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-red-900/20 p-3 text-[10px] text-red-300 rounded border border-red-800">STAFF ONLY</div>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input type="email" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} placeholder="Email" className={inputClasses} />
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input type="password" value={ownerPassword} onChange={(e) => setOwnerPassword(e.target.value)} placeholder="Password" className={inputClasses} />
              </div>
              <button onClick={handleOwnerLogin} className="w-full bg-slate-800 text-white font-bold py-3 rounded mt-4 uppercase">Login</button>

              <div className="pt-8 border-t border-slate-700">
                <button
                  onClick={async () => {
                    const secret = prompt("Enter Master Setup Key:");
                    if (secret) {
                      try {
                        const { setupAdmin } = await import('../../../services/userService');
                        const res = await setupAdmin(ownerEmail || email, secret);
                        alert(res.message);
                      } catch (e: any) {
                        alert(e.message);
                      }
                    }
                  }}
                  className="text-[9px] text-slate-500 hover:text-primary uppercase font-black tracking-widest transition-colors w-full text-center"
                >
                  [ Initialize Master Admin ]
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};