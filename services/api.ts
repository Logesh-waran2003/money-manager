import axios, { AxiosError } from "axios";

const API_Base_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "https://money-manager-go-be-production.up.railway.app";
const TEST_USER_ID = "123e4567-e89b-12d3-a456-426614174000";

const api = axios.create({
  baseURL: API_Base_URL,
  headers: {
    "Content-Type": "application/json",
    "X-User-ID": TEST_USER_ID,
  },
});

// Standardized error handler
const handleApiError = (error: any, context: string) => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    const statusCode = axiosError.response?.status;
    const message =
      (axiosError.response?.data as any)?.message || axiosError.message;

    console.error(`[API Error] ${context}:`, {
      status: statusCode,
      message: message,
      path: axiosError.config?.url,
    });

    if (statusCode === 401 || statusCode === 403) {
      // Logic for session expiration could go here
    }
  } else {
    console.error(`[Unexpected Error] ${context}:`, error.message || error);
  }
};

export const syncTransactions = async (transactions: any[]) => {
  try {
    const response = await api.post("/api/v1/sync", transactions);
    return response.data;
  } catch (error) {
    handleApiError(error, "Sync Transactions");
    throw error;
  }
};

export const getAiSuggestions = async () => {
  try {
    const response = await api.get("/api/v1/analyze");
    return response.data;
  } catch (error) {
    handleApiError(error, "Get AI Suggestions");
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
    handleApiError(error, "Apply Mapping");
    throw error;
  }
};

export default api;
