// components/BusDetails.tsx
import React, {useEffect, useState} from 'react';
import {View, Text, ActivityIndicator, StyleSheet} from 'react-native';
import {callAPI} from '../../services/callApi'; // replace with your actual API helper
import Loader from '../../molecules/Loader';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Picker } from "@react-native-picker/picker";
import {COLOR} from '../../constants';

const BusDetailsScreen = () => {
  const [busData, setBusData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBusId, setSelectedBusId] = useState<string | null>(null); // Replace with actual bus ID fetching logic

  const currentHour = new Date().getHours();

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
    const fetchAllBuses = async () => {
      try {
        setLoading(true);
        const response = await callAPI(`/bus/get`, 'GET', {}, {});
        if(!response.isError){
          console.log('Bus data:', response.data);
          setBusData(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch bus details', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllBuses();
  }, []);

  return (
    <View style={styles.container}>
      {/* <Text style={styles.title}>Bus Details</Text>
      <Text style={styles.info}>Bus Number: {busData.bus_number}</Text>
      <Text style={styles.info}>Driver: {busData.driver?.username}</Text>

      {busData.stoppage.map((stop: any, index: number) => (
        <View key={index} style={styles.stopItem}>
          <Text style={styles.stopName}>Location: {stop.location.name}</Text>
          <Text style={styles.stopTime}>
            Arrival Time: {currentHour}:{stop.time.toString().padStart(2, '0')}
          </Text>
        </View>
      ))} */}
      <Loader visible={loading} />
      <View style={styles.pickerContainer}>
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
            value=""
            color="grey"
            style={styles.pickerLabel}
          />
          {busData.map((bus:any) => (
            <Picker.Item
              key={bus._id}
              label={bus.bus_number}
              value={bus._id}
              style={styles.pickerLabel}
            />
          ))}
        </Picker>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {backgroundColor: COLOR.bg_primary, padding: 16, flex: 1},
  title: {fontSize: 18, fontWeight: 'bold', marginBottom: 12},
  info: {fontSize: 16, marginBottom: 8},
  stopItem: {
    marginVertical: 8,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    paddingBottom: 8,
  },
  stopName: {fontSize: 16, fontWeight: '600'},
  stopTime: {fontSize: 14, color: 'gray'},
  errorText: {padding: 20, color: 'red'},
  picker: {
    flex: 1,
    color: COLOR.text_secondary,
    fontSize: 18,
  },
  pickerLabel: {
    backgroundColor: COLOR.bg_secondary,
    color: COLOR.text_secondary,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderColor: COLOR.bg_tertiary,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: { marginRight: 10 },
});

export default BusDetailsScreen;
