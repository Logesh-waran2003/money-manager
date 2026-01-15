import React, { createContext, useContext, useState } from "react";

interface UnprocessedContextType {
  count: number;
  setCount: (count: number) => void;
  refresh: () => void;
  triggerRefresh: number;
}

const UnprocessedContext = createContext<UnprocessedContextType>({
  count: 0,
  setCount: () => {},
  refresh: () => {},
  triggerRefresh: 0,
});

export const UnprocessedProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [count, setCount] = useState(0);
  const [triggerRefresh, setTriggerRefresh] = useState(0);

  const refresh = () => setTriggerRefresh((prev) => prev + 1);

  return (
    <UnprocessedContext.Provider
      value={{ count, setCount, refresh, triggerRefresh }}
    >
      {children}
    </UnprocessedContext.Provider>
  );
};

export const useUnprocessedContext = () => useContext(UnprocessedContext);
