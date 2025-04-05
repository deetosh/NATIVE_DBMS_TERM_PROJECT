import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Button, PermissionsAndroid, Platform } from 'react-native';
import { io, Socket } from 'socket.io-client';
import Geolocation from '@react-native-community/geolocation';
import { BACKEND_URL } from '../../secret';



const requestLocationPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs access to your location.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  }
  return true;
};

const HomeScreen: React.FC = () => {
  const [tracking, setTracking] = useState(false);
  const watchId = useRef<number | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {

    const startTracking = async () => {
      
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        console.warn('Location permission denied');
        return;
      }

      console.log('Location permission granted');

      socketRef.current = io(`${BACKEND_URL}`);

      watchId.current = Geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log('Latitude:', latitude, 'Longitude:', longitude);

          socketRef.current?.emit('driver:locationUpdate', {
            bus_id: '1234',
            bus_no: 'B-100',
            latitude,
            longitude,
          });
        },
        (error) => {
          console.warn('WatchPosition Error:', error);
        },
        {
          enableHighAccuracy: true,
          distanceFilter: 5,
          timeout: 10000,
          maximumAge: 0,
        }
      );

    };

    const stopTracking = () => {
      if (watchId.current !== null) {
        Geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };

    if (tracking) {
      startTracking();
    } else {
      stopTracking();
    }

    return () => {
      stopTracking();
    };
  }, [tracking]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Driver Tracking</Text>
      <Button title={tracking ? 'Stop Tracking' : 'Start Tracking'} onPress={() => setTracking((prev) => !prev)} />
    </View>
  );
};

export default HomeScreen;
