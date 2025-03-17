import React from 'react';
import { ScrollView, View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import ImageGallery from '@/components/ImageGallery';
import { useRouter } from 'expo-router';
import { H1 } from '@/components/ui/typography';
import { useRenovatedImages } from '@/lib/RenovatedImagesContext';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function RenovatedGallery() {
    const { images } = useRenovatedImages();
    const router = useRouter();
    // console.log("Images in context", images)
    return (
        <SafeAreaView className="flex-1 p-4">
            <ScrollView>
                <H1 className="text-center mb-4">Your Renovated Spaces</H1>


                {images.length > 0 ? (
                    <ImageGallery
                        imageURIs={images}
                    />
                ) : (
                    <View className="flex-1 justify-center items-center p-4">
                        <Text className="text-center mb-4">No renovated images found. Create some renovations first!</Text>
                        <Button onPress={() => router.push('/renovate')}>
                            <Text>Go to Renovate</Text>
                        </Button>
                    </View>

                )
                }
            </ScrollView>
        </SafeAreaView>
    );

}