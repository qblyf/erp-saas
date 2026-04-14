import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to login or dashboard based on auth state
  // The tabs layout will handle auth check
  return <Redirect href="/(tabs)/dashboard" />;
}
