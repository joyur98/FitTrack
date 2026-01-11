// ===== IMPORTS =====
import React from "react";
<<<<<<< HEAD
=======

// Import UI components
>>>>>>> e61775892629c3309e8444060e671ceff35b1369
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
<<<<<<< HEAD
  SafeAreaView,
} from "react-native";

// ===== COMPONENT =====
export default function Tutorial() {
=======
} from "react-native";

// Main component
export default function Tutorial() {
  // Function to open YouTube links
>>>>>>> e61775892629c3309e8444060e671ceff35b1369
  const openVideo = (url) => {
    Linking.openURL(url);
  };

  return (
<<<<<<< HEAD
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
=======
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Workout Tutorials</Text>
        <Text style={styles.subtitle}>
          Learn workouts from expert YouTube trainers 🎥
        </Text>
      </View>

      {/* ===== GYM SECTION ===== */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏋️ Gym Tutorials</Text>

        <TouchableOpacity
          style={styles.videoCard}
          onPress={() =>
            openVideo("https://www.youtube.com/watch?v=U0bhE67HuDY")
          }
        >
          <Text style={styles.videoTitle}>Free Weights Tutorial</Text>
          <Text style={styles.videoDesc}>Dumbbells & barbell basics</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.videoCard}
          onPress={() =>
            openVideo("https://www.youtube.com/watch?v=IODxDxX7oi4")
          }
        >
          <Text style={styles.videoTitle}>Push-ups Tutorial</Text>
          <Text style={styles.videoDesc}>Correct push-up form</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.videoCard}
          onPress={() =>
            openVideo("https://www.youtube.com/watch?v=eGo4IYlbE5g")
          }
        >
          <Text style={styles.videoTitle}>Pull-ups Tutorial</Text>
          <Text style={styles.videoDesc}>Step-by-step pull-ups</Text>
        </TouchableOpacity>
      </View>

      {/* ===== YOGA SECTION ===== */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🧘 Yoga</Text>

        <TouchableOpacity
          style={styles.videoCard}
          onPress={() =>
            openVideo("https://www.youtube.com/watch?v=v7AYKMP6rOE")
          }
        >
          <Text style={styles.videoTitle}>Yoga for Beginners</Text>
          <Text style={styles.videoDesc}>Full beginner yoga flow</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.videoCard}
          onPress={() =>
            openVideo("https://www.youtube.com/watch?v=4pKly2JojMw")
          }
        >
          <Text style={styles.videoTitle}>Morning Yoga</Text>
          <Text style={styles.videoDesc}>Energize your body</Text>
        </TouchableOpacity>
      </View>

      {/* ===== STRETCHING SECTION ===== */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🤸 Stretching</Text>

        <TouchableOpacity
          style={styles.videoCard}
          onPress={() =>
            openVideo("https://www.youtube.com/watch?v=g_tea8ZNk5A")
          }
        >
          <Text style={styles.videoTitle}>Full Body Stretch</Text>
          <Text style={styles.videoDesc}>10-minute daily stretching</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.videoCard}
          onPress={() =>
            openVideo("https://www.youtube.com/watch?v=Ef6L3hY9XEM")
          }
        >
          <Text style={styles.videoTitle}>Leg Stretching</Text>
          <Text style={styles.videoDesc}>Improve flexibility</Text>
        </TouchableOpacity>
      </View>

      {/* ===== KEGEL SECTION ===== */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🩺 Kegel Exercises</Text>

        <TouchableOpacity
          style={styles.videoCard}
          onPress={() =>
            openVideo("https://www.youtube.com/watch?v=7Z3Z8cSfqEw")
          }
        >
          <Text style={styles.videoTitle}>Kegel Exercises for Beginners</Text>
          <Text style={styles.videoDesc}>Pelvic floor strengthening</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.videoCard}
          onPress={() =>
            openVideo("https://www.youtube.com/watch?v=Kp1Q5YpFqCM")
          }
        >
          <Text style={styles.videoTitle}>Advanced Kegels</Text>
          <Text style={styles.videoDesc}>Improve control & strength</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
>>>>>>> e61775892629c3309e8444060e671ceff35b1369
  );
}

// ===== STYLES =====
const styles = StyleSheet.create({
<<<<<<< HEAD
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
=======
  container: {
    flex: 1,
    backgroundColor: "#f5efe6",
    padding: 16,
  },
  header: {
    marginBottom: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
>>>>>>> e61775892629c3309e8444060e671ceff35b1369
    fontWeight: "800",
    color: "#4a3b31",
  },
  subtitle: {
<<<<<<< HEAD
    fontSize: 14,
=======
    fontSize: 15,
>>>>>>> e61775892629c3309e8444060e671ceff35b1369
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
<<<<<<< HEAD
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
=======
  },
  videoCard: {
    backgroundColor: "#efe6d8",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 3,
  },
})
>>>>>>> e61775892629c3309e8444060e671ceff35b1369
