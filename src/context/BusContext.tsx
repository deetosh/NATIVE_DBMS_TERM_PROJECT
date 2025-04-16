'use client';
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { callAPI } from '../services/callApi';

interface geometry {
  type: string;
  coordinates: number[];
}

interface Location {
  _id: string;
  name: string;
  geometry: geometry;
}

interface Stop {
  location: Location;
  time: number;
}

interface Driver {
  _id: string;
  username: string;
  role: string;
}

interface Bus {
  _id: string;
  bus_number: string;
  stoppage: [Stop];
  driver: Driver|null;
}

interface BusContextType {
  lastUpdated: string | null;
  getAllBusesFromStorage: () => Promise<any | null>;
  getBusDetailsFromStorage : (busId: string) => Promise<Bus | null>;
  getAllLocationsFromStorage: () => Promise<any | null>;
  getAllBusesMatchingLocationFromStorage: (start: string,destination:string) => Promise<any | null>;

}

const BusContext = createContext<BusContextType | null>(null);

export const useBusContext = () => {
  const context = useContext(BusContext);
  if (!context) {
    throw new Error('useBusContext must be used within a BusProvider');
  }
  return context;
};

const BUS_DATA_KEY = 'BUS_DATA';
const BUS_TIMESTAMP_KEY = 'BUS_TIMESTAMP';

const LOC_DATA_KEY = 'LOC_DATA';
const LOC_TIMESTAMP_KEY = 'LOC_TIMESTAMP';

interface BusProviderProps {
  children: ReactNode;
}

export const BusProvider: React.FC<BusProviderProps> = ({ children }) => {
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [locData, setLocData] = useState<string|null>(null);

  // Function to fetch and store buses data
  const fetchAndStoreBuses = async () => {

    try {
      const response = await callAPI('/bus/getAllBusDetails','GET');
      console.log('Response from API:', response);
      if (response.isError) {
        console.error('Error fetching bus data:', response.message);
        return;
      }
      const data = response.data;
      const timestamp = new Date().toISOString();
      console.log('Fetched bus data:', data);
      // Store fetched data in AsyncStorage
      await AsyncStorage.setItem(BUS_DATA_KEY, JSON.stringify(data));
      await AsyncStorage.setItem(BUS_TIMESTAMP_KEY, timestamp);
      console.log('Fetched bus data for client DB');
      setLastUpdated(timestamp);
    } catch (error) {
      console.error('Failed to fetch bus data:', error);
    }
  };

  const fetchAndStoreLocations = async () => {  
    try {
      const response = await callAPI('/location/get','GET');
      if (response.isError) {
        console.error('Error fetching bus data:', response.message);
        return;
      }
      const data = response.data;
      const timestamp = new Date().toISOString();
      // Store fetched data in AsyncStorage
      await AsyncStorage.setItem(LOC_DATA_KEY, JSON.stringify(data));
      await AsyncStorage.setItem(LOC_TIMESTAMP_KEY, timestamp);
      console.log('Fetched location data for client DB');
      setLastUpdated(timestamp);
    } catch (error) {
      console.error('Failed to fetch bus data:', error);
    }
  }

  const getAllBusesFromStorage = async () => {
    try {
      const storedData = await AsyncStorage.getItem(BUS_DATA_KEY);
      if (storedData) {
        const parsedData = JSON.parse(storedData).map((bus: Bus) => {
          return {
            _id: bus._id,
            bus_number: bus.bus_number,
          }
        });
        return parsedData;
      }
      return null;
    } catch (error) {
      console.error('Failed to load bus data from AsyncStorage:', error);
      return null;
    }
  };
  const getAllBusesMatchingLocationFromStorage= async (start: string,destination:string) => {
    try {
      const storedData = await AsyncStorage.getItem(BUS_DATA_KEY);
      if (storedData) {
        const buses = JSON.parse(storedData).filter((bus: Bus) => {
          const hasStart = bus.stoppage.some((stop: Stop) => stop.location._id === start);
          const hasDestination = bus.stoppage.some((stop: Stop) => stop.location._id === destination);
          return hasStart && hasDestination;
        });

        let busesDetails:any[] = [];
        const currentTime = new Date();
        const currentMinute = currentTime.getMinutes();

        buses.forEach((bus:any) => {
          let min_start_time = 1000;
          let min_end_time = 1000;
          let start_index = -1;
          let end_index = -1;

          console.log("bus: ", bus);

          bus.stoppage.forEach((stoppage:any,ind:number) => {
              
              if(stoppage.location._id.toString() === start) {
                  let time = stoppage.time;
                  if(time < currentMinute) time += 60;
                  if(time < min_start_time) {
                      min_start_time = time;
                      start_index = ind;
                  }
              }
          })

          console.log('strt_index: ', start_index);
          
          for(let i=start_index; i < bus.stoppage.length; i++) {
              if(bus.stoppage[i].location._id.toString() === destination) {
                  min_end_time = bus.stoppage[i].time - bus.stoppage[start_index].time + min_start_time;
                  end_index = i;
                  break;
              }
          }

          if(end_index===-1){
              for(let i=0;i< start_index; i++){
                  if(bus.stoppage[i].location._id.toString() === destination) {
                      min_end_time = 60 - bus.stoppage[start_index].time + bus.stoppage[i].time + min_start_time;
                      end_index = i;
                      break;
                  }
              }
          }

          busesDetails.push({
              bus_id: bus._id,
              bus_number: bus.bus_number,
              start_time: min_start_time,
              end_time: min_end_time
          })
        });

        if(busesDetails.length > 0) {
          busesDetails.sort((a, b) => {
            if (a.start_time === b.start_time) {
                return a.end_time - b.end_time;
            }
            return a.start_time - b.start_time;
          });
        }
        console.log('Buses matching location from local storage:', busesDetails);
        return busesDetails; 
      }
      return null;
    } catch (error) {
      console.error('Failed to load bus data from AsyncStorage:', error);
      return null;
    }
  }
  const getAllLocationsFromStorage = async () => {
    try {
      const storedData = await AsyncStorage.getItem(LOC_DATA_KEY);
      if (storedData) {
        const parsedData = JSON.parse(storedData).map((loc: Location) => {
          return {
            _id: loc._id,
            name: loc.name,
          }
        });
        return parsedData;
      }
      return null;
    }
    catch (error) {
      console.error('Failed to load location data from AsyncStorage:', error);
      return null;
    }
  }

  const getBusDetailsFromStorage = async (busId: string) => {
    try {
      const storedData = await AsyncStorage.getItem(BUS_DATA_KEY);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        const busDetails = parsedData.find((bus: Bus) => bus._id === busId);
        return busDetails || null;
      }
      return null;
    }
    catch (error) {
      console.error('Failed to load bus data from AsyncStorage:', error);
      return null;
    }
  };

  // Initialize data (load from storage and fetch if needed)
  useEffect(() => {
    const initialize = async () => {
      // if stale by 1 hour then only fetch new data
      let isStale = true;
      const storedTimestamp = await AsyncStorage.getItem(BUS_TIMESTAMP_KEY);
      if(storedTimestamp) {
        const currentTime = new Date().toISOString();
        isStale = (new Date(currentTime).getTime() - new Date(storedTimestamp).getTime()) > 3600000;
      }
      if(isStale) {
        await fetchAndStoreBuses();
      }

      isStale = true;
      const storedLocTimestamp = await AsyncStorage.getItem(LOC_TIMESTAMP_KEY);
      if(storedLocTimestamp) {
        const currentTime = new Date().toISOString();
        isStale = (new Date(currentTime).getTime() - new Date(storedLocTimestamp).getTime()) > 3600000;
      }
      if(isStale) {
        await fetchAndStoreLocations();
      }
    };
    initialize();
  }, []); // Re-run effect if buses state changes

  return (
    <BusContext.Provider value={{lastUpdated, getAllBusesFromStorage, getBusDetailsFromStorage, getAllLocationsFromStorage, getAllBusesMatchingLocationFromStorage}}>
      {children}
    </BusContext.Provider>
  );
};
