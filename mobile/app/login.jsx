import { Link, router } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import { Link } from "expo-router";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
<<<<<<< HEAD
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    console.log("Login pressed", { email, password });
  };

  const handleGuest = () => {
    console.log("Continue as guest");
  };

  const handleGoogleLogin = () => {
    console.log("Google login pressed");
  };

=======
  
>>>>>>> 746e686f13b860f82331306c2db4fabb78bb9bc0
  return (
    <View style={styles.screen}>
      {/* Top image section with muscular man */}
      <View style={styles.imageContainer}>
        <Image
          source={require("../assets/images/muscular_man.png")}
          style={styles.image}
          resizeMode="cover"
        />
      </View>

      {/* Bottom content section */}
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

<<<<<<< HEAD
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
        <TouchableOpacity style={styles.forgotWrapper}>
          <Text style={styles.forgotText}>Forget password?</Text>
        </TouchableOpacity>

        {/* Sign in */}
        <TouchableOpacity style={styles.signInButton} onPress={handleLogin}>
          <Text style={styles.signInText}>Sign in</Text>
        </TouchableOpacity>

        {/* Continue with Google */}
        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleLogin}
        >
          <View style={styles.googleIconCircle}>
            <Text style={styles.googleIconText}>G</Text>
          </View>
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        {/* Continue as guest */}
        <TouchableOpacity style={styles.guestButton} onPress={handleGuest}>
          <Text style={styles.guestText}>Continue as guest</Text>
        </TouchableOpacity>

        {/* Bottom link */}
        <Text style={styles.footer}>
          Don’t have an account?
          <Link href="/signup" style={styles.footerLink}>
            {" "}
            Sign up
          </Link>
        </Text>
      </View>
=======
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#8e8e8e"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#8e8e8e"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* ========== ADD FORGOT PASSWORD LINK HERE ========== */}
      <TouchableOpacity 
        style={{ alignSelf: "flex-end", marginBottom: 20 }}
        onPress={() => router.push("/forgotPassword")}
      >
        <Text style={{ 
          color: "#4a2c1a", 
          fontWeight: "600",
          fontSize: 14,
          textDecorationLine: "underline" 
        }}>
          Forgot Password?
        </Text>
      </TouchableOpacity>
      {/* ========== END ADD ========== */}

      <TouchableOpacity style={styles.button} onPress={() => {console.log("Pressed"); router.push('/dashboard');}}>
        <Text style={styles.buttonText}>Log In</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        Don't have an account? <Link href={"/signup"} style={styles.loginText}>Sign Up</Link>
      </Text>
      
>>>>>>> 746e686f13b860f82331306c2db4fabb78bb9bc0
    </View>
  );
}

const styles = StyleSheet.create({
  // full screen coffee theme
  screen: {
    flex: 1,
    backgroundColor: "#DCB083", // coffee latte
  },
  imageContainer: {
    flex: 1.2,
    justifyContent: "flex-end",
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
    paddingVertical: 4,
    marginBottom: 14,
  },
  input: {
    color: "#000000",
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
    fontWeight: "500",
  },
  forgotWrapper: {
    alignSelf: "flex-end",
    marginTop: 2,
    marginBottom: 16,
  },
  forgotText: {
    color: "#4a2c1a",
    fontSize: 12,
  },
  signInButton: {
    backgroundColor: "#FFD84D", // warm yellow accent
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
    paddingHorizontal: 18,
    backgroundColor: "#FFFFFF",
    marginBottom: 10,
    justifyContent: "center",
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
    fontSize: 14,
    fontWeight: "700",
    color: "#4285F4",
  },
  googleButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#3b260f",
  },
  guestButton: {
    borderRadius: 28,
    paddingVertical: 12,
    backgroundColor: "#C4935D",
    alignItems: "center",
    marginTop: 4,
  },
  guestText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
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