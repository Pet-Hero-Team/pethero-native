import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  Alert,
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../../../context/AuthContext';

const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height;

const Page = () => {

  const { onLogout } = useAuth();
  const router = useRouter();
  const { client, authState, onRegister, onLogin, initialized } = useAuth();

  if (!initialized) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center', marginTop: 50 }}>Loading authentication...</Text>
      </View>
    );
  }

  const handleAutoLogin = async () => {
    const testEmail = 'test@example.com';
    const testPassword = 'password123';

    let result = await onRegister!(testEmail, testPassword);
    if (result.error && result.msg !== 'User already exists.') {
      Alert.alert('Error', result.msg);
      return;
    }

    result = await onLogin!(testEmail, testPassword);
    if (result.error) {
      Alert.alert('Error', result.msg);
    } else {
      Alert.alert('Success', `Logged in as ${testEmail}`);
    }
  };

  const onStartCounsel = async () => {
    if (!authState?.authenticated) {
      Alert.alert('Error', 'You must be logged in to start a counsel');
      return;
    }
    if (!client) {
      Alert.alert('Error', 'Stream client is not initialized');
      return;
    }
    const randomId = Math.floor(Math.random() * 1000000000).toString();
    console.log('Navigating to counsel:', `/medical/counsels/(room)/${randomId}`);
    router.push(`/medical/counsels/(room)/${randomId}`);
  };

  const onJoinCounsel = () => {
    if (!authState?.authenticated) {
      Alert.alert('Error', 'You must be logged in to join a counsel');
      return;
    }
    if (!client) {
      Alert.alert('Error', 'Stream client is not initialized');
      return;
    }
    Alert.prompt(
      'Join Counsel',
      'Please enter your Counsel ID:',
      (id) => {
        console.log('Joining counsel: ', id);
        router.push(`/medical/counsels/(room)/${id}`);
      },
      'plain-text'
    );
  };

  return (
    <SafeAreaView className='flex-1'>
      <View style={styles.container}>
        {!authState?.authenticated && (
          <TouchableOpacity onPress={handleAutoLogin} style={styles.button}>
            <Ionicons name="log-in-outline" size={24} color="white" />
            <Text style={styles.buttonText}>Auto Login (Test)</Text>
          </TouchableOpacity>
        )}
        {authState?.authenticated && (
          <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity onPress={onStartCounsel} style={styles.button}>
                <Ionicons name="videocam-outline" size={24} color="white" />
                <Text style={styles.buttonText}>Start New Counsel</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={onLogout}>
              <Ionicons name="log-out-outline" size={24} color="blue" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
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
    backgroundColor: '#0333C1',
    margin: 20,
    padding: 30,
    borderRadius: 10,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 10,
  },
});

export default Page;