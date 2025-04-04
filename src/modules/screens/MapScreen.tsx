import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import io from 'socket.io-client';
import { BACKEND_URL } from '../../secret';

type BusLocation = {
  bus_id: string;
  bus_no: string;
  latitude: number;
  longitude: number;
};

const MapScreen: React.FC = () => {
  const [busLocations, setBusLocations] = useState<Record<string, BusLocation>>({});

  useEffect(() => {
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
        >
          {Object.values(busLocations).map((bus) => (
            <Marker
              key={bus.bus_id}
              coordinate={{
                latitude: bus.latitude,
                longitude: bus.longitude,
              }}
              title={`Bus ${bus.bus_no}`}
              description={`Bus ID: ${bus.bus_id}`}
            />
          ))}
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
