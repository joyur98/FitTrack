// Import UI components from React Native
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";

// Import navigation tool from Expo Router
import { router } from "expo-router";

// Import Firebase auth
import { auth } from "./firebaseConfig";
import { signOut } from "firebase/auth";

// Define and export the main ProfileScreen component
export default function ProfileScreen() {
  // State to store user data
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Array of avatar options
  const avatars = ['👨', '👩', '🧑', '👨‍💼', '👩‍💼', '👨‍🎓', '👩‍🎓', '🧔', '👨‍🦰', '👩‍🦰', '👨‍🦱', '👩‍🦱', '👨‍🦳', '👩‍🦳', '🧑‍🦰', '🧑‍🦱'];
  
  // Get a consistent avatar based on email
  const getAvatarForUser = (email) => {
    if (!email) return '👤';
    // Use email to generate a consistent index
    const hash = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return avatars[hash % avatars.length];
  };

  // Load user data when component mounts
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser({
        name: currentUser.displayName || currentUser.email.split('@')[0],
        email: currentUser.email,
      });
    }
    setLoading(false);
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Show loading spinner while fetching user data
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6f4e37" />
        </View>
      </SafeAreaView>
    );
  }
  // Sample workout history data
  const workoutHistory = [
    { id: 1, name: "Full Body Workout", date: "Dec 28, 2025", duration: "45 min", calories: 350 },
    { id: 2, name: "Upper Body Strength", date: "Dec 26, 2025", duration: "40 min", calories: 300 },
    { id: 3, name: "Cardio Blast", date: "Dec 24, 2025", duration: "30 min", calories: 280 },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* Profile Header Section */}
        <View style={styles.profileHeader}>
          {/* Profile Avatar - Dynamic based on user email */}
          <View style={styles.profilePicture}>
            <Text style={styles.avatar}>
              {user ? getAvatarForUser(user.email) : '👤'}
            </Text>
          </View>
          
          {/* User Name - Display logged-in user's info */}
          <Text style={styles.userName}>{user?.name || "User"}</Text>
          <Text style={styles.userEmail}>{user?.email || "No email"}</Text>
          
          {/* Edit Profile Button */}
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>✏️ Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>This Month</Text>
          
          <View style={styles.statsGrid}>
            {/* Total Workouts Stat */}
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Workouts</Text>
            </View>
            
            {/* Total Time Stat */}
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>8.5h</Text>
              <Text style={styles.statLabel}>Total Time</Text>
            </View>
            
            {/* Calories Burned Stat */}
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>3,840</Text>
              <Text style={styles.statLabel}>Calories</Text>
            </View>
            
            {/* Streak Stat */}
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>5🔥</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
          </View>
        </View>

        {/* Weekly Progress Section */}
        <View style={styles.progressSection}>
          <Text style={styles.sectionTitle}>Weekly Progress</Text>
          
          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>
          
          <Text style={styles.progressText}>4 of 5 workouts completed this week</Text>
        </View>

        {/* Recent Workouts Section */}
        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <Text style={styles.sectionTitle}>Recent Workouts</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {/* Map through workout history */}
          {workoutHistory.map((workout) => (
            <View key={workout.id} style={styles.historyCard}>
              <View style={styles.historyLeft}>
                <Text style={styles.historyName}>{workout.name}</Text>
                <Text style={styles.historyDate}>{workout.date}</Text>
              </View>
              
              <View style={styles.historyRight}>
                <Text style={styles.historyDuration}>⏱ {workout.duration}</Text>
                <Text style={styles.historyCalories}>🔥 {workout.calories} kcal</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Achievements Section */}
        <View style={styles.achievementsSection}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          
          <View style={styles.achievementsGrid}>
            <View style={styles.achievementBadge}>
              <Text style={styles.achievementIcon}>🏆</Text>
              <Text style={styles.achievementText}>First Workout</Text>
            </View>
            
            <View style={styles.achievementBadge}>
              <Text style={styles.achievementIcon}>⭐</Text>
              <Text style={styles.achievementText}>7 Day Streak</Text>
            </View>
            
            <View style={styles.achievementBadge}>
              <Text style={styles.achievementIcon}>💪</Text>
              <Text style={styles.achievementText}>10 Workouts</Text>
            </View>
            
            <View style={[styles.achievementBadge, styles.achievementLocked]}>
              <Text style={styles.achievementIcon}>🔒</Text>
              <Text style={styles.achievementText}>30 Day Streak</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons Section */}
        <View style={styles.actionsSection}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push("/statistics")}
          >
            <Text style={styles.actionButtonText}>📊 Full Statistics</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push("/goals")}
          >
            <Text style={styles.actionButtonText}>🎯 Goals</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>🚪 Logout</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// Create and define all styles with coffee color theme
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f4ebe0", // Light coffee cream
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
  
  // Profile Header Styles
  profileHeader: {
    alignItems: "center",
    marginBottom: 30,
  },
  
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#6f4e37", // Coffee brown
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    elevation: 4,
  },
  
  avatar: {
    fontSize: 50,
  },
  
  userName: {
    fontSize: 28,
    fontWeight: "700",
    color: "#3e2723", // Dark coffee
    marginBottom: 4,
  },
  
  userEmail: {
    fontSize: 15,
    color: "#795548", // Medium coffee
    marginBottom: 16,
  },
  
  editButton: {
    backgroundColor: "#d7ccc8", // Light coffee tan
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 2,
  },
  
  editButtonText: {
    color: "#3e2723", // Dark coffee
    fontSize: 15,
    fontWeight: "600",
  },
  
  // Stats Section Styles
  statsContainer: {
    marginBottom: 30,
  },
  
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#3e2723", // Dark coffee
    marginBottom: 16,
  },
  
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  
  statCard: {
    backgroundColor: "#d7ccc8", // Light coffee tan
    borderRadius: 16,
    padding: 20,
    width: "48%",
    marginBottom: 12,
    alignItems: "center",
    elevation: 3,
  },
  
  statNumber: {
    fontSize: 32,
    fontWeight: "800",
    color: "#3e2723", // Dark coffee
    marginBottom: 4,
  },
  
  statLabel: {
    fontSize: 14,
    color: "#795548", // Medium coffee
    fontWeight: "600",
  },
  
  // Progress Section Styles
  progressSection: {
    backgroundColor: "#d7ccc8", // Light coffee tan
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    elevation: 3,
  },
  
  progressBar: {
    height: 12,
    backgroundColor: "#bcaaa4", // Medium coffee tan
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 12,
  },
  
  progressFill: {
    height: "100%",
    width: "80%",
    backgroundColor: "#6f4e37", // Coffee brown
    borderRadius: 6,
  },
  
  progressText: {
    fontSize: 14,
    color: "#795548", // Medium coffee
    textAlign: "center",
  },
  
  // History Section Styles
  historySection: {
    marginBottom: 30,
  },
  
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  
  seeAllText: {
    color: "#6f4e37", // Coffee brown
    fontSize: 15,
    fontWeight: "600",
  },
  
  historyCard: {
    backgroundColor: "#d7ccc8", // Light coffee tan
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    elevation: 2,
  },
  
  historyLeft: {
    flex: 1,
  },
  
  historyName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#3e2723", // Dark coffee
    marginBottom: 4,
  },
  
  historyDate: {
    fontSize: 13,
    color: "#795548", // Medium coffee
  },
  
  historyRight: {
    alignItems: "flex-end",
  },
  
  historyDuration: {
    fontSize: 13,
    color: "#795548", // Medium coffee
    marginBottom: 2,
  },
  
  historyCalories: {
    fontSize: 13,
    color: "#795548", // Medium coffee
  },
  
  // Achievements Section Styles
  achievementsSection: {
    marginBottom: 30,
  },
  
  achievementsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  
  achievementBadge: {
    backgroundColor: "#d7ccc8", // Light coffee tan
    borderRadius: 16,
    padding: 16,
    width: "48%",
    alignItems: "center",
    marginBottom: 12,
    elevation: 3,
  },
  
  achievementLocked: {
    opacity: 0.5,
  },
  
  achievementIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  
  achievementText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#3e2723", // Dark coffee
    textAlign: "center",
  },
  
  // Actions Section Styles
  actionsSection: {
    marginBottom: 20,
  },
  
  actionButton: {
    backgroundColor: "#6f4e37", // Coffee brown
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    elevation: 3,
  },
  
  actionButtonText: {
    fontSize: 16,
    color: "#ffffff",
    fontWeight: "600",
    textAlign: "center",
  },
  
  logoutButton: {
    backgroundColor: "#bcaaa4", // Medium coffee tan
  },
  
  logoutText: {
    fontSize: 16,
    color: "#5d4037", // Darker coffee brown
    fontWeight: "600",
    textAlign: "center",
  },
});