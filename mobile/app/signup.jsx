import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Link } from "expo-router"; // Import Link from expo-router

export default function SignupScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            {/* Small person icon above FitTrack */}
            <Image
              source={require("../assets/images/sign_up_person.png" )} // Replace with your small person icon
              style={styles.personIcon}
            />

            <Text style={styles.title}>FitTrack</Text>
            <Text style={styles.subtitle}>Transform your fitness journey 💪</Text>
          </View>

          {/* Input Fields */}
          <View style={styles.inputsContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                placeholder="Full Name"
                placeholderTextColor="#8b7768"
                style={styles.input}
              />
            </View>

            <View style={styles.inputWrapper}>
              <TextInput
                placeholder="Email"
                placeholderTextColor="#8b7768"
                style={styles.input}
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputWrapper}>
              <TextInput
                placeholder="Password"
                secureTextEntry
                placeholderTextColor="#8b7768"
                style={styles.input}
              />
            </View>
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Create Account</Text>
          </TouchableOpacity>

          {/* Already have an account */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already a member? </Text>
            <Link href="/login" style={styles.footerLink}>
              Log In
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
    backgroundColor: "#f5efe6",
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  personIcon: {
    width: 300,
    height: 200,
    marginBottom: 20,
    marginRight: 40
  },
  title: {
    fontSize: 38,
    fontWeight: "800",
    color: "#4a3b31",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: "#7a6659",
    textAlign: "center",
  },
  inputsContainer: {
    marginBottom: 32,
  },
  inputWrapper: {
    backgroundColor: "#efe6d8",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  input: {
    color: "#4a3b31",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#5b4334",
    paddingVertical: 16,
    borderRadius: 26,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  footerText: {
    color: "#7a6659",
    fontSize: 14,
  },
  footerLink: {
    color: "#5b4334",
    fontSize: 14,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
