import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import santaArtie from '../../../assets/Santa Artie.png';

interface ArtieHoverIconProps {
    onClick?: () => void;
}

export const ArtieHoverIcon: React.FC<ArtieHoverIconProps> = ({ onClick }) => {
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = useState(false);

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else {
            navigate('/artie');
        }
    };

    return (
        <div
            className="fixed bottom-24 sm:bottom-6 right-6 z-[100] cursor-pointer group"
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Tooltip / Speech Bubble */}
            <div className={`absolute bottom-full right-0 mb-3 whitespace-nowrap bg-oly-navy text-oly-gold px-3 py-1.5 rounded-xl border-2 border-oly-gold shadow-2xl transition-all duration-300 transform ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
                <p className="text-xs font-black uppercase tracking-widest font-league">Artie is Online</p>
            </div>

            {/* Icon & Label Container (Branded Pill) */}
            <div className="flex items-center bg-oly-navy border-2 border-oly-gold rounded-full shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden pr-4 sm:pr-2 group-hover:shadow-primary/20">
                {/* Icon Circle */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-r-2 border-oly-gold/30 bg-black flex-shrink-0">
                    <img
                        src={santaArtie}
                        alt="Artie"
                        className="w-full h-full object-cover scale-110"
                    />
                </div>

                {/* "ASK" Label */}
                <div className="pl-3 flex flex-col justify-center">
                    <span className="text-oly-gold font-league font-black text-xs sm:text-sm tracking-widest mb-0.5 whitespace-nowrap">
                        ASK
                    </span>
                    <div className="flex gap-0.5">
                        <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                        <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse [animation-delay:0.2s]" />
                        <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse [animation-delay:0.4s]" />
                    </div>
                </div>
            </div>
        </div>
    );
};
