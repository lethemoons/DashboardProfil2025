import React, { createContext, useContext, useState } from 'react';

interface FilterContextType {
  year: number;
  setYear: (year: number) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [year, setYear] = useState<number>(2025);

  return (
    <FilterContext.Provider value={{ year, setYear }}>
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
