import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Trash2, CheckCircle, XCircle, Loader2, Sparkles, MessageSquare, Info, Trophy } from 'lucide-react';
import { Venue, AppEvent } from '../../../types';
import { EventService } from '../../../services/eventService';
import { useToast } from '../../../components/ui/BrandedToast';

interface EventsManagementTabProps {
    venue: Venue;
}

export const EventsManagementTab: React.FC<EventsManagementTabProps> = ({ venue }) => {
    const { showToast } = useToast();
    const [events, setEvents] = useState<AppEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState<string | null>(null);

    const loadEvents = async () => {
        setIsLoading(true);
        const fetchedEvents = await EventService.fetchEvents({ venueId: venue.id, status: 'pending' });
        const approvedEvents = await EventService.fetchEvents({ venueId: venue.id, status: 'approved' });
        setEvents([...fetchedEvents, ...approvedEvents]);
        setIsLoading(false);
    };

    useEffect(() => {
        loadEvents();
    }, [venue.id]);

    const handleUpdateStatus = async (eventId: string, updates: Partial<AppEvent>) => {
        setIsActionLoading(eventId);
        try {
            await EventService.updateEvent(eventId, updates);
            if (updates.status) showToast(`Event ${updates.status === 'approved' ? 'Approved' : 'Rejected'}!`, 'success');
            if (updates.isLeagueEvent !== undefined) showToast(`League Status Updated!`, 'success');
            await loadEvents();
        } catch (error: any) {
            showToast(error.message || 'Failed to update event.', 'error');
        } finally {
            setIsActionLoading(null);
        }
    };

    const handleDelete = async (eventId: string) => {
        if (!window.confirm('Are you sure you want to delete this event?')) return;
        setIsActionLoading(eventId);
        try {
            await EventService.deleteEvent(eventId);
            showToast('Event deleted.', 'success');
            await loadEvents();
        } catch (error: any) {
            showToast(error.message || 'Failed to delete event.', 'error');
        } finally {
            setIsActionLoading(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight font-league">Event Management</h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Approve community submissions or schedule your own</p>
                </div>
                <button className="bg-primary text-black font-black px-4 py-2 rounded-lg text-xs uppercase tracking-wider flex items-center gap-2 hover:scale-105 transition-transform">
                    <Plus size={14} /> Schedule Event
                </button>
            </div>

            {isLoading ? (
                <div className="py-20 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                </div>
            ) : events.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                    {events.map((event) => (
                        <div key={event.id} className="bg-surface border border-white/10 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-primary/20 transition-all">
                            <div className="flex gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${event.status === 'approved' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                                    }`}>
                                    <Calendar size={24} />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-black text-white uppercase font-league tracking-wide">{event.title}</h3>
                                        <div className="flex gap-1">
                                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${event.status === 'approved'
                                                ? 'border-green-500/30 text-green-500 bg-green-500/10'
                                                : 'border-yellow-500/30 text-yellow-500 bg-yellow-500/10'
                                                }`}>
                                                {event.status}
                                            </span>
                                            {event.isLeagueEvent && (
                                                <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full border border-primary/30 text-primary bg-primary/10 flex items-center gap-1">
                                                    <Trophy size={8} className="fill-current" /> League
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                                        <span className="flex items-center gap-1"><Calendar size={10} /> {event.date}</span>
                                        <span className="flex items-center gap-1"><Clock size={10} /> {event.time}</span>
                                        <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5">{event.type}</span>
                                    </div>
                                    {event.description && (
                                        <p className="text-[10px] text-slate-500 font-medium italic truncate max-w-md">"{event.description}"</p>
                                    )}
                                    {event.submittedBy !== 'guest' ? (
                                        <p className="text-[8px] text-slate-600 font-bold uppercase flex items-center gap-1">
                                            <Sparkles size={8} /> Submitted by Member
                                        </p>
                                    ) : (
                                        <p className="text-[8px] text-slate-600 font-bold uppercase flex items-center gap-1">
                                            <MessageSquare size={8} /> Guest Submission
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                {event.status === 'approved' && (
                                    <button
                                        onClick={() => handleUpdateStatus(event.id, { isLeagueEvent: !event.isLeagueEvent })}
                                        disabled={!!isActionLoading}
                                        className={`h-10 px-4 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all border ${event.isLeagueEvent
                                                ? 'bg-primary text-black border-primary shadow-[0_0_15px_-3px_rgba(251,191,36,0.3)]'
                                                : 'bg-white/5 text-slate-400 border-white/10 hover:border-primary/50'
                                            }`}
                                    >
                                        <Trophy size={14} className={event.isLeagueEvent ? "fill-current" : ""} /> League
                                    </button>
                                )}
                                {event.status === 'pending' && (
                                    <button
                                        onClick={() => handleUpdateStatus(event.id, { status: 'approved' })}
                                        disabled={!!isActionLoading}
                                        className="h-10 px-4 bg-green-600 hover:bg-green-500 text-white rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all"
                                    >
                                        <CheckCircle size={14} /> Approve
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDelete(event.id)}
                                    disabled={!!isActionLoading}
                                    className="h-10 w-10 flex items-center justify-center bg-white/5 hover:bg-red-500/10 hover:text-red-500 text-slate-400 rounded-xl border border-white/10 transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-slate-900/40 border border-dashed border-white/5 p-12 rounded-3xl text-center space-y-4">
                    <Calendar className="w-12 h-12 text-slate-700 mx-auto" />
                    <p className="text-slate-500 font-black uppercase tracking-widest text-xs">No events scheduled yet.</p>
                </div>
            )}

            <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
                <div className="flex gap-4">
                    <Info className="text-primary shrink-0" size={24} />
                    <div className="space-y-1">
                        <h4 className="text-xs font-black text-primary uppercase tracking-wider font-league">Venue Hosting Rules</h4>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                            Events submitted by the community will appear here for your review. Once approved, they go live on the <span className="text-primary">Event Wire</span> and are visible to all League members. Make sure to reject any spam or non-compliant content to maintain your venue's standing.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
