import React, { useState, useEffect } from "react";
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
  Dimensions,
  FlatList,
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
  arrayUnion,
} from "firebase/firestore";

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

      const randomQuote =
        MOTIVATIONAL_QUOTES[
          Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)
        ];
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

    const intakeQ = query(
      collection(db, "calorie_intake"),
      where("userID", "==", user.uid)
    );

    const burnQ = query(
      collection(db, "calorie_burn"),
      where("userID", "==", user.uid)
    );

    const unsubIntake = onSnapshot(intakeQ, (snap) => {
      let total = 0;
      snap.forEach((d) => {
        const data = d.data();
        if (data.calorie && data.date?.toDate() >= today) {
          total += data.calorie;
        }
      });
      setTotalCalories(total);
    });

    const unsubBurn = onSnapshot(burnQ, (snap) => {
      let total = 0;
      snap.forEach((d) => {
        const data = d.data();
        if (data.calorie && data.date?.toDate() >= today) {
          total += data.calorie;
        }
      });
      setTotalBurnedCalories(total);
      setLoading(false);
    });

    return () => {
      unsubIntake();
      unsubBurn();
    };
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

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color="#C4935D" />
      </SafeAreaView>
    );
  }

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  const weeklyStats = getWeeklyStats();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.headerContainer}>
          <Text style={styles.appTitle}>FitTrack</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* PROFILE SECTION WITH EDIT BUTTON */}
        <View style={styles.profileSection}>
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
            style={styles.editButton}
            onPress={() => setEditProfileModalVisible(true)}
          >
            <Text style={styles.editButtonText}>✏️</Text>
          </TouchableOpacity>
        </View>

        {/* CONSISTENCY TRACKER CARD */}
        <TouchableOpacity
          style={styles.consistencyCard}
          onPress={() => setConsistencyModalVisible(true)}
        >
          <View style={styles.consistencyHeader}>
            <Text style={styles.consistencyTitle}>🔥 Your Streak</Text>
            <Text style={styles.streakNumber}>{consistencyData.streak}</Text>
          </View>
          <Text style={styles.consistencySubtitle}>
            {consistencyData.totalWorkouts} total workouts
          </Text>
          <Text style={styles.consistencyTip}>Tap to view full tracker</Text>
        </TouchableOpacity>

        {/* SUMMARY */}
        <Text style={styles.summaryTitle}>Today's Summary</Text>

        <View style={styles.cardsRow}>
          {/* BURNED */}
          <TouchableOpacity
            style={[styles.summaryCard, styles.burnedCard]}
            onPress={() => router.push("/calorieBurnScreen")}
          >
            <Text style={styles.cardIcon}>🔥</Text>
            <Text style={styles.cardValue}>{totalBurnedCalories}</Text>
            <Text style={styles.cardName}>Calories Burned</Text>
          </TouchableOpacity>

          {/* INTAKE */}
          <TouchableOpacity
            style={[styles.summaryCard, styles.intakeCard]}
            onPress={() => router.push("/calories")}
          >
            <Text style={styles.cardIcon}>🍎</Text>

            <Text
              style={styles.cardValueSmall}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {totalCalories} / {requiredCalories}
            </Text>

            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${intakePercentage}%` },
                ]}
              />
            </View>

            <Text style={styles.percentageText}>
              {intakePercentage}% of daily goal
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* BOTTOM NAV */}
      <View style={styles.bottomNav}>
        <BottomNavItem
          label="Workout"
          emoji="🏋️"
          active={pathname === "/workout"}
          onPress={() => router.push("/workout")}
        />
        <BottomNavItem
          label="Home"
          emoji="🏠"
          active={pathname === "/dashboard"}
          onPress={() => router.replace("/dashboard")}
        />
        <BottomNavItem
          label="Settings"
          emoji="⚙️"
          active={pathname === "/settings"}
          onPress={() => router.push("/settings")}
        />
      </View>

      {/* EDIT PROFILE MODAL */}
      <Modal
        visible={editProfileModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setEditProfileModalVisible(false)}
      >
        <SafeAreaView style={styles.modalOverlay}>
          <ScrollView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setEditProfileModalVisible(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <View style={{ width: 30 }} />
            </View>

            <View style={styles.modalBody}>
              {/* Full Name */}
              <Text style={styles.modalLabel}>Full Name *</Text>
              <TextInput
                style={styles.modalInput}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter your name"
                placeholderTextColor="#aaa"
              />

              {/* Age */}
              <Text style={styles.modalLabel}>Age</Text>
              <TextInput
                style={styles.modalInput}
                value={age}
                onChangeText={setAge}
                placeholder="Enter your age"
                keyboardType="numeric"
                placeholderTextColor="#aaa"
              />

              {/* Gender */}
              <Text style={styles.modalLabel}>Gender</Text>
              <View style={styles.genderContainer}>
                {["Male", "Female", "Other"].map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[
                      styles.genderButton,
                      gender === g && styles.genderButtonActive,
                    ]}
                    onPress={() => setGender(g)}
                  >
                    <Text
                      style={[
                        styles.genderButtonText,
                        gender === g && styles.genderButtonTextActive,
                      ]}
                    >
                      {g}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Height */}
              <Text style={styles.modalLabel}>Height (cm)</Text>
              <TextInput
                style={styles.modalInput}
                value={height}
                onChangeText={setHeight}
                placeholder="Enter your height"
                keyboardType="decimal-pad"
                placeholderTextColor="#aaa"
              />

              {/* Weight */}
              <Text style={styles.modalLabel}>Weight (kg)</Text>
              <TextInput
                style={styles.modalInput}
                value={weight}
                onChangeText={setWeight}
                placeholder="Enter your weight"
                keyboardType="decimal-pad"
                placeholderTextColor="#aaa"
              />

              {/* Activity Level */}
              <Text style={styles.modalLabel}>Activity Level</Text>
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
                      activityLevel === level.value &&
                        styles.activityButtonActive,
                    ]}
                    onPress={() => setActivityLevel(level.value)}
                  >
                    <Text
                      style={[
                        styles.activityButtonText,
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
              <Text style={styles.modalLabel}>Fitness Focus</Text>
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
                      fitnessFocus === focus.value && styles.focusButtonActive,
                    ]}
                    onPress={() => setFitnessFocus(focus.value)}
                  >
                    <Text
                      style={[
                        styles.focusButtonText,
                        fitnessFocus === focus.value &&
                          styles.focusButtonTextActive,
                      ]}
                    >
                      {focus.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Save Button */}
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={handleEditProfile}
              >
                <Text style={styles.modalSaveButtonText}>💾 Save Changes</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* CONSISTENCY TRACKER MODAL */}
      <Modal
        visible={consistencyModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setConsistencyModalVisible(false)}
      >
        <SafeAreaView style={styles.trackerModalOverlay}>
          <ScrollView style={styles.trackerModalContent}>
            <View style={styles.trackerModalHeader}>
              <TouchableOpacity
                onPress={() => setConsistencyModalVisible(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.trackerModalTitle}>Consistency Tracker</Text>
              <View style={{ width: 30 }} />
            </View>

            {/* Motivational Quote */}
            <View style={styles.quoteContainer}>
              <Text style={styles.quoteText}>{currentQuote}</Text>
            </View>

            {/* Stats Cards */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statEmoji}>🔥</Text>
                <Text style={styles.statNumber}>{consistencyData.streak}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statEmoji}>💪</Text>
                <Text style={styles.statNumber}>
                  {consistencyData.totalWorkouts}
                </Text>
                <Text style={styles.statLabel}>Total Workouts</Text>
              </View>
            </View>

            {/* Weekly Attendance */}
            <View style={styles.weeklyContainer}>
              <Text style={styles.weeklyTitle}>📅 This Week</Text>
              <View style={styles.weeklyGrid}>
                {weeklyStats.map((day, index) => (
                  <View key={index} style={styles.weeklyDay}>
                    <Text style={styles.weeklyDayLabel}>{day.day}</Text>
                    <View
                      style={[
                        styles.weeklyDayDot,
                        day.hasWorkout && styles.weeklyDayDotActive,
                      ]}
                    >
                      <Text style={styles.weeklyDayIcon}>
                        {day.hasWorkout ? "✅" : "⭕"}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Attendance Graph */}
            <View style={styles.graphContainer}>
              <Text style={styles.graphTitle}>📊 Attendance Graph</Text>
              <View style={styles.barChart}>
                {weeklyStats.map((day, index) => (
                  <View key={index} style={styles.barWrapper}>
                    <View
                      style={[
                        styles.bar,
                        day.hasWorkout && styles.barActive,
                      ]}
                    />
                    <Text style={styles.barLabel}>{day.day}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Daily Check-In */}
            <TouchableOpacity
              style={styles.checkinButton}
              onPress={handleDailyCheckIn}
            >
              <Text style={styles.checkinButtonText}>✔️ Daily Check-In</Text>
            </TouchableOpacity>

            {/* Milestone Info */}
            <View style={styles.milestoneContainer}>
              <Text style={styles.milestoneTitle}>🏆 Milestones</Text>
              <View style={styles.milestoneRow}>
                <View
                  style={[
                    styles.milestoneBadge,
                    consistencyData.streak >= 7 && styles.milestoneBadgeActive,
                  ]}
                >
                  <Text style={styles.milestoneBadgeText}>7 Day 🎯</Text>
                </View>
                <View
                  style={[
                    styles.milestoneBadge,
                    consistencyData.streak >= 30 && styles.milestoneBadgeActive,
                  ]}
                >
                  <Text style={styles.milestoneBadgeText}>30 Day 🌟</Text>
                </View>
              </View>
              <View style={styles.milestoneRow}>
                <View
                  style={[
                    styles.milestoneBadge,
                    consistencyData.streak >= 100 && styles.milestoneBadgeActive,
                  ]}
                >
                  <Text style={styles.milestoneBadgeText}>100 Day 👑</Text>
                </View>
                <View
                  style={[
                    styles.milestoneBadge,
                    consistencyData.totalWorkouts >= 50 &&
                      styles.milestoneBadgeActive,
                  ]}
                >
                  <Text style={styles.milestoneBadgeText}>50 Workouts 💎</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

/* NAV ITEM */
const BottomNavItem = ({ emoji, label, active, onPress }) => (
  <TouchableOpacity
    style={[styles.navItem, active && styles.navItemActive]}
    onPress={onPress}
  >
    <Text style={[styles.navEmoji, active && styles.navEmojiActive]}>
      {emoji}
    </Text>
    <Text style={[styles.navText, active && styles.navTextActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

/* STYLES */
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f8f5f0" },
  container: { padding: 16, paddingBottom: 120 },

  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  appTitle: { fontSize: 28, fontWeight: "800", color: "#4a3b31" },
  logoutButton: {
    backgroundColor: "#C4935D",
    padding: 8,
    borderRadius: 8,
  },
  logoutButtonText: { color: "#fff", fontSize: 12 },

  profileSection: {
    backgroundColor: "#5b4334",
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  profilePic: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 14,
    borderWidth: 2,
    borderColor: "#C4935D",
  },
  profileInfo: {
    flex: 1,
  },
  greeting: { fontSize: 18, fontWeight: "700", color: "#fff" },
  subtitle: { fontSize: 12, color: "#d4c4a8" },
  editButton: {
    backgroundColor: "#C4935D",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  editButtonText: { fontSize: 18 },

  // Consistency Tracker Styles
  consistencyCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    elevation: 3,
    borderLeftWidth: 5,
    borderLeftColor: "#e74c3c",
  },
  consistencyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  consistencyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4a3b31",
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: "900",
    color: "#e74c3c",
  },
  consistencySubtitle: {
    fontSize: 12,
    color: "#8b7968",
    marginBottom: 8,
  },
  consistencyTip: {
    fontSize: 11,
    color: "#C4935D",
    fontWeight: "600",
  },

  summaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 14,
    color: "#4a3b31",
  },
  cardsRow: { flexDirection: "row", marginBottom: 20 },

  summaryCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginHorizontal: 6,
    elevation: 3,
  },
  burnedCard: { borderTopWidth: 4, borderTopColor: "#e74c3c" },
  intakeCard: { borderTopWidth: 4, borderTopColor: "#27ae60" },

  cardIcon: { fontSize: 26 },
  cardValue: {
    fontSize: 26,
    fontWeight: "800",
    color: "#4a3b31",
    marginTop: 6,
  },
  cardValueSmall: {
    fontSize: 20,
    fontWeight: "800",
    color: "#4a3b31",
    marginTop: 6,
  },
  cardName: { fontSize: 12, color: "#8b7968", marginTop: 4 },

  progressBarBackground: {
    width: "100%",
    height: 8,
    backgroundColor: "#eee4d8",
    borderRadius: 10,
    marginTop: 10,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#27ae60",
  },
  percentageText: {
    fontSize: 11,
    color: "#8b7968",
    marginTop: 6,
  },

  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 8,
  },
  navItem: { alignItems: "center", paddingVertical: 6 },
  navItemActive: { backgroundColor: "#f8f5f0", borderRadius: 10 },
  navEmoji: { fontSize: 22 },
  navEmojiActive: { color: "#C4935D" },
  navText: { fontSize: 11, color: "#8b7968" },
  navTextActive: { color: "#C4935D", fontWeight: "600" },

  // Edit Profile Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: "auto",
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalCloseText: { fontSize: 24, color: "#8b7968", fontWeight: "700" },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#4a3b31" },
  modalBody: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 30,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4a3b31",
    marginBottom: 8,
    marginTop: 12,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    marginBottom: 6,
    color: "#4a3b31",
    backgroundColor: "#f9f9f9",
  },

  // Gender Buttons
  genderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
    backgroundColor: "#f9f9f9",
  },
  genderButtonActive: {
    backgroundColor: "#C4935D",
    borderColor: "#C4935D",
  },
  genderButtonText: {
    fontSize: 13,
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
    marginBottom: 6,
  },
  activityButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
    backgroundColor: "#f9f9f9",
  },
  activityButtonActive: {
    backgroundColor: "#C4935D",
    borderColor: "#C4935D",
  },
  activityButtonText: {
    fontSize: 12,
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
    marginBottom: 6,
  },
  focusButton: {
    width: "48%",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: "1%",
    marginBottom: 10,
    backgroundColor: "#f9f9f9",
  },
  focusButtonActive: {
    backgroundColor: "#C4935D",
    borderColor: "#C4935D",
  },
  focusButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8b7968",
  },
  focusButtonTextActive: {
    color: "#fff",
  },

  // Save Button
  modalSaveButton: {
    backgroundColor: "#C4935D",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  modalSaveButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  // Tracker Modal Styles
  trackerModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  trackerModalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: "auto",
    maxHeight: "95%",
  },
  trackerModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  trackerModalTitle: { fontSize: 18, fontWeight: "700", color: "#4a3b31" },

  // Quote Section
  quoteContainer: {
    backgroundColor: "#fff3e0",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#C4935D",
  },
  quoteText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#4a3b31",
    textAlign: "center",
    lineHeight: 22,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#5b4334",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginHorizontal: 6,
    elevation: 3,
  },
  statEmoji: { fontSize: 28, marginBottom: 8 },
  statNumber: {
    fontSize: 28,
    fontWeight: "900",
    color: "#C4935D",
  },
  statLabel: { fontSize: 11, color: "#d4c4a8", marginTop: 4 },

  // Weekly Attendance
  weeklyContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  weeklyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4a3b31",
    marginBottom: 12,
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
    fontSize: 11,
    fontWeight: "600",
    color: "#8b7968",
    marginBottom: 6,
  },
  weeklyDayDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  weeklyDayIcon: { fontSize: 18 },

  // Graph Container
  graphContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  graphTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4a3b31",
    marginBottom: 12,
  },
  barChart: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 120,
  },
  barWrapper: {
    alignItems: "center",
    flex: 1,
  },
  bar: {
    width: 32,
    height: 30,
    backgroundColor: "#eee",
    borderRadius: 6,
    marginBottom: 8,
  },
  barActive: {
    height: 80,
    backgroundColor: "#27ae60",
  },
  barLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#8b7968",
  },

  // Check-In Button
  checkinButton: {
    backgroundColor: "#e74c3c",
    paddingVertical: 14,
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 10,
    alignItems: "center",
    elevation: 3,
  },
  checkinButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },

  // Milestones
  milestoneContainer: {
    paddingHorizontal: 16,
    marginBottom: 30,
  },
  milestoneTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4a3b31",
    marginBottom: 12,
  },
  milestoneRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  milestoneBadge: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    marginHorizontal: 6,
    borderWidth: 2,
    borderColor: "#ddd",
  },
  milestoneBadgeActive: {
    backgroundColor: "#C4935D",
    borderColor: "#C4935D",
  },
  milestoneBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4a3b31",
  },
});