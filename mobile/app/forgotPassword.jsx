import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Link, router } from "expo-router";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleResetPassword = () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address");
      return;
    }
    
    if (!email.includes("@") || !email.includes(".")) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }
    
    // TODO: Connect to backend
    Alert.alert(
      "Reset Email Sent",
      `Instructions sent to ${email}`,
      [{ text: "OK", onPress: () => router.back() }]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.innerContainer}>
        <Image
          source={require("../assets/images/login_person.png")}
          style={styles.image}
        />

        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.subtitle}>
          Enter your email and we'll send reset instructions.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor="#8b7768"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
          <Text style={styles.buttonText}>Send Reset Link</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Remember password? </Text>
          <Link href="/login" style={styles.loginLink}>
            Back to Login
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5efe6" },
  innerContainer: { flex: 1, paddingHorizontal: 32, justifyContent: "center" },
  image: { width: 250, height: 200, alignSelf: "center", marginBottom: 30, resizeMode: "contain" },
  title: { fontSize: 32, fontWeight: "800", color: "#4a3b31", marginBottom: 12, textAlign: "center" },
  subtitle: { fontSize: 16, color: "#7a6659", textAlign: "center", marginBottom: 40, lineHeight: 22 },
  input: { 
    backgroundColor: "#efe6d8", color: "#4a3b31", paddingHorizontal: 20, paddingVertical: 16, 
    borderRadius: 20, fontSize: 16, marginBottom: 24, borderWidth: 1, borderColor: "#d9c9b8" 
  },
  button: { 
    backgroundColor: "#5b4334", paddingVertical: 16, borderRadius: 26, alignItems: "center", 
    marginBottom: 24 
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
  footerText: { color: "#7a6659", fontSize: 14 },
  loginLink: { color: "#5b4334", fontSize: 14, fontWeight: "600", textDecorationLine: "underline" },
});