import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDiscovery } from '../contexts/DiscoveryContext';
import { GlobalSearch } from '../../../components/features/search/GlobalSearch';
import { DateContextSelector } from '../../../components/features/search/DateContextSelector';
import {
    ChevronRight, List, Map as MapIcon,
    Zap, Flame, Beer, Clock
} from 'lucide-react';
import { TAXONOMY_PLAY, TAXONOMY_EVENTS } from '../../../data/taxonomy';
import { VenueStatus } from '../../../types';

export const DiscoveryControls: React.FC = () => {
    const {
        filterKind, setFilterKind,
        statusFilter, setStatusFilter,
        sceneFilter, setSceneFilter,
        playFilter, setPlayFilter,
        featureFilter, setFeatureFilter,
        eventFilter, setEventFilter,
        selectedDate, setSelectedDate,
        viewMode, setViewMode,
        clearAllFilters
    } = useDiscovery();

    const navigate = useNavigate();
    const location = useLocation();

    const [showVibeMenu, setShowVibeMenu] = useState(false);
    const [showSceneMenu, setShowSceneMenu] = useState(false);
    const [showPlayMenu, setShowPlayMenu] = useState(false);
    const [showFeatureMenu, setShowFeatureMenu] = useState(false);
    const [showEventMenu, setShowEventMenu] = useState(false);

    const handleInteraction = () => {
        if (location.pathname !== '/') {
            navigate('/');
        }
    };

    const baseChipClasses = 'px-3 py-1.5 text-xs font-bold rounded-full border transition-all whitespace-nowrap';
    const statusActive = filterKind === 'status' || filterKind === 'all';
    const sceneActive = filterKind === 'scene';
    const playActive = filterKind === 'play';
    const featuresActive = filterKind === 'features';
    const eventsActive = filterKind === 'events';

    return (
        <div className="px-4 space-y-4 pb-4 bg-background sticky top-[64px] z-30">
            <div className="flex flex-col gap-4">
                {/* Top Row: Search Bar */}
                <div className="w-full">
                    <GlobalSearch
                        placeholder="SEARCH BARS, VIBES, OR DEALS..."
                        variant="hero"
                    />
                </div>

                {/* Middle Row: Date Selector & Map/List Toggle */}
                <div className="flex justify-between items-center bg-black/40 p-2 rounded-2xl border border-white/5">
                    <div onClick={() => { handleInteraction(); }}>
                        <DateContextSelector
                            selectedDate={selectedDate}
                            onDateChange={setSelectedDate}
                        />
                    </div>
                    <button
                        onClick={() => {
                            handleInteraction();
                            setViewMode(viewMode === 'list' ? 'map' : 'list');
                        }}
                        className="p-3 bg-surface rounded-xl border border-slate-800 text-primary hover:border-primary transition-all active:scale-95 flex items-center gap-2"
                    >
                        {viewMode === 'list' ? <><MapIcon size={18} /><span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">Map</span></> : <><List size={18} /><span className="text-[10px] font-black uppercase tracking-widest hidden md:inline">List</span></>}
                    </button>
                </div>

                {/* Bottom Row: Filter Chips */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
                    <button
                        onClick={() => {
                            handleInteraction();
                            clearAllFilters();
                        }}
                        className={`${baseChipClasses} ${filterKind === 'all' ? 'bg-primary text-black border-primary' : 'bg-surface text-slate-300 border-slate-700 hover:border-slate-500'}`}
                    >
                        All
                    </button>

                    {/* DEALS */}
                    <button
                        onClick={() => {
                            handleInteraction();
                            setFilterKind('deals');
                            setShowVibeMenu(false); setShowSceneMenu(false); setShowPlayMenu(false); setShowFeatureMenu(false); setShowEventMenu(false);
                        }}
                        className={`${baseChipClasses} ${filterKind === 'deals' ? 'bg-primary text-black border-primary' : 'bg-surface text-slate-300 border-slate-700 hover:border-slate-500'} flex items-center gap-1.5`}
                    >
                        Deals
                    </button>

                    {/* EVENTS */}
                    <div className="relative">
                        <button
                            onClick={() => {
                                setShowEventMenu(!showEventMenu);
                                setShowVibeMenu(false); setShowSceneMenu(false); setShowPlayMenu(false); setShowFeatureMenu(false);
                            }}
                            className={`${baseChipClasses} ${eventsActive ? 'bg-primary text-black border-primary' : 'bg-surface text-slate-300 border-slate-700 hover:border-slate-500'} flex items-center gap-1.5`}
                        >
                            Events <ChevronRight className={`w-3 h-3 transition-transform ${showEventMenu ? 'rotate-90' : ''}`} />
                        </button>

                    </div>

                    {/* VIBE (Status) - Formerly Pulse */}
                    <div className="relative">
                        <button
                            onClick={() => {
                                setShowVibeMenu(!showVibeMenu);
                                setShowSceneMenu(false); setShowPlayMenu(false); setShowFeatureMenu(false); setShowEventMenu(false);
                            }}
                            className={`${baseChipClasses} ${statusActive && filterKind !== 'all' ? 'bg-primary text-black border-primary' : 'bg-surface text-slate-300 border-slate-700 hover:border-slate-500'} flex items-center gap-1.5`}
                        >
                            Vibe <ChevronRight className={`w-3 h-3 transition-transform ${showVibeMenu ? 'rotate-90' : ''}`} />
                        </button>

                    </div>

                    {/* PLAY */}
                    <div className="relative">
                        <button
                            onClick={() => {
                                setShowPlayMenu(!showPlayMenu);
                                setShowVibeMenu(false); setShowSceneMenu(false); setShowFeatureMenu(false); setShowEventMenu(false);
                            }}
                            className={`${baseChipClasses} ${playActive ? 'bg-primary text-black border-primary' : 'bg-surface text-slate-300 border-slate-700 hover:border-slate-500'} flex items-center gap-1.5`}
                        >
                            Play <ChevronRight className={`w-3 h-3 transition-transform ${showPlayMenu ? 'rotate-90' : ''}`} />
                        </button>

                    </div>

                    {/* SCENE */}
                    <div className="relative">
                        <button
                            onClick={() => {
                                setShowSceneMenu(!showSceneMenu);
                                setShowVibeMenu(false); setShowPlayMenu(false); setShowFeatureMenu(false); setShowEventMenu(false);
                            }}
                            className={`${baseChipClasses} ${sceneActive ? 'bg-primary text-black border-primary' : 'bg-surface text-slate-300 border-slate-700 hover:border-slate-500'} flex items-center gap-1.5`}
                        >
                            Scene <ChevronRight className={`w-3 h-3 transition-transform ${showSceneMenu ? 'rotate-90' : ''}`} />
                        </button>

                    </div>

                    {/* FEATURES */}
                    <div className="relative">
                        <button
                            onClick={() => {
                                setShowFeatureMenu(!showFeatureMenu);
                                setShowVibeMenu(false); setShowSceneMenu(false); setShowPlayMenu(false); setShowEventMenu(false);
                            }}
                            className={`${baseChipClasses} ${featuresActive ? 'bg-primary text-black border-primary' : 'bg-surface text-slate-300 border-slate-700 hover:border-slate-500'} flex items-center gap-1.5`}
                        >
                            Features <ChevronRight className={`w-3 h-3 transition-transform ${showFeatureMenu ? 'rotate-90' : ''}`} />
                        </button>

                    </div>
                </div>

                {/* Active Menu Sub-Row (Expands when a category is selected) */}
                {(showVibeMenu || showSceneMenu || showPlayMenu || showFeatureMenu || showEventMenu) && (
                    <div className="pt-2 animate-in slide-in-from-top-2 fade-in duration-200 border-t border-white/5 mx-2">
                        <div className="flex flex-wrap gap-2">
                            {/* VIBE OPTIONS */}
                            {showVibeMenu && [
                                { id: 'packed', label: '⚡ Packed', icon: Zap },
                                { id: 'buzzing', label: '🔥 Buzzing', icon: Flame },
                                { id: 'chill', label: '🍺 Chill', icon: Beer },
                                { id: 'dead', label: '💀 Dead', icon: Clock }
                            ].map(option => (
                                <button
                                    key={option.id}
                                    onClick={() => {
                                        handleInteraction();
                                        setStatusFilter(option.id as VenueStatus);
                                        setFilterKind('status');
                                        setShowVibeMenu(false);
                                    }}
                                    className={`px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 transition-all active:scale-95 ${statusFilter === option.id && filterKind === 'status' ? 'border-primary text-primary' : ''}`}
                                >
                                    {option.label}
                                </button>
                            ))}

                            {/* SCENE OPTIONS */}
                            {showSceneMenu && [
                                { id: 'dive', label: '🍺 Dive Bar' },
                                { id: 'sports', label: '🏆 Sports Bar' },
                                { id: 'speakeasy', label: '🗝️ Speakeasy' },
                                { id: 'cocktail', label: '🍸 Cocktails' },
                                { id: 'wine', label: '🍷 Wine & Tapas' },
                                { id: 'brewery', label: '🍻 Brewery' }
                            ].map(option => (
                                <button
                                    key={option.id}
                                    onClick={() => {
                                        handleInteraction();
                                        setSceneFilter(option.id);
                                        setFilterKind('scene');
                                        setShowSceneMenu(false);
                                    }}
                                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 transition-all active:scale-95"
                                >
                                    {option.label}
                                </button>
                            ))}

                            {/* PLAY OPTIONS */}
                            {showPlayMenu && TAXONOMY_PLAY.slice(0, 12).map(game => (
                                <button
                                    key={game}
                                    onClick={() => {
                                        handleInteraction();
                                        setPlayFilter(game);
                                        setFilterKind('play');
                                        setShowPlayMenu(false);
                                    }}
                                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 transition-all active:scale-95"
                                >
                                    {game}
                                </button>
                            ))}

                            {/* FEATURES OPTIONS */}
                            {showFeatureMenu && [
                                { id: 'patio', label: '🌳 Patio' },
                                { id: 'dog_friendly', label: '🐕 Dog Friendly' },
                                { id: 'all_ages', label: '👶 All Ages' },
                                { id: 'fireplace', label: '🔥 Fireplace' },
                                { id: 'dance_floor', label: '💃 Dance Floor' },
                                { id: 'stage', label: '🎭 Stage' }
                            ].map(option => (
                                <button
                                    key={option.id}
                                    onClick={() => {
                                        handleInteraction();
                                        setFeatureFilter(option.id);
                                        setFilterKind('features');
                                        setShowFeatureMenu(false);
                                    }}
                                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 transition-all active:scale-95"
                                >
                                    {option.label}
                                </button>
                            ))}

                            {/* EVENTS OPTIONS */}
                            {showEventMenu && (
                                <>
                                    <button
                                        onClick={() => {
                                            handleInteraction();
                                            setEventFilter('all');
                                            setFilterKind('events');
                                            setShowEventMenu(false);
                                        }}
                                        className={`px-3 py-2 ${eventFilter === 'all' ? 'bg-primary text-black' : 'bg-slate-800 text-slate-200'} hover:bg-slate-700 text-xs font-bold rounded-lg border border-slate-700 transition-all active:scale-95`}
                                    >
                                        All Events
                                    </button>
                                    {TAXONOMY_EVENTS.map(event => (
                                        <button
                                            key={event}
                                            onClick={() => {
                                                handleInteraction();
                                                setEventFilter(event);
                                                setFilterKind('events');
                                                setShowEventMenu(false);
                                            }}
                                            className={`px-3 py-2 ${eventFilter === event ? 'bg-primary text-black' : 'bg-slate-800 text-slate-200'} hover:bg-slate-700 text-xs font-bold rounded-lg border border-slate-700 transition-all active:scale-95`}
                                        >
                                            {event}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => {
                                            handleInteraction();
                                            setEventFilter('other');
                                            setFilterKind('events');
                                            setShowEventMenu(false);
                                        }}
                                        className={`px-3 py-2 ${eventFilter === 'other' ? 'bg-primary text-black' : 'bg-slate-800 text-slate-200'} hover:bg-slate-700 text-xs font-bold rounded-lg border border-slate-700 transition-all active:scale-95`}
                                    >
                                        Other
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
