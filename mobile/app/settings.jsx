import { 
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Linking,
  TextInput,
  Modal,
  ActivityIndicator
} from 'react-native'
import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import { auth, db } from './firebaseConfig'
import { 
  deleteUser, 
  reauthenticateWithCredential, 
  EmailAuthProvider, 
  updatePassword 
} from 'firebase/auth'
import { deleteDoc, doc, collection, query, where, getDocs } from 'firebase/firestore'

export default function Settings() {
  const router = useRouter()

  // Toggles
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [darkModeEnabled, setDarkModeEnabled] = useState(false)
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true)
  const [medicalAlertEnabled, setMedicalAlertEnabled] = useState(false)

  // Modals
  const [showReAuth, setShowReAuth] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [showNepalEmergency, setShowNepalEmergency] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [reauthEmail, setReauthEmail] = useState('')
  const [reauthPassword, setReauthPassword] = useState('')
  const [loading, setLoading] = useState(false)

  // ===== NEPAL EMERGENCY CONTACTS =====
  const nepalEmergencyContacts = [
    { name: "Police Emergency", number: "100", type: "🚓 Police" },
    { name: "Ambulance", number: "102", type: "🚑 Medical" },
    { name: "Fire Department", number: "101", type: "🚒 Fire" },
    { name: "Tourist Police", number: "1144", type: "👮 Tourist" },
    { name: "Tribhuvan University Teaching Hospital", number: "01-4412303", type: "🏥 Hospital" },
    { name: "Bir Hospital", number: "01-4221119", type: "🏥 Hospital" },
    { name: "Patan Hospital", number: "01-5522288", type: "🏥 Hospital" },
    { name: "Civil Service Hospital", number: "01-4262859", type: "🏥 Hospital" },
    { name: "Kanti Children's Hospital", number: "01-4377368", type: "🏥 Pediatric" },
    { name: "Nepal Mediciti Hospital", number: "9801180000", type: "🏥 Private" },
    { name: "Norvic International Hospital", number: "01-4258554", type: "🏥 Private" },
    { name: "Red Cross Nepal", number: "01-4285083", type: "🟥 Relief" },
  ]

  // Handle emergency call
  const handleEmergencyCall = (number, name) => {
    Alert.alert(
      `Call ${name}`,
      `Do you want to call ${number}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Call", style: "destructive", onPress: () => Linking.openURL(`tel:${number}`) }
      ]
    )
  }

  // Show Nepal emergency contacts list
  const showEmergencyContactsList = () => {
    Alert.alert(
      "🇳🇵 Nepal Emergency Contacts",
      "Select a number to call:",
      nepalEmergencyContacts.map(contact => ({
        text: `${contact.type} - ${contact.number}`,
        onPress: () => handleEmergencyCall(contact.number, contact.name)
      })).concat([{ text: "Cancel", style: "cancel" }])
    )
  }

  // Quick emergency buttons
  const handleQuickEmergency = (type) => {
    let number = ""
    let name = ""
    
    switch(type) {
      case 'ambulance':
        number = "102"
        name = "Ambulance"
        break
      case 'police':
        number = "100"
        name = "Police"
        break
      case 'fire':
        number = "101"
        name = "Fire Department"
        break
      case 'tourist':
        number = "1144"
        name = "Tourist Police"
        break
    }
    
    handleEmergencyCall(number, name)
  }

  // ===== CHANGE PASSWORD FUNCTION =====
  const handleChangePassword = () => {
    setShowChangePassword(true)
  }

  const executePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      Alert.alert("Error", "Please fill all password fields")
      return
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters")
      return
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert("Error", "New passwords don't match")
      return
    }

    setLoading(true)

    try {
      const user = auth.currentUser
      if (!user) {
        Alert.alert("Error", "User not found")
        return
      }

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword)
      await reauthenticateWithCredential(user, credential)

      // Update password
      await updatePassword(user, newPassword)

      Alert.alert("✅ Success", "Password changed successfully!")
      setShowChangePassword(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
    } catch (error) {
      console.error("Password change error:", error)
      if (error.code === 'auth/wrong-password') {
        Alert.alert("Error", "Current password is incorrect")
      } else if (error.code === 'auth/weak-password') {
        Alert.alert("Error", "Password is too weak. Use at least 6 characters")
      } else if (error.code === 'auth/requires-recent-login') {
        Alert.alert("Error", "Please login again and try")
      } else {
        Alert.alert("Error", "Failed to change password")
      }
    } finally {
      setLoading(false)
    }
  }

  // ===== DELETE ACCOUNT FUNCTION =====
  const deleteAllUserData = async (userId) => {
    const collections = ["users", "calorie_burn", "calorie_intake", "workouts"]
    for (const col of collections) {
      const q = query(collection(db, col), where("userID", "==", userId))
      const snapshot = await getDocs(q)
      for (const docSnap of snapshot.docs) {
        await deleteDoc(doc(db, col, docSnap.id))
      }
    }
  }

  const handleDeleteAccount = () => {
    Alert.alert(
      "⚠️ Delete Account",
      "This will permanently delete all your data. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete Account", 
          style: "destructive",
          onPress: async () => {
            try {
              const user = auth.currentUser
              if (!user) return

              setLoading(true)

              try {
                await deleteAllUserData(user.uid)
                await deleteUser(user)
                router.replace('/login')
                Alert.alert("Account Deleted", "Your account has been deleted.")
              } catch (err) {
                if (err.code === 'auth/requires-recent-login') {
                  setShowReAuth(true)
                } else {
                  throw err
                }
              }
            } catch (error) {
              console.error(error)
              Alert.alert("Error", "Failed to delete account")
            } finally {
              setLoading(false)
            }
          }
        }
      ]
    )
  }

  const handleReAuthAndDelete = async () => {
    try {
      setLoading(true)
      const user = auth.currentUser
      if (!user) return

      const credential = EmailAuthProvider.credential(reauthEmail, reauthPassword)
      await reauthenticateWithCredential(user, credential)

      await deleteAllUserData(user.uid)
      await deleteUser(user)

      setShowReAuth(false)
      router.replace('/login')
      Alert.alert("Account Deleted", "Your account has been deleted.")
    } catch (error) {
      console.error(error)
      Alert.alert("Error", "Re-authentication failed. Check credentials.")
    } finally {
      setLoading(false)
    }
  }

  // ===== OTHER HANDLERS =====
  const handleMedicalInfo = () => {
    Alert.alert(
      "🏥 Medical Information",
      "In an emergency in Nepal:\n\n1. Call 102 for ambulance\n2. Call 100 for police\n3. Call 1144 for tourist police\n4. Stay calm & provide location\n\nAdd your medical info:",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Add Medical Info", onPress: () => {
          Alert.alert("Coming Soon", "Medical info feature coming in next update")
        }}
      ]
    )
  }

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

  // Render Nepal Emergency Modal
  const renderNepalEmergencyModal = () => (
    <Modal visible={showNepalEmergency} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>🇳🇵 Nepal Emergency</Text>
          <Text style={styles.modalSubtitle}>Tap any number to call immediately</Text>
          
          <ScrollView style={styles.emergencyScroll}>
            {nepalEmergencyContacts.map((contact, index) => (
              <TouchableOpacity 
                key={index}
                style={styles.emergencyContactItem}
                onPress={() => {
                  setShowNepalEmergency(false)
                  handleEmergencyCall(contact.number, contact.name)
                }}
              >
                <View style={styles.contactIcon}>
                  <Text style={styles.contactIconText}>
                    {contact.type.includes('Police') ? '🚓' : 
                     contact.type.includes('Medical') ? '🚑' :
                     contact.type.includes('Fire') ? '🚒' :
                     contact.type.includes('Hospital') ? '🏥' : '🟥'}
                  </Text>
                </View>
                <View style={styles.contactDetails}>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  <Text style={styles.contactType}>{contact.type}</Text>
                </View>
                <Text style={styles.contactNumber}>{contact.number}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <TouchableOpacity 
            style={[styles.modalButton, {backgroundColor: '#ccc', marginTop: 10}]}
            onPress={() => setShowNepalEmergency(false)}
          >
            <Text style={[styles.modalButtonText, {color: '#4a3b31'}]}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Manage your FitTrack preferences</Text>
      </View>

      {/* 🚨 NEPAL EMERGENCY SECTION - UPDATED */}
      <View style={[styles.section, styles.emergencySection]}>
        <Text style={[styles.sectionTitle, styles.emergencyTitle]}>
          🇳🇵 Nepal Emergency Contacts
        </Text>
        
        <Text style={styles.emergencyNote}>
          Immediate assistance numbers for Nepal
        </Text>

        {/* Quick Emergency Buttons */}
        <View style={styles.quickEmergencyButtons}>
          <TouchableOpacity 
            style={[styles.quickEmergencyBtn, styles.ambulanceBtn]}
            onPress={() => handleQuickEmergency('ambulance')}
          >
            <Text style={styles.quickBtnEmoji}>🚑</Text>
            <Text style={styles.quickBtnText}>Ambulance</Text>
            <Text style={styles.quickBtnNumber}>102</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.quickEmergencyBtn, styles.policeBtn]}
            onPress={() => handleQuickEmergency('police')}
          >
            <Text style={styles.quickBtnEmoji}>🚓</Text>
            <Text style={styles.quickBtnText}>Police</Text>
            <Text style={styles.quickBtnNumber}>100</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.quickEmergencyBtn, styles.fireBtn]}
            onPress={() => handleQuickEmergency('fire')}
          >
            <Text style={styles.quickBtnEmoji}>🚒</Text>
            <Text style={styles.quickBtnText}>Fire</Text>
            <Text style={styles.quickBtnNumber}>101</Text>
          </TouchableOpacity>
        </View>

        {/* Emergency Options */}
        <TouchableOpacity 
          style={[styles.settingItem, styles.emergencyItem]} 
          onPress={() => setShowNepalEmergency(true)}
        >
          <View>
            <Text style={[styles.settingText, styles.emergencyText]}>View All Emergency Numbers</Text>
            <Text style={styles.emergencySubtext}>Full list of Nepal emergency contacts</Text>
          </View>
          <Text style={[styles.arrow, styles.emergencyArrow]}>›</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.settingItem, styles.emergencyItem]} 
          onPress={handleMedicalInfo}
        >
          <View>
            <Text style={[styles.settingText, styles.emergencyText]}>Medical Information</Text>
            <Text style={styles.emergencySubtext}>Add your medical details</Text>
          </View>
          <Text style={[styles.arrow, styles.emergencyArrow]}>🏥</Text>
        </TouchableOpacity>
        
        <View style={[styles.settingItem, styles.emergencyItem, styles.lastItem]}>
          <Text style={[styles.settingText, styles.emergencyText]}>Emergency Alerts</Text>
          <Switch
            value={medicalAlertEnabled}
            onValueChange={setMedicalAlertEnabled}
            trackColor={{ false: '#ffcccc', true: '#e74c3c' }}
            thumbColor={medicalAlertEnabled ? '#fff' : '#f4f3f4'}
          />
        </View>
      </View>

      {/* Account Section with Change Password */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/profile')}>
          <Text style={styles.settingText}>Edit Profile</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem} onPress={handleChangePassword}>
          <Text style={styles.settingText}>Change Password</Text>
          <Text style={styles.arrow}>🔐</Text>
        </TouchableOpacity>
      </View>

      {/* Preferences Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingText}>Notifications</Text>
          <Switch 
            value={notificationsEnabled} 
            onValueChange={setNotificationsEnabled} 
            trackColor={{ false: '#d9c9b8', true: '#4a2c1a'}} 
            thumbColor={notificationsEnabled ? '#fff' : '#f4f3f4'} 
          />
        </View>
        <View style={[styles.settingItem, styles.lastItem]}>
          <Text style={styles.settingText}>Auto Sync</Text>
          <Switch 
            value={autoSyncEnabled} 
            onValueChange={setAutoSyncEnabled} 
            trackColor={{ false: '#d9c9b8', true: '#4a2c1a'}} 
            thumbColor={autoSyncEnabled ? '#fff' : '#f4f3f4'} 
          />
        </View>
      </View>

      {/* Support Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support & About</Text>
        <TouchableOpacity style={styles.settingItem} onPress={() => Alert.alert("Help & Support","Email: support@fittrack.com")}>
          <Text style={styles.settingText}>Help & Support</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem} onPress={() => Alert.alert("Privacy Policy","Your data is secure with us")}>
          <Text style={styles.settingText}>Privacy Policy</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
        <View style={[styles.settingItem, styles.lastItem]}>
          <Text style={styles.settingText}>App Version</Text>
          <Text style={styles.versionText}>1.0.0</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        <TouchableOpacity style={[styles.actionButton, styles.logoutButton]} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={handleDeleteAccount}>
          <Text style={styles.deleteButtonText}>Delete Account</Text>
        </TouchableOpacity>
      </View>

      {/* Nepal Emergency Modal */}
      {renderNepalEmergencyModal()}

      {/* Change Password Modal */}
      <Modal visible={showChangePassword} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Password</Text>
            <Text style={styles.modalSubtitle}>Enter your current and new password</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Current Password"
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
              autoCapitalize="none"
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="New Password (min 6 chars)"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              autoCapitalize="none"
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="Confirm New Password"
              secureTextEntry
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
              autoCapitalize="none"
            />
            
            <TouchableOpacity style={styles.modalButton} onPress={executePasswordChange}>
              {loading ? <ActivityIndicator color="#fff"/> : <Text style={styles.modalButtonText}>Change Password</Text>}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalButton, {backgroundColor: '#ccc', marginTop: 10}]} 
              onPress={() => {
                setShowChangePassword(false)
                setCurrentPassword('')
                setNewPassword('')
                setConfirmNewPassword('')
              }}
            >
              <Text style={[styles.modalButtonText, {color: '#4a3b31'}]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Re-auth Modal for Delete Account */}
      <Modal visible={showReAuth} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Re-authentication Required</Text>
            <Text style={styles.modalSubtitle}>Enter credentials to delete account</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={reauthEmail}
              onChangeText={setReauthEmail}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Password"
              secureTextEntry
              value={reauthPassword}
              onChangeText={setReauthPassword}
            />
            <TouchableOpacity style={styles.modalButton} onPress={handleReAuthAndDelete}>
              {loading ? <ActivityIndicator color="#fff"/> : <Text style={styles.modalButtonText}>Confirm Delete</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, {backgroundColor: '#ccc', marginTop: 10}]} onPress={() => setShowReAuth(false)}>
              <Text style={[styles.modalButtonText, {color: '#4a3b31'}]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5efe6', 
    padding: 16, 
    paddingTop: 20 
  },
  header: { 
    paddingVertical: 20, 
    alignItems: 'center', 
    marginBottom: 10 
  },
  title: { 
    fontSize: 32, 
    fontWeight: '800', 
    color: '#4a3b31', 
    marginBottom: 8 
  },
  subtitle: { 
    fontSize: 16, 
    color: '#7a6659', 
    textAlign: 'center' 
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
    shadowRadius: 2 
  },
  emergencySection: { 
    borderLeftWidth: 4, 
    borderLeftColor: '#e74c3c' 
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    color: '#4a3b31', 
    marginBottom: 16, 
    paddingBottom: 8, 
    borderBottomWidth: 1, 
    borderBottomColor: '#efe6d8' 
  },
  emergencyTitle: { 
    color: '#e74c3c' 
  },
  emergencyNote: {
    fontSize: 14,
    color: '#e74c3c',
    marginBottom: 15,
    textAlign: 'center',
    backgroundColor: '#ffe6e6',
    padding: 8,
    borderRadius: 8
  },
  quickEmergencyButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15
  },
  quickEmergencyBtn: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 4,
    elevation: 2
  },
  ambulanceBtn: {
    backgroundColor: '#e74c3c'
  },
  policeBtn: {
    backgroundColor: '#3498db'
  },
  fireBtn: {
    backgroundColor: '#e67e22'
  },
  quickBtnEmoji: {
    fontSize: 24,
    marginBottom: 4
  },
  quickBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 11
  },
  quickBtnNumber: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
    marginTop: 2
  },
  emergencyItem: { 
    borderBottomColor: '#ffe6e6' 
  },
  emergencyText: { 
    color: '#c0392b', 
    fontWeight: '600' 
  },
  emergencySubtext: { 
    fontSize: 12, 
    color: '#e74c3c', 
    marginTop: 2,
    opacity: 0.8 
  },
  emergencyArrow: { 
    color: '#e74c3c', 
    fontSize: 20 
  },
  settingItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingVertical: 14, 
    borderBottomWidth: 1, 
    borderBottomColor: '#f5f5f5' 
  },
  lastItem: {
    borderBottomWidth: 0
  },
  settingText: { 
    fontSize: 16, 
    color: '#4a3b31', 
    fontWeight: '500' 
  },
  arrow: { 
    fontSize: 20, 
    color: '#d9c9b8' 
  },
  versionText: { 
    fontSize: 14, 
    color: '#7a6659', 
    fontWeight: '500' 
  },
  actionSection: { 
    marginTop: 10, 
    marginBottom: 30 
  },
  actionButton: { 
    paddingVertical: 16, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginBottom: 12 
  },
  logoutButton: { 
    backgroundColor: '#efe6d8', 
    borderWidth: 1, 
    borderColor: '#d9c9b8' 
  },
  logoutButtonText: { 
    color: '#4a3b31', 
    fontSize: 16, 
    fontWeight: '600' 
  },
  deleteButton: { 
    backgroundColor: '#f5efe6', 
    borderWidth: 1, 
    borderColor: '#e74c3c' 
  },
  deleteButtonText: { 
    color: '#e74c3c', 
    fontSize: 16, 
    fontWeight: '600' 
  },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalContent: { 
    width: '90%', 
    maxHeight: '80%',
    backgroundColor: '#fff', 
    borderRadius: 20, 
    padding: 20 
  },
  modalTitle: { 
    fontSize: 22, 
    fontWeight: '700', 
    marginBottom: 8, 
    color: '#4a3b31',
    textAlign: 'center'
  },
  modalSubtitle: { 
    fontSize: 14, 
    color: '#7a6659', 
    marginBottom: 20,
    textAlign: 'center'
  },
  emergencyScroll: {
    maxHeight: 400,
    marginBottom: 15
  },
  emergencyContactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5efe6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  contactIconText: {
    fontSize: 20
  },
  contactDetails: {
    flex: 1
  },
  contactName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4a3b31'
  },
  contactType: {
    fontSize: 12,
    color: '#7a6659',
    marginTop: 2
  },
  contactNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#e74c3c'
  },
  modalInput: { 
    backgroundColor: '#f8f5f0', 
    padding: 14, 
    borderRadius: 12, 
    fontSize: 16, 
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0d6cc'
  },
  modalButton: { 
    backgroundColor: '#C4935D', 
    padding: 14, 
    borderRadius: 14, 
    alignItems: 'center' 
  },
  modalButtonText: { 
    color: '#fff', 
    fontWeight: '600', 
    fontSize: 16 
  }
})