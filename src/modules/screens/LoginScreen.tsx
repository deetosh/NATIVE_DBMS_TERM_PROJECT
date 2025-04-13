import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {COLOR} from '../../constants';
import {callAPI} from '../../services/callApi';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Platform, PermissionsAndroid} from 'react-native';
import Loader from '../../molecules/Loader';
import { Image } from 'react-native';

const requestLocationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Access Required',
        message:
          'This app needs access to your location to function correctly.',
        buttonPositive: 'OK',
        buttonNegative: 'Cancel',
        buttonNeutral: 'Ask Me Later',
      },
    );

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  return false;
};

const LoginScreen = ({navigation}: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const getLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission Denied',
        'You need to enable location permissions in settings to use this feature.',
        [{text: 'OK'}],
      );
    }
    return hasPermission;
  };

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert('Email is required');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Password is required');
      return;
    }
    // console.log("Registering with:", { username, email, password, role });
    const payload = {
      email: email,
      password: password,
    };

    const hasPermission = await getLocation();
    if (!hasPermission) {
      return;
    }

    setIsLoading(true);
    // Call your API here
    const response = await callAPI('/auth/login', 'POST', payload);
    
    console.log('API Response:', response);
     
    if (!response.isError) {
      Toast.show({
        type: 'success',
        text1: 'Login Successful',
        text2: response.message,
      });
      // store access token in local storage
      AsyncStorage.setItem('accessToken', response.data.access_token);
      AsyncStorage.setItem('role', response.data.user.role);
      AsyncStorage.setItem('name', response.data.user.username);
      AsyncStorage.setItem('email', response.data.user.email);
      setIsLoading(false);
      navigation.replace('Main');
      setEmail('');
      setPassword('');
    } else {
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: response.message,
      });
      setIsLoading(false);
      // console.error(response.message);
    }
  };

  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem('accessToken');
      setTimeout(()=>{
        if (token) {
          setIsLoggedIn(true);
          navigation.replace('Main');
        }
        else{
          setIsLoggedIn(false);
        }
      }, 2000); 
    };
    checkLogin();
  }, []);

  return (
    <View style={styles.container}>
      {isLoggedIn && (<>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Image 
            source={require('../../assets/logo.png')}
            style={{width: 400, height: 400}}
          />
          {/* <Text style={{fontSize:20, color: COLOR.golden}}>Welcome to IITKGP Bus Tracker</Text> */}
        </View>
      </>)}
      {!isLoggedIn && (<>
        <Loader visible={isLoading} />
        <Text style={styles.title}>Login</Text>

        <View style={styles.inputContainer}>
          <Ionicons
            name="mail-outline"
            size={20}
            color="white"
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            value={email}
            placeholderTextColor="gray"
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color="white"
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            placeholderTextColor="gray"
            onChangeText={setPassword}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.link}>Don't have an account? Register</Text>
        </TouchableOpacity>
      </>)} 
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: COLOR.bg_primary,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: COLOR.text_primary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 5,
    marginBottom: 10,
    borderColor: COLOR.bg_tertiary,
  },
  icon: {marginRight: 10},
  input: {flex: 1, height: 50, color: COLOR.text_secondary, fontSize:18},
  button: {
    backgroundColor: COLOR.golden,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    height: 50,
    justifyContent: 'center',
  },
  buttonText: {color: COLOR.text_dark, fontWeight: 'bold'},
  link: {textAlign: 'center', marginTop: 10, color: COLOR.text_secondary, fontSize: 16},
});
