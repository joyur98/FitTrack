// app/profileService.js
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';

export const pickAndUploadProfileImage = async (auth, db) => {
  try {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permission to access media library was denied');
    }

    // Pick image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]) {
      return null;
    }

    const imageUri = result.assets[0].uri;
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error('No user logged in');

    // Create unique filename
    const fileName = `profile_${currentUser.uid}_${Date.now()}.jpg`;
    const imageRef = ref(storage, `profile_images/${fileName}`);

    // Upload to Firebase Storage
    const response = await fetch(imageUri);
    const blob = await response.blob();
    await uploadBytes(imageRef, blob);

    // Get download URL
    const downloadURL = await getDownloadURL(imageRef);

    // Update Firestore
    const userDocRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userDocRef, {
      profileImage: downloadURL,
      profileImageUpdatedAt: new Date().toISOString(),
    });

    return downloadURL;
  } catch (error) {
    console.error('Profile image upload error:', error);
    throw error;
  }
};
