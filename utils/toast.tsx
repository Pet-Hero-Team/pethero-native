import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

const toastConfig = {
    success: ({ text1, text2 }) => (
        <View style={{ backgroundColor: '#15803d', padding: 16, borderRadius: 8, flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4, elevation: 5, zIndex: 1000 }}>
            <Ionicons name="checkmark-circle" size={24} color="white" style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
                {text1 && <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>{text1}</Text>}
                {text2 && <Text style={{ color: 'white', fontSize: 14 }}>{text2}</Text>}
            </View>
        </View>
    ),
    error: ({ text1, text2 }) => (
        <View style={{ backgroundColor: '#ef4444', padding: 16, borderRadius: 8, flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4, elevation: 5, zIndex: 1000 }}>
            <Ionicons name="alert-circle" size={24} color="white" style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
                {text1 && <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>{text1}</Text>}
                {text2 && <Text style={{ color: 'white', fontSize: 14 }}>{text2}</Text>}
            </View>
        </View>
    ),
    info: ({ text1, text2 }) => (
        <View style={{ backgroundColor: '#3b82f6', padding: 16, borderRadius: 8, flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 4, elevation: 5, zIndex: 1000 }}>
            <Ionicons name="information-circle" size={24} color="white" style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
                {text1 && <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>{text1}</Text>}
                {text2 && <Text style={{ color: 'white', fontSize: 14 }}>{text2}</Text>}
            </View>
        </View>
    ),
};
