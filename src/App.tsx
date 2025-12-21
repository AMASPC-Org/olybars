import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { X } from 'lucide-react';

// --- CONFIG & TYPES ---
import { queryClient } from './lib/queryClient';
import {
  Venue, PointsReason, UserProfile, CheckInRecord, UserAlertPreferences, Message
} from './types';

// --- REAL SERVICES (Connecting the pipes) ---
import { getArtieResponse } from './services/geminiService'; // Placeholder for now
import { fetchVenues } from './services/venueService';       // REAL Firestore Read
import {
  saveAlertPreferences, logUserActivity, syncCheckIns
} from './services/userService';                             // REAL Firestore Write

// --- MODULAR COMPONENTS ---
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { AppShell } from './components/layout/AppShell';
import { BuzzScreen } from './features/venues/screens/BuzzScreen';
import { KaraokeScreen } from './features/league/screens/KaraokeScreen';
import { TriviaScreen } from './features/league/screens/TriviaScreen';
import { ArcadeScreen } from './features/league/screens/ArcadeScreen';
import { EventsScreen } from './features/league/screens/EventsScreen';
import { LeagueHQScreen } from './features/league/screens/LeagueHQScreen';
import { LoginModal } from './features/auth/components/LoginModal';
import { OwnerDashboardScreen } from './features/owner/screens/OwnerDashboardScreen';
import { ClockInModal } from './features/venues/components/ClockInModal';
import { OnboardingModal } from './components/ui/OnboardingModal';
import { CookieBanner } from './components/ui/CookieBanner';

// --- UTILS & HELPERS ---
import { cookieService } from './services/cookieService';

// --- RELOCATED SCREENS ---
import MapScreen from './features/venues/screens/MapScreen';
import MoreScreen from './features/profile/screens/MoreScreen';
import LeagueHomeScreen from './features/league/screens/LeagueHomeScreen';
import LandingScreen from './features/marketing/screens/LandingScreen';
import TermsScreen from './features/marketing/screens/TermsScreen';
import PrivacyScreen from './features/marketing/screens/PrivacyScreen';
import FAQScreen from './features/marketing/screens/FAQScreen';

const LiveMusicScreen = () => <div className="p-4 text-white">LIVE MUSIC (WIP)</div>;

const InfoPopup = ({ infoContent, setInfoContent }: any) => {
  if (!infoContent) return null;
  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setInfoContent(null)}>
      <div className="bg-surface border border-white/10 p-6 rounded-2xl shadow-2xl max-w-sm w-full relative" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-black text-primary uppercase tracking-wide mb-3 font-league">{infoContent.title}</h3>
        <p className="text-sm text-slate-300 font-medium leading-relaxed font-body">{infoContent.text}</p>
        <button onClick={() => setInfoContent(null)} className="absolute top-3 right-3 text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
      </div>
    </div>
  );
};

export default function OlyBarsApp() {
  // STATE: Start empty, load from DB
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [userPoints, setUserPoints] = useState(() => parseInt(localStorage.getItem('oly_points') || '1250'));
  const [checkInHistory, setCheckInHistory] = useState<CheckInRecord[]>(() => JSON.parse(localStorage.getItem('oly_checkins') || '[]'));
  const [alertPrefs, setAlertPrefs] = useState<UserAlertPreferences>(() => JSON.parse(localStorage.getItem('oly_prefs') || '{"nightlyDigest":true,"weeklyDigest":true,"followedVenues":[],"interests":[]}'));
  const [userProfile, setUserProfile] = useState<UserProfile>(() => JSON.parse(localStorage.getItem('oly_profile') || '{"role":"guest"}'));

  // Fake User ID until Auth state is fully wired
  const userId = "guest_user_123";

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginMode, setLoginMode] = useState<'user' | 'owner'>('user');
  const [showOwnerDashboard, setShowOwnerDashboard] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(() => cookieService.get('oly_terms') === 'true');
  const [hasAcceptedCookies, setHasAcceptedCookies] = useState(() => cookieService.get('oly_cookies') === 'true');
  const [showArtie, setShowArtie] = useState(false);
  const [infoContent, setInfoContent] = useState<{ title: string, text: string } | null>(null);
  const [showClockInModal, setShowClockInModal] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [clockedInVenue, setClockedInVenue] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [artieMessages, setArtieMessages] = useState<{ sender: string, text: string }[]>([
    { sender: 'artie', text: "Cheers! I'm Artie, your local guide powered by Well 80 Artesian Water." }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- LOAD DATA FROM FIRESTORE ---
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const data = await fetchVenues();
      setVenues(data);
      setIsLoading(false);
    };
    loadData();
  }, []);

  const openInfo = (title: string, text: string) => { setInfoContent({ title, text }); };

  const awardPoints = (reason: PointsReason) => {
    const delta = reason === 'checkin' ? 10 : reason === 'photo' ? 10 : reason === 'share' ? 5 : 0;
    setUserPoints(prev => prev + delta);
    // Log to Real Firestore
    logUserActivity(userId, { type: reason, timestamp: Date.now() });
  };

  const handleUpdateVenue = (venueId: string, updates: Partial<Venue>) => {
    setVenues(prev => prev.map(v => v.id === venueId ? { ...v, ...updates } : v));
    // TODO: Call updateVenue in venueService to persist to DB
  };

  const handleChatSend = async () => {
    if (!chatInput.trim()) return;
    const userText = chatInput;
    setChatInput('');
    setArtieMessages(prev => [...prev, { sender: 'user', text: userText }]);
    try {
      const response = await getArtieResponse(userText, []);
      setArtieMessages(prev => [...prev, { sender: 'artie', text: response }]);
    } catch (e) {
      setArtieMessages(prev => [...prev, { sender: 'artie', text: "Connection error." }]);
    }
  };

  const handleClockIn = (venue: Venue) => {
    const now = Date.now();
    const twelveHoursAgo = now - 12 * 60 * 60 * 1000;
    const recentChecks = checkInHistory.filter(c => c.timestamp >= twelveHoursAgo);
    if (recentChecks.length >= 2) { alert("Whoa there! Max 2 check-ins per 12 hours."); return; }
    if (clockedInVenue === venue.id) { alert("You're already checked in here!"); return; }
    setSelectedVenue(venue);
    setShowClockInModal(true);
  };

  const confirmClockInSuccess = (venueId: string) => {
    const newHistory = [...checkInHistory, { venueId: venueId, timestamp: Date.now() }];
    setCheckInHistory(newHistory);
    setClockedInVenue(venueId);
    setVenues(prev => prev.map(v => v.id === venueId ? { ...v, checkIns: v.checkIns + 1 } : v));
    setShowClockInModal(false);

    // Sync to Real Firestore
    syncCheckIns(userId, newHistory);

    setShowArtie(true);
    setArtieMessages(prev => [...prev, { sender: 'artie', text: `You're clocked in at ${venues.find(v => v.id === venueId)?.name}. Points added!` }]);
  };

  const handleAcceptTerms = () => {
    cookieService.set('oly_terms', 'true');
    cookieService.set('oly_cookies', 'true');
    setHasAcceptedTerms(true);
    setHasAcceptedCookies(true);
  };
  const handleLogout = () => {
    if (confirm('Are you sure you want to sign out?')) {
      setUserProfile({ role: 'guest' });
      setShowMenu(false);
    }
  };

  useEffect(() => { localStorage.setItem('oly_points', userPoints.toString()); }, [userPoints]);
  useEffect(() => { localStorage.setItem('oly_checkins', JSON.stringify(checkInHistory)); }, [checkInHistory]);
  useEffect(() => { localStorage.setItem('oly_profile', JSON.stringify(userProfile)); }, [userProfile]);
  useEffect(() => { localStorage.setItem('oly_prefs', JSON.stringify(alertPrefs)); saveAlertPreferences(userId, alertPrefs); }, [alertPrefs]);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [artieMessages]);

  if (!hasAcceptedTerms) {
    return <OnboardingModal isOpen={true} isTermsGate={true} onClose={handleAcceptTerms} />;
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route
              path="/"
              element={
                <AppShell
                  venues={venues}
                  userPoints={userPoints}
                  isLeagueMember={userProfile.role !== 'guest'}
                  alertPrefs={alertPrefs}
                  setAlertPrefs={setAlertPrefs}
                  onProfileClick={() => {
                    setLoginMode('user');
                    setShowLoginModal(true);
                  }}
                  onOwnerLoginClick={() => {
                    setLoginMode('owner');
                    setShowLoginModal(true);
                  }}
                />
              }
            >
              <Route
                index
                element={
                  isLoading ? (
                    <div className="p-10 text-center text-primary font-bold">
                      Connecting to AMA Network...
                    </div>
                  ) : (
                    <BuzzScreen
                      venues={venues}
                      handleClockIn={handleClockIn}
                      clockedInVenue={clockedInVenue}
                    />
                  )
                }
              />
              <Route path="live" element={<LiveMusicScreen />} />
              <Route path="karaoke" element={<KaraokeScreen />} />
              <Route path="trivia" element={<TriviaScreen />} />
              <Route path="arcade" element={<ArcadeScreen />} />
              <Route path="events" element={<EventsScreen />} />
              <Route path="league" element={<LeagueHomeScreen />} />
              <Route path="map" element={<MapScreen />} />
              <Route path="more" element={<MoreScreen />} />
              <Route path="terms" element={<TermsScreen />} />
              <Route path="privacy" element={<PrivacyScreen />} />
              <Route path="faq" element={<FAQScreen />} />
            </Route>

          </Routes>
        </Router>
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          loginMode={loginMode}
          setLoginMode={setLoginMode}
          userProfile={userProfile}
          setUserProfile={setUserProfile}
          venues={venues}
          alertPrefs={alertPrefs}
          setAlertPrefs={setAlertPrefs}
          openInfo={openInfo}
          onOwnerSuccess={() => setShowOwnerDashboard(true)}
        />

        {showOwnerDashboard && (
          <OwnerDashboardScreen
            isOpen={showOwnerDashboard}
            onClose={() => setShowOwnerDashboard(false)}
            venues={venues}
            updateVenue={handleUpdateVenue}
            userProfile={userProfile}
          />
        )}

        {showClockInModal && selectedVenue && (
          <ClockInModal
            isOpen={showClockInModal}
            onClose={() => setShowClockInModal(false)}
            selectedVenue={selectedVenue}
            confirmClockInSuccess={confirmClockInSuccess}
            awardPoints={awardPoints}
            checkInHistory={checkInHistory}
          />
        )}

        <InfoPopup infoContent={infoContent} setInfoContent={setInfoContent} />
        <CookieBanner />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}