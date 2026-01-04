import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkIn } from '../venueService';
import { db } from '../firebaseAdmin';

// Mock dependencies
vi.mock('../firebaseAdmin', () => ({
    db: {
        collection: vi.fn(),
    }
}));

describe('venueService - checkIn', () => {
    const mockCollection = db.collection as any;
    const mockDoc = vi.fn();
    const mockGet = vi.fn();
    const mockAdd = vi.fn();
    const mockUpdate = vi.fn();
    const mockSet = vi.fn();
    const mockWhere = vi.fn();
    const mockLimit = vi.fn();
    const mockOrderBy = vi.fn();

    // Helper for snapshots
    const createMockSnapshot = (docs: any[] = []) => ({
        empty: docs.length === 0,
        size: docs.length,
        docs,
        forEach: (callback: (doc: any) => void) => docs.forEach(callback)
    });

    beforeEach(() => {
        vi.clearAllMocks();

        // Default chain setup for simple tests
        mockCollection.mockReturnValue({
            doc: mockDoc,
            add: mockAdd,
            where: mockWhere,
            orderBy: mockOrderBy,
        });

        mockDoc.mockReturnValue({
            get: mockGet,
            update: mockUpdate,
            set: mockSet,
        });

        mockWhere.mockReturnValue({
            where: mockWhere,
            limit: mockLimit,
            orderBy: mockOrderBy,
            get: mockGet,
        });

        mockOrderBy.mockReturnValue({
            limit: mockLimit
        });

        mockLimit.mockReturnValue({
            get: mockGet,
        });
    });

    it('should throw error if venue does not exist', async () => {
        mockGet.mockResolvedValueOnce({ exists: false });

        await expect(checkIn('inv-venue', 'user-1', 0, 0)).rejects.toThrow('Venue not found');
        expect(mockCollection).toHaveBeenCalledWith('venues');
        expect(mockDoc).toHaveBeenCalledWith('inv-venue');
    });

    it('should throw error if user is too far from venue (Geofence)', async () => {
        mockGet.mockResolvedValueOnce({
            exists: true,
            data: () => ({
                name: 'Far Away Bar',
                location: { lat: 47.0454, lng: -122.8959 } // Olympia
            })
        });

        // User is at 0,0 (Null Island)
        await expect(checkIn('venue-1', 'user-1', 0, 0)).rejects.toThrow(/Too far away/);
    });

    it('should succeed if user is close enough', async () => {
        const lat = 47.0454;
        const lng = -122.8959;

        // Specific Collection Mocks for the complex success flow
        const venuesDocMock = {
            get: vi.fn().mockResolvedValue({
                exists: true,
                data: () => ({
                    name: 'Close Bar',
                    location: { lat, lng },
                    ownerId: 'other',
                    managerIds: [],
                    checkIns: 0,
                    isActive: true,
                    isLocalMaker: false
                })
            }),
            update: mockUpdate,
            set: mockSet
        };

        const usersDocMock = {
            get: vi.fn().mockResolvedValue({
                exists: true,
                data: () => ({ badges: {}, stats: {} })
            }),
            update: mockUpdate, // For badge updates and points
            set: mockSet
        };

        // Signals query mock always returns empty for this test (no LCB limit, no throttle)
        const signalsQueryMock = {
            where: vi.fn().mockReturnThis(),
            orderBy: vi.fn().mockReturnThis(),
            limit: vi.fn().mockReturnThis(),
            get: vi.fn().mockResolvedValue(createMockSnapshot([])),
            add: mockAdd
        };

        const activityCollectionMock = {
            add: mockAdd
        };

        // Override collection implementation for this test ONLY
        mockCollection.mockImplementation((name: string) => {
            if (name === 'venues') return { doc: () => venuesDocMock };
            if (name === 'users') return { doc: () => usersDocMock };
            if (name === 'signals') return signalsQueryMock;
            if (name === 'activity_logs') return activityCollectionMock;
            return { doc: mockDoc };
        });

        const result = await checkIn('venue-1', 'user-1', lat, lng);

        expect(result.success).toBe(true);
        expect(result.pointsAwarded).toBe(10); // Default points
        expect(mockUpdate).toHaveBeenCalled();
        expect(mockAdd).toHaveBeenCalled();
    });
});
