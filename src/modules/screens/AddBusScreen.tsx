import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { callAPI } from '../../services/callApi';

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
      console.log
      const res = await callAPI('/location/get', 'GET');
      console.log("locations",res);
      if (!res.isError && res.data) {
        setAvailableLocations(res.data as Location[]);
      } else {
        Alert.alert("Error", res.message || "Could not fetch locations.");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "An error occurred while fetching locations.");
    }
  };

  const addStop = () => {
    if (!selectedLocationId || !arrivalTime) {
      Alert.alert("Incomplete", "Please select a location and enter the arrival time.");
      return;
    }

    if (route.find(stop => stop._id === selectedLocationId)) {
      Alert.alert("Duplicate", "This stop is already in the route.");
      return;
    }

    const location = availableLocations.find(loc => loc._id === selectedLocationId);
    if (!location) return;

    setRoute(prev => [
      ...prev,
      {
        _id: location._id,
        name: location.name,
        time: parseInt(arrivalTime)
      }
    ]);

    setSelectedLocationId('');
    setArrivalTime('');
  };

  const removeStop = (id: string) => {
    setRoute(route.filter(stop => stop._id !== id));
  };

  const handleSubmit = async () => {
    if (!busNo || route.length === 0) {
      Alert.alert("Missing Fields", "Please fill in the bus number and add at least one stop.");
      return;
    }

    const payload = {
      bus_number: busNo,
      stoppage: route.map(stop => ({
        location: stop._id,
        time: stop.time
      }))
    };

    try {
      const res = await callAPI('/bus/add', 'POST', payload);
      if (!res.isError) {
        Alert.alert("Success", "Bus added successfully!");
        setBusNo('');
        setRoute([]);
      } else {
        Alert.alert("Error", res.message || "Failed to add bus.");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Something went wrong.");
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 10 }}>
        Add a New Bus
      </Text>

      <Text style={{ marginTop: 10 }}>Bus Number:</Text>
      <TextInput
        value={busNo}
        onChangeText={setBusNo}
        placeholder="Enter Bus Number"
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 10,
          borderRadius: 8,
          marginBottom: 10
        }}
      />

      <Text style={{ marginTop: 10 }}>Select Location:</Text>
      <View
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 8,
          marginBottom: 10
        }}
      >
        <Picker
          selectedValue={selectedLocationId}
          onValueChange={(itemValue) => setSelectedLocationId(itemValue)}
        >
          <Picker.Item label="-- Select a location --" value="" />
          {availableLocations.map((loc) => (
            <Picker.Item key={loc._id} label={loc.name} value={loc._id} />
          ))}
        </Picker>
      </View>

      <Text>Arrival Time at Stop (in minutes):</Text>
      <TextInput
        value={arrivalTime}
        onChangeText={setArrivalTime}
        placeholder="e.g., 20"
        keyboardType="numeric"
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 10,
          borderRadius: 8,
          marginBottom: 10
        }}
      />

      <TouchableOpacity
        onPress={addStop}
        style={{
          backgroundColor: '#4CAF50',
          padding: 10,
          borderRadius: 8,
          marginBottom: 20
        }}
      >
        <Text style={{ color: '#fff', textAlign: 'center' }}>Add Stop to Route</Text>
      </TouchableOpacity>

      <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>Route Preview:</Text>
      {route.map((stop, index) => (
        <View
          key={stop._id}
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            backgroundColor: '#f0f0f0',
            padding: 10,
            borderRadius: 8,
            marginBottom: 5
          }}
        >
          <Text>{index + 1}. {stop.name} — {stop.time} min</Text>
          <TouchableOpacity onPress={() => removeStop(stop._id)}>
            <Text style={{ color: 'red' }}>Remove</Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity
        onPress={handleSubmit}
        style={{
          backgroundColor: '#2196F3',
          padding: 12,
          borderRadius: 10,
          marginTop: 20
        }}
      >
        <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>
          Submit Bus
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};