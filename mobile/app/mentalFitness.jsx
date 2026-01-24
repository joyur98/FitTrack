// MentalFitness.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  TextInput,
  Alert,
  Animated,
  Easing,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { auth, db } from "./firebaseConfig";
import { doc, getDoc, onSnapshot } from "firebase/firestore";

const { width } = Dimensions.get('window');

export default function MentalFitnessScreen() {
  const router = useRouter();
  
  // State for mood tracking
  const [selectedMood, setSelectedMood] = useState(null);
  const [moodNotes, setMoodNotes] = useState("");
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [moodHistory, setMoodHistory] = useState([]);
  
  // State for breathing exercise
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState("inhale");
  const [breathingTime, setBreathingTime] = useState(4);
  
  // State for meditation timer
  const [meditationActive, setMeditationActive] = useState(false);
  const [meditationTime, setMeditationTime] = useState(0);
  const [meditationDuration, setMeditationDuration] = useState(300); // 5 minutes default

  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isThemeLoading, setIsThemeLoading] = useState(true);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const breathingScale = useRef(new Animated.Value(1)).current;
  const breathingOpacity = useRef(new Animated.Value(1)).current;
  const moodCardScale = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Theme colors with dark mode support
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
      moodBg: "#f8f3eb",
      successColor: "#4CAF50",
      calmColor: "#06D6A0",
      anxiousColor: "#EF476F",
      happyColor: "#FFD166",
      progressBarBg: "#f0e6d6",
      progressFill: "#C4935D",
      historyBg: "#f8f3eb",
      modalBg: "#fff",
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
      moodBg: "#2d2d2d",
      successColor: "#4CAF50",
      calmColor: "#06D6A0",
      anxiousColor: "#EF476F",
      happyColor: "#FFD166",
      progressBarBg: "#2d2d2d",
      progressFill: "#C4935D",
      historyBg: "#2d2d2d",
      modalBg: "#1e1e1e",
    }
  };

  const currentTheme = isDarkMode ? theme.dark : theme.light;

  // Mood options with dark mode support
  const moodOptions = [
    { emoji: "😊", label: "Happy", color: "#FFD166", bgColor: isDarkMode ? "#3D2C29" : "#FFF9E6" },
    { emoji: "😌", label: "Calm", color: "#06D6A0", bgColor: isDarkMode ? "#1C2A24" : "#E6F7F2" },
    { emoji: "😐", label: "Neutral", color: "#118AB2", bgColor: isDarkMode ? "#1C2A2E" : "#E6F3F8" },
    { emoji: "😔", label: "Sad", color: "#073B4C", bgColor: isDarkMode ? "#1C2529" : "#E6EBEE" },
    { emoji: "😰", label: "Anxious", color: "#EF476F", bgColor: isDarkMode ? "#3D242A" : "#FDEEF1" },
    { emoji: "😴", label: "Tired", color: "#7209B7", bgColor: isDarkMode ? "#2D1C3D" : "#F3E6F8" },
    { emoji: "😤", label: "Stressed", color: "#F72585", bgColor: isDarkMode ? "#3D1C2C" : "#FDE6F1" },
    { emoji: "🤩", label: "Excited", color: "#FF9E00", bgColor: isDarkMode ? "#3D2C1C" : "#FFF3E0" },
  ];

  // Fetch dark mode from Firebase
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
      
      try {
        // Method 1: Direct document access using userId as document ID
        const userDocRef = doc(db, "users", userId);
        const docSnap = await getDoc(userDocRef);
        
        if (docSnap.exists()) {
          const userData = docSnap.data();
          
          // Check for darkMode field (case-insensitive)
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
    
    // Try direct document listener
    const userDocRef = doc(db, "users", userId);
    
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const userData = docSnap.data();
        
        // Check for darkMode field
        if (userData.darkMode !== undefined) {
          console.log("Real-time dark mode update:", userData.darkMode);
          setIsDarkMode(userData.darkMode);
        } else if (userData.darkmode !== undefined) {
          console.log("Real-time dark mode update (lowercase):", userData.darkmode);
          setIsDarkMode(userData.darkmode);
        }
      }
    }, (error) => {
      console.error("Error in dark mode listener:", error);
    });

    // Cleanup listener
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Entry animations (only start after theme loads)
  useEffect(() => {
    if (isThemeLoading) return;
    
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

    // Breathing animation loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
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

  // Breathing exercise animation
  useEffect(() => {
    if (breathingActive) {
      // Start breathing animation
      if (breathingPhase === "inhale") {
        Animated.parallel([
          Animated.timing(breathingScale, {
            toValue: 1.3,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(breathingOpacity, {
            toValue: 0.8,
            duration: 4000,
            useNativeDriver: true,
          }),
        ]).start();
      } else if (breathingPhase === "exhale") {
        Animated.parallel([
          Animated.timing(breathingScale, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(breathingOpacity, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: true,
          }),
        ]).start();
      }
    } else {
      breathingScale.setValue(1);
      breathingOpacity.setValue(1);
    }
  }, [breathingActive, breathingPhase]);

  // Breathing exercise timer
  useEffect(() => {
    let interval;
    if (breathingActive) {
      interval = setInterval(() => {
        setBreathingTime((prev) => {
          if (prev <= 1) {
            // Switch between inhale/hold/exhale
            setBreathingPhase((phase) => {
              if (phase === "inhale") return "hold";
              if (phase === "hold") return "exhale";
              if (phase === "exhale") return "hold2";
              return "inhale";
            });
            return 4; // Reset timer
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [breathingActive]);

  // Meditation timer
  useEffect(() => {
    let interval;
    if (meditationActive && meditationTime < meditationDuration) {
      interval = setInterval(() => {
        setMeditationTime((prev) => prev + 1);
      }, 1000);
    } else if (meditationTime >= meditationDuration) {
      setMeditationActive(false);
      // Success animation
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      Alert.alert("🎉 Meditation Complete", "Great job! You've completed your meditation session.");
    }
    return () => clearInterval(interval);
  }, [meditationActive, meditationTime]);

  // Save mood function with animation
  const saveMood = () => {
    if (!selectedMood) {
      Alert.alert("Select Mood", "Please select how you're feeling");
      return;
    }
    
    // Button animation
    Animated.sequence([
      Animated.timing(moodCardScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(moodCardScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    const moodData = {
      mood: moodOptions[selectedMood],
      notes: moodNotes,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString()
    };
    
    setMoodHistory([moodData, ...moodHistory.slice(0, 4)]);
    Alert.alert("✅ Mood Saved", `Your ${moodOptions[selectedMood].label} mood has been recorded!`);
    setShowMoodModal(false);
    setMoodNotes("");
    setSelectedMood(null);
  };

  // Start/Stop breathing exercise with animation
  const toggleBreathing = () => {
    if (!breathingActive) {
      setBreathingPhase("inhale");
      setBreathingTime(4);
    }
    setBreathingActive(!breathingActive);
  };

  // Start/Stop meditation with animation
  const toggleMeditation = () => {
    if (!meditationActive) {
      setMeditationTime(0);
    }
    setMeditationActive(!meditationActive);
  };

  // Format time (MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Quick tips with dark mode support
  const quickTips = [
    { emoji: "🌬️", text: "Take 5 deep breaths when stressed", color: isDarkMode ? "#1C2A24" : "#E6F7F2" },
    { emoji: "💧", text: "Drink a glass of water", color: isDarkMode ? "#1C2A2E" : "#E6F3F8" },
    { emoji: "🤸", text: "Stand up and stretch", color: isDarkMode ? "#3D2C29" : "#FFF9E6" },
    { emoji: "📝", text: "Write down 3 things you're grateful for", color: isDarkMode ? "#2D1C3D" : "#F3E6F8" },
    { emoji: "🎵", text: "Listen to calming music for 2 minutes", color: isDarkMode ? "#3D242A" : "#FDEEF1" },
    { emoji: "👁️", text: "Close your eyes and count to 10 slowly", color: isDarkMode ? "#3D1C2C" : "#FDE6F1" },
  ];

  // Resources with dark mode support
  const resources = [
    { emoji: "📞", title: "Crisis Helpline (Nepal)", subtitle: "Call 1166 for mental health support", color: isDarkMode ? "#3D242A" : "#FDEEF1" },
    { emoji: "📱", title: "Meditation Apps", subtitle: "Headspace, Calm, Insight Timer", color: isDarkMode ? "#1C2A24" : "#E6F7F2" },
    { emoji: "📖", title: "Journaling", subtitle: "Write down your thoughts daily", color: isDarkMode ? "#3D2C29" : "#FFF9E6" },
    { emoji: "👥", title: "Support Groups", subtitle: "Connect with others going through similar experiences", color: isDarkMode ? "#1C2A2E" : "#E6F3F8" },
  ];

  // Show loading screen while fetching theme
  if (isThemeLoading) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: theme.light.backgroundColor }]}>
        <ActivityIndicator size="large" color="#C4935D" />
        <Text style={[styles.loadingText, { color: theme.light.primaryText }]}>
          Loading Mental Fitness...
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
            <Text style={styles.headerIconText}>🧠</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: currentTheme.primaryText }]}>
              Mental Fitness
            </Text>
            <Text style={[styles.subtitle, { color: currentTheme.secondaryText }]}>
              Nurture your mind, strengthen your spirit
            </Text>
          </View>
        </Animated.View>

        {/* Mood Tracker Card */}
        <Animated.View 
          style={[
            styles.card,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              backgroundColor: currentTheme.surfaceColor,
              shadowColor: currentTheme.shadowColor,
            }
          ]}
        >
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: currentTheme.primaryText }]}>
              How are you feeling today?
            </Text>
            <Text style={[styles.cardDescription, { color: currentTheme.secondaryText }]}>
              Track your mood and emotions
            </Text>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.moodScroll}
          >
            {moodOptions.map((mood, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.moodOption,
                  { backgroundColor: mood.bgColor },
                  selectedMood === index && [styles.moodSelected, { borderColor: mood.color }]
                ]}
                onPress={() => {
                  setSelectedMood(index);
                  setShowMoodModal(true);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                <Text style={[styles.moodLabel, { color: mood.color }]}>{mood.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {moodHistory.length > 0 && (
            <View style={styles.moodHistory}>
              <Text style={[styles.historyTitle, { color: currentTheme.primaryText }]}>
                Recent Moods
              </Text>
              <View style={styles.historyContainer}>
                {moodHistory.map((item, index) => (
                  <View key={index} style={[styles.historyItem, { backgroundColor: currentTheme.historyBg }]}>
                    <Text style={styles.historyEmoji}>{item.mood.emoji}</Text>
                    <View style={styles.historyText}>
                      <Text style={[styles.historyTime, { color: currentTheme.secondaryText }]}>
                        {item.timestamp}
                      </Text>
                      <Text style={[styles.historyLabel, { color: currentTheme.primaryText }]}>
                        {item.mood.label}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          <Animated.View style={{ transform: [{ scale: moodCardScale }] }}>
            <TouchableOpacity 
              style={[styles.primaryButton, { backgroundColor: currentTheme.accentColor }]}
              onPress={() => {
                if (selectedMood !== null) {
                  setShowMoodModal(true);
                } else {
                  Alert.alert("Select Mood", "Please select a mood first");
                }
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Track My Mood</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>

        {/* Breathing Exercise */}
        <Animated.View 
          style={[
            styles.card,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              backgroundColor: currentTheme.surfaceColor,
              shadowColor: currentTheme.shadowColor,
            }
          ]}
        >
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: currentTheme.primaryText }]}>
              🌬️ Breathing Exercise
            </Text>
            <Text style={[styles.cardDescription, { color: currentTheme.secondaryText }]}>
              4-4-4 breathing technique for relaxation
            </Text>
          </View>
          
          <View style={styles.breathingContainer}>
            <Animated.View 
              style={[
                styles.breathingCircle,
                { 
                  backgroundColor: breathingPhase === "inhale" ? currentTheme.calmColor :
                                  breathingPhase === "exhale" ? "#118AB2" : currentTheme.happyColor,
                  transform: [{ scale: breathingScale }],
                  opacity: breathingOpacity
                }
              ]}
            >
              <Text style={styles.breathingText}>
                {breathingPhase === "inhale" ? "INHALE" :
                 breathingPhase === "exhale" ? "EXHALE" : "HOLD"}
              </Text>
              <Text style={styles.breathingTime}>{breathingTime}s</Text>
            </Animated.View>
            
            <View style={styles.breathingInstructions}>
              <Text style={[styles.instructionsText, { color: currentTheme.primaryText }]}>
                {breathingPhase === "inhale" ? "Breathe in slowly through your nose..." :
                 breathingPhase === "exhale" ? "Breathe out slowly through your mouth..." :
                 "Hold your breath..."}
              </Text>
              <View style={styles.breathingProgress}>
                <View style={[styles.progressBar, { backgroundColor: currentTheme.progressBarBg }]}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        backgroundColor: currentTheme.progressFill,
                        width: `${(4 - breathingTime) * 25}%`
                      }
                    ]} 
                  />
                </View>
              </View>
            </View>
          </View>

          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity 
              style={[
                styles.primaryButton, 
                { backgroundColor: breathingActive ? currentTheme.anxiousColor : currentTheme.accentColor }
              ]}
              onPress={toggleBreathing}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>
                {breathingActive ? "Stop Breathing Exercise" : "Start Breathing Exercise"}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>

        {/* Meditation Timer */}
        <Animated.View 
          style={[
            styles.card,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              backgroundColor: currentTheme.surfaceColor,
              shadowColor: currentTheme.shadowColor,
            }
          ]}
        >
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: currentTheme.primaryText }]}>
              🕉️ Meditation Timer
            </Text>
            <Text style={[styles.cardDescription, { color: currentTheme.secondaryText }]}>
              Find your inner peace
            </Text>
          </View>
          
          <View style={styles.meditationContainer}>
            <Animated.View style={{ transform: [{ scale: meditationActive ? pulseAnim : 1 }] }}>
              <Text style={[styles.meditationTime, { color: currentTheme.primaryText }]}>
                {formatTime(meditationActive ? meditationTime : meditationDuration)}
              </Text>
            </Animated.View>
            
            <View style={styles.meditationProgress}>
              <View style={[styles.progressBar, { backgroundColor: currentTheme.progressBarBg }]}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      backgroundColor: currentTheme.progressFill,
                      width: `${(meditationTime / meditationDuration) * 100}%`
                    }
                  ]} 
                />
              </View>
            </View>
            
            <View style={styles.meditationControls}>
              {[300, 600, 900].map((duration) => (
                <TouchableOpacity 
                  key={duration}
                  style={[
                    styles.durationButton,
                    { backgroundColor: currentTheme.moodBg },
                    meditationDuration === duration && { backgroundColor: currentTheme.accentColor }
                  ]}
                  onPress={() => {
                    if (!meditationActive) {
                      setMeditationDuration(duration);
                    }
                  }}
                  disabled={meditationActive}
                >
                  <Text style={[
                    styles.durationButtonText,
                    { color: currentTheme.secondaryText },
                    meditationDuration === duration && { color: '#fff' }
                  ]}>
                    {duration / 60} min
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity 
            style={[
              styles.primaryButton, 
              { 
                backgroundColor: meditationActive ? currentTheme.anxiousColor : currentTheme.accentColor
              }
            ]}
            onPress={toggleMeditation}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>
              {meditationActive ? "Stop Meditation" : "Start Meditation"}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Quick Tips */}
        <Animated.View 
          style={[
            styles.card,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              backgroundColor: currentTheme.surfaceColor,
              shadowColor: currentTheme.shadowColor,
            }
          ]}
        >
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: currentTheme.primaryText }]}>
              💡 Quick Mental Boosters
            </Text>
            <Text style={[styles.cardDescription, { color: currentTheme.secondaryText }]}>
              Try these when you need a quick reset
            </Text>
          </View>
          
          <View style={styles.tipsContainer}>
            {quickTips.map((tip, index) => (
              <Animated.View 
                key={index}
                style={[
                  styles.tipItem,
                  { backgroundColor: tip.color },
                  {
                    opacity: fadeAnim,
                    transform: [
                      { translateX: slideAnim.interpolate({
                        inputRange: [0, 30],
                        outputRange: [0, 20]
                      })}
                    ]
                  }
                ]}
              >
                <Text style={styles.tipEmoji}>{tip.emoji}</Text>
                <Text style={[styles.tipText, { color: currentTheme.primaryText }]}>
                  {tip.text}
                </Text>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Resources */}
        <Animated.View 
          style={[
            styles.card,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              backgroundColor: currentTheme.surfaceColor,
              shadowColor: currentTheme.shadowColor,
              marginBottom: 30,
            }
          ]}
        >
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: currentTheme.primaryText }]}>
              📚 Mental Health Resources
            </Text>
          </View>
          
          {resources.map((resource, index) => (
            <TouchableOpacity 
              key={index} 
              style={[styles.resourceItem, { backgroundColor: resource.color }]}
              activeOpacity={0.7}
            >
              <Text style={styles.resourceEmoji}>{resource.emoji}</Text>
              <View style={styles.resourceText}>
                <Text style={[styles.resourceTitle, { color: currentTheme.primaryText }]}>
                  {resource.title}
                </Text>
                <Text style={[styles.resourceSubtitle, { color: currentTheme.secondaryText }]}>
                  {resource.subtitle}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </Animated.View>
      </Animated.ScrollView>

      {/* Mood Modal */}
      <Modal
        visible={showMoodModal}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.modalContent,
              {
                backgroundColor: currentTheme.modalBg,
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            {selectedMood !== null && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalEmoji, { color: moodOptions[selectedMood].color }]}>
                    {moodOptions[selectedMood].emoji}
                  </Text>
                  <Text style={[styles.modalTitle, { color: currentTheme.primaryText }]}>
                    {moodOptions[selectedMood].label}
                  </Text>
                  <Text style={[styles.modalSubtitle, { color: currentTheme.secondaryText }]}>
                    How are you feeling right now?
                  </Text>
                </View>
                
                <TextInput
                  style={[
                    styles.notesInput,
                    { 
                      backgroundColor: currentTheme.moodBg,
                      color: currentTheme.primaryText,
                      borderColor: currentTheme.borderColor
                    }
                  ]}
                  placeholder="Add notes about how you're feeling (optional)"
                  placeholderTextColor={currentTheme.secondaryText}
                  multiline
                  numberOfLines={4}
                  value={moodNotes}
                  onChangeText={setMoodNotes}
                />
                
                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={[styles.modalButton, { backgroundColor: currentTheme.moodBg }]}
                    onPress={() => setShowMoodModal(false)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.cancelButtonText, { color: currentTheme.secondaryText }]}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.modalButton, { backgroundColor: currentTheme.accentColor }]}
                    onPress={saveMood}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.saveButtonText}>Save Mood</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Animated.View>
        </View>
      </Modal>
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
  
  // Cards
  card: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardHeader: {
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  
  // Mood Tracker
  moodScroll: {
    marginBottom: 20,
  },
  moodOption: {
    width: 85,
    height: 110,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    padding: 12,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  moodSelected: {
    borderWidth: 3,
    elevation: 4,
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: 10,
  },
  moodLabel: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  
  // Mood History
  moodHistory: {
    marginBottom: 20,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  historyContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  historyEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  historyText: {
    flexDirection: "column",
  },
  historyTime: {
    fontSize: 10,
    fontWeight: "500",
  },
  historyLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  
  // Primary Button
  primaryButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  
  // Breathing Exercise
  breathingContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  breathingCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 25,
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  breathingText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    letterSpacing: 1,
  },
  breathingTime: {
    color: "#fff",
    fontSize: 36,
    fontWeight: "800",
  },
  breathingInstructions: {
    width: "100%",
    alignItems: "center",
  },
  instructionsText: {
    fontSize: 15,
    marginBottom: 16,
    textAlign: "center",
    lineHeight: 22,
  },
  breathingProgress: {
    width: "80%",
  },
  
  // Progress Bar
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  
  // Meditation
  meditationContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  meditationTime: {
    fontSize: 48,
    fontWeight: "800",
    marginBottom: 20,
  },
  meditationProgress: {
    width: "80%",
    marginBottom: 25,
  },
  meditationControls: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  durationButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  durationButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  
  // Quick Tips
  tipsContainer: {
    gap: 12,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tipEmoji: {
    fontSize: 24,
    marginRight: 16,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
  
  // Resources
  resourceItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  resourceEmoji: {
    fontSize: 24,
    marginRight: 16,
  },
  resourceText: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  resourceSubtitle: {
    fontSize: 14,
    lineHeight: 18,
  },
  
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    borderRadius: 24,
    padding: 24,
    width: "90%",
    maxWidth: 400,
    elevation: 5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  modalEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  modalSubtitle: {
    fontSize: 14,
    textAlign: "center",
  },
  notesInput: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    height: 120,
    marginBottom: 24,
    textAlignVertical: "top",
    borderWidth: 1,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});