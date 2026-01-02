import React, { useState } from 'react';
import { ShieldCheck, Info, Wine, Share2, X, Check } from 'lucide-react';

interface SoberPledgeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export const SoberPledgeModal: React.FC<SoberPledgeModalProps> = ({ isOpen, onClose, onConfirm }) => {
    const [certified, setCertified] = useState(false);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />

            <div className="relative w-full max-w-lg bg-[#0f172a] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="p-8 pb-0 flex justify-between items-start">
                    <div className="flex gap-4">
                        <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center">
                            <ShieldCheck className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white uppercase font-league leading-tight">Are you truly<br />Sober Friendly?</h2>
                            <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest italic">A promise to your guests</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-500 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    <p className="text-sm text-slate-300 leading-relaxed font-medium">
                        This badge is a promise to your guests. To activate it, you must meet all three criteria:
                    </p>

                    {/* Pillars */}
                    <div className="space-y-4">
                        <div className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center shrink-0">
                                <Info className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-1">1. The Inventory Rule</h4>
                                <p className="text-xs text-slate-400 leading-tight">Stock at least 2 distinct NA options beyond soda/water (e.g., NA Beer, Kombucha, Mocktail menu).</p>
                            </div>
                        </div>

                        <div className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                            <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center shrink-0">
                                <Wine className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-1">2. The Glassware Rule</h4>
                                <p className="text-xs text-slate-400 leading-tight">Serve NA drinks in the same premium glassware as alcohol. No plastic cups for designated drivers.</p>
                            </div>
                        </div>

                        <div className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                            <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center shrink-0">
                                <Share2 className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                                <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-1">3. The Vibe Rule</h4>
                                <p className="text-xs text-slate-400 leading-tight">Staff does not pressure guests to drink alcohol or make them feel less valued for choosing NA.</p>
                            </div>
                        </div>
                    </div>

                    {/* Warning */}
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4">
                        <p className="text-[9px] text-amber-500 font-bold uppercase tracking-widest leading-relaxed">
                            <span className="text-amber-400">⚠️ Accountability:</span> Users can flag venues that do not meet these standards. Multiple reports will result in automatic badge removal.
                        </p>
                    </div>

                    {/* Checkbox */}
                    <label className="flex items-center gap-4 cursor-pointer group bg-black/40 p-5 rounded-2xl border border-white/5 hover:border-primary/30 transition-all">
                        <div className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-all ${certified ? 'bg-primary border-primary rotate-0' : 'border-slate-600 bg-transparent rotate-45 group-hover:rotate-0'}`}>
                            {certified && <Check className="w-4 h-4 text-black font-bold" />}
                        </div>
                        <input
                            type="checkbox"
                            className="hidden"
                            checked={certified}
                            onChange={(e) => setCertified(e.target.checked)}
                        />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">I certify that my venue meets these standards.</span>
                    </label>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={onClose}
                            className="flex-1 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={!certified}
                            onClick={onConfirm}
                            className="flex-1 py-4 bg-primary text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-30 disabled:grayscale disabled:scale-100"
                        >
                            Confirm Badge
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
