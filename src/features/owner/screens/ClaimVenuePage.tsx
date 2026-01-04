import React, { useState } from 'react';
import {
    Building2, MapPin, Phone, Globe, Check,
    ChevronRight, ArrowLeft, Send, Users,
    LayoutGrid, Settings2, Info, LogIn, Crown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PlaceAutocomplete } from '../../../components/ui/PlaceAutocomplete';
import { AssetToggleGrid } from '../../../components/partners/AssetToggleGrid';
import { Venue } from '../../../types';
import { syncVenueWithGoogle, updateVenueDetails, checkVenueClaim, onboardVenue } from '../../../services/venueService';
import { useToast } from '../../../components/ui/BrandedToast';
import { SEO } from '../../../components/common/SEO';
import { auth } from '../../../lib/firebase';

type OnboardingStep = 'SEARCH' | 'VERIFY' | 'CONFIG' | 'INVITE' | 'SUCCESS';

export default function ClaimVenuePage() {
    const { showToast } = useToast();
    const [step, setStep] = useState<OnboardingStep>('SEARCH');
    const [selectedPlace, setSelectedPlace] = useState<google.maps.places.PlaceResult | null>(null);
    const [venueData, setVenueData] = useState<Partial<Venue> | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [assets, setAssets] = useState<Record<string, boolean>>({});
    const [vibe, setVibe] = useState<'CHILL' | 'LIVELY' | 'BUZZING'>('LIVELY');
    const [managerEmail, setManagerEmail] = useState('');
    const navigate = useNavigate();

    const handlePlaceSelect = async (place: google.maps.places.PlaceResult) => {
        if (!place.place_id) return;

        setSelectedPlace(place);
        setIsProcessing(true);
        try {
            // 1. Check if already claimed
            const claimStatus = await checkVenueClaim(place.place_id);

            if (claimStatus.isClaimed) {
                showToast(`${place.name} has already been claimed!`, 'error');
                setVenueData(null);
                return;
            }

            // 2. Prepare Preview
            const demoVenue: Partial<Venue> = {
                id: claimStatus.venueId || 'TEMP',
                name: place.name || '',
                address: place.formatted_address || '',
                phone: place.formatted_phone_number || '',
                website: place.website || '',
                googlePlaceId: place.place_id || '',
                // In a real flow, we'd also get photos here
                photos: (place as any).photos?.map((p: any, i: number) => ({
                    id: `p-${i}`,
                    url: p.getUrl?.() || '',
                    allowMarketingUse: false,
                    timestamp: Date.now(),
                    userId: 'google'
                }))
            };
            setVenueData(demoVenue);
        } catch (error) {
            showToast('COULD NOT RESOLVE VENUE DATA', 'error');
            console.error(error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleClaimClick = async () => {
        const user = auth.currentUser;
        if (!user) {
            showToast('Please Sign In to lock this claim!', 'info');
            // normally would trigger login modal
            setStep('VERIFY');
            return;
        }

        if (!selectedPlace?.place_id) return;

        setIsProcessing(true);
        try {
            const result = await onboardVenue(selectedPlace.place_id);
            setVenueData(prev => ({ ...prev, id: result.venueId }));
            showToast('VENUE CLAIMED & SYNCED', 'success');
            setStep('VERIFY');
        } catch (error: any) {
            showToast(error.message || 'CLAIM FAILED', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleVerificationConfirm = () => {
        setStep('CONFIG');
    };

    const handleConfigConfirm = async () => {
        if (!venueData?.id) return;

        setIsProcessing(true);
        try {
            // Persist Vibe and Assets
            await updateVenueDetails(venueData.id, {
                vibeDefault: vibe,
                assets: assets
            }, auth.currentUser?.uid || undefined);

            showToast('VIBE INITIALIZED', 'success');
            setStep('INVITE');
        } catch (error) {
            showToast('SYNC FAILED', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleInviteConfirm = () => {
        setStep('SUCCESS');
    };

    const ProgressBar = () => {
        const steps: OnboardingStep[] = ['SEARCH', 'VERIFY', 'CONFIG', 'INVITE'];
        const currentIndex = steps.indexOf(step);

        return (
            <div className="flex items-center justify-between mb-12 max-w-md mx-auto">
                {steps.map((s, i) => (
                    <React.Fragment key={s}>
                        <div className={`flex flex-col items-center gap-2 ${i <= currentIndex ? 'text-primary' : 'text-slate-600'}`}>
                            <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${i < currentIndex ? 'bg-primary border-primary text-black' :
                                i === currentIndex ? 'border-primary ring-4 ring-primary/20 bg-slate-900' : 'border-slate-800 bg-slate-900'
                                }`}>
                                {i < currentIndex ? <Check className="w-6 h-6" /> : <span className="font-black">{i + 1}</span>}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest">{s}</span>
                        </div>
                        {i < steps.length - 1 && (
                            <div className={`h-[2px] flex-1 mb-6 ${i < currentIndex ? 'bg-primary' : 'bg-slate-800'}`} />
                        )}
                    </React.Fragment>
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white font-body py-12 px-6">
            <SEO title="Claim Your Bar - OlyBars Partners" />

            <div className="max-w-4xl mx-auto">
                <header className="text-center mb-12">
                    <div className="inline-block p-4 bg-primary/10 rounded-3xl border border-primary/20 mb-6">
                        <Building2 className="w-12 h-12 text-primary" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black uppercase font-league tracking-tight">OlyBars Partner Portal</h1>
                    <p className="text-slate-400 mt-4 font-medium italic">"Verify, Don't Create" — The 3rd-Generation Onboarding</p>
                </header>

                <ProgressBar />

                <div className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl backdrop-blur-xl relative overflow-hidden">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/5 rounded-full -ml-32 -mb-32 blur-3xl" />

                    {step === 'SEARCH' && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="text-center">
                                <h2 className="text-3xl font-black uppercase font-league mb-4">Step 1: The Lazy Search</h2>
                                <p className="text-slate-400 font-medium">Find your establishment on Google and we'll handle the rest.</p>
                            </div>

                            <PlaceAutocomplete
                                onPlaceSelect={handlePlaceSelect}
                                placeholder="Enter your Bar Name..."
                                className="max-w-xl mx-auto"
                            />

                            {isProcessing && (
                                <div className="flex items-center justify-center gap-3 text-primary font-black uppercase tracking-widest animate-pulse">
                                    <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                                    Scraping Google Beta Data...
                                </div>
                            )}

                            {venueData && !isProcessing && (
                                <div className="max-w-md mx-auto bg-slate-950 border border-primary/30 rounded-3xl p-8 space-y-6 shadow-2xl relative group overflow-hidden">
                                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <h3 className="text-2xl font-black uppercase font-league leading-tight text-primary">{venueData.name}</h3>
                                            <p className="text-xs text-slate-500 font-bold tracking-widest uppercase italic">Artesian Manual Preview</p>
                                        </div>
                                        <div className="p-3 bg-primary rounded-2xl">
                                            <Building2 className="w-6 h-6 text-black" />
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-white/5">
                                        <div className="flex items-start gap-4">
                                            <MapPin className="w-5 h-5 text-slate-500 shrink-0" />
                                            <span className="text-sm font-medium text-slate-300">{venueData.address}</span>
                                        </div>
                                        {venueData.phone && (
                                            <div className="flex items-center gap-4">
                                                <Phone className="w-5 h-5 text-slate-500 shrink-0" />
                                                <span className="text-sm font-medium text-slate-300">{venueData.phone}</span>
                                            </div>
                                        )}
                                        {venueData.website && (
                                            <div className="flex items-center gap-4">
                                                <Globe className="w-5 h-5 text-slate-500 shrink-0" />
                                                <span className="text-sm font-medium text-slate-300 truncate">{venueData.website}</span>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={handleClaimClick}
                                        className="w-full bg-primary text-black font-black py-4 rounded-2xl uppercase tracking-[0.2em] font-league text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all mt-4"
                                    >
                                        This is Me — Claim Now
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 'VERIFY' && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="text-center">
                                <h2 className="text-3xl font-black uppercase font-league mb-4">Step 2: The "Pit" Stop</h2>
                                <p className="text-slate-400 font-medium">Is this intel accurate? Confirm or fix the bad scrapes.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="bg-slate-950/50 border border-white/5 rounded-3xl p-6 space-y-4">
                                        <div className="flex items-center gap-3 text-primary mb-2">
                                            <Settings2 className="w-5 h-5" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Business Details</span>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Establishment Name</label>
                                            <div className="text-lg font-black uppercase text-white font-league">{venueData?.name}</div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Formatted Address</label>
                                            <div className="text-sm font-medium text-slate-400">{venueData?.address}</div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-950/50 border border-white/5 rounded-3xl p-6 space-y-4">
                                        <div className="flex items-center gap-3 text-blue-400 mb-2">
                                            <Globe className="w-5 h-5" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Communication</span>
                                        </div>
                                        <div className="grid grid-cols-1 gap-4">
                                            <div>
                                                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Phone</label>
                                                <div className="text-sm font-bold text-slate-200">{venueData?.phone || 'Not Found'}</div>
                                            </div>
                                            <div>
                                                <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">Website</label>
                                                <div className="text-sm font-bold text-slate-200 truncate">{venueData?.website || 'Not Found'}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-3xl p-6 space-y-4">
                                        <div className="flex items-center gap-3 text-amber-500 mb-2">
                                            <Info className="w-5 h-5" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Scraped Hours</span>
                                        </div>
                                        <div className="text-sm font-medium text-amber-200/80 italic leading-relaxed whitespace-pre-wrap">
                                            Daily 4:00 PM — 2:00 AM{"\n"}
                                            (Auto-imported from Google Business)
                                        </div>
                                    </div>

                                    <div className="pt-4 space-y-4">
                                        <button
                                            onClick={handleVerificationConfirm}
                                            className="w-full bg-primary text-black font-black py-4 rounded-2xl uppercase tracking-[0.2em] font-league text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
                                        >
                                            Looks Good — Move On
                                        </button>
                                        <button className="w-full bg-slate-800/50 text-slate-400 font-black py-4 rounded-2xl uppercase tracking-[0.2em] font-league text-sm border border-white/5 hover:text-white hover:bg-slate-800 transition-all">
                                            Edit Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'CONFIG' && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="text-center">
                                <h2 className="text-3xl font-black uppercase font-league mb-4">Step 3: The "Vibe" & Assets</h2>
                                <p className="text-slate-400 font-medium">Configure your presence on the Open Play Network.</p>
                            </div>

                            <section className="space-y-8">
                                <div className="space-y-6 max-w-xl mx-auto">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <h3 className="text-lg font-black uppercase font-league text-primary leading-none">DEFAULT ATMOSPHERE</h3>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest">Help users find the right mood</p>
                                        </div>
                                        <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-lg ${vibe === 'CHILL' ? 'text-blue-400 bg-blue-400/10' :
                                            vibe === 'LIVELY' ? 'text-primary bg-primary/10' : 'text-red-400 bg-red-400/10'
                                            }`}>
                                            {vibe}
                                        </span>
                                    </div>

                                    <div className="relative group pt-4">
                                        <input
                                            type="range"
                                            min="0"
                                            max="2"
                                            step="1"
                                            value={vibe === 'CHILL' ? 0 : vibe === 'LIVELY' ? 1 : 2}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                setVibe(val === 0 ? 'CHILL' : val === 1 ? 'LIVELY' : 'BUZZING');
                                            }}
                                            className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                                        />
                                        <div className="flex justify-between mt-4 text-[9px] font-black uppercase tracking-widest text-slate-600">
                                            <span className={vibe === 'CHILL' ? 'text-primary' : ''}>CHILL (Conversational)</span>
                                            <span className={vibe === 'LIVELY' ? 'text-primary' : ''}>LIVELY (Social)</span>
                                            <span className={vibe === 'BUZZING' ? 'text-primary' : ''}>HIGH ENERGY (Party)</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="text-center">
                                        <h3 className="text-lg font-black uppercase font-league text-primary leading-none">ASSET TOGGLE GRID</h3>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest">Toggle what you have on-site</p>
                                    </div>

                                    <AssetToggleGrid
                                        selectedAssets={assets}
                                        onChange={(id, val) => setAssets(prev => ({ ...prev, [id]: val }))}
                                    />
                                </div>

                                <div className="pt-8 max-w-sm mx-auto">
                                    <button
                                        onClick={handleConfigConfirm}
                                        className="w-full bg-primary text-black font-black py-4 rounded-2xl uppercase tracking-[0.2em] font-league text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
                                    >
                                        Initialize My Board
                                    </button>
                                </div>
                            </section>
                        </div>
                    )}

                    {step === 'INVITE' && (
                        <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="text-center">
                                <h2 className="text-3xl font-black uppercase font-league mb-4">Step 4: The "Chris" Handoff</h2>
                                <p className="text-slate-400 font-medium">Who manages your events or marketing? Invite your pit bosses.</p>
                            </div>

                            <div className="max-w-xl mx-auto space-y-12">
                                <div className="bg-slate-950/50 border border-white/5 rounded-3xl p-8 space-y-6">
                                    <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-2xl border border-primary/10">
                                        <Users className="w-8 h-8 text-primary" />
                                        <div>
                                            <h4 className="text-sm font-black uppercase text-white leading-none">Manager Invite</h4>
                                            <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-widest">Full operational access (minus billing)</p>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">Pit Boss Email Address</label>
                                        <div className="relative">
                                            <Send className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-700" />
                                            <input
                                                type="email"
                                                value={managerEmail}
                                                onChange={(e) => setManagerEmail(e.target.value)}
                                                placeholder="chris@yourvenue.com"
                                                className="w-full bg-slate-900 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white font-bold placeholder:text-slate-800 focus:border-primary outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 flex items-center justify-between">
                                        <p className="text-[10px] text-slate-500 font-medium max-w-[200px]">
                                            They will receive an invitation to join the League HQ as a Manager.
                                        </p>
                                        <button
                                            onClick={handleInviteConfirm}
                                            className="px-8 py-4 bg-slate-100 text-black font-black rounded-2xl uppercase tracking-widest text-xs hover:bg-white transition-all shadow-xl"
                                        >
                                            Send Invite
                                        </button>
                                    </div>
                                </div>

                                <div className="text-center">
                                    <button
                                        onClick={() => setStep('SUCCESS')}
                                        className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] hover:text-white transition-colors"
                                    >
                                        Skip this step for now
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'SUCCESS' && (
                        <div className="text-center py-12 space-y-12 animate-in zoom-in duration-700">
                            <div className="relative inline-block">
                                <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                                <div className="relative w-32 h-32 rounded-full border-4 border-primary flex items-center justify-center bg-slate-950 shadow-2xl shadow-primary/40">
                                    <Check className="w-16 h-16 text-primary" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-4xl font-black uppercase font-league text-white">Venue Inducted into the League!</h2>
                                <p className="text-slate-400 font-medium max-w-lg mx-auto">
                                    Congratulations! <span className="text-primary font-bold">{venueData?.name}</span> is now an official Member of the Artesian Bar League.
                                </p>
                            </div>

                            <div className="flex justify-center pt-8">
                                <button
                                    onClick={() => navigate('/league-membership')}
                                    className="flex items-center gap-3 bg-gradient-to-r from-yellow-600 to-yellow-500 text-black px-8 py-5 rounded-2xl shadow-xl shadow-yellow-900/20 hover:scale-105 transition-transform group"
                                >
                                    <Crown className="w-6 h-6 text-black fill-black" />
                                    <div className="text-left">
                                        <div className="text-xs font-black uppercase tracking-widest opacity-80">Next Step</div>
                                        <div className="text-lg font-black uppercase font-league tracking-wide">Setup Member Profile</div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 ml-2 text-black/50 group-hover:text-black transition-colors" />
                                </button>
                            </div>

                            <div className="flex items-center justify-center gap-6 pt-12 border-t border-white/5">
                                <img src="/artie-tap-icon.png" alt="Artie" className="w-12 h-12 grayscale opacity-30" />
                                <p className="text-[10px] text-slate-700 font-black uppercase tracking-[0.4em]">Powered by Well 80 Artesian Water</p>
                            </div>
                        </div>
                    )}
                </div>

                {step !== 'SEARCH' && step !== 'SUCCESS' && (
                    <button
                        onClick={() => {
                            if (step === 'VERIFY') setStep('SEARCH');
                            else if (step === 'CONFIG') setStep('VERIFY');
                            else if (step === 'INVITE') setStep('CONFIG');
                        }}
                        className="mt-8 flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-all group"
                    >
                        <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                        Go Back
                    </button>
                )}
            </div>
        </div>
    );
}
