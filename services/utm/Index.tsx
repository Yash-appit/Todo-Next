import httpClient from "../api-interceptor/httpClient";



export const utm = async (payload: any) => {
    try {
      const response = await httpClient.post(`v1/dashboard/add-utm-details`,
        payload,
        {
          headers: { "Content-type": "application/json" },
        }
      );
      // _setAfterLoginCredentials(response);
      return response;
    } catch (error) {
     throw error;
    }
  };