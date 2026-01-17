import httpClient from '../api-interceptor/httpClient';

export const EmailType = async () => {
    try {
      const response = await httpClient.get(`v1/ai/email-type`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };



  export const EmailTemplateGen = async (payload: any) => {
    try {
      const response = await httpClient.post(`/v1/ai/generate-email-template`,
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




  export const IndustryType = async () => {
    try {
      const response = await httpClient.get(`v1/ai/industry-type`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };



  export const JobDescription = async (payload: any) => {
    try {
      const response = await httpClient.post(`/v1/ai/generate-jd`,
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


  export const QuestionType = async () => {
    try {
      const response = await httpClient.get(`v1/ai/question-type`);
      return response.data;
    } catch (error) {
      throw error;
    }
  };



  export const GenerateQA = async (payload: any) => {
    try {
      const response = await httpClient.post(`/v1/ai/generate-qa`,
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





  export const CareerObjectiveGenerator = async (payload: any) => {

    try {
      const response = await httpClient.post(`/v1/ai/career-objective`,
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



  export const JDAnalyzer = async (payload: any) => {
    try {
      const response = await httpClient.post(`/v1/ai/jd-analyzer`,
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



  export const LinkedinBio = async (payload: FormData) => {
    try {
      const response = await httpClient.post(`/v1/ai/linkedin-bio`, payload, {
        headers: { 
          'Content-Type': 'multipart/form-data',
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  };



  export const CoverLetterGenerator = async (payload: any) => {
    try {
      const response = await httpClient.post(`/v1/resume/ai-cover-letter`,
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