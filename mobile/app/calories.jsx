import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
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
} from "firebase/firestore";

export default function CaloriesScreen() {
  const router = useRouter();

  const [food, setFood] = useState("");
  const [calories, setCalories] = useState("");
  const [entries, setEntries] = useState([]);
  const [total, setTotal] = useState(0);

  const user = auth.currentUser;

  useEffect(() => {
  if (!user) return;

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
  });

  return () => unsubscribe();
}, []);

  // ➕ Add calories to Firestore
  const addCalories = async () => {
    if (!food.trim() || !calories || isNaN(calories)) {
      Alert.alert("Error", "Enter valid food and calories");
      return;
    }

    try {
      await addDoc(collection(db, "calorie_intake"), {
        food: food.trim(),
        calorie: Number(calories),
        date: Timestamp.now(),
        userID: user.uid,
      });

      setFood("");
      setCalories("");
    } catch (error) {
      Alert.alert("Error", "Failed to add calories");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Calorie Intake</Text>
        </View>

        {/* Total */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Today’s Intake</Text>
          <Text style={styles.totalValue}>{total} kcal</Text>
        </View>

        {/* Input */}
        <View style={styles.inputCard}>
          <Text style={styles.inputTitle}>Add Calories</Text>

          <TextInput
            value={food}
            onChangeText={setFood}
            placeholder="Food name"
            placeholderTextColor="#8b7968"
            style={[styles.input, { marginBottom: 10 }]}
          />

          <View style={styles.inputRow}>
            <TextInput
              value={calories}
              onChangeText={setCalories}
              placeholder="Calories"
              keyboardType="numeric"
              placeholderTextColor="#8b7968"
              style={styles.input}
            />
            <TouchableOpacity style={styles.addButton} onPress={addCalories}>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Entries */}
        <View style={styles.entriesSection}>
          <Text style={styles.entriesTitle}>Today’s Entries</Text>

          {entries.length === 0 ? (
            <Text style={styles.emptyText}>No calories added yet 🍽️</Text>
          ) : (
            entries.map((item, index) => (
              <View key={index} style={styles.entryRow}>
                <Text style={styles.entryValue}>
                  {item.food} - {item.calorie} kcal
                </Text>
                <Text style={styles.entryTime}>
                  {item.date.toDate().toLocaleTimeString()}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f5f0",
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backArrow: {
    fontSize: 26,
    marginRight: 12,
    color: "#4a3b31",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#4a3b31",
  },
  totalCard: {
    backgroundColor: "#5b4334",
    borderRadius: 14,
    padding: 20,
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 14,
    color: "#d4c4a8",
  },
  totalValue: {
    fontSize: 32,
    fontWeight: "800",
    color: "#fff",
  },
  inputCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
    marginBottom: 24,
  },
  inputTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4a3b31",
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#f8f5f0",
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 44,
    marginRight: 10,
    color: "#4a3b31",
  },
  addButton: {
    backgroundColor: "#C4935D",
    paddingHorizontal: 18,
    height: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  entriesSection: {
    marginBottom: 40,
  },
  entriesTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4a3b31",
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 13,
    color: "#8b7968",
    textAlign: "center",
    marginTop: 20,
  },
  entryRow: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
  },
  entryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4a3b31",
  },
  entryTime: {
    fontSize: 12,
    color: "#8b7968",
  },
});
