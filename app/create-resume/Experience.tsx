import React, { useState, useEffect, useRef } from 'react';
import { useForm, useFieldArray, Controller, useWatch } from 'react-hook-form';
import { FaPlus } from 'react-icons/fa';
import { MdDelete } from "react-icons/md";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ReactQuill from '@/components/Editor/ReactQuillEditor';
import exp from "@/assets/Images/resume-builder/exp.png";
import { TextField } from '@mui/material';
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { stripEmptyHtml } from '@/utils/htmlUtils';
import tip from "@/assets/Images/resume-builder/tips.svg";
import { useResume } from '@/context/ResumeContext';
import CustomModal from '@/components/Modal/Modal';
import ToastMessage from '@/Layout/ToastMessage';
import { PaymentDetails } from '@/services/Admin';
import PackagePop from '@/components/PackagePop';
import Image from 'next/image';

const validateExperience = {
  companyName: {
    required: 'Company Name is required',
  },
  jobPosition: {
    required: 'Job Position is required',
  },
  yearFrom: {
    required: 'Start date is required',
  },
  yearTo: {
    validate: (value: any, formValues: any, index: any) => {
      const startDate = formValues.experience[index]?.yearFrom;
      const isPresent = formValues.experience[index]?.present;

      if (isPresent) return true;

      if (value && startDate) {
        if (value <= startDate) {
          return 'End date must be after start date';
        }
      }

      return true;
    }
  },
  detail: {},
};

interface Experience {
  companyName: string;
  jobPosition: string;
  yearFrom: Date | null;
  yearTo: Date | null;
  present?: boolean;
  detail: string;
}

interface ExperienceProps {
  setResumeData: React.Dispatch<React.SetStateAction<any>>;
  step2: boolean;
  Generate: () => void;
  tips?: any;
}

interface FormData {
  experience: Experience[];
}

const getFromLocalStorage = (key: string) => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(key);
  }
  return null;
};

const setToLocalStorage = (key: string, value: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, value);
  }
};

const MonthYearInput = ({ value, onClick }: { value: string, onClick: () => void }) => (
  <TextField
    value={value}
    onClick={onClick}
    label="Month Year"
    variant="outlined"
    fullWidth
    InputProps={{
      readOnly: true,
      endAdornment: (
        <span style={{ cursor: 'pointer' }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgb(0 0 0 / 64%)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </span>
      ),
    }}
  />
);

const Experience: React.FC<ExperienceProps> = ({ setResumeData, Generate, step2, tips }) => {
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [showTips, setShowTips] = useState(false);
  const tipsRef = useRef<HTMLDivElement>(null);
  const tipsButtonRef = useRef<HTMLButtonElement>(null);
  const [isPremiumOpen, setPremiumOpen] = useState(false);
  const [characterErrors, setCharacterErrors] = useState<{ [key: number]: boolean }>({});

  const handleTipsButtonClick = () => {
    setShowTips(prev => !prev);
  };

  const {
    fetchAiSuggestions,
    aiSuggestions,
    sectionType,
    resetAiSuggestions
  } = useResume();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
    watch,
    trigger,
  } = useForm<FormData>({
    defaultValues: {
      experience: [{ companyName: '', jobPosition: '', yearFrom: null, yearTo: null, present: false, detail: '' }],
    },
    mode: 'onBlur',
  });

  const [Paydet, setPaydet] = useState(null);
  const [Loading, setLoading] = useState(true);

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

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'experience',
  });

  const formData = useWatch({ control });

  const previousDataRef = useRef<string>('');

  useEffect(() => {
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    const newTimeout = setTimeout(() => {
      const formattedData = {
        experienceDetails: formData.experience && formData.experience.map((exp) => ({
          ...exp,
          yearFrom: exp.yearFrom ? formatDateToMonthYear(exp.yearFrom) : null,
          yearTo: exp.yearTo ? formatDateToMonthYear(exp.yearTo) : null,
          present: exp.present ? 'Present' : "",
          detail: stripEmptyHtml(exp.detail) || '',
        })),
      };

      // Compare with previous data to detect actual changes
      const currentDataString = JSON.stringify(formattedData);
      const hasDataChanged = previousDataRef.current !== currentDataString;

      if (hasDataChanged) {
        const storedData = getFromLocalStorage('resumeData');
        let resumeData = storedData ? JSON.parse(storedData) : { resume_data: {} };

        resumeData.resume_data = {
          ...resumeData.resume_data,
          ...formattedData,
        };

        setToLocalStorage('resumeData', JSON.stringify(resumeData));
        setResumeData(resumeData);

        // Update the reference to current data
        previousDataRef.current = currentDataString;

        // Only call Generate if data actually changed
        if (step2) {
          Generate();
        }
      }
    }, 3000);
    setTypingTimeout(newTimeout);

    return () => {
      if (newTimeout) {
        clearTimeout(newTimeout);
      }
    };
  }, [formData, step2]);

  const [showDetailSuggestions, setShowDetailSuggestions] = useState<number | null>(null);

  useEffect(() => {
    if (aiSuggestions && showDetailSuggestions !== null && sectionType === 'Experience') {
      setValue(`experience.${showDetailSuggestions}.detail`, aiSuggestions);
      resetAiSuggestions();
      setShowDetailSuggestions(null);
    }
  }, [aiSuggestions, showDetailSuggestions, setValue, resetAiSuggestions, sectionType]);

  useEffect(() => {
    const storedData = getFromLocalStorage('resumeData');
    if (storedData) {
      const resumeData = JSON.parse(storedData);
      if (resumeData.resume_data && resumeData.resume_data.experienceDetails) {
        const experienceData = resumeData.resume_data.experienceDetails.map((exp: any) => ({
          ...exp,
          yearFrom: exp.yearFrom ? parseMonthYearToDate(exp.yearFrom) : null,
          yearTo: exp.yearTo ? parseMonthYearToDate(exp.yearTo) : null,
          present: exp.present === 'Present',
          detail: exp.detail || '',
        }));
        reset({ experience: experienceData });
      }
    }
  }, [reset]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tipsRef.current && !tipsRef.current.contains(event.target as Node)) {
        if (tipsButtonRef.current && !tipsButtonRef.current.contains(event.target as Node)) {
          setShowTips(false);
        }
      }
    };

    if (showTips) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTips]);

  const getPlainTextFromMarkdown = (markdown: string): string => {
    if (!markdown) return '';

    let plainText = markdown;

    // Remove markdown headers
    plainText = plainText.replace(/#{1,6}\s+/g, '');

    // Remove bold and italic
    plainText = plainText.replace(/\*\*\s?|\s?\*\*/g, '');
    plainText = plainText.replace(/\*\s?|\s?\*/g, '');
    plainText = plainText.replace(/__\s?|\s?__/g, '');
    plainText = plainText.replace(/_\s?|\s?_/g, '');

    // Remove links
    plainText = plainText.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

    // Remove lists
    plainText = plainText.replace(/^\s*[\*\-\+]\s+/gm, '');
    plainText = plainText.replace(/^\s*\d+\.\s+/gm, '');

    // Remove blockquotes
    plainText = plainText.replace(/^\s*>\s+/gm, '');

    // Remove code blocks
    plainText = plainText.replace(/```[\s\S]*?```/g, '');
    plainText = plainText.replace(/`[^`]*`/g, '');

    // Remove extra whitespace
    plainText = plainText.replace(/\s+/g, ' ').trim();

    return plainText;
  };

  const validateCharacterLimit = (markdownContent: string, index: number): boolean => {
    const plainText = getPlainTextFromMarkdown(markdownContent);
    const charCount = plainText.length;
    const limit = 4000;

    if (charCount > limit) {
      setCharacterErrors(prev => ({ ...prev, [index]: true }));
      return false;
    } else {
      setCharacterErrors(prev => ({ ...prev, [index]: false }));
      return true;
    }
  };

  const onSubmit = (data: FormData) => {
    const formattedData = {
      experienceDetails: data.experience.map((exp) => ({
        ...exp,
        yearFrom: exp.yearFrom ? formatDateToMonthYear(exp.yearFrom) : null,
        yearTo: exp.yearTo ? formatDateToMonthYear(exp.yearTo) : null,
        present: exp.present ? 'Present' : "",
        detail: exp.detail || '',
      })),
    };

    const storedData = getFromLocalStorage('resumeData');
    let resumeData = storedData ? JSON.parse(storedData) : { resume_data: {} };

    resumeData.resume_data = {
      ...resumeData.resume_data,
      ...formattedData,
    };

    setToLocalStorage('resumeData', JSON.stringify(resumeData));
    setResumeData(resumeData);
  };

  const formatDateToMonthYear = (date: Date): string => {
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    return `${month} ${year}`;
  };

  const parseMonthYearToDate = (monthYear: string): Date | null => {
    if (!monthYear) return null;
    const parts = monthYear.split(' ');
    if (parts.length < 2) return null;

    const monthPart = parts[0];
    const yearPart = parts[parts.length - 1];

    const date = new Date(`${monthPart} 1, ${yearPart}`);
    return isNaN(date.getTime()) ? null : date;
  };

  const handleGetAiSuggestions = async (section: string, fieldName: string, index: number, feature?: number, value?: string) => {
    await fetchAiSuggestions("Experience", 'Details', feature, value);
    setShowDetailSuggestions(index);
  };

  return (
    <>
      <div className='container p-4 py-0'>
        <div className="row m-0 p-3 px-4">
          <div style={{ display: 'flex', alignItems: 'center', position: 'relative', justifyContent: 'space-between' }} className='head-name mb-3'>
            <div className='d-flex align-items-end'>
              <Image src={exp} alt="" loading="lazy" width={30} height={30} />
              <h5 className='px-2 mb-0'>Employment History</h5>
            </div>

            {tips.length > 0 && (
              <>
                <button
                  ref={tipsButtonRef}
                  type="button"
                  className='tips-button'
                  onClick={handleTipsButtonClick}
                >
                  <Image src={tip} alt="" width={20} height={20} /> Tips
                </button>
                {showTips && (
                  <div className='tips-box' ref={tipsRef}>
                    <h5>
                      <Image src={tip} alt="" width={20} height={20} className='p-1 mb-1' />
                      Experience Tips
                    </h5>
                    <div className='fs-6'>
                      {tips.map((tip: any, index: number) => (
                        <div
                          key={index}
                          dangerouslySetInnerHTML={{ __html: tip.resume_tips || '' }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            {fields.map((field, index) => {
              const currentDetail = watch(`experience.${index}.detail`) || '';
              const plainText = getPlainTextFromMarkdown(currentDetail);
              const remainingChars = 4000 - plainText.length;

              return (
                <div key={field.id} className='row m-0 mt-2'>
                  <div className='d-flex align-items-baseline justify-content-between'>
                    <h5 className='mb-3'>Experience: {index + 1}</h5>
                    {fields.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className='bg-transparent border-0 fs-5'
                      >
                        <MdDelete />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setValue(`experience.0.companyName`, '');
                          setValue(`experience.0.jobPosition`, '');
                          setValue(`experience.0.yearFrom`, null);
                          setValue(`experience.0.yearTo`, null);
                          setValue(`experience.0.present`, false);
                          setValue(`experience.0.detail`, '');
                        }}
                        className='bg-transparent border-0 fs-5'
                      >
                        <MdDelete />
                      </button>
                    )}
                  </div>

                  <div className="col-lg-6 mb-4 pb-2">
                    <Controller
                      name={`experience.${index}.companyName`}
                      control={control}
                      rules={validateExperience.companyName}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Company Name"
                          variant="outlined"
                          fullWidth
                          placeholder="Company Name"
                          inputProps={{ maxLength: 100 }}
                          error={!!errors.experience?.[index]?.companyName}
                          helperText={errors.experience?.[index]?.companyName?.message}
                          onChange={(e) => {
                            field.onChange(e);
                            trigger(`experience.${index}`);
                          }}
                        />
                      )}
                    />
                  </div>

                  <div className="col-lg-6 mb-4 pb-2">
                    <Controller
                      name={`experience.${index}.jobPosition`}
                      control={control}
                      rules={validateExperience.jobPosition}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Job Position"
                          variant="outlined"
                          fullWidth
                          placeholder="Job Position"
                          inputProps={{ maxLength: 50 }}
                          error={!!errors.experience?.[index]?.jobPosition}
                          helperText={errors.experience?.[index]?.jobPosition?.message}
                          onChange={(e) => {
                            field.onChange(e);
                            trigger(`experience.${index}`);
                          }}
                        />
                      )}
                    />
                  </div>

                  <div className="col-lg-6 mb-4 pb-2">
                    <Controller
                      name={`experience.${index}.yearFrom`}
                      control={control}
                      rules={validateExperience.yearFrom}
                      render={({ field }) => (
                        <DatePicker
                          selected={field.value}
                          onChange={field.onChange}
                          dateFormat="MMMM yyyy"
                          showMonthYearPicker
                          showFullMonthYearPicker
                          placeholderText="Select start month/year"
                          maxDate={new Date()}
                          customInput={
                            <MonthYearInput
                              value={field.value ? formatDateToMonthYear(field.value) : ''}
                              onClick={() => { }}
                            />
                          }
                          renderCustomHeader={({
                            date,
                            changeYear,
                            changeMonth,
                            decreaseMonth,
                            increaseMonth,
                            prevMonthButtonDisabled,
                            nextMonthButtonDisabled,
                          }) => (
                            <div style={{
                              margin: 10,
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                            }}>
                              <button
                                onClick={decreaseMonth}
                                disabled={prevMonthButtonDisabled}
                                type="button"
                                style={{
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  fontSize: "1.2rem",
                                }}
                              >
                                <IoIosArrowBack />
                              </button>

                              <select
                                value={date.getFullYear()}
                                onChange={({ target: { value } }) => changeYear(Number(value))}
                                style={{
                                  margin: "0 10px",
                                  padding: "5px",
                                  borderRadius: "4px",
                                  border: "1px solid #ccc",
                                }}
                              >
                                {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                  <option key={year} value={year}>
                                    {year}
                                  </option>
                                ))}
                              </select>

                              <select
                                value={date.toLocaleString('default', { month: 'long' })}
                                onChange={({ target: { value } }) =>
                                  changeMonth(new Date(Date.parse(value + " 1, 2012")).getMonth())
                                }
                                style={{
                                  margin: "0 10px",
                                  padding: "5px",
                                  borderRadius: "4px",
                                  border: "1px solid #ccc",
                                }}
                              >
                                {Array.from({ length: 12 }, (_, i) => {
                                  const month = new Date(0, i).toLocaleString('default', { month: 'long' });
                                  return (
                                    <option key={month} value={month}>
                                      {month}
                                    </option>
                                  );
                                })}
                              </select>

                              <button
                                onClick={increaseMonth}
                                disabled={nextMonthButtonDisabled}
                                type="button"
                                style={{
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  fontSize: "1.2rem",
                                }}
                              >
                                <IoIosArrowForward />
                              </button>
                            </div>
                          )}
                        />
                      )}
                    />

                    <div className="form-check d-flex align-items-end p-0 mt-4">
                      <input
                        className="form-check-input mx-1"
                        type="checkbox"
                        id={`Present-${index}`}
                        {...control.register(`experience.${index}.present`)}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          if (isChecked) {
                            setValue(`experience.${index}.yearTo`, null);
                          }
                        }}
                      />
                      <label htmlFor={`Present-${index}`} className='mx-2'>Present</label>
                    </div>
                  </div>

                  <div className="col-lg-6 mb-4 pb-2">
                    <Controller
                      name={`experience.${index}.yearTo`}
                      control={control}
                      rules={{
                        validate: (value) => {
                          const startDate = watch(`experience.${index}.yearFrom`);
                          const isPresent = watch(`experience.${index}.present`);

                          if (isPresent) return true;

                          if (value && startDate) {
                            if (value <= startDate) {
                              return 'End date must be after start date';
                            }
                          }

                          return true;
                        }
                      }}
                      render={({ field }) => (
                        <DatePicker
                          selected={field.value}
                          onChange={field.onChange}
                          dateFormat="MMMM yyyy"
                          showMonthYearPicker
                          showFullMonthYearPicker
                          placeholderText="Select end month/year"
                          maxDate={new Date()}
                          minDate={watch(`experience.${index}.yearFrom`) || undefined}
                          disabled={watch(`experience.${index}.present`)}
                          customInput={
                            <MonthYearInput
                              value={field.value ? formatDateToMonthYear(field.value) : ''}
                              onClick={() => { }}
                            />
                          }
                          renderCustomHeader={({
                            date,
                            changeYear,
                            changeMonth,
                            decreaseMonth,
                            increaseMonth,
                            prevMonthButtonDisabled,
                            nextMonthButtonDisabled,
                          }) => (
                            <div style={{
                              margin: 10,
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                            }}>
                              <button
                                onClick={decreaseMonth}
                                disabled={prevMonthButtonDisabled}
                                type="button"
                                style={{
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  fontSize: "1.2rem",
                                }}
                              >
                                <IoIosArrowBack />
                              </button>

                              <select
                                value={date.getFullYear()}
                                onChange={({ target: { value } }) => changeYear(Number(value))}
                                style={{
                                  margin: "0 10px",
                                  padding: "5px",
                                  borderRadius: "4px",
                                  border: "1px solid #ccc",
                                }}
                              >
                                {Array.from({ length: 50 }, (_, i) => new Date().getFullYear() - i).map(year => (
                                  <option key={year} value={year}>
                                    {year}
                                  </option>
                                ))}
                              </select>

                              <select
                                value={date.toLocaleString('default', { month: 'long' })}
                                onChange={({ target: { value } }) =>
                                  changeMonth(new Date(Date.parse(value + " 1, 2012")).getMonth())
                                }
                                style={{
                                  margin: "0 10px",
                                  padding: "5px",
                                  borderRadius: "4px",
                                  border: "1px solid #ccc",
                                }}
                              >
                                {Array.from({ length: 12 }, (_, i) => {
                                  const month = new Date(0, i).toLocaleString('default', { month: 'long' });
                                  return (
                                    <option key={month} value={month}>
                                      {month}
                                    </option>
                                  );
                                })}
                              </select>

                              <button
                                onClick={increaseMonth}
                                disabled={nextMonthButtonDisabled}
                                type="button"
                                style={{
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  fontSize: "1.2rem",
                                }}
                              >
                                <IoIosArrowForward />
                              </button>
                            </div>
                          )}
                        />
                      )}
                    />
                  </div>

                  <div className="col-lg-12 mb-4 pb-2">
                    <Controller
                      name={`experience.${index}.detail`}
                      control={control}
                      render={({ field }) => (
                        <div className="position-relative">
                          <ReactQuill
                            value={field.value || ''}
                            onChange={(value: string) => {
                              if (validateCharacterLimit(value || '', index)) {
                                field.onChange(value);
                              }
                            }}
                            onBlur={field.onBlur}
                            placeholder="Describe your responsibilities, achievements, and skills used... (max 4000 characters)"
                          />

                          {characterErrors[index] && (
                            <div className="text-danger small mt-1">
                              Maximum 4000 characters allowed!
                            </div>
                          )}
                        </div>
                      )}
                    />
                  </div>
                </div>
              );
            })}

            <button
              type="button"
              onClick={() => append({ companyName: '', jobPosition: '', yearFrom: null, yearTo: null, present: false, detail: '' })}
              className='m-2 mt-3 bg-transparent border-0'
            >
              <FaPlus className='mb-1' /> Add Another Experience
            </button>

            <br />
          </form>
        </div>
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
    </>
  );
};

export default Experience;