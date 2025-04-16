import {useEffect, useMemo, useRef, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {COLOR} from '../../constants';
import Loader from '../../molecules/Loader';
import SearchableDropdown from '../../molecules/SearchableDropDown';
import {BusProvider, useBusContext} from '../../context/BusContext';
import {callAPI} from '../../services/callApi';
import Toast from 'react-native-toast-message';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import BusDetailsSheet from './BusDetailsBottomSheet';
import {GestureHandlerRootView, ScrollView} from 'react-native-gesture-handler';
import Icon from 'react-native-vector-icons/Ionicons';

const BusDestinationScreen = () => {
  const [loading, setLoading] = useState(false);
  const [allLocations, setAllLocations] = useState<any[]>([]);
  const [dest, setDest] = useState<string | null>(null);
  const [start, setStart] = useState<string | null>(null);
  const [destName, setDestName] = useState<string | null>(null);
  const [startName, setStartName] = useState<string | null>(null);
  const [busData, setBusData] = useState<any | null>(null);
  let currentHour = new Date().getHours();
  const sheetRef = useRef<any>(null);
  const [selectedBus, setSelectedBus] = useState<any | null>(null);

  const {
    getAllBusesFromStorage,
    getBusDetailsFromStorage,
    getAllLocationsFromStorage,
    getAllBusesMatchingLocationFromStorage,
  } = useBusContext();

  useEffect(() => {
    const fetchFromStorage = async () => {
      setLoading(true);
      const locations = await getAllLocationsFromStorage();
      if (locations) {
        setAllLocations(locations);
        setLoading(false);
      } else {
        fetchAllBusesAndLocations();
      }
    };

    const fetchAllBusesAndLocations = async () => {
      try {
        setLoading(true);
        const locResponse = await callAPI(`/location/get`, 'GET', {}, {});
        if (!locResponse.isError) {
          console.log('Locations data:', locResponse.data);
          setAllLocations(locResponse.data);
        } else {
          Toast.show({
            type: 'error',
            text1: 'Make sure you are connected to the internet',
            text2: 'Failed to fetch locations.',
          });
        }
      } catch (err) {
        Toast.show({
          type: 'error',
          text1: 'Make sure you are connected to the internet',
          text2: 'Failed to fetch locations.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFromStorage();
  }, []);

  useEffect(() => {
    if (!dest || !start) return;
    currentHour = new Date().getHours();

    const fetchBusByDestinationFromStorage = async () => {
      setLoading(true);
      const buses = await getAllBusesMatchingLocationFromStorage(start,dest);
      if (buses) {
        setBusData(buses);
        setLoading(false);
      }
      else{
        fetchBusByDestination();
      }
    }


    const fetchBusByDestination = async () => {
      setLoading(true);
      const response = await callAPI(
        '/bus/getByDestination',
        'GET',
        {},
        {start: start, destination: dest},
      );
      console.log('Response from API:', response);
      if (response.isError) {
        console.error('Error fetching bus data:', response.message);
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response.message || 'Could not fetch bus data.',
        });
        setLoading(false);
        return;
      }
      const data = response.data;
      setBusData(data);
      setLoading(false);
    };
    fetchBusByDestinationFromStorage();
  }, [dest,start]);

  useEffect(() => {
    if (selectedBus) {
      // sheetRef.current?.expand();
      sheetRef.current?.snapToIndex(0);
    }
  }, [selectedBus]);

  const handleSheetOpen = (busId: string, busNumber: string) => {
    if (!busId || !busNumber) {
      return;
    }
    console.log('sheet clicked');
    const bus = {
      bus_id: busId,
      bus_no: busNumber,
    };
    if (bus) {
      setSelectedBus(bus);
    }
  };

  return (
    <>
      <SafeAreaView style={{flex: 1}}>
        <GestureHandlerRootView style={styles.bottom_sheet}>
          <View style={styles.container}>
            <Text style={styles.title2}> Reach your destination fast</Text>
            <Loader visible={loading} />
            <SearchableDropdown
              data={allLocations.map(loc => ({
                id: loc._id,
                title: loc.name,
              }))}
              selected={start}
              setSelected={setStart}
              placeholder="Select Starting Point"
              containerStyle={{marginBottom: 10}}
              setTitle={setStartName}
            />
            <SearchableDropdown
              data={allLocations.map(loc => ({
                id: loc._id,
                title: loc.name,
              }))}
              selected={dest}
              setSelected={setDest}
              placeholder="Select Destination"
              containerStyle={{marginBottom: 20}}
              setTitle={setDestName}
            />
            <ScrollView>
            {busData &&
              start &&
              dest &&
              busData.length > 0 &&
              busData.map((bus: any) => {
                return (
                  <View
                    key={bus.bus_id}
                    style={{
                      marginBottom: 10,
                      paddingVertical: 5,
                      paddingHorizontal: 10,
                      backgroundColor: COLOR.bg_secondary,
                      borderRadius: 10,
                      marginTop: 5,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 5,
                    }}>
                    <Text style={styles.title}>
                      Bus Number: {bus.bus_number}
                    </Text>
                    <Text style={styles.info}>
                      Arrives ( {startName}) - {' '}
                      {currentHour >= 7 && currentHour <= 18 ? Math.floor(currentHour + bus.start_time / 60) : 7+Math.floor(currentHour + bus.start_time / 60)}:
                      {(bus.start_time % 60).toString().padStart(2, '0')}
                    </Text>
                    <Text style={styles.info}>
                      Reaches ( {destName}) - {' '} 
                      {currentHour >= 7 && currentHour <= 18 ? Math.floor(currentHour + bus.end_time / 60) : 7+Math.floor(currentHour + bus.start_time / 60)}
                      :{(bus.end_time % 60).toString().padStart(2, '0')}
                    </Text>
                    <View style={{display:'flex', alignItems: 'flex-end'}}>
                        <TouchableOpacity
                        style={styles.button}
                        onPress={() => handleSheetOpen(bus.bus_id, bus.bus_number)}>
                        {/* <Text style={styles.buttonText}>View Details</Text> */}
                        <Icon name="open-outline" size={25} color={COLOR.text_secondary} />
                        </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
              </ScrollView>

            <BottomSheet
              ref={sheetRef}
              index={-1}
              snapPoints={useMemo(() => ['80%', '100%'], [])}
              enablePanDownToClose={true}
              onClose={() => {
                setSelectedBus(null);
              }}
              backgroundStyle={{
                backgroundColor: COLOR.bg_primary,
              }}
              enableContentPanningGesture={false}
              handleIndicatorStyle={{
                backgroundColor: COLOR.golden,
                width: 80,
                height: 5,
              }}
              backdropComponent={props => (
                <BottomSheetBackdrop
                  {...props}
                  disappearsOnIndex={-1} // hide when sheet is closed
                  appearsOnIndex={0} // show backdrop when sheet opens
                  pressBehavior="close" // 👈 this enables closing on tap
                />
              )}
              enableDynamicSizing={false}>
              <BottomSheetView style={{height: '100%'}}>
                <BusProvider>
                  <BusDetailsSheet
                    busId={selectedBus?.bus_id || null}
                    busNumber={selectedBus?.bus_no || null}
                  />
                </BusProvider>
              </BottomSheetView>
            </BottomSheet>
          </View>
        </GestureHandlerRootView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  bottom_sheet: {
    flex: 1,
    backgroundColor: COLOR.bg_primary,
  },
  container: {backgroundColor: COLOR.bg_primary, padding: 20, flex: 1},
  title: {
    fontSize: 16,
    color: COLOR.golden,
    textAlign: 'center',
    marginBottom: 5,
  },
  title2: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLOR.golden,
    textAlign: 'center',
    marginBottom: 10,
  },
  info: {fontSize: 16, color: COLOR.text_secondary,flexWrap: 'wrap'},
  button: {
    padding: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {color: COLOR.text_dark, fontWeight: 'bold'},
});

export default BusDestinationScreen;
