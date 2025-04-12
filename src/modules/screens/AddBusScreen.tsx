import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Button, Alert, ScrollView } from 'react-native';
import { callAPI } from '../../services/callApi';
import Loader from '../../molecules/Loader';
import { COLOR } from '../../constants';
import { BottomSheetModalProvider, BottomSheetModal } from '@gorhom/bottom-sheet';
import Addbusform from './addbusform';

const AddBusScreen = () => {
  const [busData, setBusData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const bottomSheetRef = useRef<BottomSheetModal>(null);

  const fetchAllBuses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await callAPI(`/bus/get`, 'GET', {}, {});
      if (!response.isError) {
        setBusData(response.data);
      }
    } catch (err) {
      console.error('Error fetching bus details:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllBuses();
  }, [fetchAllBuses]);

  const handleAddBus = () => {
    setIsBottomSheetOpen(true);
    bottomSheetRef.current?.present();
  };

  const handleClose = () => {
    setIsBottomSheetOpen(false);
    bottomSheetRef.current?.dismiss();
    fetchAllBuses();
  };

  const handleDeleteBus = async (busId: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this bus?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await callAPI(`/bus/delete?id=${busId}`, 'DELETE', {}, {});
              if (!response.isError) {
                Alert.alert('Success', 'Bus deleted successfully.');
                fetchAllBuses();
              } else {
                Alert.alert('Error', 'Failed to delete the bus.');
              }
            } catch (error) {
              console.error('Delete failed:', error);
              Alert.alert('Error', 'An error occurred while deleting the bus.');
            }
          },
        },
      ]
    );
  };

  return (
    <BottomSheetModalProvider>
      <View style={styles.container}>
        <Text style={styles.title}>Admin - Bus Details</Text>
        <Loader visible={loading} />

        {!loading && busData.length > 0 ? (
          <ScrollView style={styles.busList}>
            {busData.map((bus: any) => (
              <View key={bus._id} style={styles.busItem}>
                <View style={styles.busInfoContainer}>
                  <View style={styles.busText}>
                    <Text style={styles.busNumber}>Bus Number: {bus.bus_number}</Text>
                    <Text style={styles.driver}>Driver: {bus.driver?.username || 'N/A'}</Text>
                  </View>
                  <Button title="Delete" onPress={() => handleDeleteBus(bus._id)} color="red" />
                </View>
              </View>
            ))}
            <Button title="Add New Bus" onPress={handleAddBus} color={COLOR.golden} />
          </ScrollView>
        ) : !loading ? (
          <Text style={styles.noBuses}>No buses available</Text>
        ) : null}

        

        <BottomSheetModal
          ref={bottomSheetRef}
          index={0}
          snapPoints={['50%']}
          onDismiss={() => setIsBottomSheetOpen(false)}
        >
          <Addbusform visible={isBottomSheetOpen} onClose={handleClose} />
        </BottomSheetModal>
      </View>
    </BottomSheetModalProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: COLOR.bg_primary,
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLOR.golden,
    textAlign: 'center',
    marginBottom: 16,
  },
  busList: {
    marginBottom: 16,
  },
  busItem: {
    marginVertical: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: COLOR.bg_tertiary,
    backgroundColor: COLOR.bg_secondary,
  },
  busInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  busText: {
    flex: 1,
    paddingRight: 10,
  },
  busNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLOR.text_primary,
  },
  driver: {
    fontSize: 14,
    color: COLOR.text_secondary,
  },
  noBuses: {
    fontSize: 16,
    color: COLOR.text_secondary,
    textAlign: 'center',
    marginVertical: 20,
  },
});

export default AddBusScreen;
