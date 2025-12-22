import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { X } from 'lucide-react';

// --- CONFIG & TYPES ---
import { queryClient } from './lib/queryClient';
import {
  Venue, PointsReason, UserProfile, CheckInRecord, UserAlertPreferences
} from './types';

// --- REAL SERVICES ---
import { getArtieResponse } from './services/geminiService';
import { fetchVenues } from './services/venueService';
import {
  saveAlertPreferences, logUserActivity, syncCheckIns
} from './services/userService';

// --- MODULAR COMPONENTS ---
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { AppShell } from './components/layout/AppShell';
import { BuzzScreen } from './features/venues/screens/BuzzScreen';
import { KaraokeScreen } from './features/league/screens/KaraokeScreen';
import { TriviaScreen } from './features/league/screens/TriviaScreen';
import { LiveMusicScreen } from './features/league/screens/LiveMusicScreen';
import { EventsScreen } from './features/league/screens/EventsScreen';
import { VenuesScreen } from './features/venues/screens/VenuesScreen';
import TheSpotsScreen from './features/venues/screens/TheSpotsScreen';
import { LoginModal } from './features/auth/components/LoginModal';
import { OwnerDashboardScreen } from './features/owner/screens/OwnerDashboardScreen';
import { ClockInModal } from './features/venues/components/ClockInModal';
import { OnboardingModal } from './components/ui/OnboardingModal';

// --- UTILS & HELPERS ---
import { cookieService } from './services/cookieService';
import { calculateDistance, metersToMiles } from './utils/geoUtils';

// --- RELOCATED SCREENS ---
import MapScreen from './features/venues/screens/MapScreen';
import MoreScreen from './features/profile/screens/MoreScreen';
import { LeagueHQScreen } from './features/league/screens/LeagueHQScreen';
import TermsScreen from './features/marketing/screens/TermsScreen';
import PrivacyScreen from './features/marketing/screens/PrivacyScreen';
import FAQScreen from './features/marketing/screens/FAQScreen';
import { AdminDashboardScreen } from './features/admin/screens/AdminDashboardScreen';
import UserProfileScreen from './features/profile/screens/UserProfileScreen';
import { VenueProfileScreen } from './features/venues/screens/VenueProfileScreen';


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
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [userPoints, setUserPoints] = useState(() => parseInt(localStorage.getItem('oly_points') || '1250'));
  const [checkInHistory, setCheckInHistory] = useState<CheckInRecord[]>(() => JSON.parse(localStorage.getItem('oly_checkins') || '[]'));
  const [alertPrefs, setAlertPrefs] = useState<UserAlertPreferences>(() => JSON.parse(localStorage.getItem('oly_prefs') || '{"nightlyDigest":true,"weeklyDigest":true,"followedVenues":[],"interests":[]}'));
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      return JSON.parse(localStorage.getItem('oly_profile') || '{"uid":"guest","role":"guest"}');
    } catch {
      return { uid: 'guest', role: 'guest' };
    }
  });

  const userId = userProfile.uid || "guest_user_123";

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginMode, setLoginMode] = useState<'user' | 'owner'>('user');
  const [showOwnerDashboard, setShowOwnerDashboard] = useState(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(() => cookieService.get('oly_terms') === 'true');
  const [infoContent, setInfoContent] = useState<{ title: string, text: string } | null>(null);
  const [showClockInModal, setShowClockInModal] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [clockedInVenue, setClockedInVenue] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [artieMessages, setArtieMessages] = useState<{ sender: string, text: string }[]>([
    { sender: 'artie', text: "Cheers! I'm Artie, your local guide powered by Well 80 Artesian Water." }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchVenues();
        setVenues(data);
      } catch (err) {
        console.error('[OlyBars] CRITICAL: Failed to load venues:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const openInfo = (title: string, text: string) => { setInfoContent({ title, text }); };

  const awardPoints = (reason: PointsReason, venueId?: string, hasConsent?: boolean) => {
    let delta = 0;
    if (reason === 'checkin' || reason === 'photo') delta = 10;
    else if (reason === 'share') delta = 5;
    else if (reason === 'vibe') delta = hasConsent ? 20 : 5;

    if (hasConsent && reason !== 'vibe') delta += 15; // Generic bonus for consent if not vibe

    setUserPoints(prev => prev + delta);

    if (reason === 'vibe' && venueId) {
      const now = Date.now();
      setUserProfile(prev => ({
        ...prev,
        lastGlobalVibeCheck: now,
        lastVibeChecks: {
          ...prev.lastVibeChecks,
          [venueId]: now
        }
      }));
    }

    logUserActivity(userId, { type: reason, venueId, hasConsent, points: delta });
  };

  const handleUpdateVenue = (venueId: string, updates: Partial<Venue>) => {
    setVenues(prev => prev.map(v => v.id === venueId ? { ...v, ...updates } : v));
  };

  const handleClockIn = (venue: Venue) => {
    const now = Date.now();

    // 1. Calculate OlyBars Business Day Start (4:00 AM)
    const today4AM = new Date();
    today4AM.setHours(4, 0, 0, 0);
    const businessDayStart = (now < today4AM.getTime())
      ? today4AM.getTime() - 24 * 60 * 60 * 1000
      : today4AM.getTime();

    const nightlyChecks = checkInHistory.filter(c => c.timestamp >= businessDayStart);

    // 2. Nightly Cap Check (Engagement Integrity)
    if (nightlyChecks.length >= 2) {
      alert("Nightly Cap reached! You've checked into 2 bars tonight. See you tomorrow at 4:00 AM!");
      return;
    }

    if (clockedInVenue === venue.id) { alert("You're already checked in here!"); return; }

    // 3. Impossible Movement Check (Ops/Anti-Gaming)
    if (nightlyChecks.length > 0) {
      const lastCheck = nightlyChecks[nightlyChecks.length - 1];
      const lastVenue = venues.find(v => v.id === lastCheck.venueId);

      if (lastVenue?.location && venue.location) {
        const distMeters = calculateDistance(
          lastVenue.location.lat, lastVenue.location.lng,
          venue.location.lat, venue.location.lng
        );
        const timeDiffSec = (now - lastCheck.timestamp) / 1000;
        const speedMph = (metersToMiles(distMeters) / (timeDiffSec / 3600));

        // Threshold: 100mph city movement is likely GPS spoofing or irresponsible
        if (speedMph > 100 && timeDiffSec > 0) {
          alert("Impossible Movement detected! Engage responsibly. Ops team has been notified.");
          logUserActivity(userId, { type: 'bonus', venueId: venue.id, points: 0, metadata: { flagged: 'impossible_movement', speedMph } });
          return;
        }
      }
    }

    setSelectedVenue(venue);
    setShowClockInModal(true);
  };

  const handleVibeCheck = (venue: Venue, hasConsent?: boolean, photoUrl?: string) => {
    const now = Date.now();

    // 1. Global Cooldown (30m)
    const lastGlobal = userProfile.lastGlobalVibeCheck;
    if (lastGlobal && (now - lastGlobal) < 30 * 60 * 1000) {
      const minsLeft = Math.ceil((30 * 60 * 1000 - (now - lastGlobal)) / 60000);
      alert(`Global Cooldown! Wait ${minsLeft}m before checking another vibe.`);
      return;
    }

    // 2. Per-Venue Cooldown (60m)
    const lastCheck = userProfile.lastVibeChecks?.[venue.id];
    if (lastCheck && (now - lastCheck) < 60 * 60 * 1000) {
      const minsLeft = Math.ceil((60 * 60 * 1000 - (now - lastCheck)) / 60000);
      alert(`${venue.name} Vibe Check locked! Available in ${minsLeft}m`);
      return;
    }

    // 3. Update Venue Photos if photo provided
    if (photoUrl) {
      handleUpdateVenue(venue.id, {
        photos: [
          ...(venue.photos || []),
          {
            id: `p-${now}-${Math.random().toString(36).substr(2, 6)}`,
            url: photoUrl,
            allowMarketingUse: !!hasConsent,
            timestamp: now,
            userId: userProfile.uid
          }
        ]
      });
    }

    awardPoints('vibe', venue.id, hasConsent);
  };

  const handleAcceptTerms = () => {
    cookieService.set('oly_terms', 'true');
    // We don't set oly_cookies here automatically so the banner shows up separately
    setHasAcceptedTerms(true);
  };

  useEffect(() => { localStorage.setItem('oly_points', userPoints.toString()); }, [userPoints]);
  useEffect(() => { localStorage.setItem('oly_checkins', JSON.stringify(checkInHistory)); }, [checkInHistory]);
  useEffect(() => { localStorage.setItem('oly_profile', JSON.stringify(userProfile)); }, [userProfile]);
  useEffect(() => { localStorage.setItem('oly_prefs', JSON.stringify(alertPrefs)); saveAlertPreferences(userId, alertPrefs); }, [alertPrefs]);

  // Sync points when profile changes (e.g. after login)
  useEffect(() => {
    if (userProfile.stats?.seasonPoints !== undefined) {
      setUserPoints(userProfile.stats.seasonPoints);
    }
  }, [userProfile.uid, userProfile.stats?.seasonPoints]);

  if (!hasAcceptedTerms) {
    return <OnboardingModal isOpen={true} onClose={handleAcceptTerms} />;
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="h-full bg-background overflow-hidden relative">
            <Routes>
              <Route
                path="*"
                element={
                  <AppShell
                    venues={venues}
                    userPoints={userPoints}
                    isLeagueMember={userProfile.role !== 'guest'}
                    alertPrefs={alertPrefs}
                    setAlertPrefs={setAlertPrefs}
                    onProfileClick={() => {
                      if (userProfile.uid === 'guest') {
                        setLoginMode('user');
                        setShowLoginModal(true);
                      } else {
                        window.location.href = '/profile';
                      }
                    }}
                    onOwnerLoginClick={() => {
                      setLoginMode('owner');
                      setShowLoginModal(true);
                    }}
                    userRole={userProfile.role}
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
                        userProfile={userProfile}
                        userPoints={userPoints}
                        handleClockIn={handleClockIn}
                        clockedInVenue={clockedInVenue}
                        handleVibeCheck={handleVibeCheck}
                        lastVibeChecks={userProfile.lastVibeChecks}
                        lastGlobalVibeCheck={userProfile.lastGlobalVibeCheck}
                      />
                    )
                  }
                />
                <Route path="karaoke" element={<KaraokeScreen venues={venues} />} />
                <Route path="trivia" element={<TriviaScreen venues={venues} />} />
                <Route path="live" element={<LiveMusicScreen venues={venues} />} />
                <Route path="events" element={<EventsScreen venues={venues} />} />
                <Route path="league" element={<LeagueHQScreen venues={venues} isLeagueMember={userProfile.role !== 'guest'} />} />
                <Route path="bars" element={<TheSpotsScreen venues={venues} />} />
                <Route path="map" element={<MapScreen />} />
                <Route path="more" element={<MoreScreen userProfile={userProfile} setUserProfile={setUserProfile} />} />
                <Route
                  path="venues/:id"
                  element={
                    <VenueProfileScreen
                      venues={venues}
                      userProfile={userProfile}
                      handleClockIn={handleClockIn}
                      handleVibeCheck={handleVibeCheck}
                      clockedInVenue={clockedInVenue}
                    />
                  }
                />
                <Route
                  path="profile"
                  element={
                    userProfile.uid !== 'guest'
                      ? <UserProfileScreen userProfile={userProfile} setUserProfile={setUserProfile} venues={venues} />
                      : <div className="p-10 text-center font-black text-primary uppercase tracking-widest">
                        Access Denied: Please Login to View Your League ID
                        <button onClick={() => setShowLoginModal(true)} className="block mx-auto mt-4 px-6 py-2 bg-primary text-black rounded-lg">Login</button>
                      </div>
                  }
                />
                <Route path="terms" element={<TermsScreen />} />
                <Route path="privacy" element={<PrivacyScreen />} />
                <Route path="faq" element={<FAQScreen />} />
                <Route
                  path="admin"
                  element={
                    userProfile.role === 'super-admin'
                      ? <AdminDashboardScreen userProfile={userProfile} />
                      : <div className="p-10 text-center font-black text-red-500 uppercase tracking-widest">403: League Integrity Violation - Restricted Access</div>
                  }
                />
              </Route>
            </Routes>

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
                awardPoints={awardPoints}
                setCheckInHistory={setCheckInHistory}
                setClockedInVenue={setClockedInVenue}
                setVenues={setVenues}
              />
            )}

            <InfoPopup infoContent={infoContent} setInfoContent={setInfoContent} />
          </div>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary >
  );
}