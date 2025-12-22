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
                    <h2 className="text-xl font-black uppercase tracking-wide font-league text-primary">3. The Olympia Bar League</h2>
                    <p className="text-slate-300 leading-relaxed text-sm">
                        Membership in the Olympia Bar League (OBL) is a privilege. Points are earned by "Clocking In" at participating venues, which requires verified physical proximity (geofencing). Check-ins are strictly limited to two (2) per 12-hour window. Points have no monetary value.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-black uppercase tracking-wide font-league text-primary">4. User Content</h2>
                    <p className="text-slate-300 leading-relaxed text-sm">
                        When you post "Vibe Photos" or check-ins, you grant OlyBars a non-exclusive, royalty-free license to use that content for promotional purposes. Content must not be illegal, obscene, or threatening.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-black uppercase tracking-wide font-league text-primary">5. Disclaimer of Liability</h2>
                    <p className="text-slate-300 leading-relaxed text-sm italic border-l-4 border-slate-700 pl-4">
                        OlyBars provides information about venues and deals "as-is." The "Buzz Clock" prioritizes deals ending soonest, but we do not guarantee the accuracy of happy hour times, venue capacity, or the availability of advertised deals.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-black uppercase tracking-wide font-league text-primary">6. Fair Play & Eligibility</h2>
                    <p className="text-slate-300 leading-relaxed text-sm">
                        To maintain a fair League, employees, managers, and owners are not eligible to earn points or "Clock In" at their own affiliated venues. Additionally, verified check-ins are subject to a 120-minute global cooling-off period and a 360-minute cooling-off period for checking into the same venue.
                    </p>
                </section>

                <footer className="pt-12 border-t border-white/5 text-center">
                    <p className="text-xs text-slate-600 font-bold uppercase tracking-widest">
                        © 2025 OlyBars.com | Powered by Well 80
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default TermsScreen;
