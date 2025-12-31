export type SignalType = 'check_in' | 'vibe_report' | 'photo_upload';

export interface Signal {
    id: string;
    venueId: string;
    userId: string;
    type: SignalType;
    value: any;
    timestamp: number;
    verificationMethod?: 'gps' | 'qr'; // Added for Vibe Check QR System
}
