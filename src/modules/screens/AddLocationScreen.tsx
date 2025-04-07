import React, {useState} from 'react';
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

const {width} = Dimensions.get('window');

interface Coordinate {
  latitude: number;
  longitude: number;
}

const AddLocationScreen: React.FC = () => {
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [placeName, setPlaceName] = useState<string>('');
  const [selectedCoordinate, setSelectedCoordinate] =
    useState<Coordinate | null>(null);

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
      const response = await callAPI('/location/add',"POST",{
        name: placeName,
        coordinates: [selectedCoordinate.latitude,selectedCoordinate.longitude],
      });

      if (!response.isError) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Location added successfully.',
        });
        setPlaceName('');
        setSelectedCoordinate(null);
        setIsAdding(false);
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

  const initialRegion: Region = initialRegionMap;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <MapView
          style={styles.map}
          showsUserLocation={true}
          initialRegion={initialRegion}
          onPress={handleMapPress}>
          {selectedCoordinate && <Marker coordinate={selectedCoordinate} />}
        </MapView>

        {!isAdding && (
          <TouchableOpacity
            style={styles.plusButton}
            onPress={() => setIsAdding(true)}>
            <Icon name="add" size={30} color="#fff" />
          </TouchableOpacity>
        )}

        {isAdding && (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Enter place name"
              value={placeName}
              onChangeText={setPlaceName}
              placeholderTextColor="gray"
            />
            <TextInput
              style={styles.disabledtextInput}
              placeholder="Select a point on map"
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
              placeholder="Select a point on map"
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
                <Text style={styles.submitText}>Submit</Text>
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
    paddingBottom: 30,
  },
  map: {
    flex: 1,
  },
  plusButton: {
    position: 'absolute',
    bottom: 40,
    right: 30,
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
    width: '100%',
    padding: 20,
    backgroundColor: COLOR.bg_secondary,
  },
  textInput: {
    height: 50,
    borderColor: COLOR.text_secondary,
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginBottom: 10,
    color: COLOR.text_primary,
    fontSize: 18,
  },
  disabledtextInput: {
    height: 50,
    borderColor: COLOR.text_secondary,
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginBottom: 10,
    color: COLOR.text_primary,
    fontSize: 18,
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
