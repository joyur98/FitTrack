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
    backgroundColor: "#f8f3ea",
  },

  container: {
    flex: 1,
    paddingHorizontal: 16,
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#3b2a23",
    textAlign: "center",
    marginTop: 14,
  },

  subtitle: {
    textAlign: "center",
    color: "#8b6f5a",
    fontSize: 14,
    marginBottom: 12,
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
    maxWidth: "80%",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  userMsg: {
    alignSelf: "flex-end",
    backgroundColor: "#7B3F00",
    borderBottomRightRadius: 6,
  },

  botMsg: {
    alignSelf: "flex-start",
    backgroundColor: "#A52A2A",
    borderBottomLeftRadius: 6,
  },

  msgText: {
    color: "#ffffff",
    fontSize: 15,
    lineHeight: 21,
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    marginBottom: 8,
  },

  input: {
    flex: 1,
    backgroundColor: "#ffffff",
    color: "#3b2a23",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 18,
    fontSize: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },

  sendBtn: {
    marginLeft: 10,
    backgroundColor: "#5C4033",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 18,
  },

  sendText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 15,
  },
});
