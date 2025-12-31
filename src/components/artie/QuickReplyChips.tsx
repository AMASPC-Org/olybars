import React from 'react';

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
}

export const QuickReplyChips: React.FC<QuickReplyChipsProps> = ({
    options,
    onSelect,
    disabled = false
}) => {
    if (!options || options.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-2 mt-3 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {options.map((option) => (
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
        </div>
    );
};
