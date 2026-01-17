import httpClient from '../api-interceptor/httpClient';

export const experinceList = async () => {
    try {
      const response = await httpClient.get(`/v1/rsp/experince-list`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };



  export const PackList = async (exp_id: string) => {
    try {
      const response = await httpClient.get(`v1/rsp/plans`, {
        headers: { "Content-type": "application/json" },
        params: { exp_id }, // Dynamically pass the 'type' parameter here
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };



//   export const resumeWriterDetails = async (payload) => {
//     try {
//         const response = await httpClient.post(
//             `v1/membership/add-resumewriter-details`,
//             payload,
//             {
//                 headers: { 
//                     // Don't set Content-Type for FormData - let browser set it with boundary
//                     "Cache-Control": "no-cache"
//                 },
//             }
//         );
//         return response;
//     } catch (error) {
//         throw error;
//     }
// };



export const PackageBuy = async (payload: any) => {
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
  


export const WriterDetails = async (payload: any) => {
  try {
    const response = await httpClient.post(`/v1/membership/add-resumewriter-details`,
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
  


export const WritingList = async () => {
    try {
      const response = await httpClient.get(`/v1/membership/resume-writer-list`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };



  export const ResumeDetails = async (payload: any) => {
    try {
      const response = await httpClient.post(`/v1/membership/submit-resume-details`,
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




  export const Approval = async (payload: any) => {
    try {
      const response = await httpClient.post(`/v1/membership/resume-approval`,
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



  export const SendQuery = async (payload: any) => {
    try {
      const response = await httpClient.post(`/v1/membership/submit-resume-query`,
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
  
  