// ===== IMPORTS =====
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  SafeAreaView,
} from "react-native";

// ===== COMPONENT =====
export default function Tutorial() {
  const openVideo = (url) => {
    Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Workout Tutorials</Text>
          <Text style={styles.subtitle}>
            Learn exercises with proper form 🎥
          </Text>
        </View>

        {/* ===== GYM ===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏋️ Gym Workouts</Text>

          <VideoCard
            title="Bench Press"
            desc="Proper chest press technique"
            url="https://www.youtube.com/watch?v=U0bhE67HuDY"
          />
          <VideoCard
            title="Barbell Squats"
            desc="Perfect squat form"
            url="https://www.youtube.com/watch?v=1ZXobu7JvvE"
          />
          <VideoCard
            title="Deadlift"
            desc="Safe deadlift technique"
            url="https://www.youtube.com/watch?v=4AObAU-EcYE"
          />
        </View>

        {/* ===== CARDIO ===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏃 Cardio</Text>

          <VideoCard
            title="HIIT Workout"
            desc="High intensity cardio"
            url="https://www.youtube.com/watch?v=ml6cT4AZdqI"
          />
          <VideoCard
            title="Jump Rope"
            desc="Full cardio workout"
            url="https://www.youtube.com/watch?v=5bL3bMk-wR0"
          />
        </View>

        {/* ===== YOGA ===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧘 Yoga</Text>

          <VideoCard
            title="Morning Yoga"
            desc="15-minute flow"
            url="https://www.youtube.com/watch?v=4pKly2JojMw"
          />
          <VideoCard
            title="Back Pain Yoga"
            desc="Relieve stiffness"
            url="https://www.youtube.com/watch?v=4C-gxOE0j7s"
          />
        </View>

        {/* ===== STRETCHING ===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🤸 Stretching</Text>

          <VideoCard
            title="Full Body Stretch"
            desc="10-minute routine"
            url="https://www.youtube.com/watch?v=g_tea8ZNk5A"
          />
          <VideoCard
            title="Leg Stretching"
            desc="Increase flexibility"
            url="https://www.youtube.com/watch?v=Ef6L3hY9XEM"
          />
        </View>

        {/* ===== KEGEL ===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🩺 Kegel Exercises</Text>

          <VideoCard
            title="Kegel Basics"
            desc="Pelvic floor strengthening"
            url="https://www.youtube.com/watch?v=7Z3Z8cSfqEw"
          />
          <VideoCard
            title="Advanced Kegels"
            desc="Improve control"
            url="https://www.youtube.com/watch?v=Kp1Q5YpFqCM"
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ===== REUSABLE VIDEO CARD =====
function VideoCard({ title, desc, url }) {
  return (
    <TouchableOpacity style={styles.videoCard} onPress={() => Linking.openURL(url)}>
      <Text style={styles.videoTitle}>{title}</Text>
      <Text style={styles.videoDesc}>{desc}</Text>
    </TouchableOpacity>
  );
}

// ===== STYLES =====
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
