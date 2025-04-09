import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Button, PermissionsAndroid, Platform, StyleSheet } from 'react-native';
import { io, Socket } from 'socket.io-client';
import Geolocation from '@react-native-community/geolocation';
import { BACKEND_URL } from '../../secret';
import { callAPI } from '../../services/callApi';
import Loader from '../../molecules/Loader';
import { Picker } from '@react-native-picker/picker';



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
  const [busData, setBusData] = useState([]);
  const [busId, setBusId] = useState({ _id: '', bus_number: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [trackingPerm,setTrackingPerm] = useState(false);
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
            bus_id: busId._id,
            bus_no: busId.bus_number,
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
      // setBusId({ _id: '', bus_number: '' });
      // setTrackingPerm(false);
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
    const fetchBus= async () => {
      try {
        setIsLoading(true);
        const response = await callAPI(`/bus/get`,"GET",{},{flag:true});
        const data = response.data;
        setBusData(data);
        setIsLoading(false);
        console.log('Bus Details:', data);
      } catch (error) {
        setIsLoading(false);
        console.error('Error fetching bus details:', error);
      }
    }

    fetchBus();
  },[]);

  const handlePickerChange = (selectedId: any) => {
    // Find the selected bus object by matching the _id.
    const bus = busData.find((b:any) => b._id === selectedId);
    if (bus) {
      setBusId(bus);
      setTrackingPerm(true);
    }
  };

  return (
    <>
    {isLoading && <Loader visible={isLoading} />}    
    <Text style={styles.title}>Select a Bus</Text>
      <Picker
        selectedValue={busId._id}
        onValueChange={(itemValue, itemIndex) => handlePickerChange(itemValue)}
        style={styles.picker}
      >
        {busData.map((bus:any) => (
          <Picker.Item 
            label={bus.bus_number} 
            value={bus._id} 
            key={bus._id} 
          />
        ))}
      </Picker>
      
    {!isLoading && ( trackingPerm ? (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Driver Tracking</Text>
        <Button title={tracking ? 'Stop Tracking' : 'Start Tracking'} onPress={() => setTracking((prev) => !prev)} />
      </View>
    ) : (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Please select a bus you are gonna drive</Text>
      </View>
    ))}
    </>
    
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  selectedText: {
    marginTop: 20,
    fontSize: 16,
  },
});
export default HomeScreen;
