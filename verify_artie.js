// Local verification script for Artie's Brain
const url = 'http://localhost:3001/api/chat';
const data = {
    question: 'Who has the best happy hour in Olympia?',
    history: []
};

(async () => {
    console.log(`📡 Sending test query to: ${url}`);
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        console.log('Status:', response.status);
        console.log('🤖 Artie Response:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('❌ Verification Failed:', error);
    }
})();
