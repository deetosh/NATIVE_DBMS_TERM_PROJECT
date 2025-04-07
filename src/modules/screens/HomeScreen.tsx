import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Button, PermissionsAndroid, Platform } from 'react-native';
import { io, Socket } from 'socket.io-client';
import Geolocation from '@react-native-community/geolocation';
import { BACKEND_URL } from '../../secret';
import { callAPI } from '../../services/callApi';
import Loader from '../../molecules/Loader';



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
  const [BusDetails, setBusDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

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
            bus_id: BusDetails.bus_id,
            bus_no: BusDetails.bus_no,
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

  useEffect(()=> {
    const fetchBusDetails = async () => {
      try {
        setIsLoading(true);
        const response = await callAPI(`/bus/getByDriver`,"GET");
        const data = response.data;
        setBusDetails({
          bus_no: data.bus_number,
          bus_id: data._id,
        })
        setIsLoading(false);
        console.log('Bus Details:', data);
      } catch (error) {
        setIsLoading(false);
        console.error('Error fetching bus details:', error);
      }
    }

    fetchBusDetails();
  },[])


  return (
    <>
    {isLoading && <Loader visible={isLoading} />}
    {!isLoading && ( BusDetails ? (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Driver Tracking</Text>
        <Button title={tracking ? 'Stop Tracking' : 'Start Tracking'} onPress={() => setTracking((prev) => !prev)} />
      </View>
    ) : (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Please register with a bus</Text>
      </View>
    ))}
    </>
    
  );
};

export default HomeScreen;
