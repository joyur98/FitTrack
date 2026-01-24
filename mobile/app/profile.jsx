import React, { useState, useEffect, useRef } from "react";
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
  Image,
  Animated,
  Easing,
  Dimensions
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { auth } from "./firebaseConfig";
import { signOut, updateProfile } from "firebase/auth";
import { db } from "./firebaseConfig";
import { doc, getDoc, updateDoc, setDoc, onSnapshot } from "firebase/firestore";

const { width, height } = Dimensions.get("window");

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [newName, setNewName] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // User stats
  const [userStats, setUserStats] = useState({
    streak: 0,
    totalWorkouts: 0,
    weeklyWorkouts: 0,
    productivity: 0,
    height: 0,
    weight: 0,
    age: 0,
    fitnessFocus: "",
    goal: ""
  });

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const profileScaleAnim = useRef(new Animated.Value(0.9)).current;
  const statsAnim = useRef(new Animated.Value(0)).current;
  const cardAnimations = useRef([]);
  const [animated, setAnimated] = useState(false);

  // Theme colors
  const theme = {
    backgroundColor: isDarkMode ? "#0F0F0F" : "#F8F5F2",
    cardBackground: isDarkMode ? "#1A1A1A" : "#FFFFFF",
    textColor: isDarkMode ? "#FFFFFF" : "#2D3436",
    secondaryText: isDarkMode ? "#A0A0A0" : "#636E72",
    borderColor: isDarkMode ? "#333333" : "#E0E0E0",
    primaryColor: "#FF6B6B",
    secondaryColor: "#4ECDC4",
    accentColor: "#FFD93D",
    gradientStart: isDarkMode ? "#2C3E50" : "#3498DB",
    gradientEnd: isDarkMode ? "#4A235A" : "#8E44AD",
    shadowColor: isDarkMode ? "#000000" : "#2D3436",
    inputBackground: isDarkMode ? "#2D2D2D" : "#F5F5F5",
  };

  // Initialize animations
  useEffect(() => {
    // Entry animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.2)),
      }),
    ]).start(() => {
      // Profile image animation
      Animated.spring(profileScaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();

      // Stats animation
      Animated.timing(statsAnim, {
        toValue: 1,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }).start(() => {
        setAnimated(true);
      });
    });

    // Initialize card animations
    cardAnimations.current = Array(4).fill().map(() => new Animated.Value(0));
    cardAnimations.current.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        delay: 300 + (index * 100),
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }).start();
    });
  }, []);

  // Cloudinary upload
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

  // Pick profile image
  const pickProfileImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Sorry, we need camera roll permissions to upload profile images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      });

      if (result.canceled) return;

      setIsEditing(true);
      const imageUri = result.assets[0].uri;

      // Upload and update
      const imageUrl = await uploadToCloudinary(imageUri);
      const currentUser = auth.currentUser;
      
      if (currentUser) {
        await updateDoc(doc(db, "users", currentUser.uid), {
          profileImage: imageUrl,
        });
        
        await updateProfile(currentUser, {
          photoURL: imageUrl
        });
        
        setProfileImage(imageUrl);
        
        // Success animation
        Animated.sequence([
          Animated.timing(profileScaleAnim, {
            toValue: 0.9,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.spring(profileScaleAnim, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
        ]).start();
        
        Alert.alert("✅ Success", "Profile picture updated!");
      }
    } catch (error) {
      Alert.alert("Upload failed", "Could not upload profile image");
      console.error("Image picker error:", error);
    } finally {
      setIsEditing(false);
    }
  };

  // Save user name
  const saveUserName = async (name) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    
    setIsEditing(true);
    
    try {
      await updateProfile(currentUser, { displayName: name });
      
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, {
        fullName: name,
        updatedAt: new Date(),
      });
      
      setUser({ ...user, name: name });
      
      Animated.sequence([
        Animated.timing(profileScaleAnim, {
          toValue: 1.1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(profileScaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setEditModalVisible(false);
        Alert.alert("✅ Success", "Profile updated successfully!");
      });
      
    } catch (error) {
      console.error("Error saving user name:", error);
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setIsEditing(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive", 
          onPress: async () => {
            try {
              await signOut(auth);
              router.replace("/login");
            } catch (error) {
              console.error("Logout error:", error);
              Alert.alert("Error", "Failed to logout");
            }
          }
        }
      ]
    );
  };

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        router.replace("/login");
        return;
      }

      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        
        // First, try to get the document once
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const data = userDoc.data();
          updateUserState(data, currentUser);
        } else {
          // Create user document if it doesn't exist
          await createUserDocument(userDocRef, currentUser);
        }
        
        setLoading(false);
        
        // Then set up real-time listener
        const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            updateUserState(data, currentUser);
          }
        });

        return unsubscribe;
      } catch (error) {
        console.error("Error fetching user data:", error);
        Alert.alert("Error", "Failed to load profile data");
        setLoading(false);
      }
    };

    // Helper function to update user state
    const updateUserState = (data, currentUser) => {
      // Set dark mode
      setIsDarkMode(data.darkMode || false);
      
      // Set user info
      const displayName = data.fullName || currentUser.displayName || "User";
      setUser({ 
        name: displayName, 
        email: currentUser.email,
        uid: currentUser.uid
      });
      
      setNewName(displayName);
      setProfileImage(data.profileImage || currentUser.photoURL);
      
      // Set user stats
      setUserStats({
        streak: data.streak || 0,
        totalWorkouts: data.totalWorkouts || 0,
        weeklyWorkouts: data.weeklyWorkouts || 0,
        productivity: Math.floor(Math.random() * 100), // Placeholder
        height: data.height || 0,
        weight: data.weight || 0,
        age: data.age || 0,
        fitnessFocus: data.fitnessFocus || "Not set",
        goal: data.goal || "Not set"
      });
    };

    // Helper function to create user document
    const createUserDocument = async (userDocRef, currentUser) => {
      await setDoc(userDocRef, {
        uid: currentUser.uid,
        email: currentUser.email,
        fullName: currentUser.displayName || "",
        profileImage: currentUser.photoURL || null,
        createdAt: new Date(),
        darkMode: false,
        totalWorkouts: 0,
        streak: 0,
        weeklyWorkouts: 0,
      });
      
      updateUserState({
        fullName: currentUser.displayName || "",
        profileImage: currentUser.photoURL || null,
        darkMode: false,
        totalWorkouts: 0,
        streak: 0,
        weeklyWorkouts: 0,
      }, currentUser);
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.backgroundColor }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primaryColor} />
          <Text style={[styles.loadingText, { color: theme.textColor }]}>Loading your profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.backgroundColor }]}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {/* Header */}
        <Animated.View 
          style={[
            styles.header,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={[styles.backArrow, { color: theme.textColor }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.textColor }]}>Profile</Text>
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => router.push("/settings")}
            activeOpacity={0.7}
          >
            <Text style={[styles.settingsIcon, { color: theme.textColor }]}>⚙️</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Profile Section */}
        <Animated.View 
          style={[
            styles.profileSection,
            { 
              backgroundColor: theme.cardBackground,
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: profileScaleAnim }
              ]
            }
          ]}
        >
          <TouchableOpacity 
            onPress={pickProfileImage}
            style={styles.imageContainer}
            activeOpacity={0.8}
          >
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.profileImage}
              />
            ) : (
              <View style={[styles.profileImagePlaceholder, { 
                backgroundColor: isDarkMode ? theme.secondaryColor : theme.primaryColor 
              }]}>
                <Text style={styles.profileInitial}>
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </Text>
              </View>
            )}
            <View style={[styles.cameraIconContainer, { backgroundColor: theme.accentColor }]}>
              <Text style={styles.cameraIcon}>📷</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.profileInfo}>
            <Text style={[styles.userName, { color: theme.textColor }]}>
              {user?.name || "User"}
            </Text>
            <Text style={[styles.userEmail, { color: theme.secondaryText }]}>
              {user?.email || "user@example.com"}
            </Text>
            
            <View style={styles.statsRow}>
              <View style={[styles.statBadge, { backgroundColor: isDarkMode ? '#2D2D2D' : '#F0F0F0' }]}>
                <Text style={[styles.statIcon, { color: theme.primaryColor }]}>🔥</Text>
                <Text style={[styles.statBadgeText, { color: theme.textColor }]}>
                  {userStats.streak} day streak
                </Text>
              </View>
              <View style={[styles.statBadge, { backgroundColor: isDarkMode ? '#2D2D2D' : '#F0F0F0' }]}>
                <Text style={[styles.statIcon, { color: theme.secondaryColor }]}>💪</Text>
                <Text style={[styles.statBadgeText, { color: theme.textColor }]}>
                  {userStats.totalWorkouts} workouts
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Quick Stats */}
        <Animated.View 
          style={[
            styles.statsSection,
            { 
              opacity: statsAnim,
              transform: [{ translateY: Animated.multiply(statsAnim, new Animated.Value(-20)) }]
            }
          ]}
        >
          <View style={[styles.statsGradient, { 
            backgroundColor: theme.primaryColor,
            padding: 24
          }]}>
            <View style={styles.statsGrid}>
              {cardAnimations.current[0] && (
                <Animated.View 
                  style={[
                    styles.statCard,
                    {
                      opacity: cardAnimations.current[0],
                      transform: [{ scale: cardAnimations.current[0] }]
                    }
                  ]}
                >
                  <View style={[styles.statIconContainer, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                    <Text style={[styles.statIconLarge, { color: '#FFFFFF' }]}>📅</Text>
                  </View>
                  <Text style={styles.statNumber}>{userStats.weeklyWorkouts}</Text>
                  <Text style={styles.statLabel}>This Week</Text>
                </Animated.View>
              )}

              {cardAnimations.current[1] && (
                <Animated.View 
                  style={[
                    styles.statCard,
                    {
                      opacity: cardAnimations.current[1],
                      transform: [{ scale: cardAnimations.current[1] }]
                    }
                  ]}
                >
                  <View style={[styles.statIconContainer, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                    <Text style={[styles.statIconLarge, { color: '#FFFFFF' }]}>📈</Text>
                  </View>
                  <Text style={styles.statNumber}>{userStats.productivity}%</Text>
                  <Text style={styles.statLabel}>Productivity</Text>
                </Animated.View>
              )}
            </View>
          </View>
        </Animated.View>

        {/* User Details */}
        {cardAnimations.current[2] && (
          <Animated.View 
            style={[
              styles.detailsSection,
              { 
                backgroundColor: theme.cardBackground,
                opacity: cardAnimations.current[2],
                transform: [{ translateY: Animated.multiply(cardAnimations.current[2], new Animated.Value(20)) }]
              }
            ]}
          >
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionIcon, { color: theme.primaryColor }]}>👤</Text>
              <Text style={[styles.sectionTitle, { color: theme.textColor }]}>Personal Details</Text>
            </View>

            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <View style={[styles.detailIcon, { backgroundColor: theme.inputBackground }]}>
                  <Text style={[styles.detailIconText, { color: theme.primaryColor }]}>📏</Text>
                </View>
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: theme.secondaryText }]}>Height</Text>
                  <Text style={[styles.detailValue, { color: theme.textColor }]}>
                    {userStats.height > 0 ? `${userStats.height} cm` : "Not set"}
                  </Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <View style={[styles.detailIcon, { backgroundColor: theme.inputBackground }]}>
                  <Text style={[styles.detailIconText, { color: theme.secondaryColor }]}>⚖️</Text>
                </View>
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: theme.secondaryText }]}>Weight</Text>
                  <Text style={[styles.detailValue, { color: theme.textColor }]}>
                    {userStats.weight > 0 ? `${userStats.weight} kg` : "Not set"}
                  </Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <View style={[styles.detailIcon, { backgroundColor: theme.inputBackground }]}>
                  <Text style={[styles.detailIconText, { color: theme.accentColor }]}>🎂</Text>
                </View>
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: theme.secondaryText }]}>Age</Text>
                  <Text style={[styles.detailValue, { color: theme.textColor }]}>
                    {userStats.age > 0 ? userStats.age : "Not set"}
                  </Text>
                </View>
              </View>

              <View style={styles.detailItem}>
                <View style={[styles.detailIcon, { backgroundColor: theme.inputBackground }]}>
                  <Text style={[styles.detailIconText, { color: theme.primaryColor }]}>💪</Text>
                </View>
                <View style={styles.detailContent}>
                  <Text style={[styles.detailLabel, { color: theme.secondaryText }]}>Fitness Focus</Text>
                  <Text style={[styles.detailValue, { color: theme.textColor }]}>
                    {userStats.fitnessFocus}
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Action Buttons */}
        {cardAnimations.current[3] && (
          <Animated.View 
            style={[
              styles.actionsSection,
              { 
                opacity: cardAnimations.current[3],
                transform: [{ translateY: Animated.multiply(cardAnimations.current[3], new Animated.Value(20)) }]
              }
            ]}
          >
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}
              onPress={() => {
                setNewName(user?.name || "User");
                setEditModalVisible(true);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.actionButtonContent}>
                <Text style={[styles.actionIcon, { color: theme.primaryColor }]}>✏️</Text>
                <Text style={[styles.actionButtonText, { color: theme.textColor }]}>Edit Profile</Text>
              </View>
              <Text style={[styles.arrowIcon, { color: theme.secondaryText }]}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}
              onPress={() => router.push("/statistics")}
              activeOpacity={0.7}
            >
              <View style={styles.actionButtonContent}>
                <Text style={[styles.actionIcon, { color: theme.secondaryColor }]}>📊</Text>
                <Text style={[styles.actionButtonText, { color: theme.textColor }]}>View Statistics</Text>
              </View>
              <Text style={[styles.arrowIcon, { color: theme.secondaryText }]}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}
              onPress={() => router.push("/goals")}
              activeOpacity={0.7}
            >
              <View style={styles.actionButtonContent}>
                <Text style={[styles.actionIcon, { color: theme.accentColor }]}>🎯</Text>
                <Text style={[styles.actionButtonText, { color: theme.textColor }]}>My Goals</Text>
              </View>
              <Text style={[styles.arrowIcon, { color: theme.secondaryText }]}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.logoutButton, { backgroundColor: theme.inputBackground }]}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <View style={styles.actionButtonContent}>
                <Text style={[styles.actionIcon, { color: "#FF6B6B" }]}>🚪</Text>
                <Text style={[styles.logoutButtonText, { color: "#FF6B6B" }]}>Log Out</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>

      {/* Edit Name Modal */}
      <Modal
        visible={editModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.7)' }]}>
          <View 
            style={[
              styles.modalContent,
              { backgroundColor: theme.cardBackground }
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalHeaderIcon, { color: theme.primaryColor }]}>✏️</Text>
              <Text style={[styles.modalTitle, { color: theme.textColor }]}>Edit Profile</Text>
            </View>
            
            <TextInput
              style={[
                styles.modalInput,
                { 
                  backgroundColor: theme.inputBackground,
                  borderColor: theme.borderColor,
                  color: theme.textColor
                }
              ]}
              placeholder="Enter your name"
              placeholderTextColor={theme.secondaryText}
              value={newName}
              onChangeText={setNewName}
              autoFocus
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton, { backgroundColor: theme.inputBackground }]}
                onPress={() => setEditModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text style={[styles.cancelButtonText, { color: theme.textColor }]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton, { backgroundColor: theme.primaryColor }]}
                onPress={() => newName.trim() ? saveUserName(newName.trim()) : Alert.alert("Error", "Please enter a valid name")}
                activeOpacity={0.8}
                disabled={isEditing}
              >
                {isEditing ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
    fontWeight: "500",
  },
  container: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  backArrow: {
    fontSize: 28,
    fontWeight: "700",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
  },
  settingsButton: {
    padding: 8,
  },
  settingsIcon: {
    fontSize: 24,
  },
  profileSection: {
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  imageContainer: {
    position: "relative",
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  profileInitial: {
    fontSize: 48,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  cameraIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  cameraIcon: {
    fontSize: 16,
    color: "#FFFFFF",
  },
  profileInfo: {
    alignItems: "center",
  },
  userName: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
    textAlign: "center",
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 16,
    opacity: 0.8,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
  },
  statBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statIcon: {
    fontSize: 16,
  },
  statBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  statsSection: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 24,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  statsGradient: {
    borderRadius: 24,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 16,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statIconLarge: {
    fontSize: 24,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    fontWeight: "600",
  },
  detailsSection: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 24,
    padding: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  sectionIcon: {
    fontSize: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  detailsGrid: {
    gap: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  detailIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  detailIconText: {
    fontSize: 18,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  actionsSection: {
    marginHorizontal: 20,
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  actionButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  actionIcon: {
    fontSize: 20,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  arrowIcon: {
    fontSize: 20,
    fontWeight: "bold",
  },
  logoutButton: {
    borderWidth: 0,
    justifyContent: "center",
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 12,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    borderRadius: 24,
    padding: 24,
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  modalHeaderIcon: {
    fontSize: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
  },
  modalInput: {
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButton: {
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});