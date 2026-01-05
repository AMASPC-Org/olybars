import { useState, useEffect, useCallback } from 'react';

export const useSpeechRecognition = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = SpeechRecognition ? new SpeechRecognition() : null;

    useEffect(() => {
        if (!recognition) {
            setError('Speech Recognition not supported in this browser.');
            return;
        }

        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (event: any) => {
            setError(event.error);
            setIsListening(false);
        };
        recognition.onresult = (event: any) => {
            const result = event.results[0][0].transcript;
            setTranscript(result);
        };
    }, []);

    const startListening = useCallback(() => {
        if (recognition) {
            setTranscript('');
            setError(null);
            recognition.start();
        }
    }, [recognition]);

    const stopListening = useCallback(() => {
        if (recognition) {
            recognition.stop();
        }
    }, [recognition]);

    return {
        isListening,
        transcript,
        error,
        startListening,
        stopListening,
        isSupported: !!recognition
    };
};
