import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import {
  Alert,
  Dimensions,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { rooms } from '../../assets/data/rooms';
import Colors from '../../constants/Colors';
import { useAuth } from '../../context/AuthContext';

const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height;

const Page = () => {
  const router = useRouter();
  const { client, authState, onRegister, onLogin } = useAuth();

  const handleAutoLogin = async () => {
    // 테스트 계정 정보
    const testEmail = 'test@example.com';
    const testPassword = 'password123';

    // 먼저 계정 등록 시도
    let result = await onRegister!(testEmail, testPassword);
    if (result.error && result.msg !== 'User already exists.') {
      Alert.alert('Error', result.msg);
      return;
    }

    // 등록 성공 또는 이미 존재하면 로그인 시도
    result = await onLogin!(testEmail, testPassword);
    if (result.error) {
      Alert.alert('Error', result.msg);
    } else {
      Alert.alert('Success', `Logged in as ${testEmail}`);
    }
  };

  const onStartMeeting = async () => {
    if (!authState?.authenticated) {
      Alert.alert('Error', 'You must be logged in to start a meeting');
      return;
    }
    if (!client) {
      Alert.alert('Error', 'Stream client is not initialized');
      return;
    }
    const randomId = Math.floor(Math.random() * 1000000000).toString();
    router.push(`/(inside)/(room)/${randomId}`);
  };

  const onJoinMeeting = () => {
    if (!authState?.authenticated) {
      Alert.alert('Error', 'You must be logged in to join a meeting');
      return;
    }
    if (!client) {
      Alert.alert('Error', 'Stream client is not initialized');
      return;
    }
    Alert.prompt(
      'Join',
      'Please enter your Call ID:',
      (id) => {
        console.log('Joining call: ', id);
        router.push(`/(inside)/(room)/${id}`);
      },
      'plain-text'
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
      {!authState?.authenticated && (
        <TouchableOpacity onPress={handleAutoLogin} style={styles.button}>
          <Ionicons name="log-in-outline" size={24} />
          <Text style={styles.buttonText}>Auto Login (Test)</Text>
        </TouchableOpacity>
      )}
      {authState?.authenticated && (
        <>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity onPress={onStartMeeting} style={styles.button}>
              <Ionicons name="videocam-outline" size={24} />
              <Text style={styles.buttonText}>Start new Meeting</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onJoinMeeting} style={styles.button}>
              <Ionicons name="business-outline" size={24} />
              <Text style={styles.buttonText}>Join Meeting by ID</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.divider}>
            <View style={{ flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: '#000' }} />
            <Text style={{ fontSize: 18 }}>or join public room</Text>
            <View style={{ flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: '#000' }} />
          </View>
          <View style={styles.wrapper}>
            {rooms.map((room, index) => (
              <Link href={`/(inside)/(room)/${room.id}`} key={index} asChild>
                <TouchableOpacity>
                  <ImageBackground
                    key={index}
                    source={room.img}
                    style={styles.image}
                    imageStyle={{ borderRadius: 10 }}
                  >
                    <View style={styles.overlay}>
                      <Text style={styles.text}>{room.name}</Text>
                    </View>
                  </ImageBackground>
                </TouchableOpacity>
              </Link>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: WIDTH > HEIGHT ? 'row' : 'column',
    gap: 20,
  },
  button: {
    flex: 1,
    gap: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.secondary,
    margin: 20,
    padding: 30,
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 10,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 40,
  },
  image: {
    width: WIDTH > HEIGHT ? WIDTH / 4 - 30 : WIDTH - 40,
    height: 300,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 10,
  },
  text: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Page;