import httpClient from '../api-interceptor/httpClient';

export const blogList = async () => {
    try {
      const response = await httpClient.get(`/v1/setting/blog/list`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };


  
  export const fetchBlogDetails = async (slug: string) => {
    try {
      const response = await httpClient.get(`/v1/setting/blog`, {
        headers: { "Content-type": "application/json" },
        params: { slug }, // Dynamically pass the 'type' parameter here
      });
      return response;
    // console.log(response);
    } catch (error) {
      throw error;
    }
  };
  