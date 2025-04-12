import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Modal from 'react-native-modal';
import Toast from 'react-native-toast-message';
import {Picker} from '@react-native-picker/picker';
import {COLOR} from '../../constants';
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

type Props = {
  visible: boolean;
  onClose: () => void;
};

const Addbusform: React.FC<Props> = ({visible, onClose}) => {
  const [busNo, setBusNo] = useState<string>('');
  const [availableLocations, setAvailableLocations] = useState<Location[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>('');
  const [arrivalTime, setArrivalTime] = useState<string>('');
  const [route, setRoute] = useState<Stop[]>([]);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const res = await callAPI('/location/get', 'GET');
      if (!res.isError && res.data) {
        setAvailableLocations(res.data as Location[]);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: res.message || 'Could not fetch locations.',
        });
      }
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Something went wrong while fetching locations.',
      });
    }
  };

  const addStop = () => {
    if (!selectedLocationId || !arrivalTime) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please select a location and enter the arrival time.',
      });
      return;
    }

    const arrivalTimeNum = parseInt(arrivalTime);
    if (arrivalTimeNum < 0 || arrivalTimeNum >= 60) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Arrival time must be between 0 and 59 minutes.',
      });
      return;
    }

    const existingStop = route.find(
      stop => stop._id === selectedLocationId && stop.time === arrivalTimeNum,
    );
    if (existingStop) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'This stop is already in the route with the same time.',
      });
      return;
    }

    const location = availableLocations.find(loc => loc._id === selectedLocationId);
    if (!location) return;

    const newRoute = [...route, {_id: location._id, name: location.name, time: arrivalTimeNum}];
    newRoute.sort((a, b) => a.time - b.time);
    setRoute(newRoute);
    setSelectedLocationId('');
    setArrivalTime('');
  };

  const removeStop = (id: string, time: number) => {
    setRoute(route.filter(stop => stop._id !== id || stop.time !== time));
  };

  const handleSubmit = async () => {
    if (!busNo || route.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please fill in the bus number and add at least one stop.',
      });
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
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Bus added successfully!',
        });
        setBusNo('');
        setRoute([]);
        onClose(); // Close modal after successful submission
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: res.message || 'Could not add bus.',
        });
      }
    } catch (err) {
      console.error(err);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Something went wrong while adding the bus.',
      });
    }
  };

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={{margin: 0, justifyContent: 'center'}}
      avoidKeyboard
      backdropOpacity={0.6}>
      <View style={styles.modalContainer}>
        <ScrollView contentContainerStyle={{padding: 20}}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Add a New Bus</Text>

          <Text style={styles.label}>Bus Number:</Text>
          <TextInput
            value={busNo}
            onChangeText={setBusNo}
            placeholder="Enter Bus Number"
            style={styles.input}
          />

          <Text style={styles.label}>Select Location:</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedLocationId}
              onValueChange={(itemValue, itemIndex) => {
                setSelectedLocationId(itemValue);
              }}>
              <Picker.Item label="Select Stop" value="" />
              {availableLocations.map(loc => (
                <Picker.Item key={loc._id} label={loc.name} value={loc._id} />
              ))}
            </Picker>
          </View>

          <Text style={styles.label}>Arrival Time at Stop (in minutes):</Text>
          <TextInput
            value={arrivalTime}
            onChangeText={setArrivalTime}
            placeholder="e.g., 20"
            keyboardType="numeric"
            style={styles.input}
          />

          <TouchableOpacity onPress={addStop} style={styles.addButton}>
            <Text style={styles.addButtonText}>Add Stop to Route</Text>
          </TouchableOpacity>

          <Text style={styles.routeTitle}>Route Preview:</Text>
          {route.map((stop, index) => (
            <View key={index} style={styles.stopRow}>
              <Text style={styles.stopText}>
                {index + 1}. {stop.name} — {stop.time} min
              </Text>
              <TouchableOpacity onPress={() => removeStop(stop._id, stop.time)}>
                <Text style={{color: 'red'}}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
            <Text style={styles.submitButtonText}>Submit Bus</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: COLOR.bg_primary,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  closeText: {
    fontSize: 22,
    color: COLOR.text_secondary,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: COLOR.golden,
    textAlign: 'center',
  },
  label: {
    marginTop: 10,
    marginBottom: 5,
    color: COLOR.text_secondary,
  },
  input: {
    borderWidth: 1,
    borderColor: COLOR.bg_tertiary,
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    color: COLOR.text_secondary,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: COLOR.bg_tertiary,
    borderRadius: 8,
    marginBottom: 10,
    overflow: 'hidden',
  },
  addButton: {
    backgroundColor: COLOR.my_color,
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  addButtonText: {
    color: COLOR.text_primary,
    textAlign: 'center',
  },
  routeTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: COLOR.text_secondary,
  },
  stopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLOR.bg_secondary,
    padding: 10,
    borderRadius: 8,
    marginBottom: 5,
    flexWrap: 'wrap',
  },
  stopText: {
    color: COLOR.text_secondary,
  },
  submitButton: {
    backgroundColor: COLOR.golden,
    padding: 12,
    borderRadius: 10,
    marginTop: 20,
  },
  submitButtonText: {
    color: COLOR.text_dark,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default Addbusform;
