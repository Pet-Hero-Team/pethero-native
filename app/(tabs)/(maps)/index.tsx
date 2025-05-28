import Fontisto from '@expo/vector-icons/Fontisto';
import Foundation from '@expo/vector-icons/Foundation';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';

export default function MapScreen() {
  return (
    <View style={styles.container} className='relative'>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.015,
          longitudeDelta: 0.0121,
        }}
      />
      <View className="absolute z-50 bottom-0 flex-1">
        <View className='px-6 pb-6 relative rounded-t-3xl bg-white'>
          <View className='w-full pt-5 pb-2'>
            <View className='bg-neutral-300 mx-auto w-11 rounded-full h-[5px]'></View>
          </View>
          <View className="flex-row justify-between items-center w-full">
            <View>
              <View className='flex-row items-center'>
                <Text className="text-xl text-neutral-800 font-bold mr-1">라이</Text>
                <Foundation name="female-symbol" size={17} color="#ef4444" />
              </View>
              <View className='flex-row items-center mt-1'>
                <Fontisto name="map-marker-alt" size={12} color="#a3a3a3" />
                <Text className="text-sm text-neutral-600 ml-1">서울시 강남구 32길 7</Text>
              </View>

              {/* <Foundation name="male-symbol" size={24} color="black" /> */}
              {/* <Fontisto name="neuter" size={24} color="black" /> */}
              <Text className="font-semibold text-lg text-neutral-800 mt-1">350,000₩</Text>
              <Text className="text-xs text-neutral-500 mt-2">
                362m ·강남
              </Text>

            </View>
            <Image
              source={{ uri: 'https://picsum.photos/200/300' }}
              className="w-24 h-24 rounded-lg"
            />
          </View>
          <View className="flex-row items-center justify-between mt-6">
            <Pressable
              onPress={() => console.log('제보하기')}
              className="flex-1 bg-orange-500 py-3 rounded-lg mr-2"
            >
              <Text className="text-white text-lg font-bold text-center">제보하기</Text>
              {/* 여러명 있는듯한 느낌으로 프사 여러개 */}
            </Pressable>
            <Pressable
              onPress={() => console.log('상세정보')}
              className="flex-1 bg-neutral-600 py-3 rounded-lg ml-2"
            >
              <Text className="text-white text-lg font-bold text-center">상세정보</Text>
            </Pressable>
          </View>
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});