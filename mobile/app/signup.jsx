// this is the sign up page that opens up as soon as the app is launched

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

export default function Signup() {
  const [name, setName] = useState(""); // get the users name
  const [email, setEmail] = useState(""); //get the users email
  const [password, setPassword] = useState(""); // get the password

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/sign_up_person.png")}
        style={{
          height: "40%",
          width: "86%",
          alignItems: "center",
          marginBottom: 30,
          marginTop: -160,
        }}
      />

      <Text style={styles.title}>Create Account</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        placeholderTextColor="#8e8e8e"
        value={name}
        onChangeText={setName}
      />

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

      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        Already have an account?
        <Link href="/login"> Log In</Link>
      </Text>
    </View>
  );
}

//the style and coloring of this page
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#DCB083", //the main theme color
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
