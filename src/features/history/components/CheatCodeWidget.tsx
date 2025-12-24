import React from 'react';
import { Eye, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CheatCodeWidgetProps {
    url: string;
}

export const CheatCodeWidget: React.FC<CheatCodeWidgetProps> = ({ url }) => {
    const navigate = useNavigate();

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        // Check if internal (starts with /) or external
        if (url.startsWith('/')) {
            navigate(url);
        } else {
            window.open(url, '_blank');
        }
    };

    return (
        <button
            onClick={handleClick}
            className="w-full mt-3 bg-accent/10 border border-accent/30 hover:bg-accent/20 transition-colors rounded-lg p-2 px-3 flex items-center justify-between group"
        >
            <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-accent" />
                <span className="text-xs font-bold text-accent uppercase tracking-wider">
                    Unlock Cheat Code
                </span>
            </div>
            <ExternalLink className="w-3 h-3 text-accent/50 group-hover:text-accent transition-colors" />
        </button>
    );
};
