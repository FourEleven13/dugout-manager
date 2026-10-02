import { createContext, useContext, useEffect, useState } from "react";

export type Drill = {
  id: string;
  name: string;
  description: string;
};

type DrillsContextValue = {
  drills: Drill[];
  addDrill: (drill: Drill) => void;
  deleteDrill: (id: string) => void;
};

const DrillsContext = createContext<DrillsContextValue | undefined>(undefined);

export function DrillsProvider({ children }: { children: React.ReactNode }) {
  const [drills, setDrills] = useState<Drill[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("dugout_drills");
    if (stored) setDrills(JSON.parse(stored));
  }, []);

  const persist = (updated: Drill[]) => {
    localStorage.setItem("dugout_drills", JSON.stringify(updated));
    setDrills(updated);
  };

  const addDrill = (drill: Drill) => {
    persist([...drills, drill]);
  };

  const deleteDrill = (id: string) => {
    persist(drills.filter((d) => d.id !== id));
  };

  return (
    <DrillsContext.Provider value={{ drills, addDrill, deleteDrill }}>
      {children}
    </DrillsContext.Provider>
  );
}

export function useDrills() {
  const ctx = useContext(DrillsContext);
  if (!ctx) throw new Error("useDrills must be used within DrillsProvider");
  return ctx;
}
