import fetch from 'node-fetch';

/**
 * Artie Reliability Check
 * Verifies backend configuration and performs an authenticated health ping to Artie's brain.
 */
async function runDiagnostic() {
    const baseUrl = process.env.VITE_API_URL || 'http://localhost:3001';
    const healthUrl = `${baseUrl}/api/health/artie`;
    const token = process.env.INTERNAL_HEALTH_TOKEN || 'local-dev-token';

    console.log(`📡 [DIAGNOSTIC] Checking Artie health at: ${healthUrl}`);

    try {
        const response = await fetch(healthUrl, {
            headers: {
                'X-Internal-Token': token
            }
        });

        if (!response.ok) {
            const error = await response.json();
            console.error(`❌ [DIAGNOSTIC] Health Check Failed (Status ${response.status}):`, error);
            process.exit(1);
        }

        const result = await response.json() as any;
        console.log('✅ [DIAGNOSTIC] Artie is healthy:', JSON.stringify(result, null, 2));

        if (result.status !== 'healthy' || result.artieBrain !== 'connected') {
            console.error('❌ [DIAGNOSTIC] Artie reports unhealthy state.');
            process.exit(1);
        }

        process.exit(0);
    } catch (error: any) {
        console.error('❌ [DIAGNOSTIC] Fatal error during health check:', error.message);
        process.exit(1);
    }
}

runDiagnostic();
