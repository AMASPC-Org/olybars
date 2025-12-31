import React from 'react';
import { Check, X, User, MapPin, Calendar } from 'lucide-react';
import { Venue } from '../../../types';

interface PhotoApprovalCardProps {
    venue: Venue;
    photo: any;
    onApprove: (venueId: string, photoId: string) => void;
    onReject: (venueId: string, photoId: string) => void;
    isAdminView?: boolean;
}

export const PhotoApprovalCard: React.FC<PhotoApprovalCardProps> = ({ venue, photo, onApprove, onReject, isAdminView = false }) => {
    return (
        <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-xl flex flex-col">
            <div className="relative aspect-video">
                <img src={photo.url} alt="Submission" className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 flex gap-2">
                    <span className="bg-black/60 backdrop-blur-md text-[10px] font-black text-primary px-2 py-1 rounded-full uppercase tracking-widest border border-primary/20">
                        {photo.marketingStatus?.replace('-', ' ')}
                    </span>
                </div>
            </div>

            <div className="p-4 flex-1 flex flex-col space-y-3">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                            <MapPin className="w-3 h-3" />
                            {venue.name}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                            <User className="w-3 h-3" />
                            {photo.userId?.substring(0, 8)}...
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1.5 text-[9px] text-slate-600 font-mono">
                    <Calendar className="w-3 h-3" />
                    {new Date(photo.timestamp).toLocaleString()}
                </div>

                <div className="pt-2 flex gap-2">
                    <button
                        onClick={() => onApprove(venue.id, photo.id)}
                        className="flex-1 bg-green-500 hover:bg-green-400 text-black py-2 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                        <Check className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{isAdminView ? 'Pass to Venue' : 'Approve'}</span>
                    </button>
                    <button
                        onClick={() => onReject(venue.id, photo.id)}
                        className="flex-1 bg-slate-800 hover:bg-red-500/20 hover:text-red-500 text-slate-400 py-2 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 border border-white/5"
                    >
                        <X className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Reject</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
