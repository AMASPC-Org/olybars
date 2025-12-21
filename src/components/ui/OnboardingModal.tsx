import React, { useState } from 'react';
import { Flame, Clock, Trophy, MessageCircle, Star, X } from 'lucide-react';

// --- Props ---
interface OnboardingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// --- Helper Functions ---

const renderIconForOnboarding = (step: number) => {
    const iconProps = { className: "w-10 h-10 text-primary", strokeWidth: 2.5 };
    switch (step) {
        case 1: return <Flame {...iconProps} />;
        case 2: return <Clock {...iconProps} />;
        case 3: return <Trophy {...iconProps} />;
        case 4: return <MessageCircle {...iconProps} />;
        case 5: return <Star {...iconProps} />;
        default: return <Star {...iconProps} />;
    }
};

const renderOnboardingContent = (step: number) => {
    switch (step) {
        case 1: return { title: "Welcome to OlyBars!", text: "The Oly Pulse shows you where the crowd is right now. Find the 'Buzzing' spots and never walk into an empty bar again." };
        case 2: return { title: "The Buzz Clock", text: "We track every Happy Hour in town. Deals ending soonest are always at the top." };
        case 3: return { title: "The League", text: "Clock In to venues and take Vibe Photos to earn points. Compete for the season champion trophy." };
        case 4: return { title: "Ask Artie", text: "Artie is your personal AI concierge. Ask for directions, food recommendations, or today's hottest deal." };
        case 5: return {
            title: "Cookies & Privacy", text: (
                <span>
                    We use cookies to save your OlyBars ID, points, and favorite venues. By continuing, you agree to our{' '}
                    <a href="/terms" target="_blank" className="text-primary hover:underline">Terms</a> &{' '}
                    <a href="/privacy" target="_blank" className="text-primary hover:underline">Privacy</a>.
                </span>
            )
        };
        default: return { title: "Welcome", text: "Let's get started." };
    }
};

const MAX_ONBOARDING_STEPS = 5;

// --- Main Component ---

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
    const [onboardingStep, setOnboardingStep] = useState(1);

    if (!isOpen) {
        return null;
    }

    const handleNext = () => {
        if (onboardingStep < MAX_ONBOARDING_STEPS) {
            setOnboardingStep(prev => prev + 1);
        } else {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-surface w-full max-w-sm overflow-hidden rounded-xl border border-slate-700 shadow-lg p-6 relative text-center">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-transform hover:scale-110">
                    <X className="w-6 h-6" />
                </button>

                <div className="mb-6">
                    <div className="w-20 h-20 bg-background rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700 shadow-md">
                        {renderIconForOnboarding(onboardingStep)}
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2 uppercase tracking-wide">
                        {renderOnboardingContent(onboardingStep).title}
                    </h2>

                    <p className="text-sm text-slate-300 leading-relaxed px-2">
                        {renderOnboardingContent(onboardingStep).text}
                    </p>
                </div>

                <div className="flex flex-col gap-4">
                    <button
                        onClick={handleNext}
                        className="w-full bg-primary hover:bg-yellow-400 text-black font-bold text-lg uppercase tracking-wider py-3 rounded-md shadow-md active:scale-95 transition-all"
                    >
                        {onboardingStep < MAX_ONBOARDING_STEPS ? `NEXT (${onboardingStep}/${MAX_ONBOARDING_STEPS})` : "GET STARTED"}
                    </button>

                    <div className="flex justify-center gap-2">
                        {Array.from({ length: MAX_ONBOARDING_STEPS }).map((_, i) => (
                            <div key={i} className={`w-2.5 h-2.5 rounded-full border border-slate-600 transition-colors ${onboardingStep === i + 1 ? 'bg-primary' : 'bg-slate-700'}`} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
