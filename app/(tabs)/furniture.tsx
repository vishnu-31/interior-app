// import { Image, View } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import * as ImagePicker from "expo-image-picker";
// import { H1 } from '@/components/ui/typography';
// import { Text } from '@/components/ui/text';
// import { Button } from '@/components/ui/button';
// import { useState } from 'react';

// export default function TabTwoScreen() {

//   const [roomImage, setRoomImage] = useState<String | null>(null);

//   const [furnitureImage, setFurnitureImage] = useState<String | null>(null);

//   const pickImage = async (imageType: "room" | "furniture") => {

//     let result = await ImagePicker.launchImageLibraryAsync({
//       mediaTypes: ['images'],
//       allowsEditing: false,
//       quality: 1
//     });

//     console.log(result);

//     if (!result.canceled) {
//       if (imageType == "room") {
//         setRoomImage(result.assets[0].uri)
//         console.log("ROOM", roomImage)
//       } else if (imageType == "furniture") {
//         setFurnitureImage(result.assets[0].uri)
//         console.log("FURNITURE", furnitureImage)
//       }
//     }
//   }

//   return (
//     <SafeAreaView className='pt-4 flex flex-col  gap-4'>
//       <H1 className='text-center'>Furniture Placement</H1>
//       <View className='flex flex-col gap-4 '>
//         <View className='mx-auto flex flex-col gap-3 '>
//           <Button className='mx-auto' onPress={async () => pickImage("room")}><Text>Upload Room Image</Text></Button>
//           {roomImage && <Image source={{ uri: roomImage }} className={`min-w-[80%] object-contain min-h-48`} />}
//         </View>
//         <View className='mx-auto flex flex-col gap-3 '>
//           <Button className='mx-auto' onPress={async () => pickImage("furniture")}><Text>Upload Furniture Image</Text></Button>
//           {roomImage && <Image source={{ uri: furnitureImage }} className={`min-w-[80%] object-contain min-h-48`} />}
//         </View>
//         {/* place the custo component from v0 and make it work */}
//       </View>
//     </SafeAreaView>
//   );
// }





import ImageEditor from "@/components/ImageEditor";
import { View } from "react-native";


export default function furnitureScreen() {
  return (
    <View className="flex w-full h-full">
      <ImageEditor />
    </View>
  )
}