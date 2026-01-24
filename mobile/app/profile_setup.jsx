import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Easing,
  ActivityIndicator,
  Dimensions
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { auth, db } from "./firebaseConfig";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { router } from "expo-router";

const { width, height } = Dimensions.get("window");

export default function ProfileSetup() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("male");
  const [activityLevel, setActivityLevel] = useState("moderate");
  const [goal, setGoal] = useState("maintain");
  const [fitnessFocus, setFitnessFocus] = useState("strength");
  const [loading, setLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Theme colors
  const theme = {
    backgroundColor: isDarkMode ? "#0F0F0F" : "#F8F5F2",
    cardBackground: isDarkMode ? "#1A1A1A" : "#FFFFFF",
    textColor: isDarkMode ? "#FFFFFF" : "#2D3436",
    secondaryText: isDarkMode ? "#A0A0A0" : "#636E72",
    borderColor: isDarkMode ? "#333333" : "#E0E0E0",
    primaryColor: "#FF6B6B",
    secondaryColor: "#4ECDC4",
    accentColor: "#FFD93D",
    inputBackground: isDarkMode ? "#2D2D2D" : "#F5F5F5",
    shadowColor: isDarkMode ? "#000000" : "#2D3436",
    pickerBackground: isDarkMode ? "#252525" : "#F0F0F0",
  };

  // Initialize animations
  useEffect(() => {
    // Entry animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.2)),
      }),
    ]).start(() => {
      // Card animation
      Animated.timing(cardAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }).start();
    });
  }, []);

  // Shake animation for errors
  const triggerShake = () => {
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

  const saveProfile = async () => {
    // Validation
    if (!height.trim()) {
      triggerShake();
      Alert.alert("Missing Info", "Please enter your height");
      return;
    }

    if (!weight.trim()) {
      triggerShake();
      Alert.alert("Missing Info", "Please enter your weight");
      return;
    }

    if (!age.trim()) {
      triggerShake();
      Alert.alert("Missing Info", "Please enter your age");
      return;
    }

    const heightNum = Number(height);
    const weightNum = Number(weight);
    const ageNum = Number(age);

    if (heightNum < 50 || heightNum > 250) {
      triggerShake();
      Alert.alert("Invalid Height", "Height must be between 50-250 cm");
      return;
    }

    if (weightNum < 20 || weightNum > 200) {
      triggerShake();
      Alert.alert("Invalid Weight", "Weight must be between 20-200 kg");
      return;
    }

    if (ageNum < 13 || ageNum > 100) {
      triggerShake();
      Alert.alert("Invalid Age", "Age must be between 13-100 years");
      return;
    }

    // Button press animation
    Animated.sequence([
      Animated.timing(buttonAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) return;

      await updateDoc(doc(db, "users", user.uid), {
        height: heightNum,
        weight: weightNum,
        age: ageNum,
        gender,
        activityLevel,
        goal,
        fitnessFocus,
        updatedAt: serverTimestamp(),
        profileSetupCompleted: true,
      });

      // Success animation
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        Alert.alert("✅ Profile Complete", "Your fitness journey begins now!");
        router.replace("/dashboard");
      });

    } catch (err) {
      console.error(err);
      triggerShake();
      Alert.alert("Error", "Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate required calories (optional display)
  const calculateCalories = () => {
    if (!height || !weight || !age) return null;
    
    const heightNum = Number(height);
    const weightNum = Number(weight);
    const ageNum = Number(age);
    
    // BMR calculation (Mifflin-St Jeor Equation)
    let bmr;
    if (gender === "male") {
      bmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum + 5;
    } else {
      bmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum - 161;
    }
    
    // Activity multiplier
    const activityMultipliers = {
      low: 1.2,
      moderate: 1.55,
      high: 1.9
    };
    
    // Goal adjustment
    const goalMultipliers = {
      lose: 0.85,    // 15% deficit
      maintain: 1,    // maintenance
      gain: 1.15      // 15% surplus
    };
    
    const tdee = bmr * activityMultipliers[activityLevel];
    const targetCalories = Math.round(tdee * goalMultipliers[goal]);
    
    return targetCalories;
  };

  const targetCalories = calculateCalories();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.backgroundColor }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
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
            <Text style={[styles.title, { color: theme.textColor }]}>
              Complete Your Profile
            </Text>
            <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
              Help us personalize your FitTrack experience
            </Text>
          </Animated.View>

          {/* Form Card */}
          <Animated.View 
            style={[
              styles.card,
              { 
                backgroundColor: theme.cardBackground,
                opacity: cardAnim,
                transform: [
                  { translateY: Animated.multiply(cardAnim, new Animated.Value(20)) },
                  { translateX: shakeAnim }
                ]
              }
            ]}
          >
            {/* Basic Info Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionIcon, { color: theme.primaryColor }]}>📝</Text>
                <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
                  Basic Information
                </Text>
              </View>

              {/* Height */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.textColor }]}>Height (cm)</Text>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      backgroundColor: theme.inputBackground,
                      borderColor: theme.borderColor,
                      color: theme.textColor
                    }
                  ]}
                  placeholder="e.g. 170"
                  placeholderTextColor={theme.secondaryText}
                  keyboardType="numeric"
                  value={height}
                  onChangeText={setHeight}
                  maxLength={3}
                />
              </View>

              {/* Weight */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.textColor }]}>Weight (kg)</Text>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      backgroundColor: theme.inputBackground,
                      borderColor: theme.borderColor,
                      color: theme.textColor
                    }
                  ]}
                  placeholder="e.g. 65"
                  placeholderTextColor={theme.secondaryText}
                  keyboardType="numeric"
                  value={weight}
                  onChangeText={setWeight}
                  maxLength={3}
                />
              </View>

              {/* Age */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.textColor }]}>Age</Text>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      backgroundColor: theme.inputBackground,
                      borderColor: theme.borderColor,
                      color: theme.textColor
                    }
                  ]}
                  placeholder="e.g. 25"
                  placeholderTextColor={theme.secondaryText}
                  keyboardType="numeric"
                  value={age}
                  onChangeText={setAge}
                  maxLength={3}
                />
              </View>

              {/* Gender */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.textColor }]}>Gender</Text>
                <View style={[styles.pickerWrapper, { backgroundColor: theme.pickerBackground }]}>
                  <Picker
                    selectedValue={gender}
                    onValueChange={(value) => setGender(value)}
                    style={[styles.picker, { color: theme.textColor }]}
                    dropdownIconColor={theme.primaryColor}
                  >
                    <Picker.Item label="Male" value="male" />
                    <Picker.Item label="Female" value="female" />
                    <Picker.Item label="Other" value="other" />
                  </Picker>
                </View>
              </View>
            </View>

            {/* Fitness Preferences Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionIcon, { color: theme.secondaryColor }]}>💪</Text>
                <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
                  Fitness Preferences
                </Text>
              </View>

              {/* Activity Level */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.textColor }]}>Activity Level</Text>
                <View style={[styles.pickerWrapper, { backgroundColor: theme.pickerBackground }]}>
                  <Picker
                    selectedValue={activityLevel}
                    onValueChange={(value) => setActivityLevel(value)}
                    style={[styles.picker, { color: theme.textColor }]}
                    dropdownIconColor={theme.primaryColor}
                  >
                    <Picker.Item
                      label="Low (Little or no exercise)"
                      value="low"
                    />
                    <Picker.Item
                      label="Moderate (3–4 days/week)"
                      value="moderate"
                    />
                    <Picker.Item
                      label="High (Daily intense workouts)"
                      value="high"
                    />
                  </Picker>
                </View>
              </View>

              {/* Goal */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.textColor }]}>Fitness Goal</Text>
                <View style={[styles.pickerWrapper, { backgroundColor: theme.pickerBackground }]}>
                  <Picker
                    selectedValue={goal}
                    onValueChange={(value) => setGoal(value)}
                    style={[styles.picker, { color: theme.textColor }]}
                    dropdownIconColor={theme.primaryColor}
                  >
                    <Picker.Item label="Lose Weight 🔻" value="lose" />
                    <Picker.Item label="Maintain Weight ⚖️" value="maintain" />
                    <Picker.Item label="Gain Weight 🔺" value="gain" />
                  </Picker>
                </View>
              </View>

              {/* Fitness Focus */}
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: theme.textColor }]}>Fitness Focus</Text>
                <View style={[styles.pickerWrapper, { backgroundColor: theme.pickerBackground }]}>
                  <Picker
                    selectedValue={fitnessFocus}
                    onValueChange={(value) => setFitnessFocus(value)}
                    style={[styles.picker, { color: theme.textColor }]}
                    dropdownIconColor={theme.primaryColor}
                  >
                    <Picker.Item label="Strength 💪" value="strength" />
                    <Picker.Item label="Cardio ❤️" value="cardio" />
                    <Picker.Item label="Flexibility 🧘" value="flexibility" />
                    <Picker.Item label="Overall Fitness 🏃" value="overall" />
                  </Picker>
                </View>
              </View>
            </View>

            {/* Calories Preview */}
            {targetCalories && (
              <View style={[styles.caloriesPreview, { backgroundColor: theme.inputBackground }]}>
                <Text style={[styles.caloriesTitle, { color: theme.textColor }]}>
                  Estimated Daily Calories
                </Text>
                <Text style={[styles.caloriesValue, { color: theme.primaryColor }]}>
                  {targetCalories} kcal
                </Text>
                <Text style={[styles.caloriesSubtitle, { color: theme.secondaryText }]}>
                  Based on your profile for {goal === 'lose' ? 'weight loss' : 
                  goal === 'gain' ? 'weight gain' : 'maintenance'}
                </Text>
              </View>
            )}
          </Animated.View>

          {/* Continue Button */}
          <Animated.View style={{ transform: [{ scale: buttonAnim }], marginTop: 30 }}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.primaryColor }]}
              onPress={saveProfile}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <View style={styles.buttonContent}>
                  <Text style={styles.buttonText}>Complete Profile</Text>
                  <Text style={[styles.buttonIcon, { color: "#FFFFFF" }]}>→</Text>
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Note */}
          <Animated.View 
            style={[
              styles.noteContainer,
              { 
                opacity: cardAnim,
                transform: [{ translateY: Animated.multiply(cardAnim, new Animated.Value(20)) }]
              }
            ]}
          >
            <Text style={[styles.noteText, { color: theme.secondaryText }]}>
              You can update these settings anytime from your profile
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
  },
  card: {
    borderRadius: 24,
    padding: 24,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  sectionIcon: {
    fontSize: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    fontWeight: "500",
    borderWidth: 1,
  },
  pickerWrapper: {
    borderRadius: 12,
    overflow: "hidden",
  },
  picker: {
    padding: 16,
    fontSize: 16,
  },
  caloriesPreview: {
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginTop: 20,
  },
  caloriesTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  caloriesValue: {
    fontSize: 36,
    fontWeight: "800",
    marginBottom: 4,
  },
  caloriesSubtitle: {
    fontSize: 12,
    textAlign: "center",
  },
  button: {
    paddingVertical: 18,
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  buttonIcon: {
    fontSize: 20,
    fontWeight: "bold",
  },
  noteContainer: {
    marginTop: 20,
    padding: 16,
  },
  noteText: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
});