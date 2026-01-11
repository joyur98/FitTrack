import React, { useState, useEffect } from "react";
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
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";

export default function CalorieBurnScreen() {
  const [calorie, setCalorie] = useState("");
  const [exercise, setExercise] = useState("");
  const [totalBurnedCalories, setTotalBurnedCalories] = useState(0);
  const [loading, setLoading] = useState(false);

  // 🔥 Fetch total burned calories
  const fetchTotalBurnedCalories = async () => {
    try {
      const q = query(
        collection(db, "calorie_burn"),
        where("userID", "==", auth.currentUser.uid)
      );

      const querySnapshot = await getDocs(q);
      let total = 0;

      querySnapshot.forEach((doc) => {
        total += doc.data().calorie || 0;
      });

      setTotalBurnedCalories(total);
    } catch (error) {
      console.log("Error fetching burned calories:", error);
    }
  };

  useEffect(() => {
    fetchTotalBurnedCalories();
  }, []);

  // ➕ Add calories
  const handleAddCalories = async () => {
    if (!calorie || !exercise) {
      Alert.alert("Missing Fields", "Please fill in all fields.");
      return;
    }

    setLoading(true);

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
      fetchTotalBurnedCalories(); // 🔄 refresh total
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
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

        {/* 🔥 Total Burned Calories Card */}
        <View style={styles.totalCard}>
          <Text style={styles.totalTitle}>Total Burned Today</Text>
          <Text style={styles.totalValue}>
            {totalBurnedCalories} kcal
          </Text>
        </View>

        {/* Add Entry Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Add Burned Calories</Text>

          <TextInput
            placeholder="Exercise (e.g. Running, HIIT)"
            placeholderTextColor="#9b8577"
            style={styles.input}
            value={exercise}
            onChangeText={setExercise}
          />

          <TextInput
            placeholder="Calories Burned"
            placeholderTextColor="#9b8577"
            style={styles.input}
            keyboardType="numeric"
            value={calorie}
            onChangeText={setCalorie}
          />

          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddCalories}
            disabled={loading}
          >
            <Text style={styles.addButtonText}>
              {loading ? "Adding..." : "Add Entry"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tip */}
        <View style={styles.tipCard}>
          <Text style={styles.tipText}>
            💡 Tip: Add calories after every workout for accurate tracking.
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

  totalCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 20,
    borderLeftWidth: 5,
    borderLeftColor: "#4CAF50",
    elevation: 3,
  },
  totalTitle: {
    fontSize: 16,
    color: "#7a6659",
  },
  totalValue: {
    fontSize: 32,
    fontWeight: "800",
    color: "#4CAF50",
    marginTop: 6,
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
