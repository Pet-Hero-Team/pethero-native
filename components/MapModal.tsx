
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import React from 'react';
import { Dimensions, Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import Toast from 'react-native-toast-message';
import ModalContainer from './ModalContainer';

const { height } = Dimensions.get('window');

interface MapModalProps {
    isVisible: boolean;
    onClose: () => void;
    reportLocation: {
        title: string;
        latitude: number;
        longitude: number;
        address: string;
    } | null;
}

export default function MapModal({ isVisible, onClose, reportLocation }: MapModalProps) {
    const handleCopyAddress = async () => {
        if (reportLocation?.address) {
            await Clipboard.setStringAsync(reportLocation.address);
            Toast.show({
                type: 'info',
                text1: '주소가 복사되었습니다.',
            });
        }
    };

    const handleNavigate = () => {
        if (!reportLocation) {
            Toast.show({
                type: 'error',
                text1: '위치 정보가 없습니다.',
            });
            return;
        }

        const { latitude, longitude, address } = reportLocation;
        const scheme = Platform.select({
            ios: 'maps:0,0?q=',
            android: 'geo:0,0?q=',
        });
        const latLng = `${latitude},${longitude}`;
        const label = address;
        const url = Platform.select({
            ios: `${scheme}${label}@${latLng}`,
            android: `${scheme}${latLng}(${label})`,
        });

        if (url) {
            Linking.openURL(url).catch(err => {
                console.error('An error occurred', err);
                Toast.show({
                    type: 'error',
                    text1: '지도 앱을 열 수 없습니다.',
                });
            });
        }
    };

    const initialRegion: Region = {
        latitude: reportLocation?.latitude || 37.5665,
        longitude: reportLocation?.longitude || 126.9780,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    };

    return (
        <ModalContainer isVisible={isVisible} onClose={onClose}>
            <View className='px-6 pb-8'>
                <View className='pb-4'>
                    <Text className="text-xl text-neutral-800 font-bold">
                        위치정보
                    </Text>
                    <Pressable
                        className="flex-row items-center mt-2"
                        onPress={handleCopyAddress}
                    >
                        <Text
                            className="text-base text-gray-600 font-medium"
                            style={{ textDecorationLine: 'underline' }}
                        >
                            {reportLocation?.address || '위치 정보 없음'}
                        </Text>
                        <MaterialIcons
                            name="content-copy"
                            size={16}
                            color="#a3a3a3"
                            style={{ marginLeft: 8 }}
                        />
                    </Pressable>
                </View>
                <View style={styles.mapContainer}>
                    <MapView
                        provider={PROVIDER_GOOGLE}
                        style={styles.map}
                        initialRegion={initialRegion}
                        showsUserLocation
                        showsMyLocationButton={false}
                    >
                        {reportLocation && (
                            <Marker
                                coordinate={{
                                    latitude: reportLocation.latitude,
                                    longitude: reportLocation.longitude,
                                }}
                                title={reportLocation.title}
                                description={reportLocation.address}
                            >
                                <View className="bg-white p-1 rounded-full border-2 border-[#FF6347] items-center justify-center">
                                    <Ionicons name="paw" size={24} color="#FF6347" />
                                </View>
                            </Marker>
                        )}
                    </MapView>
                </View>
                <Pressable
                    className="bg-blue-500 py-4 mt-6 rounded-xl flex-row items-center justify-center"
                    onPress={handleNavigate}
                >
                    <Ionicons name="navigate-circle-outline" size={24} color="white" />
                    <Text className="text-white text-lg font-bold ml-2">경로 따라가기</Text>
                </Pressable>
            </View>
        </ModalContainer>
    );
}

const styles = StyleSheet.create({
    mapContainer: {
        width: '100%',
        height: height * 0.3,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#eee',
    },
    map: {
        width: '100%',
        height: '100%',
    },
});
