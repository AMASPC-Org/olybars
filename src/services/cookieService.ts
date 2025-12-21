/**
 * OlyBars Cookie Service
 * Handles compliant browser cookie management for preferences and session flags.
 */

export const cookieService = {
    /**
     * Set a cookie with standard security defaults
     */
    set: (name: string, value: string, days: number = 365) => {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));

        // Using SameSite=Lax for general session cookies, Secure when not on localhost
        const isLocal = window.location.hostname === 'localhost';
        const secureFlag = isLocal ? '' : 'Secure;';

        document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax;${secureFlag}`;
    },

    /**
     * Get a cookie value by name
     */
    get: (name: string): string | null => {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    },

    /**
     * Delete a cookie
     */
    remove: (name: string) => {
        document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
    }
};
