import React, { useState } from 'react';
import { X, Calendar, Clock, Info, Loader2, Sparkles, MapPin } from 'lucide-react';
import { Venue, AppEvent } from '../../../types';
import { EventService } from '../../../services/eventService';
import { useToast } from '../../../components/ui/BrandedToast';

interface EventSubmissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    venues: Venue[];
}

export const EventSubmissionModal: React.FC<EventSubmissionModalProps> = ({ isOpen, onClose, venues }) => {
    const { showToast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedVenueId, setSelectedVenueId] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        type: 'karaoke' as AppEvent['type'],
        date: '',
        time: '',
        description: '',
        isLeagueEvent: false,
        host: '',
        prizes: '',
        eventSpecials: '',
        howItWorks: '',
    });
    const [_hp_id, set_hp_id] = useState(''); // Honeypot

    if (!isOpen) return null;

    const filteredVenues = venues.filter(v =>
        v.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (_hp_id) {
            showToast('Submission failed.', 'error');
            onClose();
            return;
        }

        if (!selectedVenueId) {
            showToast('Please select a venue.', 'error');
            return;
        }

        const selectedVenue = venues.find(v => v.id === selectedVenueId);
        if (!selectedVenue) return;

        setIsSubmitting(true);
        try {
            const finalEvent = {
                venueId: selectedVenueId,
                venueName: selectedVenue.name,
                ...formData,
                howItWorks: formData.howItWorks ? formData.howItWorks.split('\n').filter(line => line.trim() !== '') : undefined
            };
            await EventService.submitEvent(finalEvent as any);
            showToast('Event submitted for sanctioning! The Commish will review it shortly.', 'success');
            onClose();
        } catch (error: any) {
            showToast(error.message || 'Failed to submit event.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGenerateDescription = async () => {
        if (!selectedVenueId || !formData.title || !formData.date || !formData.time) {
            showToast('Please fill in Venue, Title, Date, and Time first.', 'error');
            return;
        }

        setIsGenerating(true);
        try {
            const description = await EventService.generateDescription({
                venueId: selectedVenueId,
                type: formData.type,
                date: formData.date,
                time: formData.time
            });
            setFormData({ ...formData, description });
            showToast('Artie has refined your description!', 'success');
        } catch (error: any) {
            showToast(error.message || 'Failed to generate description.', 'error');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-surface w-full max-w-lg rounded-2xl border-2 border-primary/30 shadow-[0_0_50px_-12px_rgba(251,191,36,0.3)] overflow-hidden">

                {/* Header */}
                <div className="bg-primary p-6 text-center relative border-b border-black/10">
                    <button onClick={onClose} className="absolute top-4 right-4 text-black/70 hover:text-black hover:scale-110 transition-all font-black">
                        <X className="w-6 h-6" />
                    </button>
                    <Sparkles className="w-8 h-8 text-black mx-auto mb-2 animate-pulse" />
                    <h2 className="text-3xl font-black text-black uppercase tracking-tighter font-league italic">Submit for Sanctioning</h2>
                    <p className="text-black/60 text-[10px] font-black uppercase tracking-widest font-league">Help build the 98501 Event Wire</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">

                    {/* Honeypot (Hidden) */}
                    <input
                        type="text"
                        className="hidden"
                        value={_hp_id}
                        onChange={(e) => set_hp_id(e.target.value)}
                    />

                    {/* Venue Selection */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1">
                            <MapPin size={10} /> Select Venue
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search venues..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    if (!e.target.value) setSelectedVenueId('');
                                }}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:border-primary outline-none transition-all font-body text-sm"
                            />
                            {searchQuery && !selectedVenueId && (
                                <div className="absolute top-full left-0 w-full mt-2 bg-slate-900 border border-white/10 rounded-xl overflow-hidden z-10 shadow-2xl">
                                    {filteredVenues.length > 0 ? filteredVenues.map(v => (
                                        <button
                                            key={v.id}
                                            type="button"
                                            onClick={() => {
                                                setSelectedVenueId(v.id);
                                                setSearchQuery(v.name);
                                            }}
                                            className="w-full px-4 py-3 text-left hover:bg-primary/20 text-slate-300 text-sm font-bold uppercase tracking-wide border-b border-white/5 last:border-0"
                                        >
                                            {v.name}
                                        </button>
                                    )) : (
                                        <div className="p-4 text-xs text-slate-500 font-bold uppercase italic">No matches found.</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Event Title */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1">
                            <Sparkles size={10} /> Event Title
                        </label>
                        <input
                            required
                            type="text"
                            placeholder="e.g. Knight Beats Trivia or 80's Karaoke"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:border-primary outline-none transition-all font-body text-sm"
                        />
                    </div>

                    {/* Type, Date, Time Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-primary uppercase tracking-widest">Type</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:border-primary outline-none transition-all font-body text-sm appearance-none"
                            >
                                <option value="karaoke">Karaoke</option>
                                <option value="trivia">Trivia</option>
                                <option value="live_music">Live Music</option>
                                <option value="bingo">Bingo</option>
                                <option value="openmic">Open Mic</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1">
                                <Calendar size={10} /> Date
                            </label>
                            <input
                                required
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:border-primary outline-none transition-all font-body text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1">
                                <Clock size={10} /> Time
                            </label>
                            <input
                                required
                                type="time"
                                value={formData.time}
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:border-primary outline-none transition-all font-body text-sm"
                            />
                        </div>
                    </div>
                    |
                    {/* League Sanctioned Toggle */}
                    <div className="flex items-center justify-between bg-black/40 border border-white/10 rounded-xl px-4 py-3 group hover:border-primary/50 transition-all cursor-pointer"
                        onClick={() => setFormData({ ...formData, isLeagueEvent: !formData.isLeagueEvent })}>
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-all ${formData.isLeagueEvent ? 'bg-primary text-black scale-110' : 'bg-slate-800 text-slate-500'
                                }`}>
                                <Sparkles size={20} />
                            </div>
                            <div className="space-y-0.5">
                                <h4 className="text-xs font-black text-white uppercase tracking-wider font-league">League Sanctioned?</h4>
                                <p className="text-[10px] text-slate-500 font-bold uppercase trekking-widest">Flag for official points</p>
                            </div>
                        </div>
                        <div className={`w-12 h-6 rounded-full p-1 transition-all ${formData.isLeagueEvent ? 'bg-primary' : 'bg-slate-800'}`}>
                            <div className={`w-4 h-4 rounded-full bg-white transition-all ${formData.isLeagueEvent ? 'translate-x-6' : 'translate-x-0'}`} />
                        </div>
                    </div>

                    {/* Rich Metadata Section */}
                    <div className="space-y-4 border-t border-white/5 pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-primary uppercase tracking-widest">Host / MC</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Jim Westerling"
                                    value={formData.host}
                                    onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:border-primary outline-none transition-all font-body text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-primary uppercase tracking-widest">Prizes</label>
                                <input
                                    type="text"
                                    placeholder="e.g. $50 Gift Card"
                                    value={formData.prizes}
                                    onChange={(e) => setFormData({ ...formData, prizes: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:border-primary outline-none transition-all font-body text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-primary uppercase tracking-widest">Event Specials</label>
                            <input
                                type="text"
                                placeholder="e.g. $2 Tall Boys while you play"
                                value={formData.eventSpecials}
                                onChange={(e) => setFormData({ ...formData, eventSpecials: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:border-primary outline-none transition-all font-body text-sm"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-primary uppercase tracking-widest">How it Works (Instructions)</label>
                            <textarea
                                rows={3}
                                placeholder="1. Form a team&#10;2. Answer questions&#10;3. Win prizes"
                                value={formData.howItWorks}
                                onChange={(e) => setFormData({ ...formData, howItWorks: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:border-primary outline-none transition-all font-body text-sm resize-none"
                            ></textarea>
                            <p className="text-[8px] text-slate-500 font-bold uppercase trekking-widest italic">One instruction per line</p>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black text-primary uppercase tracking-widest">Description (Optional)</label>
                            <button
                                type="button"
                                onClick={handleGenerateDescription}
                                disabled={isGenerating || !selectedVenueId || !formData.title}
                                className="text-[9px] font-black text-primary bg-primary/10 hover:bg-primary hover:text-black px-2 py-1 rounded-md border border-primary/20 transition-all flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                {isGenerating ? (
                                    <Loader2 size={10} className="animate-spin" />
                                ) : (
                                    <Sparkles size={10} className="group-hover:scale-125 transition-transform" />
                                )}
                                Generate with Artie
                            </button>
                        </div>
                        <textarea
                            rows={3}
                            placeholder="Add lore, themes, or specific details..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className={`w-full bg-black/40 border rounded-xl px-4 py-3 text-slate-200 focus:border-primary outline-none transition-all font-body text-sm resize-none ${isGenerating ? 'border-primary/50 animate-pulse' : 'border-white/10'
                                }`}
                        ></textarea>
                    </div>

                    {/* Disclosure */}
                    <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5 flex gap-3 items-start">
                        <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic">
                            OlyBars is a community-driven platform. All submissions are reviewed by venue staff or League Admins (The Commish) for compliance with WSLCB guardrails and "Artesian Integrity" before appearing on the Event Wire.
                        </p>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting || !selectedVenueId}
                        className="w-full bg-primary hover:bg-yellow-400 disabled:bg-slate-700 disabled:text-slate-400 text-black font-black text-lg uppercase tracking-wider py-4 rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 font-league"
                    >
                        {isSubmitting ? (
                            <><Loader2 className="w-6 h-6 animate-spin" /> Transmitting...</>
                        ) : (
                            <><Sparkles className="w-6 h-6" /> Submit Event</>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};
