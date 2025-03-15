import { H1 } from '@/components/ui/typography';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import { View, Image } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  prompt: String,
  renovationType: Option
}


export default function Renovate() {
  const [roomImage, setRoomImage] = useState<string | null>(null);

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
  } = useForm({
    defaultValues: {
      prompt: "",
      renovationType: "interior",
    },
  })
  const onSubmit = (data: RenovationInput) => {

    let result = { roomImage, ...data }
    console.log(result)

  }


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
            <Select value={value} onValueChange={onChange}>
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


        <Button className='w-28' onPress={handleSubmit(onSubmit)}><Text>Submit</Text></Button>
      </View>

    </SafeAreaView>
  );
}
