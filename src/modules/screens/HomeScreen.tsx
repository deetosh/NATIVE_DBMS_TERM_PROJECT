import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Button, PermissionsAndroid, Platform, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { io, Socket } from 'socket.io-client';
import Geolocation from '@react-native-community/geolocation';
import { BACKEND_URL } from '../../secret';
import { callAPI } from '../../services/callApi';
import Loader from '../../molecules/Loader';
import { Picker } from '@react-native-picker/picker';
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
      // setIsLoading(true);
      // const response = callAPI(`/bus/assignDriver`,"POST",{busId:busId._id},{});
      // setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
    {isLoading && <Loader visible={isLoading} />}    
    <Text style={styles.title}>Select a Bus</Text>
    <View style={!busId._id ? styles.pickerContainer : styles.pickerContainerSelected}>
      <Picker
        selectedValue={busId._id}
        onValueChange={(itemValue, itemIndex) => handlePickerChange(itemValue)}
        style={!busId._id?styles.picker:styles.selectedText}
      >
        {busData.map((bus:any) => (
          <Picker.Item 
            style={styles.item}
            label={bus.bus_number} 
            value={bus._id} 
            key={bus._id} 
          />
        ))}
      </Picker>
      </View>
    {!isLoading && ( trackingPerm ? (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={styles.title}>Driver Tracking</Text>
        <TouchableOpacity style={styles.button} onPress={() => setTracking((prev) => !prev)} >
          <Text style={styles.text}>{tracking ? 'Stop Tracking' : 'Start Tracking'}</Text>
          </TouchableOpacity>
      </View>
    ) : (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={styles.title}>Please select a bus you are gonna drive</Text>
      </View>
    ))}
    </SafeAreaView>
    
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 30,
    backgroundColor: COLOR.bg_primary,
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    color: COLOR.text_primary,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },
  pickerContainer: {
    backgroundColor: COLOR.bg_secondary,
    borderRadius: 4,
    marginHorizontal: 20,
  },
  pickerContainerSelected: {
    backgroundColor: COLOR.bg_primary,
    borderRadius: 4,
    marginHorizontal: 20,
    borderWidth: 2,
    borderColor: 'white',
  },
  item:{
    fontSize: 20,    
  },
  picker: {
    backgroundColor: COLOR.bg_secondary,
    color: COLOR.text_primary,
    fontSize: 60,
    height: 80,
    width: '100%',
  },
  selectedText: {
    backgroundColor: COLOR.bg_primary,
    color: COLOR.text_primary,
    height: 80,
    width: '100%',
    borderWidth: 2,
    borderColor: 'white',
  },
  button:{
    backgroundColor: COLOR.btn_primary,
    padding: 20,
    alignItems: 'center',
    borderRadius: 5,
  },
  text:{
    color: COLOR.text_primary,
    fontWeight: 'bold',
    fontSize: 20,
  }
});
export default HomeScreen;
