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

// CardioBlast Workout Plan
const workouts = [
  { title: "Jumping Jacks", desc: "5 minutes • Warm-up • Full body activation" },
  { title: "High Knees", desc: "3 minutes • Cardio finisher" },
  { title: "Mountain Climbers", desc: "3 sets × 1 minute • Core & cardio burn" },
  { title: "Burpees", desc: "3 sets × 12 reps • Full body high intensity" },
  { title: "Butt Kicks", desc: "3 minutes • Lower body cardio" },
  { title: "Skater Jumps", desc: "3 sets × 15 reps per side • Legs & cardio" },
  { title: "Plank Jacks", desc: "3 sets × 1 minute • Core & cardio burn" },
  { title: "Jump Rope", desc: "5 minutes • Cardio endurance" },
  { title: "Sprint in Place", desc: "2 minutes • High-intensity cardio" },
  { title: "Stretch & Cool Down", desc: "5 minutes • Recovery & flexibility" },
];

export default function CardioBlastScreen() {
  const handleCompleteWorkout = async () => {
    try {
      const user = auth.currentUser;

      if (!user) {
        Alert.alert("Error", "User not logged in");
        return;
      }

      await addDoc(collection(db, "calorie_burn"), {
        calorie: 280,
        date: serverTimestamp(),
        userID: user.uid,
        workoutName: "CardioBlast",
      });

      Alert.alert(
        "Workout Completed 🔥",
        "280 calories added successfully!"
      );
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
          <Text style={styles.title}>CardioBlast</Text>
          <Text style={styles.subtitle}>
            30 Minutes • ~280 Calories Burn
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
