import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#007AFF',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerTitle: 'GroceWise',
        }}
      />
      {/* 📊 AGGIUNTA DELLA SCHERMATA DELLE STATISTICHE */}
      <Stack.Screen
        name="analytics"
        options={{
          headerTitle: 'Statistiche Consumi',
        }}
      />
    </Stack>
  );
}