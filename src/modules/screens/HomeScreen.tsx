import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Button, PermissionsAndroid, Platform, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { io, Socket } from 'socket.io-client';
import Geolocation from '@react-native-community/geolocation';
import { BACKEND_URL } from '../../secret';
import { callAPI } from '../../services/callApi';
import Loader from '../../molecules/Loader';
import { COLOR } from '../../constants';



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
    <View style={{ flex:1, backgroundColor:COLOR.bg_primary, alignItems:'center', padding:16 }}>
      <Text style={styles.title}>Start your drive</Text>
    {isLoading && <Loader visible={isLoading} />}
    {!isLoading && ( BusDetails ? (
      <View style={{ flex: 1, alignItems: 'center' }}>
        <Text style={styles.info}>Bus Number</Text>
        <TextInput
          style={styles.disabledtextInput}
          value={
            BusDetails?.bus_no
              ? `${BusDetails?.bus_no}`
              : ''
          }
          editable={false}
          selectTextOnFocus={false}
        />

        <Text style={{...styles.info,marginTop:30}}>Driver Tracking</Text>
        <TouchableOpacity style={tracking ? styles.button_stop :styles.button} onPress={() => setTracking((prev) => !prev)}>
          <Text style={styles.buttonText}>{tracking ? 'Stop Tracking' : 'Start Tracking'}</Text>
        </TouchableOpacity>
      </View>
    ) : (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width:'50%' }}>
        <Text style={{color: COLOR.text_secondary}}>Please ask admin to assign a bus to start your drive</Text>
      </View>
    ))}
    </View>
    
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLOR.golden,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    height: 50,
    justifyContent: 'center',
    marginTop: 20,
  },
  button_stop: {
    backgroundColor: COLOR.btn_secondary,
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

export default HomeScreen;
