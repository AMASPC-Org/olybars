import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, MessageCircle, ChevronLeft, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { manualFAQs, FAQItem } from '../../../data/manual';
import { SEO } from '../../../components/common/SEO';

const FAQScreen: React.FC = () => {
    const navigate = useNavigate();
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const [faqs, setFaqs] = useState<FAQItem[]>(manualFAQs);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        const fetchFaqs = async () => {
            try {
                const q = query(collection(db, 'knowledge'), where('type', '==', 'faq'));
                const querySnapshot = await getDocs(q);
                if (!querySnapshot.empty) {
                    const fetchedFaqs: FAQItem[] = [];
                    querySnapshot.forEach((doc) => {
                        const data = doc.data();
                        fetchedFaqs.push({
                            question: data.question,
                            answer: data.answer,
                            category: data.category
                        });
                    });
                    // Merge and unique by question
                    setFaqs((prev: FAQItem[]) => {
                        const combined = [...prev, ...fetchedFaqs];
                        const unique = Array.from(new Map(combined.map(item => [item.question, item])).values());
                        return unique;
                    });
                }
            } catch (error) {
                console.error("Error fetching FAQs:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchFaqs();
    }, []);

    const getFAQSchema = () => {
        if (faqs.length === 0) return null;

        const faqSchema = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map((item: FAQItem) => ({
                "@type": "Question",
                "name": item.question,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": item.answer
                }
            }))
        };

        const breadcrumbSchema = {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": "https://olybars.com/"
                },
                {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "Manual",
                    "item": "https://olybars.com/faq"
                }
            ]
        };

        return [faqSchema, breadcrumbSchema];
    };

    return (
        <div className="min-h-screen bg-background text-white p-6 pb-24 font-body">
            <SEO
                title="The Manual (FAQ)"
                description="Everything you need to know about OlyBars, the Artesian Bar League, and Thurston County nightlife protocol."
                jsonLd={getFAQSchema()}
            />
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-primary mb-8 hover:opacity-80 transition-opacity uppercase font-black tracking-widest text-xs"
            >
                <ChevronLeft className="w-4 h-4" />
                Back
            </button>

            <div className="max-w-2xl mx-auto space-y-8">
                <header className="flex flex-col items-center gap-4 mb-4 text-center">
                    <div className="bg-primary/20 p-3 rounded-2xl">
                        <HelpCircle className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter font-league text-white leading-none">THE <span className="text-primary">MANUAL</span></h1>
                        <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-2 px-1">
                            Operational Protocol v1.2.0
                        </p>
                    </div>

                    {/* Quick Actions Bar */}
                    <div className="flex gap-3 mt-4">
                        <button
                            onClick={() => navigate('/glossary')}
                            className="bg-slate-900 border border-white/10 px-6 py-2.5 rounded-full flex items-center gap-2 hover:border-primary/50 transition-all hover:bg-slate-800"
                        >
                            <Info className="w-3.5 h-3.5 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-white">Glossary</span>
                        </button>
                        <a
                            href="mailto:support@amaspc.com?subject=OlyBars Support Request"
                            className="bg-slate-900 border border-white/10 px-6 py-2.5 rounded-full flex items-center gap-2 hover:border-primary/50 transition-all hover:bg-slate-800"
                        >
                            <MessageCircle className="w-3.5 h-3.5 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-white">Support</span>
                        </a>
                    </div>
                </header>

                <div className="relative mb-8">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                        <div className="w-full border-t border-white/5"></div>
                    </div>
                    <div className="relative flex justify-center">
                        <span className="px-3 bg-background text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">Reference Database</span>
                    </div>
                </div>

                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Retrieving Intelligence...</p>
                        </div>
                    ) : faqs.length > 0 ? (
                        faqs.map((item: FAQItem, idx: number) => {
                            const showCategory = idx === 0 || faqs[idx - 1].category !== item.category;
                            return (
                                <React.Fragment key={idx}>
                                    {showCategory && item.category && (
                                        <div className="pt-6 pb-2">
                                            <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] px-1">{item.category}</h3>
                                        </div>
                                    )}
                                    <div
                                        className="bg-surface border border-white/10 rounded-2xl overflow-hidden transition-all duration-300"
                                    >
                                        <button
                                            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                                            className="w-full p-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                                        >
                                            <span className="text-sm font-black uppercase tracking-tight font-league">{item.question}</span>
                                            {openIndex === idx ? <ChevronUp className="w-5 h-5 text-primary" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                                        </button>

                                        {openIndex === idx && (
                                            <div className="px-5 pb-5 animate-in fade-in slide-in-from-top-2 duration-300">
                                                <p className="text-sm text-slate-400 leading-relaxed font-body">
                                                    {item.answer}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </React.Fragment>
                            );
                        })
                    ) : (
                        <div className="text-center py-12 bg-slate-900 rounded-3xl border border-dashed border-white/10">
                            <p className="text-xs font-black uppercase tracking-widest text-slate-500">The Manual is currently offline.</p>
                        </div>
                    )}
                </div>

                <div className="mt-12 bg-primary/10 border-2 border-primary/20 p-6 rounded-3xl text-center">
                    <MessageCircle className="w-10 h-10 text-primary mx-auto mb-4" />
                    <h3 className="text-xl font-black uppercase tracking-tight font-league mb-2">Still Thirsty for Answers?</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wide mb-6">Artie is our 24/7 AI Concierge.</p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-primary text-black font-black px-8 py-4 rounded-xl uppercase tracking-widest text-xs hover:bg-yellow-400 transition-all active:scale-95 shadow-lg shadow-primary/20"
                    >
                        Ask Artie Now
                    </button>
                </div>

                <footer className="pt-12 text-center">
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest leading-loose">
                        Brewed in the shadow of the Capitol.<br />
                        Tapped from the Artesian Well.
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default FAQScreen;
