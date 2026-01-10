import React, { useState } from 'react';
import { Venue } from '../../../types';
import { Check, X, AlertTriangle, Eye, EyeOff, ChevronRight, LayoutGrid, Info } from 'lucide-react';
import { updateVenueDetails } from '../../../services/venueService';
import { useQueryClient } from '@tanstack/react-query';

interface RefineryQueueProps {
    venues: Venue[];
}

export const RefineryQueue: React.FC<RefineryQueueProps> = ({ venues }) => {
    const queryClient = useQueryClient();
    const [expandedVenueId, setExpandedVenueId] = useState<string | null>(null);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const drafts = venues.filter(v => v.ai_draft_profile?.status === 'needs_review');

    const handleApprove = async (venue: Venue) => {
        if (!venue.ai_draft_profile) return;
        setProcessingId(venue.id);

        const draft = venue.ai_draft_profile;
        const isExempt = ['well-80', 'hannahs', 'brotherhood-lounge'].includes(venue.id);

        // --- MASTER MERGE PROTOCOL (OlyBars Standard) ---

        // 1. DRAFT BASICS (The new truth floor)
        const updatedVenue: Partial<Venue> = {
            name: draft.identity.name || venue.name,
            website: draft.identity.website_url || venue.website,
            facebook: draft.identity.social_links?.facebook || venue.facebook,
            instagram: draft.identity.social_links?.instagram || venue.instagram,

            // Pull in V7 Google Precision if available
            location: draft.metadata.location || venue.location,
            coordinates: draft.metadata.coordinates || venue.coordinates,

            // CLEANUP: Wipe the draft after successful merge
            ai_draft_profile: null as any
        };

        if (isExempt) {
            // TIER 1: CAUTIOUS ADDITIVE MERGE (Protected)
            updatedVenue.vibe = draft.vibe?.headline || venue.vibe;
            updatedVenue.insiderVibe = draft.vibe?.insider_tip || venue.insiderVibe;
            updatedVenue.sceneTags = Array.from(new Set([...(venue.sceneTags || []), ...(draft.vibe?.audience_tags || [])])) as any[];
            updatedVenue.hasOutdoorSeating = draft.features?.has_outdoor_seating ?? venue.hasOutdoorSeating;

            // Transform schedule to hours map if live is empty
            if (!venue.hours && draft.weekly_schedule?.length > 0) {
                updatedVenue.hours = draft.weekly_schedule.reduce((acc: any, day) => {
                    if (day.open_time && day.close_time) {
                        acc[day.day] = { open: day.open_time, close: day.close_time };
                    }
                    return acc;
                }, {});
            }

            // EXEMPT PROTECTION: Restore live map pins and photos
            if (venue.coordinates) updatedVenue.coordinates = venue.coordinates;
            if (venue.location) updatedVenue.location = venue.location;
            if (venue.photos) updatedVenue.photos = venue.photos;
        } else {
            // TIER 2: BLANK SLATE OVERWRITE (Ground Floor)
            updatedVenue.vibe = draft.vibe?.headline;
            updatedVenue.insiderVibe = draft.vibe?.insider_tip;
            updatedVenue.sceneTags = (draft.vibe?.audience_tags || []) as any[];
            updatedVenue.hasOutdoorSeating = draft.features?.has_outdoor_seating;

            updatedVenue.hours = draft.weekly_schedule?.reduce((acc: any, day) => {
                if (day.open_time && day.close_time) {
                    acc[day.day] = { open: day.open_time, close: day.close_time };
                }
                return acc;
            }, {}) || {};

            updatedVenue.carryingMakers = draft.inventory?.local_makers_featured?.length
                ? draft.inventory.local_makers_featured
                : [];

            // BLANK SLATE PROTECTION: Only restore photos (allow map overwrite)
            if (venue.photos) updatedVenue.photos = venue.photos;
        }

        // --- 5. SYSTEM CRITICAL LOCKS (Never Overwrite) ---
        const systemCriticalFields: (keyof Venue)[] = [
            'ownerId', 'managerIds', 'isPaidLeagueMember', 'tier_config', 'id'
        ];

        // Remove from draft payload and re-inject system truths
        systemCriticalFields.forEach(f => {
            delete (updatedVenue as any)[f];
            if ((venue as any)[f]) {
                (updatedVenue as any)[f] = (venue as any)[f];
            }
        });

        // 6. Game Features (Additive Merge - Always additive)
        const newGameFeatures = [...(venue.gameFeatures || [])];
        const featureMap = [
            { key: 'has_pool', type: 'pool_table', name: 'Pool Table' },
            { key: 'has_darts', type: 'darts', name: 'Dart Board' },
            { key: 'has_arcade_games', type: 'arcade_game', name: 'Arcade' },
            { key: 'has_karaoke', type: 'karaoke', name: 'Karaoke' },
            { key: 'has_trivia', type: 'trivia', name: 'Trivia' },
        ];

        featureMap.forEach(f => {
            if ((draft.features as any)[f.key] && !newGameFeatures.some(g => g.type === f.type)) {
                newGameFeatures.push({
                    id: `${venue.id}_${f.type}`,
                    type: f.type as any,
                    count: 1,
                    name: f.name,
                    status: 'active'
                });
            }
        });
        updatedVenue.gameFeatures = newGameFeatures;

        try {
            await updateVenueDetails(venue.id, updatedVenue);
            queryClient.invalidateQueries({ queryKey: ['venues-full'] });
            setExpandedVenueId(null);
        } catch (error) {
            console.error("Merge Failed:", error);
            alert("Protocol Violation: Could not merge document. Check logs.");
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (venueId: string) => {
        setProcessingId(venueId);
        try {
            await updateVenueDetails(venueId, {
                ai_draft_profile: null as any
            });
            queryClient.invalidateQueries({ queryKey: ['venues-full'] });
        } catch (error) {
            console.error("Reject Failed:", error);
        } finally {
            setProcessingId(null);
        }
    };

    if (drafts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-32 bg-slate-900/20 rounded-3xl border border-dashed border-white/5">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                    <Check className="w-8 h-8 text-green-500/40" />
                </div>
                <h3 className="text-xl font-black font-league uppercase text-slate-400">Refinery Idle</h3>
                <p className="text-[10px] text-slate-600 uppercase tracking-[0.2em] mt-2">All data is currently synchronized with the Artesian Canon.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-black font-league uppercase tracking-tight">Refinery Queue</h2>
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">Pending Human Verification</p>
                </div>
                <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-white/5 flex items-center gap-2">
                    <LayoutGrid size={14} className="text-slate-400" />
                    <span className="text-xs font-black font-mono">{drafts.length} DRAFTS</span>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {drafts.map(venue => (
                    <div
                        key={venue.id}
                        className={`group bg-slate-900/50 border transition-all duration-300 rounded-2xl overflow-hidden ${expandedVenueId === venue.id ? 'border-primary ring-1 ring-primary/20' : 'border-white/5 hover:border-white/10'
                            }`}
                    >
                        {/* Compact Header */}
                        <div
                            className="p-5 flex justify-between items-center cursor-pointer"
                            onClick={() => setExpandedVenueId(expandedVenueId === venue.id ? null : venue.id)}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-black border border-white/10 flex items-center justify-center group-hover:bg-primary transition-colors">
                                    <Info size={18} className="text-slate-400 group-hover:text-black" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-white uppercase tracking-tight">{venue.name}</h3>
                                    <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-slate-500 uppercase">
                                        <span className="flex items-center gap-1">
                                            <AlertTriangle size={10} className="text-yellow-500" />
                                            {venue.ai_draft_profile?.metadata.confidence_score ? `${(venue.ai_draft_profile.metadata.confidence_score * 100).toFixed(0)}% Match` : 'New Data'}
                                        </span>
                                        <span className="w-1 h-1 rounded-full bg-slate-700" />
                                        <span>{venue.id}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {expandedVenueId !== venue.id && (
                                    <>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleReject(venue.id); }}
                                            disabled={processingId === venue.id}
                                            className="p-2 text-slate-500 hover:text-red-500 transition-colors"
                                        >
                                            <X size={20} />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleApprove(venue); }}
                                            disabled={processingId === venue.id}
                                            className="bg-primary text-black px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/10"
                                        >
                                            QUICK MERGE
                                        </button>
                                    </>
                                )}
                                <div className={`transition-transform duration-300 ${expandedVenueId === venue.id ? 'rotate-90 text-primary' : 'text-slate-600'}`}>
                                    <ChevronRight size={20} />
                                </div>
                            </div>
                        </div>

                        {/* Expanded Diff View */}
                        {expandedVenueId === venue.id && (
                            <div className="border-t border-white/5 bg-black/40 animate-in slide-in-from-top duration-300">
                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">

                                    {/* Column 1: Changes Summary */}
                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 border-b border-white/5 pb-2">Proposed Intelligence</h4>

                                            <div className="space-y-3">
                                                {/* Vibe Headline */}
                                                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                                    <div className="text-[9px] font-bold text-primary uppercase mb-1">Headline</div>
                                                    <p className="text-xs text-white leading-relaxed italic">"{venue.ai_draft_profile?.vibe.headline}"</p>
                                                </div>

                                                {/* Features Diff */}
                                                <div className="grid grid-cols-2 gap-2">
                                                    {Object.entries(venue.ai_draft_profile?.features || {}).map(([key, val]) => (
                                                        <div key={key} className={`flex items-center justify-between p-2 rounded-lg border ${val ? 'bg-green-500/5 border-green-500/10' : 'bg-white/5 border-white/5 opacity-50'}`}>
                                                            <span className="text-[9px] font-bold uppercase text-slate-400">{key.replace('has_', '').replace('_', ' ')}</span>
                                                            {val ? <Check size={10} className="text-green-500" strokeWidth={4} /> : <X size={10} className="text-slate-600" />}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Info size={14} className="text-primary" />
                                                <span className="text-[10px] font-black text-primary uppercase">Surveyor Insight</span>
                                            </div>
                                            <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
                                                {venue.ai_draft_profile?.metadata.verification_notes || "Data extracted via Google Places API (New) & Gemini Detective Protocol. Confidence in business hours is HIGH."}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Column 2: Data Comparison Table */}
                                    <div>
                                        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 border-b border-white/5 pb-2">Field Diff (Live vs Draft)</h4>
                                        <div className="space-y-2 font-mono text-[10px]">
                                            {[
                                                { label: 'Address', live: venue.address, draft: venue.address }, // Usually same
                                                { label: 'Website', live: venue.website, draft: venue.ai_draft_profile?.identity.website_url },
                                                { label: 'IG', live: venue.instagram, draft: venue.ai_draft_profile?.identity.social_links?.instagram },
                                                { label: 'Makers', live: venue.carryingMakers, draft: venue.ai_draft_profile?.inventory?.local_makers_featured?.join(', ') },
                                            ].map(field => (
                                                <div key={field.label} className="grid grid-cols-3 gap-2 py-1.5 border-b border-white/5 group/row">
                                                    <span className="text-slate-600 uppercase font-black">{field.label}</span>
                                                    <span className="text-slate-400 truncate opacity-50">{field.live || '---'}</span>
                                                    <span className={`truncate ${field.draft && field.draft !== field.live ? 'text-green-400 font-bold' : 'text-slate-500'}`}>
                                                        {field.draft || '---'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-8 flex gap-3">
                                            <button
                                                onClick={() => handleReject(venue.id)}
                                                disabled={processingId === venue.id}
                                                className="flex-1 py-3 rounded-xl bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all border border-red-500/20"
                                            >
                                                DISCARD DRAFT
                                            </button>
                                            <button
                                                onClick={() => handleApprove(venue)}
                                                disabled={processingId === venue.id}
                                                className="flex-[2] py-3 rounded-xl bg-primary text-black text-[10px] font-black uppercase tracking-widest hover:bg-yellow-400 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
                                            >
                                                {processingId === venue.id ? 'MERGING...' : <><Check size={14} strokeWidth={3} /> COMMIT TO CANON</>}
                                            </button>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

