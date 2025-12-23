import React, { useState } from 'react';
import { X, Beer, DollarSign, Heart } from 'lucide-react';
import { useToast } from '../../../components/ui/BrandedToast';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';

interface MakerSurveyModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
}

export const MakerSurveyModal: React.FC<MakerSurveyModalProps> = ({ isOpen, onClose, userId }) => {
    const { showToast } = useToast();
    const [pricePremium, setPricePremium] = useState<string>('');
    const [favMaker, setFavMaker] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!pricePremium) {
            showToast('Please select a price preference.', 'error');
            return;
        }

        setIsSubmitting(true);
        try {
            // 1. Log Survey Result
            await updateDoc(doc(db, 'users', userId), {
                hasCompletedMakerSurvey: true,
                makerSurveyData: {
                    pricePremium,
                    favMaker,
                    timestamp: Date.now()
                }
            });

            showToast('Thanks for supporting local! +50 Bonus Points', 'success');
            onClose();
        } catch (error) {
            console.error(error);
            showToast('Failed to submit survey.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="bg-surface border border-primary/30 w-full max-w-md rounded-2xl p-6 relative shadow-[0_0_50px_rgba(251,191,36,0.15)]">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white">
                    <X className="w-6 h-6" />
                </button>

                <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <Heart className="w-8 h-8 text-primary fill-primary animate-pulse" />
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase font-league mb-2">Local Legend Status</h2>
                    <p className="text-sm text-slate-400">You've visited 3 Artesian Anchors! Help us tune the local economy model.</p>
                </div>

                <div className="space-y-6">
                    {/* Question 1 */}
                    <div className="space-y-3">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            How much extra for "Oly Made"?
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {['$0', '$1', '$2+'].map(opt => (
                                <button
                                    key={opt}
                                    onClick={() => setPricePremium(opt)}
                                    className={`py-3 rounded-lg font-black text-sm uppercase transition-all ${pricePremium === opt ? 'bg-primary text-black' : 'bg-black border border-white/10 text-slate-400'}`}
                                >
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Question 2 */}
                    <div className="space-y-3">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <Beer className="w-4 h-4" />
                            Favorite Local Maker?
                        </label>
                        <input
                            type="text"
                            value={favMaker}
                            onChange={(e) => setFavMaker(e.target.value)}
                            placeholder="e.g. Well 80, Whitewood..."
                            className="w-full bg-black border border-white/10 rounded-lg p-3 text-white placeholder:text-slate-700 font-bold outline-none focus:border-primary"
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full bg-primary text-black font-black py-4 rounded-xl uppercase tracking-widest text-lg shadow-lg hover:shadow-primary/20 transition-all mt-4"
                    >
                        {isSubmitting ? 'Submitting...' : 'Claim 50 Points'}
                    </button>
                </div>
            </div>
        </div>
    );
};
