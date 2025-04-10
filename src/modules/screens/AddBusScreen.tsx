import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {callAPI} from '../../services/callApi';

interface Location {
  _id: string;
  name: string;
}

interface Stop {
  _id: string;
  name: string;
  time: number;
}

const AddBusScreen: React.FC = () => {
  const [busNo, setBusNo] = useState<string>('');
  const [availableLocations, setAvailableLocations] = useState<Location[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');
  const [arrivalTime, setArrivalTime] = useState<string>('');
  const [route, setRoute] = useState<Stop[]>([]);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      console.log;
      const res = await callAPI('/location/get', 'GET');
      console.log('locations', res);
      if (!res.isError && res.data) {
        setAvailableLocations(res.data as Location[]);
      } else {
        Alert.alert('Error', res.message || 'Could not fetch locations.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'An error occurred while fetching locations.');
    }
  };

  const addStop = () => {
    if (!selectedLocationId || !arrivalTime) {
      Alert.alert(
        'Incomplete',
        'Please select a location and enter the arrival time.',
      );
      return;
    }

    if (route.find(stop => stop._id === selectedLocationId)) {
      Alert.alert('Duplicate', 'This stop is already in the route.');
      return;
    }

    const location = availableLocations.find(
      loc => loc._id === selectedLocationId,
    );
    if (!location) return;

    setRoute(prev => [
      ...prev,
      {
        _id: location._id,
        name: location.name,
        time: parseInt(arrivalTime),
      },
    ]);

    setSelectedLocationId('');
    setArrivalTime('');
  };

  const removeStop = (id: string) => {
    setRoute(route.filter(stop => stop._id !== id));
  };

  const handleSubmit = async () => {
    if (!busNo || route.length === 0) {
      Alert.alert(
        'Missing Fields',
        'Please fill in the bus number and add at least one stop.',
      );
      return;
    }

    const payload = {
      bus_number: busNo,
      stoppage: route.map(stop => ({
        location: stop._id,
        time: stop.time,
      })),
    };

    try {
      const res = await callAPI('/bus/add', 'POST', payload);
      if (!res.isError) {
        Alert.alert('Success', 'Bus added successfully!');
        setBusNo('');
        setRoute([]);
      } else {
        Alert.alert('Error', res.message || 'Failed to add bus.');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Something went wrong.');
    }
  };

  return (
    <View>
      <Text>Home Screen</Text>
    </View>
  );
};

export default AddBusScreen;
