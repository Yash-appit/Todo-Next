import httpClient from '../api-interceptor/httpClient';

export const addResume = async (payload: any) => {
    try {
      const response = await httpClient.post(`v1/resume/addResume`,
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

  export const UploadImage = async (file: File, type: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
  
    try {
      const response = await fetch("https://do.todoresume.com/api/v1/uploads/uploadFile", {
        method: "POST",
        body: formData,
      });

      
  
      if (!response.ok) {
        console.error("Failed to upload image:", response.statusText);
        return null;
      }
  
      const data = await response.json();

      // console.log(data);
      
  
      if (data.data && data.data.url) {
        // console.log("Image upload response:", data.data.url);
        return data.data.url; // Return the image URL
      } else {
        // console.error("Unexpected API response format:", data);
        return null;
      }
    } catch (error) {
      console.error("Error during image upload:", error);
      throw error;
    }
  };
  
  
  export const ResumesList = async (page: number) => {
    try {
      const response = await httpClient.get(`/v1/resume/resumes?getPage=${page}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  export const GenerateResume = async (payload: any) => {
    try {
      const response = await httpClient.post(`v1/resume/updateAndGenerateResume`,
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



  export const DeleteResume = async (payload: any) => {
    try {
      const response = await httpClient.delete(`v1/resume/deleteResume`, {
        data: payload,
        headers: { "Content-type": "application/json" },
      });
      return response;
    } catch (error:any) {
      throw new Error(error);
    }
  };



  export const DownloadResume = async (payload: any): Promise<void> => {
    try {
        // Request the stream
        const response = await httpClient.post(`v1/resume/downloadResume`, payload, {
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
        let defaultFilename = 'resume.pdf';
        if (payload.type === 'document') {
            defaultFilename = 'resume.doc';
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
  


export const suggestionList = async () => {
  try {
    const response = await httpClient.get(`/v1/prompts/getTagSuggestions`);
    return response.data;
  } catch (error) {
    throw error;
  }
};


export const TipsList = async () => {
  try {
    const response = await httpClient.get(`/v1/resume/resume-tips`);
    return response.data;
  } catch (error) {
    throw error;
  }
};



export const pinResume = async (payload: any) => {
  try {
    const response = await httpClient.patch(`v1/resume/resume-pin`,
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


export const AiWriter = async (payload: any) => {
  try {
    const response = await httpClient.post(`v1/ai/writer`,
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




export const GetFeatures = async () => {
  try {
    const response = await httpClient.get(`v1/ai/features`);
    return response.data;
  } catch (error) {
    throw error;
  }
};




export const GetCredits = async () => {
  try {
    const response = await httpClient.get(`v1/ai/credits`);
    return response.data;
  } catch (error) {
    throw error;
  }
};


export const resumeShareableLink = async (params : any) => {
  try {
    const response = await httpClient.get('/v1/dashboard/resume-shareable-link', {
      headers: { "Content-type": "application/json" },
      params,
    });
    return response;
  } catch (error) {
    throw error;
  }
};