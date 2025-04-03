import React, { useEffect, useState } from 'react';
import { View, Text, Button, PermissionsAndroid, Platform } from 'react-native';
import { io } from 'socket.io-client';
import GetLocation from 'react-native-get-location';

const socket = io('http://10.145.195.150:8000');

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
  const [tracking, setTracking] = useState<boolean>(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    const fetchLocation = async () => {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        console.warn('Location permission denied');
        return;
      }

      try {
        const location = await GetLocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000,
        });

        console.log('Latitude:', location.latitude, 'Longitude:', location.longitude);

        socket.emit('driver:locationUpdate', {
          bus_id: '1234',
          bus_no: 'B-100',
          latitude: location.latitude,
          longitude: location.longitude,
        });

      } catch (error) {
        console.warn('Location Error:', error);
      }
    };

    if (tracking) {
      fetchLocation(); // Get the first location immediately
      interval = setInterval(fetchLocation, 6000); // Update every 3 seconds
    } else {
      if (interval) {
        clearInterval(interval);
      }
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [tracking]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Driver Tracking</Text>
      <Button title={tracking ? 'Stop Tracking' : 'Start Tracking'} onPress={() => setTracking(!tracking)} />
    </View>
  );
};

export default HomeScreen;
