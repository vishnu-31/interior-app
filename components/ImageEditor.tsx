import React, { useState, useRef } from 'react';
import {
  View,
  Image,
  Animated,
  PanResponder,
  LayoutChangeEvent,
} from 'react-native';
import Slider from '@react-native-community/slider';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { Button } from './ui/button';
import { Text } from './ui/text';

const ImageEditor = () => {
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [overlayImage, setOverlayImage] = useState(null);
  const [overlayPosition, setOverlayPosition] = useState({ x: 50, y: 50 });
  const [overlayDimensions, setOverlayDimensions] = useState({ width: 100, height: 100 });
  const [aspectRatio, setAspectRatio] = useState(1); // Default 1:1 aspect ratio
  const [backgroundDimensions, setBackgroundDimensions] = useState({ width: 800, height: 600 });
  const [containerDimensions, setContainerDimensions] = useState({ width: 100, height: 100 });

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


        // Ensure the overlay stays within the container bounds

        newX = Math.min(newX, containerDimensions.width - overlayDimensions.width);
        newY = Math.min(newY, containerDimensions.height - overlayDimensions.height);
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
    <View className="flex-1 p-4 bg-gray-100">
      <View className='flex flex-row m-2 gap-2'>
        <Button onPress={pickBackgroundImage} className='flex flex-1'>
          <MaterialIcons name="file-upload" size={15} color="#fff" />
          <Text>Background</Text>
        </Button>

        <Button onPress={pickOverlayImage} className='flex flex-1'>
          <MaterialIcons name="file-upload" size={15} color="#fff" />
          <Text>Overlay</Text>
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
        <Text className="text-base font-medium mb-2">Overlay Size</Text>
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

      <View className="bg-gray-200 rounded-lg p-4">
        <Text className="text-base font-medium mb-2">Overlay Image Information</Text>
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
            <Text className="text-sm mr-1">Aspect Ratio:</Text>
            <Text className="text-sm font-medium">{aspectRatio.toFixed(3)}</Text>
          </View>
        </View>
      </View>

      <Button><Text>Submit</Text></Button>

    </View>
  );
};

export default ImageEditor;