import httpClient from '../api-interceptor/httpClient';

export const BuyAiCredits = async (payload: any) => {
    try {
      const response = await httpClient.post(`v1/ai/create-ai-orderid`,
        payload,
        {
          headers: { 
            "Content-type": "application/json",
            "Cache-Control": "no-cache" // Added no-cache control
          },
        }
      );
      return response;
    } catch (error) {
     throw error;
    }
  };
  
  
  
  
  export const GetCreditsPlans = async () => {
    try {
      const response = await httpClient.get(`v1/membership/get-aicredit-plans`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };