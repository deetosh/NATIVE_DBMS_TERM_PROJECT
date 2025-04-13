// components/BusDetails.tsx
import React, {useEffect, useState} from 'react';
import {View, Text, ActivityIndicator, StyleSheet, TextInput} from 'react-native';
import {callAPI} from '../../services/callApi'; // replace with your actual API helper
import Loader from '../../molecules/Loader';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Picker} from '@react-native-picker/picker';
import {COLOR} from '../../constants';
import { ScrollView } from 'react-native-gesture-handler';
import SearchableDropdown from '../../molecules/SearchableDropDown';
import { useBusContext } from '../../context/BusContext';
import Toast from 'react-native-toast-message';

const BusDetailsScreen = () => {
  const [busData, setBusData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBusId, setSelectedBusId] = useState<string | null>(null); // Replace with actual bus ID fetching logic
  const [allBuses, setAllBuses] = useState<any[]>([]); // Replace with actual bus data fetching logic
  const currentHour = new Date().getHours();

  const {getAllBusesFromStorage,getBusDetailsFromStorage} = useBusContext();
  // useEffect(() => {
  //   const fetchBus = async () => {
  //     try {
  //       const response = await callAPI(
  //         `/bus/getById`,
  //         'GET',
  //         {},
  //         {busId: busId},
  //       );
  //       setBusData(response.data);
  //     } catch (err) {
  //       console.error('Failed to fetch bus details', err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   if (busId) fetchBus();
  // }, [busId]);

  useEffect(() => {
    const fetchFromStorage = async () => {
      setLoading(true);
      const buses = await getAllBusesFromStorage();
      if (buses) {
        setAllBuses(buses);
        console.log('***** Fetched buses from storage:', buses);
        setLoading(false);
      }else{
        fetchAllBuses();
      }
    }
    const fetchAllBuses = async () => {
      try {
        setLoading(true);
        const response = await callAPI(`/bus/get`, 'GET', {}, {});
        if (!response.isError) {
          console.log('Bus data:', response.data);
          setAllBuses(response.data);
        }
        else{
          Toast.show({
            type: 'error',
            text1: 'Make sure you are connected to the internet',
            text2: 'Failed to fetch bus details.',
          });
        }
      } catch (err) {
        Toast.show({
          type: 'error',
          text1: 'Make sure you are connected to the internet',
          text2: 'Failed to fetch bus details.',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFromStorage();
  }, []);

  useEffect(() => {
    const fetchBusDetailsFromStorage = async (busId: string) => {
      setLoading(true);
      const busDetails = await getBusDetailsFromStorage(busId);
      if (busDetails) {
        console.log('***** Fetched bus details from storage:', busDetails);
        setBusData(busDetails);
        setLoading(false);
      }
      else{
        fetchBusDetails(busId);
      }
    };

    const fetchBusDetails = async (busId: string) => {
      try {
        setLoading(true);
        const response = await callAPI(
          `/bus/getById`,
          'GET',
          {},
          {busId: busId},
        );
        if (!response.isError) {
          console.log('Bus data:', response.data);
          setBusData(response.data);
        }else{
          Toast.show({
            type: 'error',
            text1: 'Make sure you are connected to the internet',
            text2: 'Failed to fetch bus details.',
          });
          setBusData(null);
        }
      } catch (err) {
        console.error('Failed to fetch bus details', err);
        Toast.show({
          type: 'error',
          text1: 'Make sure you are connected to the internet',
          text2: 'Failed to fetch bus details.',
        });
        setBusData(null);
      } finally {
        setLoading(false);
      }
    };

    if (selectedBusId) {
      fetchBusDetailsFromStorage(selectedBusId);
    }
  }, [selectedBusId]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bus Details</Text>
      <Text style={{color: COLOR.text_tertiary,textAlign:'center',fontSize:16,marginBottom:10}}>* Buses run from 7AM to 6PM</Text>
      <Loader visible={loading} />
      {/* <View style={styles.pickerContainer}>
        <Ionicons
          name="bus-outline"
          size={20}
          color="white"
          style={styles.icon}
        />
        <Picker
          selectedValue={selectedBusId}
          onValueChange={itemValue => setSelectedBusId(itemValue)}
          mode="dropdown"
          style={styles.picker}
          dropdownIconColor={COLOR.text_primary}>
          <Picker.Item
            label="Select Bus"
            value= ""
            color="grey"
            style={styles.pickerLabel}
          />
          {allBuses.map((bus: any) => (
            <Picker.Item
              key={bus._id}
              label={bus.bus_number}
              value={bus._id}
              style={styles.pickerLabel}
            />
          ))}
        </Picker>
      </View> */}
      <SearchableDropdown
        data={allBuses.map(bus => ({
          id: bus._id,
          title: bus.bus_number,
        }))}
        setSelected={setSelectedBusId}
        placeholder="Select Bus"
        containerStyle={{marginBottom: 20}}
      />

      {selectedBusId && busData && (
        <>
          
          {/* <Text style={styles.info}>Bus Number</Text>
          <TextInput
            style={styles.disabledtextInput}
            value={
              busData?.bus_number
                ? `${busData?.bus_number}`
                : ''
            }
            editable={false}
            selectTextOnFocus={false}
          /> */}

          <Text style={styles.info}>Driver</Text>
          <TextInput
            style={styles.disabledtextInput}
            value={
              busData.driver?.username
                ? `${busData.driver?.username}`
                : ''
            }
            editable={false}
            selectTextOnFocus={false}
          />
         
          <Text style={styles.stoppage}> Stopagges </Text>
          <View style={{height:'50%',borderWidth:0.5,borderColor:COLOR.bg_tertiary,padding:20,borderRadius:10}}>
          <ScrollView>
          {busData?.stoppage && busData.stoppage.map((stop: any, index: number) => (
            <View key={index} style={styles.stopItem}>
              <Text style={styles.stopName}>
                Location: {stop?.location?.name ?? ''}
              </Text>
              <Text style={styles.stopTime}>
                Arrival Time: {currentHour >= 7 && currentHour <= 18 ? currentHour : 7}:
                {stop?.time?.toString().padStart(2, '0') ?? ''}
              </Text>
            </View>
          ))}
          </ScrollView>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {backgroundColor: COLOR.bg_primary, padding: 16, flex: 1},
  title: {fontSize: 18, fontWeight: 'bold', marginBottom: 10,color: COLOR.golden,textAlign: 'center'},
  info: {fontSize: 16, marginBottom: 8,color: COLOR.golden},
  stopItem: {
    marginVertical: 8,
    borderBottomColor: COLOR.bg_tertiary,
    borderBottomWidth: 1,
    paddingBottom: 8,
  },
  stopName: {fontSize: 16, fontWeight: '600',color: COLOR.text_secondary},
  stopTime: {fontSize: 14, color: COLOR.text_tertiary},
  errorText: {padding: 20, color: 'red'},
  picker: {
    flex: 1,
    color: COLOR.text_secondary,
    fontSize: 18,
    borderWidth: 1,
    borderColor: COLOR.text_primary
  },
  pickerLabel: {
    backgroundColor: COLOR.bg_primary,
    color: COLOR.text_secondary,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderColor: COLOR.bg_tertiary,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {marginRight: 10},
  stoppage: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 20,
    color: COLOR.golden,
    textAlign: 'center',
  },
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
});

export default BusDetailsScreen;
