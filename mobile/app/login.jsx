import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  Animated,
  Easing,
  Dimensions,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { Link, router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebaseConfig";
import { db } from "./firebaseConfig"; // Add this import
import { doc, getDoc } from "firebase/firestore"; // Add this import

const { width, height } = Dimensions.get("window");

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const logoScaleAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(1)).current;

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
    Animated.spring(logoScaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
      delay: 300,
    }).start();

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
      Animated.timing(formAnim, {
        toValue: 1,
        duration: 400,
        delay: 100,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }).start();
    });
  }, []);

  // ✅ NEW FUNCTION: Check if user is admin
  const checkUserRole = async (userId, userEmail) => {
    try {
      // Try to fetch user document from 'users' collection
      const userDocRef = doc(db, "users", userId);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        
        // Check if user has admin role
        if (userData.role === "admin" || userData.isAdmin === true) {
          return "admin";
        }
        
        // Check if email is in admin email list (alternative method)
        if (userData.email === userEmail && userData.role === "admin") {
          return "admin";
        }
      }

      // If no user document or not admin, return normal user
      return "user";
    } catch (error) {
      console.error("Error checking user role:", error);
      return "user"; // Default to user if error
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Error", "Please enter your email and password");
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
      // Firebase login
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;
      const userEmail = userCredential.user.email;

      // ✅ Check user role
      const userRole = await checkUserRole(userId, userEmail);

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
        Alert.alert("✅ Success", "Welcome back to FitTrack!");
        
        // ✅ Redirect based on role
        if (userRole === "admin") {
          router.replace("/admin");
        } else {
          router.replace("/dashboard");
        }
      });
    } catch (error) {
      // Error shake animation
      const shakeAnim = new Animated.Value(0);
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

      switch (error.code) {
        case "auth/user-not-found":
          Alert.alert("Error", "No account found with this email");
          break;
        case "auth/wrong-password":
          Alert.alert("Error", "Incorrect password");
          break;
        case "auth/invalid-email":
          Alert.alert("Error", "Invalid email format");
          break;
        case "auth/too-many-requests":
          Alert.alert(
            "Error",
            "Too many attempts. Please try again later."
          );
          break;
        default:
          Alert.alert("Error", error.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.backgroundColor }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Section */}
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
              <Text style={[styles.logoIcon, { color: theme.primaryColor }]}>💪</Text>
            </Animated.View>
            
            <View style={styles.appInfo}>
              <Text style={[styles.appName, { color: theme.textColor }]}>FitTrack</Text>
              <Text style={[styles.tagline, { color: theme.secondaryText }]}>
                Welcome Back, Champion!
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
                transform: [{ translateY: Animated.multiply(formAnim, new Animated.Value(20)) }]
              }
            ]}
          >
            <View style={styles.formHeader}>
              <Text style={[styles.welcomeTitle, { color: theme.textColor }]}>Login</Text>
              <Text style={[styles.welcomeSubtitle, { color: theme.secondaryText }]}>
                Continue your fitness journey
              </Text>
            </View>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <View style={[styles.inputBox, { 
                backgroundColor: theme.inputBackground,
                borderColor: theme.borderColor
              }]}>
                <Text style={[styles.inputIcon, { color: theme.primaryColor }]}>✉️</Text>
                <TextInput
                  style={[styles.input, { color: theme.textColor }]}
                  placeholder="Email Address"
                  placeholderTextColor={theme.secondaryText}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading}
                  selectionColor={theme.primaryColor}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <View style={[styles.inputBox, { 
                backgroundColor: theme.inputBackground,
                borderColor: theme.borderColor
              }]}>
                <Text style={[styles.inputIcon, { color: theme.primaryColor }]}>🔒</Text>
                <TextInput
                  style={[styles.input, { color: theme.textColor }]}
                  placeholder="Password"
                  placeholderTextColor={theme.secondaryText}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
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

            {/* Forgot Password */}
            <View style={styles.forgotContainer}>
              <Link href="/forgotPassword" style={styles.forgotLink}>
                <Text style={[styles.forgotText, { color: theme.primaryColor }]}>
                  Forgot Password?
                </Text>
              </Link>
            </View>

            {/* Login Button */}
            <Animated.View style={{ transform: [{ scale: buttonAnim }] }}>
              <TouchableOpacity
                style={[styles.loginBtn, { backgroundColor: theme.primaryColor }]}
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <View style={styles.buttonContent}>
                    <Text style={styles.loginBtnText}>Login</Text>
                    <Text style={[styles.arrowIcon, { color: "#FFFFFF" }]}>→</Text>
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>

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
              Don't have an account?
            </Text>
            <Link href="/signup" style={styles.signupLink}>
              <Text style={[styles.signupText, { color: theme.primaryColor }]}>
                {" "}Sign Up
              </Text>
            </Link>
          </Animated.View>

          {/* Additional Info */}
          <View style={styles.additionalInfo}>
            <Text style={[styles.infoText, { color: theme.secondaryText }]}>
              By continuing, you agree to our Terms & Privacy Policy
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
    marginBottom: 30,
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
  forgotContainer: {
    alignItems: "flex-end",
    marginBottom: 30,
  },
  forgotLink: {
    padding: 4,
  },
  forgotText: {
    fontSize: 14,
    fontWeight: "600",
  },
  loginBtn: {
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
  loginBtnText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginRight: 12,
  },
  arrowIcon: {
    fontSize: 20,
    fontWeight: "bold",
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
  signupLink: {
    padding: 4,
  },
  signupText: {
    fontSize: 14,
    fontWeight: "700",
  },
  additionalInfo: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  infoText: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
});
