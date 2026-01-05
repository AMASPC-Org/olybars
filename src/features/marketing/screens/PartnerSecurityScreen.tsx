import React from 'react';
import { Lock, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PartnerSecurityScreen: React.FC = () => {
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

            <div className="max-w-3xl mx-auto space-y-8">
                <header className="flex items-center gap-4 mb-12">
                    <div className="bg-primary/20 p-3 rounded-xl">
                        <Lock className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter font-league">PARTNER <span className="text-primary">SECURITY</span></h1>
                        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Protections for Venue Owners & Staff</p>
                    </div>
                </header>

                <section className="space-y-4">
                    <h2 className="text-xl font-black uppercase tracking-wide font-league text-primary">1. Purpose</h2>
                    <p className="text-slate-300 leading-relaxed text-sm">
                        OlyBars.com is designed to protect Venue Partner Confidential Data (menus, pricing strategy, margin flags, internal notes), User Account Data, and Operational Integrity. This document summarizes the controls we use to reduce risk.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-black uppercase tracking-wide font-league text-primary">2. Security Model (Zero Trust)</h2>
                    <ul className="list-disc list-inside text-slate-400 text-sm space-y-2 ml-4">
                        <li><strong>Authenticate:</strong> Prove identity for every user.</li>
                        <li><strong>Authorize:</strong> Prove permission for every action.</li>
                        <li><strong>Validate:</strong> Prevent bad/unsafe data from being stored.</li>
                        <li><strong>Log:</strong> Detect and investigate security-relevant actions.</li>
                        <li><strong>Limit Blast Radius:</strong> Separate public vs private data.</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-black uppercase tracking-wide font-league text-primary">3. Authentication & MFA</h2>
                    <p className="text-slate-300 leading-relaxed text-sm">
                        <strong>Venue Owners:</strong> Multi-Factor Authentication (MFA) is required for venue-owner accounts to separate them from standard user accounts. This reduces the risk of password-based account takeover. We support SMS and Authenticator App verification methods via Firebase Authentication.
                    </p>
                    <p className="text-slate-300 leading-relaxed text-sm mt-2">
                        <strong>Players:</strong> Standard sign-in (Google/Email) with bot resistance and rate-limits.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-black uppercase tracking-wide font-league text-primary">4. Data Separation</h2>
                    <p className="text-slate-300 leading-relaxed text-sm">
                        We rigidly separate data to protect your business intelligence:
                    </p>
                    <ul className="list-disc list-inside text-slate-400 text-sm space-y-2 ml-4">
                        <li><strong>Public Data:</strong> Venue name, address, valid events, public photos.</li>
                        <li><strong>Partner-Private Data:</strong> <code>margin_tier</code>, <code>PartnerConfig</code> (tokens), draft <code>flashBounties</code>, internal notes, and manager lists. <strong>Not readable by players.</strong></li>
                        <li><strong>User-Private Data:</strong> Login emails and profile metadata.</li>
                    </ul>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-black uppercase tracking-wide font-league text-primary">5. AI Assistant ("Artie") Safety</h2>
                    <p className="text-slate-300 leading-relaxed text-sm">
                        Artie's write actions (creating events/deals) are permission-gated and restricted to your venue. All outputs are schema-validated before being written to the database to prevent hallucinations from corrupting your data.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-xl font-black uppercase tracking-wide font-league text-primary">6. Partner Responsibilities</h2>
                    <div className="bg-slate-900/50 border border-slate-700 p-4 rounded-xl">
                        <ul className="list-disc list-inside text-slate-300 text-xs space-y-2">
                            <li>Enable and use MFA consistently.</li>
                            <li>Use a strong, unique password for your email account.</li>
                            <li>Do not share accounts; create individual logins for managers.</li>
                            <li>Remove access promptly when staff leave.</li>
                        </ul>
                    </div>
                </section>

                <footer className="pt-12 border-t border-white/5 text-center">
                    <p className="text-xs text-slate-600 font-bold uppercase tracking-widest">
                        Questions? Contact security@olybars.com
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default PartnerSecurityScreen;
