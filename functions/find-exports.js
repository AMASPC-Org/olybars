
try {
    const firebasePkg = require('@genkit-ai/firebase');
    console.log('--- @genkit-ai/firebase exports ---');
    console.log(Object.keys(firebasePkg));
    // check if it's a function
    if (typeof firebasePkg === 'function') console.log('It is a function');
} catch (e) {
    console.log('@genkit-ai/firebase error:', e.message);
}

try {
    const firebaseFuncs = require('@genkit-ai/firebase/functions');
    console.log('--- @genkit-ai/firebase/functions exports ---');
    console.log(Object.keys(firebaseFuncs));
} catch (e) {
    console.log('@genkit-ai/firebase/functions error:', e.message);
}

try {
    const flowPkg = require('@genkit-ai/flow');
    console.log('--- @genkit-ai/flow exports ---');
    console.log(Object.keys(flowPkg));
} catch (e) {
    console.log('@genkit-ai/flow error:', e.message);
}

try {
    const vertexPkg = require('@genkit-ai/vertexai');
    console.log('--- @genkit-ai/vertexai exports ---');
    console.log(Object.keys(vertexPkg));
} catch (e) {
    console.log('@genkit-ai/vertexai error:', e.message);
}

try {
    const genkit = require('genkit');
    console.log('--- genkit exports ---');
    console.log(Object.keys(genkit));
} catch (error) {
    console.log('genkit error:', error.message);
}

try {
    const { genkit } = require('genkit');
    const ai = genkit({ plugins: [] });
    console.log('--- ai instance keys ---');
    console.log(Object.keys(ai));
    console.log('--- ai prototype keys ---');
    console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(ai)));
} catch (error) {
    console.log('genkit instantiation error:', error.message);
}
