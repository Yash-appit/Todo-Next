import httpClient from '../api-interceptor/httpClient';

export const getDashboard = async () => {
    try {
      const response = await httpClient.get(`/v1/dashboard/getDashboard`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };



  export const getAccountDetail = async () => {
    try {
      const response = await httpClient.get(`/v1/users/getUserProfile`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };


  export const SendAccountDetail = async (payload: any) => {
    try {
      const response = await httpClient.patch(`/v1/users/updateUserProfile`,
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


  export const PaymentDetails = async () => {
    try {
      const response = await httpClient.get(`/v1/dashboard/paymentDetails`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };



  export const AtsCheck = async (formData:any) => {
    try {
      const response = await httpClient.post(
        `/v1/ats/atsChecker`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data" // Changed to handle file upload
          }
        }
      );
      return response;
    } catch (error) {
      throw error;
    }
  };