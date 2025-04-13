import React from 'react';
import { BusProvider } from './BusContext';

export const withBusProvider = (Component: React.ComponentType) => () => (
  <BusProvider>
    <Component />
  </BusProvider>
);