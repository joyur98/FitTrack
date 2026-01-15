import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useState, useEffect } from "react";

const BACKEND_URL = "http://192.168.1.69:3000/chat";

export default function FTAI() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);

  // Welcome message on first load
  useEffect(() => {
    setChat([
      {
        role: "bot",
        text:
          "☕ Welcome to FitTrack AI!\n\n" +
          "I can help you with:\n" +
          "• Calories & food nutrition\n" +
          "• Workout routines\n\n" +
          "Try asking:\n" +
          "Calories in banana\n" +
          "Best chest workout",
      },
    ]);
  }, []);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const userText = message;

    setChat((prev) => [...prev, { role: "user", text: userText }]);
    setMessage("");

    try {
      const res = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText }),
      });

      const data = await res.json();

      setChat((prev) => [...prev, { role: "bot", text: data.reply }]);
    } catch (error) {
      setChat((prev) => [
        ...prev,
        { role: "bot", text: "☕ Oops! I couldn’t reach the server." },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>☕ FitTrack AI</Text>

      <ScrollView
        style={styles.chatBox}
        contentContainerStyle={{ paddingBottom: 10 }}
      >
        {chat.map((item, index) => (
          <View
            key={index}
            style={[
              styles.message,
              item.role === "user" ? styles.userMsg : styles.botMsg,
            ]}
          >
            <Text style={styles.msgText}>{item.text}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Ask about calories or workouts..."
          placeholderTextColor="#d6c3a3"
          value={message}
          onChangeText={setMessage}
          onSubmitEditing={sendMessage}
        />

        <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ☕ COFFEE THEME STYLES */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#eee4d8", // espresso
    padding: 12,
  },
  title: {
    color: "#2b1b14", // latte foam
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  chatBox: {
    flex: 1,
    marginBottom: 10,
  },
  message: {
    padding: 12,
    borderRadius: 14,
    marginVertical: 6,
    maxWidth: "80%",
  },
  userMsg: {
    alignSelf: "flex-end",
    backgroundColor: "#6f4e37", // mocha
  },
  botMsg: {
    alignSelf: "flex-start",
    backgroundColor: "#3b2a23", // dark roast
  },
  msgText: {
    color: "#f5efe6", // milk white
    fontSize: 15,
    lineHeight: 20,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#3b2a23",
    color: "#f5efe6",
    padding: 12,
    borderRadius: 10,
  },
  sendBtn: {
    marginLeft: 8,
    backgroundColor: "#c19a6b", // caramel
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  sendText: {
    color: "#2b1b14",
    fontWeight: "bold",
  },
});
