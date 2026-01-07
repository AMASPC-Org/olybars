import React from 'react';
import { Calendar, ChevronRight } from 'lucide-react';
import { format, addDays, isSameDay } from 'date-fns';

interface DateContextSelectorProps {
    selectedDate: Date;
    onDateChange: (date: Date) => void;
}

export const DateContextSelector: React.FC<DateContextSelectorProps> = ({
    selectedDate,
    onDateChange
}) => {
    const today = new Date();
    const tomorrow = addDays(today, 1);

    const options = [
        { label: 'Today', date: today },
        { label: 'Tomorrow', date: tomorrow },
    ];

    const isToday = isSameDay(selectedDate, today);
    const isTomorrow = isSameDay(selectedDate, tomorrow);
    const isFuture = !isToday && !isTomorrow;

    return (
        <div className="flex items-center gap-2 py-1">
            <div className="flex bg-surface/50 p-1 rounded-xl border border-slate-800">
                {options.map((opt) => {
                    const active = isSameDay(selectedDate, opt.date);
                    return (
                        <button
                            key={opt.label}
                            onClick={() => onDateChange(opt.date)}
                            className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${active
                                    ? 'bg-primary text-black shadow-lg'
                                    : 'text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            {opt.label}
                        </button>
                    );
                })}
            </div>

            <div className="relative">
                <button
                    onClick={() => {/* TODO: Implement Date Picker if needed, for now just toggle "Pick Date" state */ }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${isFuture
                            ? 'border-primary text-primary bg-primary/5'
                            : 'border-slate-800 text-slate-500 hover:border-slate-600'
                        }`}
                >
                    <Calendar size={14} />
                    {isFuture ? format(selectedDate, 'MMM d') : 'Pick Date'}
                </button>
            </div>
        </div>
    );
};
