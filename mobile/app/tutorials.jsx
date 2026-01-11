// Import React and hooks
import React from "react";

// Import UI components
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";

// Main component
export default function Tutorial() {
  // Function to open YouTube links
  const openVideo = (url) => {
    Linking.openURL(url);
  };

  return (
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
  );
}

// ===== STYLES =====
const styles = StyleSheet.create({
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
    fontWeight: "800",
    color: "#4a3b31",
  },
  subtitle: {
    fontSize: 15,
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
  },
  videoCard: {
    backgroundColor: "#efe6d8",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 3,
  },
})
