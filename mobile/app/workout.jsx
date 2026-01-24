// workout.jsx - ENHANCED WITH ANIMATIONS & DARK MODE (TABS REMOVED)
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { auth } from "./firebaseConfig";
import { db } from "./firebaseConfig";
import { doc, getDoc, onSnapshot } from "firebase/firestore";

const { width } = Dimensions.get('window');

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
    route: "/mentalFitness",
    emoji: "🧠",
    type: "mental",
    color: "#9b59b6",
    description: "Meditation, breathing & mood tracking"
  },
];

export default function WorkoutScreen() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [scaleAnim] = useState(new Animated.Value(0.9));
  const [headerSlide] = useState(new Animated.Value(30));
  
  // Use refs for card animations
  const cardAnimations = useRef([]);
  const user = auth.currentUser;

  // Initialize card animations
  useEffect(() => {
    cardAnimations.current = workouts.map(() => ({
      slide: new Animated.Value(30),
      fade: new Animated.Value(0),
      scale: new Animated.Value(0.9),
    }));
  }, []);

  // Fetch dark mode and animate on mount
  useEffect(() => {
    if (!user) return;

    const fetchDarkMode = async () => {
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setIsDarkMode(userData.darkMode || false);
        }
      } catch (error) {
        console.error("Error fetching dark mode:", error);
      }
    };

    fetchDarkMode();

    // Real-time listener for dark mode
    const userDocRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setIsDarkMode(data.darkMode || false);
      }
    });

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
      Animated.timing(headerSlide, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    return () => unsubscribe();
  }, []);

  // Animate cards when they appear
  useEffect(() => {
    cardAnimations.current.forEach((anim, index) => {
      Animated.sequence([
        Animated.delay(index * 100),
        Animated.parallel([
          Animated.timing(anim.fade, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(anim.slide, {
            toValue: 0,
            duration: 400,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.spring(anim.scale, {
            toValue: 1,
            friction: 8,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    });
  }, []);

  // Theme styles
  const theme = {
    backgroundColor: isDarkMode ? "#121212" : "#f8f5f0",
    cardBackground: isDarkMode ? "#1e1e1e" : "#fff",
    textColor: isDarkMode ? "#ffffff" : "#4a3b31",
    secondaryText: isDarkMode ? "#a0a0a0" : "#7a6659",
    borderColor: isDarkMode ? "#333" : "#eee",
    primaryColor: "#C4935D",
    secondaryColor: isDarkMode ? "#2d2d2d" : "#4a3b31",
    inputBackground: isDarkMode ? "#2d2d2d" : "#f8f5f0",
  };

  const physicalWorkouts = workouts.filter(w => w.type === "physical");
  const mentalWorkouts = workouts.filter(w => w.type === "mental");

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.backgroundColor }]}>
      <Animated.ScrollView 
        style={[styles.container, { opacity: fadeAnim }]} 
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View 
          style={[
            styles.header,
            { 
              transform: [{ translateY: headerSlide }],
              opacity: fadeAnim 
            }
          ]}
        >
          <TouchableOpacity 
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Text style={[styles.backArrow, { color: theme.textColor }]}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={[styles.title, { color: theme.textColor }]}>
              Workouts & Wellness
            </Text>
            <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
              Train your body and mind 💪🧠
            </Text>
          </View>
          <View style={styles.headerPlaceholder} />
        </Animated.View>

        {/* Stats Card */}
        <Animated.View 
          style={[
            styles.statsCard,
            { 
              backgroundColor: theme.secondaryColor,
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim
            }
          ]}
        >
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{physicalWorkouts.length}</Text>
              <Text style={styles.statLabel}>Workouts</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{mentalWorkouts.length}</Text>
              <Text style={styles.statLabel}>Mental</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {workouts.reduce((sum, w) => sum + (w.calories || 0), 0)}
              </Text>
              <Text style={styles.statLabel}>Total kcal</Text>
            </View>
          </View>
        </Animated.View>

        {/* Tutorial Button */}
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
            opacity: fadeAnim
          }}
        >
          <TouchableOpacity
            style={[styles.tutorialButton, { backgroundColor: theme.primaryColor }]}
            onPress={() => router.push("/tutorials")}
            activeOpacity={0.8}
          >
            <Text style={styles.tutorialButtonText}>
              📺 Watch Tutorials & Learn
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Physical Workouts Section - ALWAYS SHOWN */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
            💪 Physical Workouts
          </Text>
          <Text style={[styles.sectionCount, { color: theme.secondaryText }]}>
            {physicalWorkouts.length} workouts
          </Text>
        </View>
        
        {physicalWorkouts.map((workout, index) => {
          const anim = cardAnimations.current[index] || { 
            slide: new Animated.Value(0), 
            fade: new Animated.Value(1),
            scale: new Animated.Value(1)
          };
          
          return (
            <Animated.View 
              key={index} 
              style={{
                opacity: anim.fade,
                transform: [
                  { translateY: anim.slide },
                  { scale: anim.scale }
                ]
              }}
            >
              <View 
                style={[
                  styles.workoutCard,
                  { 
                    backgroundColor: theme.cardBackground,
                    borderColor: theme.borderColor,
                  }
                ]}
              >
                <View style={styles.workoutHeader}>
                  <View style={styles.workoutTitleRow}>
                    <View style={[styles.emojiCircle, { backgroundColor: theme.inputBackground }]}>
                      <Text style={styles.workoutEmoji}>{workout.emoji}</Text>
                    </View>
                    <View style={styles.workoutTitleContent}>
                      <Text style={[styles.workoutTitle, { color: theme.textColor }]}>
                        {workout.title}
                      </Text>
                      <View style={styles.workoutMetaRow}>
                        <Text style={[styles.workoutMeta, { color: theme.secondaryText }]}>
                          ⏱ {workout.duration}
                        </Text>
                        <Text style={[styles.metaDivider, { color: theme.secondaryText }]}>•</Text>
                        <Text style={[styles.workoutMeta, { color: theme.secondaryText }]}>
                          🔥 {workout.calories} kcal
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.startButton, { backgroundColor: theme.primaryColor }]}
                  onPress={() => router.push(workout.route)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.startButtonText}>Start Workout →</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          );
        })}

        {/* Mental Wellness Section - ALWAYS SHOWN */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
            🧠 Mental Wellness
          </Text>
          <Text style={[styles.sectionCount, { color: theme.secondaryText }]}>
            {mentalWorkouts.length} activity
          </Text>
        </View>
        
        {mentalWorkouts.map((workout, index) => {
          const animIndex = workouts.findIndex(w => w === workout);
          const anim = cardAnimations.current[animIndex] || { 
            slide: new Animated.Value(0), 
            fade: new Animated.Value(1),
            scale: new Animated.Value(1)
          };
          
          return (
            <Animated.View 
              key={index}
              style={{
                opacity: anim.fade,
                transform: [
                  { translateY: anim.slide },
                  { scale: anim.scale }
                ]
              }}
            >
              <View 
                style={[
                  styles.mentalCard,
                  { 
                    backgroundColor: theme.cardBackground,
                    borderColor: theme.borderColor,
                  }
                ]}
              >
                <View style={styles.mentalHeader}>
                  <View style={styles.mentalTitleRow}>
                    <View style={[styles.mentalEmojiCircle, { backgroundColor: theme.inputBackground }]}>
                      <Text style={styles.mentalEmoji}>{workout.emoji}</Text>
                    </View>
                    <View style={styles.mentalTitleContent}>
                      <Text style={[styles.mentalTitle, { color: theme.textColor }]}>
                        {workout.title}
                      </Text>
                      <Text style={[styles.mentalDescription, { color: theme.secondaryText }]}>
                        {workout.description}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.durationBadge, { backgroundColor: theme.inputBackground }]}>
                    <Text style={[styles.durationText, { color: theme.secondaryText }]}>
                      ⏱ {workout.duration}
                    </Text>
                  </View>
                </View>

                <View style={[styles.mentalBenefits, { backgroundColor: theme.inputBackground }]}>
                  <View style={styles.benefitItem}>
                    <Text style={styles.benefitEmoji}>😌</Text>
                    <Text style={[styles.benefitText, { color: theme.textColor }]}>
                      Stress Relief
                    </Text>
                  </View>
                  <View style={[styles.benefitDivider, { backgroundColor: theme.borderColor }]} />
                  <View style={styles.benefitItem}>
                    <Text style={styles.benefitEmoji}>🎯</Text>
                    <Text style={[styles.benefitText, { color: theme.textColor }]}>
                      Focus
                    </Text>
                  </View>
                  <View style={[styles.benefitDivider, { backgroundColor: theme.borderColor }]} />
                  <View style={styles.benefitItem}>
                    <Text style={styles.benefitEmoji}>⚡</Text>
                    <Text style={[styles.benefitText, { color: theme.textColor }]}>
                      Energy
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.startButton, { backgroundColor: theme.primaryColor }]}
                  onPress={() => router.push(workout.route)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.startButtonText}>Start Mental Fitness →</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          );
        })}

        {/* Quick Tips */}
        <Animated.View 
          style={[
            styles.tipsCard,
            { 
              backgroundColor: theme.cardBackground,
              borderLeftColor: theme.primaryColor,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={[styles.tipsTitle, { color: theme.textColor }]}>💡 Wellness Tip</Text>
          <Text style={[styles.tipsText, { color: theme.secondaryText }]}>
            Balance physical workouts with mental exercises for complete wellbeing. 
            Try 20 minutes of meditation after your workout for best results.
          </Text>
        </Animated.View>

        {/* ===== DEBUG SECTION ===== */}
        <View style={[styles.debugSection, { 
          backgroundColor: theme.cardBackground,
          borderColor: theme.borderColor 
        }]}>
          <Text style={[styles.debugTitle, { color: theme.textColor }]}>🔧 Debug Navigation Test</Text>
          
          <TouchableOpacity
            style={[styles.debugButton, {backgroundColor: '#FF6B6B'}]}
            onPress={() => {
              console.log("🧪 DEBUG: Testing /mentalFitness route");
              console.log("📁 File should be: app/mentalFitness.jsx");
              router.push("/mentalFitness");
            }}
          >
            <Text style={styles.debugButtonText}>Test Mental Fitness Route</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.debugButton, {backgroundColor: '#4ECDC4'}]}
            onPress={() => router.push("/fullbodyworkout")}
          >
            <Text style={styles.debugButtonText}>Test FullBody Route (Control Test)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.debugButton, {backgroundColor: '#FFD93D'}]}
            onPress={() => router.push("/cardioblast")}
          >
            <Text style={styles.debugButtonText}>Test CardioBlast Route</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.debugButton, {backgroundColor: '#9B59B6'}]}
            onPress={() => {
              console.log("📊 ROUTES INFO:");
              console.log("- mentalFitness.jsx exists: ✓");
              console.log("- Route: /mentalFitness");
              console.log("- In layout: check _layout.jsx");
            }}
          >
            <Text style={styles.debugButtonText}>Check Route Info (Console)</Text>
          </TouchableOpacity>
        </View>
        {/* ===== END DEBUG SECTION ===== */}

      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1,
  },
  container: { 
    flex: 1,
    padding: 16,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  backArrow: {
    fontSize: 28,
    fontWeight: "700",
  },
  headerContent: {
    flex: 1,
    alignItems: "center",
  },
  title: { 
    fontSize: 24, 
    fontWeight: "800",
    marginBottom: 4,
  },
  subtitle: { 
    fontSize: 14,
  },
  headerPlaceholder: {
    width: 40,
  },

  statsCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "900",
    color: "#C4935D",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#d4c4a8",
    fontWeight: "600",
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },

  tutorialButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  tutorialButtonText: { 
    color: "#fff", 
    fontSize: 16, 
    fontWeight: "700",
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: "600",
  },

  workoutCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
  },
  workoutHeader: {
    marginBottom: 16,
  },
  workoutTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  emojiCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  workoutEmoji: {
    fontSize: 28,
  },
  workoutTitleContent: {
    flex: 1,
  },
  workoutTitle: { 
    fontSize: 18, 
    fontWeight: "700",
    marginBottom: 6,
  },
  workoutMetaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  workoutMeta: { 
    fontSize: 13,
    fontWeight: "600",
  },
  metaDivider: {
    marginHorizontal: 8,
    color: "#888",
  },

  mentalCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
  },
  mentalHeader: {
    marginBottom: 16,
  },
  mentalTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  mentalEmojiCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  mentalEmoji: {
    fontSize: 32,
  },
  mentalTitleContent: {
    flex: 1,
  },
  mentalTitle: { 
    fontSize: 20, 
    fontWeight: "700",
    marginBottom: 4,
  },
  mentalDescription: { 
    fontSize: 13,
    fontWeight: "500",
  },
  durationBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  durationText: {
    fontSize: 13,
    fontWeight: "700",
  },

  mentalBenefits: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
  },
  benefitItem: {
    alignItems: "center",
    flex: 1,
  },
  benefitDivider: {
    width: 1,
  },
  benefitEmoji: {
    fontSize: 24,
    marginBottom: 6,
  },
  benefitText: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },

  startButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  startButtonText: { 
    color: "#fff", 
    fontSize: 16, 
    fontWeight: "700",
  },

  tipsCard: {
    borderRadius: 16,
    padding: 20,
    marginTop: 10,
    marginBottom: 40,
    borderLeftWidth: 4,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
  tipsText: {
    fontSize: 14,
    lineHeight: 22,
  },

  // Debug Section Styles
  debugSection: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
    borderWidth: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },
  debugButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  debugButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});