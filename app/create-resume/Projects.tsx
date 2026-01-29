import React, { useEffect, useState, useRef } from 'react';
import { useForm, useFieldArray, Controller, useWatch } from 'react-hook-form';
import { FaPlus } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ReactQuill from '@/components/Editor/ReactQuillEditor';
import proj from "@/assets/Images/resume-builder/proj.png";
import { TextField } from '@mui/material';
import tip from "@/assets/Images/resume-builder/tips.svg";
import { stripEmptyHtml } from '@/utils/htmlUtils';
import { useResume } from '@/context/ResumeContext';
import CustomModal from '@/components/Modal/Modal';
import ToastMessage from '@/Layout/ToastMessage';
import { PaymentDetails } from '@/services/Admin';
import PackagePop from '@/components/PackagePop';
import Image from 'next/image';

const validateProjects = {
  projectTitle: {
    required: 'Project Title is required',
  },
  yearFrom: {},
  yearTo: {},
  projectDescription: {},
};

interface Projects {
  projectTitle: string;
  projectDescription: string;
  yearFrom: Date | null;
  yearTo: Date | null;
  present?: boolean;
  role: string;
  companyName: string;
}

interface FormData {
  projects: Projects[];
}

interface ProjectsProps {
  setResumeData: React.Dispatch<React.SetStateAction<any>>;
  step2: boolean;
  Generate: () => void;
  tips?: any;
}

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

const Projects: React.FC<ProjectsProps> = ({ setResumeData, Generate, step2, tips }) => {
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
      projects: [{ projectTitle: '', projectDescription: '', yearFrom: null, yearTo: null, present: false, role: '', companyName: '' }],
    },
    mode: 'onBlur',
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'projects',
  });

  const formData = useWatch({ control });
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [characterErrors, setCharacterErrors] = useState<{ [key: number]: boolean }>({});
  const [showTips, setShowTips] = useState(false);
  const tipsRef = useRef<HTMLDivElement>(null);
  const tipsButtonRef = useRef<HTMLButtonElement>(null);
  const [isPremiumOpen, setPremiumOpen] = useState(false);
  const [showDetailSuggestions, setShowDetailSuggestions] = useState<number | null>(null);

  const {
    fetchAiSuggestions,
    aiSuggestions,
    sectionType,
    resetAiSuggestions
  } = useResume();

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

  const formatDateToMonthYear = (date: Date): string => {
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    return `${month} ${year}`;
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
    const limit = 4000;

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
        projectDetails: formData?.projects && formData?.projects.map((pro) => ({
          ...pro,
          yearFrom: pro.yearFrom ? formatDateToMonthYear(pro.yearFrom) : null,
          yearTo: pro.yearTo ? formatDateToMonthYear(pro.yearTo) : null,
          present: pro.present ? 'Present' : undefined,
          projectDescription: stripEmptyHtml(pro.projectDescription) || '',
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
    if (aiSuggestions && showDetailSuggestions !== null && sectionType === 'Project') {
      setValue(`projects.${showDetailSuggestions}.projectDescription`, aiSuggestions);
      resetAiSuggestions();
      setShowDetailSuggestions(null);
    }
  }, [aiSuggestions, showDetailSuggestions, setValue, resetAiSuggestions, sectionType]);

  useEffect(() => {
    const storedData = getFromLocalStorage('resumeData');
    if (storedData) {
      const resumeData = JSON.parse(storedData);
      if (resumeData.resume_data && resumeData.resume_data.projectDetails) {
        const projectsData = resumeData.resume_data.projectDetails.map((pro: any) => ({
          ...pro,
          yearFrom: pro.yearFrom ? new Date(pro.yearFrom) : null,
          yearTo: pro.yearTo ? new Date(pro.yearTo) : null,
          present: pro.present === 'Present',
          projectDescription: pro.projectDescription || '',
        }));
        reset({ projects: projectsData });
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

  const handleTipsButtonClick = () => {
    setShowTips(prev => !prev);
  };

  const onSubmit = (data: { projects: Projects[] }) => {
    const formattedData = {
      projectDetails: data.projects.map((pro) => ({
        ...pro,
        yearFrom: pro.yearFrom ? formatDateToMonthYear(pro.yearFrom) : null,
        yearTo: pro.yearTo ? formatDateToMonthYear(pro.yearTo) : null,
        present: pro.present ? 'Present' : undefined,
        projectDescription: pro.projectDescription || '',
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
    await fetchAiSuggestions('Project', 'Details', feature, value);
    setShowDetailSuggestions(index);
  };

  return (
    <>
      <div className='container p-4 pt-2 pb-0'>
        <div className="row p-3 px-3 m-0 pb-0">
          <div style={{ display: 'flex', alignItems: 'center', position: 'relative', justifyContent: 'space-between' }} className='head-name mb-4'>
            <div className='d-flex align-items-end'>
              <Image src={proj} alt="" loading="lazy" width={30} height={30} />
              <h4 className='px-2 mb-0'>Projects</h4>
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
                      Projects Tips
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
              const currentDescription = watch(`projects.${index}.projectDescription`) || '';
              const plainText = getPlainTextFromMarkdown(currentDescription);
              const remainingChars = 4000 - plainText.length;

              return (
                <div key={field.id} className='row m-0'>
                  <div className='d-flex align-items-baseline justify-content-between'>
                    <h5 className='mb-3'>Project: {index + 1}</h5>
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
                          setValue(`projects.0.projectTitle`, '');
                          setValue(`projects.0.projectDescription`, '');
                          setValue(`projects.0.yearFrom`, null);
                          setValue(`projects.0.yearTo`, null);
                          setValue(`projects.0.present`, false);
                          setValue(`projects.0.role`, '');
                          setValue(`projects.0.companyName`, '');
                        }}
                        className='bg-transparent border-0 fs-5'
                      >
                        <MdDelete />
                      </button>
                    )}
                  </div>

                  <div className="col-lg-6 mb-4 pb-2">
                    <Controller
                      name={`projects.${index}.projectTitle`}
                      control={control}
                      rules={validateProjects.projectTitle}
                      render={({ field }) => (
                        <TextField
                          label="Project Title"
                          variant="outlined"
                          fullWidth
                          inputProps={{ maxLength: 50 }}
                          placeholder="Project Title"
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(e);
                            trigger(`projects.${index}`);
                          }}
                          error={!!errors.projects?.[index]?.projectTitle}
                          helperText={errors.projects?.[index]?.projectTitle?.message}
                        />
                      )}
                    />
                  </div>

                  <div className="col-lg-6 mb-4 pb-2">
                    <Controller
                      name={`projects.${index}.role`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          label="Role"
                          variant="outlined"
                          fullWidth
                          inputProps={{ maxLength: 50 }}
                          placeholder="Role"
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(e);
                            trigger(`projects.${index}`);
                          }}
                          error={!!errors.projects?.[index]?.role}
                          helperText={errors.projects?.[index]?.role?.message}
                        />
                      )}
                    />
                  </div>

                  <div className="col-lg-12 mb-4 pb-2">
                    <Controller
                      name={`projects.${index}.companyName`}
                      control={control}
                      render={({ field }) => (
                        <TextField
                          label="Company/Organization Name"
                          variant="outlined"
                          fullWidth
                          inputProps={{ maxLength: 100 }}
                          placeholder="Company/Organization Name"
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(e);
                            trigger(`projects.${index}`);
                          }}
                          error={!!errors.projects?.[index]?.companyName}
                          helperText={errors.projects?.[index]?.companyName?.message}
                        />
                      )}
                    />
                  </div>

                  <div className="col-lg-6 mb-4 pb-2">
                    <Controller
                      name={`projects.${index}.yearFrom`}
                      control={control}
                      rules={validateProjects.yearFrom}
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
                        checked={watch(`projects.${index}.present`) || false}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          if (isChecked) {
                            setValue(`projects.${index}.yearTo`, null);
                          }
                          setValue(`projects.${index}.present`, isChecked);
                        }}
                      />
                      <label htmlFor={`Present-${index}`}>Present</label>
                    </div>
                  </div>

                  <div className="col-lg-6 mb-4 pb-2">
                    <Controller
                      name={`projects.${index}.yearTo`}
                      control={control}
                      rules={{
                        validate: (value) => {
                          const startDate = watch(`projects.${index}.yearFrom`);
                          const isPresent = watch(`projects.${index}.present`);

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
                          disabled={watch(`projects.${index}.present`)}
                          showFullMonthYearPicker
                          placeholderText="Select end month/year"
                          maxDate={new Date()}
                          minDate={watch(`projects.${index}.yearFrom`) || undefined}
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
                      name={`projects.${index}.projectDescription`}
                      rules={validateProjects.projectDescription}
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
                            placeholder="Describe the project, your contributions, technologies used, and outcomes... (max 4000 characters)"
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
              onClick={() => append({ projectTitle: '', projectDescription: '', yearFrom: null, yearTo: null, present: false, role: '', companyName: '' })}
              className='bg-transparent border-0 mb-3 mx-2'
            >
              <FaPlus className='mb-1' /> Add Another Project
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

export default Projects;