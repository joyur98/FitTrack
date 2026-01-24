import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
  Easing,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { auth, db } from "./firebaseConfig";
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, getDocs, doc, getDoc } from "firebase/firestore";
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

// CardioBlast Workout Plan
const workouts = [
  { 
    title: "Jumping Jacks", 
    desc: "5 minutes • Warm-up • Full body activation",
    emoji: "🤸",
    calories: 28
  },
  { 
    title: "High Knees", 
    desc: "3 minutes • Cardio finisher",
    emoji: "🏃",
    calories: 25
  },
  { 
    title: "Mountain Climbers", 
    desc: "3 sets × 1 minute • Core & cardio burn",
    emoji: "⛰️",
    calories: 30
  },
  { 
    title: "Burpees", 
    desc: "3 sets × 12 reps • Full body high intensity",
    emoji: "💥",
    calories: 35
  },
  { 
    title: "Butt Kicks", 
    desc: "3 minutes • Lower body cardio",
    emoji: "👟",
    calories: 20
  },
  { 
    title: "Skater Jumps", 
    desc: "3 sets × 15 reps per side • Legs & cardio",
    emoji: "⛸️",
    calories: 32
  },
  { 
    title: "Plank Jacks", 
    desc: "3 sets × 1 minute • Core & cardio burn",
    emoji: "🧍",
    calories: 28
  },
  { 
    title: "Jump Rope", 
    desc: "5 minutes • Cardio endurance",
    emoji: "🔄",
    calories: 40
  },
  { 
    title: "Sprint in Place", 
    desc: "2 minutes • High-intensity cardio",
    emoji: "⚡",
    calories: 22
  },
  { 
    title: "Stretch & Cool Down", 
    desc: "5 minutes • Recovery & flexibility",
    emoji: "🧘",
    calories: 20
  },
];

// Create a separate component for workout items
const WorkoutItem = React.memo(({ 
  workout, 
  index, 
  isCompleted, 
  onToggleComplete,
  currentTheme,
  isDarkMode,
  isThemeLoading
}) => {
  const itemAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isThemeLoading) return;
    
    Animated.spring(itemAnim, {
      toValue: 1,
      delay: index * 100,
      useNativeDriver: true,
    }).start();
  }, [isThemeLoading]);

  return (
    <Animated.View
      style={[
        styles.workoutCard,
        {
          opacity: itemAnim,
          backgroundColor: currentTheme.surfaceColor,
          shadowColor: currentTheme.shadowColor,
          transform: [
            { translateY: itemAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [20, 0]
            })}
          ]
        }
      ]}
      key={index}
    >
      <TouchableOpacity
        style={styles.workoutCardContent}
        onPress={onToggleComplete}
        activeOpacity={0.7}
      >
        <View style={[styles.workoutEmojiContainer, { backgroundColor: currentTheme.emojiBg }]}>
          <Text style={styles.workoutEmoji}>{workout.emoji}</Text>
        </View>
        
        <View style={styles.workoutInfo}>
          <View style={styles.workoutHeader}>
            <Text style={[
              styles.workoutTitle,
              { color: currentTheme.primaryText },
              isCompleted && styles.workoutTitleCompleted
            ]}>
              {workout.title}
            </Text>
            <View style={[
              styles.calorieBadge, 
              { backgroundColor: currentTheme.calorieBadge },
              isCompleted && { backgroundColor: currentTheme.calorieBadgeCompleted }
            ]}>
              <Text style={[styles.calorieText, { color: currentTheme.accentColor }]}>
                {workout.calories} cal
              </Text>
            </View>
          </View>
          
          <Text style={[styles.workoutDesc, { color: currentTheme.secondaryText }]}>
            {workout.desc}
          </Text>
          
          <View style={styles.workoutFooter}>
            <View style={styles.checkboxContainer}>
              <View style={[
                styles.checkbox,
                { borderColor: currentTheme.checkboxBorder },
                isCompleted && styles.checkboxChecked
              ]}>
                {isCompleted && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
              <Text style={[
                styles.checkboxLabel,
                { color: currentTheme.secondaryText },
                isCompleted && styles.checkboxLabelCompleted
              ]}>
                {isCompleted ? "Completed" : "Mark as done"}
              </Text>
            </View>
            
            <Text style={[styles.exerciseNumber, { color: currentTheme.secondaryText }]}>
              #{index + 1}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

export default function CardioBlastScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [completedWorkouts, setCompletedWorkouts] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isThemeLoading, setIsThemeLoading] = useState(true);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Total calories calculation
  const totalCalories = workouts.reduce((sum, workout) => sum + workout.calories, 0);
  const progress = completedWorkouts.length / workouts.length;

  // Theme colors
  const theme = {
    light: {
      backgroundColor: "#f5efe6",
      surfaceColor: "#fff",
      cardColor: "#fff",
      primaryText: "#4a3b31",
      secondaryText: "#7a6659",
      accentColor: "#C4935D",
      secondaryAccent: "#5b4334",
      borderColor: "#e8d9c5",
      shadowColor: "#3b2a23",
      progressBarBg: "#f0e6d6",
      progressFill: "#C4935D",
      emojiBg: "#f8f3eb",
      calorieBadge: "#f8f3eb",
      calorieBadgeCompleted: "#e8f5e8",
      checkboxBorder: "#e0d5c3",
      successColor: "#4CAF50",
      statValue: "#4a3b31",
      statLabel: "#7a6659",
    },
    dark: {
      backgroundColor: "#121212",
      surfaceColor: "#1e1e1e",
      cardColor: "#2d2d2d",
      primaryText: "#ffffff",
      secondaryText: "#a0a0a0",
      accentColor: "#C4935D",
      secondaryAccent: "#8b7355",
      borderColor: "#333",
      shadowColor: "#000",
      progressBarBg: "#2d2d2d",
      progressFill: "#C4935D",
      emojiBg: "#2d2d2d",
      calorieBadge: "#3b2a23",
      calorieBadgeCompleted: "#1b5e20",
      checkboxBorder: "#444",
      successColor: "#4CAF50",
      statValue: "#ffffff",
      statLabel: "#a0a0a0",
    }
  };

  const currentTheme = isDarkMode ? theme.dark : theme.light;

  // ===== FIXED: Fetch dark mode preference from Firestore =====
  useEffect(() => {
    const fetchDarkMode = async () => {
      const user = auth.currentUser;
      if (!user) {
        console.log("No user found, using light mode as default");
        setIsDarkMode(false);
        setIsThemeLoading(false);
        return;
      }

      const userId = user.uid;
      console.log("Fetching dark mode for user ID:", userId);

      try {
        // Method 1: Direct document access using userId as document ID
        const userDocRef = doc(db, "users", userId);
        const docSnap = await getDoc(userDocRef);
        
        if (docSnap.exists()) {
          const userData = docSnap.data();
          console.log("Found user document with ID method:", userData);
          
          // Check for darkMode field (case-insensitive)
          const darkModeValue = 
            userData.darkMode !== undefined ? userData.darkMode :
            userData.darkmode !== undefined ? userData.darkmode :
            userData.dark !== undefined ? userData.dark :
            false;
          
          console.log("Setting dark mode to:", darkModeValue);
          setIsDarkMode(darkModeValue);
        } else {
          // Method 2: Query by userID field
          console.log("Trying query method...");
          const usersRef = collection(db, "users");
          const q = query(usersRef, where("userID", "==", userId));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();
            console.log("Found user data with query method:", userData);
            
            const darkModeValue = 
              userData.darkMode !== undefined ? userData.darkMode :
              userData.darkmode !== undefined ? userData.darkmode :
              userData.dark !== undefined ? userData.dark :
              false;
            
            console.log("Setting dark mode to:", darkModeValue);
            setIsDarkMode(darkModeValue);
          } else {
            console.log("No user document found, using light mode as default");
            setIsDarkMode(false);
          }
        }
      } catch (error) {
        console.error("Error fetching dark mode:", error);
        setIsDarkMode(false);
      } finally {
        setIsThemeLoading(false);
      }
    };

    fetchDarkMode();

    // Set up real-time listener
    const user = auth.currentUser;
    if (!user) return;

    const userId = user.uid;
    
    // Try direct document listener first
    const userDocRef = doc(db, "users", userId);
    
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      console.log("Dark mode real-time update (direct doc)");
      
      if (docSnap.exists()) {
        const userData = docSnap.data();
        console.log("Real-time update data:", userData);
        
        // Check for darkMode field
        if (userData.darkMode !== undefined) {
          console.log("Real-time dark mode update:", userData.darkMode);
          setIsDarkMode(userData.darkMode);
        } else if (userData.darkmode !== undefined) {
          console.log("Real-time dark mode update (lowercase):", userData.darkmode);
          setIsDarkMode(userData.darkmode);
        }
      } else {
        // Fallback to query listener
        console.log("Direct doc not found, trying query listener...");
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("userID", "==", userId));
        
        const queryUnsubscribe = onSnapshot(q, (querySnapshot) => {
          console.log("Dark mode real-time update (query)");
          
          if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();
            
            if (userData.darkMode !== undefined) {
              console.log("Real-time dark mode update from query:", userData.darkMode);
              setIsDarkMode(userData.darkMode);
            } else if (userData.darkmode !== undefined) {
              console.log("Real-time dark mode update from query (lowercase):", userData.darkmode);
              setIsDarkMode(userData.darkmode);
            }
          }
        }, (error) => {
          console.error("Error in query listener:", error);
        });
        
        return () => {
          if (queryUnsubscribe) queryUnsubscribe();
        };
      }
    }, (error) => {
      console.error("Error in direct doc listener:", error);
    });

    // Cleanup listener
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Don't start animations until theme is loaded
  useEffect(() => {
    if (isThemeLoading) return;
    
    // Entry animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for complete button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [isThemeLoading]);

  useEffect(() => {
    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const handleCompleteWorkout = async () => {
    if (isLoading) return;

    // Button press animation
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      setIsLoading(true);
      const user = auth.currentUser;

      if (!user) {
        Alert.alert("Error", "Please login to save workout");
        return;
      }

      await addDoc(collection(db, "calorie_burn"), {
        calorie: totalCalories,
        date: serverTimestamp(),
        userID: user.uid,
        workoutName: "CardioBlast",
        workoutType: "cardio",
        duration: 30,
        exercises: workouts.length,
      });

      // Mark all workouts as completed
      setCompletedWorkouts(workouts.map((_, index) => index));
      
      // Success animation
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();

      Alert.alert(
        "🎉 Workout Completed!",
        `You've burned ${totalCalories} calories!\n\nGreat job completing CardioBlast!`,
        [
          {
            text: "View Progress",
            onPress: () => router.push('/progress'),
          },
          {
            text: "Continue",
            style: "default",
          },
        ]
      );
    } catch (error) {
      console.error("Error saving workout:", error);
      Alert.alert(
        "Error",
        "Failed to save workout. Please try again.",
        [{ text: "OK", style: "default" }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleWorkoutComplete = (index) => {
    if (completedWorkouts.includes(index)) {
      setCompletedWorkouts(completedWorkouts.filter(i => i !== index));
    } else {
      setCompletedWorkouts([...completedWorkouts, index]);
    }
  };

  // Show loading screen while fetching theme
  if (isThemeLoading) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: theme.light.backgroundColor }]}>
        <ActivityIndicator size="large" color="#C4935D" />
        <Text style={[styles.loadingText, { color: theme.light.primaryText }]}>
          Loading workout...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.backgroundColor }]}>
      <Animated.ScrollView 
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Back Button */}
        <Animated.View 
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <TouchableOpacity 
            style={[styles.backButton, { backgroundColor: currentTheme.surfaceColor }]}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={[styles.backArrow, { color: currentTheme.primaryText }]}>←</Text>
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={[styles.title, { color: currentTheme.primaryText }]}>CardioBlast</Text>
            <Text style={[styles.subtitle, { color: currentTheme.secondaryText }]}>
              High-Intensity Cardio Workout
            </Text>
          </View>
          
          {/* Theme indicator */}
          <View style={styles.themeIndicator}>
            <Text style={[styles.themeIcon, { color: currentTheme.secondaryText }]}>
              {isDarkMode ? "🌙" : "☀️"}
            </Text>
          </View>
        </Animated.View>

        {/* Progress Bar */}
        <Animated.View 
          style={[
            styles.progressContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              backgroundColor: currentTheme.surfaceColor,
              shadowColor: currentTheme.shadowColor,
            }
          ]}
        >
          <View style={styles.progressHeader}>
            <Text style={[styles.progressTitle, { color: currentTheme.primaryText }]}>
              Workout Progress
            </Text>
            <Text style={[styles.progressCount, { color: currentTheme.accentColor }]}>
              {completedWorkouts.length}/{workouts.length} exercises
            </Text>
          </View>
          
          <View style={[styles.progressBar, { backgroundColor: currentTheme.progressBarBg }]}>
            <Animated.View 
              style={[
                styles.progressFill,
                {
                  backgroundColor: currentTheme.progressFill,
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%']
                  })
                }
              ]}
            />
          </View>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: currentTheme.statValue }]}>30</Text>
              <Text style={[styles.statLabel, { color: currentTheme.statLabel }]}>minutes</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: currentTheme.borderColor }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: currentTheme.statValue }]}>{totalCalories}</Text>
              <Text style={[styles.statLabel, { color: currentTheme.statLabel }]}>calories</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: currentTheme.borderColor }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: currentTheme.statValue }]}>{workouts.length}</Text>
              <Text style={[styles.statLabel, { color: currentTheme.statLabel }]}>exercises</Text>
            </View>
          </View>
        </Animated.View>

        {/* Workout Exercises */}
        <Animated.View 
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={[styles.sectionTitle, { color: currentTheme.primaryText }]}>
            Workout Exercises
          </Text>
          <Text style={[styles.sectionSubtitle, { color: currentTheme.secondaryText }]}>
            Tap each exercise to mark as completed
          </Text>
          
          {workouts.map((workout, index) => (
            <WorkoutItem
              key={index}
              workout={workout}
              index={index}
              isCompleted={completedWorkouts.includes(index)}
              onToggleComplete={() => toggleWorkoutComplete(index)}
              currentTheme={currentTheme}
              isDarkMode={isDarkMode}
              isThemeLoading={isThemeLoading}
            />
          ))}
        </Animated.View>

        {/* Complete Workout Button */}
        <Animated.View 
          style={[
            styles.buttonContainer,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: pulseAnim }
              ]
            }
          ]}
        >
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity
              style={[
                styles.completeButton,
                { backgroundColor: currentTheme.accentColor, shadowColor: currentTheme.shadowColor },
                completedWorkouts.length === workouts.length && { backgroundColor: currentTheme.successColor }
              ]}
              onPress={handleCompleteWorkout}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Text style={styles.completeButtonText}>
                    {completedWorkouts.length === workouts.length 
                      ? "🎉 Workout Completed!" 
                      : "Complete Workout"}
                  </Text>
                  <Text style={styles.completeButtonSubtext}>
                    Log {totalCalories} calories burned
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </Animated.View>
          
          {completedWorkouts.length > 0 && completedWorkouts.length < workouts.length && (
            <Text style={[styles.progressHint, { color: currentTheme.secondaryText }]}>
              {workouts.length - completedWorkouts.length} exercises remaining
            </Text>
          )}
        </Animated.View>

        {/* Bottom Spacer */}
        <View style={styles.spacer} />
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: 20,
    paddingTop: 10,
  },
  
  // Loading screen
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: "500",
  },
  
  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backArrow: {
    fontSize: 24,
    fontWeight: "700",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
    textAlign: "center",
  },
  themeIndicator: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  themeIcon: {
    fontSize: 20,
  },
  
  // Progress Section
  progressContainer: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  progressCount: {
    fontSize: 14,
    fontWeight: "600",
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 20,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: "500",
  },
  statDivider: {
    width: 1,
    height: 30,
  },
  
  // Workout Section
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  
  // Workout Cards
  workoutCard: {
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    overflow: "hidden",
  },
  workoutCardContent: {
    flexDirection: "row",
    padding: 16,
  },
  workoutEmojiContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  workoutEmoji: {
    fontSize: 24,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  workoutTitle: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    marginRight: 10,
  },
  workoutTitleCompleted: {
    textDecorationLine: "line-through",
  },
  calorieBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  calorieText: {
    fontSize: 12,
    fontWeight: "600",
  },
  workoutDesc: {
    fontSize: 13,
    marginBottom: 12,
    lineHeight: 18,
  },
  workoutFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#C4935D",
    borderColor: "#C4935D",
  },
  checkmark: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  checkboxLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  checkboxLabelCompleted: {
    color: "#C4935D",
    fontWeight: "600",
  },
  exerciseNumber: {
    fontSize: 12,
    fontWeight: "500",
  },
  
  // Complete Button
  buttonContainer: {
    marginBottom: 20,
  },
  completeButton: {
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    elevation: 3,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  completeButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  completeButtonSubtext: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: 14,
    fontWeight: "500",
  },
  progressHint: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 12,
    fontWeight: "500",
  },
  
  // Spacer
  spacer: {
    height: 30,
  },
});