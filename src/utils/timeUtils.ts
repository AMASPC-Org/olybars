/**
 * Formats a 24-hour time string (HH:mm) into a user-friendly AM/PM string.
 * @param timeStr Time string in HH:mm format
 * @returns Formatted time string (e.g., "7:00 PM")
 */
export const formatToAMPM = (timeStr: string | undefined): string => {
    if (!timeStr) return '';

    // Check if it's already in AM/PM format
    if (timeStr.includes('AM') || timeStr.includes('PM')) return timeStr;

    const [hoursStr, minutesStr] = timeStr.split(':');
    let hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);

    if (isNaN(hours) || isNaN(minutes)) return timeStr;

    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const minutesFormatted = minutes < 10 ? `0${minutes}` : minutes;

    return `${hours}:${minutesFormatted} ${ampm}`;
};

/**
 * Converts a 24-hour time string (HH:mm) to total minutes from midnight.
 * @param timeStr Time string in HH:mm format
 * @returns Total minutes
 */
export const timeToMinutes = (timeStr: string | undefined): number => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
};

/**
 * Normalizes a time string to HH:mm format for storage.
 * If input is AM/PM, it converts to 24h.
 */
export const normalizeTo24h = (timeStr: string | undefined): string => {
    if (!timeStr) return '';

    const ampmMatch = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (ampmMatch) {
        let [_, hoursStr, minutes, modifier] = ampmMatch;
        let hours = parseInt(hoursStr, 10);
        if (modifier.toUpperCase() === 'PM' && hours < 12) hours += 12;
        if (modifier.toUpperCase() === 'AM' && hours === 12) hours = 0;
        return `${hours.toString().padStart(2, '0')}:${minutes}`;
    }

    return timeStr;
};
