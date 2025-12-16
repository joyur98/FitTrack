import { StyleSheet, Text, View, Switch, TouchableOpacity, ScrollView, Alert } from 'react-native'
import React, { useState } from 'react'
import { useRouter } from 'expo-router'

const Settings = () => {
  const router = useRouter()
  
  // State for toggles
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [darkModeEnabled, setDarkModeEnabled] = useState(false)
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true)
  const [healthDataSharing, setHealthDataSharing] = useState(false)
  
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", style: "destructive", onPress: () => router.push('/login') }
      ]
    )
  }
  
  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This action cannot be undone. All your data will be permanently deleted.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => console.log("Account deleted") }
      ]
    )
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Manage your FitTrack preferences</Text>
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/profile')}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingText}>Edit Profile</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem} onPress={() => Alert.alert("Coming Soon", "Change password feature will be available soon")}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingText}>Change Password</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem} onPress={() => Alert.alert("Privacy Policy", "View our privacy policy")}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingText}>Privacy Policy</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Preferences Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingText}>Notifications</Text>
            <Text style={styles.settingDescription}>Receive workout reminders</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#d9c9b8', true: '#4a2c1a' }}
            thumbColor={notificationsEnabled ? '#fff' : '#f4f3f4'}
          />
        </View>
        
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

      {/* Data & Privacy Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data & Privacy</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingText}>Share Health Data</Text>
            <Text style={styles.settingDescription}>Share anonymous data for research</Text>
          </View>
          <Switch
            value={healthDataSharing}
            onValueChange={setHealthDataSharing}
            trackColor={{ false: '#d9c9b8', true: '#4a2c1a' }}
            thumbColor={healthDataSharing ? '#fff' : '#f4f3f4'}
          />
        </View>
        
        <TouchableOpacity style={styles.settingItem} onPress={() => Alert.alert("Export Data", "Your data export will be sent to your email")}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingText}>Export Data</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem} onPress={() => Alert.alert("Clear Cache", "App cache cleared successfully")}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingText}>Clear Cache</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        
        <TouchableOpacity style={styles.settingItem} onPress={() => Alert.alert("Version", "FitTrack v1.0.0")}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingText}>App Version</Text>
          </View>
          <Text style={styles.versionText}>1.0.0</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem} onPress={() => Alert.alert("Help & Support", "Contact support@fittrack.com")}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingText}>Help & Support</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.settingItem} onPress={() => Alert.alert("Rate App", "Would you like to rate FitTrack?")}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingText}>Rate FitTrack</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.logoutButton]} 
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]} 
          onPress={handleDeleteAccount}
        >
          <Text style={styles.deleteButtonText}>Delete Account</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.navcard}>
        <TouchableOpacity onPress={() => router.push('/workout')}>
          <Text style={styles.navText}>Workout</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/dashboard')}>
          <Text style={styles.navText}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/profile')}>
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/settings')}>
          <Text style={[styles.navText, styles.activeNavText]}>Settings</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

export default Settings

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5efe6',
    paddingHorizontal: 16,
  },
  header: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#4a3b31',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7a6659',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4a3b31',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#efe6d8',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  settingLeft: {
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    color: '#4a3b31',
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 14,
    color: '#7a6659',
    marginTop: 2,
  },
  arrow: {
    fontSize: 24,
    color: '#d9c9b8',
    marginLeft: 10,
  },
  versionText: {
    fontSize: 14,
    color: '#7a6659',
    fontWeight: '500',
  },
  actionSection: {
    marginBottom: 30,
  },
  actionButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  logoutButton: {
    backgroundColor: '#efe6d8',
    borderWidth: 1,
    borderColor: '#d9c9b8',
  },
  logoutButtonText: {
    color: '#4a3b31',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#f5efe6',
    borderWidth: 1,
    borderColor: '#e74c3c',
  },
  deleteButtonText: {
    color: '#e74c3c',
    fontSize: 16,
    fontWeight: '600',
  },
  navcard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 3,
  },
  navText: {
    fontSize: 14,
    color: '#7a6659',
    fontWeight: '500',
  },
  activeNavText: {
    color: '#4a2c1a',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
})