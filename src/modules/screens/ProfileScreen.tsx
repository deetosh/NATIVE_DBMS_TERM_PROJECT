import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {COLOR} from '../../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfileScreen: React.FC = ({navigation}: any) => {
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
