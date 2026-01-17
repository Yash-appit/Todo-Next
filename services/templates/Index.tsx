import httpClient from '../api-interceptor/httpClient';

export const templateList = async () => {
    try {
      const response = await httpClient.get(`/v1/resume/template`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };
