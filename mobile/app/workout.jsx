import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { router } from "expo-router";

// Define workouts
const workouts = [
  {
    title: "Full Body Workout",
    calories: 350,
    duration: "45 min",
    route: "/fullbodyworkout",
  },
  {
    title: "Upper Body Strength",
    calories: 300,
    duration: "40 min",
    route: "/upperbodystrength",
  },
  {
    title: "Cardio Blast",
    calories: 280,
    duration: "30 min",
    route: "/cardioblast",
  },
];

export default function WorkoutScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Workouts</Text>
          <Text style={styles.subtitle}>
            Select a workout and start training 💪
          </Text>
        </View>

        {/* Tutorial Button */}
        <TouchableOpacity
          style={styles.tutorialButton}
          onPress={() => router.push("/tutorials")}
        >
          <Text style={styles.tutorialButtonText}>
            📺 Watch Workout Tutorials
          </Text>
        </TouchableOpacity>

        {/* Workouts List */}
        {workouts.map((workout, index) => (
          <View key={index} style={styles.workoutCard}>
            <Text style={styles.workoutTitle}>{workout.title}</Text>
            <Text style={styles.workoutInfo}>
              ⏱ {workout.duration} • 🔥 {workout.calories} kcal
            </Text>

            <TouchableOpacity
              style={styles.startButton}
              onPress={() => router.push(workout.route)}
            >
              <Text style={styles.startButtonText}>Start Workout</Text>
            </TouchableOpacity>
          </View>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f5efe6" },
  container: { padding: 24, paddingBottom: 40 },

  header: { marginBottom: 20 },
  title: { fontSize: 32, fontWeight: "800", color: "#4a3b31", marginBottom: 4 },
  subtitle: { fontSize: 16, color: "#7a6659" },

  tutorialButton: {
    backgroundColor: "#4a3b31",
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: "center",
    marginVertical: 20,
  },
  tutorialButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },

  workoutCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  workoutTitle: { fontSize: 20, fontWeight: "700", color: "#4a3b31", marginBottom: 6 },
  workoutInfo: { fontSize: 14, color: "#7a6659", marginBottom: 16 },

  startButton: {
    backgroundColor: "#5b4334",
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: "center",
  },
  startButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});

