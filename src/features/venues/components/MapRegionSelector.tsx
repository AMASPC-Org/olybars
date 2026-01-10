import React from 'react';
import { useDiscovery } from '../contexts/DiscoveryContext';

export const MapRegionSelector: React.FC = () => {
    const { mapRegion, setMapRegion } = useDiscovery();

    const regions = [
        { id: 'all', label: 'All' },
        { id: 'westside', label: 'Westside' },
        { id: 'downtown', label: 'Downtown' },
        { id: 'eastside', label: 'Eastside' },
    ];

    return (
        <div className="flex justify-center mb-4">
            <div className="flex bg-slate-950/80 backdrop-blur-md p-1 rounded-xl border border-primary/30 shadow-xl">
                {regions.map((region) => {
                    const isActive = mapRegion === region.id;
                    return (
                        <button
                            key={region.id}
                            onClick={() => setMapRegion(region.id)}
                            className={`
                                px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all
                                ${isActive
                                    ? 'bg-primary text-black shadow-lg shadow-primary/20'
                                    : 'text-white hover:bg-white/5 hover:text-primary transition-colors'
                                }
                            `}
                        >
                            {region.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
