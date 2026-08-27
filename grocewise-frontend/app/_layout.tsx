import { Stack } from 'expo-router';
import { colors } from '../src/styles/commonStyles'; // Assicurati che il percorso sia corretto

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.white,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerShadowVisible: false, // FONDAMENTALE: Rimuove l'ombra/linea sotto l'header per il flat design
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerTitle: 'GroceWise',
        }}
      />
      <Stack.Screen
        name="analytics"
        options={{
          headerTitle: 'Statistiche Consumi',
        }}
      />
    </Stack>
  );
}