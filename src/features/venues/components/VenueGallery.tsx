import React from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface VenueGalleryProps {
    photos?: { url: string; allowMarketingUse?: boolean; timestamp?: number; userId?: string }[];
}

export const VenueGallery: React.FC<VenueGalleryProps> = ({ photos }) => {
    const consentedPhotos = (photos || []).filter(p => p.allowMarketingUse !== false);

    if (consentedPhotos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 bg-slate-900/30 rounded-xl border border-dashed border-slate-800">
                <ImageIcon className="w-8 h-8 text-slate-700 mb-2" />
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">No public vibes yet</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-2">
            {consentedPhotos.map((photo, i) => (
                <div key={i} className="aspect-square rounded-lg overflow-hidden border border-slate-700 relative group">
                    <img
                        src={photo.url}
                        alt="Venue Vibe"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                        <p className="text-[8px] text-primary font-black uppercase tracking-tighter">
                            {new Date(photo.timestamp || 0).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};
