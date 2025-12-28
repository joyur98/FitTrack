import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { auth } from './firebaseConfig';
import { signOut } from 'firebase/auth';
import { getFirestore, collection, query, where, onSnapshot } from 'firebase/firestore';

export default function Dashboard() {
  const router = useRouter();
  const db = getFirestore();

  const [profileImage, setProfileImage] = useState(null);
  const [userName, setUserName] = useState('User');
  const [loading, setLoading] = useState(true);
  const [totalCalories, setTotalCalories] = useState(0);

  // Fetch user info and today's total calories
  useEffect(() => {
  const user = auth.currentUser;
  if (!user) {
    setLoading(false);
    return;
  }

  const name = user.email.split('@')[0];
  setUserName(name.charAt(0).toUpperCase() + name.slice(1));

  const q = query(
    collection(db, 'calorie_intake'),
    where('userID', '==', user.uid)
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    let total = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // start of today

    snapshot.forEach((doc) => {
      const data = doc.data();

      // Safety check
      if (data.calorie && data.date && data.date.toDate) {
        const entryDate = data.date.toDate();
        if (entryDate >= today) {
          total += data.calorie;
        }
      }
    });

    setTotalCalories(total);
    setLoading(false); // stop loading after data is processed
  }, (error) => {
    console.error("Firestore snapshot error:", error);
    setLoading(false);
  });

  return () => unsubscribe();
}, []);

  const pickProfileImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert('Permission required');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/login');
    } catch {
      alert('Logout error');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#C4935D" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* HEADER */}
        <View style={styles.headerContainer}>
          <Text style={styles.appTitle}>FitTrack</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* PROFILE */}
        <View style={styles.profileSection}>
          <TouchableOpacity onPress={pickProfileImage}>
            <Image
              source={{
                uri:
                  profileImage ||
                  'https://i.pinimg.com/474x/08/35/0c/08350cafa4fabb8a6a1be2d9f18f2d88.jpg',
              }}
              style={styles.profilePic}
            />
            <View style={styles.cameraOverlay}>
              <Text style={styles.cameraEmoji}>📷</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.userInfo}>
            <Text style={styles.greeting}>Hello, {userName}!</Text>
            <Text style={styles.subtitle}>Welcome back to FitTrack</Text>
            <Text style={styles.motivational}>Keep pushing your limits 💪</Text>
          </View>
        </View>

        {/* SUMMARY */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Your daily fitness summary</Text>

          <View style={styles.cardsRow}>
            <View style={[styles.summaryCard, { borderLeftColor: '#5b4334' }]}>
              <Text style={styles.cardIcon}>👟</Text>
              <Text style={styles.cardValue}>8,420</Text>
              <Text style={styles.cardName}>Steps</Text>
            </View>

            <View style={[styles.summaryCard, { borderLeftColor: '#C4935D' }]}>
              <Text style={styles.cardIcon}>🔥</Text>
              <Text style={styles.cardValue}>576</Text>
              <Text style={styles.cardName}>Burned</Text>
            </View>
          </View>

          <View style={styles.cardsRow}>
            {/* ✅ CLICKABLE INTAKE CARD */}
            <TouchableOpacity
              style={[styles.summaryCard, { borderLeftColor: '#DCB083' }]}
              onPress={() => router.push('/calories')}
              activeOpacity={0.85}
            >
              <Text style={styles.cardIcon}>🍎</Text>
              <Text style={styles.cardValue}>{totalCalories}</Text>
              <Text style={styles.cardName}>Intake</Text>
            </TouchableOpacity>

            <View style={[styles.summaryCard, { borderLeftColor: '#8b7968' }]}>
              <Text style={styles.cardIcon}>⏱️</Text>
              <Text style={styles.cardValue}>42</Text>
              <Text style={styles.cardName}>Workout</Text>
            </View>
          </View>
        </View>

        {/* GOAL */}
        <View style={styles.goalSection}>
          <Text style={styles.goalTitle}>Weekly Goal</Text>
          <Text style={styles.goalDescText}>
            You've completed 72% of your weekly goal 🎯
          </Text>

          <View style={styles.progressBar}>
            <View style={styles.progressFilled} />
          </View>
        </View>

        {/* BOTTOM NAV */}
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => router.push('/workout')}
          >
            <Text style={styles.navEmoji}>🏋️</Text>
            <Text style={styles.navText}>Workout</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navButton, styles.navButtonActive]}
            onPress={() => router.push('/dashboard')}
          >
            <Text style={styles.navEmoji}>🏠</Text>
            <Text style={[styles.navText, styles.navTextActive]}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navButton}
            onPress={() => router.push('/profile')}
          >
            <Text style={styles.navEmoji}>📊</Text>
            <Text style={styles.navText}>Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navButton}
            onPress={() => router.push('/settings')}
          >
            <Text style={styles.navEmoji}>⚙️</Text>
            <Text style={styles.navText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f5f0',
  },
  container: {
    flex: 1,
    padding: 16,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#4a3b31',
    letterSpacing: 1,
  },
  logoutButton: {
    backgroundColor: '#C4935D',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  profileSection: {
    backgroundColor: '#5b4334',
    borderRadius: 14,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 4,
  },
  profilePic: {
    width: 75,
    height: 75,
    borderRadius: 37,
    marginRight: 14,
    borderWidth: 3,
    borderColor: '#C4935D',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 14,
    backgroundColor: '#C4935D',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#5b4334',
  },
  cameraEmoji: {
    fontSize: 14,
  },
  userInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 12,
    color: '#d4c4a8',
    marginBottom: 2,
  },
  motivational: {
    fontSize: 11,
    color: '#b8a99f',
  },
  summaryContainer: {
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4a3b31',
    marginBottom: 14,
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    marginHorizontal: 5,
    borderLeftWidth: 4,
    elevation: 2,
  },
  cardIcon: {
    fontSize: 26,
    marginBottom: 5,
  },
  cardValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4a3b31',
  },
  cardName: {
    fontSize: 11,
    color: '#8b7968',
    marginTop: 3,
    textAlign: 'center',
  },
  goalSection: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 18,
    marginBottom: 24,
    elevation: 2,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4a3b31',
    marginBottom: 8,
  },
  goalDescText: {
    fontSize: 14,
    color: '#8b7968',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e6ddd0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFilled: {
    height: '100%',
    width: '72%',
    backgroundColor: '#C4935D',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 8,
  },
  navButton: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  navButtonActive: {
    backgroundColor: '#f8f5f0',
    borderRadius: 8,
  },
  navEmoji: {
    fontSize: 22,
    marginBottom: 3,
  },
  navText: {
    fontSize: 10,
    color: '#8b7968',
    fontWeight: '500',
  },
  navTextActive: {
    color: '#C4935D',
    fontWeight: '600',
  },
});
