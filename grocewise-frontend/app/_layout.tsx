import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { colors } from '../src/styles/commonStyles';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
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
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});