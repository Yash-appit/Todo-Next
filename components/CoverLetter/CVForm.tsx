import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import { Box } from '@mui/material';
import MDEditor from '@uiw/react-md-editor';
import { useResume } from '@/context/ResumeContext';
import ToastMessage from '@/Layout/ToastMessage';
import { PaymentDetails } from '@/services/Admin';
import CustomModal from '@/components/Modal/Modal';
import PackagePop from '@/components/PackagePop';
import ai from "@/assets/Images/resume-builder/ai.svg";
import AiForm from './AiForm';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface CVFormData {
  name: string;
  phone: string;
  email: string;
  date: Date | null;
  address: string;
  recipientName: string;
  recipientPhone: string;
  recipientEmail: string;
  recipientAddress: string;
  content: string;
}

interface CVFormProps {
  data: CVFormData;
  setData: React.Dispatch<React.SetStateAction<CVFormData>>;
  Generate: () => void;
}

const CVForm: React.FC<CVFormProps> = ({ data, setData, Generate }) => {
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const { fetchAiSuggestions, dashboard } = useResume();
  const [isPremiumOpen, setPremiumOpen] = useState(false);
  const [AiModal, setAiModal] = useState(false);
  const [Paydet, setPaydet] = useState<any>(null);
  const [Loading, setLoading] = useState(true);
  const [editorValue, setEditorValue] = useState<string>(data.content || '');
  
  // Use refs to track initialization
  const isInitialized = useRef(false);
  const isRestoringData = useRef(false);


   
  const getFromSessionStorage = (key: string) => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(key);
    }
    return null;
  };

  const setToSessionStorage = (key: string, value: string): void => {
    if (typeof window !== 'undefined') {
        sessionStorage.setItem(key, value);
    }
};

  const safeParseDate = useCallback((dateValue: any): Date | null => {
    try {
      if (!dateValue) return null;

      let date: Date;

      if (dateValue instanceof Date) {
        date = new Date(dateValue);
        date.setHours(0, 0, 0, 0);
      } else if (typeof dateValue === 'string') {
        if (dateValue.includes('/')) {
          const [day, month, year] = dateValue.split('/').map(num => parseInt(num, 10));
          if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
          if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > 2100) return null;
          date = new Date(year, month - 1, day);
        } else {
          date = new Date(dateValue);
          if (!isNaN(date.getTime())) {
            date.setHours(0, 0, 0, 0);
          }
        }
      } else {
        date = new Date(dateValue);
        if (!isNaN(date.getTime())) {
          date.setHours(0, 0, 0, 0);
        }
      }

      return !isNaN(date.getTime()) ? date : null;
    } catch (error) {
      console.warn('Invalid date value:', dateValue, error);
      return null;
    }
  }, []);

  const formatDate = useCallback((date: Date | null): string => {
    try {
      if (!date || !(date instanceof Date) || isNaN(date.getTime())) return '';

      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();

      return `${day}/${month}/${year}`;
    } catch (error) {
      console.warn('Error formatting date:', date, error);
      return '';
    }
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
    reset,
  } = useForm<CVFormData>({
    defaultValues: {
      ...data,
      date: data.date ? safeParseDate(data.date) : new Date()
    },
  });

  const fetchData = async () => {
    try {
      const response = await PaymentDetails();
      setPaydet(response?.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      let errorMessage = (error as Error).message;
      ToastMessage({
        type: "error",
        message: errorMessage,
      });
    }
  };

  // Initialize form from session storage only once
  useEffect(() => {
    if (isInitialized.current) return;

    const savedData = getFromSessionStorage('cvData');
    if (savedData) {
      try {
        isRestoringData.current = true;
        const parsedData = JSON.parse(savedData);

        if (parsedData.date) {
          parsedData.date = safeParseDate(parsedData.date);
        }

        // Update parent component data
        setData(parsedData);
        setEditorValue(parsedData.content || '');

        // Reset the form with parsed data
        reset(parsedData);

      } catch (error) {
        console.error('Error parsing saved data:', error);
        // Reset with default data on error
        reset(data);
      } finally {
        isRestoringData.current = false;
        isInitialized.current = true;
      }
    } else {
      // No saved data, use props data
      reset(data);
      isInitialized.current = true;
    }
  }, [reset, setData, data, safeParseDate]); // Add all dependencies

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateData(name as keyof CVFormData, value);
  };

  const handleContentChange = (value: string | undefined) => {
    const contentValue = value || '';
    updateData('content', contentValue);
    setEditorValue(contentValue);
  };

  const handleDateChange = (date: Date | null) => {
    const validDate = date && !isNaN(date.getTime()) ? date : null;
    updateData('date', validDate);
  };

  const updateData = useCallback((field: keyof CVFormData, value: any) => {
    if (timer) {
      clearTimeout(timer);
    }

    // Skip if we're currently restoring data
    if (isRestoringData.current) return;

    setValue(field, value);
    trigger(field);

    setData(prevData => {
      const newData = {
        ...prevData,
        [field]: value
      };

      try {
        const dataForStorage = {
          ...newData,
          date: newData.date instanceof Date && !isNaN(newData.date.getTime())
            ? formatDate(newData.date)
            : null
        };

        setToSessionStorage('cvData', JSON.stringify(dataForStorage));
      } catch (error) {
        console.error('Error saving to sessionStorage:', error);
      }

      return newData;
    });

    const newTimer = setTimeout(() => {
      Generate();
    }, 3000);
    setTimer(newTimer);
  }, [timer, setValue, trigger, setData, formatDate, Generate]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [timer]);

  // Watch for changes in form data to update the data prop
  const formData = watch();

  useEffect(() => {
    // Skip initial render and when restoring data
    if (!isInitialized.current || isRestoringData.current) return;

    // Update parent data when form changes (except during initialization)
    const hasChanged = Object.keys(formData).some(key => {
      return formData[key as keyof CVFormData] !== data[key as keyof CVFormData];
    });

    if (hasChanged) {
      setData(formData);
    }
  }, [formData, data, setData]);

  const getPlainTextFromHTML = (html: string): string => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  };

  return (
    <>
      <div className="row p-4 m-0 cover-letter-form">
        <h4 className='mb-4'>Create <span className='sec-col'>Cover</span> Letter</h4>

        <div className="col-lg-6 mb-4">
          <TextField
            {...register('name', {
              required: 'Name is required',
              maxLength: {
                value: 80,
                message: 'Name cannot exceed 80 characters'
              }
            })}
            label="Name"
            value={watch('name') || ''}
            onChange={handleChange}
            fullWidth
            error={!!errors.name}
            helperText={errors.name?.message}
            inputProps={{
              maxLength: 80,
            }}
          />
        </div>

        <div className="col-lg-6 mb-4">
          <TextField
            {...register('phone', {
              required: 'Phone is required',
              pattern: {
                value: /^[0-9+\- ]+$/,
                message: 'Invalid phone number'
              },
              maxLength: {
                value: 14,
                message: 'Phone cannot exceed 14 characters'
              }
            })}
            label="Phone"
            value={watch('phone') || ''}
            onChange={handleChange}
            fullWidth
            error={!!errors.phone}
            helperText={errors.phone?.message}
            inputProps={{
              maxLength: 14,
            }}
          />
        </div>

        <div className="col-lg-6 mb-4">
          <TextField
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              },
              maxLength: {
                value: 60,
                message: 'Email cannot exceed 60 characters'
              }
            })}
            label="Email"
            value={watch('email') || ''}
            onChange={handleChange}
            fullWidth
            error={!!errors.email}
            helperText={errors.email?.message}
            inputProps={{
              maxLength: 60,
            }}
          />
        </div>

        <div className="col-lg-6 mb-4">
          <DatePicker
            selected={watch('date')}
            onChange={handleDateChange}
            customInput={
              <TextField
                fullWidth
                label="Date"
                error={!!errors.date}
                helperText={errors.date?.message}
              />
            }
            dateFormat="dd/MM/yyyy"
            placeholderText="Select date"
            showYearDropdown
            dropdownMode="select"
            maxDate={new Date()}
            minDate={new Date(1900, 0, 1)}
            showTimeSelect={false}
          />
        </div>

        <div className="col-lg-12 mb-4">
          <TextField
            {...register('address', {
              required: 'Address is required',
              maxLength: {
                value: 200,
                message: 'Address cannot exceed 200 characters'
              }
            })}
            label="Address"
            value={watch('address') || ''}
            onChange={handleChange}
            fullWidth
            error={!!errors.address}
            helperText={errors.address?.message}
            inputProps={{
              maxLength: 200,
            }}
          />
        </div>

        <div className="col-lg-6 mb-4">
          <TextField
            {...register('recipientName', {
              required: 'Recipient name is required',
              maxLength: {
                value: 80,
                message: 'Recipient name cannot exceed 80 characters'
              }
            })}
            label="Recipient Name"
            value={watch('recipientName') || ''}
            onChange={handleChange}
            fullWidth
            error={!!errors.recipientName}
            helperText={errors.recipientName?.message}
            inputProps={{
              maxLength: 80,
            }}
          />
        </div>

        <div className="col-lg-6 mb-4">
          <TextField
            {...register('recipientPhone', {
              pattern: {
                value: /^[0-9+\- ]+$/,
                message: 'Invalid phone number'
              },
              maxLength: {
                value: 14,
                message: 'Phone cannot exceed 14 characters'
              }
            })}
            label="Recipient Phone"
            value={watch('recipientPhone') || ''}
            onChange={handleChange}
            fullWidth
            error={!!errors.recipientPhone}
            helperText={errors.recipientPhone?.message}
            inputProps={{
              maxLength: 14,
            }}
          />
        </div>

        <div className="col-lg-6 mb-4">
          <TextField
            {...register('recipientEmail', {
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              },
              maxLength: {
                value: 50,
                message: 'Email cannot exceed 50 characters'
              }
            })}
            label="Recipient Email"
            value={watch('recipientEmail') || ''}
            onChange={handleChange}
            fullWidth
            error={!!errors.recipientEmail}
            helperText={errors.recipientEmail?.message}
            inputProps={{
              maxLength: 50,
            }}
          />
        </div>

        <div className="col-lg-12 mb-1">
          <TextField
            {...register('recipientAddress', {
              maxLength: {
                value: 200,
                message: 'Address cannot exceed 200 characters'
              }
            })}
            label="Recipient Address"
            value={watch('recipientAddress') || ''}
            onChange={handleChange}
            fullWidth
            error={!!errors.recipientAddress}
            helperText={errors.recipientAddress?.message}
            inputProps={{
              maxLength: 200,
            }}
          />
        </div>

        <Box sx={{ mt: 2 }} className="position-relative cover-letter-editor">
          <div data-color-mode="light" className="md-editor-container">
            <MDEditor
              value={editorValue}
              onChange={handleContentChange}
              height={200}
              preview="edit"
              textareaProps={{
                placeholder: 'Write your cover letter content here...',
                maxLength: 650,
              }}
              style={{
                border: '1px solid #e0e0e0',
                borderRadius: '4px',
                overflow: 'hidden'
              }}
            />
          </div>
        </Box>
      </div>

      <CustomModal
        show={isPremiumOpen}
        onHide={() => setPremiumOpen(false)}
        custom='res-write'
        title=""
        size='xl'
      >
        <PackagePop fetchPay={fetchData} close={() => setPremiumOpen(false)} />
      </CustomModal>

      <CustomModal
        show={AiModal}
        onHide={() => setAiModal(false)}
        custom='ai-modal'
        title="Generate"
      >
        <AiForm close={() => setAiModal(false)} setData={setData} />
      </CustomModal>
    </>
  );
};

export default CVForm;