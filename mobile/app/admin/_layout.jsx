import React, { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { auth, db } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function AdminLayout() {
  const router = useRouter();

  useEffect(() => {
    const checkAdminStatus = async (user) => {
      if (!user) {
        // No user logged in
        router.replace("/admin/login");
        return;
      }

      try {
        // Check if user is admin in Firestore
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
          console.log("❌ User document not found");
          await auth.signOut();
          router.replace("/admin/login");
          return;
        }

        const userData = userDocSnap.data();
        
        // Verify admin role
        if (userData.role === "admin" || userData.isAdmin === true) {
          console.log("✅ Admin verified in layout!");
        } else {
          console.log("❌ Not an admin");
          await auth.signOut();
          router.replace("/");
        }
      } catch (error) {
        console.error("❌ Error checking admin status:", error);
        router.replace("/admin/login");
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      checkAdminStatus(user);
    });

    return unsubscribe;
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="users" options={{ headerShown: false }} />
      <Stack.Screen name="stats" options={{ headerShown: false }} />
    </Stack>
  );
}
