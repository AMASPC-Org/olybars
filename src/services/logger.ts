/**
 * OlyBars Lightweight Client Error Collector
 * Google-native Observability (No Sentry)
 */

import { API_BASE_URL } from '../lib/api-config';
const RELEASE_VERSION = '1.0.0'; // Should be synced with package.json

interface ClientErrorPayload {
    message: string;
    stack?: string;
    url: string;
    userAgent: string;
    release: string;
    timestamp: number;
    client_event_id: string;
}

class Logger {
    private lastReported: number = 0;
    private readonly RATE_LIMIT_MS = 5000; // Max 1 error per 5 seconds

    constructor() {
        this.setupHandlers();
    }

    private setupHandlers() {
        window.onerror = (message, source, lineno, colno, error) => {
            this.logError({
                message: String(message),
                stack: error?.stack,
                url: source || window.location.href,
                userAgent: navigator.userAgent,
                release: RELEASE_VERSION,
                timestamp: Date.now(),
                client_event_id: this.generateUUID(),
            });
            return false; // Let browser process error as well
        };

        window.onunhandledrejection = (event) => {
            this.logError({
                message: `Unhandled Promise Rejection: ${event.reason}`,
                stack: event.reason?.stack,
                url: window.location.href,
                userAgent: navigator.userAgent,
                release: RELEASE_VERSION,
                timestamp: Date.now(),
                client_event_id: this.generateUUID(),
            });
        };
    }

    private async logError(payload: ClientErrorPayload) {
        const now = Date.now();
        if (now - this.lastReported < this.RATE_LIMIT_MS) return;
        this.lastReported = now;

        try {
            // Basic Sanitization: Remove potential sensitive query params
            const sanitizedUrl = payload.url.replace(/([?&])(auth|token|key|secret)=[^&]*/gi, '$1$2=REDACTED');
            const sanitizedPayload = { ...payload, url: sanitizedUrl };

            // Cap payload size (approximate)
            if (JSON.stringify(sanitizedPayload).length > 10000) {
                console.warn('[Logger] Payload too large, truncating stack trace.');
                sanitizedPayload.stack = sanitizedPayload.stack?.substring(0, 1000);
            }

            await fetch(`${API_BASE_URL}/client-errors`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sanitizedPayload),
            });
        } catch (e) {
            // Silent fail to avoid infinite error loops
            console.error('[Logger] Failed to report error to backend:', e);
        }
    }

    private generateUUID(): string {
        return 'client-' + Math.random().toString(36).substring(2, 15) + '-' + Date.now();
    }
}

export const logger = new Logger();
