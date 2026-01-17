import httpClient from "../api-interceptor/httpClient";

export const CVTemplateList = async () => {
    try {
      const response = await httpClient.get(`/v1/resume/coverletter-template-list`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };


  export const addCoverLetter = async (payload: any) => {
    try {
      const response = await httpClient.post(`/v1/resume/add-cover-letter`,
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


  export const UpdateCV = async (payload: any) => {
    try {
      const response = await httpClient.patch(`/v1/resume/update-cover-letter`,
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



  export const CoverLetterList = async () => {
    try {
      const response = await httpClient.get(`/v1/resume/cover-letter-list`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };


//   export const DeleteCoverLetter = async (cover_letter_id: number) => {
//     try {
//       const response = await httpClient.delete(`/v1/resume/delete-cover-letter/${cover_letter_id}`, {
//         headers: { "Content-type": "application/json" },
//       });
//       return response;
//     } catch (error) {
//       throw new Error(error);
//     }
// };



export const DeleteCoverLetter = async (cover_letter_id: number) => {
  try {
    const response = await httpClient.delete('/v1/resume/delete-cover-letter', {
      headers: { "Content-type": "application/json" },
      params: { cover_letter_id },
    });
    return response;
  } catch (error) {
    throw error;
  }
};


export const DownloadCoverLetter = async (payload: any): Promise<void> => {
  try {
      // Request the stream
      const response = await httpClient.post(`v1/resume/download-cover-Letter`, payload, {
          headers: { "Content-type": "application/json" },
          responseType: "blob", // Ensure response is treated as binary data
      });

      // Check if the response is valid
      if (!response.data) {
          throw new Error("No data received from server");
      }

      const blob = new Blob([response.data], { 
          type: response.headers['content-type'] || 'application/octet-stream' 
      });

      const downloadUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = downloadUrl;
      const contentDisposition = response.headers['content-disposition'];
      
      // Default filename based on payload type
      let defaultFilename = 'CoverLetter.pdf';
      if (payload.type === 'document') {
          defaultFilename = 'CoverLetter.doc';
      }
      
      const fileName = contentDisposition
          ? contentDisposition.split('filename=')[1]?.replace(/["']/g, '') || defaultFilename
          : defaultFilename;

      link.setAttribute('download', fileName);
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(downloadUrl);
  } catch (error) {
      // Enhanced error logging
      if (error instanceof Error) {
          console.error("Error downloading resume:", {
            error: error,
          });
      } else {
          console.error("Unknown error occurred while downloading resume:", error);
      }
      
      // You can also show a user-friendly error message
      // alert("Failed to download resume. Please try again later.");
      
      throw error;
  }
};