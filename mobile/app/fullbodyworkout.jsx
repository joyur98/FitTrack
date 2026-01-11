import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from "react-native";

const workouts = [
  {
    title: "Jumping Jacks",
    desc: "5 minutes • Warm-up • Full body activation",
  },
  {
    title: "Bodyweight Squats",
    desc: "4 sets × 15 reps • Legs & glutes",
  },
  {
    title: "Push-Ups",
    desc: "4 sets × 12 reps • Chest, shoulders & arms",
  },
  {
    title: "Mountain Climbers",
    desc: "4 minutes • Core & cardio burn",
  },
  {
    title: "Lunges",
    desc: "3 sets × 12 reps per leg • Lower body strength",
  },
  {
    title: "Plank Hold",
    desc: "3 sets × 45 seconds • Core stability",
  },
  {
    title: "Burpees",
    desc: "3 sets × 10 reps • High calorie burn",
  },
  {
    title: "Russian Twists",
    desc: "3 sets × 20 reps • Core & obliques",
  },
  {
    title: "High Knees",
    desc: "3 minutes • Cardio finisher",
  },
  {
    title: "Stretch & Cool Down",
    desc: "5 minutes • Full body recovery",
  },
];

export default function FullBodyWorkoutScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Full Body Workout</Text>
          <Text style={styles.subtitle}>
            45 Minutes • ~350 Calories Burn
          </Text>
        </View>

        {/* Workout Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Workout Plan</Text>

          {workouts.map((workout, index) => (
            <View key={index} style={styles.videoCard}>
              <Text style={styles.videoTitle}>{workout.title}</Text>
              <Text style={styles.videoDesc}>{workout.desc}</Text>
            </View>
          ))}
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
    padding: 16,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#4a3b31",
  },
  subtitle: {
    fontSize: 14,
    color: "#7a6659",
    marginTop: 4,
    textAlign: "center",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#4a3b31",
    marginBottom: 12,
    backgroundColor: "#efe6d8",
    padding: 10,
    borderRadius: 12,
  },
  videoCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: "#C4935D",
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4a3b31",
  },
  videoDesc: {
    fontSize: 13,
    color: "#7a6659",
    marginTop: 4,
  },
});
