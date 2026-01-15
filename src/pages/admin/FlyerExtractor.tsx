import React, { useEffect, useState } from 'react';
import { Upload, Image as ImageIcon, MapPin, Calendar, Clock, FileText, CheckCircle2, Loader2, Sparkles, Send } from 'lucide-react';
import { useAdminFlyerOps } from '../../hooks/useAdminFlyerOps';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import { fetchVenues } from '../../services/venueService';
import { Venue } from '../../types';
import { useToast } from '../../components/ui/BrandedToast';

export const FlyerExtractor: React.FC = () => {
    const {
        opsState,
        setOpsState,
        eventDraft,
        updateDraft,
        selectedVenueId,
        setSelectedVenueId,
        handleFileUpload,
        handlePaste,
        publishEvent,
        isLoading,
        error,
        imageUrl
    } = useAdminFlyerOps();

    const { showToast } = useToast();
    const [venues, setVenues] = useState<Venue[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const { isDragging, handleDragOver, handleDragLeave, handleDrop } = useDragAndDrop({
        onDrop: (file) => handleFileUpload(file)
    });

    useEffect(() => {
        const loadVenues = async () => {
            const data = await fetchVenues(true);
            setVenues(data);
        };
        loadVenues();

        // Register paste listener
        window.addEventListener('paste', handlePaste as any);
        return () => window.removeEventListener('paste', handlePaste as any);
    }, [handlePaste]);

    const filteredVenues = venues.filter(v =>
        v.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderStep = () => {
        switch (opsState) {
            case 'idle':
            case 'uploading':
                return (
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`mt-10 border-4 border-dashed rounded-3xl p-20 flex flex-col items-center justify-center transition-all cursor-pointer bg-slate-900/50 ${isDragging ? 'border-primary bg-primary/10 scale-[1.02]' : 'border-slate-800 hover:border-slate-700'
                            }`}
                        onClick={() => document.getElementById('fileInput')?.click()}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
                                <p className="text-xl font-bold text-white uppercase tracking-widest animate-pulse">
                                    Schmidt is analyzing...
                                </p>
                            </>
                        ) : (
                            <>
                                <div className="bg-primary/20 p-6 rounded-full mb-6">
                                    <Upload className="w-12 h-12 text-primary" />
                                </div>
                                <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4 text-center">
                                    Digital Mailroom
                                </h2>
                                <p className="text-slate-400 font-medium text-center max-w-md">
                                    Drag & Drop, Paste (Ctrl+V), or Click to upload an event flyer. Schmidt will handle the data entry.
                                </p>
                                <input
                                    id="fileInput"
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleFileUpload(file);
                                    }}
                                />
                            </>
                        )}
                    </div>
                );

            case 'verifying':
            case 'publishing':
            case 'completed':
                return (
                    <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* LEFT: IMAGE PREVIEW */}
                        <div className="bg-slate-900 border border-white/5 rounded-3xl overflow-hidden shadow-2xl sticky top-10 h-fit">
                            <div className="p-4 bg-slate-800 border-b border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4 text-primary" />
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Flyer Source</span>
                                </div>
                                <button
                                    onClick={() => setOpsState('idle')}
                                    className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:text-rose-400 transition-colors"
                                >
                                    Reset
                                </button>
                            </div>
                            <div className="p-4 bg-black/40">
                                {imageUrl ? (
                                    <img
                                        src={imageUrl}
                                        alt="Uploaded Flyer"
                                        className="w-full h-auto rounded-xl shadow-lg hover:scale-[1.01] transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="aspect-[3/4] bg-slate-800 flex items-center justify-center italic text-slate-500 text-sm">
                                        No Image Available
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT: EXTRACTION FORM */}
                        <div className="space-y-6">
                            <div className="bg-slate-900 border-2 border-primary/20 rounded-3xl p-8 shadow-2xl">
                                <div className="flex items-center gap-3 mb-8">
                                    <Sparkles className="w-6 h-6 text-primary" />
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Extraction Results</h3>
                                </div>

                                <div className="space-y-6">
                                    {/* Venue Selector */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1.5">
                                            <MapPin className="w-3 h-3" /> Target Venue
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="Search venues..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-4 py-3 text-white font-bold outline-none focus:border-primary transition-all pr-10"
                                            />
                                            {selectedVenueId && (
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 bg-green-500/20 text-green-500 p-1 rounded-lg">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                </div>
                                            )}
                                        </div>
                                        {searchTerm && !selectedVenueId && (
                                            <div className="absolute z-10 w-full mt-2 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl max-h-48 overflow-y-auto">
                                                {filteredVenues.map(v => (
                                                    <button
                                                        key={v.id}
                                                        onClick={() => {
                                                            setSelectedVenueId(v.id);
                                                            setSearchTerm(v.name);
                                                        }}
                                                        className="w-full p-4 text-left text-slate-300 font-bold hover:bg-slate-700 hover:text-white transition-colors border-b border-white/5 last:border-0"
                                                    >
                                                        {v.name}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Title */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                            <FileText className="w-3 h-3" /> Event Title
                                        </label>
                                        <input
                                            type="text"
                                            value={eventDraft.title || ''}
                                            onChange={(e) => updateDraft({ title: e.target.value })}
                                            className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-4 py-3 text-white font-bold outline-none focus:border-primary transition-all"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Date */}
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                                <Calendar className="w-3 h-3" /> Date
                                            </label>
                                            <input
                                                type="text"
                                                value={eventDraft.date || ''}
                                                onChange={(e) => updateDraft({ date: e.target.value })}
                                                className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-4 py-3 text-white font-bold outline-none focus:border-primary transition-all"
                                            />
                                        </div>
                                        {/* Time */}
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                                <Clock className="w-3 h-3" /> Time
                                            </label>
                                            <input
                                                type="text"
                                                value={eventDraft.time || ''}
                                                onChange={(e) => updateDraft({ time: e.target.value })}
                                                className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-4 py-3 text-white font-bold outline-none focus:border-primary transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Details & Description</label>
                                        <textarea
                                            value={eventDraft.description || ''}
                                            onChange={(e) => updateDraft({ description: e.target.value })}
                                            rows={4}
                                            className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-4 py-3 text-white font-medium outline-none focus:border-primary transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="mt-10 flex gap-4">
                                    <button
                                        disabled={isLoading || !selectedVenueId}
                                        onClick={publishEvent}
                                        className="flex-1 bg-primary hover:bg-yellow-400 text-black font-black uppercase tracking-widest py-4 rounded-2xl flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                <CheckCircle2 className="w-5 h-5" /> Publish to Calendar
                                            </>
                                        )}
                                    </button>
                                </div>

                                {opsState === 'completed' && (
                                    <div className="mt-6 bg-green-500/10 border border-green-500/20 p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-bottom-2">
                                        <div className="bg-green-500 p-2 rounded-lg">
                                            <CheckCircle2 className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="text-green-500 font-bold uppercase tracking-tight text-sm">Sync Complete</p>
                                            <p className="text-slate-400 text-[10px] font-medium">Event has been published to the venue's live feed.</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* SCHMIDT CHAT INTEGRATION (Simplified for internal use) */}
                            <div className="bg-slate-900 border border-white/5 rounded-3xl p-6 shadow-2xl">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                                        <Sparkles className="w-4 h-4 text-black" />
                                    </div>
                                    <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Refinement Channel</h4>
                                </div>
                                <div className="bg-black/30 p-4 rounded-2xl text-[11px] text-slate-400 font-medium mb-4 italic">
                                    "I detected this event is likely for {eventDraft.venueName || 'a local venue'}. If you need to refine the description or title, just type below."
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Ask Schmidt to refine..."
                                        className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-xs font-bold outline-none focus:border-primary"
                                    />
                                    <button className="bg-slate-700 p-2 rounded-xl text-primary">
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-background p-6 lg:p-12">
            <div className="max-w-6xl mx-auto">
                <header className="mb-10">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="bg-primary/20 p-3 rounded-2xl">
                            <Sparkles className="w-6 h-6 text-primary" />
                        </div>
                        <h1 className="text-4xl font-black text-white uppercase tracking-tighter">
                            Flyer Extractor
                        </h1>
                    </div>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] ml-16">
                        Internal Utility Tool / Schmidt Pipeline
                    </p>
                </header>

                {error && (
                    <div className="mb-6 bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl text-rose-500 text-sm font-bold flex items-center gap-3">
                        <div className="bg-rose-500 p-1 rounded-lg">
                            <CheckCircle2 className="w-4 h-4 text-white rotate-45" />
                        </div>
                        {error}
                    </div>
                )}

                {renderStep()}
            </div>
        </div>
    );
};
