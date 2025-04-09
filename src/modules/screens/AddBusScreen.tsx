import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';

const availableLocations = ['Main Gate', 'Hostel', 'Library', 'Canteen', 'Lab', 'Admin Block'];
const availableDrivers = ['Rajesh Singh', 'Amit Kumar', 'Sunita Sharma', 'Deepak Yadav'];

const AddBusScreen = () => {
  const [busNo, setBusNo] = useState('');
  const [selectedRoute, setSelectedRoute] = useState([]);
  const [driver, setDriver] = useState('');
  const [locationInput, setLocationInput] = useState('');

  const addLocationToRoute = () => {
    if (locationInput && availableLocations.includes(locationInput) && !selectedRoute.includes(locationInput)) {
      setSelectedRoute([...selectedRoute, locationInput]);
      setLocationInput('');
    }
  };

  const removeLocationFromRoute = (location) => {
    setSelectedRoute(selectedRoute.filter(loc => loc !== location));
  };

  const submitBus = () => {
    if (!busNo || selectedRoute.length === 0 || !driver) {
      Alert.alert("Missing Info", "Please enter all details before submitting.");
      return;
    }

    const newBus = {
      busNo,
      route: selectedRoute,
      driver
    };

    console.log('Bus Added:', newBus);
    Alert.alert("Success", `Bus ${busNo} added successfully!`);

    // Clear form
    setBusNo('');
    setSelectedRoute([]);
    setDriver('');
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 10 }}>Add a New Bus</Text>

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
          marginBottom: 10,
        }}
      />

      <Text>Select Route Locations:</Text>
      <TextInput
        value={locationInput}
        onChangeText={setLocationInput}
        placeholder="Enter Location"
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          padding: 10,
          borderRadius: 8,
          marginBottom: 10,
        }}
      />
      <TouchableOpacity
        onPress={addLocationToRoute}
        style={{
          backgroundColor: '#4CAF50',
          padding: 10,
          borderRadius: 8,
          marginBottom: 10,
        }}
      >
        <Text style={{ color: '#fff', textAlign: 'center' }}>Add Location to Route</Text>
      </TouchableOpacity>

      <Text style={{ fontWeight: 'bold' }}>Route:</Text>
      {selectedRoute.map((loc, idx) => (
        <View
          key={idx}
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 5,
            backgroundColor: '#f0f0f0',
            padding: 8,
            borderRadius: 6,
          }}
        >
          <Text>{loc}</Text>
          <TouchableOpacity onPress={() => removeLocationFromRoute(loc)}>
            <Text style={{ color: 'red' }}>Remove</Text>
          </TouchableOpacity>
        </View>
      ))}

      <Text style={{ marginTop: 10 }}>Assign Driver:</Text>
      {availableDrivers.map((drv, idx) => (
        <TouchableOpacity
          key={idx}
          onPress={() => setDriver(drv)}
          style={{
            padding: 10,
            backgroundColor: driver === drv ? '#2196F3' : '#ddd',
            borderRadius: 6,
            marginBottom: 5,
          }}
        >
          <Text style={{ color: driver === drv ? '#fff' : '#000' }}>{drv}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        onPress={submitBus}
        style={{
          backgroundColor: '#2196F3',
          padding: 12,
          borderRadius: 10,
          marginTop: 20,
        }}
      >
        <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>
          Submit Bus
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default AddBusScreen;
