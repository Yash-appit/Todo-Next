import httpClient from '../api-interceptor/httpClient';

export const contact = async (payload: any) => {
  try {
    const response = await httpClient.post(
      `/v1/setting/contact/createTicket`, // Updated URL
      payload,
      {
        headers: { "Content-type": "application/json" },
      }
    );
    return response;
  } catch (error) {
    throw error; // Re-throwing the error for further handling
  }
};


export const feedback = async (payload: any) => {
  try {
    const response = await httpClient.post(
      `v1/setting/submit-feedback`, // Updated URL
      payload,
      {
        headers: { "Content-type": "application/json" },
      }
    );
    return response;
  } catch (error) {
    throw error; // Re-throwing the error for further handling
  }
};
