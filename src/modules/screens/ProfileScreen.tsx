import React, { use, useEffect, useState } from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {COLOR} from '../../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen: React.FC = ({navigation}: any) => {
  const [user, setUser] = useState<any>(null);
  useEffect(() => {

    const fetchUserData = async () => {
      const username = await AsyncStorage.getItem('name');
      const email = await AsyncStorage.getItem('email');
      const role = await AsyncStorage.getItem('role');
      setUser({
        username: username || '',
        email: email || '',
        role: role || '',
      });
    }

    fetchUserData();
  }
  , []);
  
  const handleLogout = async () => {
    // clear local storage
    await AsyncStorage.clear();
    // navigate to login screen
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };
  return (
    <View style={styles.container}>
      <Text style={{fontSize: 24, fontWeight: 'bold', marginBottom: 20, color:`${COLOR.text_primary}`}}>Profile</Text>
      <Text style={{fontSize: 18, marginBottom: 10, color:`${COLOR.text_primary}`}}>Username: {user?.username}</Text>
      <Text style={{fontSize: 18, marginBottom: 10, color:`${COLOR.text_primary}`}}>Email: {user?.email}</Text>
      <Text style={{fontSize: 18, marginBottom: 20, color:`${COLOR.text_primary}`}}>Role: {user?.role}</Text>
      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLOR.bg_primary,
    padding: 20,
  },
  button: {
    backgroundColor: COLOR.btn_secondary,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    height: 50,
    justifyContent: 'center',
  },
  buttonText: {color: COLOR.text_dark, fontWeight: 'bold'},
});
