import React, { useState } from 'react';
import {
    Info, Phone, Globe, Instagram, Facebook, Twitter,
    Save, Clock, MapPin, Mail, ChevronRight, Beer,
    Sparkles, Users, Shield, Gamepad2, Trophy, Zap, Utensils, X, Feather, Plus, Trash2, ShoppingBag
} from 'lucide-react';
import { Venue, VenueType, VibeTag, UserProfile, HappyHourRule } from '../../../types';
import { isSystemAdmin } from '../../../types/auth_schema';
import { syncVenueWithGoogle } from '../../../services/venueService';
import { useToast } from '../../../components/ui/BrandedToast';
import { PlaceAutocomplete } from '../../../components/ui/PlaceAutocomplete';
import { AssetToggleGrid } from '../../../components/partners/AssetToggleGrid';
import { GameFeatureManager } from './GameFeatureManager';
import { SoberPledgeModal } from './SoberPledgeModal';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { normalizeTo24h } from '../../../utils/timeUtils';

interface ListingManagementTabProps {
    venue: Venue;
    venues?: Venue[];
    onUpdate: (venueId: string, updates: Partial<Venue>) => Promise<void> | void;
    userProfile: UserProfile;
}

const VENUE_TYPE_LABELS: Record<string, string> = {
    bar_pub: 'Bar / Pub (Standard)',
    restaurant_bar: 'Restaurant & Bar',
    brewery_taproom: 'Brewery / Taproom',
    lounge_club: 'Lounge / Club',
    arcade_bar: 'Arcade Bar',
    brewpub: 'Brewpub / Gastro'
};

const MAKER_TYPE_LABELS: Record<string, string> = {
    '': 'Not a Maker',
    Brewery: 'Brewery (Craft Beer)',
    Distillery: 'Distillery (Spirits)',
    Cidery: 'Cidery (Hard Cider)',
    Winery: 'Winery',
    Other: 'Other Maker'
};

export const ListingManagementTab: React.FC<ListingManagementTabProps> = ({ venue, venues, onUpdate, userProfile }) => {
    const { showToast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
    const [showSoberPledge, setShowSoberPledge] = useState(false);
    const [formData, setFormData] = useState<Partial<Venue>>({
        description: venue.description || '',
        hours: typeof venue.hours === 'string' ? venue.hours : 'Standard Hours',
        phone: venue.phone || '',
        email: venue.email || '',
        website: venue.website || '',
        instagram: venue.instagram || '',
        facebook: venue.facebook || '',
        twitter: venue.twitter || '',
        vibe: venue.vibe || '',
        originStory: venue.originStory || '',
        isLowCapacity: venue.isLowCapacity || false,
        isSoberFriendly: venue.isSoberFriendly || false,
        establishmentType: venue.establishmentType || 'Bar Only',
        vibeTags: venue.vibeTags || [],
        isLocalMaker: venue.isLocalMaker || false,
        tier_config: venue.tier_config || { is_directory_listed: true, is_league_eligible: false },
        hasGameVibeCheckEnabled: venue.hasGameVibeCheckEnabled || false,
        gameFeatures: venue.gameFeatures || [],
        happyHour: venue.happyHour || { startTime: '', endTime: '', description: '', days: [] },
        happyHourSpecials: venue.happyHourSpecials || '',
        happyHourSimple: venue.happyHourSimple || '',
        leagueEvent: venue.leagueEvent || null,
        triviaTime: venue.triviaTime || '',
        triviaHost: venue.triviaHost || '',
        triviaPrizes: venue.triviaPrizes || '',
        triviaSpecials: venue.triviaSpecials || '',
        triviaHowItWorks: venue.triviaHowItWorks || [],
        happyHourMenu: venue.happyHourMenu || [],
        happyHourRules: venue.happyHourRules || [],
        reservationUrl: venue.reservationUrl || '',
        orderUrl: venue.orderUrl || '',
        directMenuUrl: venue.directMenuUrl || '',
        capacity: venue.capacity
    });

    // [FIX] Synchronize formData when venue prop changes (e.g. switching in dropdown)
    React.useEffect(() => {
        setFormData({
            description: venue.description || '',
            hours: typeof venue.hours === 'string' ? venue.hours : 'Standard Hours',
            phone: venue.phone || '',
            email: venue.email || '',
            website: venue.website || '',
            instagram: venue.instagram || '',
            facebook: venue.facebook || '',
            twitter: venue.twitter || '',
            vibe: venue.vibe || '',
            originStory: venue.originStory || '',
            isLowCapacity: venue.isLowCapacity || false,
            isSoberFriendly: venue.isSoberFriendly || false,
            establishmentType: venue.establishmentType || 'Bar Only',
            vibeTags: venue.vibeTags || [],
            tier_config: venue.tier_config || { is_directory_listed: true, is_league_eligible: false },
            hasGameVibeCheckEnabled: venue.hasGameVibeCheckEnabled || false,
            gameFeatures: venue.gameFeatures || [],
            happyHour: venue.happyHour || { startTime: '', endTime: '', description: '', days: [] },
            happyHourSpecials: venue.happyHourSpecials || '',
            happyHourSimple: venue.happyHourSimple || '',
            leagueEvent: venue.leagueEvent || null,
            triviaTime: venue.triviaTime || '',
            triviaHost: venue.triviaHost || '',
            triviaPrizes: venue.triviaPrizes || '',
            triviaSpecials: venue.triviaSpecials || '',
            triviaHowItWorks: venue.triviaHowItWorks || [],
            reservationUrl: venue.reservationUrl || '',
            insiderVibe: venue.insiderVibe || '', // Added missing field
            geoLoop: (venue as any).geoLoop || '', // Cast to any to handle "" option in select
            venueType: venue.venueType || 'bar_pub', // Added missing field
            physicalRoom: venue.physicalRoom !== false, // Added missing field
            makerType: (venue as any).makerType || '', // Added missing field
            isLocalMaker: venue.isLocalMaker || false, // Added missing field
            happyHourMenu: venue.happyHourMenu || [],
            happyHourRules: venue.happyHourRules || [],
            orderUrl: venue.orderUrl || '',
            directMenuUrl: venue.directMenuUrl || '',
            capacity: venue.capacity,
        });

        // [MIGRATION] If legacy happyHour exists but rules don't, create initial rule
        if ((!venue.happyHourRules || venue.happyHourRules.length === 0) && venue.happyHour?.startTime) {
            setFormData(prev => ({
                ...prev,
                happyHourRules: [{
                    id: 'migrated-hh-' + Date.now(),
                    startTime: venue.happyHour!.startTime,
                    endTime: venue.happyHour!.endTime,
                    days: venue.happyHour!.days || [],
                    description: venue.happyHour!.description,
                    specials: venue.happyHourSimple || venue.happyHourSpecials
                }]
            }));
        }
    }, [venue]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSoberToggle = () => {
        if (!formData.isSoberFriendly) {
            // Turning ON -> Show Pledge
            setShowSoberPledge(true);
        } else {
            // Turning OFF -> Direct update
            setFormData(prev => ({ ...prev, isSoberFriendly: false }));
        }
    };

    const confirmSoberPledge = () => {
        setFormData(prev => ({ ...prev, isSoberFriendly: true }));
        setShowSoberPledge(false);
        showToast('SOBER FRIENDLY PLEDGE SIGNED', 'success');
    };

    const handleRequestSoberReview = () => {
        // [PHASE 1] Simulate request
        showToast('REVIEW REQUESTED. Artie will audit your NA selection.', 'info');
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // [REMEDIATION] Remove redundant direct call; rely on App-level handleUpdateVenue (onUpdate)
            // handleUpdateVenue handles optimistic state and persistence with correct userId
            await onUpdate(venue.id, formData);
            showToast('VENUE LISTING UPDATED SUCCESSFULLY', 'success');
        } catch (error) {
            console.error('[OwnerDashboard] Failed to save:', error);
            showToast('FAILED TO UPDATE LISTING', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleGoogleSync = async () => {
        setIsSyncing(true);
        try {
            const result = await syncVenueWithGoogle(venue.id, selectedPlaceId || undefined);
            if (result.success) {
                // Update local form state with synced data
                setFormData(prev => ({
                    ...prev,
                    ...result.updates
                }));
                onUpdate(venue.id, result.updates);
                showToast('SYNCED WITH GOOGLE PLACES', 'success');
                setSelectedPlaceId(null); // Clear manual selection after successful sync
            }
        } catch (error: any) {
            showToast(error.message || 'GOOGLE SYNC FAILED', 'error');
        } finally {
            setIsSyncing(false);
        }
    };

    const InputField = ({ label, name, value, icon: Icon, placeholder, type = "text" }: any) => (
        <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{label}</label>
            <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-primary transition-colors">
                    <Icon className="w-4 h-4" />
                </div>
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-slate-100 placeholder:text-slate-800 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all font-medium"
                />
            </div>
        </div>
    );

    return (
        <div className="space-y-8 pb-12">
            {/* Vibe & Description Section */}
            <section className="space-y-6">
                <div>
                    <h3 className="text-xl font-black text-white uppercase font-league leading-none">CORE IDENTITY</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest italic">Define your venue's personality</p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    <InputField
                        label="The Vibe (Short Tagline)"
                        name="vibe"
                        value={formData.vibe}
                        icon={Info}
                        placeholder="Ex: Cozy Craft Beer & Artisinal Pizza"
                    />

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">About Your Establishment</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Tell the league what makes your spot legendary..."
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm text-slate-100 placeholder:text-slate-800 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all font-medium resize-none"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Origin Story (Market Audit Requirement)</label>
                        <textarea
                            name="originStory"
                            value={(formData as any).originStory || ''}
                            onChange={handleChange}
                            rows={5}
                            placeholder="Tell the story of how you started. This is prioritized in the new schema."
                            className="w-full bg-blue-900/10 border border-primary/30 rounded-xl py-3 px-4 text-sm text-blue-100 placeholder:text-blue-900/50 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all font-medium resize-none"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1 italic drop-shadow-sm">Insider Vibe (The Council's Reality Check)</label>
                        <textarea
                            name="insiderVibe"
                            value={(formData as any).insiderVibe || ''}
                            onChange={handleChange}
                            rows={2}
                            placeholder="Ex: Gritty but welcoming. The best place consistently for a quiet pint when the sun goes down."
                            className="w-full bg-blue-900/10 border border-primary/30 rounded-xl py-3 px-4 text-sm text-blue-100 placeholder:text-blue-900/50 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all font-medium resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Establishment Category</label>
                            <div className="relative group">
                                <Beer className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 w-4 h-4" />
                                <select
                                    name="venueType"
                                    value={formData.venueType || 'bar_pub'}
                                    onChange={(e: any) => setFormData(prev => ({ ...prev, venueType: e.target.value as VenueType }))}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-slate-100 focus:border-primary/50 outline-none appearance-none cursor-pointer"
                                >
                                    {Object.entries(VENUE_TYPE_LABELS).map(([val, label]) => (
                                        <option key={val} value={val} className="bg-black">{label}</option>
                                    ))}
                                </select>
                                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 w-4 h-4 rotate-90" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Vibe Tags (Select All That Apply)</label>
                            <div className="flex flex-wrap gap-2">
                                {([
                                    { value: 'dive', label: 'Dive' },
                                    { value: 'speakeasy', label: 'Speakeasy' },
                                    { value: 'sports', label: 'Sports Bar' },
                                    { value: 'tiki_theme', label: 'Tiki / Theme' },
                                    { value: 'wine_focus', label: 'Wine Bar' },
                                    { value: 'cocktail_focus', label: 'Cocktail / Mixology' },
                                    { value: 'lgbtq', label: 'LGBTQ+ / Queer Bar' },
                                    { value: 'patio_garden', label: 'Patio / Beer Garden' }
                                ] as { value: VibeTag, label: string }[]).map((tag) => (
                                    <button
                                        key={tag.value}
                                        onClick={() => {
                                            const currentTags = formData.vibeTags || [];
                                            const newTags = currentTags.includes(tag.value)
                                                ? currentTags.filter((t: VibeTag) => t !== tag.value) // Explicit type for clarity
                                                : [...currentTags, tag.value];
                                            setFormData(prev => ({ ...prev, vibeTags: newTags }));
                                        }}
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border ${(formData.vibeTags || []).includes(tag.value)
                                            ? 'bg-primary text-black border-primary'
                                            : 'bg-black/40 text-slate-500 border-white/10 hover:border-white/30'
                                            }`}
                                    >
                                        {tag.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* IDENTITY BRANCHING: MAKER VS BAR */}
                    {(formData.venueType === 'brewpub' || formData.venueType === 'brewery_taproom' || (formData as any).makerType || (formData as any).isLocalMaker) && (
                        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 mt-4 animate-in fade-in duration-500">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center gap-2">
                                    <Feather className="w-4 h-4 text-primary" />
                                    <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Local Maker Identity Logic</h4>
                                </div>
                                {isSystemAdmin(userProfile) && (
                                    <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg border border-primary/20">
                                        <span className="text-[9px] font-black text-slate-500 uppercase">Super-Admin Force</span>
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, isLocalMaker: !(formData as any).isLocalMaker }))}
                                            className={`p-1 rounded flex items-center justify-center transition-all ${(formData as any).isLocalMaker ? 'text-primary' : 'text-slate-700'}`}
                                        >
                                            <Zap className={`w-3.5 h-3.5 ${(formData as any).isLocalMaker ? 'fill-primary' : ''}`} />
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Local Maker Category</label>
                                    <div className="relative group">
                                        <Info className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 w-4 h-4" />
                                        <select
                                            name="makerType"
                                            value={(formData as any).makerType || ''}
                                            onChange={(e: any) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-slate-100 focus:border-primary/50 outline-none appearance-none cursor-pointer"
                                        >
                                            {Object.entries(MAKER_TYPE_LABELS).map(([val, label]) => (
                                                <option key={val} value={val} className="bg-black">{label}</option>
                                            ))}
                                        </select>
                                        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 w-4 h-4 rotate-90" />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4 justify-end pb-2">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${(formData as any).physicalRoom !== false ? 'bg-primary border-primary' : 'border-slate-600 bg-transparent'}`}>
                                            {(formData as any).physicalRoom !== false && <ChevronRight className="w-3 h-3 text-black font-bold" />}
                                        </div>
                                        <input
                                            type="checkbox"
                                            name="physicalRoom"
                                            checked={(formData as any).physicalRoom !== false}
                                            onChange={e => setFormData(prev => ({ ...prev, physicalRoom: e.target.checked }))}
                                            className="hidden"
                                        />
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">Has Physical Taproom</span>
                                    </label>

                                    {/* Visual Helper for Production Only - Strictly for Makers */}
                                    {(formData as any).physicalRoom === false && (formData as any).makerType && (
                                        <p className="text-[9px] text-amber-500 font-bold uppercase tracking-widest ml-1 animate-pulse">
                                            Marked as "Production Only" - Scavenger Hunt Mode Active
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">The Loop Strategy</label>
                            <div className="relative group">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 w-4 h-4" />
                                <select
                                    name="geoLoop"
                                    value={(formData as any).geoLoop || ''}
                                    onChange={(e: any) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-slate-100 focus:border-primary/50 outline-none appearance-none cursor-pointer"
                                >
                                    <option value="" className="bg-black text-slate-500">Select a Loop...</option>
                                    <option value="Downtown_Walkable" className="bg-black">Downtown Walkable</option>
                                    <option value="Warehouse_Tumwater" className="bg-black">Warehouse Loop (Tumwater)</option>
                                    <option value="Destination_Quest" className="bg-black">Destination Quest</option>
                                </select>
                                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 w-4 h-4 rotate-90" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 justify-end pb-2">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${(formData as any).isLowCapacity ? 'bg-primary border-primary' : 'border-slate-600 bg-transparent'}`}>
                                    {(formData as any).isLowCapacity && <ChevronRight className="w-3 h-3 text-black font-bold" />}
                                </div>
                                <input type="checkbox" name="isLowCapacity" checked={(formData as any).isLowCapacity || false} onChange={e => setFormData(prev => ({ ...prev, isLowCapacity: e.target.checked }))} className="hidden" />
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">Low Capacity Warning</span>
                            </label>

                            {/* [REMOVED] Sober Friendly from here - moved to specialized section below */}
                        </div>
                    </div>
                </div>
            </section>

            {/* LEAGUE BADGES & PROGRAMS [NEW SECTION] */}
            <section className="space-y-6">
                <div>
                    <h3 className="text-xl font-black text-primary uppercase font-league leading-none flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        LEAGUE BADGES & PROGRAMS
                    </h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest italic">Verified status for premium directory placement</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className={`p-6 rounded-3xl border transition-all ${formData.isSoberFriendly ? 'bg-blue-600/10 border-blue-500/30' : 'bg-slate-900/50 border-white/5'}`}>
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-2xl ${formData.isSoberFriendly ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
                                    <Shield className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-white uppercase leading-none mb-1">Sober Friendly Badge</h4>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">The OlyBars NA Promise</p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleSoberToggle}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.isSoberFriendly
                                    ? 'bg-blue-500 text-white shadow-lg'
                                    : 'bg-slate-800 text-slate-500 hover:text-white'
                                    }`}
                            >
                                {formData.isSoberFriendly ? 'ACTIVE' : 'ACTIVATE'}
                            </button>
                        </div>

                        <div className="space-y-4">
                            <p className="text-xs text-slate-400 leading-relaxed font-medium">
                                Commit to providing at least 2 distinct NA options (mocktails, NA beers) served in premium glassware.
                            </p>

                            {venue.soberFriendlyNote && !formData.isSoberFriendly && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl space-y-3 animate-in fade-in slide-in-from-top-2">
                                    <div className="flex items-center gap-2 text-[10px] text-red-400 font-black uppercase tracking-widest">
                                        <AlertTriangle className="w-3 h-3" />
                                        Badge Auto-Disabled
                                    </div>
                                    <p className="text-[10px] text-slate-300 leading-tight font-medium italic">"{venue.soberFriendlyNote}"</p>
                                    <button
                                        onClick={handleRequestSoberReview}
                                        className="w-full py-2 bg-red-500/20 hover:bg-red-500/30 text-[9px] font-black text-red-400 uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 transition-all border border-red-500/30"
                                    >
                                        <RotateCcw className="w-3 h-3" />
                                        Request Artie Audit
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Placeholder for future verification badges */}
                    <div className="p-6 rounded-3xl border border-white/5 bg-slate-900/30 opacity-60 flex flex-col items-center justify-center text-center">
                        <Feather className="w-8 h-8 text-slate-700 mb-2" />
                        <h4 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">More Badges Coming</h4>
                    </div>
                </div>
            </section>

            {/* Contact & Hours Section */}
            <section className="space-y-6">
                <div className="flex justify-between items-end">
                    <div>
                        <h3 className="text-xl font-black text-white uppercase font-league leading-none">BUSINESS INFO</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest italic">How and when members can visit</p>
                    </div>

                    <button
                        onClick={handleGoogleSync}
                        disabled={isSyncing}
                        className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg text-[10px] font-black text-blue-400 uppercase tracking-widest transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {isSyncing ? (
                            <div className="w-3 h-3 border-2 border-blue-400/20 border-t-blue-400 rounded-full animate-spin" />
                        ) : (
                            <Globe className="w-3 h-3" />
                        )}
                        {selectedPlaceId ? 'Link & Sync Selected' : 'Auto-Sync Google'}
                    </button>
                    {/* [NEW] Google Rating Display */}
                    {(venue.googleRating) && (
                        <div className="flex flex-col items-end">
                            <div className="flex items-center gap-1.5 bg-yellow-500/10 px-3 py-1.5 rounded-lg border border-yellow-500/20">
                                <span className="text-yellow-500 text-xs font-black">{venue.googleRating} ★</span>
                                <span className="text-slate-500 text-[10px] font-bold">({venue.googleReviewCount || 0})</span>
                            </div>
                            <span className="text-[9px] text-slate-600 uppercase tracking-widest mt-1">Google Quality Score</span>
                        </div>
                    )}
                </div>

                {/* Manual Link Helper */}
                <div className="bg-blue-600/5 border border-blue-500/10 rounded-2xl p-4 space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-600/20 rounded-lg">
                            <Info className="w-4 h-4 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-white uppercase tracking-wider mb-1">Manual Business Link</p>
                            <p className="text-[10px] text-slate-400 font-medium">If auto-sync can't find your spot, search for it manually below before syncing.</p>
                        </div>
                    </div>

                    <PlaceAutocomplete
                        onPlaceSelect={(place) => setSelectedPlaceId(place.place_id || null)}
                        placeholder="Search for your business on Google..."
                        className="!bg-black/20"
                        venues={venues}
                    />

                    {selectedPlaceId && (
                        <div className="flex items-center gap-2 text-[10px] font-black text-green-400 uppercase tracking-widest animate-in fade-in slide-in-from-left duration-300">
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                            Ready to sync selected place
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Phone Number" name="phone" value={formData.phone} icon={Phone} placeholder="(360) 000-0000" />
                    <InputField label="Public Email" name="email" value={formData.email} icon={Mail} placeholder="info@yourvenue.com" />
                    <InputField label="Website" name="website" value={formData.website} icon={Globe} placeholder="www.yourvenue.com" />
                    <InputField label="Hours of Operation" name="hours" value={formData.hours} icon={Clock} placeholder="Daily 11:30 AM - Midnight" />
                    <InputField label="Venue Capacity (Occupancy)" name="capacity" value={formData.capacity || ''} icon={Users} type="number" placeholder="Ex: 50" />
                </div>
            </section>

            {/* Happy Hour & Specials Section */}
            <section id="happy-hour-editor" className="space-y-6 scroll-mt-32">
                <div className="flex justify-between items-end">
                    <div>
                        <h3 className="text-xl font-black text-white uppercase font-league leading-none">HAPPY HOUR SCHEDULING</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest italic">Multi-slot & Multi-day recurring deals</p>
                    </div>

                    <button
                        type="button"
                        onClick={() => setFormData(prev => ({
                            ...prev,
                            happyHourRules: [
                                ...(prev.happyHourRules || []),
                                {
                                    id: Math.random().toString(36).substr(2, 9),
                                    startTime: '15:00',
                                    endTime: '18:00',
                                    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
                                    description: '',
                                    specials: ''
                                }
                            ]
                        }))}
                        className="px-4 py-2 bg-primary/20 hover:bg-primary/30 border border-primary/30 rounded-lg text-[10px] font-black text-primary uppercase tracking-widest transition-all flex items-center gap-2"
                    >
                        <Plus className="w-3 h-3" />
                        Add Time Slot
                    </button>
                </div>

                <div className="space-y-4">
                    {(formData.happyHourRules || []).length === 0 ? (
                        <div className="bg-black/20 border border-dashed border-white/5 rounded-2xl p-12 text-center">
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">No Happy Hour rules defined</p>
                        </div>
                    ) : (
                        formData.happyHourRules?.map((rule, idx) => (
                            <div key={rule.id} className="bg-black/20 border border-white/5 rounded-2xl p-6 space-y-6 relative group">
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({
                                        ...prev,
                                        happyHourRules: prev.happyHourRules?.filter((_, i) => i !== idx)
                                    }))}
                                    className="absolute top-4 right-4 p-2 text-slate-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Days Active</label>
                                        <div className="flex flex-wrap gap-2">
                                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                                                <button
                                                    key={day}
                                                    type="button"
                                                    onClick={() => {
                                                        const newRules = [...(formData.happyHourRules || [])];
                                                        const currentDays = rule.days || [];
                                                        newRules[idx].days = currentDays.includes(day)
                                                            ? currentDays.filter(d => d !== day)
                                                            : [...currentDays, day];
                                                        setFormData(prev => ({ ...prev, happyHourRules: newRules }));
                                                    }}
                                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border ${rule.days.includes(day)
                                                        ? 'bg-primary text-black border-primary'
                                                        : 'bg-black/40 text-slate-500 border-white/10 hover:border-white/30'
                                                        }`}
                                                >
                                                    {day}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Start Time</label>
                                            <input
                                                type="time"
                                                value={rule.startTime}
                                                onChange={(e) => {
                                                    const newRules = [...(formData.happyHourRules || [])];
                                                    newRules[idx].startTime = e.target.value;
                                                    setFormData(prev => ({ ...prev, happyHourRules: newRules }));
                                                }}
                                                className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 text-sm text-white outline-none focus:border-primary/50 font-medium"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">End Time</label>
                                            <input
                                                type="time"
                                                value={rule.endTime}
                                                onChange={(e) => {
                                                    const newRules = [...(formData.happyHourRules || [])];
                                                    newRules[idx].endTime = e.target.value;
                                                    setFormData(prev => ({ ...prev, happyHourRules: newRules }));
                                                }}
                                                className="w-full bg-black border border-white/10 rounded-xl py-3 px-4 text-sm text-white outline-none focus:border-primary/50 font-medium"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Description (Detail View)</label>
                                        <textarea
                                            value={rule.description}
                                            onChange={(e) => {
                                                const newRules = [...(formData.happyHourRules || [])];
                                                newRules[idx].description = e.target.value;
                                                setFormData(prev => ({ ...prev, happyHourRules: newRules }));
                                            }}
                                            rows={1}
                                            placeholder="Ex: $1 Off Drafts, $5 Well Drinks"
                                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm text-slate-100 placeholder:text-slate-800 focus:border-primary/50 outline-none transition-all font-medium resize-none"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1 flex items-center gap-2">
                                                <Beer className="w-3 h-3" />
                                                Buzz Clock Title
                                            </label>
                                        </div>
                                        <input
                                            type="text"
                                            value={rule.specials || ''}
                                            onChange={(e) => {
                                                const newRules = [...(formData.happyHourRules || [])];
                                                newRules[idx].specials = e.target.value;
                                                setFormData(prev => ({ ...prev, happyHourRules: newRules }));
                                            }}
                                            maxLength={45}
                                            placeholder="Ex: $5 Craft Pints"
                                            className="w-full bg-blue-900/10 border border-primary/30 rounded-xl py-3 px-4 text-sm text-blue-100 placeholder:text-blue-900/50 outline-none transition-all font-black uppercase tracking-tighter"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* Social Media Section */}
            <section className="space-y-6">
                <div>
                    <h3 className="text-xl font-black text-white uppercase font-league leading-none">SOCIAL NETWORK</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest italic">Connect with OlyBars members</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Instagram Handle" name="instagram" value={formData.instagram} icon={Instagram} placeholder="@handle" />
                    <InputField label="Facebook Page" name="facebook" value={formData.facebook} icon={Facebook} placeholder="facebook.com/yourvenue" />
                    <InputField label="Twitter / X" name="twitter" value={formData.twitter} icon={Twitter} placeholder="@handle" />
                </div>
            </section>

            {/* Visibility Strategy Section */}
            <section className="space-y-6">
                <div>
                    <h3 className="text-xl font-black text-white uppercase font-league leading-none">VISIBILITY STRATEGY</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest italic">Control your presence on the map</p>
                </div>

                <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex-1">
                            <h4 className="text-sm font-black text-white uppercase mb-2">Public Directory Status</h4>
                            <p className="text-xs text-slate-400 leading-relaxed">
                                <strong className="text-white">Active Listing:</strong> Visible to all users on the Map and List.<br />
                                <strong className="text-white">Ghost Mode:</strong> Hidden from public view. Accessible only via direct link or QR code. Useful for soft launches or private events.
                            </p>
                        </div>

                        <div className="flex items-center gap-3 bg-black/40 p-1 rounded-xl border border-white/10">
                            <button
                                onClick={() => setFormData(prev => ({
                                    ...prev,
                                    tier_config: { ...prev.tier_config!, is_directory_listed: true }
                                }))}
                                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${formData.tier_config?.is_directory_listed !== false
                                    ? 'bg-primary text-black shadow-lg'
                                    : 'text-slate-500 hover:text-white'
                                    }`}
                            >
                                Public
                            </button>
                            <button
                                onClick={() => setFormData(prev => ({
                                    ...prev,
                                    tier_config: { ...prev.tier_config!, is_directory_listed: false }
                                }))}
                                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${formData.tier_config?.is_directory_listed === false
                                    ? 'bg-red-500 text-white shadow-lg'
                                    : 'text-slate-500 hover:text-white'
                                    }`}
                            >
                                Ghost Mode
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Access & Amenities Section [NEW] */}
            <section className="space-y-6">
                <div>
                    <h3 className="text-xl font-black text-white uppercase font-league leading-none">ACCESS & AMENITIES</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest italic">Define local access policies and onsite features</p>
                </div>

                <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'All Ages', key: 'isAllAges', icon: Users },
                            { label: 'Dog Friendly', key: 'isDogFriendly', icon: Sparkles },
                            { label: 'Outdoor Seats', key: 'hasOutdoorSeating', icon: MapPin },
                            { label: 'Private Room', key: 'hasPrivateRoom', icon: Shield }
                        ].map((amenity) => (
                            <button
                                key={amenity.key}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, [amenity.key]: !(prev as any)[amenity.key] }))}
                                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all gap-2 ${(formData as any)[amenity.key]
                                    ? 'bg-primary/10 border-primary text-primary shadow-[0_0_15px_rgba(251,191,36,0.1)]'
                                    : 'bg-black/40 border-white/5 text-slate-500 hover:border-white/20'
                                    }`}
                            >
                                <amenity.icon className={`w-5 h-5 ${(formData as any)[amenity.key] ? 'animate-pulse' : ''}`} />
                                <span className="text-[10px] font-black uppercase tracking-widest">{amenity.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <InputField
                            label="Reservations Policy"
                            name="reservations"
                            value={(formData as any).reservations || ''}
                            icon={Info}
                            placeholder="Ex: First come, first served / Resy"
                        />
                        <InputField
                            label="Reservation URL"
                            name="reservationUrl"
                            value={(formData as any).reservationUrl || ''}
                            icon={MapPin}
                            placeholder="https://..."
                        />
                        <InputField
                            label="Ordering URL (Toast, etc.)"
                            name="orderUrl"
                            value={(formData as any).orderUrl || ''}
                            icon={ShoppingBag}
                            placeholder="https://order.toasttab.com/..."
                        />
                        <InputField
                            label="Direct Menu / Untappd Link"
                            name="directMenuUrl"
                            value={(formData as any).directMenuUrl || ''}
                            icon={Utensils}
                            placeholder="https://untappd.com/v/..."
                        />
                        <InputField
                            label="Opening Time"
                            name="openingTime"
                            value={normalizeTo24h((formData as any).openingTime || '')}
                            icon={Clock}
                            type="time"
                        />
                    </div>
                </div>
            </section>

            {/* Happy Hour Menu Section */}
            <section className="space-y-6">
                <div>
                    <h3 className="text-xl font-black text-white uppercase font-league leading-none text-primary">Happy Hour Menu</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest italic">Itemized food and drink specials</p>
                </div>

                <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 space-y-4">
                    {(formData.happyHourMenu || []).map((item: any, index: number) => (
                        <div key={item.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-black/40 rounded-xl border border-white/5 relative group">
                            <div className="md:col-span-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Category</label>
                                <select
                                    value={item.category}
                                    onChange={(e) => {
                                        const newMenu = [...(formData.happyHourMenu || [])];
                                        newMenu[index].category = e.target.value as 'food' | 'drink';
                                        setFormData({ ...formData, happyHourMenu: newMenu });
                                    }}
                                    className="w-full bg-slate-800 border-none rounded-lg p-2 text-sm text-white font-bold"
                                >
                                    <option value="food">Food</option>
                                    <option value="drink">Drink</option>
                                </select>
                            </div>
                            <div className="md:col-span-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Item Name</label>
                                <input
                                    type="text"
                                    value={item.name}
                                    onChange={(e) => {
                                        const newMenu = [...(formData.happyHourMenu || [])];
                                        newMenu[index].name = e.target.value;
                                        setFormData({ ...formData, happyHourMenu: newMenu });
                                    }}
                                    className="w-full bg-slate-800 border-none rounded-lg p-2 text-sm text-white font-bold"
                                    placeholder="e.g. Draft Pints"
                                />
                            </div>
                            <div className="md:col-span-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Price</label>
                                <input
                                    type="text"
                                    value={item.price}
                                    onChange={(e) => {
                                        const newMenu = [...(formData.happyHourMenu || [])];
                                        newMenu[index].price = e.target.value;
                                        setFormData({ ...formData, happyHourMenu: newMenu });
                                    }}
                                    className="w-full bg-slate-800 border-none rounded-lg p-2 text-sm text-white font-bold font-mono"
                                    placeholder="e.g. $6"
                                />
                            </div>
                            <div className="md:col-span-1 flex items-end gap-2 text-white">
                                <div className="flex-1">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">Description</label>
                                    <input
                                        type="text"
                                        value={item.description || ''}
                                        onChange={(e) => {
                                            const newMenu = [...(formData.happyHourMenu || [])];
                                            newMenu[index].description = e.target.value;
                                            setFormData({ ...formData, happyHourMenu: newMenu });
                                        }}
                                        className="w-full bg-slate-800 border-none rounded-lg p-2 text-sm text-white font-bold"
                                        placeholder="Optional details..."
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newMenu = (formData.happyHourMenu || []).filter((_: any, i: number) => i !== index);
                                        setFormData({ ...formData, happyHourMenu: newMenu });
                                    }}
                                    className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}

                    <button
                        type="button"
                        onClick={() => {
                            const newItem = { id: Math.random().toString(36).substr(2, 9), name: '', price: '', category: 'food' as 'food' | 'drink' };
                            setFormData({ ...formData, happyHourMenu: [...(formData.happyHourMenu || []), newItem] });
                        }}
                        className="w-full py-4 bg-white/5 border border-dashed border-white/10 rounded-xl text-xs font-black uppercase text-slate-400 hover:bg-white/10 hover:border-primary/30 hover:text-primary transition-all flex items-center justify-center gap-2"
                    >
                        <Utensils className="w-4 h-4" />
                        Add Menu Item
                    </button>
                </div>
            </section>

            {/* League & Programming Section */}
            <section className="space-y-6">
                <div>
                    <h3 className="text-xl font-black text-white uppercase font-league leading-none">LEAGUE & PROGRAMMING</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest italic">Manage sanctioned league nights and rituals</p>
                </div>

                <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 space-y-6">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Sanctioned League Event</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {(['trivia', 'karaoke', 'bingo', 'live_music'] as const).map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, leagueEvent: prev.leagueEvent === type ? null : type }))}
                                    className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border ${formData.leagueEvent === type
                                        ? 'bg-primary text-black border-primary'
                                        : 'bg-black/40 text-slate-500 border-white/10 hover:border-white/30'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    {formData.leagueEvent === 'trivia' && (
                        <div className="space-y-6 pt-4 border-t border-white/5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField
                                    label="Trivia Host"
                                    name="triviaHost"
                                    value={formData.triviaHost || ''}
                                    icon={Users}
                                    placeholder="Ex: Jim Westerling"
                                />
                                <InputField
                                    label="Trivia Start Time"
                                    name="triviaTime"
                                    value={normalizeTo24h(formData.triviaTime || '')}
                                    icon={Clock}
                                    type="time"
                                />
                            </div>
                            <InputField
                                label="Trivia Prizes"
                                name="triviaPrizes"
                                value={formData.triviaPrizes || ''}
                                icon={Trophy}
                                placeholder="Ex: $50 Gift Card & League Points"
                            />
                            <InputField
                                label="Tonight's Specials (Limited Offer)"
                                name="triviaSpecials"
                                value={formData.triviaSpecials || ''}
                                icon={Zap}
                                placeholder="Ex: $2 Pints during play!"
                            />
                        </div>
                    )}
                </div>
            </section>

            {/* Amenities & Games Section */}
            <section className="space-y-6">
                <div>
                    <h3 className="text-xl font-black text-white uppercase font-league leading-none">AMENITIES & ACTIVITIES</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest italic">Toggle what your venue offers to the league</p>
                </div>

                <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-8 space-y-8">
                    {/* Deprecated AssetToggleGrid removed in favor of detailed GameFeature tracking */}

                    <div className="pt-8 border-t border-white/10">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <Gamepad2 className="w-5 h-5 text-purple-400" />
                                    <h4 className="text-sm font-black text-white uppercase">Game Vibe Check (Premium)</h4>
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Enable real-time status reporting for games like Pool and Darts.
                                    Users can see if tables are open or taken before they arrive.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, hasGameVibeCheckEnabled: !prev.hasGameVibeCheckEnabled }))}
                                className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${formData.hasGameVibeCheckEnabled
                                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20'
                                    : 'bg-slate-800 text-slate-500 hover:text-white'
                                    }`}
                            >
                                {formData.hasGameVibeCheckEnabled ? 'ACTIVE' : 'INACTIVE'}
                            </button>
                        </div>
                    </div>
                    {formData.hasGameVibeCheckEnabled && (
                        <div className="pt-8 border-t border-white/10">
                            <GameFeatureManager
                                venue={venue}
                                onChange={(updates) => setFormData(prev => ({ ...prev, ...updates }))}
                            />
                        </div>
                    )}
                </div>
            </section>

            {/* Save Button */}
            <div className="pt-4">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full bg-primary text-black font-black py-4 rounded-xl uppercase tracking-[0.2em] font-league text-lg shadow-xl shadow-primary/10 active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all flex items-center justify-center gap-2"
                >
                    {isSaving ? (
                        <>
                            <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                            SYNCING DATA...
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            COMMIT ALL CHANGES
                        </>
                    )}
                </button>
            </div>
            <SoberPledgeModal
                isOpen={showSoberPledge}
                onClose={() => setShowSoberPledge(false)}
                onConfirm={confirmSoberPledge}
            />
        </div>
    );
};
