import { H1 } from '@/components/ui/typography';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { View, Image, Alert, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system'; // For Expo projects

// Import the downloadImageToLocalStorage function
import { downloadImageToLocalStorage } from '@/lib/downloadToLocalStorage';
import { useRenovatedImages } from '@/lib/RenovatedImagesContext';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import * as ImagePicker from "expo-image-picker"
import { useForm, Controller } from "react-hook-form"
import { Input } from '@/components/ui/input';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Option } from '@rn-primitives/select';



type RenovationInput = {
  prompt: string,
  renovationType: Option | string
}


export default function Renovate() {
  let [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const { setImages, roomImage, setRoomImage } = useRenovatedImages();

  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };


  const pickImage = async () => {

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 1
    });

    console.log(result);

    if (!result.canceled) {
      setRoomImage(result.assets[0].uri)
      console.log(roomImage)
    }
  }


  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RenovationInput>({
    defaultValues: {
      prompt: "",
      renovationType: "interior" as unknown as Option,
    },
  });

  const onSubmit = async (renovateData: RenovationInput) => {
    setIsLoading(true);
    try {
      if (!roomImage) {
        Alert.alert('Error', 'Please select an image first');
        setIsLoading(false);
        return;
      }
      let fileName = roomImage.split("/").pop()
      let fileType = fileName?.split(".").pop()



      let apiUrl = "https://interior-api.onrender.com"
      // if (Platform.OS == "android") {
      //   apiUrl = "http://10.0.2.2:8000"
      // } else if (Platform.OS == "web") {
      //   apiUrl = "http://127.0.0.1:8000"
      // }
      const formData = new FormData();
      const imageBlob = {
        uri: roomImage,
        name: fileName,
        type: `image/${fileType}`,
      };
      formData.append('image', imageBlob as unknown as Blob);
      formData.append('prompt', renovateData.prompt as string);

      // Handle renovationType correctly
      const renovationType = typeof renovateData.renovationType === 'string'
        ? renovateData.renovationType
        : renovateData.renovationType?.value;

      formData.append('renovationType', renovationType as string);

      const response = await fetch(`${apiUrl}/renovate`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Server response:', errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Alert.alert('Success', 'Renovation request submitted successfully!');
      // console.log('Response:', data);

      // Download the generated images if they exist in the response
      if (data && Array.isArray(data.data) && data.data.length > 0) {
        try {
          const downloadResults = await Promise.all(
            data.data.map(async (imageUrl: string, index: number) => {
              // Create a unique filename for each downloaded image
              const customFilename = `renovated_image_${index}_${new Date().getTime()}.jpg`;

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

          // console.log('Downloaded images:', downloadResults);
          let resultingImages = downloadResults.map(element => element.path);

          // Store the images in context
          setImages(resultingImages);

          Alert.alert(
            'Images Downloaded',
            `Successfully downloaded ${downloadResults.length} images`,
          );
          router.push('/renovated-gallery')
        } catch (downloadError) {
          console.error('Error downloading images:', downloadError);
          Alert.alert('Download Error', 'Failed to download some images');
        }

      } else {
        console.log('No images found in the response to download');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to submit renovation request');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <SafeAreaView className='pt-4 flex flex-col gap-4'>

      <H1 className='text-center'>Renovate your Interior</H1>
      <View className='mx-auto flex flex-col gap-3 '>
        <Button className='mx-auto' onPress={pickImage}><Text>Upload Room Image</Text></Button>
        {roomImage && <Image source={{ uri: roomImage }} className={`min-w-[80%] object-contain min-h-48`} />}
      </View>

      <View className='flex flex-col p-4 gap-4 mx-4 items-center'>
        <Controller
          control={control}
          rules={{
            required: true,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Textarea
              placeholder="Describe how you want it to be"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              className='h-48'
            />
          )}
          name="prompt"
        />
        {errors.prompt && <Text>This is required.</Text>}

        <Controller
          control={control}
          rules={{
            required: true,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Select value={value as Option} onValueChange={onChange}>
              <SelectTrigger className='w-full'>
                <SelectValue
                  className='text-foreground text-sm native:text-lg'
                  placeholder='Select a Renovation Type'
                />
              </SelectTrigger>
              <SelectContent insets={contentInsets} className='w-full'>
                <SelectGroup>
                  <SelectLabel>Renovation Type</SelectLabel>
                  <SelectItem label='Interior' value='interior'>
                    Interior
                  </SelectItem>
                  <SelectItem label='Exterior' value='exterior'>
                    Exterior
                  </SelectItem>
                  <SelectItem label='Residential' value='residential'>
                    Residential
                  </SelectItem>

                </SelectGroup>
              </SelectContent>
            </Select>
          )}
          name="renovationType"
        />
        {errors.renovationType && <Text>This is required.</Text>}

        <View className="flex-row space-x-4">
          <Button className='w-28' disabled={isLoading} onPress={handleSubmit(onSubmit)}>
            <Text>{isLoading ? 'Processing...' : 'Submit'}</Text>
          </Button>
        </View>
      </View>

    </SafeAreaView>
  );
}