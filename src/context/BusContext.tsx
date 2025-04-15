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
  getAllBusesMatchingLocationFromStorage: (locationId: string) => Promise<any | null>;

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
  const getAllBusesMatchingLocationFromStorage= async (locationId: string) => {
    try {
      const storedData = await AsyncStorage.getItem(BUS_DATA_KEY);
      if (storedData) {
        const parsedData = JSON.parse(storedData).filter((bus: Bus) => {
          return bus.stoppage.some((stop: Stop) => stop.location._id === locationId);
        });
        return parsedData;
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
