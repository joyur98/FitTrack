import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Signup() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async () => {
    // make sure everything's filled out
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Oops!", "Please fill in all fields");
      return;
    }

    // password length check
    if (password.length < 6) {
      Alert.alert("Weak Password", "Password needs at least 6 characters");
      return;
    }

    // basic email validation
    if (!email.includes('@') || !email.includes('.')) {
      Alert.alert("Invalid Email", "Please enter a valid email address");
      return;
    }

    try {
      // save user data
      const userData = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password,
      };

      await AsyncStorage.setItem('userAccount', JSON.stringify(userData));
      
      Alert.alert(
        "Success!", 
        "Your account has been created",
        [
          {
            text: "Continue",
            onPress: () => {
              setName("");
              setEmail("");
              setPassword("");
              router.push('/login');
            }
          }
        ]
      );
      
    } catch (error) {
      console.log("Signup failed:", error);
      Alert.alert("Error", "Couldn't create account. Try again.");
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Ionicons name="fitness" size={48} color="#DCB083" />
          </View>
          <Text style={styles.brandName}>FitTrack</Text>
          <Text style={styles.tagline}>Transform Your Body, Track Your Journey</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join thousands achieving their fitness goals</Text>

          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#666"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

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

          <TouchableOpacity 
            style={styles.signupButton}
            onPress={handleSignup}
            activeOpacity={0.85}
          >
            <Text style={styles.signupButtonText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={20} color="#1a1a1a" style={styles.buttonIcon} />
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.loginContainer}>
            <Text style={styles.loginPrompt}>Already have an account? </Text>
            <Link href="/login" asChild>
              <TouchableOpacity>
                <Text style={styles.loginLink}>Log In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f0f",
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 70,
    paddingBottom: 50,
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
    paddingHorizontal: 40,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 40,
    paddingBottom: 30,
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
  signupButton: {
    backgroundColor: "#DCB083",
    paddingVertical: 17,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "center",
    shadowColor: "#DCB083",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  signupButtonText: {
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
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  loginPrompt: {
    fontSize: 15,
    color: "#888",
  },
  loginLink: {
    fontSize: 15,
    color: "#DCB083",
    fontWeight: "600",
  },
});
