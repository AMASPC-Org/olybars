import React, { useState, useEffect } from 'react';
import { ShieldCheck, X } from 'lucide-react';
import { cookieService } from '../../services/cookieService';

export const CookieBanner: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = cookieService.get('oly_cookies');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        cookieService.set('oly_cookies', 'true');
        cookieService.set('oly_terms', 'true');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="absolute bottom-24 left-4 right-4 z-[150] animate-in slide-in-from-bottom-5 duration-500">
            <div className="bg-slate-900 border-2 border-primary/40 p-4 rounded-2xl shadow-[0_0_50px_-12px_rgba(251,191,36,0.3)] flex items-center justify-between gap-4 backdrop-blur-xl bg-opacity-95">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/20 p-2 rounded-lg">
                        <ShieldCheck className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <p className="text-[11px] font-black text-white uppercase tracking-wider leading-none mb-1 font-league">
                            Taste the Goodness (and Cookies)
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase font-body">
                            We use cookies to save your pulse. By sipping, you agree to our{' '}
                            <a href="/terms" className="text-primary hover:underline">Terms</a> &{' '}
                            <a href="/privacy" className="text-primary hover:underline">Privacy</a>.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleAccept}
                        className="bg-primary text-black text-[10px] font-black px-4 py-2 rounded-lg uppercase tracking-widest hover:bg-yellow-400 transition-colors"
                    >
                        Sip & Accept
                    </button>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="text-slate-500 hover:text-white p-1"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};
