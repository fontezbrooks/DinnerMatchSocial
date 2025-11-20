import { Stack } from 'expo-router/stack';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="modal"
        options={{
          presentation: 'modal',
          headerShown: true,
          title: 'Details',
        }}
      />
    </Stack>
  );
}
