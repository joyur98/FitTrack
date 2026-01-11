import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebaseConfig";

export default function SignupScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignup = async () => {
    if (!fullName.trim())
      return Alert.alert("Error", "Enter your full name");

    if (!email.trim())
      return Alert.alert("Error", "Enter your email");

    if (!password || !confirmPassword)
      return Alert.alert("Error", "Enter password");

    if (password !== confirmPassword)
      return Alert.alert("Error", "Passwords don't match");

    if (password.length < 6)
      return Alert.alert("Error", "Password must be at least 6 characters");

    setLoading(true);

    try {
      // 🔐 Create auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      // 🗂️ Save base user info
      await setDoc(doc(db, "users", user.uid), {
        fullName,
        email,
        createdAt: serverTimestamp(),
      });

      // ✅ Go to PROFILE SETUP (onboarding)
      router.replace("./profile_setup");

    } catch (error) {
      Alert.alert("Signup Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.topSection}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoIcon}>♡</Text>
            </View>
            <Text style={styles.appName}>FitTrack</Text>
            <Text style={styles.tagline}>
              Transform Your Body, Track Your Journey
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Form */}
          <View style={styles.formSection}>
            <Text style={styles.welcomeTitle}>Sign Up</Text>
            <Text style={styles.welcomeSubtitle}>
              Join thousands achieving their fitness goals
            </Text>

            {/* Full Name */}
            <View style={styles.inputGroup}>
              <View style={styles.inputBox}>
                <Text style={styles.inputIcon}>👤</Text>
                <TextInput
                  placeholder="Full Name"
                  placeholderTextColor="#7d6f63"
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <View style={styles.inputBox}>
                <Text style={styles.inputIcon}>✉️</Text>
                <TextInput
                  placeholder="Email Address"
                  placeholderTextColor="#7d6f63"
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <View style={styles.inputBox}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  placeholder="Password"
                  placeholderTextColor="#7d6f63"
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={styles.eyeIcon}>
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <View style={styles.inputBox}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  placeholder="Confirm Password"
                  placeholderTextColor="#7d6f63"
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                >
                  <Text style={styles.eyeIcon}>
                    {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Button */}
          <TouchableOpacity
            style={[styles.signupBtn, loading && styles.btnDisabled]}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#1a1a1a" />
            ) : (
              <>
                <Text style={styles.signupBtnText}>Sign Up</Text>
                <Text style={styles.arrowIcon}>→</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <Link href="/login">
              <Text style={styles.loginLink}> Login</Text>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#1a1a1a" },
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingVertical: 20 },
  topSection: { alignItems: "center", marginBottom: 32 },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 2.5,
    borderColor: "#C4935D",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  logoIcon: { fontSize: 50, color: "#C4935D" },
  appName: { fontSize: 36, fontWeight: "800", color: "#C4935D" },
  tagline: { fontSize: 13, color: "#999999" },
  divider: { height: 1, backgroundColor: "#333333", marginVertical: 20 },
  formSection: { marginBottom: 24 },
  welcomeTitle: { fontSize: 28, fontWeight: "700", color: "#ffffff" },
  welcomeSubtitle: { fontSize: 13, color: "#999999", marginBottom: 24 },
  inputGroup: { marginBottom: 14 },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#333333",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 54,
  },
  inputIcon: { fontSize: 20, marginRight: 10 },
  input: { flex: 1, color: "#ffffff", fontSize: 15 },
  eyeBtn: { padding: 8 },
  eyeIcon: { fontSize: 18 },
  signupBtn: {
    backgroundColor: "#C4935D",
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  btnDisabled: { opacity: 0.7 },
  signupBtnText: {
    color: "#1a1a1a",
    fontSize: 15,
    fontWeight: "700",
    marginRight: 8,
  },
  arrowIcon: { fontSize: 18 },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
  footerText: { color: "#999999", fontSize: 13 },
  loginLink: { color: "#C4935D", fontSize: 13, fontWeight: "700" },
});
