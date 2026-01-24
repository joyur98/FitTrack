import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Animated,
  Easing,
  Dimensions,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter, usePathname } from "expo-router";
import { auth } from "./firebaseConfig";
import { signOut } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";

const { width } = Dimensions.get('window');

const MOTIVATIONAL_QUOTES = [
  "💪 Every rep counts. Keep pushing!",
  "🔥 Consistency is the key to success!",
  "🎯 You're stronger than yesterday!",
  "⚡ Pain is weakness leaving the body!",
  "🏆 No pain, no gain!",
  "🌟 Your only limit is you!",
  "💯 You've got this, champ!",
  "🚀 Progress over perfection!",
  "🔐 Discipline equals freedom!",
  "✨ Make it count today!",
];

export default function Dashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const db = getFirestore();

  const [profileImage, setProfileImage] = useState(null);
  const [userName, setUserName] = useState("User");
  const [loading, setLoading] = useState(true);
  const [totalCalories, setTotalCalories] = useState(0);
  const [totalBurnedCalories, setTotalBurnedCalories] = useState(0);
  const [requiredCalories, setRequiredCalories] = useState(2000);
  const [goal, setGoal] = useState("maintain");

  // Edit Profile Modal States
  const [editProfileModalVisible, setEditProfileModalVisible] = useState(false);
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [gender, setGender] = useState("Male");
  const [activityLevel, setActivityLevel] = useState("moderate");
  const [fitnessFocus, setFitnessFocus] = useState("balance");

  // Consistency Tracker States
  const [consistencyModalVisible, setConsistencyModalVisible] = useState(false);
  const [consistencyData, setConsistencyData] = useState({
    streak: 0,
    lastCheckinDate: null,
    workoutDates: [],
    totalWorkouts: 0,
  });
  const [currentQuote, setCurrentQuote] = useState(MOTIVATIONAL_QUOTES[0]);

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Weekly Calorie Data State
  const [weeklyCalorieData, setWeeklyCalorieData] = useState([]);

  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [scaleAnim] = useState(new Animated.Value(0.95));
  const [cardScaleAnim] = useState(new Animated.Value(0.9));
  const [profileScaleAnim] = useState(new Animated.Value(0.9));
  const [progressWidth] = useState(new Animated.Value(0));

  // Use refs for animations
  const entryAnimations = useRef([]);

  // Function to upload image to Cloudinary
  const uploadToCloudinary = async (imageUri) => {
    const data = new FormData();
    data.append("file", {
      uri: imageUri,
      type: "image/jpeg",
      name: "profile.jpg",
    });
    data.append("upload_preset", "Images");
    data.append("cloud_name", "dvwemoge3");

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dvwemoge3/image/upload",
      {
        method: "POST",
        body: data,
      }
    );

    const json = await res.json();
    return json.secure_url;
  };

  // Toggle dark mode
  const toggleDarkMode = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const newMode = !isDarkMode;
    setIsDarkMode(newMode);

    try {
      await updateDoc(doc(db, "users", user.uid), {
        darkMode: newMode,
      });
    } catch (error) {
      console.error("Error updating dark mode:", error);
    }
  };

  // Calculate streak based on consecutive days
  const calculateStreak = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const streakRef = doc(db, "users", user.uid);
      const streakSnap = await getDoc(streakRef);
      if (streakSnap.exists()) {
        const streakData = streakSnap.data();
        setConsistencyData({
          streak: streakData.streak || 0,
          lastCheckinDate: streakData.lastCheckinDate,
          workoutDates: streakData.workoutDates || [],
          totalWorkouts: streakData.totalWorkouts || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching streak:", error);
    }
  };

  // Fetch weekly calorie data (simplified to avoid index)
  const fetchWeeklyCalorieData = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const intakeQ = query(
        collection(db, "calorie_intake"),
        where("userID", "==", user.uid)
      );

      const unsubscribe = onSnapshot(intakeQ, (snapshot) => {
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - 6);
        weekStart.setHours(0, 0, 0, 0);

        const dailyTotals = {};
        for (let i = 0; i < 7; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          const dateKey = date.toDateString();
          dailyTotals[dateKey] = {
            day: date.toLocaleDateString('en-US', { weekday: 'short' }),
            calories: 0,
            date: dateKey,
          };
        }

        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.date && data.calorie) {
            const date = data.date.toDate();
            const dateKey = date.toDateString();
            if (date >= weekStart && dailyTotals[dateKey]) {
              dailyTotals[dateKey].calories += Number(data.calorie);
            }
          }
        });

        const weekData = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          const dateKey = date.toDateString();
          
          if (dailyTotals[dateKey]) {
            weekData.push(dailyTotals[dateKey]);
          } else {
            weekData.push({
              day: date.toLocaleDateString('en-US', { weekday: 'short' }),
              calories: 0,
              date: dateKey,
            });
          }
        }

        setWeeklyCalorieData(weekData);
      });

      return unsubscribe;
    } catch (error) {
      console.error("Error fetching weekly calorie data:", error);
    }
  };

  // Update streak on check-in
  const handleDailyCheckIn = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const today = new Date().toDateString();
      const lastDate = consistencyData.lastCheckinDate?.toDate?.()?.toDateString?.();

      let newStreak = consistencyData.streak;
      if (lastDate !== today) {
        newStreak += 1;
      }

      const newWorkoutDates = [...(consistencyData.workoutDates || []), today];

      await updateDoc(doc(db, "users", user.uid), {
        streak: newStreak,
        lastCheckinDate: new Date(),
        workoutDates: newWorkoutDates,
        totalWorkouts: (consistencyData.totalWorkouts || 0) + 1,
      });

      setConsistencyData({
        streak: newStreak,
        lastCheckinDate: new Date(),
        workoutDates: newWorkoutDates,
        totalWorkouts: (consistencyData.totalWorkouts || 0) + 1,
      });

      const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
      setCurrentQuote(randomQuote);

      Alert.alert(
        "✅ Check-in Complete",
        `${randomQuote}\nYou're on a ${newStreak} day streak!`
      );
    } catch (error) {
      Alert.alert("Error", "Could not update streak");
    }
  };

  // Edit profile function
  const handleEditProfile = async () => {
    const user = auth.currentUser;
    if (!user || !fullName.trim()) {
      Alert.alert("Error", "Please enter a valid name");
      return;
    }

    try {
      await updateDoc(doc(db, "users", user.uid), {
        fullName: fullName,
        age: age ? parseInt(age) : null,
        height: height ? parseFloat(height) : null,
        weight: weight ? parseFloat(weight) : null,
        gender: gender,
        activityLevel: activityLevel,
        fitnessFocus: fitnessFocus,
      });

      setUserName(fullName);
      setEditProfileModalVisible(false);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      Alert.alert("Error", "Could not update profile");
    }
  };

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const fetchUser = async () => {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        const data = snap.data();
        setUserName(data.fullName);
        setFullName(data.fullName);
        setAge(data.age ? data.age.toString() : "");
        setHeight(data.height ? data.height.toString() : "");
        setWeight(data.weight ? data.weight.toString() : "");
        setGender(data.gender || "Male");
        setActivityLevel(data.activityLevel || "moderate");
        setFitnessFocus(data.fitnessFocus || "balance");

        // Set dark mode from Firestore
        setIsDarkMode(data.darkMode || false);

        if (data.profileImage) {
          setProfileImage(data.profileImage);
        }

        const bmr = calculateBMR(data);
        const tdee = calculateTDEE(bmr, data.activityLevel);
        const userGoal = data.goal || "maintain";
        setGoal(userGoal);

        let finalCalories = tdee;
        if (userGoal === "lose") finalCalories -= 500;
        if (userGoal === "gain") finalCalories += 500;

        setRequiredCalories(Math.round(finalCalories));
      }
    };

    fetchUser();
    calculateStreak();
    fetchWeeklyCalorieData();

    // Main animations
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
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(cardScaleAnim, {
        toValue: 1,
        friction: 8,
        delay: 100,
        useNativeDriver: true,
      }),
      Animated.spring(profileScaleAnim, {
        toValue: 1,
        friction: 8,
        delay: 50,
        useNativeDriver: true,
      }),
    ]).start();

    // FIXED: Simplified queries to avoid composite index requirement
    const intakeQ = query(
      collection(db, "calorie_intake"),
      where("userID", "==", user.uid)
    );

    const burnQ = query(
      collection(db, "calorie_burn"),
      where("userID", "==", user.uid)
    );

    const unsubIntake = onSnapshot(intakeQ, (snap) => {
      let todayTotal = 0;
      snap.forEach((d) => {
        const data = d.data();
        if (data.calorie && data.date) {
          const itemDate = data.date.toDate();
          // Filter client-side for today's date
          if (itemDate >= today) {
            todayTotal += data.calorie;
          }
        }
      });
      setTotalCalories(todayTotal);
      
      // Animate progress bar
      const percentage = Math.min((todayTotal / requiredCalories) * 100, 100);
      Animated.timing(progressWidth, {
        toValue: percentage,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    });

    const unsubBurn = onSnapshot(burnQ, (snap) => {
      let todayTotal = 0;
      snap.forEach((d) => {
        const data = d.data();
        if (data.calorie && data.date) {
          const itemDate = data.date.toDate();
          // Filter client-side for today's date
          if (itemDate >= today) {
            todayTotal += data.calorie;
          }
        }
      });
      setTotalBurnedCalories(todayTotal);
      setLoading(false);
    });

    return () => {
      unsubIntake();
      unsubBurn();
    };
  }, []);

  // Initialize entry animations
  useEffect(() => {
    const weeklyStats = getWeeklyStats();
    entryAnimations.current = weeklyStats.map(() => ({
      slide: new Animated.Value(20),
      fade: new Animated.Value(0),
    }));
  }, []);

  // Animate entries when they change
  useEffect(() => {
    entryAnimations.current.forEach((anim, index) => {
      Animated.sequence([
        Animated.delay(index * 80),
        Animated.parallel([
          Animated.timing(anim.fade, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(anim.slide, {
            toValue: 0,
            duration: 300,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    });
  }, []);

  // ---------- CALCULATIONS ----------
  const calculateBMR = ({ weight, height }) =>
    10 * weight + 6.25 * height - 5 * 25 + 5;

  const calculateTDEE = (bmr, activityLevel) => {
    if (activityLevel === "moderate") return bmr * 1.55;
    if (activityLevel === "high") return bmr * 1.9;
    return bmr * 1.2;
  };

  const intakePercentage = Math.min(
    Math.round((totalCalories / requiredCalories) * 100),
    100
  );

  const pickProfileImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) return;

      setLoading(true);

      const imageUri = result.assets[0].uri;

      // Upload to Cloudinary
      const imageUrl = await uploadToCloudinary(imageUri);

      // Save URL to Firestore
      const user = auth.currentUser;
      if (user) {
        await updateDoc(doc(db, "users", user.uid), {
          profileImage: imageUrl,
        });
      }

      setProfileImage(imageUrl);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      Alert.alert("Upload failed", "Could not upload profile image");
    }
  };

  // Calculate weekly stats for consistency tracker
  const getWeeklyStats = () => {
    const today = new Date();
    const weekDays = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      weekDays.push(date.toDateString());
    }

    return weekDays.map((day) => ({
      day: day.split(" ")[0],
      hasWorkout: consistencyData.workoutDates?.includes(day),
    }));
  };

  // Calculate max calories for weekly graph scaling
  const getMaxCalories = () => {
    if (weeklyCalorieData.length === 0) return requiredCalories;
    const max = Math.max(...weeklyCalorieData.map(item => item.calories));
    return Math.max(max, requiredCalories) || requiredCalories;
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, isDarkMode && styles.darkSafeArea]}>
        <ActivityIndicator size="large" color="#C4935D" />
      </SafeAreaView>
    );
  }

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  const weeklyStats = getWeeklyStats();
  const maxCalories = getMaxCalories();

  // Theme-based styles
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
    if (intakePercentage < 70) return "#27ae60";
    if (intakePercentage < 90) return "#f39c12";
    return "#e74c3c";
  };

  return (
    <SafeAreaView style={[styles.safeArea, isDarkMode && styles.darkSafeArea]}>
      <Animated.ScrollView 
        style={[
          styles.container, 
          { 
            backgroundColor: theme.backgroundColor,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]} 
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <Animated.View 
          style={[
            styles.headerContainer,
            { transform: [{ scale: scaleAnim }] }
          ]}
        >
          <Text style={[styles.appTitle, { color: theme.textColor }]}>
            FitTrack
          </Text>
          
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={[styles.darkModeButton, { backgroundColor: theme.cardBackground }]}
              onPress={toggleDarkMode}
            >
              <Text style={styles.darkModeEmoji}>
                {isDarkMode ? "☀️" : "🌙"}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.logoutButton, { backgroundColor: theme.primaryColor }]} 
              onPress={handleLogout}
            >
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* PROFILE SECTION WITH EDIT BUTTON */}
        <Animated.View 
          style={[
            styles.profileSection, 
            { 
              backgroundColor: theme.secondaryColor,
              transform: [{ scale: profileScaleAnim }]
            }
          ]}
        >
          <TouchableOpacity onPress={pickProfileImage}>
            <Image
              source={{
                uri:
                  profileImage ||
                  "https://i.pinimg.com/474x/08/35/0c/08350cafa4fabb8a6a1be2d9f18f2d88.jpg",
              }}
              style={styles.profilePic}
            />
          </TouchableOpacity>

          <View style={styles.profileInfo}>
            <Text style={styles.greeting}>Hello, {userName} 👋</Text>
            <Text style={styles.subtitle}>Let's stay consistent today</Text>
          </View>

          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: theme.primaryColor }]}
            onPress={() => setEditProfileModalVisible(true)}
          >
            <Text style={styles.editButtonText}>✏️</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* CONSISTENCY TRACKER CARD */}
        <Animated.View
          style={[
            styles.consistencyCard, 
            { 
              backgroundColor: theme.cardBackground,
              borderLeftColor: "#e74c3c",
              transform: [{ scale: cardScaleAnim }]
            }
          ]}
        >
          <TouchableOpacity onPress={() => setConsistencyModalVisible(true)} activeOpacity={0.7}>
            <View style={styles.consistencyHeader}>
              <Text style={[styles.consistencyTitle, { color: theme.textColor }]}>
                🔥 Your Streak
              </Text>
              <Text style={styles.streakNumber}>{consistencyData.streak}</Text>
            </View>
            <Text style={[styles.consistencySubtitle, { color: theme.secondaryText }]}>
              {consistencyData.totalWorkouts} total workouts
            </Text>
            <Text style={[styles.consistencyTip, { color: theme.primaryColor }]}>
              Tap to view full tracker
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* SUMMARY */}
        <Text style={[styles.summaryTitle, { color: theme.textColor }]}>
          Today's Summary
        </Text>

        <View style={styles.cardsRow}>
          {/* BURNED CARD */}
          <Animated.View style={{ flex: 1, transform: [{ scale: cardScaleAnim }] }}>
            <TouchableOpacity
              style={[styles.summaryCard, styles.burnedCard, { 
                backgroundColor: theme.cardBackground,
                borderTopColor: "#e74c3c"
              }]}
              onPress={() => router.push("/calorieBurnScreen")}
              activeOpacity={0.8}
            >
              <Text style={styles.cardIcon}>🔥</Text>
              <Text style={[styles.cardValue, { color: theme.textColor }]}>
                {totalBurnedCalories}
              </Text>
              <Text style={[styles.cardName, { color: theme.secondaryText }]}>
                Calories Burned
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* INTAKE CARD */}
          <Animated.View style={{ flex: 1, transform: [{ scale: cardScaleAnim }] }}>
            <TouchableOpacity
              style={[styles.summaryCard, styles.intakeCard, { 
                backgroundColor: theme.cardBackground,
                borderTopColor: "#27ae60"
              }]}
              onPress={() => router.push("/calories")}
              activeOpacity={0.8}
            >
              <Text style={styles.cardIcon}>🍎</Text>

              <Text
                style={[styles.cardValueSmall, { color: theme.textColor }]}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {totalCalories} / {requiredCalories}
              </Text>

              <View style={[styles.progressBarBackground, 
                { backgroundColor: theme.inputBackground }
              ]}>
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

              <Text style={[styles.percentageText, { color: theme.secondaryText }]}>
                {intakePercentage}% of daily goal
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Animated.ScrollView>

      {/* BOTTOM NAV */}
      <View style={[styles.bottomNav, { backgroundColor: theme.cardBackground }]}>
        <BottomNavItem
          label="Workout"
          emoji="🏋️"
          active={pathname === "/workout"}
          onPress={() => router.push("/workout")}
          isDarkMode={isDarkMode}
          theme={theme}
        />
        <BottomNavItem
          label="Home"
          emoji="🏠"
          active={pathname === "/dashboard"}
          onPress={() => router.replace("/dashboard")}
          isDarkMode={isDarkMode}
          theme={theme}
        />
        <BottomNavItem
          label="Settings"
          emoji="⚙️"
          active={pathname === "/settings"}
          onPress={() => router.push("/settings")}
          isDarkMode={isDarkMode}
          theme={theme}
        />
      </View>

      {/* EDIT PROFILE MODAL */}
      <Modal
        visible={editProfileModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEditProfileModalVisible(false)}
      >
        <SafeAreaView style={[styles.modalOverlay, isDarkMode && styles.darkModalOverlay]}>
          <Animated.ScrollView 
            style={[
              styles.modalContent, 
              { 
                backgroundColor: theme.cardBackground,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={[styles.modalHeader, { borderBottomColor: theme.borderColor }]}>
              <TouchableOpacity
                onPress={() => setEditProfileModalVisible(false)}
              >
                <Text style={[styles.modalCloseText, { color: theme.secondaryText }]}>✕</Text>
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: theme.textColor }]}>Edit Profile</Text>
              <View style={{ width: 30 }} />
            </View>

            <View style={styles.modalBody}>
              {/* Full Name */}
              <Text style={[styles.modalLabel, { color: theme.textColor }]}>Full Name *</Text>
              <TextInput
                style={[styles.modalInput, { 
                  backgroundColor: theme.inputBackground,
                  borderColor: theme.borderColor,
                  color: theme.textColor 
                }]}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter your name"
                placeholderTextColor={theme.secondaryText}
              />

              {/* Age */}
              <Text style={[styles.modalLabel, { color: theme.textColor }]}>Age</Text>
              <TextInput
                style={[styles.modalInput, { 
                  backgroundColor: theme.inputBackground,
                  borderColor: theme.borderColor,
                  color: theme.textColor 
                }]}
                value={age}
                onChangeText={setAge}
                placeholder="Enter your age"
                keyboardType="numeric"
                placeholderTextColor={theme.secondaryText}
              />

              {/* Gender */}
              <Text style={[styles.modalLabel, { color: theme.textColor }]}>Gender</Text>
              <View style={styles.genderContainer}>
                {["Male", "Female", "Other"].map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[
                      styles.genderButton,
                      { 
                        backgroundColor: theme.inputBackground,
                        borderColor: theme.borderColor 
                      },
                      gender === g && styles.genderButtonActive,
                    ]}
                    onPress={() => setGender(g)}
                  >
                    <Text
                      style={[
                        styles.genderButtonText,
                        { color: theme.secondaryText },
                        gender === g && styles.genderButtonTextActive,
                      ]}
                    >
                      {g}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Height */}
              <Text style={[styles.modalLabel, { color: theme.textColor }]}>Height (cm)</Text>
              <TextInput
                style={[styles.modalInput, { 
                  backgroundColor: theme.inputBackground,
                  borderColor: theme.borderColor,
                  color: theme.textColor 
                }]}
                value={height}
                onChangeText={setHeight}
                placeholder="Enter your height"
                keyboardType="decimal-pad"
                placeholderTextColor={theme.secondaryText}
              />

              {/* Weight */}
              <Text style={[styles.modalLabel, { color: theme.textColor }]}>Weight (kg)</Text>
              <TextInput
                style={[styles.modalInput, { 
                  backgroundColor: theme.inputBackground,
                  borderColor: theme.borderColor,
                  color: theme.textColor 
                }]}
                value={weight}
                onChangeText={setWeight}
                placeholder="Enter your weight"
                keyboardType="decimal-pad"
                placeholderTextColor={theme.secondaryText}
              />

              {/* Activity Level */}
              <Text style={[styles.modalLabel, { color: theme.textColor }]}>Activity Level</Text>
              <View style={styles.activityContainer}>
                {[
                  { label: "Low", value: "low" },
                  { label: "Moderate", value: "moderate" },
                  { label: "High", value: "high" },
                ].map((level) => (
                  <TouchableOpacity
                    key={level.value}
                    style={[
                      styles.activityButton,
                      { 
                        backgroundColor: theme.inputBackground,
                        borderColor: theme.borderColor 
                      },
                      activityLevel === level.value &&
                        styles.activityButtonActive,
                    ]}
                    onPress={() => setActivityLevel(level.value)}
                  >
                    <Text
                      style={[
                        styles.activityButtonText,
                        { color: theme.secondaryText },
                        activityLevel === level.value &&
                          styles.activityButtonTextActive,
                      ]}
                    >
                      {level.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Fitness Focus */}
              <Text style={[styles.modalLabel, { color: theme.textColor }]}>Fitness Focus</Text>
              <View style={styles.focusContainer}>
                {[
                  { label: "💪 Strength", value: "strength" },
                  { label: "🏃 Cardio", value: "cardio" },
                  { label: "⚖️ Balance", value: "balance" },
                  { label: "📈 Muscle Gain", value: "gain" },
                  { label: "🏋️ Weight Loss", value: "lose" },
                  { label: "🧘 Flexibility", value: "flexibility" },
                ].map((focus) => (
                  <TouchableOpacity
                    key={focus.value}
                    style={[
                      styles.focusButton,
                      { 
                        backgroundColor: theme.inputBackground,
                        borderColor: theme.borderColor 
                      },
                      fitnessFocus === focus.value && styles.focusButtonActive,
                    ]}
                    onPress={() => setFitnessFocus(focus.value)}
                  >
                    <Text
                      style={[
                        styles.focusButtonText,
                        { color: theme.secondaryText },
                        fitnessFocus === focus.value &&
                          styles.focusButtonTextActive,
                      ]}
                    >
                      {focus.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Dark Mode Toggle in Edit Profile */}
              <View style={styles.darkModeToggleContainer}>
                <Text style={[styles.modalLabel, { color: theme.textColor }]}>
                  Dark Mode
                </Text>
                <TouchableOpacity
                  style={[
                    styles.darkModeToggle,
                    { backgroundColor: isDarkMode ? "#C4935D" : "#ddd" }
                  ]}
                  onPress={toggleDarkMode}
                >
                  <View style={[
                    styles.darkModeToggleCircle,
                    { 
                      transform: [{ translateX: isDarkMode ? 20 : 0 }],
                      backgroundColor: '#fff'
                    }
                  ]}>
                    <Text style={styles.darkModeToggleIcon}>
                      {isDarkMode ? "🌙" : "☀️"}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Save Button */}
              <TouchableOpacity
                style={[styles.modalSaveButton, { backgroundColor: theme.primaryColor }]}
                onPress={handleEditProfile}
              >
                <Text style={styles.modalSaveButtonText}>💾 Save Changes</Text>
              </TouchableOpacity>
            </View>
          </Animated.ScrollView>
        </SafeAreaView>
      </Modal>

      {/* CONSISTENCY TRACKER MODAL */}
      <Modal
        visible={consistencyModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setConsistencyModalVisible(false)}
      >
        <SafeAreaView style={[styles.trackerModalOverlay, isDarkMode && styles.darkModalOverlay]}>
          <Animated.ScrollView 
            style={[
              styles.trackerModalContent, 
              { 
                backgroundColor: theme.cardBackground,
                opacity: fadeAnim
              }
            ]}
          >
            <View style={[styles.trackerModalHeader, { borderBottomColor: theme.borderColor }]}>
              <TouchableOpacity
                onPress={() => setConsistencyModalVisible(false)}
              >
                <Text style={[styles.modalCloseText, { color: theme.secondaryText }]}>✕</Text>
              </TouchableOpacity>
              <Text style={[styles.trackerModalTitle, { color: theme.textColor }]}>Consistency Tracker</Text>
              <View style={{ width: 30 }} />
            </View>

            {/* Motivational Quote */}
            <Animated.View 
              style={[
                styles.quoteContainer, 
                { 
                  backgroundColor: isDarkMode ? "#2d2d2d" : "#fff3e0",
                  borderLeftColor: theme.primaryColor,
                  transform: [{ scale: scaleAnim }]
                }
              ]}
            >
              <Text style={[styles.quoteText, { color: isDarkMode ? "#fff" : "#4a3b31" }]}>
                {currentQuote}
              </Text>
            </Animated.View>

            {/* Stats Cards */}
            <View style={styles.statsGrid}>
              <Animated.View 
                style={[
                  styles.statCard, 
                  { 
                    backgroundColor: theme.secondaryColor,
                    transform: [{ scale: cardScaleAnim }]
                  }
                ]}
              >
                <Text style={styles.statEmoji}>🔥</Text>
                <Text style={styles.statNumber}>{consistencyData.streak}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </Animated.View>
              <Animated.View 
                style={[
                  styles.statCard, 
                  { 
                    backgroundColor: theme.secondaryColor,
                    transform: [{ scale: cardScaleAnim }]
                  }
                ]}
              >
                <Text style={styles.statEmoji}>💪</Text>
                <Text style={styles.statNumber}>
                  {consistencyData.totalWorkouts}
                </Text>
                <Text style={styles.statLabel}>Total Workouts</Text>
              </Animated.View>
            </View>

            {/* Weekly Calorie Intake Graph */}
            <View style={styles.graphContainer}>
              <Text style={[styles.graphTitle, { color: theme.textColor }]}>
                🍎 Weekly Calorie Intake
              </Text>
              {weeklyCalorieData.length > 0 ? (
                <>
                  <View style={styles.calorieBarChart}>
                    {weeklyCalorieData.map((day, index) => {
                      const heightPercentage = maxCalories > 0 
                        ? (day.calories / maxCalories) * 100 
                        : 0;
                      const isOverGoal = day.calories > requiredCalories;
                      return (
                        <Animated.View 
                          key={index} 
                          style={[
                            styles.calorieBarWrapper,
                            { 
                              opacity: entryAnimations.current[index]?.fade || 1,
                              transform: [{ translateY: entryAnimations.current[index]?.slide || 0 }]
                            }
                          ]}
                        >
                          <View style={styles.calorieBarContainer}>
                            <View
                              style={[
                                styles.calorieBar,
                                { 
                                  height: `${Math.max(heightPercentage, 5)}%`,
                                  backgroundColor: isOverGoal ? "#e74c3c" : "#27ae60"
                                }
                              ]}
                            />
                          </View>
                          <Text style={[styles.barLabel, { color: theme.secondaryText }]}>
                            {day.day}
                          </Text>
                          <Text style={[styles.calorieValue, { 
                            color: isOverGoal ? '#e74c3c' : theme.textColor,
                            fontWeight: isOverGoal ? 'bold' : 'normal',
                          }]}>
                            {day.calories}
                          </Text>
                        </Animated.View>
                      );
                    })}
                  </View>
                  <View style={[styles.graphLegend, { borderTopColor: theme.borderColor }]}>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendColor, { backgroundColor: "#27ae60" }]} />
                      <Text style={[styles.legendText, { color: theme.secondaryText }]}>
                        Within Goal ({requiredCalories})
                      </Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendColor, { backgroundColor: "#e74c3c" }]} />
                      <Text style={[styles.legendText, { color: theme.secondaryText }]}>
                        Over Goal
                      </Text>
                    </View>
                  </View>
                </>
              ) : (
                <Text style={[styles.noDataText, { color: theme.secondaryText }]}>
                  No calorie data available for the past week
                </Text>
              )}
            </View>

            {/* Weekly Attendance */}
            <View style={styles.weeklyContainer}>
              <Text style={[styles.weeklyTitle, { color: theme.textColor }]}>📅 This Week</Text>
              <View style={styles.weeklyGrid}>
                {weeklyStats.map((day, index) => (
                  <Animated.View 
                    key={index} 
                    style={[
                      styles.weeklyDay,
                      { 
                        opacity: entryAnimations.current[index]?.fade || 1,
                        transform: [{ translateY: entryAnimations.current[index]?.slide || 0 }]
                      }
                    ]}
                  >
                    <Text style={[styles.weeklyDayLabel, { color: theme.secondaryText }]}>
                      {day.day}
                    </Text>
                    <View
                      style={[
                        styles.weeklyDayDot,
                        { 
                          backgroundColor: isDarkMode ? "#3a3a3a" : "#eee",
                          borderColor: theme.borderColor
                        },
                        day.hasWorkout && styles.weeklyDayDotActive,
                      ]}
                    >
                      <Text style={styles.weeklyDayIcon}>
                        {day.hasWorkout ? "✅" : "⭕"}
                      </Text>
                    </View>
                  </Animated.View>
                ))}
              </View>
            </View>

            {/* Attendance Graph */}
            <View style={styles.graphContainer}>
              <Text style={[styles.graphTitle, { color: theme.textColor }]}>📊 Workout Attendance</Text>
              <View style={styles.barChart}>
                {weeklyStats.map((day, index) => (
                  <Animated.View 
                    key={index} 
                    style={[
                      styles.barWrapper,
                      { 
                        opacity: entryAnimations.current[index]?.fade || 1,
                        transform: [{ translateY: entryAnimations.current[index]?.slide || 0 }]
                      }
                    ]}
                  >
                    <View
                      style={[
                        styles.bar,
                        { backgroundColor: isDarkMode ? "#3a3a3a" : "#eee" },
                        day.hasWorkout && styles.barActive,
                      ]}
                    />
                    <Text style={[styles.barLabel, { color: theme.secondaryText }]}>
                      {day.day}
                    </Text>
                  </Animated.View>
                ))}
              </View>
            </View>

            {/* Daily Check-In */}
            <TouchableOpacity
              style={[styles.checkinButton, { backgroundColor: theme.primaryColor }]}
              onPress={handleDailyCheckIn}
              activeOpacity={0.8}
            >
              <Text style={styles.checkinButtonText}>✔️ Daily Check-In</Text>
            </TouchableOpacity>

            {/* Milestone Info */}
            <View style={styles.milestoneContainer}>
              <Text style={[styles.milestoneTitle, { color: theme.textColor }]}>🏆 Milestones</Text>
              <View style={styles.milestoneRow}>
                <View
                  style={[
                    styles.milestoneBadge,
                    { 
                      backgroundColor: isDarkMode ? "#3a3a3a" : "#f0f0f0",
                      borderColor: theme.borderColor
                    },
                    consistencyData.streak >= 7 && styles.milestoneBadgeActive,
                  ]}
                >
                  <Text style={[styles.milestoneBadgeText, { color: theme.textColor }]}>
                    7 Day 🎯
                  </Text>
                </View>
                <View
                  style={[
                    styles.milestoneBadge,
                    { 
                      backgroundColor: isDarkMode ? "#3a3a3a" : "#f0f0f0",
                      borderColor: theme.borderColor
                    },
                    consistencyData.streak >= 30 && styles.milestoneBadgeActive,
                  ]}
                >
                  <Text style={[styles.milestoneBadgeText, { color: theme.textColor }]}>
                    30 Day 🌟
                  </Text>
                </View>
              </View>
              <View style={styles.milestoneRow}>
                <View
                  style={[
                    styles.milestoneBadge,
                    { 
                      backgroundColor: isDarkMode ? "#3a3a3a" : "#f0f0f0",
                      borderColor: theme.borderColor
                    },
                    consistencyData.streak >= 100 && styles.milestoneBadgeActive,
                  ]}
                >
                  <Text style={[styles.milestoneBadgeText, { color: theme.textColor }]}>
                    100 Day 👑
                  </Text>
                </View>
                <View
                  style={[
                    styles.milestoneBadge,
                    { 
                      backgroundColor: isDarkMode ? "#3a3a3a" : "#f0f0f0",
                      borderColor: theme.borderColor
                    },
                    consistencyData.totalWorkouts >= 50 &&
                      styles.milestoneBadgeActive,
                  ]}
                >
                  <Text style={[styles.milestoneBadgeText, { color: theme.textColor }]}>
                    50 Workouts 💎
                  </Text>
                </View>
              </View>
            </View>
          </Animated.ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

/* NAV ITEM */
const BottomNavItem = ({ emoji, label, active, onPress, isDarkMode, theme }) => (
  <TouchableOpacity
    style={[
      styles.navItem, 
      active && { backgroundColor: isDarkMode ? "#3a3a3a" : "#f8f5f0", borderRadius: 10 }
    ]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={[
      styles.navEmoji, 
      active && styles.navEmojiActive
    ]}>
      {emoji}
    </Text>
    <Text style={[
      styles.navText, 
      { color: theme.secondaryText },
      active && styles.navTextActive
    ]}>
      {label}
    </Text>
  </TouchableOpacity>
);

/* STYLES */
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f8f5f0" },
  darkSafeArea: { backgroundColor: "#121212" },
  container: { padding: 16, paddingBottom: 120 },

  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  appTitle: { fontSize: 28, fontWeight: "800", color: "#4a3b31" },
  darkModeButton: {
    padding: 10,
    borderRadius: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  darkModeEmoji: {
    fontSize: 20,
  },
  logoutButton: {
    backgroundColor: "#C4935D",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  logoutButtonText: { color: "#fff", fontSize: 12, fontWeight: "700" },

  profileSection: {
    backgroundColor: "#5b4334",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  profilePic: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 16,
    borderWidth: 3,
    borderColor: "#C4935D",
  },
  profileInfo: {
    flex: 1,
  },
  greeting: { fontSize: 20, fontWeight: "800", color: "#fff" },
  subtitle: { fontSize: 13, color: "#d4c4a8", marginTop: 2 },
  editButton: {
    backgroundColor: "#C4935D",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  editButtonText: { fontSize: 20, color: "#fff" },

  // Consistency Tracker Styles
  consistencyCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderLeftWidth: 5,
  },
  consistencyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  consistencyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#4a3b31",
  },
  streakNumber: {
    fontSize: 36,
    fontWeight: "900",
    color: "#e74c3c",
  },
  consistencySubtitle: {
    fontSize: 13,
    color: "#8b7968",
    marginBottom: 8,
  },
  consistencyTip: {
    fontSize: 12,
    fontWeight: "700",
  },

  summaryTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 16,
    color: "#4a3b31",
  },
  cardsRow: { 
    flexDirection: "row", 
    marginBottom: 20,
    gap: 12 
  },

  summaryCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderTopWidth: 4,
  },
  burnedCard: { borderTopColor: "#e74c3c" },
  intakeCard: { borderTopColor: "#27ae60" },

  cardIcon: { fontSize: 32 },
  cardValue: {
    fontSize: 28,
    fontWeight: "900",
    color: "#4a3b31",
    marginTop: 8,
  },
  cardValueSmall: {
    fontSize: 22,
    fontWeight: "900",
    color: "#4a3b31",
    marginTop: 8,
    textAlign: "center",
  },
  cardName: { 
    fontSize: 13, 
    color: "#8b7968", 
    marginTop: 6,
    fontWeight: "600" 
  },

  progressBarBackground: {
    width: "100%",
    height: 10,
    borderRadius: 5,
    marginTop: 12,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 5,
  },
  percentageText: {
    fontSize: 12,
    color: "#8b7968",
    marginTop: 8,
    fontWeight: "600",
  },

  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  navItem: { 
    alignItems: "center", 
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  navEmoji: { fontSize: 24 },
  navEmojiActive: { color: "#C4935D" },
  navText: { fontSize: 12, color: "#8b7968", marginTop: 2, fontWeight: "600" },
  navTextActive: { color: "#C4935D", fontWeight: "800" },

  // Edit Profile Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  darkModalOverlay: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: "auto",
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalCloseText: { fontSize: 26, color: "#8b7968", fontWeight: "700" },
  modalTitle: { fontSize: 20, fontWeight: "800", color: "#4a3b31" },
  modalBody: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  modalLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#4a3b31",
    marginBottom: 8,
    marginTop: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    marginBottom: 8,
    color: "#4a3b31",
  },

  // Gender Buttons
  genderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 4,
  },
  genderButtonActive: {
    backgroundColor: "#C4935D",
    borderColor: "#C4935D",
  },
  genderButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#8b7968",
  },
  genderButtonTextActive: {
    color: "#fff",
  },

  // Activity Level Buttons
  activityContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  activityButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 4,
  },
  activityButtonActive: {
    backgroundColor: "#C4935D",
    borderColor: "#C4935D",
  },
  activityButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8b7968",
  },
  activityButtonTextActive: {
    color: "#fff",
  },

  // Fitness Focus Grid
  focusContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  focusButton: {
    width: "48%",
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: "1%",
    marginBottom: 12,
  },
  focusButtonActive: {
    backgroundColor: "#C4935D",
    borderColor: "#C4935D",
  },
  focusButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8b7968",
    textAlign: "center",
  },
  focusButtonTextActive: {
    color: "#fff",
  },

  // Dark Mode Toggle in Edit Profile
  darkModeToggleContainer: {
    marginBottom: 24,
    marginTop: 16,
  },
  darkModeToggle: {
    width: 64,
    height: 34,
    borderRadius: 17,
    padding: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  darkModeToggleCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  darkModeToggleIcon: {
    fontSize: 14,
  },

  // Save Button
  modalSaveButton: {
    backgroundColor: "#C4935D",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  modalSaveButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },

  // Tracker Modal Styles
  trackerModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  trackerModalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: "auto",
    maxHeight: "95%",
  },
  trackerModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  trackerModalTitle: { fontSize: 20, fontWeight: "800", color: "#4a3b31" },

  // Quote Section
  quoteContainer: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quoteText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4a3b31",
    textAlign: "center",
    lineHeight: 24,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#5b4334",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  statEmoji: { fontSize: 32, marginBottom: 12 },
  statNumber: {
    fontSize: 32,
    fontWeight: "900",
    color: "#C4935D",
  },
  statLabel: { fontSize: 12, color: "#d4c4a8", marginTop: 6, fontWeight: "600" },

  // Weekly Attendance
  weeklyContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  weeklyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#4a3b31",
    marginBottom: 16,
  },
  weeklyGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  weeklyDay: {
    alignItems: "center",
    flex: 1,
  },
  weeklyDayLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#8b7968",
    marginBottom: 8,
  },
  weeklyDayDot: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#ddd",
  },
  weeklyDayDotActive: {
    backgroundColor: "#c8e6c9",
    borderColor: "#27ae60",
  },
  weeklyDayIcon: { fontSize: 20 },

  // Graph Container
  graphContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  graphTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#4a3b31",
    marginBottom: 16,
  },
  barChart: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 140,
  },
  barWrapper: {
    alignItems: "center",
    flex: 1,
  },
  bar: {
    width: 36,
    height: 40,
    backgroundColor: "#eee",
    borderRadius: 8,
    marginBottom: 10,
  },
  barActive: {
    height: 100,
    backgroundColor: "#27ae60",
  },
  barLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#8b7968",
  },

  // Calorie Graph Styles
  calorieBarChart: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 200,
    marginBottom: 12,
  },
  calorieBarWrapper: {
    alignItems: "center",
    flex: 1,
    height: 200,
  },
  calorieBarContainer: {
    flex: 1,
    justifyContent: "flex-end",
    width: 36,
    marginBottom: 10,
  },
  calorieBar: {
    width: 36,
    borderRadius: 8,
    minHeight: 4,
  },
  calorieValue: {
    fontSize: 11,
    fontWeight: "700",
    marginTop: 6,
  },
  graphLegend: {
    flexDirection: "row",
    justifyContent: "center",
    paddingTop: 16,
    marginTop: 16,
    borderTopWidth: 1,
    gap: 24,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendColor: {
    width: 14,
    height: 14,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 12,
    fontWeight: "600",
  },
  noDataText: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 20,
    fontStyle: "italic",
  },

  // Check-In Button
  checkinButton: {
    backgroundColor: "#e74c3c",
    paddingVertical: 18,
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 12,
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  checkinButtonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },

  // Milestones
  milestoneContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  milestoneTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#4a3b31",
    marginBottom: 16,
  },
  milestoneRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 12,
  },
  milestoneBadge: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
  },
  milestoneBadgeActive: {
    backgroundColor: "#C4935D",
    borderColor: "#C4935D",
  },
  milestoneBadgeText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#4a3b31",
    textAlign: "center",
  },
});