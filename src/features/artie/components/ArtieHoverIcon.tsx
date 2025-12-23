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
            className="fixed bottom-6 right-6 z-[100] cursor-pointer group"
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Tooltip / Speech Bubble */}
            <div className={`absolute bottom-full right-0 mb-2 whitespace-nowrap bg-oly-navy text-oly-gold px-3 py-1 rounded-lg border border-oly-gold shadow-lg transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <p className="text-sm font-oswald">Chat with Artie!</p>
            </div>

            {/* Icon Container */}
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-oly-gold shadow-2xl hover:scale-110 transition-transform duration-300 bg-oly-navy">
                <img
                    src={santaArtie}
                    alt="Artie"
                    className="w-full h-full object-cover"
                />
            </div>
        </div>
    );
};
