import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {callAPI} from '../../services/callApi';
import Toast from 'react-native-toast-message';
import {COLOR} from '../../constants';
import SearchableDropdown from '../../molecules/SearchableDropDown';
import Loader from '../../molecules/Loader';

interface Location {
  _id: string;
  name: string;
}

interface Stop {
  _id: string;
  name: string;
  time: number;
}

interface Prop {
  handleClose: (flag?: boolean) => void;
}

const AddBusScreen: React.FC<Prop> = ({handleClose}) => {
  const [busNo, setBusNo] = useState<string>('');
  const [availableLocations, setAvailableLocations] = useState<Location[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    '',
  );
  const [arrivalTime, setArrivalTime] = useState<string>('');
  const [route, setRoute] = useState<Stop[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // const dropdownRef = useRef<SearchableDropdownRef>(null);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setIsLoading(true);
      const res = await callAPI('/location/get', 'GET');
      console.log('locations', res);
      if (!res.isError && res.data) {
        setAvailableLocations(res.data as Location[]);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: res.message || 'Could not fetch locations.',
        });
      }
      setIsLoading(false);
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Something went wrong while fetching locations.',
      });
      setIsLoading(false);
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

    // check if the location is already in the route with same time
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

    const location = availableLocations.find(
      loc => loc._id === selectedLocationId,
    );
    if (!location) return;

    // insert the new stop in ascending order with respect to time

    const newRoute = [
      ...route,
      {_id: location._id, name: location.name, time: arrivalTimeNum},
    ];
    newRoute.sort((a, b) => a.time - b.time);
    setRoute(newRoute);

    // setRoute(prev => [
    //   ...prev,
    //   {
    //     _id: location._id,
    //     name: location.name,
    //     time: parseInt(arrivalTime),
    //   },
    // ]);
    // dropdownRef.current?.clear();
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
      setIsLoading(true);
      const res = await callAPI('/bus/add', 'POST', payload);
      if (!res.isError) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Bus added successfully!',
        });
        setBusNo('');
        setRoute([]);
        handleClose(true);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: res.message || 'Could not add bus.',
        });
      }
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Something went wrong while adding the bus.',
      });
      setIsLoading(false);
    }
  };

  return (
    <View style={{flex: 1, backgroundColor: COLOR.bg_primary}}>
      <Loader visible={isLoading} />
      <View
        style={{flex: 1, backgroundColor: COLOR.bg_primary, marginBottom: 100,padding:10}}>
        <View style={{display: 'flex',flexDirection: 'row',alignItems: 'center'}}>
          <Text
            style={{
              fontSize: 22,
              fontWeight: 'bold',
              marginBottom: 10,
              color: COLOR.golden,
              textAlign: 'center',
              flex:1
            }}>
            Add a New Bus
          </Text>
          <TouchableOpacity
            onPress={() => handleClose()}
            style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        <Text
          style={{
            marginTop: 10,
            color: COLOR.text_secondary,
            marginBottom: 10,
          }}>
          Bus Number:
        </Text>
        <TextInput
          value={busNo}
          onChangeText={setBusNo}
          placeholder="Enter Bus Number"
          placeholderTextColor={COLOR.text_tertiary}
          style={{
            borderWidth: 1,
            borderColor: COLOR.bg_tertiary,
            padding: 10,
            borderRadius: 8,
            marginBottom: 20,
            color: COLOR.text_secondary,
            fontSize: 16,
          }}
        />

        <Text
          style={{
            color: COLOR.text_secondary,

          }}>
          Select Next Stoppage:
        </Text>
        {/* <View
        style={{
          borderWidth: 1,
          borderColor: COLOR.bg_tertiary,
          borderRadius: 8,
          marginBottom: 10,
        }}>
        <Picker
          selectedValue={selectedLocationId}
          onValueChange={itemValue => setSelectedLocationId(itemValue)}
          style={{color: COLOR.text_secondary}} // 👈 Add this
        >
          <Picker.Item label="-- Select a location --" value="" />
          {availableLocations.map(loc => (
            <Picker.Item key={loc._id} label={loc.name} value={loc._id} />
          ))}
        </Picker>
      </View> */}

        <SearchableDropdown
          // ref={dropdownRef}
          data={availableLocations.map(loc => ({
            id: loc._id,
            title: loc.name,
          }))}
          selected={selectedLocationId}
          setSelected={setSelectedLocationId}
          placeholder="Select Location"
          containerStyle={{marginBottom: 10}}
        />

        <Text
          style={{
            color: COLOR.text_secondary,
            marginBottom: 10,
          }}>
          Arrival Time at Stop (in minutes):
        </Text>
        <TextInput
          value={arrivalTime}
          onChangeText={setArrivalTime}
          placeholder="e.g., 20"
          placeholderTextColor={COLOR.text_tertiary}
          keyboardType="numeric"
          style={{
            borderWidth: 1,
            borderColor: COLOR.bg_tertiary,
            padding: 10,
            borderRadius: 8,
            marginBottom: 10,
            color: COLOR.text_secondary,
          }}
        />

        <TouchableOpacity
          onPress={addStop}
          style={{
            backgroundColor: COLOR.my_color,
            padding: 10,
            borderRadius: 8,
            marginBottom: 20,
          }}>
          <Text style={{color: COLOR.text_primary, textAlign: 'center'}}>
            Add Stop to Route
          </Text>
        </TouchableOpacity>

        <Text
          style={{
            fontWeight: 'bold',
            marginBottom: 5,
            color: COLOR.text_secondary,
          }}>
          Route Preview:
        </Text>
        <View style={{height:180}}>
        <ScrollView contentContainerStyle={{padding:10}}>
        {route.map((stop, index) => (
          <View
            key={index}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              backgroundColor: COLOR.bg_secondary,
              padding: 10,
              borderRadius: 8,
              marginBottom: 5,
              flexWrap: 'wrap',
            }}>
            <Text style={{color: COLOR.text_secondary}}>
              {index + 1}. {stop.name} — {stop.time} min
            </Text>
            <TouchableOpacity onPress={() => removeStop(stop._id, stop.time)}>
              <Text style={{color: 'red'}}>Remove</Text>
            </TouchableOpacity>
          </View>
        ))}
        </ScrollView>

        </View>
        
        <TouchableOpacity
          onPress={handleSubmit}
          style={{
            backgroundColor: COLOR.golden,
            padding: 12,
            borderRadius: 10,
            marginTop: 20,
          }}>
          <Text
            style={{
              color: COLOR.text_dark,
              textAlign: 'center',
              fontWeight: 'bold',
            }}>
            Submit Bus
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  closeButton: {
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  closeText: {
    fontSize: 22,
    color: COLOR.text_secondary,
  },
});
export default AddBusScreen;
