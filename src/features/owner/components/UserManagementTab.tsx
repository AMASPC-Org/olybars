import React, { useState, useEffect } from 'react';
import { User, Shield, Trash2, Plus, Users, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { Venue, UserProfile } from '../../../types';
import { VenueRole } from '../../../types/auth_schema';
import { fetchVenueMembers, addVenueMember, removeVenueMember } from '../../../services/venueService';

interface UserManagementTabProps {
    venue: Venue;
    onUpdate: (updates: Partial<Venue>) => Promise<void>;
    currentUser: UserProfile;
}

interface VenueMember {
    uid: string;
    email: string;
    displayName?: string;
    role: VenueRole;
    photoURL?: string;
}

export const UserManagementTab: React.FC<UserManagementTabProps> = ({ venue, onUpdate, currentUser }) => {
    const [members, setMembers] = useState<VenueMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState<VenueRole>('staff');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        loadMembers();
    }, [venue.id]);

    const loadMembers = async () => {
        setIsLoading(true);
        try {
            const data = await fetchVenueMembers(venue.id);
            setMembers(data);
        } catch (err) {
            console.error('Failed to load members:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleManagersPermissions = async () => {
        try {
            await onUpdate({ managersCanAddUsers: !venue.managersCanAddUsers });
        } catch (err) {
            console.error('Failed to update venue settings:', err);
        }
    };

    const handleAddMember = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inviteEmail) return;

        setIsSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            await addVenueMember(venue.id, inviteEmail, inviteRole);
            setSuccess(`Successfully added ${inviteEmail} to the team!`);
            setInviteEmail('');
            await loadMembers();
        } catch (err: any) {
            setError(err.message || 'Failed to add member');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveMember = async (memberId: string, memberEmail: string) => {
        if (!window.confirm(`Are you sure you want to remove ${memberEmail} from the team?`)) return;

        try {
            await removeVenueMember(venue.id, memberId);
            await loadMembers();
        } catch (err: any) {
            alert(err.message || 'Failed to remove member');
        }
    };

    const isOwner = venue.ownerId === currentUser.uid || currentUser.role === 'admin' || currentUser.role === 'super-admin';
    const canManageMembers = isOwner || (venue.managersCanAddUsers && members.find(m => m.uid === currentUser.uid)?.role === 'manager');

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header & Settings */}
            <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-black text-white uppercase tracking-wider text-sm">Team Permissions</h3>
                            <p className="text-[11px] text-slate-400">Configure who can manage {venue.name}</p>
                        </div>
                    </div>

                    {isOwner && (
                        <div className="flex items-center gap-3 bg-slate-800/50 px-4 py-2 rounded-xl border border-white/5">
                            <span className="text-[10px] font-bold text-slate-300 uppercase">Managers can add users</span>
                            <button
                                onClick={handleToggleManagersPermissions}
                                className={`w-10 h-5 rounded-full transition-colors relative ${venue.managersCanAddUsers ? 'bg-primary' : 'bg-slate-600'}`}
                            >
                                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-transform ${venue.managersCanAddUsers ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Add Member Form */}
                {canManageMembers && (
                    <form onSubmit={handleAddMember} className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-white/5 pt-6">
                        <div className="md:col-span-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder="name@venue.com"
                                    className="w-full bg-slate-800 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:border-primary outline-none transition-all"
                                    required
                                />
                            </div>
                        </div>

                        <div className="md:col-span-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Assigned Role</label>
                            <select
                                value={inviteRole}
                                onChange={(e) => setInviteRole(e.target.value as VenueRole)}
                                className="w-full bg-slate-800 border border-white/5 rounded-xl py-3 px-4 text-sm text-white focus:border-primary outline-none appearance-none transition-all"
                            >
                                <option value="staff">Staff (Operational Only)</option>
                                <option value="manager">Manager (Management Access)</option>
                            </select>
                        </div>

                        <div className="flex flex-col justify-end">
                            <button
                                type="submit"
                                disabled={isSubmitting || !inviteEmail}
                                className="bg-primary hover:bg-primary-hover disabled:bg-slate-700 disabled:text-slate-500 text-black font-black uppercase tracking-widest text-[10px] py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                                ) : (
                                    <Plus className="w-4 h-4" />
                                )}
                                Add to Team
                            </button>
                        </div>
                    </form>
                )}

                {error && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-[11px] font-medium animate-in fade-in slide-in-from-top-1">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3 text-green-500 text-[11px] font-medium animate-in fade-in slide-in-from-top-1">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                        {success}
                    </div>
                )}
            </div>

            {/* Team List */}
            <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
                <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white">
                        <Users className="w-4 h-4" />
                        <span className="text-xs font-black uppercase tracking-widest">Active Team</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 px-2 py-1 bg-slate-800 rounded-lg">{members.length} Members</span>
                </div>

                <div className="divide-y divide-white/5">
                    {members.length === 0 ? (
                        <div className="p-12 text-center">
                            <Users className="w-8 h-8 text-slate-700 mx-auto mb-3" />
                            <p className="text-slate-500 text-xs font-medium">No team members added yet.</p>
                        </div>
                    ) : (
                        members.map((member) => (
                            <div key={member.uid} className="px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center overflow-hidden">
                                        {member.photoURL ? (
                                            <img src={member.photoURL} alt={member.displayName || member.email} className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-5 h-5 text-slate-600" />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="text-[13px] font-bold text-white leading-none mb-1">
                                            {member.displayName || member.email.split('@')[0]}
                                        </h4>
                                        <p className="text-[11px] text-slate-500 font-medium">{member.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${member.role === 'owner'
                                            ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                                            : member.role === 'manager'
                                                ? 'bg-primary/10 text-primary border-primary/20'
                                                : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                        }`}>
                                        {member.role}
                                    </div>

                                    {canManageMembers && member.uid !== currentUser.uid && member.role !== 'owner' && (
                                        <button
                                            onClick={() => handleRemoveMember(member.uid, member.email)}
                                            className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
