import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, SafeAreaView, Alert, ActivityIndicator } from "react-native";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebaseConfig";

export default function SignupScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignup = async () => {
    if (!fullName.trim()) {
      Alert.alert("Error", "Enter your full name");
      return;
    }

    if (!email.trim()) {
      Alert.alert("Error", "Enter your email");
      return;
    }

    if (!password || !confirmPassword) {
      Alert.alert("Error", "Enter password");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords don't match");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be 6+ characters");
      return;
    }

    setLoading(true);

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      Alert.alert("Success", "Account created! Welcome to FitTrack");
      router.push('/dashboard');
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert("Error", "Email already registered");
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert("Error", "Invalid email");
      } else {
        Alert.alert("Error", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          
          <View style={styles.topSection}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoIcon}>♡</Text>
            </View>
            <Text style={styles.appName}>FitTrack</Text>
            <Text style={styles.tagline}>Transform Your Body, Track Your Journey</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.spacer} />

          <View style={styles.formSection}>
            <Text style={styles.welcomeTitle}>Sign Up</Text>
            <Text style={styles.welcomeSubtitle}>Join thousands achieving their fitness goals</Text>

            <View style={styles.inputGroup}>
              <View style={styles.inputBox}>
                <Text style={styles.inputIcon}>👤</Text>
                <TextInput
                  placeholder="Full Name"
                  placeholderTextColor="#7d6f63"
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  editable={!loading}
                  selectionColor="#C4935D"
                />
              </View>
            </View>

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
                  editable={!loading}
                  selectionColor="#C4935D"
                />
              </View>
            </View>

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
                  editable={!loading}
                  selectionColor="#C4935D"
                />
                <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
                  <Text style={styles.eyeIcon}>{showPassword ? "👁️" : "👁️‍🗨️"}</Text>
                </TouchableOpacity>
              </View>
            </View>

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
                  editable={!loading}
                  selectionColor="#C4935D"
                />
                <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Text style={styles.eyeIcon}>{showConfirmPassword ? "👁️" : "👁️‍🗨️"}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.signupBtn, loading && styles.btnDisabled]} 
            onPress={handleSignup} 
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#1a1a1a" size="small" />
            ) : (
              <>
                <Text style={styles.signupBtnText}>Sign Up</Text>
                <Text style={styles.arrowIcon}>→</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.dividerOr}>
            <View style={styles.dividerLine} />
            <Text style={styles.orText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.spacer} />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="/login">
              <Text style={styles.loginLink}>Login</Text>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  topSection: {
    alignItems: "center",
    marginBottom: 20,
    paddingTop: 15,
  },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 2.5,
    borderColor: "#C4935D",
  },
  logoIcon: {
    fontSize: 50,
    color: "#C4935D",
  },
  appName: {
    fontSize: 36,
    fontWeight: "800",
    color: "#C4935D",
    marginBottom: 6,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 13,
    color: "#999999",
    fontWeight: "400",
    textAlign: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "#333333",
    marginBottom: 0,
  },
  spacer: {
    flex: 1,
    minHeight: 15,
  },
  formSection: {
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: "#999999",
    fontWeight: "400",
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: "#333333",
    height: 54,
  },
  inputIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "500",
    paddingVertical: 0,
  },
  eyeBtn: {
    padding: 8,
  },
  eyeIcon: {
    fontSize: 18,
  },
  signupBtn: {
    backgroundColor: "#C4935D",
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  signupBtnText: {
    color: "#1a1a1a",
    fontSize: 15,
    fontWeight: "700",
    marginRight: 8,
  },
  arrowIcon: {
    color: "#1a1a1a",
    fontSize: 18,
    fontWeight: "700",
  },
  dividerOr: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#333333",
  },
  orText: {
    marginHorizontal: 12,
    fontSize: 12,
    color: "#666666",
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 13,
    color: "#999999",
  },
  loginLink: {
    fontSize: 13,
    color: "#C4935D",
    fontWeight: "700",
    textDecorationLine: "underline",
    marginLeft: 4,
  },
});