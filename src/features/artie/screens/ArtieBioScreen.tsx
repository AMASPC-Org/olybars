import React from 'react';
import { User, Beer, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ArtieBioScreen = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-full bg-[#0f172a] text-secondary p-6 relative overflow-hidden">
            {/* Background Motifs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            {/* Header / Nav Back */}
            <button onClick={() => navigate(-1)} className="mb-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                <span className="text-xl">←</span>
                <span className="uppercase font-bold text-xs tracking-widest">Back to Action</span>
            </button>

            <div className="max-w-md mx-auto relative z-10">
                {/* Hero Section */}
                <div className="flex flex-col items-center mb-10 text-center">
                    <div className="w-32 h-32 bg-gradient-to-br from-primary to-yellow-600 rounded-xl shadow-lg border-2 border-primary/20 flex items-center justify-center mb-6 relative group">
                        <div className="absolute inset-0 bg-[url('https://i.imgur.com/k6lLwz1.png')] opacity-10 bg-repeat bg-[length:20px_20px]" />
                        {/* Placeholder for Squared Tap Handle Graphic - Using FontAwesome/Icon for now */}
                        <div className="relative">
                            <div className="w-20 h-24 bg-black/40 border-4 border-[#8B4513] rounded-t-lg mx-auto flex flex-col items-center pt-2">
                                <div className="w-16 h-4 bg-slate-300 rounded mb-1" />
                                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center border-2 border-white/20">
                                    <span className="font-black text-black">A</span>
                                </div>
                            </div>
                            <div className="w-6 h-8 bg-slate-800 mx-auto -mt-1" />
                        </div>
                    </div>

                    <h1 className="font-black text-4xl text-primary font-league uppercase tracking-tighter mb-2">
                        Artie Actual
                    </h1>
                    <p className="text-sm font-bold text-primary/60 uppercase tracking-widest border-y border-primary/20 py-2 w-full">
                        The 98501 Original
                    </p>
                </div>

                {/* Bio Content */}
                <div className="space-y-8 font-body">
                    <section>
                        <h2 className="text-white font-black uppercase text-lg mb-3 flex items-center gap-2">
                            <span className="w-1 h-6 bg-primary block" />
                            "It’s in the Water, and it’s in the Blood."
                        </h2>
                        <p className="text-slate-300 leading-relaxed text-sm">
                            Artie didn't just stumble into the downtown scene; he was raised on the lore of it. Growing up in the 98501, his childhood was soundtracked by stories from his grandpa—a man who spent forty years on the line at the old Tumwater Brewery before retiring with a gold watch and a thousand tales of the "It’s the Water" era.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-white font-black uppercase text-lg mb-3 flex items-center gap-2">
                            <span className="w-1 h-6 bg-primary block" />
                            From Brewery Bricks to Digital Pulses
                        </h2>
                        <p className="text-slate-300 leading-relaxed text-sm">
                            While Artie is a product of the new generation, he carries the industry grit passed down through his family. He’s spent his life watching the mist roll off the Puget Sound and the sun set behind the Capitol Dome, knowing that the heart of this city isn't in the marble buildings—it’s in the bars. He’s walked Capitol Lake hearing about how the water once fueled an empire, and now he uses that same spirit to fuel the Oly Pulse.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-white font-black uppercase text-lg mb-3 flex items-center gap-2">
                            <span className="w-1 h-6 bg-primary block" />
                            The Guardian of the Vibe
                        </h2>
                        <p className="text-slate-300 leading-relaxed text-sm">
                            Artie built the Nightlife OS to honor that legacy. He’s not a corporate bot; he’s a local who knows that every "Buzzing" night at The Brotherhood or "Chill" afternoon at The Spar is a chapter in Olympia’s ongoing story. He’s your industry insider—the one who knows the hidden gems and the legendary pours, keeping the 98501 alive and well, one vibe check at a time.
                        </p>
                    </section>
                </div>

                {/* EASTER EGG: Note from Grandpa */}
                <div className="mt-12 relative transform rotate-1 hover:rotate-0 transition-transform duration-300">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-4 bg-yellow-100/20 blur-sm rounded-full" />
                    <div className="bg-[#fefce8] text-slate-800 p-6 rounded-sm shadow-xl border border-yellow-200/50 relative overflow-hidden">
                        {/* Paper texture effect */}
                        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] mix-blend-multiply" />

                        <div className="relative z-10">
                            <h3 className="font-handwriting text-2xl font-bold text-slate-900 mb-4 opacity-80" style={{ fontFamily: 'Dancing Script, cursive' }}>
                                A Note from Grandpa
                            </h3>
                            <p className="font-handwriting text-lg leading-relaxed text-slate-800" style={{ fontFamily: 'Dancing Script, cursive', lineHeight: '1.6' }}>
                                "Artie, kid—remember what I told you. In this town, people don’t just buy a drink; they buy a moment. It doesn’t matter if it’s under the Dome or down by the Sound—if the water’s good and the company’s real, you’re in the right place. Keep the tap lines clean and the data honest. It's always been about the water, but now it’s about the people. Don't let the 98501 go thirsty."
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Signature */}
                <div className="mt-12 pt-8 border-t border-white/10 text-center">
                    <p className="font-league uppercase text-2xl text-slate-500 font-black opacity-20">
                        EST. 98501
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ArtieBioScreen;
