import React, { useState, useEffect, useRef } from "react";
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
  Animated,
  Easing,
  Dimensions
} from "react-native";
import { Link, router } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebaseConfig";

const { width, height } = Dimensions.get("window");

export default function SignupScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoScaleAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Theme colors
  const theme = {
    backgroundColor: isDarkMode ? "#0F0F0F" : "#F8F5F2",
    cardBackground: isDarkMode ? "#1A1A1A" : "#FFFFFF",
    textColor: isDarkMode ? "#FFFFFF" : "#2D3436",
    secondaryText: isDarkMode ? "#A0A0A0" : "#636E72",
    borderColor: isDarkMode ? "#333333" : "#E0E0E0",
    primaryColor: "#FF6B6B",
    secondaryColor: "#4ECDC4",
    accentColor: "#FFD93D",
    inputBackground: isDarkMode ? "#2D2D2D" : "#F5F5F5",
    shadowColor: isDarkMode ? "#000000" : "#2D3436",
  };

  // Initialize animations
  useEffect(() => {
    // Logo animation
    Animated.spring(logoScaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
      delay: 300,
    }).start();

    // Entry animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.2)),
      }),
    ]).start(() => {
      // Form animation
      Animated.timing(formAnim, {
        toValue: 1,
        duration: 400,
        delay: 100,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }).start();
    });
  }, []);

  // Shake animation for errors
  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSignup = async () => {
    // Validation with animations
    if (!fullName.trim()) {
      triggerShake();
      Alert.alert("Error", "Please enter your full name");
      return;
    }

    if (!email.trim()) {
      triggerShake();
      Alert.alert("Error", "Please enter your email");
      return;
    }

    if (!password || !confirmPassword) {
      triggerShake();
      Alert.alert("Error", "Please enter password");
      return;
    }

    if (password !== confirmPassword) {
      triggerShake();
      Alert.alert("Error", "Passwords don't match");
      return;
    }

    if (password.length < 6) {
      triggerShake();
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    // Button press animation
    Animated.sequence([
      Animated.timing(buttonAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setLoading(true);

    try {
      // Create auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      // Save base user info
      await setDoc(doc(db, "users", user.uid), {
        fullName,
        email,
        createdAt: serverTimestamp(),
        darkMode: true,
        streak: 0,
        totalWorkouts: 0,
        weeklyWorkouts: 0,
      });

      // Success animation
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        Alert.alert("✅ Success", "Welcome to FitTrack!");
        router.replace("./profile_setup");
      });

    } catch (error) {
      triggerShake();
      
      // Better error messages
      switch (error.code) {
        case "auth/email-already-in-use":
          Alert.alert("Error", "This email is already registered");
          break;
        case "auth/invalid-email":
          Alert.alert("Error", "Invalid email format");
          break;
        case "auth/weak-password":
          Alert.alert("Error", "Password is too weak");
          break;
        case "auth/network-request-failed":
          Alert.alert("Error", "Network error. Please check your connection");
          break;
        default:
          Alert.alert("Signup Failed", "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.backgroundColor }]}>
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
          <Animated.View 
            style={[
              styles.topSection,
              { 
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <Animated.View 
              style={[
                styles.logoContainer,
                { 
                  transform: [{ scale: logoScaleAnim }],
                  backgroundColor: theme.cardBackground
                }
              ]}
            >
              <Text style={[styles.logoIcon, { color: theme.primaryColor }]}>🚀</Text>
            </Animated.View>
            
            <View style={styles.appInfo}>
              <Text style={[styles.appName, { color: theme.textColor }]}>FitTrack</Text>
              <Text style={[styles.tagline, { color: theme.secondaryText }]}>
                Transform Your Body, Track Your Journey
              </Text>
            </View>
          </Animated.View>

          <View style={[styles.divider, { backgroundColor: theme.borderColor }]} />

          {/* Form Section */}
          <Animated.View 
            style={[
              styles.formSection,
              { 
                opacity: formAnim,
                transform: [
                  { translateY: Animated.multiply(formAnim, new Animated.Value(20)) },
                  { translateX: shakeAnim }
                ]
              }
            ]}
          >
            <View style={styles.formHeader}>
              <Text style={[styles.welcomeTitle, { color: theme.textColor }]}>Sign Up</Text>
              <Text style={[styles.welcomeSubtitle, { color: theme.secondaryText }]}>
                Join thousands achieving their fitness goals
              </Text>
            </View>

            {/* Full Name */}
            <View style={styles.inputGroup}>
              <View style={[styles.inputBox, { 
                backgroundColor: theme.inputBackground,
                borderColor: theme.borderColor
              }]}>
                <Text style={[styles.inputIcon, { color: theme.primaryColor }]}>👤</Text>
                <TextInput
                  placeholder="Full Name"
                  placeholderTextColor={theme.secondaryText}
                  style={[styles.input, { color: theme.textColor }]}
                  value={fullName}
                  onChangeText={setFullName}
                  editable={!loading}
                  selectionColor={theme.primaryColor}
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <View style={[styles.inputBox, { 
                backgroundColor: theme.inputBackground,
                borderColor: theme.borderColor
              }]}>
                <Text style={[styles.inputIcon, { color: theme.primaryColor }]}>✉️</Text>
                <TextInput
                  placeholder="Email Address"
                  placeholderTextColor={theme.secondaryText}
                  style={[styles.input, { color: theme.textColor }]}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading}
                  selectionColor={theme.primaryColor}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <View style={[styles.inputBox, { 
                backgroundColor: theme.inputBackground,
                borderColor: theme.borderColor
              }]}>
                <Text style={[styles.inputIcon, { color: theme.primaryColor }]}>🔒</Text>
                <TextInput
                  placeholder="Password"
                  placeholderTextColor={theme.secondaryText}
                  style={[styles.input, { color: theme.textColor }]}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                  selectionColor={theme.primaryColor}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  <Text style={[styles.eyeIcon, { color: theme.secondaryText }]}>
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <View style={[styles.inputBox, { 
                backgroundColor: theme.inputBackground,
                borderColor: theme.borderColor
              }]}>
                <Text style={[styles.inputIcon, { color: theme.primaryColor }]}>🔒</Text>
                <TextInput
                  placeholder="Confirm Password"
                  placeholderTextColor={theme.secondaryText}
                  style={[styles.input, { color: theme.textColor }]}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  editable={!loading}
                  selectionColor={theme.primaryColor}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
                  <Text style={[styles.eyeIcon, { color: theme.secondaryText }]}>
                    {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>

          {/* Sign Up Button */}
          <Animated.View style={{ transform: [{ scale: buttonAnim }], marginTop: 10 }}>
            <TouchableOpacity
              style={[styles.signupBtn, { backgroundColor: theme.primaryColor }]}
              onPress={handleSignup}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <View style={styles.buttonContent}>
                  <Text style={styles.signupBtnText}>Create Account</Text>
                  <Text style={[styles.arrowIcon, { color: "#FFFFFF" }]}>→</Text>
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Password Requirements */}
          <View style={styles.requirementsContainer}>
            <Text style={[styles.requirementsTitle, { color: theme.secondaryText }]}>
              Password Requirements:
            </Text>
            <View style={styles.requirementsList}>
              <Text style={[styles.requirement, { 
                color: password.length >= 6 ? theme.secondaryColor : theme.secondaryText 
              }]}>
                ✓ At least 6 characters
              </Text>
            </View>
          </View>

          {/* Footer */}
          <Animated.View 
            style={[
              styles.footer,
              { 
                opacity: formAnim,
                transform: [{ translateY: Animated.multiply(formAnim, new Animated.Value(20)) }]
              }
            ]}
          >
            <Text style={[styles.footerText, { color: theme.secondaryText }]}>
              Already have an account?
            </Text>
            <Link href="/login" style={styles.loginLink}>
              <Text style={[styles.loginText, { color: theme.primaryColor }]}>
                {" "}Login
              </Text>
            </Link>
          </Animated.View>

          {/* Terms */}
          <View style={styles.termsContainer}>
            <Text style={[styles.termsText, { color: theme.secondaryText }]}>
              By signing up, you agree to our Terms of Service and Privacy Policy
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: "center",
  },
  topSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  logoIcon: {
    fontSize: 50,
  },
  appInfo: {
    alignItems: "center",
  },
  appName: {
    fontSize: 42,
    fontWeight: "800",
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  divider: {
    height: 1,
    marginVertical: 30,
  },
  formSection: {
    marginBottom: 20,
  },
  formHeader: {
    marginBottom: 30,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
  },
  inputIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },
  eyeBtn: {
    padding: 8,
  },
  eyeIcon: {
    fontSize: 20,
  },
  signupBtn: {
    paddingVertical: 18,
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  signupBtnText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginRight: 12,
  },
  arrowIcon: {
    fontSize: 20,
    fontWeight: "bold",
  },
  requirementsContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  requirementsList: {
    paddingLeft: 8,
  },
  requirement: {
    fontSize: 12,
    marginBottom: 4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 24,
    borderTopWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  footerText: {
    fontSize: 14,
  },
  loginLink: {
    padding: 4,
  },
  loginText: {
    fontSize: 14,
    fontWeight: "700",
  },
  termsContainer: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  termsText: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
});