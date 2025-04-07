// components/BusDetails.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { callAPI } from '../../services/callApi'; // replace with your actual API helper
import Loader from '../../molecules/Loader';

const BusDetails = ({ busId }: { busId: string }) => {
  const [busData, setBusData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const currentHour = new Date().getHours();

  useEffect(() => {
    const fetchBus = async () => {
      try {
        const response = await callAPI(`/bus/getById`, 'GET',{},{busId: busId});
        setBusData(response.data);
      } catch (err) {
        console.error('Failed to fetch bus details', err);
      } finally {
        setLoading(false);
      }
    };

    if (busId) fetchBus();
  }, [busId]);

  if (loading) {
    return <Loader visible={loading} />;
  }

  if (!busData) {
    return <Text style={styles.errorText}>No bus data found.</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bus Details</Text>
      <Text style={styles.info}>Bus Number: {busData.bus_number}</Text>
      <Text style={styles.info}>Driver: {busData.driver?.username}</Text>

      {busData.stoppage.map((stop: any, index: number) => (
        <View key={index} style={styles.stopItem}>
          <Text style={styles.stopName}>Location: {stop.location.name}</Text>
          <Text style={styles.stopTime}>
            Arrival Time: {currentHour}:{stop.time.toString().padStart(2, '0')}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: 'white', padding: 16, height: 300 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  info: { fontSize: 16, marginBottom: 8 },
  stopItem: {
    marginVertical: 8,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
    paddingBottom: 8,
  },
  stopName: { fontSize: 16, fontWeight: '600' },
  stopTime: { fontSize: 14, color: 'gray' },
  errorText: { padding: 20, color: 'red' },
});

export default BusDetails;
