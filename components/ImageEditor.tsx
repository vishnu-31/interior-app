import React, { useState, useRef } from 'react';
import {
  View,
  Image,
  Animated,
  PanResponder,
  LayoutChangeEvent,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useRenovatedImages } from '@/lib/RenovatedImagesContext';
import Slider from '@react-native-community/slider';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { Button } from './ui/button';
import { Text } from './ui/text';
import { downloadImageToLocalStorage } from '@/lib/downloadToLocalStorage';

const ImageEditor = () => {
  const [overlayImage, setOverlayImage] = useState<string>("");
  const [overlayPosition, setOverlayPosition] = useState({ x: 50, y: 50 });
  const [overlayDimensions, setOverlayDimensions] = useState({ width: 100, height: 100 });
  const [aspectRatio, setAspectRatio] = useState(1); // Default 1:1 aspect ratio
  const [backgroundDimensions, setBackgroundDimensions] = useState({ width: 800, height: 600 });
  const [containerDimensions, setContainerDimensions] = useState({ width: 100, height: 100 });

  const router = useRouter();
  const { setImages, backgroundImage, setBackgroundImage } = useRenovatedImages();

  const onSubmit = async (
    inputData: {
      furniture: { x: number, y: number, w: number, h: number }
      area: { x: number, y: number, w: number, h: number }
    }) => {
    try {
      if (!backgroundImage) {
        Alert.alert('Error', 'Please select an image for the room');
        return;
      }

      let roomFileName = backgroundImage.split("/").pop()
      let roomFileType = roomFileName?.split(".").pop()

      let furnitureFileName = overlayImage.split("/").pop()
      let furnitureFileType = furnitureFileName?.split(".").pop()

      let apiUrl = "https://interior-api.onrender.com"
      // if (Platform.OS == "android") {
      //   apiUrl = "http://10.0.2.2:8000"
      // } else if (Platform.OS == "web") {
      //   apiUrl = "http://127.0.0.1:8000"
      // }

      const formData = new FormData();
      const roomImageBlob = {
        uri: backgroundImage,
        name: roomFileName,
        type: `image/${roomFileType}`
      }
      const furnitureImageBlob = {
        uri: overlayImage,
        name: furnitureFileName,
        type: `image/${furnitureFileType}`
      }

      formData.append('roomImage', roomImageBlob as unknown as Blob)
      formData.append('furnitureImage', furnitureImageBlob as unknown as Blob)

      formData.append("furniture", JSON.stringify(inputData.furniture) as string)
      formData.append("area", JSON.stringify(inputData.area) as string)
      const response = await fetch(`${apiUrl}/furniturePlace`, {
        method: 'POST',
        body: formData,
        headers: {
          // Remove the explicit Content-Type header for multipart/form-data
          // The browser will automatically set the correct Content-Type with boundary
          // 'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Server response:', errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      Alert.alert('Success', 'Furniture Placement request submitted successfully!');
      console.log('Response:', data);

      // Download the generated images if they exist in the response
      if (data && Array.isArray(data.data) && data.data.length > 0) {
        try {
          const downloadResults = await Promise.all(
            data.data.map(async (imageUrl: string, index: number) => {
              // Create a unique filename for each downloaded image
              const customFilename = `furniture_placed_${index}_${new Date().getTime()}.jpg`;

              if (Platform.OS === 'web') {
                // For web, we'll need to use a different approach
                // Create an anchor element to trigger download
                const link = document.createElement('a');
                link.href = imageUrl;
                link.download = customFilename;
                link.click();
                return { success: true, path: imageUrl }; // Use the original URL for web
              } else {
                // For mobile platforms, use the downloadImageToLocalStorage function
                const localUri = await downloadImageToLocalStorage(imageUrl, customFilename);
                return { success: true, path: localUri };
              }
            })
          );

          // Get the resulting image paths
          let resultingImages = downloadResults.map(element => element.path);

          // Set images in context
          setImages(resultingImages);

          Alert.alert(
            'Images Downloaded',
            `Successfully downloaded ${downloadResults.length} images`,
          );

          // Navigate to gallery
          router.push('/renovated-gallery');
        } catch (downloadError) {
          console.error('Error downloading images:', downloadError);
          Alert.alert('Download Error', 'Failed to download some images');
        }
      } else {
        console.log('No images found in the response to download');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to submit Furniture Placement request');
    }
  };

  // Create pan responder for dragging the overlay
  const panResponder = useRef(
    PanResponder.create({
      // onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      // onPanResponderGrant: () => {
      //   // Only set active resize corner if a corner is being touched
      //   if (!activeResizeCorner) {
      //     setActiveResizeCorner(null);
      //   }
      // },
      onPanResponderMove: (evt, gestureState) => {
        const { dx, dy } = gestureState;
        // console.log(gestureState)

        // Handle dragging
        let newX = overlayPosition.x + dx;
        let newY = overlayPosition.y + dy;
        if (newX < 0) { newX = 0 }
        if (newY < 0) { newY = 0 }

        // Ensure the overlay stays within the container bounds

        // newX = Math.min(newX, containerDimensions.width - overlayDimensions.width);
        // newY = Math.min(newY, containerDimensions.height - overlayDimensions.height);
        // console.log(`New X: ${newX} dx: ${dx}  New Y: ${newY} dy: ${dy}`)
        setOverlayPosition({ x: newX, y: newY });
        // console.log(`Overlay X: ${overlayPosition.x}  Overlay Y: ${overlayPosition.y}`)

      },

    })
  ).current;

  // Handle container layout change
  const handleContainerLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setContainerDimensions({ width, height });
  };

  // Pick background image
  const pickBackgroundImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedAsset = result.assets[0];
      setBackgroundImage(selectedAsset.uri);

      // Get image dimensions
      Image.getSize(selectedAsset.uri, (width, height) => {
        setBackgroundDimensions({ width, height });
      });
    }
  };

  // Pick overlay image
  const pickOverlayImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedAsset = result.assets[0];
      setOverlayImage(selectedAsset.uri);

      // Get image dimensions and calculate aspect ratio
      Image.getSize(selectedAsset.uri, (width, height) => {
        const newAspectRatio = width / height;
        setAspectRatio(newAspectRatio);
        setOverlayDimensions({ width, height });
      });
    }
  };

  // Handle overlay resize with slider
  const handleOverlayResize = (value: number) => {
    const scale = value / 100;
    const baseWidth = 400; // Base width for scaling
    const newWidth = Math.round(baseWidth * scale);
    const newHeight = Math.round(newWidth / aspectRatio);

    setOverlayDimensions({ width: newWidth, height: newHeight });
  };

  return (
    <View className="flex-1 p-4">
      <View className='flex flex-row m-2 gap-2'>
        <Button onPress={pickBackgroundImage} variant={"secondary"} className='flex flex-1'>
          <MaterialIcons name="file-upload" size={15} color="#fff" />
          <Text>Background</Text>
        </Button>

        <Button onPress={pickOverlayImage} variant={"secondary"} className='flex flex-1'>
          <MaterialIcons name="file-upload" size={15} color="#fff" />
          <Text>Furniture</Text>
        </Button>
      </View>

      <View className="bg-white rounded-lg overflow-hidden border border-gray-200 mb-4">
        <Animated.View
          className="w-full relative"
          style={[
            {
              aspectRatio: backgroundDimensions.width / backgroundDimensions.height,
            }
          ]}
          onLayout={handleContainerLayout}
        >
          {backgroundImage ? (
            <Image
              source={{ uri: backgroundImage }}
              className="w-full h-full"
              resizeMode="contain"
            />
          ) : (
            <View className="w-full h-full bg-gray-200" style={{ transform: [{ translateX: overlayPosition.x }, { translateY: overlayPosition.y }] }} />
          )}

          {overlayImage && (
            <View
              className="absolute"
              style={[
                {
                  width: overlayDimensions.width,
                  height: overlayDimensions.height,
                  left: overlayPosition.x,
                  top: overlayPosition.y,
                }
              ]}
              {...panResponder.panHandlers}
            >
              <Image
                source={{ uri: overlayImage }}
                className="w-full h-full "
                resizeMode="cover"
              />
            </View>
          )}

          <View className="absolute top-2 left-2 bg-black/50 p-2 rounded">
            <MaterialIcons name="open-with" size={20} color="#fff" />
          </View>
        </Animated.View>
      </View>

      <View className="mb-4">
        <Text className="text-base font-medium mb-2">Furniture Size</Text>
        <Slider
          className="w-full h-10"
          minimumValue={10}
          maximumValue={100}
          value={20}
          onValueChange={handleOverlayResize}
          minimumTrackTintColor="#2196F3"
          maximumTrackTintColor="#000000"
        />
      </View>

      <View className=" rounded-lg p-4">
        <Text className="text-base font-medium mb-2">Furniture Image Information</Text>
        <View className="flex flex-row flex-wrap">
          <View className="w-1/2 flex flex-row mb-1">
            <Text className="text-sm mr-1">Position X:</Text>
            <Text className="text-sm font-medium">{Math.round(overlayPosition.x)}px</Text>
          </View>
          <View className="w-1/2 flex flex-row mb-1">
            <Text className="text-sm mr-1">Position Y:</Text>
            <Text className="text-sm font-medium">{Math.round(overlayPosition.y)}px</Text>
          </View>
          <View className="w-1/2 flex flex-row mb-1">
            <Text className="text-sm mr-1">Width:</Text>
            <Text className="text-sm font-medium">{overlayDimensions.width}px</Text>
          </View>
          <View className="w-1/2 flex flex-row mb-1">
            <Text className="text-sm mr-1">Height:</Text>
            <Text className="text-sm font-medium">{overlayDimensions.height}px</Text>
          </View>
          <View className="w-1/2 flex flex-row mb-1">
            <Text className="text-sm mr-1">Background Height:</Text>
            <Text className="text-sm font-medium">{backgroundDimensions.height}px</Text>
          </View>
          <View className="w-1/2 flex flex-row mb-1">
            <Text className="text-sm mr-1">Background Width:</Text>
            <Text className="text-sm font-medium">{backgroundDimensions.width}px</Text>
          </View>
          {/* <View className="w-1/2 flex flex-row mb-1">
            <Text className="text-sm mr-1">Container Height:</Text>
            <Text className="text-sm font-medium">{containerDimensions.height}px</Text>
          </View> */}
          {/* <View className="w-1/2 flex flex-row mb-1">
            <Text className="text-sm mr-1">Container Width:</Text>
            <Text className="text-sm font-medium">{containerDimensions.width}px</Text>
          </View> */}
          <View className="w-1/2 flex flex-row mb-1">
            <Text className="text-sm mr-1">Aspect Ratio:</Text>
            <Text className="text-sm font-medium">{aspectRatio.toFixed(3)}</Text>
          </View>
        </View>
      </View>

      <Button
        variant={"secondary"}
        onPress={() => onSubmit(
          {
            furniture: {
              x: overlayPosition.x * (backgroundDimensions.width / containerDimensions.width),
              y: overlayPosition.y * (backgroundDimensions.height / containerDimensions.height),
              h: overlayDimensions.height * (backgroundDimensions.height / containerDimensions.height),
              w: overlayDimensions.width * (backgroundDimensions.width / containerDimensions.width)
            },
            area: {
              x: (overlayPosition.x > 20 ? overlayPosition.x - 20 : overlayPosition.x) * (backgroundDimensions.width / containerDimensions.width),
              y: (overlayPosition.y > 20 ? overlayPosition.y - 20 : overlayPosition.y) * (backgroundDimensions.height / containerDimensions.height),
              w: (overlayDimensions.width + overlayPosition.x + 20 < containerDimensions.width ? overlayDimensions.width + overlayPosition.x + 20 : overlayDimensions.width) * (backgroundDimensions.width / containerDimensions.width),
              h: (overlayDimensions.height + overlayPosition.y + 20 < containerDimensions.height ? overlayDimensions.height + overlayPosition.y + 20 : overlayDimensions.height) * (backgroundDimensions.height / containerDimensions.height),
            }
          }
        )}
      ><Text>Submit</Text></Button>

    </View >
  );
};

export default ImageEditor;