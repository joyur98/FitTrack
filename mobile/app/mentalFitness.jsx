// MentalFitness.jsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";

export default function MentalFitnessScreen() {
  const router = useRouter();
  
  // State for mood tracking
  const [selectedMood, setSelectedMood] = useState(null);
  const [moodNotes, setMoodNotes] = useState("");
  const [showMoodModal, setShowMoodModal] = useState(false);
  
  // State for breathing exercise
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState("inhale");
  const [breathingTime, setBreathingTime] = useState(4);
  
  // State for meditation timer
  const [meditationActive, setMeditationActive] = useState(false);
  const [meditationTime, setMeditationTime] = useState(0);
  const [meditationDuration, setMeditationDuration] = useState(300); // 5 minutes default

  // Mood options
  const moodOptions = [
    { emoji: "😊", label: "Happy", color: "#FFD166" },
    { emoji: "😌", label: "Calm", color: "#06D6A0" },
    { emoji: "😐", label: "Neutral", color: "#118AB2" },
    { emoji: "😔", label: "Sad", color: "#073B4C" },
    { emoji: "😰", label: "Anxious", color: "#EF476F" },
    { emoji: "😴", label: "Tired", color: "#7209B7" },
    { emoji: "😤", label: "Stressed", color: "#F72585" },
    { emoji: "🤩", label: "Excited", color: "#FF9E00" },
  ];

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
      Alert.alert("🎉 Meditation Complete", "Great job! You've completed your meditation session.");
    }
    return () => clearInterval(interval);
  }, [meditationActive, meditationTime]);

  // Save mood function
  const saveMood = () => {
    if (!selectedMood) {
      Alert.alert("Select Mood", "Please select how you're feeling");
      return;
    }
    
    Alert.alert("Mood Saved", `Your ${moodOptions[selectedMood].label} mood has been recorded!`);
    setShowMoodModal(false);
    setMoodNotes("");
    setSelectedMood(null);
  };

  // Start/Stop breathing exercise
  const toggleBreathing = () => {
    if (!breathingActive) {
      setBreathingPhase("inhale");
      setBreathingTime(4);
    }
    setBreathingActive(!breathingActive);
  };

  // Start/Stop meditation
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

  // Quick tips
  const quickTips = [
    "Take 5 deep breaths when stressed",
    "Drink a glass of water",
    "Stand up and stretch",
    "Write down 3 things you're grateful for",
    "Listen to calming music for 2 minutes",
    "Close your eyes and count to 10 slowly",
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🧠 Mental Fitness</Text>
          <Text style={styles.subtitle}>Nurture your mind, strengthen your spirit</Text>
        </View>

        {/* Mood Tracker Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>How are you feeling today?</Text>
          <Text style={styles.cardDescription}>Track your mood and emotions</Text>
          
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
                  { backgroundColor: mood.color },
                  selectedMood === index && styles.moodSelected
                ]}
                onPress={() => {
                  setSelectedMood(index);
                  setShowMoodModal(true);
                }}
              >
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                <Text style={styles.moodLabel}>{mood.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TouchableOpacity 
            style={styles.primaryButton}
            onPress={() => setShowMoodModal(true)}
          >
            <Text style={styles.primaryButtonText}>Track My Mood</Text>
          </TouchableOpacity>
        </View>

        {/* Breathing Exercise */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🌬️ Breathing Exercise</Text>
          <Text style={styles.cardDescription}>4-4-4 breathing technique for relaxation</Text>
          
          <View style={styles.breathingContainer}>
            <View style={[
              styles.breathingCircle,
              { 
                transform: [{ scale: breathingPhase === "inhale" ? 1.2 : 1 }],
                backgroundColor: breathingPhase === "inhale" ? "#06D6A0" :
                                breathingPhase === "exhale" ? "#118AB2" : "#FFD166"
              }
            ]}>
              <Text style={styles.breathingText}>
                {breathingPhase === "inhale" ? "INHALE" :
                 breathingPhase === "exhale" ? "EXHALE" : "HOLD"}
              </Text>
              <Text style={styles.breathingTime}>{breathingTime}s</Text>
            </View>
            
            <View style={styles.breathingInstructions}>
              <Text style={styles.instructionsText}>
                {breathingPhase === "inhale" ? "Breathe in slowly..." :
                 breathingPhase === "exhale" ? "Breathe out slowly..." :
                 "Hold your breath..."}
              </Text>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.primaryButton, breathingActive && styles.stopButton]}
            onPress={toggleBreathing}
          >
            <Text style={styles.primaryButtonText}>
              {breathingActive ? "Stop Breathing Exercise" : "Start Breathing Exercise"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Meditation Timer */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🕉️ Meditation Timer</Text>
          <Text style={styles.cardDescription}>Find your inner peace</Text>
          
          <View style={styles.meditationContainer}>
            <Text style={styles.meditationTime}>
              {formatTime(meditationActive ? meditationTime : meditationDuration)}
            </Text>
            
            <View style={styles.meditationControls}>
              <TouchableOpacity 
                style={styles.durationButton}
                onPress={() => setMeditationDuration(300)} // 5 min
              >
                <Text style={[
                  styles.durationButtonText,
                  meditationDuration === 300 && styles.durationButtonActive
                ]}>5 min</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.durationButton}
                onPress={() => setMeditationDuration(600)} // 10 min
              >
                <Text style={[
                  styles.durationButtonText,
                  meditationDuration === 600 && styles.durationButtonActive
                ]}>10 min</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.durationButton}
                onPress={() => setMeditationDuration(900)} // 15 min
              >
                <Text style={[
                  styles.durationButtonText,
                  meditationDuration === 900 && styles.durationButtonActive
                ]}>15 min</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.primaryButton, meditationActive && styles.stopButton]}
            onPress={toggleMeditation}
          >
            <Text style={styles.primaryButtonText}>
              {meditationActive ? "Stop Meditation" : "Start Meditation"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Tips */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💡 Quick Mental Boosters</Text>
          <Text style={styles.cardDescription}>Try these when you need a quick reset</Text>
          
          <View style={styles.tipsContainer}>
            {quickTips.map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <Text style={styles.tipNumber}>{index + 1}.</Text>
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Resources */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📚 Mental Health Resources</Text>
          
          <TouchableOpacity style={styles.resourceItem}>
            <Text style={styles.resourceEmoji}>📞</Text>
            <View style={styles.resourceText}>
              <Text style={styles.resourceTitle}>Crisis Helpline (Nepal)</Text>
              <Text style={styles.resourceSubtitle}>Call 1166 for mental health support</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.resourceItem}>
            <Text style={styles.resourceEmoji}>📱</Text>
            <View style={styles.resourceText}>
              <Text style={styles.resourceTitle}>Meditation Apps</Text>
              <Text style={styles.resourceSubtitle}>Headspace, Calm, Insight Timer</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.resourceItem}>
            <Text style={styles.resourceEmoji}>📖</Text>
            <View style={styles.resourceText}>
              <Text style={styles.resourceTitle}>Journaling</Text>
              <Text style={styles.resourceSubtitle}>Write down your thoughts daily</Text>
            </View>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Mood Modal */}
      <Modal
        visible={showMoodModal}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedMood !== null && (
              <>
                <Text style={styles.modalTitle}>
                  {moodOptions[selectedMood].emoji} {moodOptions[selectedMood].label}
                </Text>
                
                <TextInput
                  style={styles.notesInput}
                  placeholder="Add notes about how you're feeling (optional)"
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={4}
                  value={moodNotes}
                  onChangeText={setMoodNotes}
                />
                
                <View style={styles.modalButtons}>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setShowMoodModal(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.saveButton]}
                    onPress={saveMood}
                  >
                    <Text style={styles.saveButtonText}>Save Mood</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
    fontSize: 32,
    fontWeight: "800",
    color: "#4a3b31",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#7a6659",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#4a3b31",
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: "#7a6659",
    marginBottom: 16,
  },
  moodScroll: {
    marginBottom: 20,
  },
  moodOption: {
    width: 80,
    height: 100,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    padding: 10,
  },
  moodSelected: {
    borderWidth: 3,
    borderColor: "#4a3b31",
  },
  moodEmoji: {
    fontSize: 30,
    marginBottom: 8,
  },
  moodLabel: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
    textAlign: "center",
  },
  primaryButton: {
    backgroundColor: "#C4935D",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  stopButton: {
    backgroundColor: "#e74c3c",
  },
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
    marginBottom: 20,
  },
  breathingText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  breathingTime: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "800",
  },
  breathingInstructions: {
    marginBottom: 20,
  },
  instructionsText: {
    fontSize: 16,
    color: "#4a3b31",
    textAlign: "center",
  },
  meditationContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  meditationTime: {
    fontSize: 48,
    fontWeight: "800",
    color: "#4a3b31",
    marginBottom: 20,
  },
  meditationControls: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  durationButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#f0e6d8",
    marginHorizontal: 8,
  },
  durationButtonText: {
    color: "#7a6659",
    fontWeight: "600",
  },
  durationButtonActive: {
    color: "#C4935D",
    fontWeight: "700",
  },
  tipsContainer: {
    marginTop: 10,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  tipNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: "#C4935D",
    marginRight: 12,
    width: 24,
  },
  tipText: {
    fontSize: 14,
    color: "#4a3b31",
    flex: 1,
  },
  resourceItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
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
    color: "#4a3b31",
    marginBottom: 4,
  },
  resourceSubtitle: {
    fontSize: 14,
    color: "#7a6659",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    width: "90%",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#4a3b31",
    marginBottom: 20,
    textAlign: "center",
  },
  notesInput: {
    backgroundColor: "#f8f5f0",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    height: 120,
    marginBottom: 20,
    textAlignVertical: "top",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: "#f0e6d8",
  },
  cancelButtonText: {
    color: "#7a6659",
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#C4935D",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});