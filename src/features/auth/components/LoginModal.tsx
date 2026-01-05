import React, { useState } from 'react';
import {
  X, User, Hash, Home, Beer, Mail, Phone, ChevronRight, Shield, Lock, Facebook
} from 'lucide-react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  getMultiFactorResolver,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  RecaptchaVerifier,
  multiFactor,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../../lib/firebase';
import { UserProfile, Venue, UserRole, SystemRole } from '../../../types';
import { useToast } from '../../../components/ui/BrandedToast';
import { mapAuthErrorToMessage } from '../utils/authErrorHandler';
import { AuthService } from '../../../services/authService';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  loginMode: 'user' | 'owner';
  setLoginMode: (mode: 'user' | 'owner') => void;
  userSubMode: 'login' | 'signup';
  setUserSubMode: (mode: 'login' | 'signup') => void;
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
  userSubMode,
  setUserSubMode,
  userProfile,
  setUserProfile,
  venues,
  alertPrefs,
  setAlertPrefs,
  openInfo,
  onOwnerSuccess
}) => {
  const { showToast } = useToast();
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

  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // MFA State
  const [mfaResolver, setMfaResolver] = useState<any>(null);
  const [mfaId, setMfaId] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [showMfaStep, setShowMfaStep] = useState(false);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<any>(null);

  const interestOptions = [
    { id: 'karaoke', label: 'Karaoke', icon: '🎤' },
    { id: 'trivia', label: 'Trivia', icon: '🧠' },
    { id: 'live_music', label: 'Live Music', icon: '🎸' },
    { id: 'arcade', label: 'Arcade', icon: '👾' },
  ];

  if (!isOpen) return null;

  const handleUserLogin = async () => {
    if (!email.includes('@')) { showToast('Please enter a valid email.'); return; }
    if (!password) { showToast('Please enter your password.'); return; }

    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      const profileSnap = await getDoc(doc(db, 'users', uid));

      if (profileSnap.exists()) {
        const profileData = profileSnap.data() as UserProfile;
        setUserProfile(profileData);
        onClose();
        showToast(`Welcome back, ${profileData.handle || 'Legend'}!`, 'success');
      } else {
        showToast('Profile not found. Please register.');
        setUserSubMode('signup');
      }
    } catch (error: any) {
      showToast(mapAuthErrorToMessage(error.code));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const profile = await AuthService.signInWithGoogle();

      if (loginMode === 'owner') {
        // RBAC Access Check for Venue Login
        const hasAccess =
          profile.systemRole === 'admin' ||
          (profile.venuePermissions && Object.keys(profile.venuePermissions).length > 0) ||
          ['admin', 'owner', 'manager', 'super-admin'].includes(profile.role);

        if (!hasAccess) {
          showToast(`Access Denied: ${profile.email} is not authorized for Venue management.`);
          setIsLoading(false);
          return;
        }

        // Check for MFA Enrollment for Owners/Managers
        const firebaseUser = auth.currentUser;
        if (firebaseUser && multiFactor(firebaseUser).enrolledFactors.length === 0) {
          showToast('MFA REQUIRED FOR PARTNERS. PLEASE ENROLL IN SETTINGS.', 'info');
          // We might want to force enrollment here, but for now we'll just warn and let App.tsx block access if needed.
        }
      }

      setUserProfile(profile);
      const welcomeName = profile.handle || profile.displayName || 'Legend';
      showToast(loginMode === 'owner' ? `Logged in as Commissioner ${welcomeName}` : `Welcome to the League, ${welcomeName}!`, 'success');

      if (loginMode === 'owner') {
        onOwnerSuccess();
      }
      onClose();
    } catch (error: any) {
      if (error.code === 'auth/multi-factor-auth-required') {
        await handleMfaRequired(error);
      } else if (error.code !== 'auth/popup-closed-by-user') {
        showToast(mapAuthErrorToMessage(error.code));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setIsLoading(true);
    try {
      const profile = await AuthService.signInWithFacebook();

      if (loginMode === 'owner') {
        const hasAccess =
          profile.systemRole === 'admin' ||
          (profile.venuePermissions && Object.keys(profile.venuePermissions).length > 0) ||
          ['admin', 'owner', 'manager', 'super-admin'].includes(profile.role);

        if (!hasAccess) {
          showToast(`Access Denied: ${profile.email} is not authorized for Venue management.`);
          setIsLoading(false);
          return;
        }

        const firebaseUser = auth.currentUser;
        if (firebaseUser && multiFactor(firebaseUser).enrolledFactors.length === 0) {
          showToast('MFA REQUIRED FOR PARTNERS. PLEASE ENROLL IN SETTINGS.', 'info');
        }
      }

      setUserProfile(profile);
      const welcomeName = profile.handle || profile.displayName || 'Legend';
      showToast(loginMode === 'owner' ? `Logged in as Commissioner ${welcomeName}` : `Welcome to the League, ${welcomeName}!`, 'success');

      if (loginMode === 'owner') {
        onOwnerSuccess();
      }
      onClose();
    } catch (error: any) {
      if (error.code === 'auth/multi-factor-auth-required') {
        await handleMfaRequired(error);
      } else if (error.code !== 'auth/popup-closed-by-user') {
        showToast(mapAuthErrorToMessage(error.code));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const saveUser = async () => {
    if (!handle.trim()) { showToast('You need a Handle for the League!'); return; }
    if (!email.includes('@')) { showToast('Please enter a valid email.'); return; }
    if (password.length < 6) { showToast('Password must be at least 6 characters.'); return; }
    if (!acceptTerms) { showToast('Please accept the Terms & Conditions.'); return; }

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      const newProfile: UserProfile = {
        uid: uid,
        role: joinLeague ? 'user' : 'guest', // Legacy support
        systemRole: 'guest', // RBAC Default
        venuePermissions: {}, // RBAC Default
        handle,
        email,
        phone,
        homeBase,
        favoriteDrinks: drink ? [drink] : [],
        weeklyBuzz: weeklyBuzz,
        showMemberSince: true,
        createdAt: Date.now(),
        stats: joinLeague ? {
          seasonPoints: 50,
          lifetimeCheckins: 0,
          currentStreak: 0,
          vibeCheckCount: 0,
          competitionPoints: 0
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
      showToast(joinLeague ? `Welcome to the League, ${handle}!` : `Welcome to OlyBars, ${handle}!`, 'success');
    } catch (error: any) {
      console.error("Registration Error:", error);
      showToast(mapAuthErrorToMessage(error.code));
    }
  };

  const handleOwnerLogin = async () => {
    if (!ownerEmail.includes('@')) { showToast('Please enter a valid email.'); return; }
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, ownerEmail, ownerPassword);
      await finishLogin(userCredential.user);
    } catch (error: any) {
      if (error.code === 'auth/multi-factor-auth-required') {
        await handleMfaRequired(error);
      } else {
        showToast(mapAuthErrorToMessage(error.code));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleMfaRequired = async (error: any) => {
    const resolver = getMultiFactorResolver(auth, error);
    setMfaResolver(resolver);

    // Auto-trigger SMS to the first enrolled factor
    const hints = resolver.hints;
    if (hints[0] && hints[0].factorId === 'phone') {
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible'
      });
      setRecaptchaVerifier(verifier);
      const phoneInfoOptions = {
        multiFactorHint: hints[0],
        session: resolver.session
      };
      const phoneAuthProvider = new PhoneAuthProvider(auth);
      const verificationId = await phoneAuthProvider.verifyPhoneNumber(phoneInfoOptions, verifier);
      setMfaId(verificationId);
      setShowMfaStep(true);
      showToast('ONE-TIME CODE SENT TO SECURE DEVICE', 'success');
    } else {
      showToast('MFA REQUIRED: PLEASE CONTACT HQ FOR SETUP', 'error');
    }
  };

  const handleVerifyMfa = async () => {
    if (!mfaCode || !mfaResolver || !mfaId) return;
    setIsLoading(true);
    try {
      const cred = PhoneAuthProvider.credential(mfaId, mfaCode);
      const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(cred);
      const userCredential = await mfaResolver.resolveSignIn(multiFactorAssertion);
      await finishLogin(userCredential.user);
    } catch (error: any) {
      showToast('INVALID MFA CODE. PLEASE RETRY.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const finishLogin = async (firebaseUser: FirebaseUser) => {
    const uid = firebaseUser.uid;
    const profileSnap = await getDoc(doc(db, 'users', uid));
    if (profileSnap.exists()) {
      const profileData = profileSnap.data() as UserProfile;

      if (firebaseUser.email === 'ryan@amaspc.com') {
        // The Ryan Rule: Always force super-admin rights
        // Adding venuePermissions: {} to trigger the check correctly in all screens
        const superAdminData = {
          role: 'super-admin' as UserRole, // Legacy
          systemRole: 'admin' as SystemRole, // RBAC Master Key
          handle: 'Ryan (Admin)',
          email: 'ryan@amaspc.com',
          venuePermissions: profileData.venuePermissions || {}, // Keep existing if any, but systemRole: admin overrides anyway
        };

        await setDoc(doc(db, 'users', uid), {
          ...superAdminData,
          // Fix: Reset 9999 points if present
          ...(profileData.stats?.seasonPoints === 9999 ? { stats: { ...profileData.stats, seasonPoints: 0 } } : {})
        }, { merge: true });

        setUserProfile({ ...profileData, ...superAdminData });
        onOwnerSuccess();
        onClose();
        showToast(`Logged in as SUPER-ADMIN (Golden Ticket)`, 'success');
        return;
      }

      setUserProfile(profileData);

      // RBAC Access Check
      const hasAccess =
        profileData.systemRole === 'admin' ||
        (profileData.venuePermissions && Object.keys(profileData.venuePermissions).length > 0) ||
        ['admin', 'owner', 'manager', 'super-admin'].includes(profileData.role);

      if (hasAccess) {
        // Check for enrollment for partners
        if (multiFactor(firebaseUser).enrolledFactors.length === 0) {
          showToast('MFA ENROLLMENT REQUIRED FOR PARTNER ACCESS', 'info');
        }
        onOwnerSuccess();
        onClose();
        showToast(`Logged in as ${profileData.handle || 'Owner'}`, 'success');
      } else {
        showToast(`Access Denied: Venue account required.`);
        onClose();
      }
    } else {
      showToast('Profile not found.');
    }
  };

  const inputClasses = "w-full bg-slate-100 border border-slate-300 focus:border-primary rounded-md py-2 text-sm text-black outline-none font-bold pl-10";

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
      <div className="bg-surface w-full max-w-sm border-2 border-slate-700 shadow-lg rounded-xl relative flex flex-col max-h-[90vh] overflow-hidden">
        {userSubMode === 'login' && !showMfaStep && (
          <div className="flex border-b-2 border-slate-700">
            <button onClick={() => setLoginMode('user')} className={`flex-1 py-3 font-bold uppercase ${loginMode === 'user' ? 'bg-primary text-black' : 'text-slate-400'}`}>Player</button>
            <button onClick={() => setLoginMode('owner')} className={`flex-1 py-3 font-bold uppercase ${loginMode === 'owner' ? 'bg-primary text-black' : 'text-slate-400'}`}>Partner</button>
          </div>
        )}

        <div className="p-6 overflow-y-auto text-white">
          <button onClick={onClose} className="absolute top-3 right-3 text-slate-500"><X className="w-5 h-5" /></button>

          <div id="recaptcha-container"></div>

          {showMfaStep ? (
            <div className="space-y-6 text-center">
              <div className="bg-primary/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto border border-primary/30">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold uppercase">Identity Verification</h3>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Check your text messages for a code</p>
              </div>

              <div className="relative">
                <Hash className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  placeholder="6-Digit Code"
                  className={inputClasses}
                  maxLength={6}
                />
              </div>

              <button
                onClick={handleVerifyMfa}
                disabled={isLoading || mfaCode.length < 6}
                className="w-full bg-primary text-black font-bold py-3 rounded uppercase disabled:opacity-50"
              >
                {isLoading ? 'Verifying...' : 'Unlock Dashboard'}
              </button>

              <button
                onClick={() => setShowMfaStep(false)}
                className="text-[10px] text-slate-500 hover:text-white uppercase font-bold tracking-widest"
              >
                Cancel
              </button>
            </div>
          ) : loginMode === 'user' ? (
            <>
              <form onSubmit={(e) => { e.preventDefault(); userSubMode === 'signup' ? saveUser() : handleUserLogin(); }} className="space-y-4">
                <div className="text-center">
                  <h3 className="text-xl font-bold uppercase">{userSubMode === 'signup' ? 'Create Account' : 'Player Login'}</h3>
                  <p className="text-[10px] text-slate-400 uppercase">{userSubMode === 'signup' ? 'Save favorites & earn points' : 'Level up your night'}</p>
                </div>

                {userSubMode === 'signup' && (
                  <div className="relative">
                    <Hash className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input type="text" value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="Handle" className={inputClasses} />
                  </div>
                )}

                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className={inputClasses} />
                </div>

                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className={inputClasses} autoComplete="current-password" />
                </div>

                {userSubMode === 'signup' && (
                  <>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (Optional)" className={inputClasses} />
                    </div>

                    <div className="relative">
                      <Beer className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <input type="text" value={drink} onChange={(e) => setDrink(e.target.value)} placeholder="Preferred Sips (e.g. IPA)" className={inputClasses} />
                    </div>

                    <div className="relative">
                      <Home className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                      <select
                        value={homeBase}
                        onChange={(e) => setHomeBase(e.target.value)}
                        className={`${inputClasses} appearance-none cursor-pointer`}
                      >
                        <option value="" disabled className="text-black">Select Home Base</option>
                        {venues.map(v => (
                          <option key={v.id} value={v.id} className="text-black">{v.name}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {userSubMode === 'signup' && (
                  <div className="pt-4 border-t border-slate-700 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase">Join League?</span>
                      <button type="button" onClick={() => setJoinLeague(!joinLeague)} className={`w-10 h-5 rounded-full p-1 ${joinLeague ? 'bg-primary' : 'bg-slate-700'}`}>
                        <div className={`w-3 h-3 bg-white rounded-full transition-transform ${joinLeague ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    {joinLeague && (
                      <div className="grid grid-cols-2 gap-2">
                        {interestOptions.map(opt => (
                          <button key={opt.id} type="button" onClick={() => setSelectedInterests(prev => prev.includes(opt.id) ? prev.filter(i => i !== opt.id) : [...prev, opt.id])}
                            className={`p-2 border rounded text-[10px] font-bold uppercase ${selectedInterests.includes(opt.id) ? 'bg-primary text-black' : 'border-slate-700 text-slate-400'}`}>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase">Weekly Digest?</span>
                      <button type="button" onClick={() => setWeeklyBuzz(!weeklyBuzz)} className={`w-10 h-5 rounded-full p-1 ${weeklyBuzz ? 'bg-primary' : 'bg-slate-700'}`}>
                        <div className={`w-3 h-3 bg-white rounded-full transition-transform ${weeklyBuzz ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="checkbox"
                        id="acceptTerms"
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-primary focus:ring-primary"
                      />
                      <label htmlFor="acceptTerms" className="text-[10px] font-bold text-slate-400 uppercase">
                        I accept the <a href="/terms" target="_blank" className="text-primary hover:underline">Terms & Conditions</a>
                      </label>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary text-black font-bold py-3 rounded mt-4 uppercase disabled:opacity-50"
                >
                  {isLoading ? 'Processing...' : userSubMode === 'signup' ? 'Create Account' : 'Login'}
                </button>
              </form>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-700"></div></div>
                <div className="relative flex justify-center text-[8px] uppercase font-bold"><span className="bg-surface px-2 text-slate-500">Or Continue With</span></div>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full bg-white text-slate-900 font-bold py-3 rounded flex items-center justify-center gap-3 uppercase disabled:opacity-50 hover:bg-slate-100 transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" />
                  </svg>
                  Google
                </button>

                <button
                  type="button"
                  onClick={handleFacebookLogin}
                  disabled={isLoading}
                  className="w-full bg-[#1877F2] text-white font-bold py-3 rounded flex items-center justify-center gap-3 uppercase disabled:opacity-50 hover:bg-[#166fe5] transition-colors"
                >
                  <Facebook className="w-4 h-4" />
                  Facebook
                </button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setUserSubMode(userSubMode === 'signup' ? 'login' : 'signup')}
                  className="text-[10px] text-slate-500 hover:text-primary uppercase font-bold"
                >
                  {userSubMode === 'signup' ? 'Already have an account? Login' : 'Need an account? Sign Up'}
                </button>
              </div>
            </>
          ) : (
            <>
              <form onSubmit={(e) => { e.preventDefault(); handleOwnerLogin(); }} className="space-y-4">
                <div className="bg-red-900/20 p-3 text-[10px] text-red-300 rounded border border-red-800 uppercase text-center">Partner Access</div>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input type="email" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} placeholder="Email" className={inputClasses} />
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input type="password" value={ownerPassword} onChange={(e) => setOwnerPassword(e.target.value)} placeholder="Password" className={inputClasses} autoComplete="current-password" />
                </div>
                <button
                  type="submit"
                  className="w-full bg-slate-800 text-white font-bold py-3 rounded mt-4 uppercase hover:bg-slate-700 transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Login'}
                </button>
              </form>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-700"></div></div>
                <div className="relative flex justify-center text-[8px] uppercase font-bold"><span className="bg-surface px-2 text-slate-500">Or Commissioner Login</span></div>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full bg-slate-800 text-white border border-slate-600 font-bold py-3 rounded flex items-center justify-center gap-3 uppercase hover:bg-slate-700 transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" />
                  </svg>
                  Google
                </button>

                <button
                  type="button"
                  onClick={handleFacebookLogin}
                  disabled={isLoading}
                  className="w-full bg-[#1877F2] text-white font-bold py-3 rounded flex items-center justify-center gap-3 uppercase disabled:opacity-50 hover:bg-[#166fe5] transition-colors"
                >
                  <Facebook className="w-4 h-4" />
                  Facebook
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
