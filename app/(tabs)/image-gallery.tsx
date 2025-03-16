import React from 'react';
import { View, Image, ScrollView, Dimensions } from 'react-native';

import { Text } from '@/components/ui/text';
import { useRenovatedImages } from '@/lib/RenovatedImagesContext';
import { useRouter } from 'expo-router';

import { Button } from '@/components/ui/button';

interface ImageGalleryProps {
    imageURIs?: string[];
    title?: string;
}

const { width } = Dimensions.get('window');
const imageWidth = width * 0.9; // 90% of screen width
// const imageHeight = imageWidth * 0.75; // 3:4 aspect ratio

export default function ImageGallery({
    imageURIs = [],
    // title = 'Image Gallery'
}: ImageGalleryProps) {
    // Default placeholder images if none provided
    const router = useRouter();
    const { setImages, roomImage, setRoomImage, backgroundImage, setBackgroundImage } = useRenovatedImages();

    const defaultImages = [
        'https://placehold.co/600x400/png',
        'https://placehold.co/600x400/png',
        'https://placehold.co/600x400/png',
        'https://placehold.co/600x400/png',
        'https://placehold.co/600x400/png',
    ];
    console.log("")
    // Use provided images or fallback to defaults if none provided
    const displayImages = imageURIs.length > 0 ? imageURIs : defaultImages;

    return (
        <>
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 20, alignItems: 'center' }}
                showsVerticalScrollIndicator={false}
            >
                {displayImages.map((uri, index) => (
                    <View key={`image-${index}`} className="mb-4 min-h-32" style={{ width: imageWidth }}>
                        <Image source={{ uri }} className="rounded object-contain min-h-48" />
                        <Text className="bg-black/50 text-white font-bold p-2">Image {index + 1}</Text>
                        <View className='flex gap-2 '>
                            <Button onPress={() => {
                                setRoomImage(uri);
                                router.navigate("/(tabs)/renovate");
                            }}><Text>Renovate This</Text></Button>
                            <Button onPress={() => {
                                setBackgroundImage(uri);
                                router.navigate("/(tabs)/furniture");
                            }}><Text>Place Furniture</Text></Button>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </>
    );
} 