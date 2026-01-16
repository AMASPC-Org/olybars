import React, { useState } from 'react';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { httpsCallable } from 'firebase/functions';
import { collection, query, orderBy, limit, doc } from 'firebase/firestore';
import { db, functions } from '../../lib/firebase';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { Loader2, Download, RefreshCw, Sparkles, Layout, AlertCircle } from 'lucide-react';

const SOCIAL_OPTIONS = {
    instagram: [
        { id: 'story', label: 'Story', ratio: '9:16' },
        { id: 'post_square', label: 'Square Post', ratio: '1:1' },
        { id: 'post_portrait', label: 'Portrait', ratio: '4:5' }
    ],
    facebook: [
        { id: 'event_cover', label: 'Event Cover', ratio: '1.91:1' },
        { id: 'post_portrait', label: 'Vertical Post', ratio: '4:5' },
        { id: 'post_landscape', label: 'Landscape', ratio: '1.91:1' }
    ]
};

interface EventDraft {
    title: string;
    type: string;
    description: string;
    date: string;
    id?: string;
}

interface Props {
    venueId: string;
    eventData: EventDraft;
    onAssetSelected?: (url: string) => void;
}

export const SocialFlyerGenerator: React.FC<Props> = ({ venueId, eventData, onAssetSelected }) => {
    const [platform, setPlatform] = useState<'facebook' | 'instagram'>('instagram');
    const [selectedType, setSelectedType] = useState<string>('story');
    const [isGenerating, setIsGenerating] = useState(false);

    // 1. Fetch Venue Data (Check for Brand DNA)
    const venueRef = doc(db, 'venues', venueId);
    const [venue] = useDocumentData(venueRef);

    // 2. Listen to the specific event's flyers or the generic drafts collection
    const targetEventId = eventData.id || 'drafts';
    const flyersRef = collection(db, `venues/${venueId}/events/${targetEventId}/flyers`);
    const q = query(flyersRef, orderBy('createdAt', 'desc'), limit(5));
    const [flyers] = useCollectionData(q);

    const hasBrandDna = !!venue?.brand_dna;

    const generateFlyer = async () => {
        if (!eventData.title) return alert("Please enter an Event Title first!");
        if (!hasBrandDna) return; // Safeguard

        setIsGenerating(true);
        try {
            // Use the pre-configured 'us-west1' functions from lib/firebase
            const generateFn = httpsCallable(functions, 'generateSocialFlyer');

            await generateFn({
                venueId,
                eventId: targetEventId,
                eventContext: {
                    title: eventData.title,
                    type: eventData.type,
                    details: eventData.description,
                    date: eventData.date
                },
                spec: { platform, type: selectedType }
            });

        } catch (error: any) {
            console.error("Schmidt failed:", error);
            alert("Schmidt stumbled. Check the console.");
        } finally {
            setIsGenerating(false);
        }
    };

    const activeFlyer = flyers?.[0];

    return (
        <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden flex flex-col h-full shadow-xl">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-bold flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        Schmidt's Flyer Studio
                    </h3>
                    <div className="flex bg-slate-800 rounded-lg p-1">
                        {(['instagram', 'facebook'] as const).map((p) => (
                            <button
                                key={p}
                                onClick={() => { setPlatform(p); setSelectedType(SOCIAL_OPTIONS[p][0].id); }}
                                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${platform === p ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                                    }`}
                            >
                                {p.charAt(0).toUpperCase() + p.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Format Chips */}
                <div className="flex flex-wrap gap-2">
                    {SOCIAL_OPTIONS[platform].map((opt) => (
                        <button
                            key={opt.id}
                            onClick={() => setSelectedType(opt.id)}
                            className={`text-xs border px-3 py-1.5 rounded-full transition-colors ${selectedType === opt.id
                                ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                                : 'border-slate-700 text-slate-500 hover:border-slate-600'
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Preview Area */}
            <div className="relative flex-1 bg-slate-950 flex items-center justify-center min-h-[400px] p-6">
                {isGenerating && (
                    <div className="absolute inset-0 z-10 bg-black/80 flex flex-col items-center justify-center backdrop-blur-md">
                        <Loader2 className="w-12 h-12 text-amber-500 animate-spin mb-4" />
                        <p className="text-amber-200 font-medium animate-pulse">Schmidt is crafting your vision...</p>
                        <p className="text-slate-500 text-xs mt-2">Harmonizing Brand DNA & Event Vibe</p>
                    </div>
                )}

                {/* NO BRAND DNA STATE */}
                {!hasBrandDna && !isGenerating && (
                    <div className="text-center p-8 max-w-sm bg-slate-900/50 rounded-2xl border border-slate-800">
                        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-amber-500 opacity-50" />
                        <p className="text-slate-200 font-medium mb-2">Visual Identity Required</p>
                        <p className="text-slate-500 text-sm mb-6">Schmidt needs to learn your vibe before he can generate flyers. Run a Quick Audit first.</p>
                        <button className="bg-slate-800 text-slate-300 px-4 py-2 rounded-lg text-xs hover:bg-slate-700 transition-colors">
                            Run Brand Audit
                        </button>
                    </div>
                )}

                {hasBrandDna && venue?.brand_dna?.extraction_source === 'inferred' && !isGenerating && (
                    <div className="absolute top-4 left-4 right-4 z-20">
                        <div className="bg-amber-950/80 border border-amber-900/50 backdrop-blur-md p-3 rounded-lg flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                            <div>
                                <p className="text-amber-200 text-xs font-bold uppercase tracking-wider">Style Inference Active</p>
                                <p className="text-amber-400/80 text-[10px] leading-tight mt-0.5">
                                    Schmidt guessed your vibe from text. Upload actual photos to refine your visual DNA.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {hasBrandDna && !activeFlyer && !isGenerating && (
                    <div className="text-center opacity-40">
                        <Layout className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                        <p className="text-slate-400">Select a format and click Generate</p>
                    </div>
                )}

                {hasBrandDna && activeFlyer && !isGenerating && (
                    <div className="relative group">
                        <img
                            src={activeFlyer.publicUrl}
                            alt="Generated Flyer"
                            className="max-h-[350px] w-auto object-contain shadow-2xl rounded-lg border border-slate-800 transition-transform group-hover:scale-[1.02]"
                        />
                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-[10px] text-slate-400">
                            Generated by AI
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-between items-center gap-4">
                {activeFlyer ? (
                    <button
                        onClick={() => onAssetSelected && onAssetSelected(activeFlyer.publicUrl)}
                        className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 px-2 py-1"
                    >
                        Use this image
                    </button>
                ) : <div />}

                <div className="flex gap-3">
                    {activeFlyer && (
                        <a
                            href={activeFlyer.publicUrl}
                            download
                            target="_blank"
                            rel="noreferrer"
                            className="p-2.5 text-slate-400 hover:text-white border border-slate-700 rounded-xl hover:bg-slate-800 transition-colors"
                        >
                            <Download className="w-5 h-5" />
                        </a>
                    )}
                    <button
                        onClick={generateFlyer}
                        disabled={isGenerating || !hasBrandDna}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isGenerating ? 'Cooking...' : activeFlyer ? 'Regenerate' : 'Generate'}
                        {!isGenerating && <RefreshCw className="w-4 h-4" />}
                    </button>
                </div>
            </div>
        </div>
    );
};
