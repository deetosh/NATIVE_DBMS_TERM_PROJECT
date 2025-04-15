import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView } from 'react-native';
import { callAPI } from '../../services/callApi';
import Loader from '../../molecules/Loader';
import { COLOR } from '../../constants';
import { BottomSheetFlatList, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import  Icon  from 'react-native-vector-icons/Ionicons';

type Props = {
  busId: string | null;
  busNumber: string;
};

export default function BusDetails({ busId, busNumber }: Props) {
  const [busData, setBusData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const currentHour = new Date().getHours();

  useEffect(() => {
    const fetchBusDetails = async () => {
      if (!busId) return;
      setLoading(true);
      try {
        const response = await callAPI('/bus/getById', 'GET', {}, { busId });
        if (!response.isError) {
          let data=response.data;
          data = converttotime(data);
          // sort the stoppages by time in ascending order by finding the current time and appending minutes to it and then sorting according to the current time which is closest first
          // const currentTime = new Date();
          // const currentMinutes = currentTime.getMinutes();
          // const sortedStoppages = data.stoppage.sort((a: any, b: any) => {
          //   const aTime = (a.time < currentMinutes)?a.time +60: a.time ;
          //   const bTime = (b.time < currentMinutes)?b.time +60: b.time ;
          //   return aTime - bTime;
          // });
          data.stoppage.sort((a: any, b: any) => {
            return a.time - b.time;
          });
          setBusData(data);

          // setBusData(response.data);
        }
      } catch (err) {
        console.error('Error fetching bus details:', err);
      } finally {
        setLoading(false);
      }
    };
    const converttotime = (data:any) => {
      const currentTime = new Date();
      const currentMinutes = currentTime.getMinutes();
      data.stoppage.forEach((stop: any) => {
        if (stop.time < currentMinutes) {
          stop.time += 60;
        }
      });
      return data;
    }

    fetchBusDetails();
  }, [busId]);

  return (
    <View style={styles.container} >
      <Text style={styles.title}>Bus Number: {busNumber}</Text>
      <Loader visible={loading} />

      {!loading && busData && (
        <>
          <Text style={styles.label}>Driver</Text>
          <TextInput
            style={styles.disabledInput}
            value={busData?.driver?.username ?? ''}
            editable={false}
          />

          <Text style={styles.label}>Stoppages</Text>
          <View style={styles.stoppageContainer}>
            <BottomSheetScrollView>
            {busData?.stoppage?.map((stop: any, index: number) => (
              <View key={index} style={styles.stopItem} >
                {index==0 && <Text style={{color:`${COLOR.golden}`, fontSize:14}}>Next Expected Stoppage</Text>}
                <View style={{display:'flex', flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                  <Text style={styles.stopText}>
                    Location: {stop?.location?.name ?? ''}
                    
                  </Text>
                  {index===0 && <Icon name="location" size={30} color={COLOR.golden} />}
                </View>
                <Text style={styles.stopText}>
                  Arrival Time: {currentHour >= 7 && currentHour <= 18 ? currentHour +Math.floor(stop.time/60): 7}
                  :{((stop?.time)%60).toString().padStart(2, '0') ?? ''}
                </Text>
              </View>
            ))}
            </BottomSheetScrollView>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: COLOR.bg_primary,
    marginBottom: 100,
    flex: 1,
    minHeight: 500
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLOR.golden,
    textAlign: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    color: COLOR.golden,
    marginBottom: 6,
  },
  disabledInput: {
    // height: 45,
    borderColor: COLOR.bg_tertiary,
    backgroundColor: COLOR.bg_primary,
    borderWidth: 0.5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginBottom: 16,
    color: COLOR.text_primary,
    fontSize: 16,
  },
  stoppageContainer: {
    borderWidth: 0.5,
    borderColor: COLOR.bg_tertiary,
    borderRadius: 10,
    padding: 10,
    height: 300,
  },
  stopItem: {
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderColor: COLOR.bg_tertiary,
  },
  stopText: {
    fontSize: 14,
    color: COLOR.text_secondary,
  },
});
