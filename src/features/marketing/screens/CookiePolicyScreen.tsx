import React from 'react';
import { Cookie, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CookiePolicyScreen: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background text-white p-6 pb-24 font-body">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-primary mb-8 hover:opacity-80 transition-opacity uppercase font-black tracking-widest text-xs"
            >
                <ChevronLeft className="w-4 h-4" />
                Back
            </button>

            <div className="max-w-2xl mx-auto space-y-8">
                <header className="flex items-center gap-4 mb-12">
                    <div className="bg-primary/20 p-3 rounded-xl">
                        <Cookie className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter font-league">COOKIE <span className="text-primary">POLICY</span></h1>
                        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Last Updated: Jan 04, 2026</p>
                    </div>
                </header>

                <section className="space-y-4">
                    <h2 className="text-xl font-black uppercase tracking-wide font-league text-primary">1. What Are Cookies?</h2>
                    <p className="text-slate-300 leading-relaxed text-sm">
                        Cookies are small text files stored on your device that help us remember who you are and what you prefer. OlyBars uses both "cookies" and "local storage" to maintain your session and preferences.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-black uppercase tracking-wide font-league text-primary">2. Essential Cookies (Strictly Necessary)</h2>
                    <p className="text-slate-300 leading-relaxed text-sm">
                        These are required for the app to function. Without them, you cannot log in, earn points, or participate in the League.
                    </p>
                    <ul className="list-disc list-inside text-slate-400 text-sm space-y-2 ml-4">
                        <li><strong>Auth Token:</strong> Keeps you signed in securely via Firebase.</li>
                        <li><strong>League ID:</strong> Stores your anonymous user ID if you are a guest.</li>
                        <li><strong>Verification Timestamps:</strong> Local timestamps used to enforce the "30-minute Vibe Check Cooldown" and "12-hour Clock-In Cap" to prevent cheating.</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-black uppercase tracking-wide font-league text-primary">3. Operational Storage</h2>
                    <p className="text-slate-300 leading-relaxed text-sm">
                        We use Local Storage to save your preferences so you don't have to set them every time:
                    </p>
                    <ul className="list-disc list-inside text-slate-400 text-sm space-y-2 ml-4">
                        <li><strong>Alert Preferences:</strong> Your choices for "Weekly Buzz" and "Nightly Digest" notifications.</li>
                        <li><strong>Age Gate:</strong> Remembers that you have verified you are 21+.</li>
                        <li><strong>Favorites:</strong> Your locally cached list of favorite venues.</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-black uppercase tracking-wide font-league text-primary">4. Analytics & Performance</h2>
                    <p className="text-slate-300 leading-relaxed text-sm">
                        We use lightweight, privacy-focused analytics (Google Analytics for Firebase) to understand which features are popular. This data is aggregated and does not track your individual movements across other websites.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-black uppercase tracking-wide font-league text-primary">5. Managing Cookies</h2>
                    <p className="text-slate-300 leading-relaxed text-sm">
                        You can clear your cookies and local storage at any time via your browser settings. However, doing so will log you out and may reset your "Vibe Check" cooldown timers (though server-side checks will still prevent rapid-fire points earning).
                    </p>
                </section>

                <footer className="pt-12 border-t border-white/5 text-center">
                    <p className="text-xs text-slate-600 font-bold uppercase tracking-widest">
                        © 2026 OlyBars.com
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default CookiePolicyScreen;
