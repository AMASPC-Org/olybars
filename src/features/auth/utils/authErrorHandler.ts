/**
 * Auth Error Handler Utility for OlyBars
 * Maps Firebase technical error codes to branded, user-friendly messages.
 */

export type AuthErrorCode =
    | 'auth/invalid-credential'
    | 'auth/user-not-found'
    | 'auth/wrong-password'
    | 'auth/too-many-requests'
    | 'auth/network-request-failed'
    | 'auth/email-already-in-use'
    | 'auth/weak-password'
    | string;

export const mapAuthErrorToMessage = (code: AuthErrorCode): string => {
    switch (code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
            return "Oops! That's not the right combo. Try again or reset your password.";

        case 'auth/user-not-found':
            return "We don't have that player in our league yet. Want to sign up?";

        case 'auth/too-many-requests':
            return "Slow down there, partner! Too many attempts. Try again in a bit.";

        case 'auth/network-request-failed':
            return "Network's acting up. Check your connection and try again.";

        case 'auth/email-already-in-use':
            return "That email is already in the game! Try logging in instead.";

        case 'auth/weak-password':
            return "That password's a bit thin. Make it at least 6 characters, champ.";

        default:
            // Fallback for unexpected errors
            if (code.includes('auth/')) {
                return "The league records had a hiccup. Please try again.";
            }
            return code || "Something went wrong. Let's try that again.";
    }
};
