import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView, SafeAreaView } from "react-native";
import { Link, router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebaseConfig";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Error", "Enter email and password");
      return;
    }

    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert("Success", "Welcome back!");
      router.push("/dashboard");
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        Alert.alert("Error", "No account with this email");
      } else if (error.code === 'auth/wrong-password') {
        Alert.alert("Error", "Wrong password");
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert("Error", "Invalid email");
      } else {
        Alert.alert("Error", "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.topSection}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoIcon}>♡</Text>
          </View>
          <Text style={styles.appName}>FitTrack</Text>
          <Text style={styles.tagline}>Welcome Back, Champion!</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.spacer} />

        <View style={styles.formSection}>
          <Text style={styles.welcomeTitle}>Login</Text>
          <Text style={styles.welcomeSubtitle}>Continue your fitness journey</Text>

          <View style={styles.inputGroup}>
            <View style={styles.inputBox}>
              <Text style={styles.inputIcon}>✉️</Text>
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                placeholderTextColor="#7d6f63"
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
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#7d6f63"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                editable={!loading}
                selectionColor="#C4935D"
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(!showPassword)}>
                <Text style={styles.eyeIcon}>{showPassword ? "👁️" : "👁️‍🗨️"}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.forgotContainer}>
            <Link href="/forgotPassword">
              <Text style={styles.forgotLink}>Forgot Password?</Text>
            </Link>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.loginBtn, loading && styles.btnDisabled]} 
            onPress={handleLogin} 
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#1a1a1a" size="small" />
            ) : (
              <>
                <Text style={styles.loginBtnText}>Login</Text>
                <Text style={styles.arrowIcon}>→</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.dividerOr}>
            <View style={styles.dividerLine} />
            <Text style={styles.orText}>or</Text>
            <View style={styles.dividerLine} />
          </View>
        </View>

        <View style={styles.spacer} />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Link href="/signup">
            <Text style={styles.signupLink}>Sign Up</Text>
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#1a1a1a",
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
    fontSize: 14,
    color: "#999999",
    fontWeight: "400",
  },
  divider: {
    height: 1,
    backgroundColor: "#333333",
    marginBottom: 0,
  },
  spacer: {
    flex: 1,
    minHeight: 20,
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
    fontSize: 14,
    color: "#999999",
    fontWeight: "400",
    marginBottom: 26,
  },
  inputGroup: {
    marginBottom: 16,
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
  forgotContainer: {
    alignItems: "flex-end",
    marginBottom: 20,
  },
  forgotLink: {
    fontSize: 12,
    color: "#C4935D",
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  loginBtn: {
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
  loginBtnText: {
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
  signupLink: {
    fontSize: 13,
    color: "#C4935D",
    fontWeight: "700",
    textDecorationLine: "underline",
    marginLeft: 4,
  },
});