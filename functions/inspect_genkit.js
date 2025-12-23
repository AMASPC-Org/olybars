try {
    const firebase = require('@genkit-ai/firebase');
    console.log('firebase exports:', Object.keys(firebase));
} catch (e) {
    console.log('Error loading @genkit-ai/firebase:', e.message);
}

try {
    const ai = require('@genkit-ai/ai');
    console.log('@genkit-ai/ai exports:', Object.keys(ai));
    if (ai.defineTool) {
        console.log('defineTool length:', ai.defineTool.length);
    }
} catch (e) {
    console.log('Error loading @genkit-ai/ai:', e.message);
}

try {
    const { genkit } = require('genkit');
    console.log('genkit exports:', Object.keys(require('genkit')));
    try {
        const ai = genkit({ plugins: [] });
        console.log('ai instance keys:', Object.keys(ai));
    } catch (err) {
        console.log('Error instantiating genkit:', err.message);
    }
} catch (e) {
    console.log('Error loading genkit:', e.message);
}

try {
    const googleCloud = require('@genkit-ai/google-cloud');
    console.log('@genkit-ai/google-cloud exports:', Object.keys(googleCloud));
} catch (e) {
    console.log('Error loading @genkit-ai/google-cloud:', e.message);
}
