import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { auth } from "./firebaseConfig";
import { db } from "./firebaseConfig";
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  doc,
  getDoc,
} from "firebase/firestore";

const { width } = Dimensions.get('window');

export default function CaloriesScreen() {
  const router = useRouter();

  const [food, setFood] = useState("");
  const [calories, setCalories] = useState("");
  const [entries, setEntries] = useState([]);
  const [total, setTotal] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Animation values
  const [scaleAnim] = useState(new Animated.Value(1));
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [progressWidth] = useState(new Animated.Value(0));
  const [shakeAnim] = useState(new Animated.Value(0));

  // Use refs for animations that need to be created dynamically
  const entryAnimations = useRef([]);

  const user = auth.currentUser;

  // Calculate daily goal progress
  const [dailyGoal, setDailyGoal] = useState(2000);
  const progressPercentage = Math.min((total / dailyGoal) * 100, 100);

  // Format time helper function
  const formatTime = (timestamp) => {
    const date = timestamp.toDate();
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60);
      return `${minutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    }
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Initialize entry animations
  useEffect(() => {
    entryAnimations.current = entries.map(() => ({
      slide: new Animated.Value(30),
      fade: new Animated.Value(0),
    }));
  }, [entries]);

  // Animate entries when they change
  useEffect(() => {
    entryAnimations.current.forEach((anim, index) => {
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
  }, [entries]);

  useEffect(() => {
    if (!user) return;

    // Fetch dark mode preference
    const fetchDarkMode = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setIsDarkMode(userData.darkMode || false);
          setDailyGoal(userData.dailyCalories || 2000);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchDarkMode();

    // Fetch calorie entries
    const q = query(
      collection(db, "calorie_intake"),
      where("userID", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let list = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        list.push(data);
      });

      // Filter only today's entries
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayEntries = list.filter(item => {
        const itemDate = item.date.toDate();
        return itemDate >= today;
      });

      // Sort by date descending
      todayEntries.sort((a, b) => b.date.toDate() - a.date.toDate());

      // Calculate total
      const sum = todayEntries.reduce((acc, item) => acc + item.calorie, 0);

      setEntries(todayEntries);
      setTotal(sum);
      
      // Animate progress bar
      Animated.timing(progressWidth, {
        toValue: progressPercentage,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    });

    // Entry animations
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    return () => unsubscribe();
  }, []);

  // Shake animation for error
  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Add calories with animation
  const addCalories = async () => {
    if (!food.trim() || !calories || isNaN(calories)) {
      shake();
      Alert.alert("Error", "Enter valid food and calories");
      return;
    }

    try {
      // Button press animation
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      await addDoc(collection(db, "calorie_intake"), {
        food: food.trim(),
        calorie: Number(calories),
        date: Timestamp.now(),
        userID: user.uid,
      });

      setFood("");
      setCalories("");
      
      // Success animation
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }).start();
      
    } catch (error) {
      shake();
      Alert.alert("Error", "Failed to add calories");
    }
  };

  // Theme styles
  const theme = {
    backgroundColor: isDarkMode ? "#121212" : "#f8f5f0",
    cardBackground: isDarkMode ? "#1e1e1e" : "#fff",
    textColor: isDarkMode ? "#ffffff" : "#4a3b31",
    secondaryText: isDarkMode ? "#a0a0a0" : "#8b7968",
    borderColor: isDarkMode ? "#333" : "#eee",
    primaryColor: "#C4935D",
    secondaryColor: isDarkMode ? "#2d2d2d" : "#5b4334",
    inputBackground: isDarkMode ? "#2d2d2d" : "#f8f5f0",
  };

  // Progress bar color based on percentage
  const getProgressColor = () => {
    if (progressPercentage < 70) return "#27ae60";
    if (progressPercentage < 90) return "#f39c12";
    return "#e74c3c";
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.backgroundColor }]}>
      <Animated.ScrollView 
        style={[styles.container, { opacity: fadeAnim }]} 
        showsVerticalScrollIndicator={false}
      >
        
        {/* Header with animated slide */}
        <Animated.View 
          style={[
            styles.header,
            { 
              transform: [{ translateY: slideAnim }],
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
          <Text style={[styles.title, { color: theme.textColor }]}>Calorie Intake</Text>
          <View style={styles.headerPlaceholder} />
        </Animated.View>

        {/* Total Card with pulse animation */}
        <Animated.View 
          style={[
            styles.totalCard, 
            { 
              backgroundColor: theme.secondaryColor,
              transform: [{ scale: fadeAnim }]
            }
          ]}
        >
          <View style={styles.totalHeader}>
            <Text style={styles.totalLabel}>Today's Intake</Text>
            <View style={styles.totalBadge}>
              <Text style={styles.totalBadgeText}>
                {dailyGoal - total > 0 ? `${dailyGoal - total} left` : `${total - dailyGoal} over`}
              </Text>
            </View>
          </View>
          
          <View style={styles.totalValueRow}>
            <Text style={styles.totalValue}>{total}</Text>
            <Text style={styles.totalUnit}>kcal</Text>
          </View>
          
          {/* Progress Bar */}
          <View style={[styles.progressBarContainer, { backgroundColor: theme.inputBackground }]}>
            <Animated.View 
              style={[
                styles.progressBarFill,
                { 
                  width: progressWidth.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%']
                  }),
                  backgroundColor: getProgressColor()
                }
              ]}
            />
          </View>
          
          <View style={styles.progressTextRow}>
            <Text style={[styles.progressText, { color: theme.secondaryText }]}>
              {progressPercentage.toFixed(1)}% of daily goal
            </Text>
            <Text style={[styles.progressText, { color: theme.secondaryText }]}>
              Goal: {dailyGoal} kcal
            </Text>
          </View>
        </Animated.View>

        {/* Input Card with shake animation */}
        <Animated.View 
          style={[
            styles.inputCard, 
            { 
              backgroundColor: theme.cardBackground,
              transform: [
                { translateX: shakeAnim },
                { translateY: slideAnim }
              ]
            }
          ]}
        >
          <View style={styles.inputHeader}>
            <Text style={[styles.inputTitle, { color: theme.textColor }]}>➕ Add Calories</Text>
            <TouchableOpacity 
              onPress={() => router.push("/dashboard")}
              style={styles.dashboardButton}
            >
              <Text style={styles.dashboardButtonText}>🏠 Dashboard</Text>
            </TouchableOpacity>
          </View>

          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TextInput
              value={food}
              onChangeText={setFood}
              placeholder="🍎 Food name"
              placeholderTextColor={theme.secondaryText}
              style={[
                styles.input, 
                { 
                  backgroundColor: theme.inputBackground,
                  color: theme.textColor,
                  borderColor: theme.borderColor
                }
              ]}
            />

            <View style={styles.inputRow}>
              <TextInput
                value={calories}
                onChangeText={setCalories}
                placeholder="🔥 Calories"
                keyboardType="numeric"
                placeholderTextColor={theme.secondaryText}
                style={[
                  styles.input, 
                  { 
                    backgroundColor: theme.inputBackground,
                    color: theme.textColor,
                    borderColor: theme.borderColor
                  }
                ]}
              />
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <TouchableOpacity 
                  style={[styles.addButton, { backgroundColor: theme.primaryColor }]} 
                  onPress={addCalories}
                  activeOpacity={0.8}
                >
                  <Text style={styles.addButtonText}>➕ Add</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </Animated.View>
        </Animated.View>

        {/* Entries Section with staggered animations */}
        <Animated.View 
          style={[
            styles.entriesSection,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.entriesHeader}>
            <Text style={[styles.entriesTitle, { color: theme.textColor }]}>
              📋 Today's Entries
            </Text>
            <Text style={[styles.entriesCount, { color: theme.secondaryText }]}>
              {entries.length} items
            </Text>
          </View>

          {entries.length === 0 ? (
            <Animated.View 
              style={[
                styles.emptyState,
                { opacity: fadeAnim }
              ]}
            >
              <Text style={[styles.emptyEmoji, { color: theme.secondaryText }]}>🍽️</Text>
              <Text style={[styles.emptyText, { color: theme.secondaryText }]}>
                No calories added yet
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.secondaryText }]}>
                Start by adding your first meal!
              </Text>
            </Animated.View>
          ) : (
            entries.map((item, index) => {
              const anim = entryAnimations.current[index] || { slide: new Animated.Value(0), fade: new Animated.Value(1) };
              
              return (
                <Animated.View 
                  key={index}
                  style={[
                    styles.entryCard,
                    { 
                      backgroundColor: theme.cardBackground,
                      borderColor: theme.borderColor,
                      opacity: anim.fade,
                      transform: [{ translateY: anim.slide }]
                    }
                  ]}
                >
                  <View style={styles.entryHeader}>
                    <Text style={[styles.entryFood, { color: theme.textColor }]}>
                      {item.food}
                    </Text>
                    <View style={[
                      styles.calorieBadge,
                      { backgroundColor: item.calorie > 500 ? '#e74c3c20' : '#27ae6020' }
                    ]}>
                      <Text style={[
                        styles.calorieValue,
                        { color: item.calorie > 500 ? '#e74c3c' : '#27ae60' }
                      ]}>
                        {item.calorie} kcal
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.entryFooter}>
                    <Text style={[styles.entryTime, { color: theme.secondaryText }]}>
                      ⏰ {formatTime(item.date)}
                    </Text>
                    <Text style={[styles.entryTime, { color: theme.secondaryText }]}>
                      📅 {item.date.toDate().toLocaleDateString()}
                    </Text>
                  </View>
                </Animated.View>
              );
            })
          )}
        </Animated.View>
        
        {/* Tips Section */}
        <Animated.View 
          style={[
            styles.tipsSection,
            { 
              backgroundColor: theme.cardBackground,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={[styles.tipsTitle, { color: theme.textColor }]}>💡 Tips</Text>
          <View style={styles.tipsGrid}>
            <View style={[styles.tipCard, { backgroundColor: theme.inputBackground }]}>
              <Text style={[styles.tipEmoji, { color: theme.primaryColor }]}>🍎</Text>
              <Text style={[styles.tipText, { color: theme.textColor }]}>
                Track each meal
              </Text>
            </View>
            <View style={[styles.tipCard, { backgroundColor: theme.inputBackground }]}>
              <Text style={[styles.tipEmoji, { color: theme.primaryColor }]}>💧</Text>
              <Text style={[styles.tipText, { color: theme.textColor }]}>
                Stay hydrated
              </Text>
            </View>
            <View style={[styles.tipCard, { backgroundColor: theme.inputBackground }]}>
              <Text style={[styles.tipEmoji, { color: theme.primaryColor }]}>📊</Text>
              <Text style={[styles.tipText, { color: theme.textColor }]}>
                Check progress
              </Text>
            </View>
          </View>
        </Animated.View>
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
  title: {
    fontSize: 24,
    fontWeight: "800",
  },
  headerPlaceholder: {
    width: 40,
  },
  totalCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  totalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: "#d4c4a8",
    fontWeight: "600",
  },
  totalBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  totalBadgeText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
  },
  totalValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 16,
  },
  totalValue: {
    fontSize: 48,
    fontWeight: "900",
    color: "#fff",
  },
  totalUnit: {
    fontSize: 18,
    color: "#d4c4a8",
    fontWeight: "600",
    marginLeft: 6,
  },
  progressBarContainer: {
    height: 10,
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 5,
  },
  progressTextRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressText: {
    fontSize: 12,
    fontWeight: "600",
  },
  inputCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  inputHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  inputTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  dashboardButton: {
    backgroundColor: "rgba(196, 147, 93, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  dashboardButtonText: {
    fontSize: 12,
    color: "#C4935D",
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    fontSize: 16,
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  addButton: {
    paddingHorizontal: 24,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  entriesSection: {
    marginBottom: 24,
  },
  entriesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  entriesTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  entriesCount: {
    fontSize: 12,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 12,
  },
  entryCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  entryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  entryFood: {
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
    marginRight: 12,
  },
  calorieBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  calorieValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  entryFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  entryTime: {
    fontSize: 12,
    fontWeight: "500",
  },
  tipsSection: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 40,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  tipsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  tipCard: {
    flex: 1,
    marginHorizontal: 6,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  tipEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
});