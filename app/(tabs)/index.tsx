import { View } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { H1 } from '@/components/ui/typography';

export default function HomeScreen() {
  return (
    <SafeAreaView className='flex flex-col m-4 gap-4'>
      <View>
        <H1 className='text-center'>Welcome to our Interior Design App</H1>
      </View>
      <View className='flex flex-col gap-8 items-center mx-auto my-auto  h-[60%]'>
        <Link href="/(tabs)/renovate" asChild>
          <Button className='w-40' >
            <Text>Renovate</Text>
          </Button>
        </Link>
        <Link href="/(tabs)/furniture" asChild>
          <Button className='w-40'>
            <Text> Furniture Placement</Text>
          </Button>
        </Link>
      </View>
    </SafeAreaView>
  );
}

