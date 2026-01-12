import React, { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';

export interface QuickReplyOption {
    id: string;
    label: string;
    value: string;
    icon?: string; // Optional emoji or icon identifier
    action?: 'flash_deal' | 'add_event' | 'update_play' | 'general' | 'cancel' | 'custom' | 'menu_ideation';
}

interface QuickReplyChipsProps {
    options: QuickReplyOption[];
    onSelect: (option: QuickReplyOption) => void;
    disabled?: boolean;
    maxVisible?: number;
}

export const QuickReplyChips: React.FC<QuickReplyChipsProps> = ({
    options,
    onSelect,
    disabled = false,
    maxVisible = Infinity
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    if (!options || options.length === 0) return null;

    const visibleOptions = options.slice(0, maxVisible);
    const overflowOptions = options.slice(maxVisible);

    return (
        <div className="flex flex-wrap gap-2 mt-3 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300 relative justify-end">
            {/* Visible Options */}
            {visibleOptions.map((option) => (
                <button
                    key={option.id}
                    onClick={() => onSelect(option)}
                    disabled={disabled}
                    className={`
            flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider
            transition-all duration-200 ease-in-out transform active:scale-95
            border border-primary/30 bg-slate-800/80 text-primary
            hover:bg-primary hover:text-black hover:border-primary hover:shadow-[0_0_15px_rgba(250,204,21,0.4)]
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-800/80 disabled:hover:text-primary
          `}
                >
                    {option.icon && <span className="text-sm">{option.icon}</span>}
                    {option.label}
                </button>
            ))}

            {/* Overflow Menu Button */}
            {overflowOptions.length > 0 && (
                <div className="relative">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        disabled={disabled}
                        className={`
              flex items-center gap-2 px-3 py-2 rounded-full text-xs font-bold uppercase tracking-wider
              transition-all duration-200 ease-in-out transform active:scale-95
              border border-primary/30 bg-slate-800/80 text-primary
              hover:bg-primary hover:text-black hover:border-primary hover:shadow-[0_0_15px_rgba(250,204,21,0.4)]
              disabled:opacity-50 disabled:cursor-not-allowed
              ${isMenuOpen ? 'bg-primary text-black' : ''}
            `}
                    >
                        <MoreHorizontal className="w-4 h-4" />
                        More...
                    </button>

                    {/* Popover Menu */}
                    {isMenuOpen && (
                        <>
                            <div
                                className="fixed inset-0 z-40 bg-transparent"
                                onClick={() => setIsMenuOpen(false)}
                            />
                            <div className="absolute bottom-full right-0 mb-2 w-48 bg-slate-800 border border-primary/30 rounded-xl shadow-2xl p-2 z-50 flex flex-col gap-1 animate-in zoom-in-95 duration-200">
                                {overflowOptions.map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => {
                                            onSelect(option);
                                            setIsMenuOpen(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-200 hover:bg-white/10 hover:text-primary transition-colors text-left"
                                    >
                                        <div className="w-6 text-center text-sm">{option.icon}</div>
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};
