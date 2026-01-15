import { useState, useCallback } from 'react';

interface DragAndDropOptions {
    onDrop: (file: File) => void;
    allowedTypes?: string[];
}

export const useDragAndDrop = ({ onDrop, allowedTypes = ['image/jpeg', 'image/png', 'image/webp'] }: DragAndDropOptions) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const file = files[0];
            if (allowedTypes.includes(file.type)) {
                onDrop(file);
            }
        }
    }, [onDrop, allowedTypes]);

    return {
        isDragging,
        handleDragOver,
        handleDragLeave,
        handleDrop
    };
};
