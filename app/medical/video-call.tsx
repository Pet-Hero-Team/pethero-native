// app/video-call.tsx
import {
    RTCView,
    useMeeting,
    useParticipant,
} from "@videosdk.live/react-native-sdk";
import { useEffect, useState } from "react";
import { Button, StyleSheet, View } from "react-native";

const VideoCallScreen = () => {
    const [meetingId, setMeetingId] = useState(null);

    const token = "";
    const meetingIdDefault = "";

    const { join, leave } = useMeeting({
        meetingId: meetingId || meetingIdDefault,
        token,
        participantId: "user1",
        micEnabled: true,
        webcamEnabled: true,
    });

    const { webcamStream } = useParticipant("user1");

    useEffect(() => {
        setMeetingId(meetingIdDefault);
    }, []);

    return (
        <View style={styles.container}>
            {webcamStream && (
                <RTCView
                    streamURL={webcamStream.url}
                    style={styles.video}
                    objectFit="cover"
                />
            )}
            <Button title="진료 시작" onPress={join} />
            <Button title="진료 종료" onPress={leave} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: "center", alignItems: "center" },
    video: { width: "100%", height: 300, backgroundColor: "black" },
});

export default VideoCallScreen;