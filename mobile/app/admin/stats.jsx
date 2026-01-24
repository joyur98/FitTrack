import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { getFirestore, collection, getDocs } from "firebase/firestore";

export default function AdminStats() {
  const router = useRouter();
  const db = getFirestore();
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    newUsersThisMonth: 0,
    totalWorkouts: 0,
    totalCalories: 0,
    avgCaloriesPerUser: 0,
    topUsers: [],
    workoutTrend: [],
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Get all users
      const usersSnap = await getDocs(collection(db, "users"));
      const totalUsers = usersSnap.size;

      // Get new users this month
      const thisMonth = new Date();
      thisMonth.setDate(1);

      let newUsersThisMonth = 0;
      let topUsers = [];

      usersSnap.forEach((doc) => {
        const createdAt = doc.data().createdAt?.toDate?.();
        if (createdAt && createdAt >= thisMonth) {
          newUsersThisMonth++;
        }

        topUsers.push({
          name: doc.data().fullName || "User",
          workouts: doc.data().totalWorkouts || 0,
        });
      });

      // Sort by workouts
      topUsers.sort((a, b) => b.workouts - a.workouts);
      topUsers = topUsers.slice(0, 5);

      // Get workout stats
      const workoutsSnap = await getDocs(collection(db, "calorie_burn"));
      const totalWorkouts = workoutsSnap.size;

      let totalCalories = 0;
      workoutsSnap.forEach((doc) => {
        totalCalories += doc.data().calorie || 0;
      });

      const avgCaloriesPerUser =
        totalUsers > 0 ? Math.round(totalCalories / totalUsers) : 0;

      setAnalytics({
        totalUsers,
        newUsersThisMonth,
        totalWorkouts,
        totalCalories: Math.round(totalCalories),
        avgCaloriesPerUser,
        topUsers,
      });

      setLoading(false);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color="#C4935D" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Analytics & Statistics</Text>
        </View>

        {/* KEY METRICS */}
        <Text style={styles.sectionTitle}>📊 Key Metrics</Text>

        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Total Users</Text>
            <Text style={styles.metricValue}>{analytics.totalUsers}</Text>
            <Text style={styles.metricUnit}>registered</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>New This Month</Text>
            <Text style={styles.metricValue}>{analytics.newUsersThisMonth}</Text>
            <Text style={styles.metricUnit}>users</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Total Workouts</Text>
            <Text style={styles.metricValue}>{analytics.totalWorkouts}</Text>
            <Text style={styles.metricUnit}>completed</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Total Calories</Text>
            <Text style={styles.metricValue}>{analytics.totalCalories}</Text>
            <Text style={styles.metricUnit}>burned</Text>
          </View>
        </View>

        {/* AVERAGE METRICS */}
        <Text style={styles.sectionTitle}>📈 Average Metrics</Text>

        <View style={styles.averageCard}>
          <View style={styles.averageItem}>
            <Text style={styles.averageLabel}>Avg Calories / User</Text>
            <Text style={styles.averageValue}>
              {analytics.avgCaloriesPerUser} cal
            </Text>
          </View>
          <View style={styles.averageItem}>
            <Text style={styles.averageLabel}>Avg Workouts / User</Text>
            <Text style={styles.averageValue}>
              {analytics.totalUsers > 0
                ? Math.round(analytics.totalWorkouts / analytics.totalUsers)
                : 0}
            </Text>
          </View>
        </View>

        {/* TOP USERS */}
        <Text style={styles.sectionTitle}>🏆 Top Active Users</Text>

        <View>
          {analytics.topUsers.length > 0 ? (
            analytics.topUsers.map((user, index) => (
              <View key={index} style={styles.topUserCard}>
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>#{index + 1}</Text>
                </View>
                <View style={styles.topUserInfo}>
                  <Text style={styles.topUserName}>{user.name}</Text>
                  <Text style={styles.topUserWorkouts}>
                    {user.workouts} workouts
                  </Text>
                </View>
                <Text style={styles.topUserEmoji}>
                  {index === 0 ? "👑" : index === 1 ? "🥈" : "🥉"}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No users yet</Text>
          )}
        </View>

        {/* INSIGHTS */}
        <Text style={styles.sectionTitle}>💡 Insights</Text>

        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>User Engagement</Text>
          <Text style={styles.insightText}>
            {analytics.totalUsers > 0
              ? `Average user has completed ${Math.round(
                  analytics.totalWorkouts / analytics.totalUsers
                )} workouts`
              : "No data yet"}
          </Text>
        </View>

        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>Activity Status</Text>
          <Text style={styles.insightText}>
            {analytics.newUsersThisMonth > 0
              ? `${analytics.newUsersThisMonth} new users joined this month`
              : "No new users this month"}
          </Text>
        </View>

        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>Health Impact</Text>
          <Text style={styles.insightText}>
            Total of {analytics.totalCalories} calories burned by all users
            combined
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f8f5f0" },
  container: { padding: 16, paddingBottom: 40 },

  header: {
    marginBottom: 24,
    paddingTop: 10,
  },
  backButton: {
    fontSize: 16,
    color: "#C4935D",
    fontWeight: "700",
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#4a3b31",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4a3b31",
    marginTop: 20,
    marginBottom: 12,
  },

  // Metrics Grid
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  metricCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    alignItems: "center",
    elevation: 2,
  },
  metricLabel: {
    fontSize: 11,
    color: "#8b7968",
    fontWeight: "600",
  },
  metricValue: {
    fontSize: 26,
    fontWeight: "800",
    color: "#C4935D",
    marginTop: 6,
  },
  metricUnit: {
    fontSize: 10,
    color: "#8b7968",
    marginTop: 2,
  },

  // Average Card
  averageCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 24,
    elevation: 2,
  },
  averageItem: {
    alignItems: "center",
  },
  averageLabel: {
    fontSize: 12,
    color: "#8b7968",
    fontWeight: "600",
  },
  averageValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#C4935D",
    marginTop: 6,
  },

  // Top Users
  topUserCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#C4935D",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  rankText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  topUserInfo: {
    flex: 1,
  },
  topUserName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4a3b31",
  },
  topUserWorkouts: {
    fontSize: 12,
    color: "#8b7968",
    marginTop: 2,
  },
  topUserEmoji: {
    fontSize: 20,
  },

  // Insights
  insightCard: {
    backgroundColor: "#fff3e0",
    borderLeftWidth: 4,
    borderLeftColor: "#C4935D",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  insightTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4a3b31",
  },
  insightText: {
    fontSize: 12,
    color: "#8b7968",
    marginTop: 4,
    lineHeight: 16,
  },

  emptyText: {
    fontSize: 14,
    color: "#8b7968",
    textAlign: "center",
    marginTop: 20,
  },
});