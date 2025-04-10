import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Image,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, {Marker, Circle, Callout} from 'react-native-maps';
import io from 'socket.io-client';
import {BACKEND_URL} from '../../secret';
import Geolocation from '@react-native-community/geolocation';
import Loader from '../../molecules/Loader';
import Toast from 'react-native-toast-message';
import { COLOR } from '../../constants';
import BusDetailsSheet from './BusDetailsBottomSheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';

type BusLocation = {
  bus_id: string;
  bus_no: string;
  latitude: number;
  longitude: number;
};

const MapScreen: React.FC = () => {
  const [busLocations, setBusLocations] = useState<Record<string, BusLocation>>(
    {},
  );
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const sheetRef = useRef<any>(null);
  const [selectedBus, setSelectedBus] = useState<any | null>(null);

  // Ask permission on Android
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  useEffect(() => {
    // watch user location
    const initLocation = async () => {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        setIsLoading(false);
        return;
      }

      Geolocation.getCurrentPosition(
        pos => {
          setUserLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
            setIsLoading(false);
        },
        error => {
          console.error('Error getting location', error);
          // Toast.show({
          //   type: 'error',
          //   text1: 'Location Error',
          //   text2: 'Unable to fetch location. Please check your settings.',
          // });
          setIsLoading(false);
        },
        {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
      );

      const watchId = Geolocation.watchPosition(
        pos => {
          setUserLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          });
          if(isLoading) {
            setIsLoading(false);
          }
        },
        error => console.error('Watch error', error),
        {enableHighAccuracy: true, distanceFilter: 10},
      );

      return () => Geolocation.clearWatch(watchId);
    };

    initLocation();

    const socket = io(`${BACKEND_URL}`); // Replace with your backend URL

    socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    socket.on('bus:locationUpdate', (data: BusLocation) => {
      setBusLocations(prev => ({
        ...prev,
        [data.bus_id]: data, // Update each bus by its unique ID
      }));
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSheetOpen = (busId: string,busNumber: string) => {
    console.log('sheet clicked');
    const bus = {
      bus_id: busId,
      bus_no: busNumber
    }
    if (bus) {
      setSelectedBus(bus);
    }
  }

  useEffect(()=> {
    if(selectedBus){
      // sheetRef.current?.expand();
        sheetRef.current?.snapToIndex(0);
    }
  },[selectedBus])

  return (
    <SafeAreaView style={{flex: 1}}>
      <GestureHandlerRootView style={styles.bottom_sheet}>
      <View style={styles.container}>
        <MapView
          style={styles.mapStyle}
          showsUserLocation={true}
          initialRegion={
            userLocation
              ? {
                  latitude: userLocation.latitude,
                  longitude: userLocation.longitude,
                  latitudeDelta: 0.02,
                  longitudeDelta: 0.02,
                }
              : {
                  latitude: 22.320336,
                  longitude: 87.309468,
                  latitudeDelta: 0.02,
                  longitudeDelta: 0.02,
                }
          }>
          {Object.values(busLocations).map(bus => (
            <Marker
              key={bus.bus_id}
              coordinate={{
                latitude: bus.latitude,
                longitude: bus.longitude,
              }}
              >
              <Callout tooltip={true} onPress={() => handleSheetOpen(bus.bus_id, bus.bus_no)}>
              <View style={{ padding: 10, backgroundColor: COLOR.bg_primary }}>
                <Text style={{ fontWeight: 'bold',color: COLOR.text_secondary  }}>{bus.bus_no}</Text>
                  <Text style={{ color: COLOR.text_secondary }}>Click for more details</Text>
              </View>
              </Callout>
            </Marker>
          ))}
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
      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={useMemo(() => ['80%'], [])}
        enablePanDownToClose={true}
        backgroundStyle={{
          backgroundColor: COLOR.bg_primary,
        }}
        enableContentPanningGesture={false}
        handleIndicatorStyle={{
          backgroundColor: COLOR.golden,
          width: 80,
          height: 5,
        }}
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            disappearsOnIndex={-1} // hide when sheet is closed
            appearsOnIndex={0}     // show backdrop when sheet opens
            pressBehavior="close"  // 👈 this enables closing on tap
          />
        )}
      >
        <BottomSheetView style={{height: '100%'}} >
          <BusDetailsSheet busId={selectedBus?.bus_id} busNumber={selectedBus?.bus_no}/>
        </BottomSheetView>
      </BottomSheet>
    </GestureHandlerRootView>
        
    </SafeAreaView>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  bottom_sheet:{
    flex: 1,
    backgroundColor: COLOR.bg_primary,
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  mapStyle: {
    ...StyleSheet.absoluteFillObject,
  },
});
