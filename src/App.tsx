import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClientProvider, useQuery } from '@tanstack/react-query';
import { SEO } from './components/common/SEO';
import { X } from 'lucide-react';

// --- CONFIG & TYPES ---
import { queryClient } from './lib/queryClient';
import {
  Venue, PointsReason, UserProfile, CheckInRecord, UserAlertPreferences, VenueStatus, ActivityLog
} from './types';

// --- REAL SERVICES ---
import { fetchVenues, updateVenueDetails } from './services/venueService';
import {
  saveAlertPreferences, logUserActivity, syncCheckIns,
  fetchUserRank,
  toggleFavorite,
  updateUserProfile,
  fetchRecentActivity // New Export
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
import { VibeCheckModal } from './features/venues/components/VibeCheckModal';
import { MakerSurveyModal } from './features/marketing/components/MakerSurveyModal'; // New Import
import { useToast } from './components/ui/BrandedToast';
import { VibeReceiptModal } from './features/social/components/VibeReceiptModal';
import { VibeReceiptData, generateArtieHook } from './features/social/services/VibeReceiptService';

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
import AboutPage from './pages/About';
import ArtieBioScreen from './features/artie/screens/ArtieBioScreen'; // [NEW] Import
import { QRVibeCheckScreen } from './features/vibe-check/screens/QRVibeCheckScreen'; // [NEW] QR Screen
import MerchStandScreen from './features/merch/screens/MerchStandScreen';
import MerchDetailScreen from './features/merch/screens/MerchDetailScreen';
import VoucherRedemptionScreen from './features/merch/screens/VoucherRedemptionScreen';
import ScrollToTop from './components/layout/ScrollToTop';
import { HistoryFeedScreen } from './features/history/screens/HistoryFeedScreen';
import { HistoryArticleScreen } from './features/history/screens/HistoryArticleScreen';
import { PulsePlaybookScreen } from './features/marketing/screens/PulsePlaybookScreen';
import AIGatewayScreen from './features/marketing/screens/AIGatewayScreen';
import AIFeedGuideScreen from './features/marketing/screens/AIFeedGuideScreen';
import AIConductScreen from './features/marketing/screens/AIConductScreen';


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
  // --- DATA FETCHING (TanStack Query) ---
  const { data: venues = [], isLoading } = useQuery({
    queryKey: ['venues'],
    queryFn: fetchVenues,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
  });

  const [userPoints, setUserPoints] = useState(() => parseInt(localStorage.getItem('oly_points') || '0'));
  const [checkInHistory, setCheckInHistory] = useState<CheckInRecord[]>(() => JSON.parse(localStorage.getItem('oly_checkins') || '[]'));
  const [alertPrefs, setAlertPrefs] = useState<UserAlertPreferences>(() => JSON.parse(localStorage.getItem('oly_prefs') || '{"nightlyDigest":true,"weeklyDigest":true,"followedVenues":[],"interests":[]}'));
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const stored = localStorage.getItem('oly_profile');
      if (!stored || stored === 'null' || stored === 'undefined') {
        return { uid: 'guest', role: 'guest' };
      }
      return JSON.parse(stored);
    } catch {
      return { uid: 'guest', role: 'guest' };
    }
  });

  const userId = userProfile?.uid || "guest_user_123";

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginMode, setLoginMode] = useState<'user' | 'owner'>('user');
  const [userSubMode, setUserSubMode] = useState<'login' | 'signup'>('signup');
  const [showOwnerDashboard, setShowOwnerDashboard] = useState(false);
  const [ownerDashboardInitialVenueId, setOwnerDashboardInitialVenueId] = useState<string | null>(null);
  const [ownerDashboardInitialView, setOwnerDashboardInitialView] = useState<'main' | 'marketing' | 'listing'>('main');
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(() => cookieService.get('oly_terms') === 'true');
  const [infoContent, setInfoContent] = useState<{ title: string, text: string } | null>(null);
  const [showClockInModal, setShowClockInModal] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [vibeVenue, setVibeVenue] = useState<Venue | null>(null);
  const [showVibeCheckModal, setShowVibeCheckModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [clockedInVenue, setClockedInVenue] = useState<string | null>(null);
  const [vibeCheckedVenue, setVibeCheckedVenue] = useState<string | null>(null);
  const [showArtie, setShowArtie] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [showMakerSurvey, setShowMakerSurvey] = useState(false); // Survey State
  const [currentReceipt, setCurrentReceipt] = useState<VibeReceiptData | null>(null);
  const { showToast } = useToast();
  // const [artieMessages, setArtieMessages] = useState<{ sender: string, text: string }[]>([
  //   { sender: 'artie', text: "Cheers! I'm Artie, your local guide powered by Well 80 Artesian Water." }
  // ]);
  const [userRank, setUserRank] = useState<number | undefined>(undefined);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getRank = async () => {
      if (userProfile.uid !== 'guest' && userPoints !== undefined) {
        const rank = await fetchUserRank(userPoints);
        setUserRank(rank);
      }
    };
    getRank();
  }, [userPoints, userProfile.uid]);

  // Persistence Layer (Sync State to LocalStorage)
  useEffect(() => {
    if (userProfile) {
      localStorage.setItem('oly_profile', JSON.stringify(userProfile));
    }
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('oly_points', userPoints.toString());
  }, [userPoints]);

  useEffect(() => {
    localStorage.setItem('oly_checkins', JSON.stringify(checkInHistory));
  }, [checkInHistory]);

  useEffect(() => {
    localStorage.setItem('oly_prefs', JSON.stringify(alertPrefs));
  }, [alertPrefs]);

  // Maker's Trail Survey Trigger: 3 Local Check-ins and Survey Not Done
  useEffect(() => {
    if (userProfile.uid !== 'guest' &&
      userProfile.makersTrailProgress &&
      userProfile.makersTrailProgress >= 3 &&
      !userProfile.hasCompletedMakerSurvey &&
      !showMakerSurvey) {
      // Add a small delay for UX so it doesn't pop immediately after action
      const timer = setTimeout(() => setShowMakerSurvey(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [userProfile.makersTrailProgress, userProfile.hasCompletedMakerSurvey, userProfile.uid]);

  const openInfo = (title: string, text: string) => { setInfoContent({ title, text }); };

  const awardPoints = (reason: PointsReason, venueId?: string, hasConsent?: boolean, verificationMethod?: 'gps' | 'qr') => {
    let delta = 0;
    if (reason === 'checkin' || reason === 'photo') delta = 10;
    else if (reason === 'share' || reason === 'social_share') delta = 5;
    else if (reason === 'vibe') delta = hasConsent ? 20 : 5;

    if (hasConsent && (reason as string) !== 'vibe') delta += 15; // Generic bonus for consent if not vibe

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

    logUserActivity(userId, { type: reason, venueId, hasConsent, points: delta, verificationMethod });
  };

  const handleUpdateVenue = async (venueId: string, updates: Partial<Venue>) => {
    // 1. Optimistic UI Update (TanStack Query Cache)
    queryClient.setQueryData(['venues'], (oldVenues: Venue[] | undefined) => {
      if (!oldVenues) return [];
      return oldVenues.map(v => v.id === venueId ? { ...v, ...updates } : v);
    });

    // 2. Persist to Backend
    try {
      await updateVenueDetails(venueId, updates);
    } catch (err) {
      console.error('[OlyBars] Failed to persist venue update:', err);
      showToast('Connection issue: Update might not be permanent.', 'error');
      // Invalidate on error to revert to server state
      queryClient.invalidateQueries({ queryKey: ['venues'] });
    }
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
      showToast("Nightly Cap reached! You've checked into 2 bars tonight. See you tomorrow at 4:00 AM!", 'error');
      return;
    }

    if (clockedInVenue === venue.id) { showToast("You're already checked in here!", 'info'); return; }

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
          showToast("Impossible Movement detected! Engage responsibly. Ops team has been notified.", 'error');
          logUserActivity(userId, { type: 'bonus', venueId: venue.id, points: 0, metadata: { flagged: 'impossible_movement', speedMph } });
          return;
        }
      }
    }

    setSelectedVenue(venue);
    setShowClockInModal(true);
  };

  const handleVibeCheck = (venue: Venue) => {
    const now = Date.now();

    // 1. Global Cooldown (30m)
    const lastGlobal = userProfile.lastGlobalVibeCheck;
    if (lastGlobal && (now - lastGlobal) < 30 * 60 * 1000) {
      const minsLeft = Math.ceil((30 * 60 * 1000 - (now - lastGlobal)) / 60000);
      showToast(`Global Cooldown! Wait ${minsLeft}m before checking another vibe.`, 'info');
      return;
    }

    // 2. Per-Venue Cooldown (60m)
    const lastCheck = userProfile.lastVibeChecks?.[venue.id];
    if (lastCheck && (now - lastCheck) < 60 * 60 * 1000) {
      const minsLeft = Math.ceil((60 * 60 * 1000 - (now - lastCheck)) / 60000);
      showToast(`${venue.name} Vibe Check locked! Available in ${minsLeft}m`, 'info');
      return;
    }

    setVibeVenue(venue);
    setShowVibeCheckModal(true);
  };

  const confirmVibeCheck = async (venue: Venue, status: VenueStatus, hasConsent: boolean, photoUrl?: string, verificationMethod: 'gps' | 'qr' = 'gps') => {
    const now = Date.now();

    // 1. If not already clocked in, perform a background check-in to unify signals
    if (!clockedInVenue || clockedInVenue !== venue.id) {
      setClockedInVenue(venue.id);
      setCheckInHistory(prev => [...prev, { venueId: venue.id, timestamp: now }]);
    }

    setVibeCheckedVenue(venue.id);

    // Update Venue Status and Photos
    handleUpdateVenue(venue.id, {
      status,
      photos: photoUrl ? [
        ...(venue.photos || []),
        {
          id: `p-${now}-${Math.random().toString(36).substr(2, 6)}`,
          url: photoUrl,
          allowMarketingUse: hasConsent,
          timestamp: now,
          userId: userProfile.uid
        }
      ] : venue.photos
    });

    awardPoints('vibe', venue.id, hasConsent, verificationMethod);

    // Generate Vibe Receipt
    const receipt: VibeReceiptData = {
      type: 'vibe',
      venueName: venue.name,
      venueId: venue.id,
      pointsEarned: 5 + (photoUrl ? 10 : 0) + (hasConsent ? 15 : 0),
      vibeStatus: status,
      artieHook: generateArtieHook('vibe', status),
      username: userProfile.handle || userProfile.displayName || 'Member',
      userId: userProfile.uid,
      timestamp: new Date().toISOString()
    };
    setCurrentReceipt(receipt);
  };

  const handleToggleWeeklyBuzz = async () => {
    const newVal = !userProfile.weeklyBuzz;

    // 1. Update Profile (Local + Remote)
    setUserProfile(prev => ({ ...prev, weeklyBuzz: newVal }));

    // 2. Update Alert Prefs (Local) to keep synced
    setAlertPrefs(prev => ({ ...prev, weeklyDigest: newVal }));

    // 3. Persist to Firestore
    if (userProfile.uid !== 'guest') {
      try {
        await updateUserProfile(userProfile.uid, { weeklyBuzz: newVal });
      } catch (e) {
        showToast('Sync failed, retrying...', 'error');
      }
    }
  };

  const handleToggleFavorite = async (venueId: string) => {
    if (userProfile.uid === 'guest') {
      setShowLoginModal(true);
      return;
    }

    try {
      const result = await toggleFavorite(userProfile.uid, venueId, userProfile.favorites || []);
      if (result.success) {
        setUserProfile(prev => ({ ...prev, favorites: result.favorites }));
        showToast(userProfile.favorites?.includes(venueId) ? 'Removed from Favorites' : 'Added to Favorites', 'success');
      }
    } catch (e) {
      showToast('Error updating favorites', 'error');
    }
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

  const handleLogout = () => {
    localStorage.removeItem('oly_profile');
    localStorage.removeItem('oly_points');
    localStorage.removeItem('oly_checkins');
    setUserProfile({ uid: 'guest', role: 'guest' });
    setUserPoints(1250);
    setCheckInHistory([]);
    setShowOwnerDashboard(false);
    window.location.href = '/';
  };

  // Sync points when profile changes (e.g. after login)
  useEffect(() => {
    if (userProfile.stats?.seasonPoints !== undefined) {
      setUserPoints(userProfile.stats.seasonPoints);
    }
  }, [userProfile.uid, userProfile.stats?.seasonPoints]);

  if (!hasAcceptedTerms) {
    return <OnboardingModal isOpen={true} onClose={handleAcceptTerms} userRole="guest" />;
  }

  return (
    <ErrorBoundary>
      <Router>
        <ScrollToTop />
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
                  onToggleWeeklyBuzz={handleToggleWeeklyBuzz}
                  onProfileClick={() => {
                    if (userProfile.uid === 'guest') {
                      setLoginMode('user');
                      setUserSubMode('login');
                      setShowLoginModal(true);
                    } else {
                      // Use document location for SPA feel or navigation handler
                      window.history.pushState({}, '', '/profile');
                      // Since we aren't using a router hook at this level, 
                      // we need to trigger a re-render or use a shared navigation handler.
                      // However, routes are defined below. 
                      // To keep it simple and fix the "reload" issue:
                      const popStateEvent = new PopStateEvent('popstate');
                      window.dispatchEvent(popStateEvent);
                    }
                  }}
                  onOwnerLoginClick={() => {
                    setLoginMode('owner');
                    setUserSubMode('login');
                    setShowLoginModal(true);
                  }}
                  onMemberLoginClick={(mode?: 'login' | 'signup') => {
                    setLoginMode('user');
                    if (mode) setUserSubMode(mode);
                    setShowLoginModal(true);
                  }}
                  userRole={userProfile.role}
                  userHandle={userProfile.handle}
                  userRank={userRank}
                  onLogout={handleLogout}
                  userProfile={userProfile}
                  onToggleFavorite={handleToggleFavorite}
                  showArtie={showArtie}
                  setShowArtie={setShowArtie}
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
                    <>
                      <SEO
                        title="Pulse & Buzz"
                        description="Track the real-time vibe of downtown Olympia. See which bars are buzzing right now."
                      />
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
                    </>
                  )
                }
              />
              <Route path="karaoke" element={<><SEO title="Karaoke Guide" description="Find the best karaoke spots in Olympia tonight." /><KaraokeScreen venues={venues} /></>} />
              <Route path="trivia" element={<><SEO title="Trivia & Games" description="Your guide to trivia nights and bar games in the 98501." /><TriviaScreen venues={venues} userProfile={userProfile} /></>} />
              <Route path="live" element={<><SEO title="Live Music" description="Live shows and concerts happening tonight in downtown Olympia." /><LiveMusicScreen venues={venues} /></>} />
              <Route path="events" element={<><SEO title="Event Wire" description="The chronological feed of everything happening in the Olympia bar scene." /><EventsScreen venues={venues} /></>} />
              <Route
                path="league"
                element={
                  <>
                    <SEO title="Bar League HQ" description="Join the official Olympia Bar League. Track your points, rankings, and rewards." />
                    <LeagueHQScreen
                      venues={venues}
                      isLeagueMember={userProfile.role !== 'guest'}
                      onJoinClick={(mode) => {
                        setUserSubMode(mode || 'login');
                        setLoginMode('user');
                        setShowLoginModal(true);
                      }}
                      onAskArtie={() => setShowArtie(true)}
                    />
                  </>
                }
              />
              <Route path="bars" element={<><SEO title="Dives & Drafts" description="The definitive directory of every bar and taproom in Olympia." /><TheSpotsScreen venues={venues} userProfile={userProfile} handleToggleFavorite={handleToggleFavorite} mode="bars" /></>} />
              <Route path="makers" element={<><SEO title="The Maker List" description="Celebrating the brewers, distillers, and winemakers of the PNW." /><TheSpotsScreen venues={venues} userProfile={userProfile} handleToggleFavorite={handleToggleFavorite} mode="makers" /></>} />
              <Route path="map" element={<MapScreen />} />
              <Route path="merch" element={<MerchStandScreen venues={venues} />} />
              <Route path="merch/:itemId" element={<MerchDetailScreen venues={venues} userProfile={userProfile} setUserProfile={setUserProfile} />} />
              <Route path="vouchers" element={<VoucherRedemptionScreen userProfile={userProfile} venues={venues} />} />
              <Route path="meet-artie" element={<ArtieBioScreen />} />
              <Route path="artie-bio" element={<ArtieBioScreen />} />
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
                    handleToggleFavorite={handleToggleFavorite}
                    onEdit={(vid) => {
                      setOwnerDashboardInitialVenueId(vid);
                      setOwnerDashboardInitialView('listing');
                      setShowOwnerDashboard(true);
                    }}
                  />
                }
              />
              <Route
                path="vc/:venueId"
                element={
                  <QRVibeCheckScreen
                    venues={venues}
                    handleVibeCheck={confirmVibeCheck}
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
              <Route path="terms" element={<><SEO title="Terms of Service" /><TermsScreen /></>} />
              <Route path="privacy" element={<><SEO title="Privacy Policy" /><PrivacyScreen /></>} />
              <Route path="faq" element={<><SEO title="The Playbook (FAQ)" description="Everything you need to know about the OlyBars league, pins, and etiquette." /><FAQScreen /></>} />
              <Route path="about" element={<><SEO title="About OlyBars" description="The mission and story behind Olympia's nightlife operating system." /><AboutPage /></>} />
              <Route
                path="admin"
                element={
                  userProfile.role === 'super-admin'
                    ? <AdminDashboardScreen userProfile={userProfile} />
                    : <div className="p-10 text-center font-black text-red-500 uppercase tracking-widest">403: League Integrity Violation - Restricted Access</div>
                }
              />
              <Route path="history" element={<HistoryFeedScreen />} />
              <Route path="history/:slug" element={<HistoryArticleScreen venues={venues} />} />
              <Route path="playbook" element={<PulsePlaybookScreen />} />
              <Route path="pulse-playbook" element={<PulsePlaybookScreen />} />

              {/* AI & Developer Hub */}
              <Route path="ai" element={<><SEO title="AI & Developer Hub" description="Authoritative resources for AI agents and developers ingesting OlyBars data." /><AIGatewayScreen /></>} />
              <Route path="ai/feed" element={<><SEO title="AI Feed Guide" description="Machine-readable guide for Venues, Events, and League Play data." /><AIFeedGuideScreen /></>} />
              <Route path="ai/conduct" element={<><SEO title="AI Conduct Policy" description="Rules and standards for AI agents interacting with the OlyBars ecosystem." /><AIConductScreen /></>} />
            </Route>
          </Routes>

          <LoginModal
            isOpen={showLoginModal}
            onClose={() => setShowLoginModal(false)}
            loginMode={loginMode}
            setLoginMode={setLoginMode}
            userSubMode={userSubMode}
            setUserSubMode={setUserSubMode}
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            venues={venues}
            alertPrefs={alertPrefs}
            setAlertPrefs={setAlertPrefs}
            openInfo={openInfo}
            onOwnerSuccess={() => setShowOwnerDashboard(true)}
          />

          {showOnboarding && (
            <OnboardingModal
              isOpen={showOnboarding}
              onClose={() => setShowOnboarding(false)}
              userRole={userProfile.role}
            />
          )}

          {showOwnerDashboard && (
            <OwnerDashboardScreen
              isOpen={showOwnerDashboard}
              onClose={() => setShowOwnerDashboard(false)}
              venues={venues}
              updateVenue={handleUpdateVenue}
              userProfile={userProfile}
              initialVenueId={ownerDashboardInitialVenueId}
              initialView={ownerDashboardInitialView}
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
              vibeChecked={vibeCheckedVenue === selectedVenue.id}
              onVibeCheckPrompt={() => {
                setVibeVenue(selectedVenue);
                setShowVibeCheckModal(true);
                setShowClockInModal(false);
              }}
            />
          )}

          {showVibeCheckModal && vibeVenue && (
            <VibeCheckModal
              isOpen={showVibeCheckModal}
              onClose={() => setShowVibeCheckModal(false)}
              venue={vibeVenue}
              onConfirm={confirmVibeCheck}
              clockedIn={clockedInVenue === vibeVenue.id}
              onClockInPrompt={() => {
                setSelectedVenue(vibeVenue);
                setShowClockInModal(true);
                setShowVibeCheckModal(false);
              }}
            />
          )}

          {showMakerSurvey && (
            <MakerSurveyModal
              isOpen={showMakerSurvey}
              onClose={() => {
                setShowMakerSurvey(false);
                // Optimistic update to prevent re-trigger in this session
                setUserProfile(prev => ({ ...prev, hasCompletedMakerSurvey: true }));
              }}
              userId={userProfile.uid}
            />
          )}

          {currentReceipt && (
            <VibeReceiptModal
              data={currentReceipt}
              onClose={() => setCurrentReceipt(null)}
            />
          )}

          <InfoPopup infoContent={infoContent} setInfoContent={setInfoContent} />
        </div>
      </Router>
    </ErrorBoundary >
  );
}