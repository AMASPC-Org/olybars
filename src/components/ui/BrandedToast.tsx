import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { X, AlertCircle, CheckCircle2, Info } from 'lucide-react';

interface Toast {
    id: string;
    message: string;
    type: 'error' | 'success' | 'info';
}

interface ToastContextType {
    showToast: (message: string, type?: 'error' | 'success' | 'info') => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: 'error' | 'success' | 'info' = 'error') => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, message, type }]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 w-full max-w-xs px-4 pointer-events-none">
                {toasts.map((toast) => (
                    <BrandedToast
                        key={toast.id}
                        toast={toast}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

interface BrandedToastProps {
    toast: Toast;
    onClose: () => void;
}

const BrandedToast: React.FC<BrandedToastProps> = ({ toast, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColor = toast.type === 'error' ? 'bg-primary' : 'bg-surface';
    const textColor = toast.type === 'error' ? 'text-black' : 'text-white';
    const borderColor = toast.type === 'error' ? 'border-black' : 'border-primary';

    return (
        <div
            className={`
        ${bgColor} ${textColor} border-2 ${borderColor} 
        p-4 shadow-[4px_4px_0px_0px_#000] flex items-start gap-3 
        animate-in slide-in-from-bottom-5 duration-300 pointer-events-auto
      `}
        >
            <div className="shrink-0 mt-0.5">
                {toast.type === 'error' && <AlertCircle className="w-5 h-5" strokeWidth={3} />}
                {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-primary" strokeWidth={3} />}
                {toast.type === 'info' && <Info className="w-5 h-5 text-primary" strokeWidth={3} />}
            </div>
            <div className="flex-1">
                <p className="text-xs font-black uppercase tracking-tight font-league leading-tight">
                    {toast.message}
                </p>
            </div>
            <button
                onClick={onClose}
                className="shrink-0 hover:opacity-70 transition-opacity"
            >
                <X className="w-4 h-4" strokeWidth={4} />
            </button>
        </div>
    );
};
