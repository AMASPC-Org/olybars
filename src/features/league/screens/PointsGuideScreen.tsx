import React from 'react';
import { ChevronLeft, Zap, Target, Camera, Share2, Award, Info, Sparkles, Trophy, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PointsGuideScreen: React.FC = () => {
    const navigate = useNavigate();

    const activities = [
        {
            category: 'Core Actions',
            items: [
                {
                    name: 'Clock In',
                    points: '10 pts',
                    desc: 'Clock in when you arrive. Maker venues (Well 80, Matchless, etc.) pay double points!',
                    icon: Target,
                    color: 'bg-blue-500/20 text-blue-400'
                },
                {
                    name: 'Vibe Check',
                    points: '5 pts',
                    desc: 'Confirm the current energy (Dead, Chill, Lively, etc.) for the city map and homepage.',
                    icon: Zap,
                    color: 'bg-primary/20 text-primary'
                }
            ]
        },
        {
            category: 'Multipliers & Bonuses',
            items: [
                {
                    name: 'Marketing Consent',
                    points: '+15 pts',
                    desc: 'Share your vibe photo and allow the venue to use it for social/marketing. High-impact support.',
                    icon: Star,
                    color: 'bg-gold-500/20 text-gold-400'
                },
                {
                    name: 'Game Vibe Check',
                    points: '+2 pts',
                    desc: 'Update the live status (Open/Taken) for Pool, Darts, or Shuffleboard. (Max +10 bonus)',
                    icon: Target,
                    color: 'bg-green-500/20 text-green-400'
                },
            ]
        },
        {
            category: 'Social Rewards',
            items: [
                {
                    name: 'Social Share Bounty',
                    points: '5 pts',
                    desc: 'Share your vibe receipt to Twitter or Facebook. Spread the 98501 spirit.',
                    icon: Share2,
                    color: 'bg-pink-500/20 text-pink-400'
                }
            ]
        },
        {
            category: 'Achievements',
            items: [
                {
                    name: 'Badge Unlock',
                    points: '100 - 500 pts',
                    desc: 'Complete specific sets like the "Warehouse Warrior" or "Lager Legend".',
                    icon: Award,
                    color: 'bg-yellow-500/20 text-yellow-400'
                }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-background text-white p-6 pb-24 font-body overflow-x-hidden">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-primary mb-8 hover:opacity-80 transition-opacity uppercase font-black tracking-widest text-xs"
            >
                <ChevronLeft className="w-4 h-4" />
                Back
            </button>

            <div className="max-w-2xl mx-auto">
                <header className="mb-12">
                    <div className="flex items-center gap-3 mb-2">
                        <Trophy className="w-6 h-6 text-primary" />
                        <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px]">Incentive Protocol</span>
                    </div>
                    <h1 className="text-5xl font-black uppercase tracking-tighter font-league italic leading-none">
                        THE LEAGUE <span className="text-primary block">POINT SYSTEM</span>
                    </h1>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-4 leading-relaxed">
                        Earn Season Points for every contribution. Rise through the standings, unlock exclusive perks, and prove your dedication to the 98501.
                    </p>
                </header>

                <div className="space-y-12">
                    {activities.map((group) => (
                        <section key={group.category}>
                            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 mb-6 flex items-center gap-3">
                                {group.category}
                                <div className="h-px flex-1 bg-white/5" />
                            </h2>
                            <div className="grid gap-4">
                                {group.items.map((item) => (
                                    <div key={item.name} className="bg-slate-900/50 border border-white/5 p-6 rounded-3xl group hover:border-primary/20 transition-all">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className={`${item.color} p-3 rounded-2xl`}>
                                                <item.icon className="w-6 h-6" />
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xl font-black font-league text-white uppercase italic tracking-tight">{item.points}</div>
                                                <div className="text-[10px] font-black text-primary uppercase tracking-widest">XP Granted</div>
                                            </div>
                                        </div>
                                        <h3 className="font-league font-black text-lg uppercase tracking-tight text-white mb-2">{item.name}</h3>
                                        <p className="text-xs text-slate-400 font-medium leading-relaxed">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>

                <div className="mt-16 bg-primary/10 border-2 border-primary/20 p-8 rounded-[2rem] relative overflow-hidden">
                    <Sparkles className="absolute -right-4 -top-4 w-24 h-24 text-primary/10 rotate-12" />
                    <h3 className="text-2xl font-black uppercase tracking-tighter font-league mb-2">Why Earn Points?</h3>
                    <p className="text-sm text-slate-300 font-medium mb-6 leading-relaxed">
                        Points determine your rank in the <span className="text-primary font-bold italic">OlyBars Season Standings</span>. High-ranking members get first access to limited releases, exclusive League merchandise, and invitations to private Artesian parties.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {['Limited Merch', 'Event Invites', 'Early Access', 'Status'].map(tag => (
                            <span key={tag} className="bg-black/40 text-[10px] font-black uppercase tracking-widest text-primary px-3 py-1.5 rounded-full border border-primary/20">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                <footer className="mt-16 pt-12 border-t border-white/5 text-center">
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest leading-loose">
                        Point values are subject to League governance.<br />
                        Abuse of the Pulse system leads to disqualification.
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default PointsGuideScreen;
