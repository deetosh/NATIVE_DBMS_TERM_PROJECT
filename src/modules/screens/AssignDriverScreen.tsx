// components/BusDetails.tsx
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import {callAPI} from '../../services/callApi'; // replace with your actual API helper
import Loader from '../../molecules/Loader';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Picker} from '@react-native-picker/picker';
import {COLOR} from '../../constants';
import {ScrollView} from 'react-native-gesture-handler';
import SearchableDropdown from '../../molecules/SearchableDropDown';
import Toast from 'react-native-toast-message';

const AssignDriverScreen = () => {
  const [loading, setLoading] = useState(true);
  const [selectedBusId, setSelectedBusId] = useState<string | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [allBuses, setAllBuses] = useState<any[]>([]); // Replace with actual bus data fetching logic
  const [allDrivers, setAllDrivers] = useState<any[]>([]); // Replace with actual driver data fetching logic

  useEffect(() => {
    const fetchAllBuses = async () => {
      try {
        setLoading(true);
        const response = await callAPI(`/bus/get`, 'GET', {}, {});
        if (!response.isError) {
          console.log('Bus data:', response.data);
          setAllBuses(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch bus details', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchAllDrivers = async () => {
      try {
        setLoading(true);
        const response = await callAPI(`/bus/getDrivers`, 'GET');
        if (!response.isError) {
          console.log('Driver data:', response.data);
          setAllDrivers(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch driver details', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllBuses();
    fetchAllDrivers();
  }, []);

  const handleAssign= async () => {
    if (!selectedBusId || !selectedDriverId) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please select both bus and driver.',
      });
      return;
    }

    try {
      setLoading(true);
      const response = await callAPI(
        `/bus/assignDriver`,
        'POST',
        {busId: selectedBusId, driverId: selectedDriverId},
        {},
      );
      if (!response.isError) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Driver assigned successfully.',
        });
        setSelectedBusId(null);
        setSelectedDriverId(null);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: response.message,
        });
      }
    } catch (err) {
      console.error('Failed to assign driver', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Assign Driver to Bus</Text>
      <Loader visible={loading} />
      <SearchableDropdown
        data={allBuses.map(bus => ({
          id: bus._id,
          title: bus.bus_number,
        }))}
        selected={selectedBusId}
        setSelected={setSelectedBusId}
        placeholder="Select Bus"
        containerStyle={{marginBottom: 20}}
      />
      <SearchableDropdown
        data={allDrivers.map(driver => ({
          id: driver._id,
          title: `${driver.username} (${driver.email})`,
        }))}
        selected={selectedDriverId}
        setSelected={setSelectedDriverId}
        placeholder="Select Driver"
        containerStyle={{marginBottom: 20}}
      />

      <TouchableOpacity style={styles.button} onPress={handleAssign}>
        <Text style={styles.buttonText}>Assign</Text>
      </TouchableOpacity>
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {backgroundColor: COLOR.bg_primary, padding: 16, flex: 1},
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 25,
    color: COLOR.golden,
    textAlign: 'center',
  },
  info: {fontSize: 16, marginBottom: 8, color: COLOR.golden},
  button: {
    marginTop: 10,
    backgroundColor: COLOR.golden,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    height: 50,
    justifyContent: 'center',
  },
  buttonText: {color: COLOR.text_dark, fontWeight: 'bold'},

});

export default AssignDriverScreen;
