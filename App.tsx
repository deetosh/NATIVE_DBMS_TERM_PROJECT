
import React, { useEffect } from 'react';
import {SafeAreaView} from 'react-native';
import { useState } from 'react';
import MainContainer from './src/modules/MainContainer';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import LoginScreen from './src/modules/screens/LoginScreen';
import RegisterScreen from './src/modules/screens/RegisterScreen';
import Toast from 'react-native-toast-message';
const Stack = createStackNavigator();




const App = () => {

  return (
    <SafeAreaView style={{flex: 1}}>
      <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false,animation:'fade_from_bottom' }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Main" component={MainContainer} options={{ gestureEnabled: false }} />
      </Stack.Navigator>
    </NavigationContainer>
    <Toast position='bottom'/>
    </SafeAreaView>
  );
};
export default App;
