import React, { useState, useMemo } from 'react';
import {
    Venue,
    MenuItem,
    MenuItemType,
    MenuItemStatus,
    MarginTier,
    MenuSource,
    MenuItemStats
} from '../../../types/venue';
import { VenueOpsService } from '../../../services/VenueOpsService';
import {
    Beer,
    Wine,
    Martini,
    Utensils,
    Plus,
    Search,
    AlertTriangle,
    Check,
    Power,
    Archive,
    Library,
    ArrowUpRight
} from 'lucide-react';


interface MenuManagementTabProps {
    venue: Venue;
    onUpdate: (venueId: string, updates: Partial<Venue>) => void;
    userId?: string;
}

export const MenuManagementTab: React.FC<MenuManagementTabProps> = ({ venue, onUpdate, userId }) => {
    // const { user } = useAuth(); // Removed
    const [activeTab, setActiveTab] = useState<'live' | 'library'>('live');
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize Menu Items
    const [menuItems, setMenuItems] = useState<MenuItem[]>(venue.fullMenu || []);
    const [isLoadingPrivate, setIsLoadingPrivate] = useState(true);

    // Fetch Private Data (Margins)
    React.useEffect(() => {
        const loadPrivate = async () => {
            try {
                const privateData = await VenueOpsService.getPrivateData(venue.id);
                if (privateData && privateData.menuStrategies) {
                    // Merge margin tiers back into menu items
                    const mergedItems = (venue.fullMenu || []).map(item => ({
                        ...item,
                        margin_tier: privateData.menuStrategies[item.id] || MarginTier.Medium
                    }));
                    setMenuItems(mergedItems);
                }
            } catch (err) {
                console.error('Failed to load private data:', err);
            } finally {
                setIsLoadingPrivate(false);
            }
        };
        loadPrivate();
    }, [venue.id, venue.fullMenu]);

    // Form State for New Item
    const [newItem, setNewItem] = useState<Partial<MenuItem>>({
        type: MenuItemType.Hoppy,
        margin_tier: MarginTier.Medium,
        source: MenuSource.Manual,
        status: MenuItemStatus.Library,
        stats: {}
    });

    // --- Actions ---

    const handleToggleStatus = async (item: MenuItem) => {
        const newStatus = item.status === MenuItemStatus.Live ? MenuItemStatus.Library : MenuItemStatus.Live;
        const now = Date.now();

        // 1. Optimistic Update
        const updatedItems = menuItems.map(i =>
            i.id === item.id
                ? { ...i, status: newStatus, last_toggled_at: now }
                : i
        );
        setMenuItems(updatedItems);

        // 2. API Call (Silent)
        try {
            await VenueOpsService.updateVenue(venue.id, { fullMenu: updatedItems }, userId);
            onUpdate(venue.id, { fullMenu: updatedItems });

            // Note: status is public, so no need to update private_data here
        } catch (error) {
            console.error('Failed to toggle item status', error);
            // Revert on failure
            setMenuItems(menuItems);
        }
    };

    const handleAddItem = async () => {
        if (!newItem.name) return;
        setIsSubmitting(true);

        const itemToAdd: MenuItem = {
            id: crypto.randomUUID(),
            name: newItem.name,
            type: newItem.type || MenuItemType.Other,
            description: newItem.description || '',
            stats: newItem.stats || {},
            margin_tier: newItem.margin_tier || MarginTier.Medium,
            source: MenuSource.Manual,
            status: newItem.status || MenuItemStatus.Library,
            ai_tags: [], // Placeholder for future AI
            last_toggled_at: Date.now()
        };

        const updatedItems = [...menuItems, itemToAdd];

        try {
            // 1. Update public venue (menu structure)
            const publicItemsForDb = updatedItems.map(({ margin_tier, ...rest }) => rest);
            await VenueOpsService.updateVenue(venue.id, { fullMenu: publicItemsForDb as any }, userId);

            // 2. Update private venue data (margin tiers)
            const menuStrategies: Record<string, string> = {};
            updatedItems.forEach(item => {
                menuStrategies[item.id] = item.margin_tier;
            });
            await VenueOpsService.updatePrivateData(venue.id, { menuStrategies });

            setMenuItems(updatedItems);
            onUpdate(venue.id, { fullMenu: updatedItems });
            setIsAddModalOpen(false);
            // Reset Form (keep some defaults)
            setNewItem({
                type: newItem.type,
                margin_tier: MarginTier.Medium,
                source: MenuSource.Manual,
                status: MenuItemStatus.Library,
                stats: {}
            });
        } catch (error) {
            console.error('Failed to add item', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- Computed ---

    const filteredItems = useMemo(() => {
        return menuItems.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesTab = activeTab === 'live'
                ? item.status === MenuItemStatus.Live
                : item.status !== MenuItemStatus.Archived; // Show Library + Live in Library view? Or just Library? 
            // "Full Library" usually implies everything. Let's show everything or just Library?
            // User requirement: "Switchboard... Toggle... Live vs Library". 
            // Let's make "Library" view show EVERYTHING for management, and "Live" view show only LIVE.

            if (activeTab === 'live') return item.status === MenuItemStatus.Live && matchesSearch;
            return matchesSearch; // Library shows all
        });
    }, [menuItems, activeTab, searchTerm]);

    // Group by Type
    const groupedItems = useMemo(() => {
        const groups: Record<string, MenuItem[]> = {};
        // Add all types to ensure consistent order
        Object.values(MenuItemType).forEach(type => groups[type] = []);

        filteredItems.forEach(item => {
            if (!groups[item.type]) groups[item.type] = [];
            groups[item.type].push(item);
        });
        return groups;
    }, [filteredItems]);

    // Sorting Types Priority
    const typeOrder = [
        MenuItemType.Crisp, MenuItemType.Hoppy, MenuItemType.Malty, MenuItemType.Dark,
        MenuItemType.Sour, MenuItemType.Cider, MenuItemType.Seltzer,
        MenuItemType.Cocktail, MenuItemType.Wine, MenuItemType.Food, MenuItemType.Other
    ];

    // --- Render Components ---

    const getTypeIcon = (type: MenuItemType) => {
        switch (type) {
            case MenuItemType.Crisp:
            case MenuItemType.Hoppy:
            case MenuItemType.Malty:
            case MenuItemType.Dark:
            case MenuItemType.Sour:
            case MenuItemType.Cider:
            case MenuItemType.Seltzer: return <Beer size={18} />;
            case MenuItemType.Cocktail: return <Martini size={18} />;
            case MenuItemType.Wine: return <Wine size={18} />;
            case MenuItemType.Food: return <Utensils size={18} />;
            default: return <Beer size={18} />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header & Controls */}
            <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black text-white italic tracking-tighter">THE MENU</h2>
                        <p className="text-sm text-slate-400">Manage your taps, bottles, and bites.</p>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-primary text-black px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-yellow-400 transition-colors"
                    >
                        <Plus size={18} />
                        ADD ITEM
                    </button>
                </div>

                {/* Tabs & Search */}
                <div className="flex gap-4 items-center bg-slate-800/50 p-1 rounded-xl w-full sm:w-auto self-start">
                    <button
                        onClick={() => setActiveTab('live')}
                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'live' ? 'bg-primary text-black shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        LIVE NOW
                    </button>
                    <button
                        onClick={() => setActiveTab('library')}
                        className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${activeTab === 'library' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        FULL LIBRARY
                    </button>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search menu..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-primary"
                    />
                </div>
            </div>

            {/* Menu List (Accordions) */}
            <div className="space-y-4">
                {typeOrder.map(type => {
                    const items = groupedItems[type];
                    if (items.length === 0) return null;

                    return (
                        <div key={type} className="bg-slate-800/40 rounded-xl overflow-hidden border border-slate-800">
                            <div className="px-4 py-3 bg-slate-800 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-primary">
                                    {getTypeIcon(type as MenuItemType)}
                                    <h3 className="font-black uppercase tracking-wide">{type} <span className="text-slate-500 ml-2 text-xs font-mono">({items.length})</span></h3>
                                </div>
                            </div>
                            <div className="divide-y divide-slate-800">
                                {items.map(item => (
                                    <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-bold text-white text-lg">{item.name}</h4>
                                                {item.stats.abv && parseFloat(item.stats.abv.toString()) > 8.0 && (
                                                    <span className="bg-red-500/20 text-red-400 text-[10px] font-black px-1.5 py-0.5 rounded flex items-center gap-1 border border-red-500/30">
                                                        <AlertTriangle size={10} />
                                                        {item.stats.abv}% ABV
                                                    </span>
                                                )}
                                                {item.margin_tier === MarginTier.High && (
                                                    <span className="bg-green-500/20 text-green-400 text-[10px] font-black px-1.5 py-0.5 rounded border border-green-500/30">
                                                        $$$
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-400 line-clamp-1">{item.description || 'No description'}</p>
                                            <div className="mt-2 flex gap-3 text-xs font-mono text-slate-500">
                                                {item.stats.price && <span className="text-slate-300">{item.stats.price}</span>}
                                                {type !== MenuItemType.Food && item.stats.abv && <span>{item.stats.abv}% ABV</span>}
                                                {item.stats.ibu && <span>{item.stats.ibu} IBU</span>}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-4">
                                            <div className="text-right hidden sm:block">
                                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${item.status === MenuItemStatus.Live
                                                    ? 'bg-primary/20 text-primary'
                                                    : 'bg-slate-700 text-slate-400'
                                                    }`}>
                                                    {item.status === MenuItemStatus.Live ? 'ON TAP' : 'LIBRARY'}
                                                </span>
                                            </div>

                                            {/* Toggle Switch */}
                                            <button
                                                onClick={() => handleToggleStatus(item)}
                                                className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 flex items-center ${item.status === MenuItemStatus.Live ? 'bg-primary' : 'bg-slate-700'
                                                    }`}
                                            >
                                                <div className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 ${item.status === MenuItemStatus.Live ? 'translate-x-6' : 'translate-x-0'
                                                    }`}>
                                                    {item.status === MenuItemStatus.Live && <Power size={14} className="text-primary m-1" />}
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Empty State */}
            {filteredItems.length === 0 && (
                <div className="p-12 text-center text-slate-500 bg-slate-900/50 rounded-2xl border border-dashed border-slate-800">
                    <Library size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="font-bold mb-2">No items found</p>
                    <p className="text-sm">Try adjusting your search or add a new item.</p>
                </div>
            )}

            {/* Add Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-black italic text-white">ADD NEW ITEM</h3>
                                <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">Close</button>
                            </div>

                            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                                {/* Basics */}
                                <div>
                                    <label className="text-xs font-bold text-slate-400 mb-1 block">NAME</label>
                                    <input
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
                                        placeholder="e.g. Space Dust IPA"
                                        value={newItem.name || ''}
                                        onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 mb-1 block">TYPE</label>
                                        <select
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
                                            value={newItem.type}
                                            onChange={e => setNewItem({ ...newItem, type: e.target.value as MenuItemType })}
                                        >
                                            {Object.values(MenuItemType).map(t => (
                                                <option key={t} value={t}>{t}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 mb-1 block">PRICE</label>
                                        <input
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
                                            placeholder="$7"
                                            value={newItem.stats?.price || ''}
                                            onChange={e => setNewItem({ ...newItem, stats: { ...newItem.stats, price: e.target.value } })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-400 mb-1 block">DESCRIPTION (Max 140)</label>
                                    <textarea
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
                                        placeholder="Flavor notes, hop varieties..."
                                        rows={2}
                                        maxLength={140}
                                        value={newItem.description || ''}
                                        onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                                    />
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 mb-1 block">ABV %</label>
                                        <input
                                            type="number"
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
                                            placeholder="5.2"
                                            value={newItem.stats?.abv || ''}
                                            onChange={e => setNewItem({ ...newItem, stats: { ...newItem.stats, abv: parseFloat(e.target.value) } })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 mb-1 block">IBU</label>
                                        <input
                                            type="number"
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-primary focus:outline-none"
                                            placeholder="40"
                                            value={newItem.stats?.ibu || ''}
                                            onChange={e => setNewItem({ ...newItem, stats: { ...newItem.stats, ibu: parseFloat(e.target.value) } })}
                                        />
                                    </div>
                                </div>

                                {/* Ops Fields */}
                                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-800">
                                    <label className="text-xs font-bold text-blue-400 mb-3 block flex items-center gap-2">
                                        <Search size={12} /> OPS INTELLIGENCE
                                    </label>
                                    <div className="space-y-3">
                                        <label className="text-xs font-semibold text-slate-400">MARGIN TIER</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[MarginTier.High, MarginTier.Medium, MarginTier.Low].map(tier => (
                                                <button
                                                    key={tier}
                                                    onClick={() => setNewItem({ ...newItem, margin_tier: tier })}
                                                    className={`py-2 px-1 rounded-lg text-xs font-bold border ${newItem.margin_tier === tier
                                                        ? 'bg-blue-600 border-blue-500 text-white'
                                                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                                                        }`}
                                                >
                                                    {tier === 'High' ? 'High Profit' : tier === 'Medium' ? 'Standard' : 'Low Profit'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                            </div>

                            <div className="mt-6 flex gap-3">
                                <button
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="flex-1 py-3 font-bold text-slate-400 hover:text-white"
                                >
                                    CANCEL
                                </button>
                                <button
                                    onClick={handleAddItem}
                                    disabled={isSubmitting || !newItem.name}
                                    className="flex-1 bg-primary text-black py-3 rounded-xl font-bold hover:bg-yellow-400 disabled:opacity-50"
                                >
                                    {isSubmitting ? 'SAVING...' : 'ADD TO LIBRARY'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
