import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { auth, db } from "./firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// Upper Body Strength Workout Plan
const workouts = [
  { title: "Push-Ups", desc: "4 sets × 12 reps • Chest, shoulders & arms" },
  { title: "Dumbbell Bench Press", desc: "4 sets × 10 reps • Chest & triceps" },
  { title: "Bent Over Rows", desc: "4 sets × 12 reps • Back & biceps" },
  { title: "Shoulder Press", desc: "3 sets × 12 reps • Shoulders & arms" },
  { title: "Bicep Curls", desc: "3 sets × 15 reps • Biceps focus" },
  { title: "Tricep Dips", desc: "3 sets × 12 reps • Triceps focus" },
  { title: "Plank to Push-Up", desc: "3 sets × 10 reps • Core & upper body" },
  { title: "Mountain Climbers", desc: "3 minutes • Core & cardio burn" },
  { title: "High Plank Hold", desc: "3 sets × 45 seconds • Core & arms stability" },
  { title: "Stretch & Cool Down", desc: "5 minutes • Upper body recovery" },
];

export default function UpperBodyStrengthScreen() {
  const handleCompleteWorkout = async () => {
    try {
      const user = auth.currentUser;

      if (!user) {
        Alert.alert("Error", "User not logged in");
        return;
      }

      await addDoc(collection(db, "calorie_burn"), {
        calorie: 300,
        date: serverTimestamp(),
        userID: user.uid,
        workoutName: "Upper Body Strength",
      });

      Alert.alert("Workout Completed 💪", "300 calories added successfully!");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to save workout");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Upper Body Strength</Text>
          <Text style={styles.subtitle}>
            40 Minutes • ~300 Calories Burn
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

        {/* Complete Workout Button */}
        <TouchableOpacity
          style={styles.completeButton}
          onPress={handleCompleteWorkout}
        >
          <Text style={styles.completeButtonText}>
            Complete Workout
          </Text>
        </TouchableOpacity>
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
  completeButton: {
    backgroundColor: "#C4935D",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 30,
  },
  completeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
