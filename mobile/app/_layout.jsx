import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View } from "react-native";
import AIBubble from "../components/AIBubble";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }}>
        <Stack
          screenOptions={({ route }) => ({
            headerShown:
              route.name === "login" || route.name === "signup",
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

        {/* Floating AI bubble */}
        <AIBubble />
      </View>
    </SafeAreaProvider>
  );
}
