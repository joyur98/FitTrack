import React, {useState} from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';



export default function App() {
  const router = useRouter();
  const [profileImage, setProfileImage] = useState(null);
  const pickProfileImage = async () => {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    alert('Permission is required to change profile picture');
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

  return (
    <ScrollView style={styles.container}>
      {/*Account Details*/}
      <View style={styles.accountDetail}>
                <TouchableOpacity onPress={pickProfileImage}>
  <Image
    source={{
      uri: profileImage ? profileImage : 'https://i.pinimg.com/474x/08/35/0c/08350cafa4fabb8a6a1be2d9f18f2d88.jpg',
    }}
    style={styles.profileImage}
  />
</TouchableOpacity>
       <Text style={styles.name}>Your Name</Text>
       <Text style={{fontSize: 15, color: "white", left: 125, bottom: 30}}>Hello, User!</Text>
       <Text style={{fontSize: 15, color: "white", left: 115, bottom: 30}}>Welcome to Fit Track!</Text>
       <Text style={{fontSize: 15, color: "white", left: 100, bottom: 30}}>Where you can track your progress!</Text>
      </View>
      
      {/* Header */}
      <Text style={styles.title}>FitTrack</Text>
      <Text style={styles.subtitle}>Your daily fitness summary</Text>

      {/* Cards */}
      <View style={styles.row}>
        <View style={styles.card}>
          <Text style={styles.value}>8,420</Text>
          <Text style={styles.label}>Steps</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.value}>540</Text>
          <Text style={styles.label}>Calories Intake</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.card}>
          <Text style={styles.value}>576</Text>
          <Text style={styles.label}>Calories Burned</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.value}>42</Text>
          <Text style={styles.label}>Workout (min)</Text>
        </View>
      </View>

      {/* Weekly Goal */}
      <View style={styles.goalCard}>
        <Text style={styles.goalTitle}>Weekly Goal</Text>
        <Text style={styles.goalText}>
          You’ve completed 72% of your weekly goal 🎯
        </Text>




      </View>

        <View style={styles.navcard}>
        <TouchableOpacity onPress={() => router.push('/workout')}>
        <Image style={styles.navicon}  source={require('../assets/images/dumbbell.png')}></Image>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/dashboard')}>
        <Image style={styles.navicon}  source={require('../assets/images/home.png')}></Image>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/profile')}>
        <Image style={styles.navicon}  source={require('../assets/images/profileicon.jpg')}></Image>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/settings')}>
        <Image style={styles.navicon}  source={require('../assets/images/settings.png')}></Image>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#666',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#fff',
    width: '48%',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 3,
  },
  value: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  label: {
    color: '#777',
    marginTop: 4,
  },
  goalCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginTop: 10,
    elevation: 3,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  goalText: {
    color: '#555',
  },
  accountDetail: {
    height: 150,
    width: 360,
    backgroundColor:'#4a2c1a',
    borderRadius:10,
    elevation: 5,
    marginBottom: 20,
  },
  name: {
    alignItems:'center',
    color: '#fff',
    fontSize: 30,
    paddingLeft: 110,
    top: 15,
    fontweight: 'bold',
    fontStyle: 'italic',
    position: 'absolute',
  },
  profileImage: {
  top: 25,
  left: 15,
  width: 100,
  height: 100,
  borderRadius: 50,
  marginRight: 15,
  backgroundColor: '#ccc',
  
},


navicon: {
  width: '50',
  height: '50',
  borderColor: '#000',
  borderWidth: 2,
  borderRadius: 10,
  marginHorizontal: 20,
  right: 10,
},

navcard: {
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'row',
  width: '125%',
  height: 60,
  backgroundColor: '#fff',
  elevation: 5,
  top: 130,
  borderRadius: 10,
  right: 30,
} 
});
