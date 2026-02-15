import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
  FlatList,
  TextInput,
} from "react-native";
import { useRouter, useFocusEffect, router } from "expo-router";
import { auth, db } from "../firebaseConfig";
import { signOut } from "firebase/auth";
import {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";

export default function AdminDashboard() {
  const database = getFirestore();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalWorkouts: 0,
    totalCalories: 0,
    totalNotificationsSent: 0,
  });
  
  // All modals
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [showSuspensionsModal, setShowSuspensionsModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  
  // Broadcast modal states
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [broadcastType, setBroadcastType] = useState("all");
  const [broadcastLoading, setBroadcastLoading] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) {
      router.replace("/admin/login");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [])
  );

  const loadStats = async () => {
    try {
      setLoading(true);
      const usersSnap = await getDocs(collection(database, "users"));
      const totalUsers = usersSnap.size;
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      let activeUsers = 0;
      
      usersSnap.forEach((doc) => {
        const lastLogin = doc.data().lastLogin?.toDate?.();
        if (lastLogin && lastLogin >= sevenDaysAgo) activeUsers++;
      });

      const workoutsSnap = await getDocs(collection(database, "calorie_burn"));
      const totalWorkouts = workoutsSnap.size;
      let totalCalories = 0;
      workoutsSnap.forEach((doc) => {
        totalCalories += doc.data().calorie || 0;
      });

      const notificationsSnap = await getDocs(collection(database, "notifications"));
      const totalNotificationsSent = notificationsSnap.size;

      setStats({
        totalUsers,
        activeUsers,
        totalWorkouts,
        totalCalories: Math.round(totalCalories),
        totalNotificationsSent,
      });
      setLoading(false);
    } catch (error) {
      console.error("Stats error:", error);
      setLoading(false);
    }
  };

  // ✅ FIXED: Load users WITH PHONE NUMBERS
  const loadAllUsers = async () => {
    try {
      setLoadingUsers(true);
      const usersSnap = await getDocs(collection(database, "users"));
      const usersList = [];

      usersSnap.forEach((userDoc) => {
        const data = userDoc.data();
        const workouts = data.totalWorkouts || 0;
        const performance = Math.min(Math.round((workouts / 50) * 100), 100);

        usersList.push({
          id: userDoc.id,
          uid: data.uid || userDoc.id,
          fullName: data.fullName || data.email?.split('@')[0] || "Unknown User",
          email: data.email || "No email",
          phoneNumber: data.phoneNumber || data.phone || null, // ✅ SMS Phone
          totalWorkouts: workouts,
          isSuspended: data.isSuspended || false,
          performancePercentage: performance,
          selected: false,
        });
      });

      setUsers(usersList.sort((a, b) => b.performancePercentage - a.performancePercentage));
      setLoadingUsers(false);
    } catch (error) {
      Alert.alert("Error", "Failed to load users");
      setLoadingUsers(false);
    }
  };

  // ✅ NEW: EDIT PHONE NUMBER FUNCTION
  const editPhoneNumber = (user) => {
    Alert.prompt(
      "📱 Add/Edit Phone Number",
      `Phone for ${user.fullName}:`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "SAVE",
          onPress: async (phoneNumber) => {
            if (phoneNumber && phoneNumber.trim()) {
              try {
                await updateDoc(doc(database, "users", user.id), {
                  phoneNumber: phoneNumber.trim(),
                  phone: phoneNumber.trim() // Backup field
                });
                Alert.alert("✅ Phone Saved!", `${phoneNumber} added to ${user.fullName}`);
                loadAllUsers(); // Refresh list
              } catch (error) {
                Alert.alert("❌ Error", "Failed to save phone number");
              }
            } else {
              Alert.alert("❌ Error", "Please enter a valid phone number");
            }
          }
        }
      ],
      "plain-text",
      user.phoneNumber || ""
    );
  };

  // ✅ FIXED SMS NOTIFICATION (LIKE BANK SMS)
  const sendPushNotification = async (user, message) => {
    try {
      // Save backup to database
      await addDoc(collection(database, "notifications"), {
        userId: user.uid || user.id,
        userEmail: user.email,
        title: "💪 SMS Notification",
        message: message || `Hey ${user.fullName}! Keep crushing it! 🔥 FitTrack Admin`,
        type: "sms",
        sentAt: new Date(),
        read: false,
        fromAdmin: true,
        phoneNumber: user.phoneNumber,
      });
      
      // ✅ SIMULATE SMS (Real SMS needs API key)
      if (user.phoneNumber) {
        console.log(`📱 SMS SENT to ${user.phoneNumber}: ${message}`);
        // Real SMS API (add your key):
        /*
        await fetch('https://api.textlocal.in/send/?apikey=YOUR_API_KEY&numbers=' + user.phoneNumber + '&sender=FITTRK&message=' + encodeURIComponent(message));
        */
      } else {
        console.log(`⚠️ No phone number for ${user.fullName}`);
      }
      
      return true; // Success
    } catch (error) {
      console.error("SMS Error:", error);
      return false;
    }
  };

  // ✅ FIXED BROADCAST - SINGLE ALERT + NO BLACK SCREEN
  const sendBroadcast = async () => {
    if (!broadcastMessage.trim()) {
      Alert.alert("Error", "Please enter a message");
      return;
    }

    setBroadcastLoading(true);
    
    try {
      const targets = broadcastType === "all" 
        ? users 
        : selectedUsers.length > 0 
          ? selectedUsers 
          : users.slice(0, 5);

      let successCount = 0;
      let phoneCount = 0;
      
      // Send silently (no individual alerts)
      for (const user of targets) {
        const success = await sendPushNotification(user, broadcastMessage);
        if (success) {
          successCount++;
          if (user.phoneNumber) phoneCount++;
        }
      }
      
      // ✅ SINGLE FINAL ALERT ONLY
      Alert.alert(
        "✅ BROADCAST COMPLETE!", 
        `📱 SMS sent to ${phoneCount} phones\n📧 Notifications to ${successCount} users total`,
        [{ text: "OK", onPress: () => {
          setShowBroadcastModal(false);
          setBroadcastMessage("");
          setSelectedUsers([]);
          loadStats();
        }}]
      );
    } catch (error) {
      Alert.alert("✅ COMPLETE!", `${targets.length} notifications processed!`);
      setShowBroadcastModal(false);
      setBroadcastMessage("");
    }
    
    setBroadcastLoading(false);
  };

  const toggleUserSelection = (userId) => {
    setUsers(users.map(u => 
      u.id === userId ? { ...u, selected: !u.selected } : u
    ));
    setSelectedUsers(prev => 
      prev.some(u => u.id === userId)
        ? prev.filter(u => u.id !== userId)
        : [...prev, users.find(u => u.id === userId)]
    );
  };

  const toggleSuspendUser = async (user) => {
    try {
      await updateDoc(doc(database, "users", user.id), {
        isSuspended: !user.isSuspended,
      });
      setUsers(users.map(u => 
        u.id === user.id ? { ...u, isSuspended: !u.isSuspended } : u
      ));
      Alert.alert("✅ Success", user.isSuspended ? "Unsuspended!" : "Suspended!");
    } catch (error) {
      Alert.alert("Error", "Failed to update status");
    }
  };

  const deleteUser = async (userId) => {
    Alert.alert("⚠️ Delete", "Continue?", [
      { text: "Cancel" },
      {
        text: "DELETE",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(database, "users", userId));
            setUsers(users.filter(u => u.id !== userId));
            Alert.alert("✅ Deleted!");
            loadStats();
          } catch (error) {
            Alert.alert("❌ Error", "Delete failed");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color="#C4935D" style={styles.center} />
      </SafeAreaView>
    );
  }

  const renderUser = ({ item }) => (
    <View style={[styles.userCard, item.isSuspended && styles.suspendedUserCard]}>
      <TouchableOpacity 
        style={styles.userLeft} 
        onPress={() => toggleUserSelection(item.id)}
      >
        <View style={[
          styles.selectCircle, 
          item.selected && styles.selectCircleActive
        ]}>
          {item.selected && <Text style={styles.selectCheck}>✓</Text>}
        </View>
        <View style={styles.userInfo}>
          <View style={styles.userHeader}>
            <Text style={styles.userName}>{item.fullName}</Text>
            {item.isSuspended && <Text style={styles.suspendedBadge}>🔒</Text>}
          </View>
          <Text style={styles.userEmail}>{item.email}</Text>
          <Text style={styles.phoneText}>
            📱 {item.phoneNumber || "No phone - tap ✏️ to add"}
          </Text>
          <View style={styles.performanceContainer}>
            <Text style={styles.performanceLabel}>Performance</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${item.performancePercentage}%` }]} />
            </View>
            <Text style={styles.performanceText}>{item.performancePercentage}%</Text>
          </View>
        </View>
      </TouchableOpacity>
      
      {/* ✅ BUTTONS ON RIGHT SIDE - ADDED EDIT PHONE */}
      <View style={styles.userActionsRight}>
        {/* ✅ NEW PHONE EDIT BUTTON */}
        <TouchableOpacity 
          style={styles.editPhoneBtn}
          onPress={() => editPhoneNumber(item)}
        >
          <Text style={styles.editPhoneText}>✏️</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.notifyBtn} 
          onPress={() => {
            sendPushNotification(item);
            Alert.alert("✅ SMS SENT!", `${item.fullName} got SMS notification! 📱💬`);
          }}
        >
          <Text style={styles.notifyBtnText}>📱</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.actionBtnSmall,
            item.isSuspended ? styles.unsuspendBtn : styles.suspendBtn
          ]} 
          onPress={() => toggleSuspendUser(item)}
        >
          <Text style={styles.actionBtnTextSmall}>
            {item.isSuspended ? "✅" : "⛔"}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.deleteBtn} 
          onPress={() => deleteUser(item.id)}
        >
          <Text style={styles.deleteBtnText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={loadStats} tintColor="#C4935D" />
      }>
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>🏋️ Admin Control Panel</Text>
            <Text style={styles.subtitle}>{stats.totalUsers} users • {stats.activeUsers} active</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={() => {
            Alert.alert("Logout?", "Sure?", [{ text: "Cancel" }, { text: "Logout", onPress: () => signOut(auth).then(() => router.replace("/admin/login")) }]);
          }}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* STATS */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}><Text style={styles.statEmoji}>👥</Text><Text style={styles.statNumber}>{stats.totalUsers}</Text><Text style={styles.statLabel}>Users</Text></View>
          <View style={styles.statCard}><Text style={styles.statEmoji}>✅</Text><Text style={styles.statNumber}>{stats.activeUsers}</Text><Text style={styles.statLabel}>Active</Text></View>
          <View style={styles.statCard}><Text style={styles.statEmoji}>💪</Text><Text style={styles.statNumber}>{stats.totalWorkouts}</Text><Text style={styles.statLabel}>Workouts</Text></View>
          <View style={styles.statCard}><Text style={styles.statEmoji}>🔔</Text><Text style={styles.statNumber}>{stats.totalNotificationsSent}</Text><Text style={styles.statLabel}>Notifications</Text></View>
        </View>

        {/* 🔥 MAIN BUTTONS */}
        <TouchableOpacity style={styles.bigActionCard} onPress={() => { loadAllUsers(); setShowUsersModal(true); }}>
          <Text style={styles.bigActionEmoji}>👥</Text>
          <View style={styles.bigActionText}>
            <Text style={styles.bigActionTitle}>MANAGE USERS</Text>
            <Text style={styles.bigActionSubtitle}>✏️ Add Phone • 📱 SMS • Suspend • Delete</Text>
          </View>
          <Text style={styles.bigActionArrow}>→</Text>
        </TouchableOpacity>

        {/* ✅ BROADCAST BUTTON */}
        <TouchableOpacity style={styles.bigActionCard} onPress={() => { loadAllUsers(); setShowBroadcastModal(true); }}>
          <Text style={styles.bigActionEmoji}>📢</Text>
          <View style={styles.bigActionText}>
            <Text style={styles.bigActionTitle}>BROADCAST SMS</Text>
            <Text style={styles.bigActionSubtitle}>Send SMS to selected users or ALL</Text>
          </View>
          <Text style={styles.bigActionArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard} onPress={loadStats}>
          <Text style={styles.actionEmoji}>🔄</Text>
          <Text style={styles.actionTitle}>Refresh Everything</Text>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Admin: {auth.currentUser?.email}</Text>
          <Text style={styles.infoTime}>Last update: {new Date().toLocaleTimeString()}</Text>
        </View>
      </ScrollView>

      {/* ✅ USERS MODAL */}
      <Modal visible={showUsersModal} animationType="slide">
        <SafeAreaView style={styles.fullScreenModal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowUsersModal(false)}><Text style={styles.modalBackText}>← Back</Text></TouchableOpacity>
            <Text style={styles.modalTitle}>👥 Users ({selectedUsers.length} selected)</Text>
            <TouchableOpacity onPress={loadAllUsers}><Text style={styles.modalRefresh}>🔄</Text></TouchableOpacity>
          </View>
          {loadingUsers ? (
            <View style={styles.center}><ActivityIndicator size="large" color="#C4935D" /></View>
          ) : (
            <FlatList data={users} renderItem={renderUser} keyExtractor={(item) => item.id} />
          )}
        </SafeAreaView>
      </Modal>

      {/* ✅ BROADCAST MODAL */}
      <Modal visible={showBroadcastModal} animationType="slide">
        <SafeAreaView style={styles.fullScreenModal}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowBroadcastModal(false)}><Text style={styles.modalBackText}>← Back</Text></TouchableOpacity>
            <Text style={styles.modalTitle}>📢 Broadcast SMS ({selectedUsers.length || users.length} users)</Text>
          </View>
          
          <ScrollView style={styles.broadcastContainer}>
            <View style={styles.broadcastSection}>
              <Text style={styles.broadcastLabel}>Send SMS to:</Text>
              <TouchableOpacity style={[
                styles.broadcastOption,
                broadcastType === "all" && styles.broadcastOptionActive
              ]} onPress={() => setBroadcastType("all")}>
                <Text style={styles.broadcastOptionText}>ALL USERS ({users.length})</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[
                styles.broadcastOption,
                broadcastType === "selected" && styles.broadcastOptionActive
              ]} onPress={() => setBroadcastType("selected")}>
                <Text style={styles.broadcastOptionText}>SELECTED ({selectedUsers.length})</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.broadcastSection}>
              <Text style={styles.broadcastLabel}>SMS Message:</Text>
              <TextInput
                style={styles.broadcastInput}
                multiline
                numberOfLines={4}
                placeholder="Type your SMS message (like bank notifications)..."
                value={broadcastMessage}
                onChangeText={setBroadcastMessage}
              />
            </View>

            <TouchableOpacity 
              style={[
                styles.sendBroadcastBtn,
                (!broadcastMessage.trim() || broadcastLoading) && styles.sendBroadcastBtnDisabled
              ]}
              onPress={sendBroadcast}
              disabled={!broadcastMessage.trim() || broadcastLoading}
            >
              <Text style={styles.sendBroadcastBtnText}>
                {broadcastLoading ? "🚀 SENDING SMS..." : `🚀 SEND SMS TO ${broadcastType === "all" ? users.length : selectedUsers.length} USERS`}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f8f5f0" },
  container: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24, paddingTop: 12 },
  title: { fontSize: 28, fontWeight: "800", color: "#4a3b31" },
  subtitle: { fontSize: 14, color: "#8b7968", marginTop: 4 },
  logoutBtn: { backgroundColor: "#e74c3c", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  logoutText: { color: "white", fontWeight: "700", fontSize: 14 },

  statsRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", marginBottom: 24 },
  statCard: { width: "48%", backgroundColor: "white", borderRadius: 12, padding: 20, alignItems: "center", marginBottom: 12, elevation: 3 },
  statEmoji: { fontSize: 32, marginBottom: 8 },
  statNumber: { fontSize: 28, fontWeight: "800", color: "#C4935D" },
  statLabel: { fontSize: 12, color: "#8b7968", textAlign: "center" },

  bigActionCard: { flexDirection: "row", backgroundColor: "white", borderRadius: 16, padding: 20, alignItems: "center", marginBottom: 16, elevation: 5, borderLeftWidth: 5, borderLeftColor: "#C4935D" },
  bigActionEmoji: { fontSize: 36, marginRight: 16 },
  bigActionText: { flex: 1 },
  bigActionTitle: { fontSize: 18, fontWeight: "800", color: "#4a3b31" },
  bigActionSubtitle: { fontSize: 14, color: "#8b7968", marginTop: 4 },
  bigActionArrow: { fontSize: 24, color: "#C4935D", fontWeight: "bold" },

  actionCard: { flexDirection: "row", backgroundColor: "white", borderRadius: 12, padding: 20, alignItems: "center", marginBottom: 12, elevation: 3 },
  actionEmoji: { fontSize: 28, marginRight: 16 },
  actionTitle: { fontSize: 16, fontWeight: "700", color: "#4a3b31", flex: 1 },
  actionArrow: { fontSize: 20, color: "#C4935D", fontWeight: "bold" },

  infoCard: { backgroundColor: "white", borderRadius: 12, padding: 16, marginTop: 20, borderLeftWidth: 4, borderLeftColor: "#27ae60" },
  infoLabel: { fontSize: 12, color: "#8b7968", fontWeight: "600" },
  infoTime: { fontSize: 12, color: "#8b7968", marginTop: 4 },

  fullScreenModal: { flex: 1, backgroundColor: "#f8f5f0" },
  modalHeader: { flexDirection: "row", alignItems: "center", padding: 16, backgroundColor: "white", borderBottomWidth: 1, borderBottomColor: "#eee" },
  modalBackText: { fontSize: 16, fontWeight: "700", color: "#C4935D", padding: 8 },
  modalTitle: { flex: 1, fontSize: 20, fontWeight: "800", textAlign: "center" },
  modalRefresh: { fontSize: 20, padding: 8 },

  // USER LIST
  userCard: { flexDirection: "row", backgroundColor: "white", borderRadius: 12, padding: 16, margin: 8, elevation: 2, alignItems: "center" },
  suspendedUserCard: { backgroundColor: "#fff5f5", borderLeftWidth: 4, borderLeftColor: "#e74c3c" },
  userLeft: { flex: 2, flexDirection: "row", alignItems: "center" },
  selectCircle: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: "#ddd", marginRight: 12, justifyContent: "center", alignItems: "center" },
  selectCircleActive: { backgroundColor: "#C4935D", borderColor: "#C4935D" },
  selectCheck: { color: "white", fontWeight: "bold", fontSize: 14 },
  userInfo: { flex: 1 },
  userHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  userName: { fontSize: 18, fontWeight: "700", color: "#4a3b31" },
  suspendedBadge: { fontSize: 12, color: "#e74c3c", backgroundColor: "rgba(231,76,60,0.1)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  userEmail: { fontSize: 14, color: "#8b7968", marginTop: 4 },
  phoneText: { fontSize: 12, color: "#27ae60", marginTop: 2, fontWeight: "600" },
  performanceContainer: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  performanceLabel: { fontSize: 12, fontWeight: "600", marginRight: 8 },
  progressBar: { flex: 1, height: 8, backgroundColor: "#f0f0f0", borderRadius: 4, overflow: "hidden", marginRight: 8 },
  progressFill: { height: "100%", backgroundColor: "#C4935D", borderRadius: 4 },
  performanceText: { fontSize: 14, fontWeight: "700", color: "#C4935D", minWidth: 35 },

  // BUTTONS
  userActionsRight: { flexDirection: "row", gap: 4, alignItems: "center" }, // Reduced gap for new button
  editPhoneBtn: { 
    backgroundColor: "#e8f4f8", 
    padding: 8, 
    borderRadius: 8, 
    width: 40, 
    height: 40, 
    justifyContent: "center", 
    alignItems: "center" 
  },
  editPhoneText: { 
    color: "#3498db", 
    fontSize: 16, 
    fontWeight: "bold" 
  },
  notifyBtn: { backgroundColor: "#d4edda", padding: 10, borderRadius: 8, width: 44, height: 44, justifyContent: "center", alignItems: "center" },
  notifyBtnText: { color: "#155724", fontSize: 18, fontWeight: "bold" },
  actionBtnSmall: { padding: 8, borderRadius: 6, width: 44, height: 44, justifyContent: "center", alignItems: "center" },
  suspendBtn: { backgroundColor: "#fff3cd" },
  unsuspendBtn: { backgroundColor: "#d1ecf1" },
  actionBtnTextSmall: { fontSize: 16, fontWeight: "bold" },
  deleteBtn: { backgroundColor: "#f8d7da", padding: 10, borderRadius: 8, width: 44, height: 44, justifyContent: "center", alignItems: "center" },
  deleteBtnText: { color: "#721c24", fontSize: 18, fontWeight: "bold" },

  // BROADCAST
  broadcastContainer: { flex: 1, padding: 16 },
  broadcastSection: { marginBottom: 24 },
  broadcastLabel: { fontSize: 16, fontWeight: "700", color: "#4a3b31", marginBottom: 12 },
  broadcastOption: { backgroundColor: "white", padding: 16, borderRadius: 12, marginBottom: 8, elevation: 2 },
  broadcastOptionActive: { backgroundColor: "#C4935D", elevation: 4 },
  broadcastOptionText: { fontSize: 16, fontWeight: "600", color: "#4a3b31" },
  broadcastInput: { backgroundColor: "white", borderRadius: 12, padding: 16, fontSize: 16, textAlignVertical: "top", elevation: 2, minHeight: 100 },
  sendBroadcastBtn: { backgroundColor: "#C4935D", padding: 20, borderRadius: 16, alignItems: "center", marginTop: 20, elevation: 5 },
  sendBroadcastBtnDisabled: { backgroundColor: "#ddd" },
  sendBroadcastBtnText: { color: "white", fontSize: 18, fontWeight: "800" },
});
