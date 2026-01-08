import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { format, addDays, isSameDay } from 'date-fns';
import { ThemedDatePicker } from './ThemedDatePicker';

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
    const [showPicker, setShowPicker] = useState(false);

    const options = [
        { label: 'Today', date: today },
        { label: 'Tomorrow', date: tomorrow },
    ];

    const isToday = isSameDay(selectedDate, today);
    const isTomorrow = isSameDay(selectedDate, tomorrow);
    const isFuture = !isToday && !isTomorrow;

    return (
        <div className="flex items-center gap-2 py-1">
            <div className="flex p-1 rounded-xl border border-white/10">
                {options.map((opt) => {
                    const active = isSameDay(selectedDate, opt.date);
                    return (
                        <button
                            key={opt.label}
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDateChange(opt.date);
                            }}
                            className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${active
                                ? 'bg-primary text-black shadow-lg shadow-primary/20'
                                : 'bg-transparent text-slate-400 hover:text-white'
                                }`}
                        >
                            {opt.label}
                        </button>
                    );
                })}
            </div>

            <div className="relative">
                <button
                    type="button"
                    onClick={() => setShowPicker(true)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all relative ${isFuture
                        ? 'bg-primary border-primary text-black shadow-lg shadow-primary/20'
                        : 'bg-transparent border-white/20 text-slate-400 hover:text-white hover:border-white/40'
                        }`}
                >
                    <Calendar size={14} className={isFuture ? 'animate-pulse' : ''} />
                    {isFuture ? format(selectedDate, 'MMM d') : 'Pick Date'}
                </button>

                {showPicker && (
                    <ThemedDatePicker
                        selectedDate={selectedDate}
                        onDateChange={onDateChange}
                        onClose={() => setShowPicker(false)}
                    />
                )}
            </div>
        </div>
    );
};
