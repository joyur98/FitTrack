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
        >
          {/* Authentication routes */}
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="login" />
          <Stack.Screen name="signup" />
          <Stack.Screen name="forgotPassword" />

          {/* Admin routes - no header */}
          <Stack.Screen name="admin" options={{ headerShown: false }} />

          {/* Regular user routes */}
          <Stack.Screen name="dashboard" options={{ headerShown: false }} />
          <Stack.Screen name="workout" options={{ headerShown: false }} />
          <Stack.Screen name="calories" options={{ headerShown: false }} />
          <Stack.Screen name="calorieBurnScreen" options={{ headerShown: false }} />
          <Stack.Screen name="settings" options={{ headerShown: false }} />
          <Stack.Screen name="profile" options={{ headerShown: false }} />
          <Stack.Screen name="fullbodyworkout" options={{ headerShown: false }} />
          <Stack.Screen name="upperbodystrength" options={{ headerShown: false }} />
          <Stack.Screen name="cardioBlast" options={{ headerShown: false }} />
          <Stack.Screen name="mentalFitness" options={{ headerShown: false }} />
        </Stack>

        {/* Floating AI bubble */}
        <AIBubble />
      </View>
    </SafeAreaProvider>
  );
}
