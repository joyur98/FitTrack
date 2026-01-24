import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState, useEffect, useRef } from "react";

const BACKEND_URL = "http://available-dichotomously-clare.ngrok-free.dev/chat";

export default function FTAI() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const scrollRef = useRef(null);

  // Welcome message
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

  // Auto-scroll on new message
  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [chat]);

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
    } catch {
      setChat((prev) => [
        ...prev,
        { role: "bot", text: "☕ Oops! I couldn’t reach the server." },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <Text style={styles.title}>☕ FitTrack AI</Text>

        <ScrollView
          ref={scrollRef}
          style={styles.chatBox}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
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

        {/* Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Ask about calories or workouts…"
            placeholderTextColor="#d6c3a3"
            value={message}
            onChangeText={setMessage}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
          />

          <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ☕ iPhone-Optimized Coffee Theme */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#eee4d8",
  },
  container: {
    flex: 1,
    paddingHorizontal: 14,
  },
  title: {
    color: "#2b1b14",
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginVertical: 12,
  },

  chatBox: {
    flex: 1,
  },
  chatContent: {
    paddingBottom: 20,
  },

  message: {
    padding: 14,
    borderRadius: 18,
    marginVertical: 6,
    maxWidth: "78%",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  userMsg: {
    alignSelf: "flex-end",
    backgroundColor: "#6f4e37",
    borderBottomRightRadius: 6,
  },
  botMsg: {
    alignSelf: "flex-start",
    backgroundColor: "#3b2a23",
    borderBottomLeftRadius: 6,
  },
  msgText: {
    color: "#f5efe6",
    fontSize: 15,
    lineHeight: 21,
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    marginBottom: Platform.OS === "ios" ? 6 : 0,
  },
  input: {
    flex: 1,
    backgroundColor: "#3b2a23",
    color: "#f5efe6",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    fontSize: 15,
  },
  sendBtn: {
    marginLeft: 8,
    backgroundColor: "#c19a6b",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 14,
  },
  sendText: {
    color: "#2b1b14",
    fontWeight: "700",
    fontSize: 15,
  },
});
