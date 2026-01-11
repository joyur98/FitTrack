import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { router, usePathname } from "expo-router";

export default function AIBubble() {
  const path = usePathname();

  //Not to show in these pages
  if (["/login", "/signup", "/settings","/FTAI"].includes(path)) {
    return null;
  }

  return (
    <TouchableOpacity
      style={styles.bubble}
      onPress={() => router.push("/FTAI")}
    >
      <Text style={{ fontSize: 24 }}>🤖</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bubble: {
    position: "absolute",
    bottom: 100,
    right: 20,
    backgroundColor: "#7d6f63",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5
  }
});
