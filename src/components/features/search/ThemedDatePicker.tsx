import React, { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isBefore, startOfToday } from 'date-fns';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface ThemedDatePickerProps {
    selectedDate: Date;
    onDateChange: (date: Date) => void;
    onClose: () => void;
}

export const ThemedDatePicker: React.FC<ThemedDatePickerProps> = ({
    selectedDate,
    onDateChange,
    onClose
}) => {
    const [viewDate, setViewDate] = useState(selectedDate);
    const today = startOfToday();

    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const nextMonth = () => setViewDate(addMonths(viewDate, 1));
    const prevMonth = () => setViewDate(subMonths(viewDate, 1));

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-300">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Container */}
            <div className="relative w-full max-w-sm bg-slate-950 border-t sm:border border-white/10 rounded-t-[32px] sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 duration-500">
                {/* Header/Title */}
                <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter leading-none font-league">
                            Pick a Date
                        </h3>
                        <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mt-2 italic">
                            Discovery Forecast
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-white/5 rounded-xl text-slate-500 hover:text-white hover:bg-white/10 transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Sub-Header: Month Selection */}
                <div className="px-6 py-4 flex items-center justify-between bg-white/[0.01]">
                    <span className="text-xs font-black text-slate-300 uppercase tracking-widest">
                        {format(viewDate, 'MMMM yyyy')}
                    </span>
                    <div className="flex gap-1.5">
                        <button
                            onClick={prevMonth}
                            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all border border-white/5"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            onClick={nextMonth}
                            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all border border-white/5"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="p-6 pt-2">
                    <div className="grid grid-cols-7 gap-1 mb-3">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                            <div key={i} className="text-center text-[10px] font-black text-slate-600 uppercase tracking-widest py-2">
                                {d}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                        {calendarDays.map((date, i) => {
                            const isSelected = isSameDay(date, selectedDate);
                            const isCurrentMonth = isSameMonth(date, monthStart);
                            const isPast = isBefore(date, today);
                            const isTodayDate = isSameDay(date, today);

                            return (
                                <button
                                    key={i}
                                    disabled={isPast}
                                    onClick={() => {
                                        onDateChange(date);
                                        onClose();
                                    }}
                                    className={`
                                        aspect-square flex items-center justify-center rounded-xl text-xs font-bold transition-all relative
                                        ${isSelected ? 'bg-primary text-black shadow-lg shadow-primary/30 scale-105 z-10' : ''}
                                        ${!isSelected && isCurrentMonth && !isPast ? 'text-slate-300 hover:bg-white/10 hover:text-white' : ''}
                                        ${!isCurrentMonth ? 'text-slate-800' : ''}
                                        ${isPast ? 'text-slate-900 cursor-not-allowed opacity-30' : ''}
                                        ${isTodayDate && !isSelected ? 'text-primary' : ''}
                                    `}
                                >
                                    {format(date, 'd')}
                                    {isTodayDate && !isSelected && (
                                        <div className="absolute bottom-1 w-1 h-1 bg-primary rounded-full" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Selected Output</span>
                        <span className="text-xs font-bold text-white">
                            {isSameDay(selectedDate, today) ? 'Real-time Pulse' : format(selectedDate, 'MMM d, yyyy')}
                        </span>
                    </div>
                    <button
                        onClick={() => {
                            onDateChange(today);
                            onClose();
                        }}
                        className="px-4 py-2 bg-white/5 hover:bg-primary hover:text-black rounded-xl text-[10px] font-black text-slate-300 uppercase tracking-widest transition-all border border-white/5"
                    >
                        Jump to Today
                    </button>
                </div>
            </div>
        </div>
    );
};
