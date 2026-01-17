import httpClient from '../api-interceptor/httpClient';

export const packageList = async () => {
    try {
      const response = await httpClient.get(`/v1/membership/getMembership`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };


  export const packageBuy = async (payload: any) => {
    try {
      const response = await httpClient.post(`/v1/membership/createOrder`,
        payload,
        {
          headers: { "Content-type": "application/json" },
        }
      );
      return response;
    } catch (error) {
     throw error;
    }
  };



  export const TestBuy = async (payload: any) => {
    try {
      const response = await httpClient.post(`/v1/membership/create-resume-orderid`,
        payload,
        {
          headers: { "Content-type": "application/json" },
        }
      );
      return response;
    } catch (error) {
     throw error;
    }
  };


  // export const packageBuy= async () => {
  //   try {
  //     const response = await httpClient.post(`package/register-and-packagebuy`);
  //     return response.data;
  //   } catch (error) {
  //     throw error;
  //   }
  // };
