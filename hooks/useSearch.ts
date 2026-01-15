import { useMemo, useState } from "react";

export const useSearch = <T>(
  data: T[],
  searchFields: (item: T) => string[]
) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;

    const query = searchQuery.toLowerCase();
    return data.filter((item) => {
      const fields = searchFields(item);
      return fields.some((field) => field.toLowerCase().includes(query));
    });
  }, [data, searchQuery, searchFields]);

  return { searchQuery, setSearchQuery, filteredData };
};
