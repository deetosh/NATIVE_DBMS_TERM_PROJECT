import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import MapView, {Marker, MapPressEvent, Region} from 'react-native-maps';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import {COLOR, initialRegionMap} from '../../constants';
import Toast from 'react-native-toast-message';
import { callAPI } from '../../services/callApi';
import Loader from '../../molecules/Loader';
import SearchableDropdown from '../../molecules/SearchableDropDown';

const {width} = Dimensions.get('window');

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface Location {
  _id: string;
  name: string;
  coordinates: number[];
}

const AddLocationScreen: React.FC = () => {
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [placeName, setPlaceName] = useState<string>('');
  const [selectedCoordinate, setSelectedCoordinate] =
    useState<Coordinate | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [allLocations, setAllLocations] = useState<Location[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

  const handleMapPress = (e: MapPressEvent) => {
    if (isAdding) {
      const coordinate = e.nativeEvent.coordinate;
      setSelectedCoordinate(coordinate);
    }
  };

  const handleSubmit = async () => {
    if (!placeName || !selectedCoordinate) {
      // Alert.alert(
      //   'Missing Info',
      //   'Please enter a place name and tap on the map.',
      // );
      Toast.show({
        type: 'error',
        text1: 'Missing Info',
        text2: 'Please enter a place name and tap on the map to select a place.',
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await callAPI('/location/add',"POST",{
        name: placeName,
        coordinates: [selectedCoordinate.latitude,selectedCoordinate.longitude],
      });
      setIsLoading(false);
      if (!response.isError && response.data) {
        setIsAdding(false);
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Location added successfully.',
        });
        setAllLocations((prevLocations) => [
          ...prevLocations,
          {
            name: response.data.name,
            _id: response.data._id,
            coordinates: [
              response.data.coordinates[0],
              response.data.coordinates[1],
            ],
          },
        ]);
        setPlaceName('');
        setSelectedCoordinate(null);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to add location. Please try again.',
        });
        setIsAdding(false);
        setPlaceName('');
        setSelectedCoordinate(null);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to add location. Please try again.',
      });
      setIsAdding(false);
      setPlaceName('');
      setSelectedCoordinate(null);
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setPlaceName('');
    setSelectedCoordinate(null);
  };

  const handleCancelDelete = () => {
    setIsDeleting(false);
  }

  const handleDelete = async () => {

    if(!selectedLocationId){
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please select a location to delete.',
      });
      return;
    }
    try {
      setIsLoading(true);
      const response = await callAPI(`/location/delete`, "DELETE",{},{id: selectedLocationId});
      if (!response.isError) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Location deleted successfully.',
        });
        setAllLocations((prevLocations) =>
          prevLocations.filter((loc) => loc._id !== selectedLocationId),
        );
        setSelectedLocationId(null);
        setIsDeleting(false);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to delete location. Please try again.',
        });
        setIsLoading(false);
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to delete location. Please try again.',
      });
      setIsLoading(false);
    }
  }

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

  const initialRegion: Region = initialRegionMap;

  return (
    <SafeAreaView style={styles.container}>
      <Loader visible={isLoading} />
      <View style={styles.container}>
        <MapView
          style={styles.map}
          showsUserLocation={true}
          initialRegion={initialRegion}
          onPress={handleMapPress}>
          {selectedCoordinate && <Marker coordinate={selectedCoordinate} />}
          {allLocations.map((location, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: location.coordinates[0],
                longitude: location.coordinates[1],
              }}
              title={location.name}
              pinColor='blue'
            />
          ))}
        </MapView>

        {!isAdding && !isDeleting && (
          <View style={{display:'flex', flexDirection:'column',gap:10, justifyContent:'space-between', position:'absolute', bottom: 100, right: 30}}>
          <TouchableOpacity
            style={styles.plusButton}
            onPress={() => setIsAdding(true)}>
            <Icon name="add" size={30} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.plusButton}
            onPress={() => setIsDeleting(true)}>
            <Icon name="trash-bin" size={30} color="#fff" />
          </TouchableOpacity>
        </View>
        )}

        {isAdding && (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Enter place name"
              value={placeName}
              onChangeText={setPlaceName}
              placeholderTextColor="gray"
              autoFocus={true}
            />
            <TextInput
              style={styles.disabledtextInput}
              placeholder="Select a point on map (Latitude)"
              value={
                selectedCoordinate?.latitude
                  ? `${selectedCoordinate.latitude}`
                  : ''
              }
              editable={false}
              selectTextOnFocus={false}
              placeholderTextColor="gray"
            />
            <TextInput
              style={styles.disabledtextInput}
              placeholder="Select a point on map (Longitude)"
              value={
                selectedCoordinate?.longitude
                  ? `${selectedCoordinate.longitude}`
                  : ''
              }
              editable={false}
              selectTextOnFocus={false}
              placeholderTextColor="gray"
            />
            <View
              style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}>
                <Text style={styles.submitText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleSubmit}>
                <Text style={styles.submitText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {isDeleting && (
          <View style={styles.inputContainer}>
            <SearchableDropdown
              data={allLocations.map(loc => ({
                id: loc._id,
                title: loc.name,
              }))}
              selected={selectedLocationId}
              setSelected={setSelectedLocationId}
              placeholder="Select Destination"
              containerStyle={{marginBottom: 10}}
            />
          <View
            style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelDelete}>
              <Text style={styles.submitText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleDelete}>
              <Text style={styles.submitText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default AddLocationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  plusButton: {
    // position: 'absolute',
    // bottom: 100,
    // right: 30,
    backgroundColor: COLOR.bg_primary,
    borderRadius: 30,
    width: 60,
    height: 60,
    padding: 15,
    elevation: 2,
  },
  inputContainer: {
    position: 'absolute',
    // bottom: 0,
    top: 0,
    width: '100%',
    padding: 20,
    backgroundColor: COLOR.bg_primary,
  },
  textInput: {
    height: 45,
    borderColor: COLOR.text_secondary,
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginBottom: 10,
    color: COLOR.text_primary,
    fontSize: 16,
  },
  disabledtextInput: {
    height: 45,
    borderColor: COLOR.text_secondary,
    backgroundColor: COLOR.bg_secondary,
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginBottom: 10,
    color: COLOR.text_primary,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: COLOR.btn_primary,
    padding: 10,
    alignItems: 'center',
    borderRadius: 5,
  },
  submitText: {
    color: COLOR.text_dark,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: COLOR.btn_secondary,
    padding: 10,
    alignItems: 'center',
    borderRadius: 5,
  },
});
