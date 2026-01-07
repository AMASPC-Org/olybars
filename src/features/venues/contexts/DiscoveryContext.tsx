import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { VenueStatus } from '../../../types';
import { isSameDay } from 'date-fns';

export type FilterKind = 'status' | 'deals' | 'scene' | 'play' | 'features' | 'events' | 'all';

interface DiscoveryContextType {
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    filterKind: FilterKind;
    setFilterKind: (k: FilterKind) => void;
    statusFilter: VenueStatus | 'all';
    setStatusFilter: (s: VenueStatus | 'all') => void;
    sceneFilter: string | 'all';
    setSceneFilter: (s: string | 'all') => void;
    playFilter: string | 'all';
    setPlayFilter: (s: string | 'all') => void;
    featureFilter: string | 'all';
    setFeatureFilter: (s: string | 'all') => void;
    eventFilter: string | 'all';
    setEventFilter: (s: string | 'all') => void;
    selectedDate: Date;
    setSelectedDate: (d: Date) => void;
    viewMode: 'list' | 'map';
    setViewMode: (m: 'list' | 'map') => void;
    clearAllFilters: () => void;
    isToday: boolean;
}

const DiscoveryContext = createContext<DiscoveryContextType | undefined>(undefined);

export const DiscoveryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const searchQuery = searchParams.get('q') || '';

    const [filterKind, setFilterKind] = useState<FilterKind>('all');
    const [statusFilter, setStatusFilter] = useState<VenueStatus | 'all'>('all');
    const [sceneFilter, setSceneFilter] = useState<string | 'all'>('all');
    const [playFilter, setPlayFilter] = useState<string | 'all'>('all');
    const [featureFilter, setFeatureFilter] = useState<string | 'all'>('all');
    const [eventFilter, setEventFilter] = useState<string | 'all'>('all');
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

    const isToday = useMemo(() => isSameDay(selectedDate, new Date()), [selectedDate]);

    const setSearchQuery = useCallback((q: string) => {
        setSearchParams(prev => {
            if (q) prev.set('q', q);
            else prev.delete('q');
            return prev;
        });
    }, [setSearchParams]);

    const clearAllFilters = useCallback(() => {
        setFilterKind('all');
        setStatusFilter('all');
        setSceneFilter('all');
        setPlayFilter('all');
        setFeatureFilter('all');
        setEventFilter('all');
    }, []);

    const value = useMemo(() => ({
        searchQuery,
        setSearchQuery,
        filterKind,
        setFilterKind,
        statusFilter,
        setStatusFilter,
        sceneFilter,
        setSceneFilter,
        playFilter,
        setPlayFilter,
        featureFilter,
        setFeatureFilter,
        eventFilter,
        setEventFilter,
        selectedDate,
        setSelectedDate,
        viewMode,
        setViewMode,
        clearAllFilters,
        isToday
    }), [
        searchQuery, setSearchQuery, filterKind, statusFilter, sceneFilter,
        playFilter, featureFilter, eventFilter, selectedDate, viewMode,
        clearAllFilters, isToday
    ]);

    return (
        <DiscoveryContext.Provider value={value}>
            {children}
        </DiscoveryContext.Provider>
    );
};

export const useDiscovery = () => {
    const context = useContext(DiscoveryContext);
    if (context === undefined) {
        throw new Error('useDiscovery must be used within a DiscoveryProvider');
    }
    return context;
};
