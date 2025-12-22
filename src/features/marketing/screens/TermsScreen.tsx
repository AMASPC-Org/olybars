import React from 'react';
import { Shield, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TermsScreen: React.FC = () => {
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
                        <Shield className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter font-league">TERMS OF <span className="text-primary">SERVICE</span></h1>
                        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Last Updated: Dec 21, 2025</p>
                    </div>
                </header>

                <section className="space-y-4">
                    <h2 className="text-xl font-black uppercase tracking-wide font-league text-primary">1. Acceptance of Terms</h2>
                    <p className="text-slate-300 leading-relaxed text-sm">
                        By accessing or using OlyBars.com, you agree to be bound by these Terms of Service. If you do not agree to all terms, do not use our services.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-black uppercase tracking-wide font-league text-primary">2. Age Requirement</h2>
                    <p className="text-slate-300 leading-relaxed text-sm">
                        OlyBars is intended for use by individuals 21 years of age or older. You represent that you are of legal drinking age in your jurisdiction. We do not promote excessive consumption of alcohol. Always drink responsibly.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-black uppercase tracking-wide font-league text-primary">3. The Olympia Bar League & Verified Patrons</h2>
                    <p className="text-slate-300 leading-relaxed text-sm">
                        Membership in the Olympia Bar League (OBL) is a privilege for <strong>Verified Patrons</strong>. A Verified Patron is a user whose physical presence at a venue has been confirmed via real-time GPS verification. Points are earned by "Clocking In" or performing a "Vibe Check" at participating venues.
                    </p>
                    <div className="bg-slate-900/50 border border-slate-700 p-4 rounded-xl">
                        <p className="text-slate-300 text-xs italic">
                            <strong>GPS & Geofencing Disclosure:</strong> OlyBars utilizes real-time GPS verification to ensure League integrity. To "Clock In" or perform a "Vibe Check," users must be physically present within a 100-foot radius of the participating venue. This location data is used solely for point verification and is not stored or shared for advertising purposes.
                        </p>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-black uppercase tracking-wide font-league text-primary">4. Content Usage & Marketing Rights</h2>
                    <p className="text-slate-300 leading-relaxed text-sm">
                        By submitting a "Vibe Check" with the "Marketing Consent" toggle active, users grant OlyBars a non-exclusive right to display the photo on the specific venue's listing page. In exchange, users receive a Premium Point Reward (+20 pts). Standard "Vibe Checks" (+5 pts) are ephemeral and are not stored for public gallery use.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-black uppercase tracking-wide font-league text-primary">5. Disclaimer of Liability</h2>
                    <p className="text-slate-300 leading-relaxed text-sm italic border-l-4 border-slate-700 pl-4">
                        OlyBars provides information about venues and deals "as-is." The "Buzz Clock" prioritizes deals ending soonest, but we do not guarantee the accuracy of happy hour times, venue capacity, or the availability of advertised deals.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-black uppercase tracking-wide font-league text-primary">6. Anti-Gaming, Caps & Cooldowns</h2>
                    <p className="text-slate-300 leading-relaxed text-sm">
                        To maintain a fair League, we enforce strict anti-gaming measures. These include:
                    </p>
                    <ul className="list-disc list-inside text-slate-400 text-sm space-y-2 ml-4">
                        <li><strong>Nightly Caps:</strong> Verified check-ins are strictly limited to two (2) per 12-hour window.</li>
                        <li><strong>Global Cooldown:</strong> All "Vibe Checks" are subject to a 30-minute global cooling-off period.</li>
                        <li><strong>Venue Cooldown:</strong> Users must wait 60 minutes between "Vibe Checks" at the same venue.</li>
                    </ul>
                    <p className="text-slate-300 leading-relaxed text-sm">
                        Employees, managers, and owners are not eligible to earn points or "Clock In" at their own affiliated venues.
                    </p>
                </section>

                <footer className="pt-12 border-t border-white/5 text-center">
                    <p className="text-xs text-slate-600 font-bold uppercase tracking-widest">
                        © 2025 OlyBars.com | Powered by Hannah's Bar & Grill
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default TermsScreen;
