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
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { auth } from "./firebaseConfig";
import { signOut, updateProfile } from "firebase/auth";
import { db } from "./firebaseConfig";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";

const { width } = Dimensions.get("window");

export default function ProfileScreen() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [newName, setNewName] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [userData, setUserData] = useState({
    weight: "55 kg",
    height: "175 cm",
    age: "17",
    heartRate: "70 bpm",
    calories: "2800 kcal",
    workouts: "50 hrs",
    productivity: "48 hrs",
  });

  // Function to upload image to Cloudinary
  const uploadToCloudinary = async (imageUri) => {
    try {
      const data = new FormData();
      data.append("file", {
        uri: imageUri,
        type: "image/jpeg",
        name: "profile.jpg",
      });
      data.append("upload_preset", "Images");
      data.append("cloud_name", "dvwemoge3");

      const res = await fetch(
        "https://api.cloudinary.com/v1_1/dvwemoge3/image/upload",
        {
          method: "POST",
          body: data,
        }
      );

      if (!res.ok) throw new Error("Upload failed");
      
      const json = await res.json();
      return json.secure_url;
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      throw error;
    }
  };

  const pickProfileImage = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to upload profile images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) return;

      setLoading(true);
      const imageUri = result.assets[0].uri;

      // Upload to Cloudinary
      const imageUrl = await uploadToCloudinary(imageUri);

      // Save URL to Firestore
      const currentUser = auth.currentUser;
      if (currentUser) {
        await updateDoc(doc(db, "users", currentUser.uid), {
          profileImage: imageUrl,
        });
        
        // Update auth profile
        await updateProfile(currentUser, {
          photoURL: imageUrl
        });
        
        setProfileImage(imageUrl);
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
        
        // Get display name in priority: Firestore fullName > auth displayName > default
        const displayName = data.fullName || currentUser.displayName || "User";
        
        setUser({ 
          name: displayName, 
          email: currentUser.email 
        });
        
        setNewName(displayName);
        setProfileImage(data.profileImage || currentUser.photoURL);
        
        // Update user data with actual values from Firestore
        setUserData({
          weight: data.weight ? `${data.weight} kg` : "55 kg",
          height: data.height ? `${data.height} cm` : "175 cm",
          age: data.age ? data.age.toString() : "17",
          heartRate: "70 bpm", // Default or calculate
          calories: data.requiredCalories ? `${data.requiredCalories} kcal` : "2800 kcal",
          workouts: data.totalWorkouts ? `${data.totalWorkouts} workouts` : "0 workouts",
          productivity: "48 hrs", // Default
        });
      } else {
        // Create user document if it doesn't exist
        await setDoc(userDocRef, {
          uid: currentUser.uid,
          email: currentUser.email,
          fullName: currentUser.displayName || "",
          profileImage: currentUser.photoURL || null,
          createdAt: new Date(),
          totalWorkouts: 0,
        });
        
        setUser({ 
          name: currentUser.displayName || "User", 
          email: currentUser.email 
        });
        setNewName(currentUser.displayName || "User");
        setProfileImage(currentUser.photoURL);
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
        updatedAt: new Date(),
      });
      
      // Update local state
      setUser({ ...user, name: name });
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      console.error("Error saving user name:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    }
  };

  useEffect(() => {
    fetchUserData();
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

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6f4e37" />
          <Text style={{ marginTop: 10, color: "#6f4e37" }}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.statusIndicator} />
          
          <TouchableOpacity onPress={pickProfileImage}>
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.profilePicture}>
                <Text style={styles.avatar}>👤</Text>
              </View>
            )}
            <View style={styles.cameraIconOverlay}>
              <Text style={styles.cameraIcon}>📷</Text>
            </View>
          </TouchableOpacity>
          
          <Text style={styles.userName}>{user?.name || "User"}</Text>
          <Text style={styles.userEmail}>{user?.email || "user@example.com"}</Text>
          
          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <Text style={styles.editButtonText}>✏️ Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Text style={styles.statIcon}>⚖️</Text>
            </View>
            <Text style={styles.statValue}>{userData.weight}</Text>
            <Text style={styles.statLabel}>Weight</Text>
          </View>
          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Text style={styles.statIcon}>📏</Text>
            </View>
            <Text style={styles.statValue}>{userData.height}</Text>
            <Text style={styles.statLabel}>Height</Text>
          </View>
          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Text style={styles.statIcon}>🎂</Text>
            </View>
            <Text style={styles.statValue}>{userData.age}</Text>
            <Text style={styles.statLabel}>Age</Text>
          </View>
        </View>

        {/* Vital Stats Row */}
        <View style={styles.vitalsRow}>
          <View style={styles.vitalItem}>
            <Text style={styles.vitalIcon}>❤️</Text>
            <Text style={styles.vitalValue}>{userData.heartRate}</Text>
          </View>
          <View style={styles.vitalItem}>
            <Text style={styles.vitalIcon}>🔥</Text>
            <Text style={styles.vitalValue}>{userData.calories}</Text>
          </View>
        </View>

        {/* Daily Stats */}
        <View style={styles.dailyStats}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>💪</Text>
            <Text style={styles.statBigNumber}>{userData.workouts}</Text>
            <Text style={styles.statLabelSmall}>Workouts</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📈</Text>
            <Text style={styles.statBigNumber}>{userData.productivity}</Text>
            <Text style={styles.statLabelSmall}>Productivity</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push("/statistics")}>
            <Text style={styles.actionButtonText}>📊 Full Statistics</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push("/goals")}>
            <Text style={styles.actionButtonText}>🎯 Goals</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.logoutButton]} onPress={handleLogout}>
            <Text style={styles.logoutText}>🚪 Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal animationType="slide" transparent={true} visible={editModalVisible} onRequestClose={() => setEditModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your name"
              value={newName}
              onChangeText={setNewName}
              autoFocus={true}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setEditModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleSaveName}>
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
    backgroundColor: "#f4ebe0",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    padding: 24,
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 32,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 24,
    padding: 24,
    elevation: 4,
  },
  statusIndicator: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#d7ccc8",
    position: "absolute",
    top: 20,
    right: 24,
    zIndex: 1,
    borderWidth: 3,
    borderColor: "#f4ebe0",
  },
  profilePicture: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#6f4e37",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    elevation: 12,
    shadowColor: "#3e2723",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    borderWidth: 4,
    borderColor: "rgba(215,204,200,0.3)",
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 16,
    borderWidth: 4,
    borderColor: "rgba(215,204,200,0.3)",
  },
  cameraIconOverlay: {
    position: "absolute",
    bottom: 20,
    right: 0,
    backgroundColor: "#6f4e37",
    borderRadius: 12,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  cameraIcon: {
    fontSize: 14,
    color: "#fff",
  },
  avatar: {
    fontSize: 55,
  },
  userName: {
    fontSize: 30,
    fontWeight: "800",
    color: "#3e2723",
    marginBottom: 8,
    textAlign: "center",
  },
  userEmail: {
    fontSize: 16,
    color: "#795548",
    fontWeight: "500",
    marginBottom: 20,
    opacity: 0.9,
  },
  editButton: {
    backgroundColor: "rgba(215,204,200,0.8)",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 25,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(111,78,55,0.2)",
  },
  editButtonText: {
    color: "#3e2723",
    fontSize: 16,
    fontWeight: "700",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 6,
  },
  statIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(215,204,200,0.7)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    elevation: 6,
    shadowColor: "#3e2723",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  statIcon: {
    fontSize: 26,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "900",
    color: "#6f4e37",
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 13,
    color: "#8d6e63",
    fontWeight: "700",
  },
  vitalsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 28,
    padding: 24,
    backgroundColor: "rgba(215,204,200,0.6)",
    borderRadius: 24,
    elevation: 6,
    borderWidth: 1,
    borderColor: "rgba(111,78,55,0.2)",
  },
  vitalItem: {
    alignItems: "center",
  },
  vitalIcon: {
    fontSize: 32,
    marginBottom: 6,
  },
  vitalValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#3e2723",
  },
  dailyStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(215,204,200,0.5)",
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    marginHorizontal: 10,
    elevation: 8,
    shadowColor: "#3e2723",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(111,78,55,0.3)",
  },
  statBigNumber: {
    fontSize: 36,
    fontWeight: "900",
    color: "#6f4e37",
    marginTop: 8,
    marginBottom: 6,
    textShadowColor: "rgba(62,39,35,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  statLabelSmall: {
    fontSize: 15,
    color: "#8d6e63",
    fontWeight: "700",
  },
  actionsSection: {
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: "#6f4e37",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    elevation: 6,
    shadowColor: "#3e2723",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  actionButtonText: {
    fontSize: 18,
    color: "#f5f5f5",
    fontWeight: "700",
    textAlign: "center",
  },
  logoutButton: {
    backgroundColor: "#bcaaa4",
  },
  logoutText: {
    fontSize: 18,
    color: "#5d4037",
    fontWeight: "700",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "rgba(244,235,224,0.95)",
    borderRadius: 24,
    padding: 32,
    width: "88%",
    elevation: 12,
    shadowColor: "#3e2723",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(111,78,55,0.3)",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#3e2723",
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 18,
    fontSize: 18,
    borderWidth: 2,
    borderColor: "rgba(215,204,200,0.5)",
    marginBottom: 24,
    elevation: 2,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 8,
    elevation: 2,
  },
  cancelButton: {
    backgroundColor: "rgba(188,170,164,0.8)",
  },
  cancelButtonText: {
    color: "#5d4037",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  saveButton: {
    backgroundColor: "#6f4e37",
  },
  saveButtonText: {
    color: "#f5f5f5",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
});