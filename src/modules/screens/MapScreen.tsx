import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Image,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  StyleSheet,
  Switch,
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
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faBus } from '@fortawesome/free-solid-svg-icons';
import { callAPI } from '../../services/callApi';

type BusLocation = {
  bus_id: string;
  bus_no: string;
  latitude: number;
  longitude: number;
};

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface Location {
  name: string;
  coordinates: number[];
}

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
  const [allLocations, setAllLocations] = useState<Location[]>([]);
  const [seeLocation, setSeeLocation] = useState<boolean>(false);

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

    socket.on('bus:stopped',(bus_id:string)=> {
      // remove the bus with this id from array
      console.log("%%%%%%%%%%%%%%%%%%%%%%%%");
      setBusLocations(prev => {
        const updatedLocations = {...prev};
        delete updatedLocations[bus_id];
        return updatedLocations;
      });
    })

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

  useEffect(()=> {
      const fetchLocations = async () => {
        try {
          setIsLoading(true);
          const response = await callAPI('/location/get', "GET");
          if (!response.isError) {
            setAllLocations(response.data);
          } else {
            Toast.show({
              type: 'error',
              text1: 'Error',
              text2: 'Failed to fetch locations. Please try again.',
            });
          }
          setIsLoading(false);
        } catch (error) {
          setIsLoading(false);
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to fetch locations. Please try again.',
          });
        }
      };
      fetchLocations();
  },[])

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
            anchor={{ x: 0.5, y: 0.5 }} // Center the icon
          >
            <View style={styles.markerContainer}>
              <FontAwesomeIcon 
                icon={faBus} 
                size={30} 
                color={COLOR.bus_icon} 
              />
            </View>
              <Callout tooltip={true} onPress={() => handleSheetOpen(bus.bus_id, bus.bus_no)}>
                <View style={styles.calloutContainer}>
                  <Text style={styles.calloutTitle}>{bus.bus_no}</Text>
                  <Text style={styles.calloutSubtitle}>Click for details</Text>
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

          {
            seeLocation && allLocations.map((location, index) => (
              <Marker
                key={index}
                coordinate={{
                  latitude: location.coordinates[0],
                  longitude: location.coordinates[1],
                }}
                title={location.name}
                pinColor= 'orange'
                
              >
                <Callout tooltip={true}>
                  <View style={styles.calloutContainer2}>
                    <Text style={styles.calloutTitle2}>{location.name}</Text>
                  </View>
                </Callout>
              </Marker>
            ))
          }
        </MapView>
        <View style={{position: 'absolute', top: 10, left: 10,display: 'flex', flexDirection: 'row',backgroundColor: COLOR.bg_primary, padding: 10, borderRadius: 10}}>
          <Switch
            trackColor={{false: COLOR.bg_tertiary, true: COLOR.golden}}
            thumbColor={seeLocation ? COLOR.bg_tertiary : COLOR.golden}
            onValueChange={() => setSeeLocation(!seeLocation)}
            value={seeLocation}
          />
          <Text style={{color: COLOR.text_primary, fontSize: 16, marginLeft: 10}}>
            See Bus Stoppages
          </Text>
        </View>
        
      </View>
      <BottomSheet
        ref={sheetRef}
        index={-1}
        snapPoints={useMemo(() => ['80%','100%'], [])}
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
        enableDynamicSizing={false}
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
  markerContainer: {
    padding: 2,
    backgroundColor: 'white',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLOR.bg_primary,
  },
  calloutContainer: {
    backgroundColor: COLOR.bg_primary,
    padding: 12,
    width: 160,
    borderRadius: 20,
  },
  calloutContainer2: {
    backgroundColor: COLOR.text_tertiary,
    padding: 5,
    borderRadius: 10,
    width: 160,
  },
  calloutTitle: {
    fontWeight: 'bold',
    color: COLOR.text_secondary,
    fontSize: 16,
    textAlign: 'center',
  },
  calloutTitle2: {
    fontWeight: 'bold',
    color: COLOR.text_dark,
    fontSize: 16,
    textAlign: 'center',
  },
  calloutSubtitle: {
    color: COLOR.text_secondary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  mapStyle: {
    ...StyleSheet.absoluteFillObject,
  },

});
