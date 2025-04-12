import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  Button,
} from 'react-native';
import Addbusform from './addbusform';
import {callAPI} from '../../services/callApi';

type Bus = {
  id: string;
  name: string;
  route: string[];
};

type Location = {
  id: string;
  name: string;
};

const BusListScreen = () => {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [showBusDetails, setShowBusDetails] = useState(false);
  const [showAddBusModal, setShowAddBusModal] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      // Fetch buses and locations from API
      // const busData = await api.get('/buses');
      // const locationData = await api.get('/locations');

      // Placeholder data
      const busData = [
        {id: '1', name: 'Bus A', route: ['Stop 1', 'Stop 2', 'Stop 3']},
        {id: '2', name: 'Bus B', route: ['Stop 2', 'Stop 4']},
      ];
      const locationData = [
        {id: '1', name: 'Stop 1'},
        {id: '2', name: 'Stop 2'},
        {id: '3', name: 'Stop 3'},
        {id: '4', name: 'Stop 4'},
      ];

      setBuses(busData);
      setLocations(locationData);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBusPress = (bus: Bus) => {
    setSelectedBus(bus);
    setShowBusDetails(true);
  };

  const handleDeleteBus = async (busId: string) => {
    try {
      const response = await callAPI(`/bus/delete`, 'DELETE', null, {
        id: busId,
      });

      if (response?.isError) {
        Alert.alert('Error', response.message || 'Failed to delete the bus.');
        return;
      }

      setBuses(prev => prev.filter(b => b.id !== busId));
      setShowBusDetails(false);
      Alert.alert('Deleted', 'Bus has been deleted.');
    } catch (err) {
      console.error('Delete Bus Error:', err);
      Alert.alert('Error', 'Something went wrong while deleting the bus.');
    }
  };

  const renderBusItem = ({item}: {item: Bus}) => (
    <TouchableOpacity
      style={styles.busItem}
      onPress={() => handleBusPress(item)}>
      <Text style={styles.busName}>{item.name}</Text>
      <Text style={styles.route}>Route: {item.route.join(' → ')}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={buses}
        keyExtractor={item => item.id}
        renderItem={renderBusItem}
        contentContainerStyle={styles.list}
        ListFooterComponent={
          selectedBus && showBusDetails ? (
            <View style={styles.detailsCard}>
              <Text style={styles.modalTitle}>{selectedBus.name}</Text>
              <Text style={styles.routeTitle}>Route:</Text>
              {selectedBus.route.map((stop, index) => (
                <Text key={index} style={styles.routeItem}>
                  {index + 1}. {stop}
                </Text>
              ))}
              <View style={styles.detailsButtonRow}>
  <View style={styles.buttonWrapper}>
    <Button
      title="Delete"
      color="red"
      onPress={() => handleDeleteBus(selectedBus.id)}
    />
  </View>
  <View style={styles.buttonWrapper}>
    <Button title="Close" onPress={() => setShowBusDetails(false)} />
  </View>
</View>

            </View>
          ) : null
        }
      />

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowAddBusModal(true)}>
        <Text style={styles.addButtonText}>Add Bus</Text>
      </TouchableOpacity>

      {/* Custom Add Bus Modal */}
      <Addbusform
        visible={showAddBusModal}
        onClose={() => setShowAddBusModal(false)}
      />
    </View>
  );
};

export default BusListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  list: {
    padding: 16,
  },
  busItem: {
    backgroundColor: '#eee',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  busName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  route: {
    marginTop: 4,
    color: '#000',
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    margin: 16,
    position: 'relative',
    top: -100,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 24,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#000',
  },
  routeTitle: {
    fontWeight: '600',
    marginBottom: 8,
    color: '#000',
  },
  routeItem: {
    marginBottom: 4,
    color: '#000',
  },
  detailsContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  detailsCard: {
    backgroundColor: '#f2f2f2',
    padding: 20,
    borderRadius: 10,
    marginTop: 12,
    marginBottom: 32,
  },
  detailsButtonContainer: {
    marginTop: 12,
  },
  detailsButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 10,
  },
  buttonWrapper: {
    flex: 1,
  },
  
});
