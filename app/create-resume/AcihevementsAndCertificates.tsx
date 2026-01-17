import React, { useEffect, useState, useRef } from 'react';
import { useForm, useFieldArray, Controller, useWatch } from 'react-hook-form';
import { FaPlus } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ReactQuill from '@/components/Editor/ReactQuillEditor';
import { TextField } from '@mui/material';
import ach from "@/assets/Images/resume-builder/achi.png";
import proj from "@/assets/Images/resume-builder/proj.png";
import tip from "@/assets/Images/resume-builder/tips.svg";
import { useResume } from '@/context/ResumeContext';
import CustomModal from '@/components/Modal/Modal';
import ToastMessage from '@/Layout/ToastMessage';
import { PaymentDetails } from '@/services/Admin';
import PackagePop from '@/components/PackagePop';
import { stripEmptyHtml } from '@/utils/htmlUtils';
import Image from 'next/image';

const validateAchievementsAndCertificates = {
  achievementName: {},
  year: {},
  courseName: {},
  certificateId: {},
  startDate: {},
  endDate: {},
};

interface Achievement {
  achievementName: string;
  year: Date | null;
  detail: string;
}

interface Certificate {
  certificateId: string;
  courseName: string;
  detail: string;
  present: boolean;
  startDate: Date | null;
  endDate: Date | null | 'Present';
}

interface AchievementsAndCertificatesProps {
  setResumeData: React.Dispatch<React.SetStateAction<any>>;
  step2: boolean;
  Generate: () => void;
  tips?: any;
  externalTips?: any;
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

const AchievementsAndCertificates: React.FC<AchievementsAndCertificatesProps> = ({
  setResumeData,
  Generate,
  step2,
  tips,
  externalTips
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
    trigger
  } = useForm<{
    achievements: Achievement[];
    certificates: Certificate[];
  }>({
    defaultValues: {
      achievements: [{ achievementName: '', year: null, detail: "" }],
      certificates: [
        {
          certificateId: '',
          courseName: '',
          detail: '',
          present: false,
          startDate: null,
          endDate: null,
        },
      ],
    },
    mode: 'onBlur',
  });

  const { fields: achievementFields, append: appendAchievement, remove: removeAchievement } = useFieldArray({
    control,
    name: 'achievements',
  });

  const { fields: certificateFields, append: appendCertificate, remove: removeCertificate } = useFieldArray({
    control,
    name: 'certificates',
  });

  const formData = useWatch({ control });
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [showTips, setShowTips] = useState(false);
  const [showTips2, setShowTips2] = useState(false);
  const tipsRef = useRef<HTMLDivElement>(null);
  const [isPremiumOpen, setPremiumOpen] = useState(false);
  const [Paydet, setPaydet] = useState(null);
  const [Loading, setLoading] = useState(true);
  const [achievementCharErrors, setAchievementCharErrors] = useState<{ [key: number]: boolean }>({});
  const [certificateCharErrors, setCertificateCharErrors] = useState<{ [key: number]: boolean }>({});

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

  const handleTipsButtonClick = () => {
    setShowTips(prev => !prev);
  };

  const handleTipsButtonClick2 = () => {
    setShowTips2(prev => !prev);
  };
  const tipsButtonRef = useRef<HTMLButtonElement>(null);

  const {
    fetchAiSuggestions,
    aiSuggestions,
    sectionType,
    resetAiSuggestions
  } = useResume();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tipsRef.current && !tipsRef.current.contains(event.target as Node)) {
        if (tipsButtonRef.current && !tipsButtonRef.current.contains(event.target as Node)) {
          setShowTips(false);
          setShowTips2(false);
        }
      }
    };

    if (showTips || showTips2) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTips, showTips2]);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${month} ${year}`;
  };

  const parseDate = (dateString: string): Date | null => {
    if (!dateString) return null;
    const [monthAbbr, yearStr] = dateString.split(' ');
    const monthIndex = monthNames.findIndex(m => m === monthAbbr);
    if (monthIndex === -1 || isNaN(parseInt(yearStr))) return null;
    return new Date(parseInt(yearStr), monthIndex, 1);
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

  const validateCharacterLimit = (markdownContent: string, index: number, type: 'achievement' | 'certificate'): boolean => {
    const plainText = getPlainTextFromMarkdown(markdownContent);
    const charCount = plainText.length;
    const limit = 500;

    if (charCount > limit) {
      if (type === 'achievement') {
        setAchievementCharErrors(prev => ({ ...prev, [index]: true }));
      } else {
        setCertificateCharErrors(prev => ({ ...prev, [index]: true }));
      }
      return false;
    } else {
      if (type === 'achievement') {
        setAchievementCharErrors(prev => ({ ...prev, [index]: false }));
      } else {
        setCertificateCharErrors(prev => ({ ...prev, [index]: false }));
      }
      return true;
    }
  };

  useEffect(() => {
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    const newTimeout = setTimeout(() => {
      const formattedData = {
        achievementDetails: formData.achievements && formData.achievements.map((ach) => ({
          achievementName: ach.achievementName,
          year: ach.year ? new Date(ach.year).toLocaleDateString('en-CA') : null,
          detail: stripEmptyHtml(ach.detail) || ''
        })),
        certificateDetails: formData.certificates && formData.certificates.map((cert) => ({
          certificateId: cert.certificateId,
          courseName: cert.courseName,
          detail: stripEmptyHtml(cert.detail) || '',
          present: cert.present ? 'Present' : '',
          startDate: cert.startDate ? formatDate(new Date(cert.startDate)) : null,
          endDate: cert.present
            ? 'Present'
            : cert.endDate && cert.endDate instanceof Date && !isNaN(cert.endDate.getTime())
              ? formatDate(new Date(cert.endDate))
              : "",
        })),
      };

      const storedData = getFromLocalStorage('resumeData');
      const resumeData = storedData ? JSON.parse(storedData) : { resume_data: {} };

      resumeData.resume_data = {
        ...resumeData.resume_data,
        ...formattedData,
      };

      setToLocalStorage('resumeData', JSON.stringify(resumeData));
      setResumeData(resumeData);

      if (step2) {
        Generate();
      }
    }, 3000);

    setTypingTimeout(newTimeout);

    return () => {
      if (newTimeout) {
        clearTimeout(newTimeout);
      }
    };
  }, [formData, setResumeData, step2, Generate]);

  useEffect(() => {
    const storedData = getFromLocalStorage('resumeData');
    if (storedData) {
      const resumeData = JSON.parse(storedData);
      const achievementsData = resumeData.resume_data?.achievementDetails?.map((ach: any) => ({
        achievementName: ach.achievementName,
        year: ach.year ? parseDate(ach.year) : null,
        detail: ach.detail || '',
      })) || [{ achievementName: '', year: null, detail: "" }];

      const certificatesData = resumeData.resume_data?.certificateDetails?.map((cert: any) => ({
        certificateId: cert.certificateId,
        courseName: cert.courseName,
        detail: cert.detail || '',
        present: cert.present === 'Present',
        startDate: cert.startDate ? parseDate(cert.startDate) : null,
        endDate: cert.endDate === 'Present' ? 'Present' : (cert.endDate ? parseDate(cert.endDate) : null)
      })) || [
          {
            certificateId: '',
            courseName: '',
            detail: '',
            present: false,
            startDate: null,
            endDate: null,
          },
        ];

      reset({
        achievements: achievementsData,
        certificates: certificatesData,
      });
    }
  }, [reset]);

  const onSubmit = (data: { achievements: Achievement[]; certificates: Certificate[] }) => {
    const formattedData = {
      achievementDetails: data.achievements.map((ach) => ({
        achievementName: ach.achievementName,
        year: ach.year ? new Date(ach.year).toLocaleDateString('en-CA') : null,
        detail: ach.detail || '',
      })),
      certificateDetails: data.certificates.map((cert) => ({
        certificateId: cert.certificateId,
        courseName: cert.courseName,
        detail: cert.detail || '',
        present: cert.present,
        startDate: cert.startDate ? new Date(cert.startDate).toLocaleDateString('en-CA') : null,
        endDate: cert.present
          ? 'Present'
          : cert.endDate && cert.endDate instanceof Date && !isNaN(cert.endDate.getTime())
            ? new Date(cert.endDate).toLocaleDateString('en-CA')
            : "",
      })),
    };

    const storedData = getFromLocalStorage('resumeData');
    const resumeData = storedData ? JSON.parse(storedData) : { resume_data: {} };

    resumeData.resume_data = {
      ...resumeData.resume_data,
      ...formattedData,
    };

    setToLocalStorage('resumeData', JSON.stringify(resumeData));
    setResumeData(resumeData);
  };

  const [showDetailSuggestions, setShowDetailSuggestions] = useState<number | null>(null);

  useEffect(() => {
    if (aiSuggestions && showDetailSuggestions !== null && sectionType === 'Certificates') {
      setValue(`certificates.${showDetailSuggestions}.detail`, aiSuggestions);
      resetAiSuggestions();
      setShowDetailSuggestions(null);
    }
  }, [aiSuggestions, showDetailSuggestions, setValue, resetAiSuggestions, sectionType]);

  const handleGetAiSuggestions = async (section: string, fieldName: string, index: number, feature?: number, value?: string) => {
    await fetchAiSuggestions('Certificates', "Details", feature, value);
    setShowDetailSuggestions(index);
  };

  return (
    <>
      <div className="container p-4 pb-0">
        <div style={{ display: 'flex', alignItems: 'center', position: 'relative', justifyContent: 'space-between' }} className='head-name mb-4'>
          <div className='d-flex align-items-end'>
            <Image src={ach} alt="" loading="lazy" width={30} height={30} />
            <h4 className='px-2 mb-0'>Achievements</h4>
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
                    Achievements Tips
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
            </>)}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Achievements Section */}
          {achievementFields.map((field, index) => {
            const currentDetail = watch(`achievements.${index}.detail`) || '';
            const plainText = getPlainTextFromMarkdown(currentDetail);
            const remainingChars = 500 - plainText.length;

            return (
              <div key={field.id} className="row m-0 mx-3">
                <div className='d-flex align-items-baseline justify-content-between'>
                  <h5 className='mb-0'>Achievement: {index + 1}</h5>
                  <button
                    type="button"
                    onClick={() => {
                      if (achievementFields.length > 1) {
                        removeAchievement(index);
                      } else {
                        setValue(`achievements.0.achievementName`, '');
                        setValue(`achievements.0.year`, null);
                        setValue(`achievements.0.detail`, '');
                      }
                    }}
                    className='bg-transparent border-0 fs-5'
                  >
                    <MdDelete />
                  </button>
                </div>

                <div className="col-lg-6 mb-3 pt-3">
                  <Controller
                    name={`achievements.${index}.achievementName`}
                    control={control}
                    rules={validateAchievementsAndCertificates.achievementName}
                    render={({ field }) => (
                      <TextField
                        label="Achievement Name"
                        variant="outlined"
                        fullWidth
                        value={field.value}
                        onChange={(e) => {
                          field.onChange(e);
                          trigger(`achievements.${index}`);
                        }}
                        error={!!errors.achievements?.[index]?.achievementName}
                        helperText={errors.achievements?.[index]?.achievementName?.message}
                      />
                    )}
                  />
                </div>

                <div className="col-lg-6 mb-3 pt-3">
                  <Controller
                    name={`achievements.${index}.year`}
                    control={control}
                    rules={validateAchievementsAndCertificates.year}
                    render={({ field: { value, onChange } }) => (
                      <DatePicker
                        selected={value}
                        onChange={onChange}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="Select year"
                        maxDate={new Date()}
                        showYearDropdown
                        scrollableYearDropdown
                        yearDropdownItemNumber={25}
                        customInput={
                          <TextField
                            label="Year"
                            variant="outlined"
                            fullWidth
                            error={!!errors.achievements?.[index]?.year}
                            helperText={errors.achievements?.[index]?.year?.message}
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
                        }
                      />
                    )}
                  />
                </div>

                <div className="col-lg-12 mb-3 pt-3">
                  <Controller
                    name={`achievements.${index}.detail`}
                    control={control}
                    render={({ field }) => (
                      <div className="position-relative">
                        <ReactQuill
                          value={field.value || ''}
                          onChange={(value: string) => {
                            if (validateCharacterLimit(value || '', index, 'achievement')) {
                              field.onChange(value);
                            }
                          }}
                          onBlur={field.onBlur}
                          placeholder="Describe the achievement, significance, and impact... (max 500 characters)"
                        />

                        {achievementCharErrors[index] && (
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
            onClick={() => appendAchievement({ achievementName: '', year: null, detail: "" })}
            className="mb-3 bg-transparent border-0 mx-4"
          >
            <FaPlus /> Add Another Achievement
          </button>

          {/* Certificates Section */}
          <div style={{ display: 'flex', alignItems: 'center', position: 'relative', justifyContent: 'space-between' }} className='head-name mb-4 mt-5'>
            <div className='d-flex align-items-end'>
              <Image src={proj} alt="" loading="lazy" width={30} height={30} />
              <h4 className='px-2 mb-0'>Certificates</h4>
            </div>

            {externalTips.length > 0 && (
              <>
                <button
                  ref={tipsButtonRef}
                  type="button"
                  className='tips-button'
                  onClick={handleTipsButtonClick2}
                >
                  <Image src={tip} alt="" width={20} height={20} /> Tips
                </button>
                {showTips2 && (
                  <div className='tips-box' ref={tipsRef}>
                    <h5>
                      <Image src={tip} alt="" width={20} height={20} className='p-1 mb-1' />
                      Certificates Tips
                    </h5>
                    <div className='fs-6'>
                      {externalTips.map((tip: any, index: number) => (
                        <div
                          key={index}
                          dangerouslySetInnerHTML={{ __html: tip.resume_tips || '' }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>)}
          </div>

          {certificateFields.map((field, index) => {
            const currentDetail = watch(`certificates.${index}.detail`) || '';
            const plainText = getPlainTextFromMarkdown(currentDetail);
            const remainingChars = 500 - plainText.length;

            return (
              <div key={`cert-${field.id}-${index}`} className="row mx-3">
                <div className='d-flex align-items-baseline justify-content-between'>
                  <h5 className='mb-0 mt-3'>Certificate: {index + 1}</h5>
                  <button
                    type="button"
                    onClick={() => {
                      if (certificateFields?.length > 1) {
                        removeCertificate(index);
                      } else {
                        setValue(`certificates.0.certificateId`, '');
                        setValue(`certificates.0.courseName`, '');
                        setValue(`certificates.0.detail`, '');
                        setValue(`certificates.0.present`, false);
                        setValue(`certificates.0.startDate`, null);
                        setValue(`certificates.0.endDate`, null);
                      }
                    }}
                    className='bg-transparent border-0 fs-5'
                  >
                    <MdDelete />
                  </button>
                </div>

                <div className="col-lg-6 mb-3 pt-3">
                  <Controller
                    name={`certificates.${index}.courseName`}
                    control={control}
                    rules={validateAchievementsAndCertificates.courseName}
                    render={({ field }) => (
                      <TextField
                        label="Course Name"
                        variant="outlined"
                        fullWidth
                        value={field.value}
                        onChange={(e) => {
                          field.onChange(e);
                          trigger(`certificates.${index}`);
                        }}
                        error={!!errors.certificates?.[index]?.courseName}
                        helperText={errors.certificates?.[index]?.courseName?.message}
                      />
                    )}
                  />
                </div>

                <div className="col-lg-6 mb-3 pt-3">
                  <Controller
                    name={`certificates.${index}.certificateId`}
                    control={control}
                    rules={validateAchievementsAndCertificates.certificateId}
                    render={({ field }) => (
                      <TextField
                        label="Certificate ID"
                        variant="outlined"
                        fullWidth
                        value={field.value}
                        onChange={(e) => {
                          field.onChange(e);
                          trigger(`certificates.${index}`);
                        }}
                        error={!!errors.certificates?.[index]?.certificateId}
                        helperText={errors.certificates?.[index]?.certificateId?.message}
                      />
                    )}
                  />
                </div>

                <div className="col-lg-12 mb-3 pt-3">
                  <Controller
                    name={`certificates.${index}.detail`}
                    control={control}
                    render={({ field }) => (
                      <div className="position-relative">
                        <ReactQuill
                          value={field.value || ''}
                          onChange={(value: string) => {
                            if (validateCharacterLimit(value || '', index, 'certificate')) {
                              field.onChange(value);
                            }
                          }}
                          onBlur={field.onBlur}
                          placeholder="Describe the certificate, skills learned, and relevance... (max 500 characters)"
                        />

                        {certificateCharErrors[index] && (
                          <div className="text-danger small mt-1">
                            Maximum 500 characters allowed!
                          </div>
                        )}
                      </div>
                    )}
                  />
                </div>

                <div className="col-lg-6 mb-3 pt-3">
                  <Controller
                    name={`certificates.${index}.startDate`}
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <DatePicker
                        selected={value}
                        onChange={onChange}
                        dateFormat="MMM yyyy"
                        showMonthDropdown
                        showYearDropdown
                        dropdownMode="select"
                        minDate={new Date(1900, 0, 1)}
                        maxDate={new Date()}
                        placeholderText="Start Month/Year"
                        customInput={
                          <TextField
                            label="Start Month/Year"
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
                        }
                      />
                    )}
                  />

                  <Controller
                    name={`certificates.${index}.present`}
                    control={control}
                    render={({ field }) => (
                      <div className="form-check d-flex align-items-end mt-4 p-0 mb-2">
                        <input
                          className="form-check-input mx-2"
                          type="checkbox"
                          checked={field.value}
                          onChange={(e) => {
                            const isChecked = e.target.checked;
                            field.onChange(isChecked);
                            if (isChecked) {
                              setValue(`certificates.${index}.endDate`, 'Present');
                            } else {
                              setValue(`certificates.${index}.endDate`, null);
                            }
                          }}
                        />
                        <label className="form-check-label mt-1">Present</label>
                      </div>
                    )}
                  />
                </div>

                <div className="col-lg-6 mb-3 pt-3">
                  <Controller
                    name={`certificates.${index}.endDate`}
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <DatePicker
                        selected={value instanceof Date ? value : null}
                        onChange={onChange}
                        dateFormat="MMM yyyy"
                        showMonthDropdown
                        showYearDropdown
                        dropdownMode="select"
                        disabled={watch(`certificates.${index}.present`)}
                        maxDate={new Date()}
                        minDate={watch(`certificates.${index}.startDate`) || undefined}
                        placeholderText="End Month/Year"
                        customInput={
                          <TextField
                            label="End Month/Year"
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
                        }
                      />
                    )}
                  />
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={() =>
              appendCertificate({
                certificateId: '',
                courseName: '',
                detail: '',
                present: false,
                startDate: null,
                endDate: null,
              })
            }
            className="bg-transparent border-0 mx-4"
          >
            <FaPlus /> Add Another Certificate
          </button>
          <br />
        </form>
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

export default AchievementsAndCertificates;