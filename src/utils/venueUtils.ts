import { Venue } from '../types';

export type HoursStatus = 'open' | 'last_call' | 'closed';

/**
 * Determines the current status of a venue based on its hours metadata.
 * Accounts for "Last Call" (30 minutes before closing).
 */
export const getVenueStatus = (venue: Venue): HoursStatus => {
    if (!venue.hours) return 'open';

    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const parseTime = (timeStr: string): number => {
        const [time, modifier] = timeStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;
        return hours * 60 + (minutes || 0);
    };

    let hoursRange: string | { open: string; close: string } | undefined;

    if (typeof venue.hours === 'string') {
        hoursRange = venue.hours;
    } else {
        hoursRange = venue.hours[currentDay];
    }

    if (!hoursRange) return 'closed';

    let openStr, closeStr;
    if (typeof hoursRange === 'string') {
        const parts = hoursRange.split(' - ');
        if (parts.length !== 2) return 'open';
        [openStr, closeStr] = parts;
    } else {
        openStr = hoursRange.open;
        closeStr = hoursRange.close;
    }

    const openTime = parseTime(openStr);
    let closeTime = parseTime(closeStr);

    // Handle midnight wrap
    if (closeTime <= openTime) {
        closeTime += 24 * 60;
    }

    // Adjust current time for midnight wrap context
    // If current time is early morning (e.g., 1 AM) and close time was 2 AM (today),
    // but the session started yesterday, we need to handle that.
    let adjustedCurrentTime = currentTime;
    if (currentTime < openTime && currentTime < closeTime - (24 * 60)) {
        adjustedCurrentTime += 24 * 60;
    }

    if (adjustedCurrentTime >= openTime && adjustedCurrentTime < closeTime) {
        // Last Call check (30 minutes before close)
        if (closeTime - adjustedCurrentTime <= 30) {
            return 'last_call';
        }
        return 'open';
    }

    return 'closed';
};

/**
 * Legacy wrapper for boolean check
 */
export const isVenueOpen = (venue: Venue): boolean => {
    return getVenueStatus(venue) !== 'closed';
};
