import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  SafeAreaView,
  Animated,
  Easing,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { auth, db } from "./firebaseConfig";
import { doc, getDoc, onSnapshot } from "firebase/firestore";

const { width } = Dimensions.get('window');

// Tutorial categories with YouTube URLs
const tutorialCategories = [
  {
    title: "🏋️ Gym Workouts",
    icon: "🏋️",
    color: "#C4935D",
    videos: [
      {
        title: "Bench Press",
        desc: "Master proper chest press technique for maximum gains",
        url: "https://www.youtube.com/watch?v=U0bhE67HuDY",
        duration: "8:22",
        difficulty: "Beginner",
        views: "2.3M views"
      },
      {
        title: "Barbell Squats",
        desc: "Perfect your squat form for optimal leg development",
        url: "https://www.youtube.com/watch?v=1ZXobu7JvvE",
        duration: "10:15",
        difficulty: "Intermediate",
        views: "1.8M views"
      },
      {
        title: "Deadlift",
        desc: "Learn safe deadlift technique to avoid injury",
        url: "https://www.youtube.com/watch?v=4AObAU-EcYE",
        duration: "12:45",
        difficulty: "Advanced",
        views: "3.1M views"
      },
    ]
  },
  {
    title: "🏃 Cardio",
    icon: "🏃",
    color: "#4CAF50",
    videos: [
      {
        title: "HIIT Workout",
        desc: "High intensity cardio for maximum fat burn",
        url: "https://www.youtube.com/watch?v=ml6cT4AZdqI",
        duration: "25:30",
        difficulty: "Intermediate",
        views: "1.5M views"
      },
      {
        title: "Jump Rope",
        desc: "Full cardio workout with just a rope",
        url: "https://www.youtube.com/watch?v=5bL3bMk-wR0",
        duration: "18:45",
        difficulty: "Beginner",
        views: "890K views"
      },
    ]
  },
  {
    title: "🧘 Yoga",
    icon: "🧘",
    color: "#2196F3",
    videos: [
      {
        title: "Morning Yoga",
        desc: "15-minute flow to energize your day",
        url: "https://www.youtube.com/watch?v=4pKly2JojMw",
        duration: "15:00",
        difficulty: "Beginner",
        views: "3.7M views"
      },
      {
        title: "Back Pain Yoga",
        desc: "Gentle stretches to relieve stiffness and pain",
        url: "https://www.youtube.com/watch?v=4C-gxOE0j7s",
        duration: "20:15",
        difficulty: "Beginner",
        views: "2.1M views"
      },
    ]
  },
  {
    title: "🤸 Stretching",
    icon: "🤸",
    color: "#9C27B0",
    videos: [
      {
        title: "Full Body Stretch",
        desc: "10-minute routine for total body flexibility",
        url: "https://www.youtube.com/watch?v=g_tea8ZNk5A",
        duration: "10:30",
        difficulty: "Beginner",
        views: "4.2M views"
      },
      {
        title: "Leg Stretching",
        desc: "Increase flexibility and prevent injuries",
        url: "https://www.youtube.com/watch?v=Ef6L3hY9XEM",
        duration: "12:45",
        difficulty: "Intermediate",
        views: "1.9M views"
      },
    ]
  },
  {
    title: "🩺 Kegel Exercises",
    icon: "🩺",
    color: "#FF9800",
    videos: [
      {
        title: "Kegel Basics",
        desc: "Pelvic floor strengthening for beginners",
        url: "https://www.youtube.com/watch?v=7Z3Z8cSfqEw",
        duration: "7:20",
        difficulty: "Beginner",
        views: "1.2M views"
      },
      {
        title: "Advanced Kegels",
        desc: "Improve control and strength",
        url: "https://www.youtube.com/watch?v=Kp1Q5YpFqCM",
        duration: "14:30",
        difficulty: "Advanced",
        views: "850K views"
      },
    ]
  },
];

export default function Tutorial() {
  const [loadingVideo, setLoadingVideo] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Added loading state
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const sectionAnims = useRef(
    tutorialCategories.map(() => ({
      slide: new Animated.Value(30),
      fade: new Animated.Value(0),
    }))
  ).current; // Initialize immediately

  // Theme colors
  const theme = {
    light: {
      backgroundColor: "#f5efe6",
      surfaceColor: "#fff",
      primaryText: "#4a3b31",
      secondaryText: "#7a6659",
      accentColor: "#C4935D",
      borderColor: "#e8d9c5",
      shadowColor: "#3b2a23",
      cardBackground: "#fff",
      sectionHeaderBg: "#efe6d8",
      statDivider: "#e8d9c5",
      successColor: "#4CAF50",
      instructionBg: "#f8f3eb",
      footerBg: "#f8f3eb",
    },
    dark: {
      backgroundColor: "#121212",
      surfaceColor: "#1e1e1e",
      primaryText: "#ffffff",
      secondaryText: "#a0a0a0",
      accentColor: "#C4935D",
      borderColor: "#333",
      shadowColor: "#000",
      cardBackground: "#2d2d2d",
      sectionHeaderBg: "#2d2d2d",
      statDivider: "#444",
      successColor: "#4CAF50",
      instructionBg: "#2d2d2d",
      footerBg: "#2d2d2d",
    }
  };

  const currentTheme = isDarkMode ? theme.dark : theme.light;

  // ===== FIXED DARK MODE FETCHING =====
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setIsDarkMode(false);
      setIsLoading(false);
      return;
    }

    // Direct document reference - using user.uid as document ID
    const userDocRef = doc(db, "users", user.uid);
    
    // Initial fetch
    getDoc(userDocRef).then((docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        const darkModeValue = userData.darkMode !== undefined ? userData.darkMode : false;
        setIsDarkMode(darkModeValue);
      } else {
        setIsDarkMode(false);
      }
    }).catch((error) => {
      console.error("Error fetching dark mode:", error);
      setIsDarkMode(false);
    }).finally(() => {
      setIsLoading(false);
    });

    // Real-time listener
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        if (userData.darkMode !== undefined) {
          setIsDarkMode(userData.darkMode);
        }
      }
    }, (error) => {
      console.error("Error in dark mode listener:", error);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isLoading) return; // Don't start animations while loading
    
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
    ]).start(() => {
      // Stagger section animations
      sectionAnims.forEach((anim, index) => {
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
          ]),
        ]).start();
      });
    });

    return () => {
      sectionAnims.forEach(anim => {
        anim.slide.stopAnimation();
        anim.fade.stopAnimation();
      });
    };
  }, [isLoading]); // Run when loading finishes

  const openVideo = async (url, index) => {
    if (loadingVideo !== null) return;

    // Button press animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setLoadingVideo(index);
    
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        // Simulate loading for better UX
        setTimeout(async () => {
          await Linking.openURL(url);
          setLoadingVideo(null);
        }, 300);
      } else {
        setLoadingVideo(null);
      }
    } catch (error) {
      console.error("Error opening video:", error);
      setLoadingVideo(null);
    }
  };

  const renderVideoCard = (video, categoryIndex, videoIndex) => {
    const globalIndex = tutorialCategories
      .slice(0, categoryIndex)
      .reduce((sum, cat) => sum + cat.videos.length, 0) + videoIndex;
    
    return (
      <Animated.View
        key={`${categoryIndex}-${videoIndex}`}
        style={[
          styles.videoCardContainer,
          {
            opacity: sectionAnims[categoryIndex]?.fade || 1,
            transform: [
              { 
                translateY: sectionAnims[categoryIndex]?.slide?.interpolate({
                  inputRange: [0, 30],
                  outputRange: [0, 10]
                }) || 0 
              }
            ]
          }
        ]}
      >
        <TouchableOpacity
          style={[styles.videoCard, { 
            backgroundColor: currentTheme.cardBackground,
            shadowColor: currentTheme.shadowColor,
          }]}
          onPress={() => openVideo(video.url, globalIndex)}
          activeOpacity={0.7}
          disabled={loadingVideo !== null}
        >
          <View style={styles.videoHeader}>
            <View style={styles.videoTitleContainer}>
              <Text style={[styles.videoTitle, { color: currentTheme.primaryText }]}>
                {video.title}
              </Text>
              <View style={[
                styles.difficultyBadge,
                { 
                  backgroundColor: isDarkMode 
                    ? (video.difficulty === 'Beginner' ? '#1B5E20' :
                       video.difficulty === 'Intermediate' ? '#E65100' :
                       '#B71C1C')
                    : (video.difficulty === 'Beginner' ? '#E8F5E8' :
                       video.difficulty === 'Intermediate' ? '#FFF3E0' :
                       '#FFEBEE')
                }
              ]}>
                <Text style={[
                  styles.difficultyText,
                  { 
                    color: isDarkMode ? '#fff' : 
                      (video.difficulty === 'Beginner' ? '#4CAF50' :
                       video.difficulty === 'Intermediate' ? '#FF9800' :
                       '#F44336')
                  }
                ]}>
                  {video.difficulty}
                </Text>
              </View>
            </View>
            
            <View style={styles.videoMeta}>
              <View style={styles.metaItem}>
                <Text style={[styles.metaIcon, { color: currentTheme.secondaryText }]}>⏱️</Text>
                <Text style={[styles.metaText, { color: currentTheme.secondaryText }]}>
                  {video.duration}
                </Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={[styles.metaIcon, { color: currentTheme.secondaryText }]}>👁️</Text>
                <Text style={[styles.metaText, { color: currentTheme.secondaryText }]}>
                  {video.views}
                </Text>
              </View>
            </View>
          </View>
          
          <Text style={[styles.videoDesc, { color: currentTheme.secondaryText }]}>
            {video.desc}
          </Text>
          
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
              style={[
                styles.watchButton,
                { backgroundColor: tutorialCategories[categoryIndex].color }
              ]}
              onPress={() => openVideo(video.url, globalIndex)}
              activeOpacity={0.8}
              disabled={loadingVideo !== null}
            >
              {loadingVideo === globalIndex ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Text style={styles.watchIcon}>▶️</Text>
                  <Text style={styles.watchText}>Watch Tutorial</Text>
                </>
              )}
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  // Show loading screen while fetching theme
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: theme.light.backgroundColor }]}>
        <ActivityIndicator size="large" color="#C4935D" />
        <Text style={[styles.loadingText, { color: theme.light.primaryText }]}>
          Loading tutorial library...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: currentTheme.backgroundColor }]}>
      <Animated.ScrollView 
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <Animated.View 
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={[styles.headerIcon, { backgroundColor: currentTheme.accentColor }]}>
            <Text style={styles.headerIconText}>🎥</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: currentTheme.primaryText }]}>
              Workout Tutorials
            </Text>
            <Text style={[styles.subtitle, { color: currentTheme.secondaryText }]}>
              Learn exercises with proper form from experts
            </Text>
          </View>
        </Animated.View>

        {/* Stats Bar */}
        <Animated.View 
          style={[
            styles.statsBar,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              backgroundColor: currentTheme.surfaceColor,
              shadowColor: currentTheme.shadowColor,
            }
          ]}
        >
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: currentTheme.primaryText }]}>
              {tutorialCategories.reduce((sum, cat) => sum + cat.videos.length, 0)}
            </Text>
            <Text style={[styles.statLabel, { color: currentTheme.secondaryText }]}>
              Videos
            </Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: currentTheme.statDivider }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: currentTheme.primaryText }]}>
              {tutorialCategories.length}
            </Text>
            <Text style={[styles.statLabel, { color: currentTheme.secondaryText }]}>
              Categories
            </Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: currentTheme.statDivider }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: currentTheme.primaryText }]}>
              Free
            </Text>
            <Text style={[styles.statLabel, { color: currentTheme.secondaryText }]}>
              Access
            </Text>
          </View>
        </Animated.View>

        {/* Note Card */}
        <Animated.View 
          style={[
            styles.noteCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              backgroundColor: currentTheme.instructionBg,
              borderLeftColor: currentTheme.accentColor,
              shadowColor: currentTheme.shadowColor,
            }
          ]}
        >
          <Text style={[styles.noteTitle, { color: currentTheme.primaryText }]}>
            💡 How to Use
          </Text>
          <Text style={[styles.noteText, { color: currentTheme.secondaryText }]}>
            Tap any video to open in YouTube. All tutorials are free and curated by fitness experts.
          </Text>
        </Animated.View>

        {/* All Tutorial Categories */}
        {tutorialCategories.map((category, categoryIndex) => (
          <Animated.View 
            key={categoryIndex}
            style={[
              styles.section,
              {
                opacity: sectionAnims[categoryIndex]?.fade || 0,
                transform: [
                  { translateY: sectionAnims[categoryIndex]?.slide || 30 }
                ]
              }
            ]}
          >
            {/* Category Header */}
            <View 
              style={[
                styles.categoryHeader,
                { 
                  backgroundColor: currentTheme.sectionHeaderBg,
                  shadowColor: currentTheme.shadowColor,
                }
              ]}
            >
              <View style={styles.categoryTitle}>
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <View>
                  <Text style={[styles.sectionTitle, { color: currentTheme.primaryText }]}>
                    {category.title}
                  </Text>
                  <Text style={[styles.videoCount, { color: currentTheme.secondaryText }]}>
                    {category.videos.length} professional videos
                  </Text>
                </View>
              </View>
            </View>
            
            {/* Videos */}
            <View style={styles.videosContainer}>
              {category.videos.map((video, videoIndex) => 
                renderVideoCard(video, categoryIndex, videoIndex)
              )}
            </View>
          </Animated.View>
        ))}

        {/* Footer Note */}
        <Animated.View 
          style={[
            styles.footerNote,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              backgroundColor: currentTheme.footerBg,
              shadowColor: currentTheme.shadowColor,
            }
          ]}
        >
          <Text style={[styles.footerTitle, { color: currentTheme.primaryText }]}>
            🔐 Privacy First
          </Text>
          <Text style={[styles.footerText, { color: currentTheme.secondaryText }]}>
            Videos open directly in YouTube. We don't track your viewing history.
          </Text>
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
    flex: 1,
  },
  scrollContent: {
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
    marginBottom: 20,
  },
  headerIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    elevation: 3,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  headerIconText: {
    fontSize: 28,
    color: "#fff",
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
    lineHeight: 18,
  },
  
  // Stats Bar
  statsBar: {
    flexDirection: "row",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statItem: {
    flex: 1,
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
  
  // Note Card
  noteCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderLeftWidth: 4,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  noteText: {
    fontSize: 13,
    lineHeight: 18,
  },
  
  // Section
  section: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  categoryTitle: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  videoCount: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: "500",
  },
  videosContainer: {
    // All videos are always visible
  },
  
  // Video Cards
  videoCardContainer: {
    marginBottom: 12,
  },
  videoCard: {
    borderRadius: 16,
    padding: 18,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  videoHeader: {
    marginBottom: 10,
  },
  videoTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    marginRight: 10,
    lineHeight: 22,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: "600",
  },
  videoMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
  metaIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  metaText: {
    fontSize: 12,
    fontWeight: "500",
  },
  videoDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 15,
  },
  watchButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  watchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  watchText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  
  // Footer Note
  footerNote: {
    borderRadius: 16,
    padding: 18,
    marginTop: 10,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  footerTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
    textAlign: "center",
  },
  footerText: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
  
  // Spacer
  spacer: {
    height: 30,
  },
});