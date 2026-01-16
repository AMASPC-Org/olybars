import React, { useState } from 'react';
import { SocialFlyerGenerator } from './SocialFlyerGenerator';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { X, Calendar, ArrowRight, Check } from 'lucide-react';

interface Props {
    venueId: string;
    onClose: () => void;
}

export const EventCreationWizard: React.FC<Props> = ({ venueId, onClose }) => {
    const [step, setStep] = useState<'DETAILS' | 'VISUALS'>('DETAILS');
    const [isSaving, setIsSaving] = useState(false);

    const [draft, setDraft] = useState({
        title: '',
        type: 'Trivia',
        date: new Date().toISOString().split('T')[0],
        time: '19:00',
        description: '',
        flyerUrl: ''
    });

    const publishEvent = async () => {
        setIsSaving(true);
        try {
            await addDoc(collection(db, 'venues', venueId, 'events'), {
                ...draft,
                status: 'published',
                createdAt: new Date().toISOString(),
                source: 'schmidt_wizard'
            });
            onClose();
        } catch (e) {
            console.error("Save failed", e);
            alert("Could not save event.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 w-full max-w-4xl rounded-2xl border border-slate-700 shadow-2xl flex overflow-hidden h-[80vh]">

                <div className={`w-1/3 border-r border-slate-800 p-6 flex flex-col ${step === 'VISUALS' ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-white mb-1">New Event</h2>
                        <p className="text-slate-400 text-sm">Step 1: The Basics</p>
                    </div>
                    <div className="space-y-4 flex-1">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Title</label>
                            <input
                                value={draft.title}
                                onChange={e => setDraft({ ...draft, title: e.target.value })}
                                placeholder="e.g. 80s Karaoke"
                                className="w-full bg-slate-800 border-slate-700 rounded p-2 text-white mt-1 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Date</label>
                                <input
                                    type="date"
                                    value={draft.date}
                                    onChange={e => setDraft({ ...draft, date: e.target.value })}
                                    className="w-full bg-slate-800 border-slate-700 rounded p-2 text-white mt-1"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase">Time</label>
                                <input
                                    type="time"
                                    value={draft.time}
                                    onChange={e => setDraft({ ...draft, time: e.target.value })}
                                    className="w-full bg-slate-800 border-slate-700 rounded p-2 text-white mt-1"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Type</label>
                            <select
                                value={draft.type}
                                onChange={e => setDraft({ ...draft, type: e.target.value })}
                                className="w-full bg-slate-800 border-slate-700 rounded p-2 text-white mt-1"
                            >
                                <option>Trivia</option>
                                <option>Karaoke</option>
                                <option>Live Music</option>
                                <option>DJ Set</option>
                                <option>Comedy</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Description</label>
                            <textarea
                                value={draft.description}
                                onChange={e => setDraft({ ...draft, description: e.target.value })}
                                rows={4}
                                className="w-full bg-slate-800 border-slate-700 rounded p-2 text-white mt-1"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex-1 bg-slate-950 flex flex-col">
                    <div className="flex justify-between p-4">
                        <div className="flex gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${step === 'DETAILS' ? 'bg-indigo-600 text-white' : 'bg-green-600 text-white'}`}>
                                1. Details {step === 'VISUALS' && <Check className="inline w-3 h-3 ml-1" />}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${step === 'VISUALS' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'}`}>
                                2. Visuals
                            </span>
                        </div>
                        <button onClick={onClose}><X className="text-slate-500 hover:text-white" /></button>
                    </div>

                    <div className="flex-1 p-8 flex flex-col justify-center">
                        {step === 'DETAILS' ? (
                            <div className="text-center space-y-4 opacity-50">
                                <div className="w-20 h-20 bg-slate-800 rounded-full mx-auto flex items-center justify-center">
                                    <Calendar className="w-8 h-8 text-slate-500" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-300">Start with the details</h3>
                                <p className="text-slate-500 max-w-sm mx-auto">Fill out the form on the left to unlock Schmidt's design studio.</p>
                                <button
                                    disabled={!draft.title}
                                    onClick={() => setStep('VISUALS')}
                                    className="bg-slate-800 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-600 transition-all disabled:opacity-50"
                                >
                                    Next Step <ArrowRight className="inline w-4 h-4 ml-2" />
                                </button>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col">
                                <div className="mb-4">
                                    <h3 className="text-xl font-bold text-white">Design Studio</h3>
                                    <p className="text-slate-400 text-sm">Generate assets for "{draft.title}"</p>
                                </div>
                                <div className="flex-1 min-h-0">
                                    <SocialFlyerGenerator
                                        venueId={venueId}
                                        eventData={draft}
                                        onAssetSelected={(url) => setDraft(prev => ({ ...prev, flyerUrl: url }))}
                                    />
                                </div>
                                <div className="mt-6 flex justify-end gap-4">
                                    <button onClick={() => setStep('DETAILS')} className="text-slate-400 hover:text-white px-4 py-2">Back</button>
                                    <button
                                        onClick={publishEvent}
                                        disabled={isSaving}
                                        className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-green-900/20 flex items-center gap-2"
                                    >
                                        {isSaving ? 'Publishing...' : 'Publish Event'}
                                        {!isSaving && <Check className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
