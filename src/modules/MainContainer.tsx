import React, {useEffect, useState} from 'react';
import {Text, View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import HomeScreen from './screens/HomeScreen';
import BusDetailsScreen from './screens/BusDetailsScreen';
import MapScreen from './screens/MapScreen';
import {COLOR} from '../constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loader from '../molecules/Loader';
import AddLocationScreen from './screens/AddLocationScreen';
import AddBusScreen from './screens/AddBusScreen';
import ProfileScreen from './screens/ProfileScreen';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

// Screen name
const HOME_SCREEN = 'Home';
const BUS_DETAILS_SCREEN = 'Bus Details';
const MAP_SCREEN = 'Map';
const LOCATION_SCREEN = 'Location';
const BUSES_SCREEN = 'Buses';
const PROFILE_SCREEN = 'Profile';

const Tab = createBottomTabNavigator();


const MainContainer = () => {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const storedRole = await AsyncStorage.getItem('role');
        console.log('Stored role:', storedRole);
        setRole(storedRole);
      } catch (error) {
        console.error('Failed to fetch user role:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRole();
  }, []);

  return (
    <>
      <Loader visible={loading} />
      {/* <NavigationContainer> */}
      {role && (
        <Tab.Navigator
          initialRouteName={
            role === 'user'
              ? BUS_DETAILS_SCREEN
              : role === 'admin'
              ? LOCATION_SCREEN
              : HOME_SCREEN
          }
          screenOptions={({route}) => ({
            tabBarIcon: ({focused, color, size}) => {
              let iconName: any;
              switch (route.name) {
                case HOME_SCREEN:
                  iconName = focused ? 'home' : 'home-outline';
                  break;
                case BUS_DETAILS_SCREEN:
                  iconName = focused ? 'bus' : 'bus-outline';
                  break;
                case MAP_SCREEN:
                  iconName = focused ? 'map' : 'map-outline';
                  break;
                case LOCATION_SCREEN:
                  iconName = focused ? 'location' : 'location-outline';
                  break;
                case BUSES_SCREEN:
                  iconName = focused ? 'bus' : 'bus-outline';
                  break;
                case PROFILE_SCREEN:
                  iconName = focused ? 'person' : 'person-outline';
                  break;
              }
              return (
                <Ionicons
                  name={iconName}
                  size={30}
                  color={COLOR.text_primary}
                />
              );
            },

            tabBarActiveTintColor: COLOR.text_primary,
            tabBarInactiveTintColor: COLOR.text_tertiary,
            tabBarLabelStyle: {paddingBottom: 10, fontSize: 10, paddingTop: 8},
            tabBarStyle: {
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              elevation: 0,
              backgroundColor: COLOR.bg_secondary,
              // backgroundColor: 'transparent',
              borderTopWidth: 0,
              height: 60 + insets.bottom,
              paddingBottom: insets.bottom,
              // height: 60,
            },
            headerShown: false,
            headerStyle: {
              backgroundColor: COLOR.bg_secondary,
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 0,
              height: 50,
            },
            headerTintColor: COLOR.text_primary,
            headerTitleStyle: {
              fontSize: 20,
              fontWeight: 'bold',
              height: 30,
            },
            headerTitleAlign: 'center',
          })}>
          {role === 'user' && (
            <>
              <Tab.Screen
                name={BUS_DETAILS_SCREEN}
                component={BusDetailsScreen}
              />
              <Tab.Screen name={MAP_SCREEN} component={MapScreen} />
            </>
          )}
          {role === 'admin' && (
            <>
              <Tab.Screen
                name={LOCATION_SCREEN}
                component={AddLocationScreen}
              />
              <Tab.Screen name={BUSES_SCREEN} component={AddBusScreen} />
            </>
          )}
          {role === 'driver' && (
            <Tab.Screen name={HOME_SCREEN} component={HomeScreen} />
          )}
          <Tab.Screen name={PROFILE_SCREEN} component={ProfileScreen} />
        </Tab.Navigator>
      )}
      {/* </NavigationContainer> */}
    </>
  );
};

export default MainContainer;
