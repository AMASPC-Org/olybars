import { useState, useCallback } from 'react';
import { VenueOpsService } from '../services/VenueOpsService';

export type AdminOpsState = 'idle' | 'uploading' | 'verifying' | 'refining' | 'publishing' | 'completed';

export interface EventDraft {
    title?: string;
    date?: string;
    time?: string;
    description?: string;
    type?: string;
    venueName?: string;
}

export const useAdminFlyerOps = () => {
    const [opsState, setOpsState] = useState<AdminOpsState>('idle');
    const [eventDraft, setEventDraft] = useState<EventDraft>({});
    const [selectedVenueId, setSelectedVenueId] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    const handleFileUpload = useCallback(async (file: File) => {
        setIsLoading(true);
        setError(null);
        setOpsState('uploading');

        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        setImageUrl(previewUrl);

        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const base64 = e.target?.result as string;
                const base64Clean = base64.split(',')[1];

                // Use a placeholder venueId if none selected yet, or empty string
                // The backend might need a venueId, but for admin extraction we might want to generalize.
                // For now, let's use 'admin_extractor' as a virtual ID if allowed, or just wait for selector.
                // Actually, analyzeFlyer takes venueId.
                const extraction = await VenueOpsService.analyzeFlyer('admin_extractor', base64Clean, new Date().toISOString());

                setEventDraft({
                    title: extraction.title || '',
                    date: extraction.date || '',
                    time: extraction.time || '',
                    type: extraction.type || 'other',
                    description: extraction.description || '',
                    venueName: extraction.venueName || ''
                });

                setOpsState('verifying');
                setIsLoading(false);
            };
            reader.readAsDataURL(file);
        } catch (err: any) {
            setError(err.message || 'Failed to analyze flyer');
            setOpsState('idle');
            setIsLoading(false);
        }
    }, []);

    const handlePaste = useCallback(async (e: ClipboardEvent) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                if (file) {
                    await handleFileUpload(file);
                    break;
                }
            }
        }
    }, [handleFileUpload]);

    const updateDraft = (updates: Partial<EventDraft>) => {
        setEventDraft(prev => ({ ...prev, ...updates }));
    };

    const publishEvent = async () => {
        if (!selectedVenueId) {
            setError('Please select a venue first');
            return;
        }

        setIsLoading(true);
        setOpsState('publishing');
        try {
            await VenueOpsService.submitCalendarEvent(selectedVenueId, eventDraft);
            setOpsState('completed');
        } catch (err: any) {
            setError(err.message || 'Failed to publish event');
            setOpsState('verifying');
        } finally {
            setIsLoading(false);
        }
    };

    return {
        opsState,
        setOpsState,
        eventDraft,
        updateDraft,
        selectedVenueId,
        setSelectedVenueId,
        handleFileUpload,
        handlePaste,
        publishEvent,
        isLoading,
        error,
        imageUrl
    };
};
