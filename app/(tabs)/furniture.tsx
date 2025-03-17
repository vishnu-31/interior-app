import ImageEditor from "@/components/ImageEditor";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function furnitureScreen() {
  return (
    <SafeAreaView className="flex w-full h-full">
      <ScrollView>
        <ImageEditor />
      </ScrollView>
    </SafeAreaView>
  )
}