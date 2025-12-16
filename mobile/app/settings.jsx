// Import UI components from React Native
import { 
  StyleSheet,     // For creating and organizing component styles
  Text,           // For displaying text on screen
  View,           // Container component (like a div in HTML)
  TouchableOpacity, // Makes components clickable with fade effect
  ScrollView      // Creates a scrollable container
} from 'react-native'

// Import React library (required for JSX and components)
import React from 'react'

// Import navigation hook from Expo Router
import { useRouter } from 'expo-router'

// Define the Settings component
const Settings = () => {
  // Initialize router for navigation between screens
  const router = useRouter()

  // Return the UI that will be displayed
  return (
    // ScrollView allows scrolling if content exceeds screen height
    <ScrollView style={styles.container}>
      
      {/* Header section at top of screen */}
      <View style={styles.header}>
        {/* Main title text */}
        <Text style={styles.title}>Settings</Text>
        {/* Subtitle text below title */}
        <Text style={styles.subtitle}>Manage your FitTrack preferences</Text>
      </View>

      {/* Account settings section */}
      <View style={styles.section}>
        {/* Section title */}
        <Text style={styles.sectionTitle}>Account</Text>
        
        {/* First setting option: Edit Profile */}
        <TouchableOpacity 
          style={styles.settingItem} 
          onPress={() => router.push('/profile')} // Navigate to Profile screen when pressed
        >
          {/* Container for text on left side */}
          <View style={styles.settingLeft}>
            {/* Setting option text */}
            <Text style={styles.settingText}>Edit Profile</Text>
          </View>
          {/* Arrow icon indicating this is clickable */}
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
        
        {/* Second setting option: Change Password */}
        <TouchableOpacity style={styles.settingItem}>
          {/* Container for text on left side */}
          <View style={styles.settingLeft}>
            {/* Setting option text */}
            <Text style={styles.settingText}>Change Password</Text>
          </View>
          {/* Arrow icon indicating this is clickable */}
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

// Export component so it can be imported in other files
export default Settings

// Create and define all styles for components
const styles = StyleSheet.create({
  // Main container styles
  container: {
    flex: 1,                    // Take up all available space
    backgroundColor: '#f5efe6', // Light cream background color
    paddingHorizontal: 16,      // Left and right padding of 16 pixels
  },
  
  // Header section styles
  header: {
    paddingVertical: 24,        // Top and bottom padding of 24 pixels
    alignItems: 'center',       // Center children horizontally
  },
  
  // Main title text styles
  title: {
    fontSize: 32,               // Large text size (32 pixels)
    fontWeight: '800',          // Extra bold font weight
    color: '#4a3b31',           // Dark brown text color
    marginBottom: 8,            // Space below text: 8 pixels
  },
  
  // Subtitle text styles
  subtitle: {
    fontSize: 16,               // Medium text size (16 pixels)
    color: '#7a6659',           // Medium brown text color
    textAlign: 'center',        // Center text horizontally
  },
  
  // Section container styles
  section: {
    backgroundColor: '#fff',    // White background
    borderRadius: 16,           // Rounded corners (16 pixel radius)
    padding: 16,                // Internal padding on all sides
    marginBottom: 20,           // Space below section: 20 pixels
    elevation: 2,               // Shadow depth on Android
    shadowColor: '#000',        // Shadow color: black
    shadowOffset: { 
      width: 0,                 // Horizontal shadow offset
      height: 1                 // Vertical shadow offset (1 pixel down)
    },
    shadowOpacity: 0.1,         // Shadow transparency (10% opaque)
    shadowRadius: 2,            // Shadow blur radius
  },
  
  // Section title styles
  sectionTitle: {
    fontSize: 18,               // Medium-large text size
    fontWeight: '700',          // Bold font weight
    color: '#4a3b31',           // Dark brown text color
    marginBottom: 16,           // Space below: 16 pixels
    paddingBottom: 8,           // Space below text within element
    borderBottomWidth: 1,       // Bottom border thickness
    borderBottomColor: '#efe6d8', // Light tan border color
  },
  
  // Individual setting item styles
  settingItem: {
    flexDirection: 'row',       // Arrange children in a row (horizontal)
    alignItems: 'center',       // Center children vertically
    justifyContent: 'space-between', // Space children apart
    paddingVertical: 14,        // Top and bottom padding
    borderBottomWidth: 1,       // Bottom border thickness
    borderBottomColor: '#f5f5f5', // Very light gray border color
  },
  
  // Container for text on left side of setting item
  settingLeft: {
    flex: 1,                    // Take up all available space
  },
  
  // Setting option text styles
  settingText: {
    fontSize: 16,               // Medium text size
    color: '#4a3b31',           // Dark brown text color
    fontWeight: '500',          // Medium font weight
  },
  
  // Arrow icon styles
  arrow: {
    fontSize: 24,               // Large arrow size
    color: '#d9c9b8',           // Light brown arrow color
    marginLeft: 10,             // Space left of arrow
  },
})