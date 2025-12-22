import React, { useState, useRef } from 'react';
import { X, Camera, Share2, MapPin, Info, Loader2, Sparkles } from 'lucide-react';
import { Venue, CheckInRecord, PointsReason } from '../../../types';
import { performCheckIn } from '../../../services/userService';
import { useGeolocation } from '../../../hooks/useGeolocation';
import { calculateDistance } from '../../../utils/geoUtils';

interface ClockInModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedVenue: Venue | null;
    awardPoints: (reason: PointsReason, venueId?: string, hasConsent?: boolean) => void;
    setCheckInHistory: React.Dispatch<React.SetStateAction<CheckInRecord[]>>;
    setClockedInVenue: React.Dispatch<React.SetStateAction<string | null>>;
    setVenues: React.Dispatch<React.SetStateAction<Venue[]>>;
}

export const ClockInModal: React.FC<ClockInModalProps> = ({
    isOpen,
    onClose,
    selectedVenue,
    awardPoints,
    setCheckInHistory,
    setClockedInVenue,
    setVenues,
}) => {
    const [showCamera, setShowCamera] = useState(false);
    const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
    const [cameraError, setCameraError] = useState(false);
    const [isCheckingIn, setIsCheckingIn] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const [allowMarketingUse, setAllowMarketingUse] = useState(false);
    const { coords, loading: geoLoading } = useGeolocation();

    if (!isOpen || !selectedVenue) return null;

    const currentDistance = coords && selectedVenue.location
        ? calculateDistance(coords.latitude, coords.longitude, selectedVenue.location.lat, selectedVenue.location.lng)
        : null;

    const isAtVenue = currentDistance !== null && currentDistance <= 100;

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
    }

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            if (context) {
                canvasRef.current.width = videoRef.current.videoWidth;
                canvasRef.current.height = videoRef.current.videoHeight;
                context.drawImage(videoRef.current, 0, 0);
                const dataUrl = canvasRef.current.toDataURL('image/jpeg');
                setCapturedPhoto(dataUrl);
                awardPoints('photo');
                stopCamera();
            }
        }
    };

    const handleShare = async () => {
        awardPoints('share');
        // Share logic can be implemented here or in parent
        alert("Link copied to clipboard! (+5 Points)");
    };

    const confirmClockIn = async () => {
        setIsCheckingIn(true);
        setErrorMessage(null);

        // Get actual location
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    const userId = "guest_user_123"; // Placeholder until Auth wired

                    await performCheckIn(selectedVenue.id, userId, latitude, longitude);

                    awardPoints('checkin', selectedVenue.id, allowMarketingUse);
                    setCheckInHistory(prev => [...prev, { venueId: selectedVenue.id, timestamp: Date.now() }]);
                    setClockedInVenue(selectedVenue.id);
                    setVenues(prev => prev.map(v => v.id === selectedVenue.id ? { ...v, checkIns: v.checkIns + 1 } : v));
                    onClose();
                } catch (err: any) {
                    setErrorMessage(err.message);
                } finally {
                    setIsCheckingIn(false);
                }
            },
            (err) => {
                console.error("Geolocation error", err);
                setErrorMessage("Coordinate Verification Failed. Please enable location services.");
                setIsCheckingIn(false);
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in zoom-in-95 duration-200">
            <div className="bg-surface w-full max-w-sm overflow-hidden rounded-xl border border-slate-700 shadow-lg relative">

                {showCamera && (
                    <div className="absolute inset-0 z-50 bg-black flex flex-col">
                        <video ref={videoRef} autoPlay playsInline className="flex-1 object-cover w-full" />
                        <canvas ref={canvasRef} className="hidden" />
                        <div className="p-4 bg-black/50 flex justify-between items-center absolute bottom-0 w-full border-t border-primary/20">
                            <button onClick={stopCamera} className="font-bold uppercase tracking-wider text-sm">Cancel</button>
                            <button onClick={capturePhoto} className="w-16 h-16 bg-white rounded-full border-4 border-primary shadow-xl active:scale-95 transition-transform"></button>
                            <div className="w-16"></div> {/* Spacer */}
                        </div>
                    </div>
                )}

                <div className="bg-primary p-4 text-center border-b border-black/10 relative">
                    <button onClick={onClose} className="absolute top-3 right-3 text-black/70 hover:text-black hover:scale-110 transition-transform"><X className="w-6 h-6" /></button>
                    <h2 className="text-2xl font-black text-black uppercase tracking-wider font-league">Clock In Check</h2>
                    <p className="text-black/60 text-[10px] font-black uppercase tracking-widest font-league">Limit: 2 per 12 hours</p>
                </div>

                <div className="p-4 space-y-4">
                    <div className="text-center">
                        <p className="text-slate-400 text-xs uppercase tracking-widest mb-1 font-bold">
                            {geoLoading ? 'Finding you...' : (isAtVenue ? '📍 Arrived' : '🚶 Heading there')}
                        </p>
                        <h3 className="text-3xl font-bold text-white uppercase">{selectedVenue.name}</h3>
                        <div className="mt-1">
                            {currentDistance !== null ? (
                                <p className={`text-[10px] font-black uppercase tracking-widest ${isAtVenue ? 'text-primary' : 'text-slate-500'}`}>
                                    {Math.round(currentDistance)}m FROM VENUE {isAtVenue ? '(OK)' : '(TOO FAR)'}
                                </p>
                            ) : (
                                <p className="text-primary text-xs font-bold uppercase">{selectedVenue.type}</p>
                            )}
                        </div>
                    </div>

                    <div onClick={capturedPhoto ? undefined : startCamera} className={`border-2 border-dashed rounded-lg p-4 text-center transition-all cursor-pointer group relative overflow-hidden ${capturedPhoto ? 'border-primary/50 bg-black' : 'border-slate-600 bg-surface hover:bg-slate-800 hover:border-primary'}`}>
                        {capturedPhoto ? (
                            <div>
                                <img src={capturedPhoto} alt="Vibe Check" className="w-full h-32 object-cover rounded-md mb-2" />
                                <div className="flex gap-2">
                                    <button onClick={() => setCapturedPhoto(null)} className="flex-1 text-xs text-slate-400 py-2 hover:text-white font-bold uppercase rounded-md bg-slate-700/50 hover:bg-slate-700">Retake</button>
                                    <button onClick={handleShare} className="flex-1 bg-primary/10 text-primary text-xs font-bold py-2 border border-primary/20 rounded-md flex items-center justify-center gap-1 hover:bg-primary/20"><Share2 className="w-3 h-3" /> SHARE (+5 PTS)</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                {cameraError ? (
                                    <div className="py-4"><p className="text-red-500 text-xs mb-2 font-bold">Camera access denied. Enable permissions in your browser.</p></div>
                                ) : (
                                    <>
                                        <div className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-2 group-hover:bg-primary/10 transition-colors border border-slate-700"><Camera className="w-7 h-7 text-slate-400 group-hover:text-primary" /></div>
                                        <p className="text-sm font-bold text-white uppercase tracking-wide">Take Vibe Photo (+10 Pts)</p>
                                        <p className="text-[10px] text-slate-500 mt-1 font-bold uppercase">Logo, Menu, or Selfie</p>
                                    </>
                                )}
                            </>
                        )}
                    </div>

                    {/* Marketing Consent & Total Rewards */}
                    <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className={`p-1.5 rounded-md ${allowMarketingUse ? 'bg-primary/20 text-primary' : 'bg-slate-800 text-slate-500'}`}>
                                    <Sparkles size={14} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-white uppercase tracking-wider font-league leading-none mb-1">Marketing Consent</p>
                                    <p className="text-[8px] text-slate-500 font-bold uppercase italic">Earn +15 Bonus Points!</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setAllowMarketingUse(!allowMarketingUse)}
                                className={`w-9 h-5 rounded-full p-1 transition-all ${allowMarketingUse ? 'bg-primary' : 'bg-slate-700'}`}
                            >
                                <div className={`w-3 h-3 rounded-full bg-white transition-all ${allowMarketingUse ? 'translate-x-4' : 'translate-x-0'}`} />
                            </button>
                        </div>

                        <div className="bg-slate-900/60 rounded-lg p-2.5 border border-slate-800/50">
                            <div className="flex items-start gap-2">
                                <Info size={12} className="text-primary shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-[9px] text-slate-300 font-bold uppercase tracking-tight">Usage Transparency:</p>
                                    <p className="text-[8px] text-slate-500 leading-normal font-medium italic">
                                        By submitting a "Vibe Check" with the "Marketing Consent" toggle active, users grant OlyBars a non-exclusive right to display the photo on the specific venue's listing page. In exchange, users receive a Premium Point Reward (+20 pts). Standard "Vibe Checks" (+5 pts) are ephemeral and are not stored for public gallery use.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                            <span className="text-[10px] font-black text-slate-500 uppercase font-league">Total Reward Preview</span>
                            <span className="text-sm font-black text-primary uppercase font-league">
                                +{10 + (allowMarketingUse ? 15 : 0)} POINTS
                            </span>
                        </div>
                    </div>

                    <div className="bg-slate-800/50 p-3 text-[10px] text-slate-400 border border-slate-700 rounded-md flex gap-2 items-start leading-tight">
                        <Info className="w-4 h-4 shrink-0 text-primary mt-0.5" />
                        <div className="space-y-1">
                            <p className="font-black uppercase tracking-widest text-white">GPS Verification Disclosure</p>
                            <p className="font-medium italic text-[9px]">
                                OlyBars utilizes real-time GPS verification to ensure League integrity. To "Clock In" or perform a "Vibe Check," users must be physically present within a 100-foot radius of the participating venue. This location data is used solely for point verification and is not stored or shared for advertising purposes.
                            </p>
                        </div>
                    </div>

                    {errorMessage && (
                        <div className="bg-red-900/20 border border-red-800 p-3 rounded-lg text-red-200 text-xs font-bold text-center animate-in fade-in slide-in-from-top-1">
                            ⚠️ {errorMessage}
                        </div>
                    )}

                    <button
                        onClick={confirmClockIn}
                        disabled={isCheckingIn}
                        className="w-full bg-primary hover:bg-yellow-400 disabled:bg-slate-700 disabled:text-slate-400 text-black font-bold text-lg uppercase tracking-wider py-4 rounded-lg shadow-md active:scale-95 transition-transform flex items-center justify-center gap-2"
                    >
                        {isCheckingIn ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /> Verifying...</>
                        ) : (
                            <><MapPin className="w-5 h-5" /> CONFIRM I AM HERE</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
