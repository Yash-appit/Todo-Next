import React, { useEffect, useState, useRef } from 'react';
import { useForm, useFieldArray, Controller, useWatch } from 'react-hook-form';
import { FaPlus } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ReactQuill from '@/components/Editor/ReactQuillEditor';
import int from "@/assets/Images/resume-builder/int.png";
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

const validateInternship = {
  companyName: {
    required: 'Company Name is required',
  },
  yearFrom: {},
  yearTo: {},
  detail: {},
};

interface Internship {
  companyName: string;
  jobPosition: string;
  yearFrom: Date | null;
  yearTo: Date | null;
  present?: boolean;
  detail: string;
}

interface InternshipProps {
  setResumeData: React.Dispatch<React.SetStateAction<any>>;
  step2: boolean;
  Generate: () => void;
  tips?: any;
}

interface FormData {
  internship: Internship[];
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

const Internship: React.FC<InternshipProps> = ({ setResumeData, Generate, step2, tips }) => {
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
    watch,
    trigger
  } = useForm<FormData>({
    defaultValues: {
      internship: [{ companyName: '', jobPosition: '', yearFrom: null, yearTo: null, present: false, detail: '' }],
    },
    mode: 'onBlur',
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'internship',
  });

  const [Paydet, setPaydet] = useState(null);
  const [Loading, setLoading] = useState(true);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isPremiumOpen, setPremiumOpen] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const tipsRef = useRef<HTMLDivElement>(null);
  const tipsButtonRef = useRef<HTMLButtonElement>(null);
  const [characterErrors, setCharacterErrors] = useState<{ [key: number]: boolean }>({});
  const [showDetailSuggestions, setShowDetailSuggestions] = useState<number | null>(null);

  const {
    fetchAiSuggestions,
    aiSuggestions,
    sectionType,
    resetAiSuggestions
  } = useResume();

  const formData = useWatch({ control });

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
    const limit = 500;

    if (charCount > limit) {
      setCharacterErrors(prev => ({ ...prev, [index]: true }));
      return false;
    } else {
      setCharacterErrors(prev => ({ ...prev, [index]: false }));
      return true;
    }
  };

  const previousDataRef = useRef<string>('');

  useEffect(() => {
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    const newTimeout = setTimeout(() => {
      const formattedData = {
        internshipDetails: formData.internship && formData.internship.map((int) => ({
          ...int,
          yearFrom: int.yearFrom ? formatDateToMonthYear(int.yearFrom) : null,
          yearTo: int.yearTo ? formatDateToMonthYear(int.yearTo) : null,
          present: int.present ? 'Present' : undefined,
          detail: stripEmptyHtml(int.detail) || '',
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

  useEffect(() => {
    const storedData = getFromLocalStorage('resumeData');
    if (storedData) {
      const resumeData = JSON.parse(storedData);
      if (resumeData.resume_data && resumeData.resume_data.internshipDetails) {
        const internshipData = resumeData.resume_data.internshipDetails.map((int: any) => ({
          ...int,
          yearFrom: int.yearFrom ? parseMonthYearToDate(int.yearFrom) : null,
          yearTo: int.yearTo ? parseMonthYearToDate(int.yearTo) : null,
          present: int.present === 'Present',
          detail: int.detail || '',
        }));
        reset({ internship: internshipData });
      }
    }
  }, [reset]);

  useEffect(() => {
    if (aiSuggestions && showDetailSuggestions !== null && sectionType === 'Internship') {
      setValue(`internship.${showDetailSuggestions}.detail`, aiSuggestions);
      resetAiSuggestions();
      setShowDetailSuggestions(null);
    }
  }, [aiSuggestions, showDetailSuggestions, setValue, resetAiSuggestions, sectionType]);

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

  const handleTipsButtonClick = () => {
    setShowTips(prev => !prev);
  };

  const onSubmit = (data: { internship: Internship[] }) => {
    const formattedData = {
      internshipDetails: data.internship.map((int) => ({
        ...int,
        yearFrom: int.yearFrom ? formatDateToMonthYear(int.yearFrom) : null,
        yearTo: int.yearTo ? formatDateToMonthYear(int.yearTo) : null,
        present: int.present ? 'Present' : "",
        detail: int.detail || '',
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

  const handleGetAiSuggestions = async (section: string, fieldName: string, index: number, feature?: number, value?: string) => {
    await fetchAiSuggestions('Internship', 'Details', feature, value);
    setShowDetailSuggestions(index);
  };

  return (
    <>
      <div className='container p-4 pt-2 pb-0'>
        <div className="row m-0 p-3 px-4 pb-0">
          <div style={{ display: 'flex', alignItems: 'center', position: 'relative', justifyContent: 'space-between' }} className='head-name mb-4'>
            <div className='d-flex align-items-end'>
              <Image src={int} alt="" loading="lazy" width={30} height={30} />
              <h4 className='px-2 mb-0'>Internship History</h4>
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
                      Internship Tips
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
              const currentDetail = watch(`internship.${index}.detail`) || '';
              const plainText = getPlainTextFromMarkdown(currentDetail);
              const remainingChars = 500 - plainText.length;

              return (
                <div key={field.id} className='row m-0'>
                  <div className='d-flex align-items-baseline justify-content-between'>
                    <h5 className='mb-3'>Internship: {index + 1}</h5>
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
                          setValue(`internship.0.companyName`, '');
                          setValue(`internship.0.jobPosition`, '');
                          setValue(`internship.0.yearFrom`, null);
                          setValue(`internship.0.yearTo`, null);
                          setValue(`internship.0.present`, false);
                          setValue(`internship.0.detail`, '');
                        }}
                        className='bg-transparent border-0 fs-5'
                      >
                        <MdDelete />
                      </button>
                    )}
                  </div>

                  <div className="col-lg-6 mb-4 pb-2">
                    <Controller
                      name={`internship.${index}.companyName`}
                      control={control}
                      rules={validateInternship.companyName}
                      render={({ field }) => (
                        <TextField
                          label="Company Name"
                          variant="outlined"
                          fullWidth
                          placeholder="Company Name"
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(e);
                            trigger(`internship.${index}`);
                          }}
                          inputProps={{ maxLength: 100 }}
                          error={!!errors.internship?.[index]?.companyName}
                          helperText={errors.internship?.[index]?.companyName?.message}
                        />
                      )}
                    />
                  </div>

                  <div className="col-lg-6 mb-4 pb-2">
                    <Controller
                      name={`internship.${index}.jobPosition`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          label="Position"
                          variant="outlined"
                          fullWidth
                          placeholder="Position"
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(e);
                            trigger(`internship.${index}`);
                          }}
                          inputProps={{ maxLength: 50 }}
                        />
                      )}
                    />
                  </div>

                  <div className="col-lg-6 mb-4 pb-2">
                    <Controller
                      name={`internship.${index}.yearFrom`}
                      control={control}
                      rules={validateInternship.yearFrom}
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
                        className="form-check-input mx-2"
                        type="checkbox"
                        id={`Present-${index}`}
                        checked={watch(`internship.${index}.present`) || false}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          if (isChecked) {
                            setValue(`internship.${index}.yearTo`, null);
                          }
                          setValue(`internship.${index}.present`, isChecked);
                        }}
                      />
                      <label htmlFor={`Present-${index}`}>Present</label>
                    </div>
                  </div>

                  <div className="col-lg-6 mb-4 pb-2">
                    <Controller
                      name={`internship.${index}.yearTo`}
                      control={control}
                      rules={{
                        validate: (value) => {
                          const startDate = watch(`internship.${index}.yearFrom`);
                          const isPresent = watch(`internship.${index}.present`);

                          if (isPresent) return true;

                          if (value && startDate && value < startDate) {
                            return 'End date cannot be before start date';
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
                          disabled={watch(`internship.${index}.present`)}
                          maxDate={new Date()}
                          minDate={watch(`internship.${index}.yearFrom`) || undefined}
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
                      name={`internship.${index}.detail`}
                      control={control}
                      rules={validateInternship.detail}
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
                            placeholder="Describe your responsibilities, projects, and skills gained... (max 500 characters)"
                          />

                          {characterErrors[index] && (
                            <div className="text-danger small mt-1">
                              Maximum 500 characters allowed!
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
              className='my-3 mt-0 bg-transparent border-0 mx-2'
            >
              <FaPlus className='mb-1' /> Add Another Internship
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

export default Internship;