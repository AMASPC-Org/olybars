
const url = 'https://olybars-backend-juthzlaerq-uw.a.run.app/api/chat';
const data = { message: 'Hello, are you there?' };

(async () => {
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
        console.log('Body:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
})();
