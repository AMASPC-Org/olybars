import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Users } from 'lucide-react';
import { Venue } from '../../types/venue';

interface BuzzClockProps {
    venues: Venue[];
}

export const BuzzClock: React.FC<BuzzClockProps> = ({ venues }) => {
    const navigate = useNavigate();
    const now = new Date();
    const currentDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][now.getDay()];
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const timeToMinutes = (timeStr: string) => {
        if (!timeStr) return 0;
        const [h, m] = timeStr.split(':').map(Number);
        return h * 60 + m;
    };

    const formatMinutes = (minutes: number) => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${h}h ${m}m`;
    };

    // 1. Get Live Happy Hours
    const liveHH = venues
        .filter(v => {
            if (!v.happyHour) return false;
            if (v.happyHour.days && !v.happyHour.days.includes(currentDay)) return false;
            const start = timeToMinutes(v.happyHour.startTime);
            const end = timeToMinutes(v.happyHour.endTime);
            return currentMinutes >= start && currentMinutes < end;
        })
        .sort((a, b) => timeToMinutes(a.happyHour!.endTime) - timeToMinutes(b.happyHour!.endTime));

    // 2. Get Upcoming Happy Hours for Today
    const upcomingHH = venues
        .filter(v => {
            if (!v.happyHour) return false;
            const alreadyLive = liveHH.some(l => l.id === v.id);
            if (alreadyLive) return false;
            if (v.happyHour.days && !v.happyHour.days.includes(currentDay)) return false;
            const start = timeToMinutes(v.happyHour.startTime);
            return start > currentMinutes;
        })
        .sort((a, b) => timeToMinutes(a.happyHour!.startTime) - timeToMinutes(b.happyHour!.startTime));

    // Determine what to show: All live ones, then fill with upcoming
    const allLiveItems = liveHH.map(v => ({
        id: v.id,
        name: v.name,
        isHQ: v.isHQ,
        timeLabel: formatMinutes(timeToMinutes(v.happyHour!.endTime) - currentMinutes),
        subLabel: 'LEFT',
        deal: v.happyHourSpecials || v.happyHour!.description,
        isLive: true,
        urgency: (timeToMinutes(v.happyHour!.endTime) - currentMinutes) < 60 ? 'red' : 'green',
        checkIns: v.checkIns,
        status: v.status
    }));

    const allUpcomingItems = upcomingHH
        .map(v => ({
            id: v.id,
            name: v.name,
            isHQ: v.isHQ,
            timeLabel: formatMinutes(timeToMinutes(v.happyHour!.startTime) - currentMinutes),
            subLabel: 'STARTS',
            deal: v.happyHourSpecials || v.happyHour!.description,
            isLive: false,
            urgency: 'blue',
            checkIns: v.checkIns,
            status: v.status
        }));

    const totalPotentialItems = [...allLiveItems, ...allUpcomingItems];

    // Implement Rotation: Pick a random starting point if more than 3 items
    const [startIndex, setStartIndex] = React.useState(0);

    React.useEffect(() => {
        if (totalPotentialItems.length > 3) {
            // Pick a random offset that allows showing 3 items
            const possibleOffsets = totalPotentialItems.length; // We can use modulo to wrap around
            const randomOffset = Math.floor(Math.random() * possibleOffsets);
            setStartIndex(randomOffset);
        }
    }, [totalPotentialItems.length]);

    // Use modulo for true wraparound rotation if desired, or just slice
    const displayItems = React.useMemo(() => {
        if (totalPotentialItems.length <= 3) return totalPotentialItems;
        const items = [];
        for (let i = 0; i < 3; i++) {
            items.push(totalPotentialItems[(startIndex + i) % totalPotentialItems.length]);
        }
        return items;
    }, [totalPotentialItems, startIndex]);

    const remainingCount = Math.max(0, totalPotentialItems.length - 3);

    // Helper to format status text strictly
    const getStatusDisplay = (status?: string) => {
        if (!status) return null;
        const s = status.toLowerCase();
        if (s === 'dead') return { text: 'DEAD', color: 'text-slate-500', bg: 'bg-slate-500' };
        if (s === 'chill') return { text: 'CHILL', color: 'text-blue-300', bg: 'bg-blue-400' };
        if (s === 'buzzing' || s === 'lively') return { text: 'BUZZING', color: 'text-[#FFD700]', bg: 'bg-[#FFD700]' };
        if (s === 'packed') return { text: 'PACKED', color: 'text-red-400', bg: 'bg-red-500' };
        return null;
    };

    return (
        <div className="bg-black/95 backdrop-blur-md border-b border-[#FFD700]/50 shadow-2xl overflow-hidden">
            {/* Header Row - Extra Compact */}
            <div className="px-4 py-2 flex justify-between items-center border-b border-white/5">
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#FFD700]" strokeWidth={3} />
                    <h2 className="text-[11px] font-black text-white uppercase tracking-[0.2em] font-league">
                        The Buzz Clock
                    </h2>
                </div>
                {liveHH.length > 0 && (
                    <div className="flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </span>
                        <span className="text-[9px] font-black text-red-500 uppercase tracking-widest italic">Live Now</span>
                    </div>
                )}
            </div>

            {/* High-Density List */}
            <div className="divide-y divide-white/5">
                {displayItems.length > 0 ? displayItems.map((item) => {
                    const statusConfig = getStatusDisplay(item.status);
                    const timeValue = item.timeLabel.split(' ');

                    return (
                        <div
                            key={item.id}
                            onClick={() => navigate(`/venues/${item.id}`)}
                            className="px-4 py-2.5 flex justify-between items-center hover:bg-white/5 active:bg-white/10 transition-all cursor-pointer group"
                        >
                            {/* Left: Two-Line Vibe + Deal */}
                            <div className="flex-1 min-w-0 pr-4">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                    <h3 className="text-sm font-black text-white uppercase tracking-tight truncate group-hover:text-[#FFD700] transition-colors font-league">
                                        {item.name}
                                    </h3>
                                    {item.isHQ && (
                                        <span className="text-[8px] bg-primary text-black font-black px-1 rounded-[2px] transform -skew-x-12">HQ</span>
                                    )}
                                </div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide truncate">
                                    {item.deal}
                                </p>
                            </div>

                            {/* Right: Urgent Time */}
                            <div className="text-right flex-shrink-0">
                                <div className={`text-sm font-black font-mono leading-none ${item.urgency === 'red' ? 'text-red-500' :
                                    item.urgency === 'blue' ? 'text-blue-400' :
                                        'text-green-400'
                                    }`}>
                                    {timeValue[0]}<span className="text-[10px] ml-0.5">{timeValue[1]}</span>
                                </div>
                                <span className="text-[8px] text-slate-600 font-black uppercase tracking-tighter block mt-0.5">
                                    {item.subLabel}
                                </span>
                            </div>
                        </div>
                    );
                }) : (
                    <div className="py-6 text-center">
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Quiet city... check back soon</p>
                    </div>
                )}
            </div>

            {/* Footer View All - Conditional */}
            {remainingCount > 0 && (
                <button
                    onClick={() => navigate('/bars')}
                    className="w-full py-2 bg-white/5 border-t border-white/5 hover:bg-white/10 transition-all flex items-center justify-center gap-2 group"
                >
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] group-hover:text-primary transition-colors">
                        + {remainingCount} More Buzzing (View All)
                    </span>
                </button>
            )}
        </div>
    );
};
