import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native';


export default function NotFoundScreen() {
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-white p-4">
      <Link href="/" className="text-blue-500 underline">
        404 - Page Not Found
      </Link>
    </SafeAreaView>
  );
}
