export const GAME_TTLS: Record<string, number> = {
    'pool': 30,
    'billiards': 30,
    'darts': 15,
    'shuffleboard': 20,
    'cornhole': 20,
    'axethrowing': 30,
    'arcade': 15,
    'default': 20
};

export const getGameTTL = (amenityId: string): number => {
    // Normalize id (e.g. pool-table -> pool)
    const normalized = amenityId.toLowerCase();

    // Check for exact matches or partial matches
    const key = Object.keys(GAME_TTLS).find(k => normalized.includes(k));

    return GAME_TTLS[key || 'default'];
};
