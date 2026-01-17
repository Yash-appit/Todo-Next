import httpClient from '../api-interceptor/httpClient';


export const fetchLegalPage = async (type: string) => {
  try {
    const response = await httpClient.get(`/v1/setting/legal/pages`, {
      headers: { "Content-type": "application/json" },
      params: { type }, // Dynamically pass the 'type' parameter here
    });
    return response;
  } catch (error) {
    throw new Error("Error fetching legal page data");
  }
};

