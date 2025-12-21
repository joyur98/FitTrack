import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={({ route }) => ({
          headerShown: route.name === 'login' || route.name === 'signup', // Show header only on login/signup
          headerStyle: {
            backgroundColor: "#DCB083",
          },
          headerTintColor: "#4a2c1a",
          headerTitleStyle: {
            fontWeight: "bold",
          },
          headerTitle: "",
        })}
      />
    </SafeAreaProvider>
  );
}