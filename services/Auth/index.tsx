import httpClient from '../api-interceptor/httpClient';


export const login = async (payload: any) => {
    try {
      const response = await httpClient.post(`v1/auth/login`,
        payload,
        {
          headers: { "Content-type": "application/json" },
        }
      );

      _setAfterLoginCredentials(response);
      
      return response;
    } catch (error) {
  
     throw error;
    }
  };



  export const reg = async (payload: any) => {
    try {
      const response = await httpClient.post(`v1/auth/register`,
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




  export const SocialLogin = async (payload: any) => {
    try {
      const response = await httpClient.post(`v1/auth/socialloginAndregister`,
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
  


  const setToLocalStorage = (key: string, value: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
  };



  export const _setAfterLoginCredentials = (response: any) => {
    const { token } = response.data;

    if (token){
    setToLocalStorage("token", token);
  }
  };




  export const forget = async (payload: any) => {
    try {
      const response = await httpClient.post(`v1/auth/forgotPassword`,
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



  export const Resend = async (payload: any) => {
    try {
      const response = await httpClient.post(`v1/auth/resendMail`,
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



  export const ResetPassword = async (payload: any) => {
    try {
      const response = await httpClient.patch(`v1/auth/resetPassword`,
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