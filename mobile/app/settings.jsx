// settings.jsx - FIXED DARK MODE IMPLEMENTATION
import { 
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Linking,
  TextInput,
  Modal,
  ActivityIndicator,
  Animated,
  Easing
} from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'expo-router'
import { auth, db } from './firebaseConfig'
import { 
  deleteUser, 
  reauthenticateWithCredential, 
  EmailAuthProvider, 
  updatePassword 
} from 'firebase/auth'
import { doc, getDoc, deleteDoc, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore'

export default function Settings() {
  const router = useRouter()

  // State variables
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true)
  const [medicalAlertEnabled, setMedicalAlertEnabled] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Modals
  const [showReAuth, setShowReAuth] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [showNepalEmergency, setShowNepalEmergency] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [reauthEmail, setReauthEmail] = useState('')
  const [reauthPassword, setReauthPassword] = useState('')
  const [loading, setLoading] = useState(false)

  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0))
  const [slideAnim] = useState(new Animated.Value(50))
  const [scaleAnim] = useState(new Animated.Value(1))
  const [shakeAnim] = useState(new Animated.Value(0))
  const sectionAnims = useRef([])
  const [sectionsLoaded, setSectionsLoaded] = useState(false)

  // Theme colors with dark mode support
  const theme = {
    backgroundColor: isDarkMode ? "#121212" : "#f5efe6",
    cardBackground: isDarkMode ? "#1e1e1e" : "#fff",
    textColor: isDarkMode ? "#ffffff" : "#4a3b31",
    secondaryText: isDarkMode ? "#a0a0a0" : "#7a6659",
    borderColor: isDarkMode ? "#333" : "#eee",
    primaryColor: "#C4935D",
    secondaryColor: isDarkMode ? "#2d2d2d" : "#5b4334",
    inputBackground: isDarkMode ? "#2d2d2d" : "#f5efe6",
    emergencyRed: isDarkMode ? "#ff6b6b" : "#c0392b",
    emergencyBg: isDarkMode ? "#4a0000" : "#ffe6e6"
  }

  // ===== FIXED DARK MODE FETCHING - IMPROVED VERSION =====
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      console.log("No user found");
      return;
    }

    console.log("Fetching dark mode for user ID:", user.uid);

    // Try to get user data directly using document ID if possible
    // First, let's check if we can find the user document with a query
    const fetchUserData = async () => {
      try {
        // Method 1: Query by userID field
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("userID", "==", user.uid));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const userData = userDoc.data();
          console.log("Found user data:", userData);
          
          // Check if darkMode exists, default to false if not
          const darkModeValue = userData.darkMode !== undefined ? userData.darkMode : false;
          console.log("Setting dark mode to:", darkModeValue);
          setIsDarkMode(darkModeValue);
        } else {
          // Method 2: Try to get document directly by ID (if document ID is user.uid)
          try {
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);
            
            if (userDocSnap.exists()) {
              const userData = userDocSnap.data();
              console.log("Found user data by direct ID:", userData);
              
              const darkModeValue = userData.darkMode !== undefined ? userData.darkMode : false;
              console.log("Setting dark mode to:", darkModeValue);
              setIsDarkMode(darkModeValue);
            } else {
              console.log("No user document found in either method");
              setIsDarkMode(false); // Default to light mode
            }
          } catch (directError) {
            console.log("Direct fetch failed, using default");
            setIsDarkMode(false);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setIsDarkMode(false);
      }
    };

    fetchUserData();

    // Set up real-time listener
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("userID", "==", user.uid));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      console.log("Real-time update received");
      
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        
        // Update dark mode if it exists in the data
        if (userData.darkMode !== undefined) {
          console.log("Real-time dark mode update:", userData.darkMode);
          setIsDarkMode(userData.darkMode);
        }
      }
    }, (error) => {
      console.error("Error in real-time listener:", error);
    });

    // Cleanup listener
    return () => unsubscribe();
  }, []);

  // ===== ANIMATION FUNCTIONS =====
  useEffect(() => {
    // Entry animations
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 500,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      // Stagger section animations
      sectionAnims.current.forEach((anim, index) => {
        Animated.sequence([
          Animated.delay(index * 150),
          Animated.parallel([
            Animated.timing(anim.fade, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.timing(anim.slide, {
              toValue: 0,
              duration: 400,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
          ]),
        ]).start();
      });
      setSectionsLoaded(true);
    });

    // Initialize section animations
    sectionAnims.current = Array(5).fill().map(() => ({
      slide: new Animated.Value(30),
      fade: new Animated.Value(0),
    }));

    return () => {
      sectionAnims.current.forEach(anim => {
        anim.slide.stopAnimation();
        anim.fade.stopAnimation();
      });
    };
  }, []);

  // ... rest of your code remains the same ...

  // Shake animation for errors
  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // ===== NEPAL EMERGENCY CONTACTS =====
  const nepalEmergencyContacts = [
    { name: "Police Emergency", number: "100", type: "🚓 Police" },
    { name: "Ambulance", number: "102", type: "🚑 Medical" },
    { name: "Fire Department", number: "101", type: "🚒 Fire" },
    { name: "Tourist Police", number: "1144", type: "👮 Tourist" },
    { name: "Tribhuvan University Teaching Hospital", number: "01-4412303", type: "🏥 Hospital" },
    { name: "Bir Hospital", number: "01-4221119", type: "🏥 Hospital" },
    { name: "Patan Hospital", number: "01-5522288", type: "🏥 Hospital" },
    { name: "Civil Service Hospital", number: "01-4262859", type: "🏥 Hospital" },
    { name: "Kanti Children's Hospital", number: "01-4377368", type: "🏥 Pediatric" },
    { name: "Nepal Mediciti Hospital", number: "9801180000", type: "🏥 Private" },
    { name: "Norvic International Hospital", number: "01-4258554", type: "🏥 Private" },
    { name: "Red Cross Nepal", number: "01-4285083", type: "🟥 Relief" },
  ]

  // Handle emergency call with animation
  const handleEmergencyCall = (number, name) => {
    Alert.alert(
      `Call ${name}`,
      `Do you want to call ${number}?`,
      [
        { 
          text: "Cancel", 
          style: "cancel",
          onPress: () => {
            // Cancel animation
            Animated.spring(scaleAnim, {
              toValue: 1,
              friction: 3,
              useNativeDriver: true,
            }).start();
          }
        },
        { 
          text: "Call", 
          style: "destructive", 
          onPress: () => {
            // Press animation
            Animated.sequence([
              Animated.timing(scaleAnim, {
                toValue: 0.9,
                duration: 100,
                useNativeDriver: true,
              }),
              Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
              }),
            ]).start(() => {
              Linking.openURL(`tel:${number}`);
            });
          }
        }
      ]
    );
  }

  // Quick emergency buttons
  const handleQuickEmergency = (type) => {
    let number = ""
    let name = ""
    
    switch(type) {
      case 'ambulance':
        number = "102"
        name = "Ambulance"
        break
      case 'police':
        number = "100"
        name = "Police"
        break
      case 'fire':
        number = "101"
        name = "Fire Department"
        break
      case 'tourist':
        number = "1144"
        name = "Tourist Police"
        break
    }
    
    handleEmergencyCall(number, name)
  }

  // ===== CHANGE PASSWORD FUNCTION =====
  const handleChangePassword = () => {
    setShowChangePassword(true);
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  }

  const executePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      shake();
      Alert.alert("Error", "Please fill all password fields");
      return;
    }

    if (newPassword.length < 6) {
      shake();
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      shake();
      Alert.alert("Error", "New passwords don't match");
      return;
    }

    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Error", "User not found");
        return;
      }

      // Button press animation
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);

      Alert.alert("✅ Success", "Password changed successfully!");
      
      // Success animation
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }).start(() => {
        setShowChangePassword(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      });
      
    } catch (error) {
      console.error("Password change error:", error);
      shake();
      if (error.code === 'auth/wrong-password') {
        Alert.alert("Error", "Current password is incorrect");
      } else if (error.code === 'auth/weak-password') {
        Alert.alert("Error", "Password is too weak. Use at least 6 characters");
      } else if (error.code === 'auth/requires-recent-login') {
        Alert.alert("Error", "Please login again and try");
      } else {
        Alert.alert("Error", "Failed to change password");
      }
    } finally {
      setLoading(false);
    }
  }

  // ===== DELETE ACCOUNT FUNCTION =====
  const deleteAllUserData = async (userId) => {
    const collections = ["users", "calorie_burn", "calorie_intake", "workouts"];
    for (const col of collections) {
      const q = query(collection(db, col), where("userID", "==", userId));
      const snapshot = await getDocs(q);
      for (const docSnap of snapshot.docs) {
        await deleteDoc(doc(db, col, docSnap.id));
      }
    }
  }

  const handleDeleteAccount = () => {
    Alert.alert(
      "⚠️ Delete Account",
      "This will permanently delete all your data. This action cannot be undone.",
      [
        { 
          text: "Cancel", 
          style: "cancel",
          onPress: () => {
            Animated.spring(scaleAnim, {
              toValue: 1,
              friction: 3,
              useNativeDriver: true,
            }).start();
          }
        },
        { 
          text: "Delete Account", 
          style: "destructive",
          onPress: async () => {
            try {
              const user = auth.currentUser;
              if (!user) return;

              setLoading(true);

              try {
                await deleteAllUserData(user.uid);
                await deleteUser(user);
                
                // Success animation
                Animated.timing(fadeAnim, {
                  toValue: 0,
                  duration: 300,
                  useNativeDriver: true,
                }).start(() => {
                  router.replace('/login');
                  Alert.alert("Account Deleted", "Your account has been deleted.");
                });
              } catch (err) {
                if (err.code === 'auth/requires-recent-login') {
                  setShowReAuth(true);
                } else {
                  throw err;
                }
              }
            } catch (error) {
              console.error(error);
              shake();
              Alert.alert("Error", "Failed to delete account");
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  }

  const handleReAuthAndDelete = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) return;

      const credential = EmailAuthProvider.credential(reauthEmail, reauthPassword);
      await reauthenticateWithCredential(user, credential);

      await deleteAllUserData(user.uid);
      await deleteUser(user);

      setShowReAuth(false);
      router.replace('/login');
      Alert.alert("Account Deleted", "Your account has been deleted.");
    } catch (error) {
      console.error(error);
      shake();
      Alert.alert("Error", "Re-authentication failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  }

  // ===== OTHER HANDLERS =====
  const handleMedicalInfo = () => {
    Alert.alert(
      "🏥 Medical Information",
      "In an emergency in Nepal:\n\n1. Call 102 for ambulance\n2. Call 100 for police\n3. Call 1144 for tourist police\n4. Stay calm & provide location\n\nAdd your medical info:",
      [
        { 
          text: "Cancel", 
          style: "cancel",
          onPress: () => {
            Animated.spring(scaleAnim, {
              toValue: 1,
              friction: 3,
              useNativeDriver: true,
            }).start();
          }
        },
        { 
          text: "Add Medical Info", 
          onPress: () => {
            Alert.alert("Coming Soon", "Medical info feature coming in next update");
          }
        }
      ]
    );
  }

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { 
          text: "Cancel", 
          style: "cancel",
          onPress: () => {
            Animated.spring(scaleAnim, {
              toValue: 1,
              friction: 3,
              useNativeDriver: true,
            }).start();
          }
        },
        { 
          text: "Logout", 
          style: "destructive", 
          onPress: () => {
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }).start(() => {
              router.push('/login');
            });
          }
        }
      ]
    );
  }

  // Render Nepal Emergency Modal
  const renderNepalEmergencyModal = () => (
    <Modal visible={showNepalEmergency} transparent animationType="slide">
      <View style={[styles.modalOverlay, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.7)' }]}>
        <Animated.View 
          style={[
            styles.modalContent, 
            { 
              backgroundColor: theme.cardBackground,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <Text style={[styles.modalTitle, { color: theme.textColor }]}>🇳🇵 Nepal Emergency</Text>
          <Text style={[styles.modalSubtitle, { color: theme.secondaryText }]}>Tap any number to call immediately</Text>
          
          <ScrollView style={styles.emergencyScroll} showsVerticalScrollIndicator={false}>
            {nepalEmergencyContacts.map((contact, index) => (
              <Animated.View
                key={index}
                style={{
                  opacity: sectionsLoaded ? 1 : 0,
                  transform: [{ translateY: sectionsLoaded ? 0 : 20 }]
                }}
              >
                <TouchableOpacity 
                  style={[styles.emergencyContactItem, { 
                    borderBottomColor: theme.borderColor,
                    backgroundColor: theme.inputBackground 
                  }]}
                  onPress={() => {
                    setShowNepalEmergency(false);
                    handleEmergencyCall(contact.number, contact.name);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.contactIcon, { backgroundColor: isDarkMode ? '#4a3b3120' : '#C4935D20' }]}>
                    <Text style={styles.contactIconText}>
                      {contact.type.includes('Police') ? '🚓' : 
                       contact.type.includes('Medical') ? '🚑' :
                       contact.type.includes('Fire') ? '🚒' :
                       contact.type.includes('Hospital') ? '🏥' : '🟥'}
                    </Text>
                  </View>
                  <View style={styles.contactDetails}>
                    <Text style={[styles.contactName, { color: theme.textColor }]}>{contact.name}</Text>
                    <Text style={[styles.contactType, { color: theme.secondaryText }]}>{contact.type}</Text>
                  </View>
                  <Text style={[styles.contactNumber, { color: theme.emergencyRed }]}>{contact.number}</Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </ScrollView>
          
          <TouchableOpacity 
            style={[styles.modalButton, {backgroundColor: theme.inputBackground, marginTop: 10}]}
            onPress={() => setShowNepalEmergency(false)}
            activeOpacity={0.7}
          >
            <Text style={[styles.modalButtonText, {color: theme.textColor}]}>Close</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  )

  return (
    <Animated.ScrollView 
      style={[styles.container, { 
        backgroundColor: theme.backgroundColor,
        opacity: fadeAnim
      }]} 
      showsVerticalScrollIndicator={false}
    >
      {/* Header with animated slide */}
      <Animated.View 
        style={[
          styles.header,
          { 
            transform: [{ translateY: slideAnim }],
            opacity: fadeAnim 
          }
        ]}
      >
        <TouchableOpacity 
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Text style={[styles.backArrow, { color: theme.textColor }]}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.title, { color: theme.textColor }]}>Settings</Text>
          <Text style={[styles.subtitle, { color: theme.secondaryText }]}>Manage your FitTrack preferences</Text>
        </View>
        <View style={styles.headerPlaceholder} />
      </Animated.View>

      {/* 🚨 NEPAL EMERGENCY SECTION */}
      {sectionAnims.current[0] && (
        <Animated.View 
          style={[
            styles.section, 
            { 
              backgroundColor: theme.cardBackground, 
              borderLeftWidth: 4, 
              borderLeftColor: theme.emergencyRed,
              opacity: sectionAnims.current[0].fade,
              transform: [{ translateY: sectionAnims.current[0].slide }]
            }
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.emergencyRed, borderBottomColor: theme.borderColor }]}>
            🇳🇵 Nepal Emergency Contacts
          </Text>
          
          <Text style={[styles.emergencyNote, { color: theme.emergencyRed, backgroundColor: theme.emergencyBg }]}>
            Immediate assistance numbers for Nepal
          </Text>

          {/* Quick Emergency Buttons */}
          <View style={styles.quickEmergencyButtons}>
            <TouchableOpacity 
              style={[styles.quickEmergencyBtn, styles.ambulanceBtn]}
              onPress={() => handleQuickEmergency('ambulance')}
              activeOpacity={0.8}
            >
              <Text style={styles.quickBtnEmoji}>🚑</Text>
              <Text style={styles.quickBtnText}>Ambulance</Text>
              <Text style={styles.quickBtnNumber}>102</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.quickEmergencyBtn, styles.policeBtn]}
              onPress={() => handleQuickEmergency('police')}
              activeOpacity={0.8}
            >
              <Text style={styles.quickBtnEmoji}>🚓</Text>
              <Text style={styles.quickBtnText}>Police</Text>
              <Text style={styles.quickBtnNumber}>100</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.quickEmergencyBtn, styles.fireBtn]}
              onPress={() => handleQuickEmergency('fire')}
              activeOpacity={0.8}
            >
              <Text style={styles.quickBtnEmoji}>🚒</Text>
              <Text style={styles.quickBtnText}>Fire</Text>
              <Text style={styles.quickBtnNumber}>101</Text>
            </TouchableOpacity>
          </View>

          {/* Emergency Options */}
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: theme.emergencyBg }]} 
            onPress={() => setShowNepalEmergency(true)}
            activeOpacity={0.7}
          >
            <View>
              <Text style={[styles.settingText, { color: theme.emergencyRed, fontWeight: '600' }]}>View All Emergency Numbers</Text>
              <Text style={[styles.emergencySubtext, { color: theme.emergencyRed }]}>Full list of Nepal emergency contacts</Text>
            </View>
            <Text style={[styles.arrow, { color: theme.emergencyRed, fontSize: 20 }]}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: theme.emergencyBg }]} 
            onPress={handleMedicalInfo}
            activeOpacity={0.7}
          >
            <View>
              <Text style={[styles.settingText, { color: theme.emergencyRed, fontWeight: '600' }]}>Medical Information</Text>
              <Text style={[styles.emergencySubtext, { color: theme.emergencyRed }]}>Add your medical details</Text>
            </View>
            <Text style={[styles.arrow, { color: theme.emergencyRed, fontSize: 20 }]}>🏥</Text>
          </TouchableOpacity>
          
          <View style={[styles.settingItem, { borderBottomWidth: 0 }]}>
            <Text style={[styles.settingText, { color: theme.emergencyRed, fontWeight: '600' }]}>Emergency Alerts</Text>
            <Switch
              value={medicalAlertEnabled}
              onValueChange={setMedicalAlertEnabled}
              trackColor={{ false: isDarkMode ? '#4a0000' : '#ffcccc', true: theme.emergencyRed }}
              thumbColor={medicalAlertEnabled ? '#fff' : '#f4f3f4'}
            />
          </View>
        </Animated.View>
      )}

      {/* Account Section with Change Password */}
      {sectionAnims.current[1] && (
        <Animated.View 
          style={[
            styles.section, 
            { 
              backgroundColor: theme.cardBackground,
              opacity: sectionAnims.current[1].fade,
              transform: [{ translateY: sectionAnims.current[1].slide }]
            }
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.textColor, borderBottomColor: theme.borderColor }]}>Account</Text>
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: theme.borderColor }]} 
            onPress={() => router.push('/profile')}
            activeOpacity={0.7}
          >
            <Text style={[styles.settingText, { color: theme.textColor }]}>Edit Profile</Text>
            <Text style={[styles.arrow, { color: theme.primaryColor }]}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: theme.borderColor }]} 
            onPress={handleChangePassword}
            activeOpacity={0.7}
          >
            <Text style={[styles.settingText, { color: theme.textColor }]}>Change Password</Text>
            <Text style={[styles.arrow, { color: theme.primaryColor }]}>🔐</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Preferences Section */}
      {sectionAnims.current[2] && (
        <Animated.View 
          style={[
            styles.section, 
            { 
              backgroundColor: theme.cardBackground,
              opacity: sectionAnims.current[2].fade,
              transform: [{ translateY: sectionAnims.current[2].slide }]
            }
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.textColor, borderBottomColor: theme.borderColor }]}>Preferences</Text>
          <View style={[styles.settingItem, { borderBottomColor: theme.borderColor }]}>
            <Text style={[styles.settingText, { color: theme.textColor }]}>Notifications</Text>
            <Switch 
              value={notificationsEnabled} 
              onValueChange={setNotificationsEnabled} 
              trackColor={{ false: theme.inputBackground, true: theme.secondaryColor }} 
              thumbColor={notificationsEnabled ? '#fff' : '#f4f3f4'} 
            />
          </View>
          <View style={[styles.settingItem, { borderBottomWidth: 0 }]}>
            <Text style={[styles.settingText, { color: theme.textColor }]}>Auto Sync</Text>
            <Switch 
              value={autoSyncEnabled} 
              onValueChange={setAutoSyncEnabled} 
              trackColor={{ false: theme.inputBackground, true: theme.secondaryColor }} 
              thumbColor={autoSyncEnabled ? '#fff' : '#f4f3f4'} 
            />
          </View>
        </Animated.View>
      )}

      {/* Support Section */}
      {sectionAnims.current[3] && (
        <Animated.View 
          style={[
            styles.section, 
            { 
              backgroundColor: theme.cardBackground,
              opacity: sectionAnims.current[3].fade,
              transform: [{ translateY: sectionAnims.current[3].slide }]
            }
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.textColor, borderBottomColor: theme.borderColor }]}>Support & About</Text>
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: theme.borderColor }]} 
            onPress={() => Alert.alert("Help & Support","Email: support@fittrack.com")}
            activeOpacity={0.7}
          >
            <Text style={[styles.settingText, { color: theme.textColor }]}>Help & Support</Text>
            <Text style={[styles.arrow, { color: theme.primaryColor }]}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.settingItem, { borderBottomColor: theme.borderColor }]} 
            onPress={() => Alert.alert("Privacy Policy","Your data is secure with us")}
            activeOpacity={0.7}
          >
            <Text style={[styles.settingText, { color: theme.textColor }]}>Privacy Policy</Text>
            <Text style={[styles.arrow, { color: theme.primaryColor }]}>›</Text>
          </TouchableOpacity>
          <View style={[styles.settingItem, { borderBottomWidth: 0 }]}>
            <Text style={[styles.settingText, { color: theme.textColor }]}>App Version</Text>
            <Text style={[styles.versionText, { color: theme.secondaryText }]}>1.0.0</Text>
          </View>
        </Animated.View>
      )}

      {/* Action Buttons */}
      {sectionAnims.current[4] && (
        <Animated.View 
          style={[
            styles.actionSection,
            { 
              opacity: sectionAnims.current[4].fade,
              transform: [{ translateY: sectionAnims.current[4].slide }]
            }
          ]}
        >
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: theme.inputBackground, borderColor: theme.borderColor }]} 
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Text style={[styles.logoutButtonText, { color: theme.textColor }]}>Log Out</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: theme.backgroundColor, borderColor: theme.emergencyRed }]} 
            onPress={handleDeleteAccount}
            activeOpacity={0.7}
          >
            <Text style={[styles.deleteButtonText, { color: theme.emergencyRed }]}>Delete Account</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Nepal Emergency Modal */}
      {renderNepalEmergencyModal()}

      {/* Change Password Modal */}
      <Modal visible={showChangePassword} transparent animationType="fade">
        <View style={[styles.modalOverlay, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.7)' }]}>
          <Animated.View 
            style={[
              styles.modalContent, 
              { 
                backgroundColor: theme.cardBackground,
                transform: [
                  { translateX: shakeAnim },
                  { scale: scaleAnim }
                ]
              }
            ]}
          >
            <Text style={[styles.modalTitle, { color: theme.textColor }]}>Change Password</Text>
            <Text style={[styles.modalSubtitle, { color: theme.secondaryText }]}>Enter your current and new password</Text>
            
            <TextInput
              style={[styles.modalInput, { backgroundColor: theme.inputBackground, borderColor: theme.borderColor, color: theme.textColor }]}
              placeholder="Current Password"
              placeholderTextColor={theme.secondaryText}
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
              autoCapitalize="none"
            />
            
            <TextInput
              style={[styles.modalInput, { backgroundColor: theme.inputBackground, borderColor: theme.borderColor, color: theme.textColor }]}
              placeholder="New Password (min 6 chars)"
              placeholderTextColor={theme.secondaryText}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              autoCapitalize="none"
            />
            
            <TextInput
              style={[styles.modalInput, { backgroundColor: theme.inputBackground, borderColor: theme.borderColor, color: theme.textColor }]}
              placeholder="Confirm New Password"
              placeholderTextColor={theme.secondaryText}
              secureTextEntry
              value={confirmNewPassword}
              onChangeText={setConfirmNewPassword}
              autoCapitalize="none"
            />
            
            <TouchableOpacity 
              style={[styles.modalButton, { backgroundColor: theme.primaryColor }]} 
              onPress={executePasswordChange}
              activeOpacity={0.8}
            >
              {loading ? <ActivityIndicator color="#fff"/> : <Text style={styles.modalButtonText}>Change Password</Text>}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.modalButton, {backgroundColor: theme.inputBackground, marginTop: 10}]} 
              onPress={() => {
                setShowChangePassword(false);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmNewPassword('');
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.modalButtonText, {color: theme.textColor}]}>Cancel</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* Re-auth Modal for Delete Account */}
      <Modal visible={showReAuth} transparent animationType="fade">
        <View style={[styles.modalOverlay, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.7)' }]}>
          <Animated.View 
            style={[
              styles.modalContent, 
              { 
                backgroundColor: theme.cardBackground,
                transform: [{ scale: scaleAnim }]
              }
            ]}
          >
            <Text style={[styles.modalTitle, { color: theme.textColor }]}>Re-authentication Required</Text>
            <Text style={[styles.modalSubtitle, { color: theme.secondaryText }]}>Enter credentials to delete account</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: theme.inputBackground, borderColor: theme.borderColor, color: theme.textColor }]}
              placeholder="Email"
              placeholderTextColor={theme.secondaryText}
              keyboardType="email-address"
              autoCapitalize="none"
              value={reauthEmail}
              onChangeText={setReauthEmail}
            />
            <TextInput
              style={[styles.modalInput, { backgroundColor: theme.inputBackground, borderColor: theme.borderColor, color: theme.textColor }]}
              placeholder="Password"
              placeholderTextColor={theme.secondaryText}
              secureTextEntry
              value={reauthPassword}
              onChangeText={setReauthPassword}
            />
            <TouchableOpacity 
              style={[styles.modalButton, { backgroundColor: theme.primaryColor }]} 
              onPress={handleReAuthAndDelete}
              activeOpacity={0.8}
            >
              {loading ? <ActivityIndicator color="#fff"/> : <Text style={styles.modalButtonText}>Confirm Delete</Text>}
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalButton, {backgroundColor: theme.inputBackground, marginTop: 10}]} 
              onPress={() => setShowReAuth(false)}
              activeOpacity={0.7}
            >
              <Text style={[styles.modalButtonText, {color: theme.textColor}]}>Cancel</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </Animated.ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 16, 
    paddingTop: 20 
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  backArrow: {
    fontSize: 28,
    fontWeight: "700",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  title: { 
    fontSize: 32, 
    fontWeight: '800', 
    marginBottom: 8 
  },
  subtitle: { 
    fontSize: 16, 
    textAlign: 'center' 
  },
  headerPlaceholder: {
    width: 40,
  },
  section: { 
    borderRadius: 20, 
    padding: 20, 
    marginBottom: 24, 
    elevation: 4, 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 8 
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    marginBottom: 16, 
    paddingBottom: 8, 
    borderBottomWidth: 1 
  },
  emergencyNote: {
    fontSize: 14,
    marginBottom: 15,
    textAlign: 'center',
    padding: 8,
    borderRadius: 8
  },
  quickEmergencyButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15
  },
  quickEmergencyBtn: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 4,
    elevation: 2
  },
  ambulanceBtn: {
    backgroundColor: '#e74c3c'
  },
  policeBtn: {
    backgroundColor: '#3498db'
  },
  fireBtn: {
    backgroundColor: '#e67e22'
  },
  quickBtnEmoji: {
    fontSize: 24,
    marginBottom: 4
  },
  quickBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 11
  },
  quickBtnNumber: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 14,
    marginTop: 2
  },
  emergencySubtext: { 
    fontSize: 12, 
    marginTop: 2,
    opacity: 0.8 
  },
  settingItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingVertical: 14, 
    borderBottomWidth: 1 
  },
  settingText: { 
    fontSize: 16, 
    fontWeight: '500' 
  },
  arrow: { 
    fontSize: 20 
  },
  versionText: { 
    fontSize: 14, 
    fontWeight: '500' 
  },
  actionSection: { 
    marginTop: 10, 
    marginBottom: 40 
  },
  actionButton: { 
    paddingVertical: 16, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginBottom: 12,
    borderWidth: 1
  },
  logoutButtonText: { 
    fontSize: 16, 
    fontWeight: '600' 
  },
  deleteButtonText: { 
    fontSize: 16, 
    fontWeight: '600' 
  },
  modalOverlay: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  modalContent: { 
    width: '90%', 
    maxHeight: '80%',
    borderRadius: 20, 
    padding: 20 
  },
  modalTitle: { 
    fontSize: 22, 
    fontWeight: '700', 
    marginBottom: 8,
    textAlign: 'center'
  },
  modalSubtitle: { 
    fontSize: 14, 
    marginBottom: 20,
    textAlign: 'center'
  },
  emergencyScroll: {
    maxHeight: 400,
    marginBottom: 15
  },
  emergencyContactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderBottomWidth: 1,
    marginBottom: 8
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  contactIconText: {
    fontSize: 20
  },
  contactDetails: {
    flex: 1
  },
  contactName: {
    fontSize: 14,
    fontWeight: '600'
  },
  contactType: {
    fontSize: 12,
    marginTop: 2
  },
  contactNumber: {
    fontSize: 16,
    fontWeight: '700'
  },
  modalInput: { 
    padding: 14, 
    borderRadius: 12, 
    fontSize: 16, 
    marginBottom: 12,
    borderWidth: 1
  },
  modalButton: { 
    padding: 14, 
    borderRadius: 14, 
    alignItems: 'center' 
  },
  modalButtonText: {
    fontWeight: '600',
    fontSize: 16
  }
})