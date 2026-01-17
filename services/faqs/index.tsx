import httpClient from '../api-interceptor/httpClient';

export const fetchFaqPageData = async (type: string) => {  // Accept 'type' as a parameter
  try {
    // console.log("Calling API with type:", type);
    const response = await httpClient.get('v1/setting/faqs', {
      headers: { "Content-type": "application/json" },
      params: { type },
    });
    // console.log("API response:", response);
    return response;
  } catch (error: any) {
    // console.error("Error fetching FAQ data:", error.message || error);
    throw new Error("Error fetching FAQ data");
  }
};



export const fetchAllFaq = async () => {  // Accept 'type' as a parameter
  try {
    // console.log("Calling API with type:", type);
    const response = await httpClient.get('v1/setting/all-faqs', {
      headers: { "Content-type": "application/json" }
    });
    // console.log("API response:", response);
    return response;
  } catch (error: any) {
    // console.error("Error fetching FAQ data:", error.message || error);
    throw new Error("Error fetching FAQ data");
  }
};
