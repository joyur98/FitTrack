// Import UI components from React Native
import { 
  StyleSheet,     // For creating and organizing component styles
  Text,           // For displaying text on screen
  View,           // Container component (like a div in HTML)
  TouchableOpacity, // Makes components clickable with fade effect
  ScrollView,     // Creates a scrollable container
  Switch,         // Toggle switch component
  Alert,          // For showing popup alerts
  Linking         // For opening phone dialer/emergency apps
} from 'react-native'

// Import React library and hooks
import React, { useState } from 'react'

// Import navigation hook from Expo Router
import { useRouter } from 'expo-router'

// Define the Settings component
const Settings = () => {
  // Initialize router for navigation between screens
  const router = useRouter()

  // State for toggle switches
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [darkModeEnabled, setDarkModeEnabled] = useState(false)
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true)
  const [medicalAlertEnabled, setMedicalAlertEnabled] = useState(false)

  // Handle logout with confirmation
  const handleLogout = () => {
    Alert.alert(
      "Logout",  // Alert title
      "Are you sure you want to logout?",  // Alert message
      [
        { text: "Cancel", style: "cancel" },  // Cancel button
        { 
          text: "Logout", 
          style: "destructive", 
          onPress: () => router.push('/login')  // Navigate to login on logout
        }
      ]
    )
  }

  // Handle delete account with warning
  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",  // Alert title
      "This action cannot be undone. All your data will be permanently deleted.",  // Warning message
      [
        { text: "Cancel", style: "cancel" },  // Cancel button
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: () => console.log("Account deleted")  // Placeholder for delete function
        }
      ]
    )
  }

  // Handle emergency call
  const handleEmergencyCall = () => {
    Alert.alert(
      "Emergency Call",
      "Do you want to call emergency services?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Call 911", 
          style: "destructive", 
          onPress: () => Linking.openURL('tel:911')  // Opens phone dialer
        }
      ]
    )
  }

  // Handle emergency contact
  const handleEmergencyContact = () => {
    Alert.alert(
      "Emergency Contact",
      "Call your emergency contact?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Call", 
          style: "destructive", 
          onPress: () => Linking.openURL('tel:+1234567890')  // Replace with actual number
        }
      ]
    )
  }

  // Handle add medical info
  const handleAddMedicalInfo = () => {
    Alert.alert(
      "Medical Information",
      "Add your medical information like allergies, medications, blood type, etc.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Add Info", 
          onPress: () => router.push('/medicalInfo')  // Navigate to medical info screen
        }
      ]
    )
  }

  // Return the UI that will be displayed
  return (
    // ScrollView allows scrolling if content exceeds screen height
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* Header section at top of screen */}
      <View style={styles.header}>
        {/* Main title text */}
        <Text style={styles.title}>Settings</Text>
        {/* Subtitle text below title */}
        <Text style={styles.subtitle}>Manage your FitTrack preferences</Text>
      </View>

      {/* Medical Emergency Section */}
      <View style={[styles.section, styles.emergencySection]}>
        {/* Emergency section title with red color */}
        <Text style={[styles.sectionTitle, styles.emergencyTitle]}>🚨 Medical Emergency</Text>
        
        {/* Emergency Call button */}
        <TouchableOpacity 
          style={[styles.settingItem, styles.emergencyItem]}
          onPress={handleEmergencyCall}
        >
          <View style={styles.settingLeft}>
            <Text style={[styles.settingText, styles.emergencyText]}>Emergency Call</Text>
            <Text style={styles.settingDescription}>Call 911 or emergency services</Text>
          </View>
          <Text style={[styles.arrow, styles.emergencyArrow]}>›</Text>
        </TouchableOpacity>
        
        {/* Emergency Contact button */}
        <TouchableOpacity 
          style={[styles.settingItem, styles.emergencyItem]}
          onPress={handleEmergencyContact}
        >
          <View style={styles.settingLeft}>
            <Text style={[styles.settingText, styles.emergencyText]}>Emergency Contact</Text>
            <Text style={styles.settingDescription}>Call your emergency contact</Text>
          </View>
          <Text style={[styles.arrow, styles.emergencyArrow]}>›</Text>
        </TouchableOpacity>
        
        {/* Add Medical Information button */}
        <TouchableOpacity 
          style={[styles.settingItem, styles.emergencyItem]}
          onPress={handleAddMedicalInfo}
        >
          <View style={styles.settingLeft}>
            <Text style={[styles.settingText, styles.emergencyText]}>Medical Information</Text>
            <Text style={styles.settingDescription}>Add allergies, medications, etc.</Text>
          </View>
          <Text style={[styles.arrow, styles.emergencyArrow]}>›</Text>
        </TouchableOpacity>
        
        {/* Medical Alert toggle */}
        <View style={[styles.settingItem, styles.emergencyItem]}>
          <View style={styles.settingLeft}>
            <Text style={[styles.settingText, styles.emergencyText]}>Medical Alert</Text>
            <Text style={styles.settingDescription}>Show medical info on lock screen</Text>
          </View>
          <Switch
            value={medicalAlertEnabled}
            onValueChange={setMedicalAlertEnabled}
            trackColor={{ false: '#ffcccc', true: '#e74c3c' }}  // Red theme for emergency
            thumbColor={medicalAlertEnabled ? '#fff' : '#f4f3f4'}
          />
        </View>
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
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => Alert.alert("Coming Soon", "Change password feature will be available soon")}
        >
          {/* Container for text on left side */}
          <View style={styles.settingLeft}>
            {/* Setting option text */}
            <Text style={styles.settingText}>Change Password</Text>
          </View>
          {/* Arrow icon indicating this is clickable */}
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Preferences settings section */}
      <View style={styles.section}>
        {/* Section title */}
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        {/* Notifications toggle */}
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingText}>Notifications</Text>
            <Text style={styles.settingDescription}>Receive workout reminders</Text>
          </View>
          {/* Switch component for toggling notifications */}
          <Switch
            value={notificationsEnabled}  // Current state
            onValueChange={setNotificationsEnabled}  // Update state on toggle
            trackColor={{ false: '#d9c9b8', true: '#4a2c1a' }}  // Track colors
            thumbColor={notificationsEnabled ? '#fff' : '#f4f3f4'}  // Thumb colors
          />
        </View>
        
        {/* Dark Mode toggle */}
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingText}>Dark Mode</Text>
            <Text style={styles.settingDescription}>Switch to dark theme</Text>
          </View>
          <Switch
            value={darkModeEnabled}
            onValueChange={setDarkModeEnabled}
            trackColor={{ false: '#d9c9b8', true: '#4a2c1a' }}
            thumbColor={darkModeEnabled ? '#fff' : '#f4f3f4'}
          />
        </View>
        
        {/* Auto Sync toggle */}
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingText}>Auto Sync</Text>
            <Text style={styles.settingDescription}>Sync data automatically</Text>
          </View>
          <Switch
            value={autoSyncEnabled}
            onValueChange={setAutoSyncEnabled}
            trackColor={{ false: '#d9c9b8', true: '#4a2c1a' }}
            thumbColor={autoSyncEnabled ? '#fff' : '#f4f3f4'}
          />
        </View>
      </View>

      {/* Support & About section */}
      <View style={styles.section}>
        {/* Section title */}
        <Text style={styles.sectionTitle}>Support & About</Text>
        
        {/* Help & Support option */}
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => Alert.alert("Help & Support", "Contact us at support@fittrack.com")}
        >
          <View style={styles.settingLeft}>
            <Text style={styles.settingText}>Help & Support</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
        
        {/* Privacy Policy option */}
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => Alert.alert("Privacy Policy", "View our privacy policy")}
        >
          <View style={styles.settingLeft}>
            <Text style={styles.settingText}>Privacy Policy</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
        
        {/* App Version display */}
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingText}>App Version</Text>
          </View>
          <Text style={styles.versionText}>1.0.0</Text>
        </View>
      </View>

      {/* Action Buttons section */}
      <View style={styles.actionSection}>
        {/* Logout button */}
        <TouchableOpacity 
          style={[styles.actionButton, styles.logoutButton]} 
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
        
        {/* Delete Account button */}
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]} 
          onPress={handleDeleteAccount}
        >
          <Text style={styles.deleteButtonText}>Delete Account</Text>
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
    paddingTop: 20,             // Top padding
  },
  
  // Header section styles
  header: {
    paddingVertical: 20,        // Top and bottom padding of 20 pixels
    alignItems: 'center',       // Center children horizontally
    marginBottom: 10,           // Space below header
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
  
  // Emergency section special styles
  emergencySection: {
    borderLeftWidth: 4,         // Red accent border on left
    borderLeftColor: '#e74c3c', // Red color for emergency
  },
  
  // Emergency section title styles
  emergencyTitle: {
    color: '#e74c3c',           // Red color for emergency title
  },
  
  // Emergency item styles
  emergencyItem: {
    borderBottomColor: '#ffe6e6', // Light red border for emergency items
  },
  
  // Emergency text styles
  emergencyText: {
    color: '#c0392b',           // Dark red color for emergency text
  },
  
  // Emergency arrow styles
  emergencyArrow: {
    color: '#e74c3c',           // Red color for emergency arrows
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
  
  // Setting description text styles
  settingDescription: {
    fontSize: 14,               // Small text size
    color: '#7a6659',           // Medium brown text color
    marginTop: 2,               // Small space above
  },
  
  // Arrow icon styles
  arrow: {
    fontSize: 24,               // Large arrow size
    color: '#d9c9b8',           // Light brown arrow color
    marginLeft: 10,             // Space left of arrow
  },
  
  // Version text styles
  versionText: {
    fontSize: 14,               // Small text size
    color: '#7a6659',           // Medium brown text color
    fontWeight: '500',          // Medium font weight
  },
  
  // Action buttons section styles
  actionSection: {
    marginTop: 10,              // Space above action buttons
    marginBottom: 30,           // Space below action buttons
  },
  
  // Base action button styles
  actionButton: {
    paddingVertical: 16,        // Top and bottom padding
    borderRadius: 12,           // Rounded corners
    alignItems: 'center',       // Center content horizontally
    marginBottom: 12,           // Space between buttons
  },
  
  // Logout button specific styles
  logoutButton: {
    backgroundColor: '#efe6d8', // Light tan background
    borderWidth: 1,             // Border thickness
    borderColor: '#d9c9b8',     // Light brown border color
  },
  
  // Logout button text styles
  logoutButtonText: {
    color: '#4a3b31',           // Dark brown text color
    fontSize: 16,               // Medium text size
    fontWeight: '600',          // Semi-bold font weight
  },
  
  // Delete account button specific styles
  deleteButton: {
    backgroundColor: '#f5efe6', // Light cream background
    borderWidth: 1,             // Border thickness
    borderColor: '#e74c3c',     // Red border color (warning)
  },
  
  // Delete account button text styles
  deleteButtonText: {
    color: '#e74c3c',           // Red text color (warning)
    fontSize: 16,               // Medium text size
    fontWeight: '600',          // Semi-bold font weight
  },
})