import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { auth, db } from "../firebaseConfig";
import { signOut } from "firebase/auth";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";

export default function AdminDashboard() {
  const router = useRouter();
  const database = getFirestore();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalWorkouts: 0,
    totalCalories: 0,
    averageCalories: 0,
  });

  // Auth verification
  useEffect(() => {
    if (!auth.currentUser) {
      router.replace("/admin/login");
    }
  }, []);

  // Fetch stats on focus
  useFocusEffect(
    useCallback(() => {
      fetchDashboardStats();
    }, [])
  );

  const fetchDashboardStats = async () => {
    try {
      setError(null);
      setLoading(true);

      // Get total users
      const usersSnap = await getDocs(collection(database, "users"));
      const totalUsers = usersSnap.size;

      // Get active users (logged in last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      let activeUsers = 0;
      usersSnap.forEach((doc) => {
        const lastLogin = doc.data().lastLogin?.toDate?.();
        if (lastLogin && lastLogin > sevenDaysAgo) {
          activeUsers++;
        }
      });

      // Get total workouts
      const workoutsSnap = await getDocs(collection(database, "calorie_burn"));
      const totalWorkouts = workoutsSnap.size;

      // Get total calories burned
      let totalCalories = 0;
      workoutsSnap.forEach((doc) => {
        totalCalories += doc.data().calorie || 0;
      });

      const averageCalories =
        totalWorkouts > 0 ? Math.round(totalCalories / totalWorkouts) : 0;

      setStats({
        totalUsers,
        activeUsers,
        totalWorkouts,
        totalCalories: Math.round(totalCalories),
        averageCalories,
      });

      setLoading(false);
    } catch (error) {
      console.error("Error fetching stats:", error);
      setError(
        error.message || "Failed to load dashboard stats. Please try again."
      );
      setLoading(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardStats().then(() => setRefreshing(false));
  }, []);

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        onPress: () => {},
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: async () => {
          try {
            await signOut(auth);
            router.replace("/admin/login");
          } catch (error) {
            Alert.alert("Error", "Failed to logout. Please try again.");
          }
        },
        style: "destructive",
      },
    ]);
  };

  const handleNavigate = (route) => {
    router.push(route);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#C4935D" />
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#C4935D"
          />
        }
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Admin Dashboard</Text>
            <Text style={styles.subtitle}>
              {stats.totalUsers} users • {stats.activeUsers} active
            </Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* ERROR STATE */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={fetchDashboardStats}
            >
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STATS GRID */}
        <Text style={styles.sectionTitle}>📊 Quick Stats</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>👥</Text>
            <Text style={styles.statNumber}>{stats.totalUsers}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>✅</Text>
            <Text style={styles.statNumber}>{stats.activeUsers}</Text>
            <Text style={styles.statLabel}>Active (7d)</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>💪</Text>
            <Text style={styles.statNumber}>{stats.totalWorkouts}</Text>
            <Text style={styles.statLabel}>Total Workouts</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={styles.statNumber}>
              {stats.totalCalories.toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Calories Burned</Text>
          </View>
        </View>

        {/* STATS DETAIL */}
        {stats.totalWorkouts > 0 && (
          <View style={styles.statsDetailCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Avg Calories per Workout</Text>
              <Text style={styles.detailValue}>{stats.averageCalories} kcal</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Active User Rate</Text>
              <Text style={styles.detailValue}>
                {stats.totalUsers > 0
                  ? Math.round((stats.activeUsers / stats.totalUsers) * 100)
                  : 0}
                %
              </Text>
            </View>
          </View>
        )}

        {/* MANAGEMENT MENU */}
        <Text style={styles.sectionTitle}>⚙️ Management</Text>

        <TouchableOpacity
          style={styles.menuCard}
          onPress={() => handleNavigate("/admin/users")}
          activeOpacity={0.7}
        >
          <View style={styles.menuIcon}>
            <Text style={styles.menuEmoji}>👥</Text>
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Manage Users</Text>
            <Text style={styles.menuSubtitle}>
              View, edit, or delete users ({stats.totalUsers})
            </Text>
          </View>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuCard}
          onPress={() => handleNavigate("/admin/stats")}
          activeOpacity={0.7}
        >
          <View style={styles.menuIcon}>
            <Text style={styles.menuEmoji}>📊</Text>
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Analytics</Text>
            <Text style={styles.menuSubtitle}>
              Detailed stats and trends ({stats.totalWorkouts} workouts)
            </Text>
          </View>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuCard}
          onPress={onRefresh}
          activeOpacity={0.7}
        >
          <View style={styles.menuIcon}>
            <Text style={styles.menuEmoji}>🔄</Text>
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>Refresh Data</Text>
            <Text style={styles.menuSubtitle}>Reload all dashboard stats</Text>
          </View>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>

        {/* QUICK ACTIONS */}
        <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>

        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonPrimary]}
            onPress={() => handleNavigate("/admin/users")}
          >
            <Text style={styles.actionButtonText}>Add User</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.actionButtonSecondary]}
            onPress={onRefresh}
          >
            <Text style={styles.actionButtonText2}>Sync Data</Text>
          </TouchableOpacity>
        </View>

        {/* ADMIN INFO */}
        <View style={styles.adminInfoCard}>
          <Text style={styles.adminInfoLabel}>👤 Logged in as</Text>
          <Text style={styles.adminInfoEmail}>
            {auth.currentUser?.email || "Admin"}
          </Text>
          <Text style={styles.adminInfoTime}>
            Last refreshed: {new Date().toLocaleTimeString()}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f8f5f0" },
  container: { padding: 16, paddingBottom: 40 },

  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#8b7968",
    fontSize: 14,
  },

  /* HEADER */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#4a3b31",
  },
  subtitle: {
    fontSize: 13,
    color: "#8b7968",
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: "#e74c3c",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
  },

  /* ERROR STATE */
  errorContainer: {
    backgroundColor: "#ffe6e6",
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#e74c3c",
  },
  errorText: {
    color: "#c0232f",
    fontSize: 13,
    fontWeight: "600",
  },
  retryButton: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#e74c3c",
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },

  /* SECTION TITLE */
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4a3b31",
    marginBottom: 12,
    marginTop: 20,
  },

  /* STATS GRID */
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statEmoji: { fontSize: 28, marginBottom: 8 },
  statNumber: {
    fontSize: 24,
    fontWeight: "800",
    color: "#C4935D",
  },
  statLabel: {
    fontSize: 11,
    color: "#8b7968",
    marginTop: 6,
    textAlign: "center",
  },

  /* STATS DETAIL */
  statsDetailCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: "#C4935D",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 13,
    color: "#8b7968",
    fontWeight: "600",
  },
  detailValue: {
    fontSize: 14,
    color: "#C4935D",
    fontWeight: "700",
  },

  /* MENU CARDS */
  menuCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  menuIcon: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: "#f0e6d8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuEmoji: { fontSize: 24 },
  menuContent: { flex: 1 },
  menuTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4a3b31",
  },
  menuSubtitle: {
    fontSize: 12,
    color: "#8b7968",
    marginTop: 2,
  },
  menuArrow: {
    fontSize: 16,
    color: "#C4935D",
    fontWeight: "700",
  },

  /* ACTION BUTTONS */
  actionButtonsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    elevation: 2,
  },
  actionButtonPrimary: {
    backgroundColor: "#C4935D",
  },
  actionButtonSecondary: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#C4935D",
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  actionButtonText2: {
    color: "#C4935D",
    fontWeight: "700",
    fontSize: 13,
  },

  /* ADMIN INFO */
  adminInfoCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#27ae60",
  },
  adminInfoLabel: {
    fontSize: 12,
    color: "#8b7968",
    textTransform: "uppercase",
    fontWeight: "600",
    marginBottom: 4,
  },
  adminInfoEmail: {
    fontSize: 14,
    color: "#4a3b31",
    fontWeight: "700",
    marginBottom: 8,
  },
  adminInfoTime: {
    fontSize: 11,
    color: "#8b7968",
    fontStyle: "italic",
  },
});
