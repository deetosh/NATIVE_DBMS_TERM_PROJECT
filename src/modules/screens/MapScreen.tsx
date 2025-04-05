import React, { useEffect, useState } from 'react';
import { PermissionsAndroid, Platform, SafeAreaView, StyleSheet, View } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import io from 'socket.io-client';
import { BACKEND_URL } from '../../secret';
import Geolocation from '@react-native-community/geolocation';
import Loader from '../../molecules/Loader';

type BusLocation = {
  bus_id: string;
  bus_no: string;
  latitude: number;
  longitude: number;
};

const MapScreen: React.FC = () => {
  const [busLocations, setBusLocations] = useState<Record<string, BusLocation>>({});
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // Ask permission on Android
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  useEffect(() => {

    // watch user location
    const initLocation = async () => {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) return;

      Geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location", error);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );

      const watchId = Geolocation.watchPosition(
        (pos) => {
          setUserLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
        },
        (error) => console.error("Watch error", error),
        { enableHighAccuracy: true, distanceFilter: 10 }
      );

      return () => Geolocation.clearWatch(watchId);
    };

    initLocation();

    const socket = io(`${BACKEND_URL}`); // Replace with your backend URL

    socket.on("connect", () => {
      console.log("Connected to socket server");
    });

    socket.on("bus:locationUpdate", (data: BusLocation) => {
      setBusLocations((prev) => ({
        ...prev,
        [data.bus_id]: data, // Update each bus by its unique ID
      }));
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from socket server");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
    <View style={styles.container}>
      <MapView
        style={styles.mapStyle}
        showsUserLocation={true}
        followsUserLocation={true}
        region={
          userLocation
            ? {
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
              }
            : undefined
        }
      >
        {/* Bus Markers */}
        {Object.values(busLocations).map((bus) => (
          <Marker
            key={bus.bus_id}
            coordinate={{
              latitude: bus.latitude,
              longitude: bus.longitude,
            }}
            title={`Bus ${bus.bus_no}`}
            description={`Bus ID: ${bus.bus_id}`}
            image={require('../../assets/bus.png')}
          />
        ))}

        {/* User Marker + Circle */}
        {userLocation && (
          <>
            <Marker
              coordinate={userLocation}
              title="You are here"
              pinColor="blue"
            />
            <Circle
              center={userLocation}
              radius={1000} // in meters
              strokeWidth={1}
              strokeColor="rgba(0,112,255,0.5)"
              fillColor="rgba(0,112,255,0.2)"
            />
          </>
        )}
      </MapView>
    </View>
  </SafeAreaView>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  mapStyle: {
    ...StyleSheet.absoluteFillObject,
  },
});
