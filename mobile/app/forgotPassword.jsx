// Import React library (required for JSX syntax and React components)
import React, { useState } from "react";

// Import UI components from React Native for building the screen
import {
  View,           // Container component (like a div in HTML)
  Text,           // For displaying text on screen
  TextInput,      // Input field for typing text
  TouchableOpacity, // Makes components clickable with fade effect
  StyleSheet,     // Creates styles for components
  Image,          // Displays images
  KeyboardAvoidingView, // Prevents keyboard from covering input fields
  Platform,       // Detects if app is running on iOS or Android
  Alert,          // Shows native popup alerts/dialogs
} from "react-native";

// Import navigation tools from Expo Router
import { Link, router } from "expo-router";

// Define and export the main ForgotPassword component
// 'export default' makes this the main thing other files can import
export default function ForgotPassword() {
  
  // Create state to store email input
  // useState("") creates a 'memory box' that starts as empty string
  // email = current value, setEmail = function to update value
  const [email, setEmail] = useState("");

  // Function that runs when user clicks "Send Reset Link" button
  const handleResetPassword = () => {
    
    // Check if email is empty
    // !email means "if email is falsy/empty"
    if (!email) {
      // Show error popup if email is empty
      Alert.alert("Error", "Please enter your email address");
      return; // Stop function execution here
    }
    
    // Check if email is valid (contains @ and .)
    // .includes() checks if string contains certain characters
    if (!email.includes("@") || !email.includes(".")) {
      // Show error popup if email format is invalid
      Alert.alert("Error", "Please enter a valid email address");
      return; // Stop function execution here
    }
    
    // TODO comment: Placeholder for connecting to backend server
    // TODO: Connect to backend
    
    // Show success message popup
    Alert.alert(
      "Reset Email Sent",                    // Popup title
      `Instructions sent to ${email}`,       // Message with user's email
      [{                                    // Array of buttons
        text: "OK",                          // Button text
        onPress: () => router.back()         // Function when OK is pressed
        // router.back() navigates back to previous screen
      }]
    );
  };

  // Return the UI that will be displayed on screen
  return (
    // KeyboardAvoidingView: Moves content up when keyboard appears
    <KeyboardAvoidingView
      style={styles.container}  // Apply container styles
      // Different behavior for iOS vs Android
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      // If iOS: add padding, If Android: adjust height
    >
      {/* Inner container for all content */}
      <View style={styles.innerContainer}>
        
        {/* Display person icon image */}
        <Image
          // Load image from assets folder
          source={require("../assets/images/login_person.png")}
          // Apply image styling
          style={styles.image}
        />

        {/* Main title text */}
        <Text style={styles.title}>Forgot Password?</Text>
        
        {/* Instructions text */}
        <Text style={styles.subtitle}>
          Enter your email and we'll send reset instructions.
        </Text>

        {/* Email input field */}
        <TextInput
          style={styles.input}  // Apply input field styles
          placeholder="Enter your email"          // Hint text when empty
          placeholderTextColor="#8b7768"         // Color of hint text
          value={email}                          // Current email value from state
          // Update email state when user types
          onChangeText={setEmail}                // setEmail updates the state
          keyboardType="email-address"           // Show email keyboard (@ and .)
          autoCapitalize="none"                  // Don't auto-capitalize letters
        />

        {/* Send Reset Link button */}
        <TouchableOpacity 
          style={styles.button}                  // Apply button styles
          onPress={handleResetPassword}          // Run function when pressed
        >
          {/* Button text */}
          <Text style={styles.buttonText}>Send Reset Link</Text>
        </TouchableOpacity>

        {/* Footer with link to go back to login */}
        <View style={styles.footer}>
          {/* Footer text */}
          <Text style={styles.footerText}>Remember password? </Text>
          
          {/* Clickable link to navigate to login screen */}
          <Link 
            href="/login"                        // Destination screen
            style={styles.loginLink}             // Apply link styles
          >
            Back to Login
          </Link>
        </View>
        
      </View>
    </KeyboardAvoidingView>
  );
}

// Create styles for all components
const styles = StyleSheet.create({
  // Main container styles
  container: { 
    flex: 1,                    // Take up all available space
    backgroundColor: "#f5efe6"  // Light cream background color
  },
  
  // Inner container styles
  innerContainer: { 
    flex: 1,                    // Take up all available space
    paddingHorizontal: 32,      // Left/right padding of 32 pixels
    justifyContent: "center"    // Center content vertically
  },
  
  // Image styles
  image: { 
    width: 250,                 // Image width: 250 pixels
    height: 200,                // Image height: 200 pixels
    alignSelf: "center",        // Center image horizontally
    marginBottom: 30,           // Space below image: 30 pixels
    resizeMode: "contain"       // Maintain aspect ratio
  },
  
  // Title text styles
  title: { 
    fontSize: 32,               // Text size: 32 pixels
    fontWeight: "800",          // Extra bold text
    color: "#4a3b31",           // Dark brown color
    marginBottom: 12,           // Space below: 12 pixels
    textAlign: "center"         // Center text horizontally
  },
  
  // Subtitle text styles
  subtitle: { 
    fontSize: 16,               // Text size: 16 pixels
    color: "#7a6659",           // Medium brown color
    textAlign: "center",        // Center text horizontally
    marginBottom: 40,           // Space below: 40 pixels
    lineHeight: 22              // Space between lines: 22 pixels
  },
  
  // Input field styles
  input: { 
    backgroundColor: "#efe6d8", // Light tan background
    color: "#4a3b31",           // Dark brown text color
    paddingHorizontal: 20,      // Left/right padding: 20 pixels
    paddingVertical: 16,        // Top/bottom padding: 16 pixels
    borderRadius: 20,           // Rounded corners: 20 pixel radius
    fontSize: 16,               // Text size: 16 pixels
    marginBottom: 24,           // Space below: 24 pixels
    borderWidth: 1,             // Border thickness: 1 pixel
    borderColor: "#d9c9b8"      // Light brown border color
  },
  
  // Button styles
  button: { 
    backgroundColor: "#5b4334", // Dark brown background
    paddingVertical: 16,        // Top/bottom padding: 16 pixels
    borderRadius: 26,           // Rounded corners: 26 pixel radius
    alignItems: "center",       // Center content horizontally
    marginBottom: 24            // Space below: 24 pixels
  },
  
  // Button text styles
  buttonText: { 
    color: "#fff",              // White text color
    fontSize: 18,               // Text size: 18 pixels
    fontWeight: "600"           // Semi-bold text
  },
  
  // Footer container styles
  footer: { 
    flexDirection: "row",       // Arrange children horizontally
    justifyContent: "center",   // Center children horizontally
    marginTop: 20               // Space above: 20 pixels
  },
  
  // Footer text styles
  footerText: { 
    color: "#7a6659",           // Medium brown color
    fontSize: 14                // Text size: 14 pixels
  },
  
  // Login link styles
  loginLink: { 
    color: "#5b4334",           // Dark brown color
    fontSize: 14,               // Text size: 14 pixels
    fontWeight: "600",          // Semi-bold text
    textDecorationLine: "underline" // Underline the text (like a web link)
  },
});