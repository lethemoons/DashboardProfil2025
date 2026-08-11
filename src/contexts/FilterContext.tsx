import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

interface FilterContextType {
  year: number;
  setYear: (year: number) => void;
  availableYears: number[];
  refreshYears: () => Promise<void>;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [year, setYear] = useState<number>(2025);
  const [availableYears, setAvailableYears] = useState<number[]>([2025]);

  const refreshYears = async () => {
    try {
      const res = await api.get('/years');
      if (res.data && res.data.length > 0) {
        setAvailableYears(res.data);
        if (!res.data.includes(year)) {
          setYear(res.data[res.data.length - 1]); // Set to most recent
        }
      }
    } catch (err) {
      console.error('Failed to fetch years', err);
    }
  };

  useEffect(() => {
    refreshYears();
  }, []);

  return (
    <FilterContext.Provider value={{ year, setYear, availableYears, refreshYears }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFilter() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error('useFilter must be used within a FilterProvider');
  }
  return context;
}
