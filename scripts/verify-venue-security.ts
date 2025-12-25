/**
 * Security Verification Script for OlyBars Venue Operations
 * This script verifies that only authorized users can update venue details.
 */

import { updateVenue } from '../server/src/venueService';

async function runSecurityTests() {
    console.log('--- OlyBars Security Verification: Venue Updates ---');

    const VENUE_ID = 'well-80';
    const AUTHORIZED_OWNER_ID = 'KU9KvRYzzrZfVU7BV4gaPYAFlKS2'; // Ryan
    const UNAUTHORIZED_USER_ID = 'random-user-123';
    const TEST_UPDATES = { deal: 'Security Test Flash Deal' };

    console.log('\n[TEST 1] Authorized Owner Update');
    try {
        const result = await updateVenue(VENUE_ID, TEST_UPDATES, AUTHORIZED_OWNER_ID);
        console.log('✅ PASS: Authorized owner update successful:', result.success);
    } catch (e: any) {
        console.log('❌ FAIL: Authorized owner update blocked:', e.message);
    }

    console.log('\n[TEST 2] Unauthorized User Update');
    try {
        await updateVenue(VENUE_ID, TEST_UPDATES, UNAUTHORIZED_USER_ID);
        console.log('❌ FAIL: Unauthorized user update allowed!');
    } catch (e: any) {
        console.log('✅ PASS: Unauthorized user update blocked as expected:', e.message);
    }

    console.log('\n[TEST 3] Admin Override Update');
    const ADMIN_ID = 'KU9KvRYzzrZfVU7BV4gaPYAFlKS2'; // Ryan is also super-admin
    try {
        const result = await updateVenue('ilk-lodge', TEST_UPDATES, ADMIN_ID);
        console.log('✅ PASS: Admin override (updating another venue) successful:', result.success);
    } catch (e: any) {
        console.log('❌ FAIL: Admin override blocked:', e.message);
    }

    console.log('\n--- Security Verification Complete ---');
}

runSecurityTests().catch(console.error);
