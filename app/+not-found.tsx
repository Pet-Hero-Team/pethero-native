import { Link } from 'expo-router';


export default function NotFoundScreen() {
  return (
    <>
      <Link href="/" className="text-blue-500 underline">
        404 - Page Not Found
      </Link>
    </>
  );
}
