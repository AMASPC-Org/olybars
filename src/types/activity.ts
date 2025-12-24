export interface ActivityLog {
    id: string;
    userId: string;
    type: string;
    venueId?: string;
    points: number;
    timestamp: number;
    hasConsent?: boolean;
    metadata?: any;
    verificationMethod?: 'gps' | 'qr';
}
