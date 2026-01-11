import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
} from "react-native";
import { auth, db } from "./firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function CalorieBurnScreen() {
  const [calorie, setCalorie] = useState("");
  const [exercise, setExercise] = useState("");

  const handleAddCalories = async () => {
    if (!calorie || !exercise) {
      Alert.alert("Missing Fields", "Please fill in all fields.");
      return;
    }

    try {
      await addDoc(collection(db, "calorie_burn"), {
        calorie: Number(calorie),
        exercise: exercise,
        userID: auth.currentUser.uid,
        date: serverTimestamp(),
      });

      Alert.alert("Success", "Calories added successfully!");
      setCalorie("");
      setExercise("");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Calorie Burn</Text>
          <Text style={styles.subtitle}>
            Track calories burned throughout the day
          </Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Add Burned Calories</Text>

          {/* Exercise */}
          <TextInput
            placeholder="Exercise (e.g. Running, HIIT)"
            placeholderTextColor="#9b8577"
            style={styles.input}
            value={exercise}
            onChangeText={setExercise}
          />

          {/* Calories */}
          <TextInput
            placeholder="Calories Burned"
            placeholderTextColor="#9b8577"
            style={styles.input}
            keyboardType="numeric"
            value={calorie}
            onChangeText={setCalorie}
          />

          {/* Button */}
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddCalories}
          >
            <Text style={styles.addButtonText}>Add Entry</Text>
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View style={styles.tipCard}>
          <Text style={styles.tipText}>
            💡 Tip: Add calories after every workout for accurate daily
            tracking.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5efe6",
  },
  container: {
    padding: 16,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#4a3b31",
  },
  subtitle: {
    fontSize: 14,
    color: "#7a6659",
    marginTop: 4,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 16,
    elevation: 3,
    marginBottom: 20,
    borderLeftWidth: 5,
    borderLeftColor: "#C4935D",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#4a3b31",
    marginBottom: 14,
  },
  input: {
    backgroundColor: "#f5efe6",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: "#4a3b31",
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: "#C4935D",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 6,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  tipCard: {
    backgroundColor: "#efe6d8",
    padding: 14,
    borderRadius: 12,
  },
  tipText: {
    color: "#7a6659",
    fontSize: 13,
    textAlign: "center",
  },
});
