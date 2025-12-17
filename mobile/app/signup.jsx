// Import React Native UI components for building the screen
import {
  View,              // Container for grouping components
  Text,              // Component for displaying text
  TextInput,         // Input field for text entry
  TouchableOpacity,  // Makes components clickable with fade effect
  Image,             // Displays images
  StyleSheet,        // Creates and organizes component styles
  KeyboardAvoidingView, // Prevents keyboard from covering input fields
  Platform,          // Detects the device operating system (iOS/Android)
  ScrollView,        // Creates a scrollable container
  SafeAreaView,      // Ensures content stays within safe screen boundaries
} from "react-native";

// Import navigation components from Expo Router
import { Link, router } from "expo-router"; // Link for clickable links, router for programmatic navigation

// Define and export the SignupScreen component
export default function SignupScreen() {
  // Return the UI to be displayed
  return (
    // SafeAreaView prevents content from being hidden by phone notches/bars
    <SafeAreaView style={styles.safeArea}>
      // KeyboardAvoidingView adjusts layout when keyboard appears
      <KeyboardAvoidingView
        style={styles.container}  // Apply container styles
        behavior={Platform.OS === "ios" ? "padding" : "height"} // iOS: add padding, Android: adjust height
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20} // Additional offset for Android
      >
        // ScrollView makes content scrollable if it exceeds screen height
        <ScrollView
          contentContainerStyle={styles.scrollContainer} // Styles for scroll content
          keyboardShouldPersistTaps="handled" // Keyboard stays when tapping non-input areas
        >
          // Header section with logo and title
          <View style={styles.header}>
            // Person icon image
            <Image
              source={require("../assets/images/sign_up_person.png")} // Load image from assets
              style={styles.personIcon} // Apply image styles
            />

            // Main app title
            <Text style={styles.title}>FitTrack</Text>
            // App subtitle/motto
            <Text style={styles.subtitle}>Transform your fitness journey 💪</Text>
          </View>

          // Container for all input fields
          <View style={styles.inputsContainer}>
            // First input field wrapper
            <View style={styles.inputWrapper}>
              // Full name input field
              <TextInput
                placeholder="Full Name"          // Hint text when empty
                placeholderTextColor="#8b7768"   // Color of placeholder text
                style={styles.input}             // Apply input field styles
              />
            </View>

            // Second input field wrapper
            <View style={styles.inputWrapper}>
              // Email input field
              <TextInput
                placeholder="Email"               // Hint text
                placeholderTextColor="#8b7768"    // Placeholder color
                style={styles.input}              // Input styles
                keyboardType="email-address"      // Shows email keyboard (@ and .)
              />
            </View>

            // Third input field wrapper
            <View style={styles.inputWrapper}>
              // Password input field
              <TextInput
                placeholder="Password"            // Hint text
                secureTextEntry                   // Hides text with dots for password
                placeholderTextColor="#8b7768"    // Placeholder color
                style={styles.input}              // Input styles
              />
            </View>
          </View>

          // Create Account button
          <TouchableOpacity 
            style={styles.button}  // Apply button styles
            onPress={() => router.push('/dashboard')} // Navigate to dashboard when pressed
          >
            // Button text
            <Text style={styles.buttonText}>Create Account</Text>
          </TouchableOpacity>

          // Footer with login link
          <View style={styles.footer}>
            // Footer text
            <Text style={styles.footerText}>Already a member? </Text>
            // Clickable link to login screen
            <Link href="/login" style={styles.footerLink}>
              Log In
            </Link>
          </View>
          // Empty view for potential future content (currently just for spacing)
          <View style={{ alignItems: 'center' }}>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Create and define all styles for components
const styles = StyleSheet.create({
  // SafeAreaView styles - ensures content is visible on all devices
  safeArea: {
    flex: 1,                    // Take up all available screen space
    backgroundColor: "#f5efe6", // Light cream background color
  },
  
  // Main container styles
  container: {
    flex: 1,                    // Take full available space
  },
  
  // ScrollView content container styles
  scrollContainer: {
    flexGrow: 1,                // Allows content to expand
    justifyContent: "center",   // Center content vertically
    paddingHorizontal: 32,      // Left/right padding
    paddingVertical: 40,        // Top/bottom padding
  },
  
  // Header section styles
  header: {
    alignItems: "center",       // Center children horizontally
    marginBottom: 40,           // Space below header
  },
  
  // Person icon image styles
  personIcon: {
    width: 300,                 // Image width: 300 pixels
    height: 200,                // Image height: 200 pixels
    marginBottom: 20,           // Space below image
    marginRight: 40             // Right margin for centering adjustment
  },
  
  // Main title text styles
  title: {
    fontSize: 38,               // Extra large text size
    fontWeight: "800",          // Extra bold font weight
    color: "#4a3b31",           // Dark brown text color
    marginBottom: 6,            // Space below title
  },
  
  // Subtitle text styles
  subtitle: {
    fontSize: 16,               // Medium text size
    color: "#7a6659",           // Medium brown text color
    textAlign: "center",        // Center text horizontally
  },
  
  // Input fields container styles
  inputsContainer: {
    marginBottom: 32,           // Space below inputs
  },
  
  // Individual input wrapper styles
  inputWrapper: {
    backgroundColor: "#efe6d8", // Light tan background
    borderRadius: 20,           // Rounded corners
    paddingHorizontal: 20,      // Left/right padding
    paddingVertical: 14,        // Top/bottom padding
    marginBottom: 18,           // Space below each input
    shadowColor: "#000",        // Shadow color: black
    shadowOffset: { 
      width: 0,                 // No horizontal shadow offset
      height: 2                 // 2 pixel vertical shadow offset
    },
    shadowOpacity: 0.2,         // 20% shadow opacity
    shadowRadius: 3,            // 3 pixel shadow blur radius
    elevation: 3,               // Android shadow depth
  },
  
  // Text input field styles
  input: {
    color: "#4a3b31",           // Dark brown text color
    fontSize: 16,               // Medium text size
  },
  
  // Create Account button styles
  button: {
    backgroundColor: "#5b4334", // Dark brown background
    paddingVertical: 16,        // Top/bottom padding
    borderRadius: 26,           // Rounded corners
    alignItems: "center",       // Center content horizontally
    marginBottom: 24,           // Space below button
    shadowColor: "#000",        // Button shadow color
    shadowOffset: { 
      width: 0,                 // No horizontal offset
      height: 3                 // 3 pixel vertical offset
    },
    shadowOpacity: 0.3,         // 30% shadow opacity
    shadowRadius: 4,            // 4 pixel shadow blur
    elevation: 5,               // Android button shadow depth
  },
  
  // Button text styles
  buttonText: {
    color: "#fff",              // White text color
    fontSize: 18,               // Medium-large text size
    fontWeight: "600",          // Semi-bold font weight
  },
  
  // Footer container styles
  footer: {
    flexDirection: "row",       // Arrange children in a row
    justifyContent: "center",   // Center children horizontally
  },
  
  // Footer text styles
  footerText: {
    color: "#7a6659",           // Medium brown text color
    fontSize: 14,               // Small text size
  },
  
  // Login link styles
  footerLink: {
    color: "#5b4334",           // Dark brown text color
    fontSize: 14,               // Small text size
    fontWeight: "600",          // Semi-bold font weight
    textDecorationLine: "underline", // Underline text like a web link
  },
});