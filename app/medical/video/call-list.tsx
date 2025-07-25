// app/medical/video/call-list.tsx
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import RNCallKeep from "react-native-callkeep";
// @ts-ignore
import uuid from "react-native-uuid";

const options = {
    ios: {
        appName: 'Pethero',
    },
    android: {
        alertTitle: '권한 필요',
        alertDescription: '전화 기능 사용을 위한 접근 권한이 필요합니다.',
        okButton: '확인'
    }
};

const hitSlop = { top: 10, left: 10, right: 10, bottom: 10 };

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: "#fff" },
    btn: {
        marginVertical: 10,
        padding: 14,
        backgroundColor: "#333",
        borderRadius: 6,
        alignItems: "center",
    },
    btnText: { color: "#fff", fontSize: 16 },
    callBox: { marginVertical: 6, padding: 10, borderWidth: 1, borderColor: "#ddd", borderRadius: 6 },
    log: { fontSize: 13, color: "#555" },
});

type Call = {
    uuid: string,
    number: string,
    held: boolean,
    muted: boolean,
};

const getRandomNumber = () => (Math.floor(100000 + Math.random() * 899999)).toString();

export default function CallKeepTestScreen() {
    const [calls, setCalls] = useState<{ [uuid: string]: Call }>({});
    const [logs, setLogs] = useState<string[]>([]);

    // 로그 남기기
    const log = (msg: string) => setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}]  ${msg}`]);

    // Callkeep 초기화
    useEffect(() => {
        RNCallKeep.setup(options)
            .then(() => log("Callkeep setup 완료"))
            .catch((e: any) => log("Callkeep setup 오류: " + (e?.message ?? e)));

        // 이벤트 리스너 등록
        RNCallKeep.addEventListener('answerCall', ({ callUUID }) => {
            log(`전화 응답됨 (uuid: ${callUUID})`);
            setCurrentCallActive(callUUID);
        });
        RNCallKeep.addEventListener('endCall', ({ callUUID }) => {
            log(`전화 종료됨 (uuid: ${callUUID})`);
            setCalls(prev => { const c = { ...prev }; delete c[callUUID]; return c; });
        });
        RNCallKeep.addEventListener('didPerformSetMutedCallAction', ({ muted, callUUID }) => {
            log(`${muted ? "뮤트" : "언뮤트"} (uuid: ${callUUID})`);
            setCalls(prev => ({
                ...prev,
                [callUUID]: { ...prev[callUUID], muted }
            }));
        });
        RNCallKeep.addEventListener('didToggleHoldCallAction', ({ hold, callUUID }) => {
            log(`${hold ? "홀드" : "언홀드"} (uuid: ${callUUID})`);
            setCalls(prev => ({
                ...prev,
                [callUUID]: { ...prev[callUUID], held: hold }
            }));
        });

        return () => {
            RNCallKeep.removeEventListener('answerCall', () => { });
            RNCallKeep.removeEventListener('endCall', () => { });
            RNCallKeep.removeEventListener('didPerformSetMutedCallAction', () => { });
            RNCallKeep.removeEventListener('didToggleHoldCallAction', () => { });
        };
    }, []);

    // 현재 전화 active 전환
    const setCurrentCallActive = (callUUID: string) => {
        const number = calls[callUUID]?.number ?? "";
        log(`Callkeep 액티브 설정 (uuid: ${callUUID}, number: ${number})`);
        RNCallKeep.setCurrentCallActive(callUUID);
    };

    // 가짜 전화 수신 노출
    const displayIncomingCall = () => {
        const callUUID = uuid.v4() as string;
        const number = getRandomNumber();
        log(`전화 수신 표시 (전화번호: ${number}, uuid: ${callUUID})`);
        setCalls(prev => ({ ...prev, [callUUID]: { uuid: callUUID, number, held: false, muted: false } }));
        RNCallKeep.displayIncomingCall(callUUID, number, number, 'number', false);
    };

    // 핸드폰에서 전화 끊기
    const hangup = (callUUID: string) => {
        log(`전화 종료 시도 (uuid: ${callUUID})`);
        RNCallKeep.endCall(callUUID);
        setCalls(prev => { const c = { ...prev }; delete c[callUUID]; return c; });
    };

    const setOnHold = (callUUID: string, hold: boolean) => {
        log(`${hold ? "홀드" : "언홀드"} 설정 (uuid: ${callUUID})`);
        RNCallKeep.setOnHold(callUUID, hold);
        setCalls(prev => ({ ...prev, [callUUID]: { ...prev[callUUID], held: hold } }));
    };
    const setMuted = (callUUID: string, muted: boolean) => {
        log(`${muted ? "뮤트" : "언뮤트"} 설정 (uuid: ${callUUID})`);
        RNCallKeep.setMutedCall(callUUID, muted);
        setCalls(prev => ({ ...prev, [callUUID]: { ...prev[callUUID], muted } }));
    };

    return (
        <View style={styles.container}>
            <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 15 }}>📞 CallKeep 테스트 화면</Text>
            <TouchableOpacity style={styles.btn} onPress={displayIncomingCall} hitSlop={hitSlop}>
                <Text style={styles.btnText}>가짜 전화 수신 UI 띄우기</Text>
            </TouchableOpacity>
            <ScrollView style={{ marginTop: 12, flex: 1 }} showsVerticalScrollIndicator={false}>
                {
                    Object.values(calls).length === 0 &&
                    <Text style={{ color: "#888", textAlign: "center", marginVertical: 16 }}>
                        활성화된 전화가 없습니다.
                    </Text>
                }
                {Object.values(calls).map(call =>
                    <View style={styles.callBox} key={call.uuid}>
                        <Text style={{ fontWeight: "bold" }}>전화번호: {call.number}</Text>
                        <Text>UUID: {call.uuid}</Text>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
                            <TouchableOpacity style={[styles.btn, { flex: 1, marginRight: 4, backgroundColor: call.held ? "#888" : "#0095ff" }]}
                                onPress={() => setOnHold(call.uuid, !call.held)} hitSlop={hitSlop}>
                                <Text style={styles.btnText}>{call.held ? "언홀드" : "홀드"}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.btn, { flex: 1, marginHorizontal: 4, backgroundColor: call.muted ? "#888" : "#f66" }]}
                                onPress={() => setMuted(call.uuid, !call.muted)} hitSlop={hitSlop}>
                                <Text style={styles.btnText}>{call.muted ? "언뮤트" : "뮤트"}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.btn, { flex: 1, marginLeft: 4, backgroundColor: "#222" }]}
                                onPress={() => hangup(call.uuid)} hitSlop={hitSlop}>
                                <Text style={styles.btnText}>전화 끊기</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                <Text style={{ fontWeight: "bold", marginTop: 22, marginBottom: 5 }}>로그</Text>
                {
                    logs.length === 0
                        ? <Text style={styles.log}>아직 로그 없음</Text>
                        : logs.slice(-100).reverse().map((l, i) => <Text key={i} style={styles.log}>{l}</Text>)
                }
            </ScrollView>
        </View>
    );
}
