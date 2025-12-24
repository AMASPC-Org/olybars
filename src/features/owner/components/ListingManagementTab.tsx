import React, { useState } from 'react';
import {
    Info, Phone, Globe, Instagram, Facebook, Twitter,
    Save, Clock, MapPin, Mail, ChevronRight
} from 'lucide-react';
import { Venue } from '../../../types';
import { updateVenueDetails } from '../../../services/venueService';
import { useToast } from '../../../components/ui/BrandedToast';

interface ListingManagementTabProps {
    venue: Venue;
    onUpdate: (venueId: string, updates: Partial<Venue>) => void;
}

export const ListingManagementTab: React.FC<ListingManagementTabProps> = ({ venue, onUpdate }) => {
    const { showToast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState<Partial<Venue>>({
        description: venue.description || '',
        hours: typeof venue.hours === 'string' ? venue.hours : 'Standard Hours',
        phone: venue.phone || '',
        email: venue.email || '',
        website: venue.website || '',
        instagram: venue.instagram || '',
        facebook: venue.facebook || '',
        twitter: venue.twitter || '',
        vibe: venue.vibe || '',
        originStory: venue.originStory || '',
        geoLoop: venue.geoLoop,
        isLowCapacity: venue.isLowCapacity || false,
        isSoberFriendly: venue.isSoberFriendly || false
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const result = await updateVenueDetails(venue.id, formData);
            if (result.success) {
                onUpdate(venue.id, formData);
                showToast('VENUE LISTING UPDATED SUCCESSFULLY', 'success');
            }
        } catch (error) {
            showToast('FAILED TO UPDATE LISTING', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const InputField = ({ label, name, value, icon: Icon, placeholder, type = "text" }: any) => (
        <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{label}</label>
            <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-primary transition-colors">
                    <Icon className="w-4 h-4" />
                </div>
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-slate-100 placeholder:text-slate-800 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all font-medium"
                />
            </div>
        </div>
    );

    return (
        <div className="space-y-8 pb-12">
            {/* Vibe & Description Section */}
            <section className="space-y-6">
                <div>
                    <h3 className="text-xl font-black text-white uppercase font-league leading-none">CORE IDENTITY</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest italic">Define your venue's personality</p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    <InputField
                        label="The Vibe (Short Tagline)"
                        name="vibe"
                        value={formData.vibe}
                        icon={Info}
                        placeholder="Ex: Cozy Craft Beer & Artisinal Pizza"
                    />

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">About Your Establishment</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Tell the league what makes your spot legendary..."
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-sm text-slate-100 placeholder:text-slate-800 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all font-medium resize-none"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Origin Story (Market Audit Requirement)</label>
                        <textarea
                            name="originStory"
                            value={(formData as any).originStory || ''}
                            onChange={handleChange}
                            rows={5}
                            placeholder="Tell the story of how you started. This is prioritized in the new schema."
                            className="w-full bg-blue-900/10 border border-primary/30 rounded-xl py-3 px-4 text-sm text-blue-100 placeholder:text-blue-900/50 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all font-medium resize-none"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Insider Vibe (2 Sentences)</label>
                        <textarea
                            name="insiderVibe"
                            value={(formData as any).insiderVibe || ''}
                            onChange={handleChange}
                            rows={2}
                            placeholder="The Council's Micro Reality Check..."
                            className="w-full bg-blue-900/10 border border-primary/30 rounded-xl py-3 px-4 text-sm text-blue-100 placeholder:text-blue-900/50 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all font-medium resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Maker Type</label>
                            <div className="relative group">
                                <Info className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 w-4 h-4" />
                                <select
                                    name="makerType"
                                    value={(formData as any).makerType || ''}
                                    onChange={(e: any) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-slate-100 focus:border-primary/50 outline-none appearance-none cursor-pointer"
                                >
                                    <option value="" className="bg-black text-slate-500">Not a Maker</option>
                                    <option value="Brewery" className="bg-black">Brewery</option>
                                    <option value="Distillery" className="bg-black">Distillery</option>
                                    <option value="Cidery" className="bg-black">Cidery</option>
                                    <option value="Winery" className="bg-black">Winery</option>
                                </select>
                                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 w-4 h-4 rotate-90" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 justify-end pb-2">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${(formData as any).physicalRoom !== false ? 'bg-primary border-primary' : 'border-slate-600 bg-transparent'}`}>
                                    {(formData as any).physicalRoom !== false && <ChevronRight className="w-3 h-3 text-black font-bold" />}
                                </div>
                                <input
                                    type="checkbox"
                                    name="physicalRoom"
                                    checked={(formData as any).physicalRoom !== false}
                                    onChange={e => setFormData(prev => ({ ...prev, physicalRoom: e.target.checked }))}
                                    className="hidden"
                                />
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">Has Taproom (Physical)</span>
                            </label>

                            {/* Visual Helper for Production Only */}
                            {(formData as any).physicalRoom === false && (
                                <p className="text-[9px] text-amber-500 font-bold uppercase tracking-widest ml-1 animate-pulse">
                                    Marked as "Production Only" - Scavenger Hunt Mode Active
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">The Loop Strategy</label>
                            <div className="relative group">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 w-4 h-4" />
                                <select
                                    name="geoLoop"
                                    value={(formData as any).geoLoop || ''}
                                    onChange={(e: any) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-slate-100 focus:border-primary/50 outline-none appearance-none cursor-pointer"
                                >
                                    <option value="" className="bg-black text-slate-500">Select a Loop...</option>
                                    <option value="Downtown_Walkable" className="bg-black">Downtown Walkable</option>
                                    <option value="Warehouse_Tumwater" className="bg-black">Warehouse Loop (Tumwater)</option>
                                    <option value="Destination_Quest" className="bg-black">Destination Quest</option>
                                </select>
                                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 w-4 h-4 rotate-90" />
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 justify-end pb-2">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${(formData as any).isLowCapacity ? 'bg-primary border-primary' : 'border-slate-600 bg-transparent'}`}>
                                    {(formData as any).isLowCapacity && <ChevronRight className="w-3 h-3 text-black font-bold" />}
                                </div>
                                <input type="checkbox" name="isLowCapacity" checked={(formData as any).isLowCapacity || false} onChange={e => setFormData(prev => ({ ...prev, isLowCapacity: e.target.checked }))} className="hidden" />
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">Low Capacity Warning</span>
                            </label>

                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${(formData as any).isSoberFriendly ? 'bg-primary border-primary' : 'border-slate-600 bg-transparent'}`}>
                                    {(formData as any).isSoberFriendly && <ChevronRight className="w-3 h-3 text-black font-bold" />}
                                </div>
                                <input type="checkbox" name="isSoberFriendly" checked={(formData as any).isSoberFriendly || false} onChange={e => setFormData(prev => ({ ...prev, isSoberFriendly: e.target.checked }))} className="hidden" />
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">Sober Friendly</span>
                            </label>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact & Hours Section */}
            <section className="space-y-6">
                <div>
                    <h3 className="text-xl font-black text-white uppercase font-league leading-none">BUSINESS INFO</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest italic">How and when members can visit</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Phone Number" name="phone" value={formData.phone} icon={Phone} placeholder="(360) 000-0000" />
                    <InputField label="Public Email" name="email" value={formData.email} icon={Mail} placeholder="info@yourvenue.com" />
                    <InputField label="Website" name="website" value={formData.website} icon={Globe} placeholder="www.yourvenue.com" />
                    <InputField label="Hours of Operation" name="hours" value={formData.hours} icon={Clock} placeholder="Daily 11:30 AM - Midnight" />
                </div>
            </section>

            {/* Social Media Section */}
            <section className="space-y-6">
                <div>
                    <h3 className="text-xl font-black text-white uppercase font-league leading-none">SOCIAL NETWORK</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest italic">Connect with OlyBars members</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Instagram Handle" name="instagram" value={formData.instagram} icon={Instagram} placeholder="@handle" />
                    <InputField label="Facebook Page" name="facebook" value={formData.facebook} icon={Facebook} placeholder="facebook.com/yourvenue" />
                    <InputField label="Twitter / X" name="twitter" value={formData.twitter} icon={Twitter} placeholder="@handle" />
                </div>
            </section>

            {/* Save Button */}
            <div className="pt-4">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full bg-primary text-black font-black py-4 rounded-xl uppercase tracking-[0.2em] font-league text-lg shadow-xl shadow-primary/10 active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all flex items-center justify-center gap-2"
                >
                    {isSaving ? (
                        <>
                            <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                            SYNCING DATA...
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            COMMIT ALL CHANGES
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
