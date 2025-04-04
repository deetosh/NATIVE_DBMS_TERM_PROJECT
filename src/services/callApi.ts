import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { BACKEND_URL } from "../secret";

export const callAPI = async (
  URL: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "POST",
  body: any = null,
  params: any = null
) => {
  try {
    const base_url = `${BACKEND_URL}/api/v1`;

    // Get token from AsyncStorage
    const token = await AsyncStorage.getItem("accessToken") ?? '';

    // Axios config
    const config = {
      url: base_url + URL,
      method: method,
      data: method !== "GET" ? body : undefined,
      params: params || undefined,
      headers: token ? { "x-access-token": token } : {},
    };
    console.log("API Config:", config);
    const response = await axios(config);
    const data = response.data;

    if (data.status === 401) {
      console.log("Unauthorized");
      return { redirect: true }; // Handle redirection in the calling function
    }

    return {
      status: data?.status || null,
      message: data?.message || null,
      data: data?.data || null,
      isError: data?.error || false,
    };
  } catch (error: any) {

    if (error.response?.status === 401) {
      console.log("Unauthorized");
    //   return { redirect: true }; // Handle redirection in the calling function
    }

    console.log("Error response:", error.response);

    return {
      status: error.response?.data?.status || null,
      message: error.response?.data?.message || "Something went wrong",
      data: null,
      isError: true,
    };
  }
};
