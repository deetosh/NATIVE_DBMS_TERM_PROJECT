import React, { use, useEffect, useState } from 'react';
import {View, Text, TouchableOpacity, StyleSheet, TextInput} from 'react-native';
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
      <Text style={styles.title}>Profile</Text>

      <Text style={styles.info}>Username</Text>
      <TextInput
        style={styles.disabledtextInput}
        value={
          user?.username
            ? `${user?.username}`
            : ''
        }
        editable={false}
        selectTextOnFocus={false}
      />

      <Text style={styles.info}>Email</Text>
      <TextInput
        style={styles.disabledtextInput}
        value={
          user?.email
            ? `${user?.email}`
            : ''
        }
        editable={false}
        selectTextOnFocus={false}
      />

      <Text style={styles.info}>Role</Text>
      <TextInput
        style={styles.disabledtextInput}
        value={
          user?.role
            ? `${user?.role}`
            : ''
        }
        editable={false}
        selectTextOnFocus={false}
      />
      
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
    backgroundColor: COLOR.bg_primary,
    padding: 20,
  },
  button: {
    backgroundColor: COLOR.golden,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    height: 50,
    justifyContent: 'center',
    marginTop: 20,
  },
  buttonText: {color: COLOR.text_dark, fontWeight: 'bold'},
  disabledtextInput: {
    height: 45,
    borderColor: COLOR.bg_tertiary,
    backgroundColor: COLOR.bg_primary,
    borderWidth: 0.5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginBottom: 10,
    color: COLOR.text_primary,
    fontSize: 16,
  },
  title: {fontSize: 18, fontWeight: 'bold', marginBottom: 25,color: COLOR.golden,textAlign: 'center'},
  info: {fontSize: 16, marginBottom: 8,color: COLOR.golden},
});
