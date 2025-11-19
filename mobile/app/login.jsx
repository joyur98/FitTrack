import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    // check empty fields
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing Info", "Please enter your email and password");
      return;
    }

    try {
      // fetch stored user data
      const storedData = await AsyncStorage.getItem('userAccount');
      
      if (!storedData) {
        Alert.alert("No Account Found", "Please sign up first!");
        return;
      }

      const user = JSON.parse(storedData);

      // check if credentials match
      if (user.email === email.trim().toLowerCase() && user.password === password) {
        // save login state
        await AsyncStorage.setItem('isLoggedIn', 'true');
        await AsyncStorage.setItem('currentUser', JSON.stringify(user));
        
        router.replace('/home');
      } else {
        Alert.alert("Login Failed", "Incorrect email or password");
      }
      
    } catch (error) {
      console.log("Error during login:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Ionicons name="fitness" size={48} color="#DCB083" />
        </View>
        <Text style={styles.brandName}>FitTrack</Text>
        <Text style={styles.tagline}>Welcome Back, Champion!</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.title}>Log In</Text>
        <Text style={styles.subtitle}>Continue your fitness journey</Text>

        <View style={styles.inputWrapper}>
          <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            placeholderTextColor="#666"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#666"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity 
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons 
              name={showPassword ? "eye-outline" : "eye-off-outline"} 
              size={20} 
              color="#666" 
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.loginButton}
          onPress={handleLogin}
          activeOpacity={0.85}
        >
          <Text style={styles.loginButtonText}>Log In</Text>
          <Ionicons name="arrow-forward" size={20} color="#1a1a1a" style={styles.buttonIcon} />
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.signupContainer}>
          <Text style={styles.signupPrompt}>Don't have an account? </Text>
          <Link href="/signup" asChild>
            <TouchableOpacity>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f0f",
  },
  header: {
    paddingTop: 80,
    paddingBottom: 60,
    alignItems: "center",
    backgroundColor: "#1a1a1a",
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#2a2a2a",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#DCB083",
  },
  brandName: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#DCB083",
    marginBottom: 8,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 13,
    color: "#888",
    textAlign: "center",
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 45,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#888",
    marginBottom: 35,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: "#2a2a2a",
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: "#fff",
  },
  eyeIcon: {
    padding: 8,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 25,
  },
  forgotText: {
    color: "#DCB083",
    fontSize: 14,
    fontWeight: "500",
  },
  loginButton: {
    backgroundColor: "#DCB083",
    paddingVertical: 17,
    borderRadius: 14,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    shadowColor: "#DCB083",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  loginButtonText: {
    color: "#1a1a1a",
    fontSize: 17,
    fontWeight: "bold",
    marginRight: 8,
  },
  buttonIcon: {
    marginTop: 2,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#2a2a2a",
  },
  dividerText: {
    color: "#666",
    paddingHorizontal: 16,
    fontSize: 13,
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  signupPrompt: {
    fontSize: 15,
    color: "#888",
  },
  signupLink: {
    fontSize: 15,
    color: "#DCB083",
    fontWeight: "600",
  },
});
