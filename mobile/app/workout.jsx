// Import UI components from React Native
import {
  View,           // Container component (like a div in HTML)
  Text,           // For displaying text on screen
  StyleSheet,     // For creating and organizing component styles
  ScrollView,     // Creates a scrollable container (vertical)
  TouchableOpacity, // Makes components clickable with fade effect
  SafeAreaView,   // Ensures content is not hidden by phone notches/bars
} from "react-native";

// Import navigation tool from Expo Router
import { router } from "expo-router";

// Define and export the main WorkoutScreen component
export default function WorkoutScreen() {
  // Return the UI that will be displayed
  return (
    // SafeAreaView: Ensures content stays within safe screen boundaries
    <SafeAreaView style={styles.safeArea}>
      {/* ScrollView: Allows vertical scrolling if content exceeds screen height */}
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* Header section at top */}
        <View style={styles.header}>
          {/* Main title text */}
          <Text style={styles.title}>Workouts</Text>
          {/* Subtitle text */}
          <Text style={styles.subtitle}>
            Choose a workout and start training 💪
          </Text>
        </View>

        {/* Horizontal scrollable categories section */}
        <ScrollView 
          horizontal  // Makes scrolling horizontal instead of vertical
          showsHorizontalScrollIndicator={false}  // Hides scroll bar
        >
          {/* Container for category chips */}
          <View style={styles.categories}>
            {/* Map through category names and create a chip for each */}
            {["Beginner", "Strength", "Cardio", "HIIT", "Yoga"].map(
              // cat = category name, index = position in array
              (cat, index) => (
                // Each category chip container
                <View key={index} style={styles.categoryChip}>
                  {/* Category name text */}
                  <Text style={styles.categoryText}>{cat}</Text>
                </View>
              )
            )}
          </View>
        </ScrollView>

        {/* First workout card */}
        <View style={styles.workoutCard}>
          {/* Workout title */}
          <Text style={styles.workoutTitle}>Full Body Workout</Text>
          {/* Workout details with emojis */}
          <Text style={styles.workoutInfo}>⏱ 45 min • 🔥 350 kcal</Text>

          {/* Start Workout button */}
          <TouchableOpacity
            style={styles.startButton}
            // Navigate to workoutDetail screen when pressed
            onPress={() => router.push("/workoutDetail")}
          >
            {/* Button text */}
            <Text style={styles.startButtonText}>Start Workout</Text>
          </TouchableOpacity>
        </View>

        {/* Second workout card */}
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

        {/* Third workout card */}
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

// Create and define all styles for components
const styles = StyleSheet.create({
  // SafeAreaView styles - ensures content is not hidden by phone UI
  safeArea: {
    flex: 1,                    // Take up all available screen space
    backgroundColor: "#f5efe6", // Light cream background color
  },
  
  // Main container inside ScrollView
  container: {
    padding: 24,                // Internal padding on all sides: 24 pixels
    paddingBottom: 40,          // Extra bottom padding: 40 pixels
  },
  
  // Header section styles
  header: {
    marginBottom: 30,           // Space below header: 30 pixels
  },
  
  // Main title text styles
  title: {
    fontSize: 34,               // Extra large text size (34 pixels)
    fontWeight: "800",          // Extra bold font weight
    color: "#4a3b31",           // Dark brown text color
  },
  
  // Subtitle text styles
  subtitle: {
    fontSize: 15,               // Medium text size
    color: "#7a6659",           // Medium brown text color
    marginTop: 4,               // Small space above: 4 pixels
  },
  
  // Horizontal categories container styles
  categories: {
    flexDirection: "row",       // Arrange children in a row (horizontal)
    marginBottom: 24,           // Space below categories: 24 pixels
  },
  
  // Individual category chip styles
  categoryChip: {
    backgroundColor: "#efe6d8", // Light tan background
    paddingHorizontal: 18,      // Left/right padding: 18 pixels
    paddingVertical: 10,        // Top/bottom padding: 10 pixels
    borderRadius: 20,           // Rounded corners: 20 pixel radius
    marginRight: 12,            // Space right of each chip: 12 pixels
    elevation: 2,               // Shadow depth on Android
  },
  
  // Category text styles
  categoryText: {
    color: "#4a3b31",           // Dark brown text color
    fontWeight: "600",          // Semi-bold font weight
  },
  
  // Workout card styles
  workoutCard: {
    backgroundColor: "#efe6d8", // Light tan background
    borderRadius: 24,           // Rounded corners: 24 pixel radius
    padding: 22,                // Internal padding: 22 pixels on all sides
    marginBottom: 20,           // Space below card: 20 pixels
    elevation: 4,               // Deeper shadow than category chips
  },
  
  // Workout title text styles
  workoutTitle: {
    fontSize: 20,               // Large text size
    fontWeight: "700",          // Bold font weight
    color: "#4a3b31",           // Dark brown text color
    marginBottom: 6,            // Space below title: 6 pixels
  },
  
  // Workout info text styles
  workoutInfo: {
    fontSize: 14,               // Small text size
    color: "#7a6659",           // Medium brown text color
    marginBottom: 16,           // Space below info: 16 pixels
  },
  
  // Start Workout button styles
  startButton: {
    backgroundColor: "#5b4334", // Dark brown background
    paddingVertical: 14,        // Top/bottom padding: 14 pixels
    borderRadius: 24,           // Rounded corners: 24 pixel radius
    alignItems: "center",       // Center button content horizontally
  },
  
  // Start Workout button text styles
  startButtonText: {
    color: "#fff",              // White text color
    fontSize: 16,               // Medium text size
    fontWeight: "600",          // Semi-bold font weight
  },
});