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
  videoTitle: {
    fontSize: 16,// Import React and hooks
import React from "react";

// Import UI components
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  SafeAreaView,
} from "react-native";

// Main component
export default function Tutorial() {
  // Function to open YouTube links
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
            100+ exercises with proper form guidance 🎥
          </Text>
        </View>

        {/* ===== GYM WEIGHTLIFTING SECTION ===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏋️ Weightlifting (Gym)</Text>

          <TouchableOpacity
            style={styles.videoCard}
            onPress={() => openVideo("https://www.youtube.com/watch?v=U0bhE67HuDY")}
          >
            <Text style={styles.videoTitle}>Bench Press</Text>
            <Text style={styles.videoDesc}>Proper chest press technique</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.videoCard}
            onPress={() => openVideo("https://www.youtube.com/watch?v=1ZXobu7JvvE")}
          >
            <Text style={styles.videoTitle}>Barbell Squats</Text>
            <Text style={styles.videoDesc}>Perfect squat form</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.videoCard}
            onPress={() => openVideo("https://www.youtube.com/watch?v=4AObAU-EcYE")}
          >
            <Text style={styles.videoTitle}>Deadlifts</Text>
            <Text style={styles.videoDesc}>Safe deadlift technique</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.videoCard}
            onPress={() => openVideo("https://www.youtube.com/watch?v=IODxDxX7oi4")}
          >
            <Text style={styles.videoTitle}>Push-ups</Text>
            <Text style={styles.videoDesc}>Perfect push-up form</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.videoCard}
            onPress={() => openVideo("https://www.youtube.com/watch?v=eGo4IYlbE5g")}
          >
            <Text style={styles.videoTitle}>Pull-ups</Text>
            <Text style={styles.videoDesc}>Master pull-ups</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.videoCard}
            onPress={() => openVideo("https://www.youtube.com/watch?v=zC3nLlEfu4E")}
          >
            <Text style={styles.videoTitle}>Dumbbell Shoulder Press</Text>
            <Text style={styles.videoDesc}>Shoulder development</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.videoCard}
            onPress={() => openVideo("https://www.youtube.com/watch?v=TwD-YGVP4Bk")}
          >
            <Text style={styles.videoTitle}>Bicep Curls</Text>
            <Text style={styles.videoDesc}>Arm building exercise</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.videoCard}
            onPress={() => openVideo("https://www.youtube.com/watch?v=ebqg4KxwLqk")}
          >
            <Text style={styles.videoTitle}>Tricep Dips</Text>
            <Text style={styles.videoDesc}>Arm strength exercise</Text>
          </TouchableOpacity>
        </View>

        {/* ===== CARDIO SECTION ===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏃 Cardio Exercises</Text>

          <TouchableOpacity
            style={styles.videoCard}
            onPress={() => openVideo("https://www.youtube.com/watch?v=ml6cT4AZdqI")}
          >
            <Text style={styles.videoTitle}>HIIT Workout</Text>
            <Text style={styles.videoDesc}>High Intensity Interval Training</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.videoCard}
            onPress={() => openVideo("https://www.youtube.com/watch?v=5bL3bMk-wR0")}
          >
            <Text style={styles.videoTitle}>Jump Rope</Text>
            <Text style={styles.videoDesc}>Full cardio workout</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.videoCard}
            onPress={() => openVideo("https://www.youtube.com/watch?v=cbKkB3POqaY")}
          >
            <Text style={styles.videoTitle}>Burpees</Text>
            <Text style={styles.videoDesc}>Full body cardio</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.videoCard}
            onPress={() => openVideo("https://www.youtube.com/watch?v=3P3j9H2-SpE")}
          >
            <Text style={styles.videoTitle}>Mountain Climbers</Text>
            <Text style={styles.videoDesc}>Core cardio exercise</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.videoCard}
            onPress={() => openVideo("https://www.youtube.com/watch?v=L-BEV8WlqAU")}
          >
            <Text style={styles.videoTitle}>Jumping Jacks</Text>
            <Text style={styles.videoDesc}>Beginner cardio</Text>
          </TouchableOpacity>
        </View>

        {/* ===== YOGA SECTION ===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧘 Yoga & Flexibility</Text>

          <TouchableOpacity
            style={styles.videoCard}
            onPress={() => openVideo("https://www.youtube.com/watch?v=v7AYKMP6rOE")}
          >
            <Text style={styles.videoTitle}>Sun Salutation</Text>
            <Text style={styles.videoDesc}>Complete yoga flow</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.videoCard}
            onPress={() => openVideo("https://www.youtube.com/watch?v=4pKly2JojMw")}
          >
            <Text style={styles.videoTitle}>Morning Yoga</Text>
            <Text style={styles.videoDesc}>15-minute routine</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.videoCard}
            onPress={() => openVideo("https://www.youtube.com/watch?v=4C-gxOE0j7s")}
          >
            <Text style={styles.videoTitle}>Yoga for Back Pain</Text>
            <Text style={styles.videoDesc}>Relief exercises</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.videoCard}
            onPress={() => openVideo("https://www.youtube.com/watch?v=Ecl8C-lo4t0")}
          >
            <Text style={styles.videoTitle}>Yin Yoga</Text>
            <Text style={styles.videoDesc}>Deep stretching</Text>
          </TouchableOpacity>
        </View>

        {/* ===== STRETCHING SECTION ===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🤸 Stretching & Mobility</Text>

          <TouchableOpacity
            style={styles.videoCard}
            onPress={() => openVideo("https://www.youtube.com/watch?v=g_tea8ZNk5A")}
          >
            <Text style={styles.videoTitle}>Full Body Stretch</Text>
            <Text style={styles.videoDesc}>Daily 10-minute routine</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.videoCard}
            onPress={() => openVideo("https://www.youtube.com/watch?v=Ef6L3hY9XEM")}
          >
            <Text style={styles.videoTitle}>Leg Stretching</Text>
            <Text style={styles.videoDesc}>Hamstring flexibility</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.videoCard}
            onPress={() => openVideo("https://www.youtube.com/watch?v=fNPX-CK-6QE")}
          >
            <Text style={styles.videoTitle}>Hip Mobility</Text>
            <Text style={styles.videoDesc}>Open hip joints</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.videoCard}
            onPress={() => openVideo("https://www.youtube.com/watch?v=2L2lnxIcNmo")}
          >
            <Text style={styles.videoTitle}>Shoulder Stretch</Text>
            <Text style={styles.videoDesc}>Relieve tension</Text>
          </TouchableOpacity>
        </View>

        {/* ===== CORE & ABS SECTION ===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💪 Core & Abs</Text>

          <TouchableOpacity
            style={styles.videoCard}
            onPress={() => openVideo("https://www.youtube.com/watch?v=AnYl6Nk9GOA")}
          >
            <Text style={styles.videoTitle}>Plank Variations</Text>
            <Text style={styles.videoDesc}>Core strength exercises</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.videoCard}
            onPress={() => openVideo("https://www.youtube.com/watch?v=IODxDxX7oi4")}
          >
            <Text style={styles.videoTitle}>Crunches</Text>
            <Text style={styles.videoDesc}>Basic ab workout</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.videoCard}
            onPress={() => openVideo("https://www.youtube.com/watch?v=pSHjTRCQxIw")}
          >
            <Text style={styles.videoTitle}>Leg Raises</Text>
            <Text style={styles.videoDesc}>Lower abs focus</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.videoCard}
            onPress={() => openVideo("https://www.youtube.com/watch?v=wyFdQd8SW_8")}
          >
            <Text style={styles.videoTitle}>Russian Twists</Text>
            <Text style={styles.videoDesc}>Oblique exercises</Text>
          </TouchableOpacity>
        </View>

        {/* ===== HOME WORKOUTS (NO EQUIPMENT) ===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏠 Home Workouts</Text>

          <TouchableOpacity
            style={styles.videoCard}
            onPress={() => openVideo("https://www.youtube.com/watch?v=ml6cT4AZdqI")}
          >
            <Text style={styles.videoTitle}>Full Body Home Workout</Text>
            <Text style={styles.videoDesc}>No equipment needed</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.videoCard}
            onPress={() => openVideo("https://www.youtube.com/watch?v=jOfshreyu4w")}
          >
            <Text style={styles.videoTitle}>Chair Exercises</Text>
            <Text style={styles.videoDesc}>For seniors/office workers</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.videoCard}
            onPress={() => openVideo("https://www.youtube.com/watch?v=GFDmCzqUJjY")}
          >
            <Text style={styles.videoTitle}>Wall Push-ups</Text>
            <Text style={styles.videoDesc}>Beginner upper body</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.videoCard}
            onPress={() => openVideo("https://www.youtube.com/watch?v=caDikc8D7HY")}
          >
            <Text style={styles.videoTitle}>Bodyweight Squats</Text>
            <Text style={styles.videoDesc}>No equipment leg day</Text>
          </TouchableOpacity>
        </View>

        {/* ===== KEGEL & PELVIC FLOOR ===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🩺 Pelvic Floor (Kegel)</Text>

          <TouchableOpacity
            style={styles.videoCard}
            onPress={() => openVideo("https://www.youtube.com/watch?v=7Z3Z8cSfqEw")}
          >
            <Text style={styles.videoTitle}>Kegel Basics</Text>
            <Text style={styles.videoDesc}>Beginner guide</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.videoCard}
            onPress={() => openVideo("https://www.youtube.com/watch?v=Kp1Q5YpFqCM")}
          >
            <Text style={styles.videoTitle}>Advanced Kegels</Text>
            <Text style={styles.videoDesc}>For strength</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.videoCard}
            onPress={() => openVideo("https://www.youtube.com/watch?v=9Q0D6vY4F7w")}
          >
            <Text style={styles.videoTitle}>Postpartum Recovery</Text>
            <Text style={styles.videoDesc}>For new mothers</Text>
          </TouchableOpacity>
        </View>

        {/* ===== REHAB & INJURY PREVENTION ===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏥 Rehabilitation</Text>

          <TouchableOpacity
            style={styles.videoCard}
            onPress={() => openVideo("https://www.youtube.com/watch?v=4C-gxOE0j7s")}
          >
            <Text style={styles.videoTitle}>Knee Pain Exercises</Text>
            <Text style={styles.videoDesc}>Strengthen knees</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.videoCard}
            onPress={() => openVideo("https://www.youtube.com/watch?v=2L2lnxIcNmo")}
          >
            <Text style={styles.videoTitle}>Shoulder Rehab</Text>
            <Text style={styles.videoDesc}>Rotator cuff exercises</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.videoCard}
            onPress={() => openVideo("https://www.youtube.com/watch?v=OSWTwpGjr8g")}
          >
            <Text style={styles.videoTitle}>Lower Back Pain</Text>
            <Text style={styles.videoDesc}>Relief exercises</Text>
          </TouchableOpacity>
        </View>

        {/* ===== CALISTHENICS ===== */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🤸 Calisthenics</Text>

          <TouchableOpacity
            style={styles.videoCard}
            onPress={() => openVideo("https://www.youtube.com/watch?v=0pkjOk0FiCQ")}
          >
            <Text style={styles.videoTitle}>Handstand Tutorial</Text>
            <Text style={styles.videoDesc}>Learn to handstand</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.videoCard}
            onPress={() => openVideo("https://www.youtube.com/watch?v=2B3XhCqK-1o")}
          >
            <Text style={styles.videoTitle}>Muscle Up Progressions</Text>
            <Text style={styles.videoDesc}>Advanced calisthenics</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.videoCard}
            onPress={() => openVideo("https://www.youtube.com/watch?v=BRoUV1EjOi8")}
          >
            <Text style={styles.videoTitle}>Planche Training</Text>
            <Text style={styles.videoDesc}>Bodyweight skill</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ===== STYLES =====
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5efe6",
  },
  container: {
    flex: 1,
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
    marginBottom: 10,
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
    borderRadius: 10,
    paddingLeft: 15,
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
    marginBottom: 4,
  },
  videoDesc: {
    fontSize: 13,
    color: "#7a6659",
  },
});
    fontWeight: "600",
    color: "#4a3b31",
  },
  videoDesc: {
    fontSize: 13,
    color: "#7a6659",
    marginTop: 4,
  },
});
