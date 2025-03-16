import React, { createContext, useState, useContext, ReactNode } from 'react';

interface RenovatedImagesContextType {
    images: string[];
    setImages: (images: string[]) => void;
    roomImage: string | null;
    setRoomImage: (image: string | null) => void;
    backgroundImage: string;
    setBackgroundImage: (image: string) => void;
}

const RenovatedImagesContext = createContext<RenovatedImagesContextType | undefined>(undefined);

export function RenovatedImagesProvider({ children }: { children: ReactNode }) {
    const [images, setImages] = useState<string[]>([]);
    const [roomImage, setRoomImage] = useState<string | null>(null);
    const [backgroundImage, setBackgroundImage] = useState<string>("");

    return (
        <RenovatedImagesContext.Provider value={{
            images,
            setImages,
            roomImage,
            setRoomImage,
            backgroundImage,
            setBackgroundImage
        }}>
            {children}
        </RenovatedImagesContext.Provider>
    );
}

export function useRenovatedImages() {
    const context = useContext(RenovatedImagesContext);
    if (context === undefined) {
        throw new Error('useRenovatedImages must be used within a RenovatedImagesProvider');
    }
    return context;
} 