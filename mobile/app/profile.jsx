import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
  Dimensions,
  Image,
} from "react-native";
import { router } from "expo-router";
import { auth } from "./firebaseConfig";
import { signOut, updateProfile } from "firebase/auth";
import { db } from "./firebaseConfig";
import { doc, getDoc, updateDoc, setDoc, onSnapshot } from "firebase/firestore";
import { pickAndUploadProfileImage } from "./profileService";

const { width } = Dimensions.get("window");

export default function ProfileScreen() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [newName, setNewName] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userData, setUserData] = useState({
    weight: "55 kg",
    height: "175 cm",
    age: "17",
    heartRate: "70 bpm",
    calories: "2800 kcal",
    workouts: "0 workouts",
    productivity: "48 hrs",
  });

  // Use the shared function to pick and upload profile image
  const pickProfileImage = async () => {
    try {
      setLoading(true);
      const imageUrl = await pickAndUploadProfileImage(auth, db);
      
      if (imageUrl) {
        setProfileImage(imageUrl);
        // Update Firestore with new profile image
        const currentUser = auth.currentUser;
        if (currentUser) {
          const userDocRef = doc(db, "users", currentUser.uid);
          await updateDoc(userDocRef, { profileImage: imageUrl });
        }
        Alert.alert("Success", "Profile picture updated!");
      }
    } catch (error) {
      Alert.alert("Upload failed", "Could not upload profile image");
      console.error("Image picker error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      router.replace("/login");
      return;
    }

    try {
      const userDocRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        
        console.log("Profile - Dark Mode Value:", data.darkMode); // DEBUG
        
        // Get display name in priority: Firestore fullName > auth displayName > default
        const displayName = data.fullName || currentUser.displayName || "User";
        
        setUser({ 
          name: displayName, 
          email: currentUser.email 
        });
        
        setNewName(displayName);
        
        // Get profile image in priority: Firestore profileImage > auth photoURL > default
        const profileImg = data.profileImage || currentUser.photoURL || null;
        setProfileImage(profileImg);
        
        // Set dark mode from Firestore - EXPLICITLY check
        const darkModeValue = data.darkMode === true;
        console.log("Setting dark mode to:", darkModeValue); // DEBUG
        setIsDarkMode(darkModeValue);
        
        // Update user data with actual values from Firestore
        setUserData({
          weight: data.weight ? `${data.weight} kg` : "55 kg",
          height: data.height ? `${data.height} cm` : "175 cm",
          age: data.age ? data.age.toString() : "17",
          heartRate: "70 bpm",
          calories: data.requiredCalories ? `${data.requiredCalories} kcal` : "2800 kcal",
          workouts: data.totalWorkouts ? `${data.totalWorkouts} workouts` : "0 workouts",
          productivity: "48 hrs",
        });
      } else {
        // Create user document if it doesn't exist
        const initialData = {
          uid: currentUser.uid,
          email: currentUser.email,
          fullName: currentUser.displayName || "",
          profileImage: currentUser.photoURL || null,
          createdAt: new Date().toISOString(),
          totalWorkouts: 0,
          darkMode: false,
        };
        
        await setDoc(userDocRef, initialData);
        
        setUser({ 
          name: currentUser.displayName || "User", 
          email: currentUser.email 
        });
        setNewName(currentUser.displayName || "User");
        setProfileImage(currentUser.photoURL || null);
        setIsDarkMode(false);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      Alert.alert("Error", "Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const saveUserName = async (name) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    
    try {
      // Update auth profile
      await updateProfile(currentUser, { displayName: name });
      
      // Update Firestore
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, {
        fullName: name,
        updatedAt: new Date().toISOString(),
      });
      
      // Update local state CORRECTLY
      setUser(prev => ({ ...prev, name: name }));
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      console.error("Error saving user name:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    }
  };

  useEffect(() => {
    fetchUserData();
    
    // Real-time listener for dark mode changes
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    
    const userDocRef = doc(db, "users", currentUser.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const darkModeValue = data.darkMode === true;
        console.log("Real-time update - Dark Mode:", darkModeValue); // DEBUG
        setIsDarkMode(darkModeValue);
      }
    });
    
    return () => unsubscribe();
  }, []);

  const handleEditProfile = () => {
    setNewName(user?.name || "User");
    setEditModalVisible(true);
  };

  const handleSaveName = async () => {
    if (newName.trim()) {
      setEditModalVisible(false);
      await saveUserName(newName.trim());
    } else {
      Alert.alert("Error", "Please enter a valid name");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/login");
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("Error", "Failed to logout");
    }
  };

  // Theme-based styles (matching dashboard)
  const theme = {
    backgroundColor: isDarkMode ? "#121212" : "#f8f4f0",
    cardBackground: isDarkMode ? "#1e1e1e" : "#fff",
    textColor: isDarkMode ? "#ffffff" : "#2c1810",
    secondaryText: isDarkMode ? "#a0a0a0" : "#6f4e37",
    borderColor: isDarkMode ? "#333" : "#eee",
    primaryColor: "#C4935D",
    secondaryColor: isDarkMode ? "#2d2d2d" : "#6f4e37",
    inputBackground: isDarkMode ? "#2d2d2d" : "#f8f5f0",
    profileBg: isDarkMode ? "#2a2a2a" : "#e0e0e0",
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.backgroundColor }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primaryColor} />
          <Text style={[styles.loadingText, { color: theme.primaryColor }]}>
            Loading profile...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.backgroundColor }]}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.statusIndicator} />
          
          <TouchableOpacity onPress={pickProfileImage} style={styles.profileContainer}>
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={[styles.profileImage, { borderColor: theme.secondaryColor }]}
              />
            ) : (
              <View style={[styles.profilePicture, { 
                backgroundColor: theme.profileBg,
                borderColor: theme.secondaryColor 
              }]}>
                <Text style={styles.avatar}>👤</Text>
              </View>
            )}
            <View style={[styles.cameraIconOverlay, { 
              backgroundColor: theme.secondaryColor,
              borderColor: theme.backgroundColor 
            }]}>
              <Text style={styles.cameraIcon}>📷</Text>
            </View>
          </TouchableOpacity>
          
          <Text style={[styles.userName, { color: theme.textColor }]}>
            {user?.name || "User"}
          </Text>
          <Text style={[styles.userEmail, { color: theme.secondaryText }]}>
            {user?.email || "user@example.com"}
          </Text>
          
          <TouchableOpacity 
            style={[styles.editButton, { backgroundColor: theme.secondaryColor }]} 
            onPress={handleEditProfile}
          >
            <Text style={styles.editButtonText}>✏️ Edit Name</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Stats */}
        <View style={styles.statsContainer}>
          {Object.entries(userData).map(([key, value]) => (
            <View 
              key={key} 
              style={[styles.statCard, { 
                backgroundColor: theme.cardBackground,
                borderColor: isDarkMode ? theme.borderColor : 'transparent',
                borderWidth: isDarkMode ? 1 : 0,
              }]}
            >
              <Text style={[styles.statValue, { color: theme.primaryColor }]}>
                {value}
              </Text>
              <Text style={[styles.statLabel, { color: theme.secondaryText }]}>
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </Text>
            </View>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>🚪 Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { 
            backgroundColor: theme.cardBackground,
            borderColor: isDarkMode ? theme.borderColor : 'transparent',
            borderWidth: isDarkMode ? 1 : 0,
          }]}>
            <Text style={[styles.modalTitle, { color: theme.textColor }]}>
              Edit Name
            </Text>
            <TextInput
              style={[styles.modalInput, { 
                backgroundColor: theme.inputBackground,
                borderColor: theme.borderColor,
                color: theme.textColor 
              }]}
              value={newName}
              onChangeText={setNewName}
              placeholder="Enter your name"
              placeholderTextColor={theme.secondaryText}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.cancelButton, { 
                  backgroundColor: theme.inputBackground,
                  borderColor: theme.borderColor 
                }]} 
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={[styles.cancelButtonText, { color: theme.secondaryText }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.saveButton, { backgroundColor: theme.secondaryColor }]} 
                onPress={handleSaveName}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 1,
  },
  profileContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
  },
  avatar: {
    fontSize: 50,
  },
  cameraIconOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
  },
  cameraIcon: {
    fontSize: 18,
    color: 'white',
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  userEmail: {
    fontSize: 16,
    marginBottom: 24,
  },
  editButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  statCard: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    width: width * 0.45 - 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    padding: 24,
    borderRadius: 20,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginLeft: 12,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});