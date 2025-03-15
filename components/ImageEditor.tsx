import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
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
  const [activeResizeCorner, setActiveResizeCorner] = useState<string | null>(null);

  // Create pan responder for dragging the overlay
  const panResponder = useRef(
    PanResponder.create({
      // onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // Only set active resize corner if a corner is being touched
        if (!activeResizeCorner) {
          setActiveResizeCorner(null);
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        const { dx, dy } = gestureState;

        if (activeResizeCorner) {
          // Handle resizing
          let newWidth = overlayDimensions.width;
          let newHeight = overlayDimensions.height;
          let newX = overlayPosition.x;
          let newY = overlayPosition.y;

          switch (activeResizeCorner) {
            case 'bottomRight':
              // Determine which dimension to prioritize based on drag direction
              if (Math.abs(dx) > Math.abs(dy)) {
                newWidth = Math.max(50, overlayDimensions.width + dx);
                newHeight = newWidth / aspectRatio;
              } else {
                newHeight = Math.max(50, overlayDimensions.height + dy);
                newWidth = newHeight * aspectRatio;
              }
              break;
            case 'bottomLeft':
              if (Math.abs(dx) > Math.abs(dy)) {
                newWidth = Math.max(50, overlayDimensions.width - dx);
                newHeight = newWidth / aspectRatio;
                newX = overlayPosition.x + dx;
              } else {
                newHeight = Math.max(50, overlayDimensions.height + dy);
                newWidth = newHeight * aspectRatio;
                newX = overlayPosition.x + (overlayDimensions.width - newWidth);
              }
              break;
            case 'topRight':
              if (Math.abs(dx) > Math.abs(dy)) {
                newWidth = Math.max(50, overlayDimensions.width + dx);
                newHeight = newWidth / aspectRatio;
                newY = overlayPosition.y + (overlayDimensions.height - newHeight);
              } else {
                newHeight = Math.max(50, overlayDimensions.height - dy);
                newWidth = newHeight * aspectRatio;
                newY = overlayPosition.y + dy;
              }
              break;
            case 'topLeft':
              if (Math.abs(dx) > Math.abs(dy)) {
                newWidth = Math.max(50, overlayDimensions.width - dx);
                newHeight = newWidth / aspectRatio;
                newX = overlayPosition.x + dx;
                newY = overlayPosition.y + (overlayDimensions.height - newHeight);
              } else {
                newHeight = Math.max(50, overlayDimensions.height - dy);
                newWidth = newHeight * aspectRatio;
                newX = overlayPosition.x + (overlayDimensions.width - newWidth);
                newY = overlayPosition.y + dy;
              }
              break;
          }

          // Ensure the overlay stays within the container bounds
          if (newX < 0) {
            newX = 0;
            newWidth = overlayPosition.x + overlayDimensions.width;
          }
          if (newY < 0) {
            newY = 0;
            newHeight = overlayPosition.y + overlayDimensions.height;
          }
          if (newX + newWidth > containerDimensions.width) {
            newWidth = containerDimensions.width - newX;
          }
          if (newY + newHeight > containerDimensions.height) {
            newHeight = containerDimensions.height - newY;
          }

          setOverlayPosition({ x: newX, y: newY });
          setOverlayDimensions({
            width: Math.round(newWidth),
            height: Math.round(newHeight),
          });
        } else {
          // Handle dragging
          let newX = overlayPosition.x + dx;
          let newY = overlayPosition.y + dy;

          // Ensure the overlay stays within the container bounds
          newX = Math.max(0, Math.min(newX, containerDimensions.width - overlayDimensions.width));
          newY = Math.max(0, Math.min(newY, containerDimensions.height - overlayDimensions.height));

          setOverlayPosition({ x: newX, y: newY });
        }
      },
      onPanResponderRelease: () => {
        setActiveResizeCorner(null);
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

  // Set corner resize handler
  const setResizeCorner = (corner: "topLeft" | "topRight" | "bottomLeft" | "bottomRight") => {
    setActiveResizeCorner(corner);
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
        // {...panResponder.panHandlers}
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
                className="w-full h-full"
                resizeMode="cover"
              />

              {/* Resize handles */}
              <Button
                className="absolute bottom-0 right-0 w-5 h-5 bg-slate-500 rounded-tl-lg justify-center items-center z-10"
                onPressIn={() => setResizeCorner('bottomRight')}
              >
                <MaterialIcons name="drag-handle" size={16} color="#fff" />
              </Button>

              <Button
                className="absolute bottom-0 left-0 w-5 h-5 bg-slate-500 rounded-tr-lg z-10"
                onPressIn={() => setResizeCorner('bottomLeft')}
              />

              <Button
                className="absolute top-0 right-0 w-5 h-5 bg-slate-500 rounded-bl-lg z-10"
                onPressIn={() => setResizeCorner('topRight')}
              />

              <Button
                className="absolute top-0 left-0 w-5 h-5 bg-slate-500 rounded-br-lg z-10"
                onPressIn={() => setResizeCorner('topLeft')}
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
    </View>
  );
};

export default ImageEditor;