import React from 'react';

export const HistoryFooter: React.FC = () => {
    return (
        <div className="mt-16 pt-8 border-t border-white/10 text-center text-slate-500 text-xs font-body">
            <p className="mb-2">
                "OlyBars" is an independent project by Artesian Systems.
            </p>
            <p>
                Refreneces to "Olympia Beer", "It's the Water", and related history are for educational and historical preservation purposes only.
                Pabst Brewing Company holds the trademarks for Olympia Beer. We are just fans of the history.
            </p>
            <p className="mt-4 text-accent/50 uppercase tracking-widest font-heading">
                Est. 2025 • Olympia, WA
            </p>
        </div>
    );
};
