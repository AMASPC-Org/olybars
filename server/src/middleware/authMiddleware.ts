import { Request, Response, NextFunction } from 'express';
import { auth, db, appCheck } from '../firebaseAdmin';

export interface AuthenticatedRequest extends Request {
    user?: {
        uid: string;
        email?: string;
        role?: string;
    };
    appCheck?: any;
}

/**
 * Middleware to verify Firebase App Check token
 */
export const verifyAppCheck = async (req: Request, res: Response, next: NextFunction) => {
    const appCheckToken = req.header('X-Firebase-AppCheck');

    if (!appCheckToken && process.env.NODE_ENV === 'production') {
        return res.status(401).json({ error: 'Unauthorized: Missing App Check token' });
    }

    if (!appCheckToken) {
        return next(); // Skip in development if no token
    }

    try {
        await appCheck.verifyToken(appCheckToken);
        next();
    } catch (error) {
        console.error('App Check verification failed:', error);
        return res.status(401).json({ error: 'Unauthorized: Invalid App Check token' });
    }
};

/**
 * Middleware to verify Firebase ID Token and attach user info to request
 */
export const verifyToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const idToken = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await auth.verifyIdToken(idToken);

        // Fetch User Role from Firestore for RBAC if needed
        const userDoc = await db.collection('users').doc(decodedToken.uid).get();
        const userData = userDoc.data();

        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            role: userData?.role || 'user'
        };

        next();
    } catch (error) {
        console.error('Error verifying token:', error);
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};

/**
 * Middleware to identify user if token is provided (non-blocking)
 */
export const identifyUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next();
    }

    const idToken = authHeader.split('Bearer ')[1];

    try {
        const decodedToken = await auth.verifyIdToken(idToken);

        // Fetch User Role from Firestore for RBAC
        const userDoc = await db.collection('users').doc(decodedToken.uid).get();
        const userData = userDoc.data();

        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            role: userData?.role || 'user'
        };
    } catch (error) {
        // Silently fail to continue as guest
    }
    next();
};

/**
 * Middleware to restrict access to specific roles
 */
export const requireRole = (roles: string[]) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role || '')) {
            return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
        }
        next();
    };
};
