import { GeminiService } from './geminiService';

/**
 * ArtieCacheService: Phase 2 FinOps Maturity
 * Manages Vertex AI Context Caching for the static parts of Artie's brain.
 */
export class ArtieCacheService {
    private static cacheName: string | null = null;
    private static lastCreated: number = 0;
    private static CACHE_TTL = 60 * 60 * 1000; // 1 Hour

    /**
     * Retrieves or creates a Vertex AI Content Cache for Artie's static instructions.
     */
    static async getOrSetStaticCache(service: GeminiService, staticSystemInstruction: string) {
        const now = Date.now();

        // 1. SWR / TTL Logic
        if (this.cacheName && (now - this.lastCreated) < this.CACHE_TTL) {
            return this.cacheName;
        }

        try {
            console.log("[ZENITH] Initializing new context cache for Artie's Knowledge Base...");

            // Note: The SDK's cachedContents API requires the model name and system instruction.
            // We cache EVERYTHING up to the dynamic 'Pulse Context'.
            // Note: In @google/genai SDK, context caching is handled via genAI.caches.create
            const result = await (service as any).genAI.caches.create({
                model: 'gemini-2.0-flash',
                systemInstruction: { parts: [{ text: staticSystemInstruction }] },
                ttl: { seconds: 3600 }
            });

            this.cacheName = result.name;
            this.lastCreated = now;
            console.log(`[ZENITH] Context cache created: ${this.cacheName}`);
            return this.cacheName;

        } catch (error: any) {
            console.warn("[ZENITH] Context Caching failed (skipping for performance):", error.message);
            // Fallback: Return null so the generation proceeds without a cache (un-optimized but functional)
            return null;
        }
    }
}
