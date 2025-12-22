import React from 'react';
import SantaArtie from '../../assets/Santa Artie.png';

interface ArtieHoverIconProps {
    onClick: () => void;
}

const ArtieHoverIcon: React.FC<ArtieHoverIconProps> = ({ onClick }) => {
    return (
        <div
            onClick={onClick}
            className="fixed z-50 transition-transform duration-300 hover:scale-110 cursor-pointer active:scale-95 group"
            style={{
                bottom: '80px', // Positioned above League Standings
                right: '16px',
            }}
        >
            <div className="relative">
                {/* The Artie Image */}
                <div className="w-16 h-16 rounded-full border-4 border-[#FFD700] shadow-2xl overflow-hidden bg-primary ring-2 ring-black">
                    <img
                        src={SantaArtie}
                        alt="Santa Artie"
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Notification Dot (similar to previous version) */}
                <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-black animate-pulse" />

                {/* Tooltip or "Artie says" bubble */}
                <div className="absolute bottom-full right-0 mb-3 hidden group-hover:block bg-black border-2 border-primary text-primary font-black text-[10px] px-3 py-1.5 rounded-lg whitespace-nowrap uppercase tracking-widest shadow-xl animate-in fade-in slide-in-from-bottom-2">
                    Ho Ho Ho! Check the Standings!
                </div>
            </div>
        </div>
    );
};

export default ArtieHoverIcon;
