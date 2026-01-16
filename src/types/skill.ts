import { QuickReplyOption } from '../components/artie/QuickReplyChips';
import { ArtieOpsState } from '../hooks/useArtieOps';

/**
 * Standard context provided to every skill module to allow interaction
 * with the main useArtieOps state.
 */
export interface SkillContext {
    // UI/Messaging
    addUserMessage: (text: string) => void;
    addSchmidtResponse: (text: string, options?: QuickReplyOption[]) => void;
    setIsLoading: (loading: boolean) => void;

    // State Management
    setOpsState: (state: ArtieOpsState) => void;
    currentOpsState: ArtieOpsState;

    // Data Management
    draftData: any;
    setDraftData: (data: any | ((prev: any) => any)) => void;

    // Venue Context
    venue: any;

    // Core Logic Relay (to allow skills to trigger other actions/skills)
    processAction: (action: string, payload?: string) => Promise<void>;

    // Validation Helpers
    validateLCBCompliance?: (text: string) => { valid: boolean; reason?: string };
    validateSchedule?: (timeISO: string, duration: number) => Promise<{ valid: boolean; reason?: string }>;
}

/**
 * Specialized context for Event operations which use the eventDraft state.
 */
export interface EventSkillContext extends SkillContext {
    eventDraft: any;
    setEventDraft: (draft: any | ((prev: any) => any)) => void;
}
