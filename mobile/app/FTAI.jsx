import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function FitTrackAI() {
  const [messages, setMessages] = useState([
  {
    id: "welcome",
    text: "Hi 👋 Is there anything you want to know about workouts, calories, or fitness?",
    sender: "ai"
  }
]);

  const flatListRef = useRef(null);
  const insets = useSafeAreaInsets();
  const [input, setInput] = useState("");

  useEffect(() => {
  flatListRef.current?.scrollToEnd({ animated: true });
}, [messages]);

  const BACKEND_URL = "http://192.168.1.69:3000/chat";

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      text: input,
      sender: "user"
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");

    try {
      const res = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.text })
      });

      const data = await res.json();

      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString() + "_ai",
          text: data.reply,
          sender: "ai"
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: "err",
          text: "Unable to connect to FitTrack AI.",
          sender: "ai"
        }
      ]);
    }
  };

  return (
   <KeyboardAvoidingView
  style={{ flex: 1 }}
  behavior={Platform.OS === "ios" ? "padding" : "height"}
>
  <View style={styles.container}>

    {/* Header */}
    <View style={styles.header}>
      <Text style={styles.headerText}>FitTrack AI 🤖</Text>
    </View>

    {/* Chat */}
    <FlatList
      ref={flatListRef}
      data={messages}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{
        padding: 10,
        flexGrow: 1,
        justifyContent: "flex-end"
      }}
      keyboardShouldPersistTaps="handled"
      renderItem={({ item }) => (
        <View
          style={[
            styles.message,
            item.sender === "user"
              ? styles.userMessage
              : styles.aiMessage
          ]}
        >
          <Text>{item.text}</Text>
        </View>
      )}
    />

    {/* INPUT (NORMAL FLOW, NOT ABSOLUTE) */}
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        placeholder="Ask about workouts or calories..."
        value={input}
        onChangeText={setInput}
      />
      <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
        <Text style={{ color: "white" }}>Send</Text>
      </TouchableOpacity>
    </View>

  </View>
</KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9"
  },
  header: {
    padding: 15,
    backgroundColor: "#DCB083",
    alignItems: "center"
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4a2c1a"
  },
  message: {
    padding: 10,
    marginVertical: 6,
    maxWidth: "75%",
    borderRadius: 8
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#DCF8C6"
  },
  aiMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#EEE"
  },
  inputRow: {
    flexDirection: "row",
    padding: 8,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff"
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 6,
    padding: 10
  },
  sendBtn: {
    marginLeft: 8,
    backgroundColor: "#4CAF50",
    paddingHorizontal: 16,
    justifyContent: "center",
    borderRadius: 6
  },
  inputContainer: {
  flexDirection: "row",
  padding: 8,
  borderTopWidth: 1,
  borderColor: "#ddd",
  backgroundColor: "#fff"
},
});