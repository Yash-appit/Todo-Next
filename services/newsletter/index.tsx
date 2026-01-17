import httpClient from '../api-interceptor/httpClient';

  export const AddNewsletter = async (payload: any) => {
    try {
      const response = await httpClient.post(`/v1/newsletter/addNewsletter`,
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
  


  export const NewsletterContent = async () => {
    try {
      const response = await httpClient.get(`/v1/newsletter/listNewsletter`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };