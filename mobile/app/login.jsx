import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Link, router } from "expo-router";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    console.log("Login pressed", { email, password });
    router.push("/dashboard");
  };

  const handleGuest = () => {
    console.log("Continue as guest");
    router.push("/dashboard");
  };

  const handleGoogleLogin = () => {
    console.log("Google login pressed");
  };

  return (
    <View style={styles.screen}>
      {/* Top Section with Branding */}
      <View style={styles.imageContainer}>
        {/* FitTrack Branding */}
        <View style={styles.brandingContainer}>
          {/* Fitness Icon */}
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>💪</Text>
          </View>
          
          {/* FitTrack Title */}
          <Text style={styles.appTitle}>FitTrack</Text>
          <Text style={styles.appSubtitle}>Your Fitness Journey Starts Here</Text>
        </View>
      </View>

      {/* Bottom Sheet */}
      <View style={styles.bottomSheet}>
        {/* Email */}
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#8e8e8e"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Password */}
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#8e8e8e"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Text style={styles.eyeText}>
              {showPassword ? "Hide" : "Show"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Forgot password */}
        <TouchableOpacity
          style={styles.forgotWrapper}
          onPress={() => router.push("/forgotPassword")}
        >
          <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>

        {/* Sign in */}
        <TouchableOpacity style={styles.signInButton} onPress={handleLogin}>
          <Text style={styles.signInText}>Sign in</Text>
        </TouchableOpacity>

        {/* Google login */}
        <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
          <View style={styles.googleIconCircle}>
            <Text style={styles.googleIconText}>G</Text>
          </View>
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        {/* Guest */}
        <TouchableOpacity style={styles.guestButton} onPress={handleGuest}>
          <Text style={styles.guestText}>Continue as guest</Text>
        </TouchableOpacity>

        {/* Footer */}
        <Text style={styles.footer}>
          Don't have an account?
          <Link href="/signup" style={styles.footerLink}> Sign up</Link>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#DCB083",
  },
  imageContainer: {
    flex: 1.2,
    justifyContent: "center",
    alignItems: "center",
  },
  brandingContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FFD84D",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconText: {
    fontSize: 50,
  },
  appTitle: {
    fontSize: 42,
    fontWeight: "800",
    color: "#3b260f",
    marginBottom: 8,
    letterSpacing: 1,
  },
  appSubtitle: {
    fontSize: 14,
    color: "#4a2c1a",
    fontWeight: "500",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  bottomSheet: {
    flex: 1,
    backgroundColor: "#DCB083",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 30,
  },
  inputWrapper: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    paddingHorizontal: 18,
    marginBottom: 14,
  },
  input: {
    color: "#000",
    fontSize: 15,
    paddingVertical: 10,
  },
  eyeButton: {
    position: "absolute",
    right: 18,
    top: 10,
  },
  eyeText: {
    color: "#8e8e8e",
    fontSize: 13,
  },
  forgotWrapper: {
    alignSelf: "flex-end",
    marginBottom: 16,
  },
  forgotText: {
    color: "#4a2c1a",
    fontSize: 12,
  },
  signInButton: {
    backgroundColor: "#FFD84D",
    borderRadius: 28,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  signInText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#3b260f",
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 28,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    marginBottom: 10,
  },
  googleIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  googleIconText: {
    color: "#4285F4",
    fontWeight: "700",
  },
  googleButtonText: {
    fontWeight: "600",
    color: "#3b260f",
  },
  guestButton: {
    borderRadius: 28,
    paddingVertical: 12,
    backgroundColor: "#C4935D",
    alignItems: "center",
  },
  guestText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  footer: {
    marginTop: 16,
    textAlign: "center",
    color: "#4a2c1a",
    fontSize: 13,
  },
  footerLink: {
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});