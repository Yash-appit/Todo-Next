import { createContext, useContext, useState, ReactNode } from 'react';

interface StepperContextProps {
  activeStep: number;
  setActiveStep: (step: number) => void;
  resumeData: object;
  setResumeData: (data: object) => void;
  step1: boolean;
  setStep1: (status: boolean) => void;
  step2: boolean;
  setStep2: (status: boolean) => void;
  step3: boolean;
  setStep3: (status: boolean) => void;
  step4: boolean;
  setStep4: (status: boolean) => void;
  step5: boolean;
  setStep5: (status: boolean) => void;
  step6: boolean;
  setStep6: (status: boolean) => void;
  step7: boolean;
  setStep7: (status: boolean) => void;
  step8: boolean;
  setStep8: (status: boolean) => void;
  show: boolean;
  setShow: (status: boolean) => void;
}

const StepperContext = createContext<StepperContextProps | undefined>(undefined);

interface StepperProviderProps {
  children: ReactNode;
}

export const StepperProvider = ({ children }: StepperProviderProps) => {
  const [activeStep, setActiveStep] = useState(0);
  const [resumeData, setResumeData] = useState({});
  const [step1, setStep1] = useState(true);
  const [step2, setStep2] = useState(true);
  const [step3, setStep3] = useState(true);
  const [step4, setStep4] = useState(true);
  const [step5, setStep5] = useState(true);
  const [step6, setStep6] = useState(true);
  const [step7, setStep7] = useState(true);
  const [step8, setStep8] = useState(true);
  const [show, setShow] = useState(false);

  return (
    <StepperContext.Provider value={{
      activeStep, setActiveStep, resumeData, setResumeData,
      step1, setStep1, step2, setStep2, step3, setStep3, step4, setStep4,
      step5, setStep5, step6, setStep6, step7, setStep7, step8, setStep8,
      show, setShow
    }}>
      {children}
    </StepperContext.Provider>
  );
};

export const useStepperContext = () => {
  const context = useContext(StepperContext);
  if (!context) {
    throw new Error("useStepperContext must be used within a StepperProvider");
  }
  return context;
};
