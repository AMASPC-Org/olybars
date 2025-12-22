import React, { useState, useRef } from 'react';
import { X, Camera, Share2, Info, Loader2, Sparkles, Beer, Users, Flame } from 'lucide-react';
import { Venue, PointsReason, VenueStatus } from '../../../types';

interface VibeCheckModalProps {
    isOpen: boolean;
    onClose: () => void;
    venue: Venue;
    onConfirm: (venue: Venue, status: VenueStatus, hasConsent: boolean, photoUrl?: string) => void;
}

export const VibeCheckModal: React.FC<VibeCheckModalProps> = ({
    isOpen,
    onClose,
    venue,
    onConfirm,
}) => {
    const [selectedStatus, setSelectedStatus] = useState<VenueStatus>(venue.status || 'chill');
    const [showCamera, setShowCamera] = useState(false);
    const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
    const [cameraError, setCameraError] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [allowMarketingUse, setAllowMarketingUse] = useState(false);

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    if (!isOpen) return null;

    const startCamera = async () => {
        setCameraError(false);
        setShowCamera(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }
        } catch (err) {
            console.error("Camera access denied", err);
            setCameraError(true);
            setShowCamera(false);
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
        setShowCamera(false);
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            if (context) {
                canvasRef.current.width = videoRef.current.videoWidth;
                canvasRef.current.height = videoRef.current.videoHeight;
                context.drawImage(videoRef.current, 0, 0);
                const dataUrl = canvasRef.current.toDataURL('image/jpeg');
                setCapturedPhoto(dataUrl);
                stopCamera();
            }
        }
    };

    const handleConfirm = async () => {
        setIsSubmitting(true);
        // Simulate a small delay for "processing" feel
        await new Promise(resolve => setTimeout(resolve, 800));
        onConfirm(venue, selectedStatus, allowMarketingUse, capturedPhoto || undefined);
        setIsSubmitting(false);
        onClose();
    };

    const vibeOptions: { status: VenueStatus; label: string; icon: any; color: string; desc: string }[] = [
        { status: 'chill', label: 'Chill', icon: Beer, color: 'text-blue-400', desc: 'Relaxed, plenty of space' },
        { status: 'lively', label: 'Lively', icon: Users, color: 'text-primary', desc: 'Good energy, moderate crowd' },
        { status: 'buzzing', label: 'Buzzing', icon: Flame, color: 'text-red-500', desc: 'Packed, high energy!' },
    ];

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in zoom-in-95 duration-200">
            <div className="bg-surface w-full max-w-sm overflow-hidden rounded-xl border border-slate-700 shadow-lg relative">

                {showCamera && (
                    <div className="absolute inset-0 z-[70] bg-black flex flex-col">
                        <video ref={videoRef} autoPlay playsInline className="flex-1 object-cover w-full" />
                        <canvas ref={canvasRef} className="hidden" />
                        <div className="p-4 bg-black/50 flex justify-between items-center absolute bottom-0 w-full border-t border-primary/20">
                            <button onClick={stopCamera} className="font-bold uppercase tracking-wider text-sm text-white">Cancel</button>
                            <button onClick={capturePhoto} className="w-16 h-16 bg-white rounded-full border-4 border-primary shadow-xl active:scale-95 transition-transform"></button>
                            <div className="w-16"></div>
                        </div>
                    </div>
                )}

                <div className="bg-primary p-4 text-center border-b border-black/10 relative">
                    <button onClick={onClose} className="absolute top-3 right-3 text-black/70 hover:text-black hover:scale-110 transition-transform"><X className="w-6 h-6" /></button>
                    <h2 className="text-2xl font-black text-black uppercase tracking-wider font-league italic">Vibe Check</h2>
                    <p className="text-black/60 text-[10px] font-black uppercase tracking-widest font-league leading-none">{venue.name}</p>
                </div>

                <div className="p-4 space-y-4">
                    {/* Vibe Selection */}
                    <div className="grid grid-cols-1 gap-2">
                        {vibeOptions.map((opt) => (
                            <button
                                key={opt.status}
                                onClick={() => setSelectedStatus(opt.status)}
                                className={`flex items-center gap-4 p-3 rounded-xl border-2 transition-all text-left ${selectedStatus === opt.status ? 'bg-primary/10 border-primary' : 'bg-slate-800/50 border-slate-700 hover:border-slate-500'}`}
                            >
                                <div className={`p-2 rounded-lg bg-black/40 ${opt.color}`}>
                                    <opt.icon size={20} />
                                </div>
                                <div className="flex-1">
                                    <p className={`font-black uppercase tracking-wider font-league ${selectedStatus === opt.status ? 'text-primary' : 'text-slate-300'}`}>{opt.label}</p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase">{opt.desc}</p>
                                </div>
                                {selectedStatus === opt.status && (
                                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Optional Photo */}
                    <div onClick={capturedPhoto ? undefined : startCamera} className={`border-2 border-dashed rounded-lg p-4 text-center transition-all cursor-pointer group relative overflow-hidden ${capturedPhoto ? 'border-primary/50 bg-black' : 'border-slate-600 bg-surface hover:bg-slate-800 hover:border-primary'}`}>
                        {capturedPhoto ? (
                            <div>
                                <img src={capturedPhoto} alt="Captured Vibe" className="w-full h-24 object-cover rounded-md mb-2" />
                                <button onClick={() => setCapturedPhoto(null)} className="text-[9px] text-slate-400 font-bold uppercase hover:text-white">Retake Photo</button>
                            </div>
                        ) : (
                            <>
                                {cameraError ? (
                                    <p className="text-red-500 text-[10px] font-bold">Camera access error. Photo optional.</p>
                                ) : (
                                    <div className="flex items-center justify-center gap-2">
                                        <Camera className="w-4 h-4 text-slate-400 group-hover:text-primary" />
                                        <p className="text-[10px] font-black text-slate-300 uppercase italic">Add Vibe Photo (+10 Pts)</p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Marketing Consent */}
                    <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-3 space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Sparkles size={14} className={allowMarketingUse ? 'text-primary' : 'text-slate-600'} />
                                <div>
                                    <p className="text-[10px] font-black text-white uppercase tracking-wider font-league leading-none">Marketing Consent</p>
                                    <p className="text-[8px] text-slate-500 font-bold uppercase italic mt-0.5">Earn +15 Bonus Points!</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setAllowMarketingUse(!allowMarketingUse)}
                                className={`w-8 h-4 rounded-full p-0.5 transition-all ${allowMarketingUse ? 'bg-primary' : 'bg-slate-700'}`}
                            >
                                <div className={`w-3 h-3 rounded-full bg-white transition-all ${allowMarketingUse ? 'translate-x-4' : 'translate-x-0'}`} />
                            </button>
                        </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex justify-between items-center mb-2">
                        <span className="text-[10px] font-black text-slate-500 uppercase font-league tracking-widest">League Reward</span>
                        <span className="text-sm font-black text-primary uppercase font-league">
                            +{5 + (capturedPhoto ? 10 : 0) + (allowMarketingUse ? 15 : 0)} POINTS
                        </span>
                    </div>

                    <button
                        onClick={handleConfirm}
                        disabled={isSubmitting}
                        className="w-full bg-primary hover:bg-yellow-400 disabled:bg-slate-700 disabled:text-slate-400 text-black font-black text-lg uppercase tracking-widest py-4 rounded-lg shadow-xl active:scale-95 transition-all font-league italic flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /> Transmitting...</>
                        ) : (
                            <>Submit Vibe</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
