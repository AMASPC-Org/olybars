import React from 'react';
import { Eye, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyScreen: React.FC = () => {
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
                        <Eye className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter font-league">PRIVACY <span className="text-primary">POLICY</span></h1>
                        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Last Updated: Dec 21, 2025</p>
                    </div>
                </header>

                <section className="space-y-4">
                    <h2 className="text-xl font-black uppercase tracking-wide font-league text-primary">1. Information We Collect</h2>
                    <p className="text-slate-300 leading-relaxed text-sm">
                        To provide the Pulse and League features, we collect:
                    </p>
                    <ul className="list-disc list-inside text-slate-400 text-sm space-y-2 ml-4">
                        <li>Location data (verified locally only at the moment of "Clock In")</li>
                        <li>Account information (Handle and points are stored locally for guests; synced to Cloud only upon profile creation)</li>
                        <li>Activity data (Vibe reports and check-in frequency for the Pulse algorithm)</li>
                        <li>Photos (Optional "Vibe Photos" provided with or without marketing consent)</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-black uppercase tracking-wide font-league text-primary">2. GPS, Geofencing & Photo Retention</h2>
                    <p className="text-slate-300 leading-relaxed text-sm">
                        OlyBars utilizes real-time GPS verification to ensure League integrity. To "Clock In," users must be physically present within a 100-foot radius of the participating venue. This location data is used solely for point verification and is not stored or shared for advertising purposes.
                    </p>
                    <p className="text-slate-300 leading-relaxed text-sm">
                        When you select "Clock In" with the "Marketing Consent" toggle active, users grant OlyBars a non-exclusive right to display the photo on the specific venue's listing page. In exchange, users receive a Premium Point Reward (+25 pts). A standard "Clock In" (+10 pts) will signal your presence on the map/feed, but photos are not stored for public gallery use.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-black uppercase tracking-wide font-league text-primary">3. Cookies and Storage</h2>
                    <p className="text-slate-300 leading-relaxed text-sm">
                        We use essential cookies and <strong>local storage</strong> to keep you logged in, save your notification preferences, and persist "Anti-Gaming" cooldown timers across sessions. These storage mechanisms are critical for maintaining the integrity of the Artesian Bar League leaderboard.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-black uppercase tracking-wide font-league text-primary">4. Analytics & AI</h2>
                    <p className="text-slate-300 leading-relaxed text-sm">
                        We use anonymized activity data to help Artie (our AI concierge) provide better recommendations. We do not share your personal email or identity with AI service providers without your explicit consent.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-black uppercase tracking-wide font-league text-primary">5. Contact Us</h2>
                    <p className="text-slate-300 leading-relaxed text-sm">
                        Questions about your data? Hit us up through the Artie concierge or email legal@olybars.com.
                    </p>
                </section>

                <footer className="pt-12 border-t border-white/5 text-center">
                    <p className="text-xs text-slate-600 font-bold uppercase tracking-widest">
                        Your privacy is our priority. Drink responsibly and stay safe.
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default PrivacyScreen;
