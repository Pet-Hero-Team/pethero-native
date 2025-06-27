import { Ionicons } from '@expo/vector-icons';
import { Call, CallContent, StreamCall, StreamVideoEvent } from '@stream-io/video-react-native-sdk';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';
import Toast from 'react-native-toast-message';
import ChatView from '../../../../components/ChatView';
import CustomBottomSheet from '../../../../components/CustomBottomSheet';
import CustomCallControls, { reactions } from '../../../../components/CustomCallControls';
import CustomTopView from '../../../../components/CustomTopView';
import { useAuth } from '../../../../context/AuthContext';

const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height;

const Page = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const { client } = useAuth();
  const [call, setCall] = useState<Call | null>(null);

  console.log('Received counsel id:', id);
  console.log('Client available:', !!client);

  useEffect(() => {
    if (!client) return;

    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={shareCounsel}>
          <Ionicons name="share-outline" size={24} color="white" />
        </TouchableOpacity>
      ),
    });

    const unsubscribe = client.on('all', (event: StreamVideoEvent) => {
      console.log('Stream event:', event);

      if (event.type === 'call.reaction_new') {
        console.log(`New reaction: ${event.reaction}`);
      }

      if (event.type === 'call.session_participant_joined') {
        console.log(`New user joined the counsel: ${event.participant}`);
        const user = event.participant.user.name || 'Unknown';
        Toast.show({
          text1: 'User joined',
          text2: `Say hello to ${user} 👋`,
        });
      }

      if (event.type === 'call.session_participant_left') {
        console.log(`Someone left the counsel: ${event.participant}`);
        const user = event.participant.user.name || 'Unknown';
        Toast.show({
          text1: 'User left',
          text2: `Say goodbye to ${user} 👋`,
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [client, navigation]);

  useEffect(() => {
    if (!client || call) return;

    const joinCall = async () => {
      try {
        const call = client.call('default', id);
        await call.join({ create: true });
        setCall(call);
        console.log('Counsel joined:', id);
      } catch (error) {
        console.error('Error joining counsel:', error);
        Toast.show({
          text1: 'Error',
          text2: 'Failed to join the counsel',
        });
      }
    };

    joinCall();
  }, [client, call, id]);

  const goToHomeScreen = async () => {
    router.back();
  };

  const shareCounsel = async () => {
    Share.share({
      message: `Join my counsel: myapp://medical/counsels/(room)/${id}`,
    });
  };

  if (!client) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center', marginTop: 50 }}>
          Error: Stream client is not initialized
        </Text>
      </View>
    );
  }

  if (!call) {
    return <Spinner visible />;
  }

  return (
    <View style={{ flex: 1 }}>
      <StreamCall call={call}>
        <View style={styles.container}>
          <CallContent
            onHangupCallHandler={goToHomeScreen}
            CallControls={CustomCallControls}
            CallTopView={CustomTopView}
            supportedReactions={reactions}
            layout="grid"
          />
          {WIDTH > HEIGHT ? (
            <View style={styles.videoContainer}>
              <ChatView channelId={id} />
            </View>
          ) : (
            <CustomBottomSheet channelId={id} />
          )}
        </View>
      </StreamCall>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: WIDTH > HEIGHT ? 'row' : 'column',
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    textAlign: 'center',
    backgroundColor: '#fff',
  },
});

export default Page;