import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { router } from "expo-router";

export default function WorkoutScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Workouts</Text>
          <Text style={styles.subtitle}>
            Choose a workout and start training 💪
          </Text>
        </View>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.categories}>
            {["Beginner", "Strength", "Cardio", "HIIT", "Yoga"].map(
              (cat, index) => (
                <View key={index} style={styles.categoryChip}>
                  <Text style={styles.categoryText}>{cat}</Text>
                </View>
              )
            )}
          </View>
        </ScrollView>

        {/* Workout Cards */}
        <View style={styles.workoutCard}>
          <Text style={styles.workoutTitle}>Full Body Workout</Text>
          <Text style={styles.workoutInfo}>⏱ 45 min • 🔥 350 kcal</Text>

          <TouchableOpacity
            style={styles.startButton}
            onPress={() => router.push("/workoutDetail")}
          >
            <Text style={styles.startButtonText}>Start Workout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.workoutCard}>
          <Text style={styles.workoutTitle}>Upper Body Strength</Text>
          <Text style={styles.workoutInfo}>⏱ 40 min • 🔥 300 kcal</Text>

          <TouchableOpacity
            style={styles.startButton}
            onPress={() => router.push("/workoutDetail")}
          >
            <Text style={styles.startButtonText}>Start Workout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.workoutCard}>
          <Text style={styles.workoutTitle}>Cardio Blast</Text>
          <Text style={styles.workoutInfo}>⏱ 30 min • 🔥 280 kcal</Text>

          <TouchableOpacity
            style={styles.startButton}
            onPress={() => router.push("/workoutDetail")}
          >
            <Text style={styles.startButtonText}>Start Workout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5efe6",
  },
  container: {
    padding: 24,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#4a3b31",
  },
  subtitle: {
    fontSize: 15,
    color: "#7a6659",
    marginTop: 4,
  },
  categories: {
    flexDirection: "row",
    marginBottom: 24,
  },
  categoryChip: {
    backgroundColor: "#efe6d8",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    elevation: 2,
  },
  categoryText: {
    color: "#4a3b31",
    fontWeight: "600",
  },
  workoutCard: {
    backgroundColor: "#efe6d8",
    borderRadius: 24,
    padding: 22,
    marginBottom: 20,
    elevation: 4,
  },
  workoutTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#4a3b31",
    marginBottom: 6,
  },
  workoutInfo: {
    fontSize: 14,
    color: "#7a6659",
    marginBottom: 16,
  },
  startButton: {
    backgroundColor: "#5b4334",
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: "center",
  },
  startButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
