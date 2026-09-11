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
          headerShadowVisible: false, // CRITICAL: Removes shadow/line under header for flat design
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
            headerTitle: 'Consumption Statistics',
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