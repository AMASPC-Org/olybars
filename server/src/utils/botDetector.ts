/**
 * OlyBars AI Bot Detector
 * Identify common AI crawlers and LLM agents.
 */

const AI_BOT_PATTERNS = [
    'gptbot',
    'chatgpt-user',
    'claudebot',
    'claude-web',
    'google-extended',
    'googlebot-hermes',
    'bingpreview',
    'yandexbot',
    'applebot-extended',
    'facebookexternalhit',
    'ia_archiver',
    'ccbot',
    'semrushbot',
    'dotbot',
    'rogerbot',
    'exabot',
    'nutch',
    'ahrefsbot',
    'mj12bot',
    'perplexitybot',
    'imagesiftbot',
    'cohere-ai',
    'bytespider',
    'petalbot',
    'diffbot',
    'anthropic-ai',
    'facebot'
];

export const isAiBot = (userAgent: string): boolean => {
    const ua = userAgent.toLowerCase();
    return AI_BOT_PATTERNS.some(pattern => ua.includes(pattern));
};

export const getBotName = (userAgent: string): string => {
    const ua = userAgent.toLowerCase();
    const found = AI_BOT_PATTERNS.find(pattern => ua.includes(pattern));
    return found ? found.toUpperCase() : 'UNKNOWN_BOT';
};
