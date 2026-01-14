import axios from "axios";

// Placeholder URL - User needs to replace this
const API_URL = "https://money-manager-go-be-production.up.railway.app";
const TEST_USER_ID = "123e4567-e89b-12d3-a456-426614174000";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "X-User-ID": TEST_USER_ID,
  },
});

export const syncTransactions = async (transactions: any[]) => {
  try {
    // Backend expects a top-level array, not an object with a "transactions" key
    const response = await api.post("/api/v1/sync", transactions);
    return response.data;
  } catch (error: any) {
    console.error("Sync failed:", error);
    if (error.response) {
      console.error(
        "Error data:",
        JSON.stringify(error.response.data, null, 2)
      );
    }
    throw error;
  }
};

export const getAiSuggestions = async () => {
  try {
    const response = await api.get("/api/v1/analyze");
    return response.data;
  } catch (error) {
    console.error("Get suggestions failed:", error);
    throw error;
  }
};

export const applyMapping = async (mapping: {
  transaction_id: string;
  new_category: string;
  new_merchant: string;
  create_rule: boolean;
}) => {
  try {
    const response = await api.post("/api/v1/transactions/map", mapping);
    return response.data;
  } catch (error) {
    console.error("Apply mapping failed:", error);
    throw error;
  }
};

export default api;
