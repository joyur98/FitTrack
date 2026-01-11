// Import UI components from React Native
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

// Import React and hooks
import React, { useState } from 'react'

// Import navigation
import { useRouter } from 'expo-router'

// Firebase imports
import { auth, db } from './firebaseConfig'
import { deleteUser, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth'
import { deleteDoc, doc, collection, query, where, getDocs } from 'firebase/firestore'

export default function Settings() {
  const router = useRouter()

  // Toggles
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [darkModeEnabled, setDarkModeEnabled] = useState(false)
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true)
  const [medicalAlertEnabled, setMedicalAlertEnabled] = useState(false)

  // Re-authentication modal
  const [showReAuth, setShowReAuth] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  // ===== Delete all user data helper =====
  const deleteAllUserData = async (userId) => {
    const collections = ["users", "calorie_burn", "workouts", "meal_logs"] // Add your collections here
    for (const col of collections) {
      const q = query(collection(db, col), where("userID", "==", userId))
      const snapshot = await getDocs(q)
      for (const docSnap of snapshot.docs) {
        await deleteDoc(doc(db, col, docSnap.id))
      }
    }
  }

  // ===== Delete Account =====
  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This action cannot be undone. All your data will be permanently deleted.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              const user = auth.currentUser
              if (!user) return

              setLoading(true)

              try {
                // Try deleting without re-authentication
                await deleteAllUserData(user.uid)
                await deleteUser(user)
                router.replace('/login')
                Alert.alert("Account deleted", "Your account has been deleted successfully.")
              } catch (err) {
                // Requires recent login
                if (err.code === 'auth/requires-recent-login') {
                  setShowReAuth(true)
                } else {
                  throw err
                }
              }
            } catch (error) {
              console.error(error)
              Alert.alert("Error", "Failed to delete account.")
            } finally {
              setLoading(false)
            }
          }
        }
      ]
    )
  }

  // ===== Handle Re-authentication =====
  const handleReAuthAndDelete = async () => {
    try {
      setLoading(true)
      const user = auth.currentUser
      if (!user) return

      const credential = EmailAuthProvider.credential(email, password)
      await reauthenticateWithCredential(user, credential)

      await deleteAllUserData(user.uid)
      await deleteUser(user)

      setShowReAuth(false)
      router.replace('/login')
      Alert.alert("Account deleted", "Your account has been deleted successfully.")
    } catch (error) {
      console.error(error)
      Alert.alert("Error", "Re-authentication failed. Check your credentials.")
    } finally {
      setLoading(false)
    }
  }

  // ===== Emergency Handlers =====
  const handleEmergencyCall = () => {
    Alert.alert(
      "Emergency Call",
      "Do you want to call emergency services?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Call 911", style: "destructive", onPress: () => Linking.openURL('tel:911') }
      ]
    )
  }

  const handleEmergencyContact = () => {
    Alert.alert(
      "Emergency Contact",
      "Call your emergency contact?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Call", style: "destructive", onPress: () => Linking.openURL('tel:+1234567890') }
      ]
    )
  }

  const handleAddMedicalInfo = () => {
    router.push('/medicalInfo')
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

  // ===== UI =====
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Manage your FitTrack preferences</Text>
      </View>

      {/* Emergency Section */}
      <View style={[styles.section, styles.emergencySection]}>
        <Text style={[styles.sectionTitle, styles.emergencyTitle]}>🚨 Medical Emergency</Text>
        <TouchableOpacity style={[styles.settingItem, styles.emergencyItem]} onPress={handleEmergencyCall}>
          <Text style={[styles.settingText, styles.emergencyText]}>Emergency Call</Text>
          <Text style={[styles.arrow, styles.emergencyArrow]}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.settingItem, styles.emergencyItem]} onPress={handleEmergencyContact}>
          <Text style={[styles.settingText, styles.emergencyText]}>Emergency Contact</Text>
          <Text style={[styles.arrow, styles.emergencyArrow]}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.settingItem, styles.emergencyItem]} onPress={handleAddMedicalInfo}>
          <Text style={[styles.settingText, styles.emergencyText]}>Medical Information</Text>
          <Text style={[styles.arrow, styles.emergencyArrow]}>›</Text>
        </TouchableOpacity>
        <View style={[styles.settingItem, styles.emergencyItem]}>
          <Text style={[styles.settingText, styles.emergencyText]}>Medical Alert</Text>
          <Switch
            value={medicalAlertEnabled}
            onValueChange={setMedicalAlertEnabled}
            trackColor={{ false: '#ffcccc', true: '#e74c3c' }}
            thumbColor={medicalAlertEnabled ? '#fff' : '#f4f3f4'}
          />
        </View>
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/profile')}>
          <Text style={styles.settingText}>Edit Profile</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem} onPress={() => Alert.alert("Coming Soon", "Change password feature coming soon")}>
          <Text style={styles.settingText}>Change Password</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Preferences Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingText}>Notifications</Text>
          <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} trackColor={{ false:'#d9c9b8', true:'#4a2c1a'}} thumbColor={notificationsEnabled? '#fff':'#f4f3f4'} />
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingText}>Dark Mode</Text>
          <Switch value={darkModeEnabled} onValueChange={setDarkModeEnabled} trackColor={{ false:'#d9c9b8', true:'#4a2c1a'}} thumbColor={darkModeEnabled? '#fff':'#f4f3f4'} />
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingText}>Auto Sync</Text>
          <Switch value={autoSyncEnabled} onValueChange={setAutoSyncEnabled} trackColor={{ false:'#d9c9b8', true:'#4a2c1a'}} thumbColor={autoSyncEnabled? '#fff':'#f4f3f4'} />
        </View>
      </View>

      {/* Support Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support & About</Text>
        <TouchableOpacity style={styles.settingItem} onPress={() => Alert.alert("Help & Support","Contact: support@fittrack.com")}>
          <Text style={styles.settingText}>Help & Support</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem} onPress={() => Alert.alert("Privacy Policy","View our privacy policy")}>
          <Text style={styles.settingText}>Privacy Policy</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
        <View style={styles.settingItem}>
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

      {/* Re-auth Modal */}
      <Modal visible={showReAuth} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Re-authentication Required</Text>
            <Text style={styles.modalSubtitle}>Enter your email and password to delete account.</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity style={styles.modalButton} onPress={handleReAuthAndDelete}>
              {loading ? <ActivityIndicator color="#fff"/> : <Text style={styles.modalButtonText}>Confirm</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, {backgroundColor:'#ccc', marginTop:10}]} onPress={() => setShowReAuth(false)}>
              <Text style={[styles.modalButtonText, {color:'#4a3b31'}]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  )
}

// ===== Styles =====
const styles = StyleSheet.create({
  container:{flex:1, backgroundColor:'#f5efe6', padding:16, paddingTop:20},
  header:{paddingVertical:20, alignItems:'center', marginBottom:10},
  title:{fontSize:32, fontWeight:'800', color:'#4a3b31', marginBottom:8},
  subtitle:{fontSize:16, color:'#7a6659', textAlign:'center'},
  section:{backgroundColor:'#fff', borderRadius:16, padding:16, marginBottom:20, elevation:2, shadowColor:'#000', shadowOffset:{width:0,height:1}, shadowOpacity:0.1, shadowRadius:2},
  sectionTitle:{fontSize:18,fontWeight:'700',color:'#4a3b31',marginBottom:16, paddingBottom:8, borderBottomWidth:1,borderBottomColor:'#efe6d8'},
  emergencySection:{borderLeftWidth:4,borderLeftColor:'#e74c3c'},
  emergencyTitle:{color:'#e74c3c'},
  emergencyItem:{borderBottomColor:'#ffe6e6'},
  emergencyText:{color:'#c0392b'},
  emergencyArrow:{color:'#e74c3c'},
  settingItem:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingVertical:14,borderBottomWidth:1,borderBottomColor:'#f5f5f5'},
  settingText:{fontSize:16,color:'#4a3b31',fontWeight:'500'},
  arrow:{fontSize:24,color:'#d9c9b8',marginLeft:10},
  versionText:{fontSize:14,color:'#7a6659',fontWeight:'500'},
  actionSection:{marginTop:10, marginBottom:30},
  actionButton:{paddingVertical:16,borderRadius:12,alignItems:'center', marginBottom:12},
  logoutButton:{backgroundColor:'#efe6d8', borderWidth:1, borderColor:'#d9c9b8'},
  logoutButtonText:{color:'#4a3b31', fontSize:16, fontWeight:'600'},
  deleteButton:{backgroundColor:'#f5efe6', borderWidth:1, borderColor:'#e74c3c'},
  deleteButtonText:{color:'#e74c3c', fontSize:16, fontWeight:'600'},
  modalOverlay:{flex:1,backgroundColor:'rgba(0,0,0,0.4)',justifyContent:'center',alignItems:'center'},
  modalContent:{width:'85%',backgroundColor:'#fff',borderRadius:20,padding:20},
  modalTitle:{fontSize:20,fontWeight:'700',marginBottom:10,color:'#4a3b31'},
  modalSubtitle:{fontSize:14,color:'#7a6659',marginBottom:12},
  modalInput:{backgroundColor:'#f1f1f1',padding:12,borderRadius:12,fontSize:16,marginBottom:10},
  modalButton:{backgroundColor:'#C4935D',padding:14,borderRadius:14,alignItems:'center'},
  modalButtonText:{color:'#fff',fontWeight:'600',fontSize:16}
})
