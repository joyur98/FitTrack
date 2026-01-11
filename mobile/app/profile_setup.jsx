import React, { useState } from "react";
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
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { auth, db } from "./firebaseConfig";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { router } from "expo-router";

export default function ProfileSetup() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [activityLevel, setActivityLevel] = useState("moderate");
  const [loading, setLoading] = useState(false);

  const saveProfile = async () => {
    if (!height || !weight) {
      Alert.alert("Missing Info", "Please enter height and weight");
      return;
    }

    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) return;

      await updateDoc(doc(db, "users", user.uid), {
        height: Number(height),
        weight: Number(weight),
        activityLevel,
        updatedAt: serverTimestamp(),
      });

      router.replace("/dashboard");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>Complete Your Profile</Text>
          <Text style={styles.subtitle}>
            Help us personalize your FitTrack experience
          </Text>

          <View style={styles.card}>
            <Text style={styles.label}>Height (cm)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 170"
              placeholderTextColor="#9c9c9c"
              keyboardType="numeric"
              value={height}
              onChangeText={setHeight}
            />

            <Text style={styles.label}>Weight (kg)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 65"
              placeholderTextColor="#9c9c9c"
              keyboardType="numeric"
              value={weight}
              onChangeText={setWeight}
            />

            <Text style={styles.label}>Activity Level</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={activityLevel}
                onValueChange={(value) => setActivityLevel(value)}
                style={styles.picker}
                dropdownIconColor="#4a3b31"
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

            <TouchableOpacity
              style={styles.button}
              onPress={saveProfile}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>
                {loading ? "Saving..." : "Continue"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f5efe6",
  },
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#4a3b31",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#7a6659",
    textAlign: "center",
    marginBottom: 25,
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 20,
    elevation: 4,
  },
  label: {
    fontSize: 14,
    color: "#4a3b31",
    marginBottom: 6,
    marginTop: 12,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#f1f1f1",
    padding: 12,
    borderRadius: 12,
    fontSize: 16,
    color: "#2f2f2f",
  },
  pickerWrapper: {
    backgroundColor: "#eaeaea",
    borderRadius: 12,
    marginTop: 4,
  },
  picker: {
    color: "#2f2f2f",
  },
  button: {
    backgroundColor: "#C4935D",
    padding: 15,
    borderRadius: 14,
    marginTop: 25,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
