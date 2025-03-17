import React, { useState } from 'react';
import {
    View,
    Image,
    Alert,
    Platform,
    ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useRenovatedImages } from '@/lib/RenovatedImagesContext';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { useColorScheme } from '@/hooks/useColorScheme';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
    type Option
} from '@/components/ui/select';
import { downloadImageToLocalStorage } from '@/lib/downloadToLocalStorage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { H1 } from '@/components/ui/typography';

const StyleTransferPage = () => {
    const colorScheme = useColorScheme();
    const isDarkColorScheme = colorScheme === 'dark';

    const [secondaryImage, setSecondaryImage] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [styleOption, setStyleOption] = useState<Option>("" as unknown as Option);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const router = useRouter();
    const { setImages, roomImage, setRoomImage } = useRenovatedImages();

    const pickPrimaryImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: false,
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const selectedAsset = result.assets[0];
            setRoomImage(selectedAsset.uri);
        }
    };

    const pickSecondaryImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: false,
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const selectedAsset = result.assets[0];
            setSecondaryImage(selectedAsset.uri);
        }
    };

    const handleSubmit = async () => {
        try {
            if (!roomImage) {
                Alert.alert('Error', 'Please select a primary image');
                return;
            }

            if (!secondaryImage) {
                Alert.alert('Error', 'Please select a secondary image');
                return;
            }

            if (!description.trim()) {
                Alert.alert('Error', 'Please enter a description');
                return;
            }

            if (!styleOption) {
                Alert.alert('Error', 'Please select a style option');
                return;
            }

            setIsSubmitting(true);

            let primaryFileName = roomImage.split("/").pop();
            let primaryFileType = primaryFileName?.split(".").pop();

            let secondaryFileName = secondaryImage.split("/").pop();
            let secondaryFileType = secondaryFileName?.split(".").pop();

            let apiUrl = "https://interior-api.onrender.com";

            const formData = new FormData();
            const primaryImageBlob = {
                uri: roomImage,
                name: primaryFileName,
                type: `image/${primaryFileType}`
            };
            const secondaryImageBlob = {
                uri: secondaryImage,
                name: secondaryFileName,
                type: `image/${secondaryFileType}`
            };

            formData.append('primaryImage', primaryImageBlob as unknown as Blob);
            formData.append('secondaryImage', secondaryImageBlob as unknown as Blob);
            formData.append('description', description);

            const styleValue = typeof styleOption === 'string'
                ? styleOption
                : (styleOption as unknown as { value: string }).value;

            formData.append('style', styleValue);

            const response = await fetch(`${apiUrl}/customize`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.text();
                console.error('Server response:', errorData);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            Alert.alert('Success', 'Customization request submitted successfully!');
            console.log('Response:', data);

            if (data && Array.isArray(data.data) && data.data.length > 0) {
                try {
                    const downloadResults = await Promise.all(
                        data.data.map(async (imageUrl: string, index: number) => {
                            const customFilename = `customized_${index}_${new Date().getTime()}.jpg`;

                            if (Platform.OS === 'web') {
                                const link = document.createElement('a');
                                link.href = imageUrl;
                                link.download = customFilename;
                                link.click();
                                return { success: true, path: imageUrl };
                            } else {
                                const localUri = await downloadImageToLocalStorage(imageUrl, customFilename);
                                return { success: true, path: localUri };
                            }
                        })
                    );

                    let resultingImages = downloadResults.map(element => element.path);

                    setImages(resultingImages);

                    Alert.alert(
                        'Images Downloaded',
                        `Successfully downloaded ${downloadResults.length} images`,
                    );

                    router.push('/renovated-gallery');
                } catch (downloadError) {
                    console.error('Error downloading images:', downloadError);
                    Alert.alert('Download Error', 'Failed to download some images');
                }
            }
        } catch (error) {
            console.error('Error:', error);
            Alert.alert('Error', 'Failed to submit customization request');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView className='flex-1'>
            <ScrollView className="flex-1">
                <View className="p-4">
                    <H1 className="text-center mb-6">Transfer the Style</H1>

                    <View className="mb-6">
                        <Text className="text-base font-medium mb-2">Upload Images</Text>
                        <View className="flex gap-6 mb-4 ">
                            <View className="flex-1">
                                <Button
                                    onPress={pickPrimaryImage}
                                    variant={"secondary"}
                                    className="w-full mb-2"
                                >
                                    <MaterialIcons name="file-upload" size={15} color="#fff" />
                                    <Text className="ml-1">Primary Image</Text>
                                </Button>
                                {roomImage ? (
                                    <View className="bg-white rounded-lg overflow-hidden border border-gray-200 w-full h-32">
                                        <Image
                                            source={{ uri: roomImage }}
                                            className="w-full h-full"
                                            resizeMode="cover"
                                        />
                                    </View>
                                ) : (
                                    <View className="bg-gray-200 rounded-lg w-full h-32 items-center justify-center">
                                        <MaterialIcons name="image" size={32} color="#666" />
                                        <Text className="text-sm text-gray-500 mt-1">No image selected</Text>
                                    </View>
                                )}
                            </View>

                            <View className="flex-1">
                                <Button
                                    onPress={pickSecondaryImage}
                                    variant={"secondary"}
                                    className="w-full mb-2"
                                >
                                    <MaterialIcons name="file-upload" size={15} color="#fff" />
                                    <Text className="ml-1">Style Image</Text>
                                </Button>
                                {secondaryImage ? (
                                    <View className="bg-white rounded-lg overflow-hidden border border-gray-200 w-full h-32">
                                        <Image
                                            source={{ uri: secondaryImage }}
                                            className="w-full h-full"
                                            resizeMode="cover"
                                        />
                                    </View>
                                ) : (
                                    <View className="bg-gray-200 rounded-lg w-full h-32 items-center justify-center">
                                        <MaterialIcons name="image" size={32} color="#666" />
                                        <Text className="text-sm text-gray-500 mt-1">No image selected</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>

                    <View className="mb-6">
                        <Text className="text-base font-medium mb-2">What kind of Room is this?</Text>
                        <Input
                            value={description}
                            onChangeText={setDescription}
                            placeholder="e.g. Kitchen, living room, bedroom..."
                            multiline
                            numberOfLines={3}
                            className="min-h-[80px]"
                        />
                    </View>

                    <View className="m-8">
                        <Text className="text-base font-medium mb-2">What Type of Building is this?</Text>
                        <Select
                            value={styleOption}
                            onValueChange={setStyleOption}
                        >
                            <SelectTrigger>
                                <SelectValue className={isDarkColorScheme ? 'text-white' : 'text-black'} placeholder="Select a style" />
                            </SelectTrigger>
                            <SelectContent >
                                <SelectItem label="Residential" value="residential">
                                    <Text>Residential</Text>
                                </SelectItem>
                                <SelectItem label="Commercial" value="commercial">
                                    <Text>Commercial</Text>
                                </SelectItem>
                                <SelectItem label="Exterior" value="exterior">
                                    <Text>Exterior</Text>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </View>

                    <Button
                        onPress={handleSubmit}
                        disabled={isSubmitting}
                        className="mb-6"
                    >
                        {isSubmitting ? (
                            <Text>Processing...</Text>
                        ) : (
                            <Text>Submit Customization</Text>
                        )}
                    </Button>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default StyleTransferPage; 