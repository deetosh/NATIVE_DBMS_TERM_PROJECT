
import React, { useEffect } from 'react';
import Geolocation, { GeoPosition, GeoError } from 'react-native-geolocation-service';
import { Platform, PermissionsAndroid, Alert, Button } from 'react-native';
import {SafeAreaView, StyleSheet, View} from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import { useState } from 'react';


const requestLocationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Access Required',
        message: 'This app needs access to your location to function correctly.',
        buttonPositive: 'OK',
        buttonNegative: 'Cancel',
        buttonNeutral: 'Ask Me Later',
      }git
    );

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  }
  return false;
};

const App = () => {
  const [location, setLocation] = useState<GeoPosition | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const getLocation = async () => {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        setErrorMsg('Location permission denied.');
        Alert.alert(
          'Permission Denied',
          'You need to enable location permissions in settings to use this feature.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Geolocation.getCurrentPosition(
      //   (position: GeoPosition) => {
      //     console.log(position);
      //     setLocation(position);
      //     setErrorMsg(null);
      //   },
      //   (error: GeoError) => {
      //     console.log(error.code, error.message);
      //     setErrorMsg(`Error: ${error.message}`);
      //     setLocation(null);
      //   },
      //   { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 }
      // );
    };

  useEffect(() => {
    try {
      getLocation();
    } catch (error) {
      console.error('Error getting location:', error);
    }
    
  }, []);

  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={styles.container}>
        <MapView
          style={styles.mapStyle}
          showsUserLocation={true}
          followsUserLocation={true}
          >
          <Marker
            draggable
            coordinate={{
              latitude: 27.78825,
              longitude: 87.4324,
            }}
            onDragEnd={
              (e) => console.log(JSON.stringify(e.nativeEvent.coordinate))
            }
            title={'Test Marker'}
            description={'This is a description of the marker'}
          />
        </MapView>
      </View>
    </SafeAreaView>
  );
};
export default App;
 
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  mapStyle: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});