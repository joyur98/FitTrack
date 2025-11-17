import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: true, // show the header
          headerStyle: {
            backgroundColor: "#DCB083", // header background
          },
          headerTintColor: "#4a2c1a", // title + back button color
          headerTitleStyle: {
            fontWeight: "bold",
          },
          headerTitle: "",
        }}
      />
    </SafeAreaProvider>
  );
}
