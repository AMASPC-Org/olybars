import React, { useState } from 'react';
import { Venue } from '../../../types';
import { useToast } from '../../../components/ui/BrandedToast';
import { Calendar, AlertTriangle, Lock, Users, Zap, Check, Info } from 'lucide-react';

interface LeagueHostManagementTabProps {
    venue: Venue;
    onUpdate: (venueId: string, updates: Partial<Venue>) => void;
}

export const LeagueHostManagementTab: React.FC<LeagueHostManagementTabProps> = ({ venue, onUpdate }) => {
    const { showToast } = useToast();
    const [eventDate, setEventDate] = useState('');
    const [eventType, setEventType] = useState('karaoke');

    // Request Activation State
    const [isRequesting, setIsRequesting] = useState(false);
    const [requestForm, setRequestForm] = useState({
        type: 'Karaoke',
        time: '',
        frequency: 'One-Time',
        description: '',
        dates: ''
    });

    // In a real app, this would be a list of league events
    const [activeEvents, setActiveEvents] = useState([
        { id: 1, type: 'Karaoke League', date: 'Fridays', time: '8:00 PM', status: 'Active' }
    ]);

    const handleToggleAttempt = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!venue.isVerifiedHost) {
            // Prevent the toggle from switching visually if it was controlled
            // But since we are showing an alert, we effectively intercept the action
            const shouldRequest = window.confirm("You must be a Verified League Host to enable this feature. Would you like to request activation?");
            if (shouldRequest) {
                setIsRequesting(true);
            }
        } else {
            // Allow toggle logic (updates venue.isLeagueHost or similar if existing)
            // For now, we assume this component is just for management
            console.log('Toggle switched');
        }
    };

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    const handleRequestSubmit = async () => {
        // Basic validation: description is the big one
        if (!requestForm.description) {
            showToast('Please describe your proposed events/rules.', 'error');
            return;
        }

        try {
            const response = await fetch(`${apiUrl}/api/requests`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'LEAGUE_HOST',
                    payload: {
                        venueId: venue.id,
                        venueName: venue.name,
                        request: requestForm
                    }
                })
            });

            if (response.ok) {
                showToast('Application Sent to The Commish for Approval!', 'success');
                setIsRequesting(false);
            } else {
                showToast('Failed to send application.', 'error');
            }
        } catch (error) {
            console.error(error);
            showToast('Network error sending application.', 'error');
        }
    };

    const handleCreateEvent = () => {
        showToast('Event Scheduled! (Mock)', 'success');
        // Logic to update venue.leagueEvent or similar
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Section */}
            <div className="bg-surface p-6 rounded-xl border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Users className="w-32 h-32 text-primary" />
                </div>
                <h3 className="text-2xl font-black text-white uppercase font-league mb-2 relative z-10">League Host Status</h3>

                {/* Info / Benefits Section */}
                <div className="grid grid-cols-1 gap-4 mb-6 relative z-10">
                    <p className="text-sm text-slate-400 leading-relaxed bg-black/40 p-4 rounded-lg border border-white/5">
                        <strong className="text-white block mb-2 uppercase text-xs tracking-widest">Why become a League Host?</strong>
                        Official <strong>League Hosts</strong> are sanctioned to run OlyBars competitive events like Karaoke, Trivia, and Darts.
                        Verified hosts receive:
                        <ul className="list-disc list-inside mt-2 space-y-1 text-slate-500 text-xs">
                            <li>Priority listing on the OlyBars map</li>
                            <li>Push notifications to users for Game Nights</li>
                            <li>Access to official League branding and assets</li>
                            <li>Eligible for "Vibe Check" rewards</li>
                        </ul>
                    </p>
                </div>

                <div className="mt-6 flex items-center justify-between relative z-10">
                    <div className={`px-4 py-2 rounded-lg font-black uppercase tracking-widest text-xs flex items-center gap-2 border ${venue.isVerifiedHost ? 'bg-primary text-black border-primary' : 'bg-slate-900 text-slate-500 border-slate-700'}`}>
                        {venue.isVerifiedHost ? <Check className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        {venue.isVerifiedHost ? 'VERIFIED HOST' : 'STATUS: UNVERIFIED'}
                    </div>

                    {/* Toggle Switch */}
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            {venue.isVerifiedHost ? 'League Mode Active' : 'Enable League Mode'}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={venue.isVerifiedHost || false}
                                onChange={handleToggleAttempt}
                                disabled={venue.isVerifiedHost} // If verified, maybe locked ON or managed elsewhere? Assuming simple gate for now. 
                            // Actually, user said: "toggle functionality... If a venue owner tries to activate... alert"
                            // So we need it to look interactible if unverified.
                            />
                            <div className={`w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${venue.isVerifiedHost ? 'peer-checked:bg-primary' : 'peer-checked:bg-slate-600'}`}></div>
                        </label>
                    </div>
                </div>
            </div>

            {/* Request Activation Form Modal/Card */}
            {isRequesting && !venue.isVerifiedHost && (
                <div className="bg-surface p-6 rounded-xl border border-primary/30 shadow-[0_0_50px_-12px_rgba(251,191,36,0.2)] animate-in fade-in zoom-in-95 duration-300">
                    <h4 className="text-lg font-black text-white uppercase font-league mb-4 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-primary" />
                        Host Application
                    </h4>
                    <p className="text-xs text-slate-400 mb-6">
                        Complete the details below to request League Host verification. The Commish will review your venue and event capabilities.
                    </p>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Event Type</label>
                                <select
                                    className="w-full bg-black border border-white/10 rounded-lg p-3 text-white text-sm font-bold outline-none"
                                    value={requestForm.type}
                                    onChange={e => setRequestForm({ ...requestForm, type: e.target.value })}
                                >
                                    <option>Karaoke</option>
                                    <option>Trivia</option>
                                    <option>Darts</option>
                                    <option>Live Music</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Frequency</label>
                                <select
                                    className="w-full bg-black border border-white/10 rounded-lg p-3 text-white text-sm font-bold outline-none"
                                    value={requestForm.frequency}
                                    onChange={e => setRequestForm({ ...requestForm, frequency: e.target.value })}
                                >
                                    <option>One-Time</option>
                                    <option>Weekly</option>
                                    <option>Monthly</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Proposed Dates & Times</label>
                            <input
                                type="text"
                                placeholder="e.g. Every Friday starting Oct 1st at 8pm"
                                className="w-full bg-black border border-white/10 rounded-lg p-3 text-white text-sm font-bold outline-none"
                                value={requestForm.dates}
                                onChange={e => setRequestForm({ ...requestForm, dates: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">Description / Rules</label>
                            <textarea
                                placeholder="Describe your event format, house rules, or any special equipment you have..."
                                className="w-full bg-black border border-white/10 rounded-lg p-3 text-white text-sm font-bold outline-none min-h-[100px]"
                                value={requestForm.description}
                                onChange={e => setRequestForm({ ...requestForm, description: e.target.value })}
                            />
                        </div>

                        <div className="flex gap-4 pt-2">
                            <button
                                onClick={() => setIsRequesting(false)}
                                className="flex-1 bg-transparent hover:bg-white/5 text-slate-400 font-bold py-3 rounded-lg uppercase tracking-widest text-xs transition-colors border border-transparent hover:border-white/10"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRequestSubmit}
                                className="flex-1 bg-primary hover:bg-primary/90 text-black font-black py-3 rounded-lg uppercase tracking-widest text-xs transition-colors shadow-lg shadow-primary/20"
                            >
                                Submit Request
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {!venue.isVerifiedHost && !isRequesting && (
                <div className="p-12 text-center border-2 border-dashed border-slate-800 rounded-xl bg-black/20">
                    <Lock className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                    <h3 className="text-xl font-black text-slate-600 uppercase font-league mb-2">League Tools Locked</h3>
                    <p className="text-slate-500 max-w-sm mx-auto text-sm">
                        Toggle the switch above to request verification and unlock advanced hosting tools.
                    </p>
                </div>
            )}

            {/* Gated Content */}
            {venue.isVerifiedHost && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Create Event Tool */}
                        <div className="bg-surface p-6 rounded-xl border border-white/10">
                            <h4 className="text-lg font-black text-white uppercase font-league mb-4 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-primary" />
                                Host New Event
                            </h4>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase">Event Type</label>
                                    <select
                                        value={eventType}
                                        onChange={(e) => setEventType(e.target.value)}
                                        className="w-full bg-black border border-white/10 rounded-lg p-3 text-white text-sm font-bold outline-none mt-1"
                                    >
                                        <option value="karaoke">Karaoke League</option>
                                        <option value="trivia">Trivia Knights</option>
                                        <option value="darts">Dart League</option>
                                        <option value="live">Live Music</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase">Schedule</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Every Friday at 8pm"
                                        value={eventDate}
                                        onChange={(e) => setEventDate(e.target.value)}
                                        className="w-full bg-black border border-white/10 rounded-lg p-3 text-white text-sm font-bold outline-none mt-1"
                                    />
                                </div>
                                <button
                                    onClick={handleCreateEvent}
                                    className="w-full bg-slate-800 hover:bg-slate-700 text-white font-black py-3 rounded-lg uppercase tracking-widest text-xs transition-colors"
                                >
                                    Submit for Sanctioning
                                </button>
                            </div>
                        </div>

                        {/* Active Rosters */}
                        <div className="bg-surface p-6 rounded-xl border border-white/10">
                            <h4 className="text-lg font-black text-white uppercase font-league mb-4 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-secondary" />
                                Active Roster
                            </h4>
                            <div className="space-y-3">
                                {activeEvents.map(evt => (
                                    <div key={evt.id} className="bg-black/40 border border-white/5 rounded-lg p-3 flex justify-between items-center">
                                        <div>
                                            <p className="text-sm font-black text-white uppercase">{evt.type}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">{evt.date} @ {evt.time}</p>
                                        </div>
                                        <div className="px-2 py-1 bg-green-500/10 text-green-500 text-[9px] font-black uppercase rounded border border-green-500/20">
                                            {evt.status}
                                        </div>
                                    </div>
                                ))}
                                <div className="p-3 text-center border border-dashed border-white/5 rounded-lg">
                                    <p className="text-[10px] text-slate-600 font-bold uppercase">No other active events</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
