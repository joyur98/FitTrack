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

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/login_person.png")}
        style={{
          height: "40%",
          width: "100%",
          alignItems: "center",
          marginBottom: 30,
          marginTop: -160,
        }}
      />

      <Text style={styles.title}>Welcome Back</Text>

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
      
    </View>
  );
}

//the style and coloring of this page
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#DCB083", // same coffee–cream tone
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#4a2c1a",
    marginBottom: 40,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#4a2c1a",
    paddingVertical: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    textAlign: "center",
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  footer: {
    marginTop: 20,
    textAlign: "center",
    color: "#4a2c1a",
    fontSize: 14,
  },
  loginText: {
    fontWeight: "700",
    textDecorationLine: "underline",
  },
});