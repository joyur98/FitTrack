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
} from "firebase/firestore";

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

  //Function to upload image to Cloudinary
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
  }, [requiredCalories]);

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

        {/* PROFILE */}
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

          <View>
            <Text style={styles.greeting}>Hello, {userName} 👋</Text>
            <Text style={styles.subtitle}>Let’s stay consistent today</Text>
          </View>
        </View>

        {/* SUMMARY */}
        <Text style={styles.summaryTitle}>Today’s Summary</Text>

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
          label="Profile"
          emoji="📊"
          active={pathname === "/profile"}
          onPress={() => router.push("/profile")}
        />
        <BottomNavItem
          label="Settings"
          emoji="⚙️"
          active={pathname === "/settings"}
          onPress={() => router.push("/settings")}
        />
      </View>
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
  greeting: { fontSize: 18, fontWeight: "700", color: "#fff" },
  subtitle: { fontSize: 12, color: "#d4c4a8" },

  summaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 14,
    color: "#4a3b31",
  },
  cardsRow: { flexDirection: "row" },

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
});
