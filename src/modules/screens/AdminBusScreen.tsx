// components/BusDetails.tsx
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {callAPI} from '../../services/callApi'; // replace with your actual API helper
import Loader from '../../molecules/Loader';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Picker} from '@react-native-picker/picker';
import {COLOR} from '../../constants';
import {ScrollView} from 'react-native-gesture-handler';
import SearchableDropdown from '../../molecules/SearchableDropDown';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/Ionicons';
import AddBusScreen from './AddBusScreen';

const AdminBusManageScreen = () => {
  const [busData, setBusData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBusId, setSelectedBusId] = useState<string | null>(null); // Replace with actual bus ID fetching logic
  const [allBuses, setAllBuses] = useState<any[]>([]); // Replace with actual bus data fetching logic
  const currentHour = new Date().getHours();

  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

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

  useEffect(() => {
    fetchAllBuses();
  }, []);

  useEffect(() => {
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
        }
      } catch (err) {
        console.error('Failed to fetch bus details', err);
      } finally {
        setLoading(false);
      }
    };

    if (selectedBusId) {
      fetchBusDetails(selectedBusId);
    }
  }, [selectedBusId]);

  const handleDelete = async () => {
    if (!selectedBusId) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please select a bus to delete.',
      });
      return;
    }
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this bus?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setLoading(true);
            const response = await callAPI(
              `/bus/delete`,
              'DELETE',
              {},
              {id: selectedBusId},
            );
            if (!response.isError) {
              console.log('Bus deleted:', response.data);
              Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Bus deleted successfully.',
              });
              setAllBuses(allBuses.filter(bus => bus._id !== selectedBusId));
              setSelectedBusId(null);
              setBusData(null);
            } else {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: response.message || 'Failed to delete bus.',
              });
            }
          } catch (err) {
            console.error('Failed to delete bus', err);
            Toast.show({
              type: 'error',
              text1: 'Error',
              text2: 'Failed to delete bus. Please try again.',
            });
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handleAddBus = () => {
    setIsBottomSheetOpen(true);
  };

  const handleClose = (flag:boolean = false) => {
    setIsBottomSheetOpen(false);
    if(flag)fetchAllBuses();
  };

  return (
      <View style={styles.container}>
        {!isBottomSheetOpen && (<>
            <Text style={styles.title}>Manage Buses</Text>
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

        {selectedBusId && busData && (
          <View>
            <Text style={styles.info}>Driver</Text>
            <TextInput
              style={styles.disabledtextInput}
              value={
                busData.driver?.username ? `${busData.driver?.username}` : ''
              }
              editable={false}
              selectTextOnFocus={false}
            />

            <Text style={styles.stoppage}> Stopagges </Text>
            <View
              style={{
                height: '45%',
                borderWidth: 0.5,
                borderColor: COLOR.bg_tertiary,
                padding: 20,
                borderRadius: 10,
              }}>
              <ScrollView>
                {busData?.stoppage &&
                  busData.stoppage.map((stop: any, index: number) => (
                    <View key={index} style={styles.stopItem}>
                      <Text style={styles.stopName}>
                        Location: {stop?.location?.name ?? ''}
                      </Text>
                      <Text style={styles.stopTime}>
                        Arrival Time: {currentHour}:
                        {stop?.time?.toString().padStart(2, '0') ?? ''}
                      </Text>
                    </View>
                  ))}
              </ScrollView>
            </View>

            <View style={{alignItems: 'center'}}>
              <TouchableOpacity
                onPress={handleDelete}
                style={{
                  backgroundColor: COLOR.btn_secondary,
                  padding: 12,
                  borderRadius: 10,
                  marginTop: 20,
                  width: '60%',
                }}>
                <Text
                  style={{
                    color: COLOR.text_dark,
                    textAlign: 'center',
                    fontWeight: 'bold',
                  }}>
                  Delete Bus
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* <View> */}
        <TouchableOpacity style={styles.plusButton} onPress={handleAddBus}>
          <Icon name="add" size={30} color="#000" />
        </TouchableOpacity>
        {/* </View> */}
        </>)}

        {isBottomSheetOpen && (
          <AddBusScreen
            handleClose={handleClose}
          />
        )}


        
        
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
  stopItem: {
    marginVertical: 8,
    borderBottomColor: COLOR.bg_tertiary,
    borderBottomWidth: 1,
    paddingBottom: 8,
  },
  stopName: {fontSize: 16, fontWeight: '600', color: COLOR.text_secondary},
  stopTime: {fontSize: 14, color: COLOR.text_tertiary},
  errorText: {padding: 20, color: 'red'},
  plusButton: {
    position: 'absolute',
    bottom: 100,
    right: 30,
    backgroundColor: COLOR.text_secondary,
    borderRadius: 30,
    width: 60,
    height: 60,
    padding: 15,
    elevation: 2,
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

export default AdminBusManageScreen;
