import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

export const toastConfig = {
    success: ({ text1, text2 }: { text1?: string; text2?: string }) => (
        <View
            style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#22c55e", // green-500
                padding: 16,
                borderRadius: 12,
                marginHorizontal: 16,
                marginBottom: 16,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 4,
            }}
        >
            <Ionicons name="checkmark-circle" size={24} color="white" style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
                {text1 && <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>{text1}</Text>}
                {text2 && <Text style={{ color: "white", fontSize: 14 }}>{text2}</Text>}
            </View>
        </View>
    ),
    error: ({ text1, text2 }: { text1?: string; text2?: string }) => (
        <View
            style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#ef4444",
                padding: 16,
                borderRadius: 12,
                marginHorizontal: 16,
                marginBottom: 16,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 4,
            }}
        >
            <Ionicons name="alert-circle" size={24} color="white" style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
                {text1 && <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>{text1}</Text>}
                {text2 && <Text style={{ color: "white", fontSize: 14 }}>{text2}</Text>}
            </View>
        </View>
    ),
    info: ({ text1, text2 }: { text1?: string; text2?: string }) => (
        <View
            style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#3b82f6", // blue-500
                padding: 16,
                borderRadius: 12,
                marginHorizontal: 16,
                marginBottom: 16,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 4,
            }}
        >
            <Ionicons name="information-circle" size={24} color="white" style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
                {text1 && <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>{text1}</Text>}
                {text2 && <Text style={{ color: "white", fontSize: 14 }}>{text2}</Text>}
            </View>
        </View>
    ),
};