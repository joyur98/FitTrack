// workout.jsx - UPDATED WITH MENTAL FITNESS
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

// Define workouts - INCLUDING MENTAL FITNESS
const workouts = [
  {
    title: "Full Body Workout",
    calories: 350,
    duration: "45 min",
    route: "/fullbodyworkout",
    emoji: "💪",
    type: "physical",
    color: "#e74c3c"
  },
  {
    title: "Upper Body Strength",
    calories: 300,
    duration: "40 min",
    route: "/upperbodystrength",
    emoji: "🏋️",
    type: "physical",
    color: "#3498db"
  },
  {
    title: "Cardio Blast",
    calories: 280,
    duration: "30 min",
    route: "/cardioblast",
    emoji: "🏃",
    type: "physical",
    color: "#27ae60"
  },
  {
    title: "Mental Fitness",
    calories: 0,
    duration: "5-15 min",
    route: "/MentalFitness",
    emoji: "🧠",
    type: "mental",
    color: "#9b59b6",
    description: "Meditation, breathing & mood tracking"
  },
];

export default function WorkoutScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Workouts & Wellness</Text>
          <Text style={styles.subtitle}>
            Train your body and mind for complete fitness 💪🧠
          </Text>
        </View>

        {/* Category Tabs */}
        <View style={styles.categoryContainer}>
          <TouchableOpacity style={[styles.categoryTab, styles.categoryActive]}>
            <Text style={styles.categoryText}>All Activities</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryTab}>
            <Text style={styles.categoryText}>Physical</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.categoryTab}>
            <Text style={styles.categoryText}>Mental</Text>
          </TouchableOpacity>
        </View>

        {/* Tutorial Button */}
        <TouchableOpacity
          style={styles.tutorialButton}
          onPress={() => router.push("/tutorials")}
        >
          <Text style={styles.tutorialButtonText}>
            📺 Watch Tutorials & Learn
          </Text>
        </TouchableOpacity>

        {/* Workouts List */}
        <Text style={styles.sectionTitle}>Physical Workouts</Text>
        {workouts.filter(w => w.type === "physical").map((workout, index) => (
          <View key={index} style={[styles.workoutCard, {borderLeftWidth: 4, borderLeftColor: workout.color}]}>
            <View style={styles.workoutHeader}>
              <View style={styles.workoutTitleRow}>
                <Text style={styles.workoutEmoji}>{workout.emoji}</Text>
                <Text style={styles.workoutTitle}>{workout.title}</Text>
              </View>
              <View style={styles.workoutStats}>
                <Text style={styles.workoutDuration}>⏱ {workout.duration}</Text>
                <Text style={styles.workoutCalories}>🔥 {workout.calories} kcal</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.startButton, {backgroundColor: workout.color}]}
              onPress={() => router.push(workout.route)}
            >
              <Text style={styles.startButtonText}>Start Workout →</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Mental Wellness Section */}
        <Text style={styles.sectionTitle}>Mental Wellness</Text>
        {workouts.filter(w => w.type === "mental").map((workout, index) => (
          <View key={index} style={[styles.mentalCard, {backgroundColor: workout.color + '15'}]}>
            <View style={styles.mentalHeader}>
              <View style={styles.mentalTitleRow}>
                <Text style={styles.mentalEmoji}>{workout.emoji}</Text>
                <View>
                  <Text style={styles.mentalTitle}>{workout.title}</Text>
                  <Text style={styles.mentalDescription}>{workout.description}</Text>
                </View>
              </View>
              <Text style={styles.mentalDuration}>⏱ {workout.duration}</Text>
            </View>

            <View style={styles.mentalBenefits}>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitEmoji}>😌</Text>
                <Text style={styles.benefitText}>Stress Relief</Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitEmoji}>🎯</Text>
                <Text style={styles.benefitText}>Focus</Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitEmoji}>⚡</Text>
                <Text style={styles.benefitText}>Energy</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.startButton, {backgroundColor: workout.color}]}
              onPress={() => router.push(workout.route)}
            >
              <Text style={styles.startButtonText}>Start Mental Fitness →</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Quick Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>💡 Wellness Tip</Text>
          <Text style={styles.tipsText}>
            Balance physical workouts with mental exercises for complete wellbeing. 
            Try 20 minutes of meditation after your workout for best results.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: "#f5efe6" 
  },
  container: { 
    padding: 20, 
    paddingBottom: 40 
  },

  header: { 
    marginBottom: 20 
  },
  title: { 
    fontSize: 32, 
    fontWeight: "800", 
    color: "#4a3b31", 
    marginBottom: 4 
  },
  subtitle: { 
    fontSize: 16, 
    color: "#7a6659" 
  },

  categoryContainer: {
    flexDirection: "row",
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 4,
  },
  categoryTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  categoryActive: {
    backgroundColor: "#C4935D",
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4a3b31",
  },

  tutorialButton: {
    backgroundColor: "#4a3b31",
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: "center",
    marginVertical: 20,
  },
  tutorialButtonText: { 
    color: "#fff", 
    fontSize: 16, 
    fontWeight: "600" 
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#4a3b31",
    marginTop: 10,
    marginBottom: 15,
  },

  workoutCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  workoutHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  workoutTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  workoutEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  workoutTitle: { 
    fontSize: 18, 
    fontWeight: "700", 
    color: "#4a3b31" 
  },
  workoutStats: {
    alignItems: "flex-end",
  },
  workoutDuration: { 
    fontSize: 14, 
    color: "#7a6659",
    marginBottom: 4 
  },
  workoutCalories: { 
    fontSize: 14, 
    color: "#e74c3c",
    fontWeight: "600" 
  },

  mentalCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: "#9b59b620",
  },
  mentalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  mentalTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  mentalEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  mentalTitle: { 
    fontSize: 20, 
    fontWeight: "700", 
    color: "#9b59b6" 
  },
  mentalDescription: { 
    fontSize: 13, 
    color: "#9b59b6",
    opacity: 0.8,
    marginTop: 2
  },
  mentalDuration: { 
    fontSize: 14, 
    color: "#9b59b6",
    fontWeight: "600" 
  },

  mentalBenefits: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    backgroundColor: "#f9f7fc",
    borderRadius: 12,
    padding: 12,
  },
  benefitItem: {
    alignItems: "center",
  },
  benefitEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  benefitText: {
    fontSize: 12,
    color: "#9b59b6",
    fontWeight: "600",
  },

  startButton: {
    backgroundColor: "#5b4334",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  startButtonText: { 
    color: "#fff", 
    fontSize: 16, 
    fontWeight: "600" 
  },

  tipsCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginTop: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#C4935D",
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4a3b31",
    marginBottom: 10,
  },
  tipsText: {
    fontSize: 14,
    color: "#7a6659",
    lineHeight: 22,
  },
});