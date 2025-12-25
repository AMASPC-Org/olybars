
// Native fetch is available in Node 18+
async function fixUser() {
    try {
        const response = await fetch('http://localhost:3001/api/users/KU9KvRYzzrZfVU7BV4gaPYAFlKS2', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ homeBase: 'hannahs' }) // The correct ID
        });
        const data = await response.json();
        console.log('Update result:', data);
    } catch (e) {
        console.error('Failed:', e);
    }
}

fixUser();
