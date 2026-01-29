import React, { useEffect, useState, useRef } from 'react';
import { useForm, useFieldArray, Controller, useWatch } from 'react-hook-form';
import { FaPlus } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ReactQuill from '@/components/Editor/ReactQuillEditor';
import { TextField, FormHelperText } from '@mui/material';
import dec from "@/assets/Images/resume-builder/dec.png";
import ref from "@/assets/Images/resume-builder/ref.png";
import tip from "@/assets/Images/resume-builder/tips.svg";
import { useResume } from '@/context/ResumeContext';
import CustomModal from '@/components/Modal/Modal';
import { stripEmptyHtml } from '@/utils/htmlUtils';
import ToastMessage from '@/Layout/ToastMessage';
import { PaymentDetails } from '@/services/Admin';
import PackagePop from '@/components/PackagePop';
import Image from 'next/image';

const validateDeclarations = {
  name: {},
  declaration: {},
  place: {},
  date: {},
};

const validateReferences = {
  refName: {
    pattern: {
      value: /^[0-9]+$/,
      message: 'Phone must contain only numbers'
    },
    minLength: {
      value: 10,
      message: 'Phone must be at least 10 digits'
    },
    maxLength: {
      value: 14,
      message: 'Phone must be at most 14 digits'
    },
  },
  refEmail: {
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Enter a valid email address'
    },
  },
};

interface Declaration {
  name: string;
  declaration: string;
  place: string;
  date: Date | null;
}

interface Reference {
  refName: string;
  refWebsite: string;
  refEmail: string;
  refJobTitle: string;
  refPhone: string;
  refCompanyName: string;
  details?: string;
}

interface DeclarationsAndReferencesProps {
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

const DeclarationsAndReferences: React.FC<DeclarationsAndReferencesProps> = ({
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
    declarations: Declaration[];
    referenceDetails: Reference[];
  }>({
    defaultValues: {
      declarations: [{ name: '', declaration: '', place: '', date: null }],
      referenceDetails: [{ refName: '', refWebsite: '', refEmail: '', refJobTitle: '', refPhone: '', refCompanyName: '', details: '' }],
    },
    mode: 'onBlur',
  });

  const { fields: declarationFields, append: appendDeclaration, remove: removeDeclaration } = useFieldArray({
    control,
    name: 'declarations',
  });

  const { fields: referenceFields, append: appendReference, remove: removeReference } = useFieldArray({
    control,
    name: 'referenceDetails',
  });

  const formData = useWatch({ control });
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const {
    fetchAiSuggestions,
    aiSuggestions,
    sectionType,
    resetAiSuggestions
  } = useResume();

  const [Paydet, setPaydet] = useState(null);
  const [Loading, setLoading] = useState(true);
  const [declarationCharErrors, setDeclarationCharErrors] = useState<{ [key: number]: boolean }>({});
  const [referenceCharErrors, setReferenceCharErrors] = useState<{ [key: number]: boolean }>({});
  const [showTips, setShowTips] = useState(false);
  const [showTips2, setShowTips2] = useState(false);
  const tipsRef = useRef<HTMLDivElement>(null);
  const tipsButtonRef = useRef<HTMLButtonElement>(null);
  const [isPremiumOpen, setPremiumOpen] = useState(false);
  const [showDetailSuggestions, setShowDetailSuggestions] = useState<number | null>(null);

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

  const validateCharacterLimit = (markdownContent: string, index: number, type: 'declaration' | 'reference'): boolean => {
    const plainText = getPlainTextFromMarkdown(markdownContent);
    const charCount = plainText.length;
    const limit = 4000;

    if (charCount > limit) {
      if (type === 'declaration') {
        setDeclarationCharErrors(prev => ({ ...prev, [index]: true }));
      } else {
        setReferenceCharErrors(prev => ({ ...prev, [index]: true }));
      }
      return false;
    } else {
      if (type === 'declaration') {
        setDeclarationCharErrors(prev => ({ ...prev, [index]: false }));
      } else {
        setReferenceCharErrors(prev => ({ ...prev, [index]: false }));
      }
      return true;
    }
  };

  useEffect(() => {
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    const newTimeout = setTimeout(() => {
      const storedData = getFromLocalStorage('resumeData');
      const resumeData = storedData ? JSON.parse(storedData) : { resume_data: {} };

      resumeData.resume_data = {
        ...resumeData.resume_data,
        declarations: formData.declarations?.map(declaration => ({
          ...declaration,
          declaration: stripEmptyHtml(declaration.declaration) || '',
          date: declaration.date ? formatDate(declaration.date) : null,
        })) || [],
        referenceDetails: formData.referenceDetails?.map(ref => ({
          ...ref,
          details: stripEmptyHtml(ref.details) || '',
        })) || [],
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
  }, [formData, step2]);

  useEffect(() => {
    if (aiSuggestions && showDetailSuggestions !== null && sectionType === 'Declarations') {
      setValue(`declarations.${showDetailSuggestions}.declaration`, aiSuggestions);
      resetAiSuggestions();
      setShowDetailSuggestions(null);
    }
  }, [aiSuggestions, showDetailSuggestions, setValue, resetAiSuggestions, sectionType]);

  const formatDate = (date: Date | null): string => {
    if (!date || isNaN(date.getTime())) return '';
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatDisplayDate = (date: Date | null): string => {
    if (!date || isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const storedData = getFromLocalStorage('resumeData');
    if (storedData) {
      const resumeData = JSON.parse(storedData);
      const declarations = resumeData.resume_data?.declarations?.map((declaration: any) => ({
        ...declaration,
        date: declaration.date ? new Date(declaration.date.split('/').reverse().join('-')) : null,
      })) || [{ name: '', declaration: '', place: '', date: null }];

      const referenceDetails = resumeData.resume_data?.referenceDetails || [
        { refName: '', refWebsite: '', refEmail: '', refJobTitle: '', refPhone: '', refCompanyName: '', details: '' },
      ];

      reset({ declarations, referenceDetails });
    }
  }, [reset]);

  const onSubmit = (data: { declarations: Declaration[]; referenceDetails: Reference[] }) => {
    const formattedData = {
      declarations: data.declarations,
      referenceDetails: data.referenceDetails.map(ref => ({
        refName: ref.refName,
        refWebsite: ref.refWebsite,
        refEmail: ref.refEmail,
        refJobTitle: ref.refJobTitle,
        refPhone: ref.refPhone,
        refCompanyName: ref.refCompanyName,
        details: ref.details || '',
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

  const handleRemoveReference = (index: number) => {
    if (referenceFields.length === 1) {
      reset({
        referenceDetails: [{ refName: '', refWebsite: '', refEmail: '', refJobTitle: '', refPhone: '', refCompanyName: '', details: '' }],
      });
    } else {
      removeReference(index);
    }
  };

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

  const handleTipsButtonClick = () => {
    setShowTips(prev => !prev);
  };

  const handleTipsButtonClick2 = () => {
    setShowTips2(prev => !prev);
  };

  const handleInputChange = async (fieldName: string, onChange: (value: any) => void, value: any) => {
    onChange(value);

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    const newTimeout = setTimeout(() => {
      trigger(fieldName as any);
    }, 4000);

    setTypingTimeout(newTimeout);
  };

  const handleGetAiSuggestions = async (section: string, fieldName: string, index: number, feature?: number, value?: string) => {
    await fetchAiSuggestions('Declarations', 'declaration', feature, value);
    setShowDetailSuggestions(index);
  };

  return (
    <>
      <div className="container p-4 pb-0 pt-2">
        <form onSubmit={handleSubmit(onSubmit)} className="row mx-1 m-0">
          {/* Declarations Section */}
          <div style={{ display: 'flex', alignItems: 'center', position: 'relative', justifyContent: 'space-between' }} className='head-name mb-4'>
            <div className='d-flex align-items-end'>
              <Image src={dec} alt="" loading="lazy" width={30} height={30} />
              <h4 className='px-2 mb-0'>Declarations</h4>
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
                    <h5>Declarations Tips</h5>
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

          {declarationFields.map((field, index) => {
            const currentDeclaration = watch(`declarations.${index}.declaration`) || '';
            const plainText = getPlainTextFromMarkdown(currentDeclaration);
            const remainingChars = 4000 - plainText.length;

            return (
              <div key={field.id} className="row mb-2 m-0">
                <div className='d-flex align-items-baseline justify-content-between'>
                  <h5>Declaration</h5>
                </div>

                <div className="col-lg-6 mb-4 pb-2">
                  <Controller
                    name={`declarations.${index}.name`}
                    control={control}
                    rules={validateDeclarations.name}
                    render={({ field }) => (
                      <TextField
                        label="Name"
                        type="text"
                        placeholder="Name"
                        value={field.value}
                        onChange={field.onChange}
                        className='w-100'
                        inputProps={{ maxLength: 50 }}
                      />
                    )}
                  />
                </div>

                <div className="col-lg-6 mb-4 pb-2">
                  <Controller
                    name={`declarations.${index}.place`}
                    control={control}
                    rules={validateDeclarations.place}
                    render={({ field }) => (
                      <TextField
                        label="Place"
                        type="text"
                        placeholder="Place"
                        value={field.value}
                        onChange={field.onChange}
                        className='w-100'
                        inputProps={{ maxLength: 100 }}
                      />
                    )}
                  />
                </div>

                <div className="col-lg-6 mb-4 pb-2">
                  <Controller
                    name={`declarations.${index}.date`}
                    control={control}
                    rules={validateDeclarations.date}
                    render={({ field }) => (
                      <DatePicker
                        selected={field.value && !isNaN(field.value.getTime()) ? field.value : null}
                        onChange={field.onChange}
                        maxDate={new Date()}
                        showYearDropdown
                        scrollableYearDropdown
                        yearDropdownItemNumber={25}
                        customInput={
                          <TextField
                            label="Select Date"
                            type="text"
                            fullWidth
                            className='w-100'
                            value={field.value ? formatDisplayDate(field.value) : ''}
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
                        placeholderText="Select Date"
                        dateFormat="yyyy-MM-dd"
                      />
                    )}
                  />
                </div>

                <div className="col-lg-12 mb-3">
                  <Controller
                    name={`declarations.${index}.declaration`}
                    rules={validateDeclarations.declaration}
                    control={control}
                    render={({ field }) => (
                      <div className="position-relative">
                        <ReactQuill
                          value={field.value || ''}
                          onChange={(value: string) => {
                            if (validateCharacterLimit(value || '', index, 'declaration')) {
                              field.onChange(value);
                            }
                          }}
                          onBlur={field.onBlur}
                          placeholder="Write your declaration statement... (max 4000 characters)"
                        />

                        {declarationCharErrors[index] && (
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

          {/* References Section */}
          <div style={{ display: 'flex', alignItems: 'center', position: 'relative', justifyContent: 'space-between' }} className='head-name my-4'>
            <div className='d-flex align-items-end'>
              <Image src={ref} alt="" loading="lazy" width={30} height={30} />
              <h4 className='px-2 mb-0'>References</h4>
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
                      References Tips
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

          {referenceFields.map((field, index) => {
            const currentDetails = watch(`referenceDetails.${index}.details`) || '';
            const plainText = getPlainTextFromMarkdown(currentDetails);
            const remainingChars = 4000 - plainText.length;

            return (
              <div key={field.id} className="row mb-2 m-0">
                <div className='d-flex align-items-baseline justify-content-between'>
                  <h5 className='mb-3'>Reference</h5>
                  <button
                    type="button"
                    onClick={() => handleRemoveReference(index)}
                    className='bg-transparent border-0 fs-5'
                  >
                    <MdDelete />
                  </button>
                </div>

                <div className="col-lg-6 mb-4 pb-2">
                  <Controller
                    name={`referenceDetails.${index}.refName`}
                    control={control}
                    rules={{ maxLength: { value: 50, message: 'Name should not exceed 50 characters' } }}
                    render={({ field }) => (
                      <TextField
                        label="Name"
                        type="text"
                        placeholder="Name"
                        value={field.value}
                        onChange={field.onChange}
                        className='w-100'
                        inputProps={{ maxLength: 50 }}
                      />
                    )}
                  />
                </div>

                <div className="col-lg-6 mb-4 pb-2">
                  <Controller
                    name={`referenceDetails.${index}.refWebsite`}
                    control={control}
                    rules={{
                      pattern: {
                        value: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
                        message: 'Enter a valid website URL'
                      }
                    }}
                    render={({ field }) => (
                      <div>
                        <TextField
                          label="Website"
                          type="text"
                          placeholder="Website URL"
                          value={field.value}
                          onChange={(e) => handleInputChange(`referenceDetails.${index}.refWebsite`, field.onChange, e.target.value)}
                          onBlur={field.onBlur}
                          className='w-100'
                          error={!!errors.referenceDetails?.[index]?.refWebsite}
                          inputProps={{ maxLength: 100 }}
                        />
                        {errors.referenceDetails?.[index]?.refWebsite && (
                          <FormHelperText error>
                            {errors.referenceDetails?.[index]?.refWebsite?.message}
                          </FormHelperText>
                        )}
                      </div>
                    )}
                  />
                </div>

                <div className="col-lg-6 mb-4 pb-2">
                  <Controller
                    name={`referenceDetails.${index}.refJobTitle`}
                    control={control}
                    rules={{ maxLength: { value: 50, message: 'Job title should not exceed 50 characters' } }}
                    render={({ field }) => (
                      <TextField
                        label="Job Title"
                        type="text"
                        placeholder="Job Title"
                        value={field.value}
                        onChange={field.onChange}
                        className='w-100'
                        inputProps={{ maxLength: 50 }}
                      />
                    )}
                  />
                </div>

                <div className="col-lg-6 mb-4 pb-2">
                  <Controller
                    name={`referenceDetails.${index}.refPhone`}
                    control={control}
                    rules={validateReferences.refName}
                    render={({ field }) => (
                      <div>
                        <TextField
                          label="Phone"
                          type="tel"
                          placeholder="Phone"
                          value={field.value}
                          onChange={(e) => handleInputChange(`referenceDetails.${index}.refPhone`, field.onChange, e.target.value)}
                          onBlur={field.onBlur}
                          className='w-100'
                          error={!!errors.referenceDetails?.[index]?.refPhone}
                          onKeyDown={(e) => {
                            if (!/[0-9+ -]|Backspace|Delete|ArrowLeft|ArrowRight|Tab/.test(e.key)) {
                              e.preventDefault();
                            }
                          }}
                          inputProps={{ maxLength: 14 }}
                        />
                        {errors.referenceDetails?.[index]?.refPhone && (
                          <FormHelperText error>
                            {errors.referenceDetails?.[index]?.refPhone?.message}
                          </FormHelperText>
                        )}
                      </div>
                    )}
                  />
                </div>

                <div className="col-lg-6 mb-4 pb-2">
                  <Controller
                    name={`referenceDetails.${index}.refEmail`}
                    control={control}
                    rules={validateReferences.refEmail}
                    render={({ field }) => (
                      <TextField
                        label="Email"
                        type="email"
                        placeholder="Email"
                        value={field.value}
                        onChange={field.onChange}
                        className='w-100'
                        error={!!errors.referenceDetails?.[index]?.refEmail}
                        helperText={errors.referenceDetails?.[index]?.refEmail?.message}
                        inputProps={{ maxLength: 50 }}
                      />
                    )}
                  />
                </div>

                <div className="col-lg-6 mb-4 pb-2">
                  <Controller
                    name={`referenceDetails.${index}.refCompanyName`}
                    control={control}
                    rules={{ maxLength: { value: 50, message: 'Company name should not exceed 50 characters' } }}
                    render={({ field }) => (
                      <TextField
                        label="Company Name"
                        type="text"
                        placeholder="Company Name"
                        value={field.value}
                        onChange={field.onChange}
                        className='w-100'
                        inputProps={{ maxLength: 50 }}
                      />
                    )}
                  />
                </div>

                <div className="col-lg-12 mb-3">
                  <Controller
                    name={`referenceDetails.${index}.details`}
                    control={control}
                    render={({ field }) => (
                      <div className="position-relative">
                        <ReactQuill
                          value={field.value || ''}
                          onChange={(value: string) => {
                            if (validateCharacterLimit(value || '', index, 'reference')) {
                              field.onChange(value);
                            }
                          }}
                          onBlur={field.onBlur}
                          placeholder="Additional details about the reference... (max 4000 characters)"
                        />

                        {referenceCharErrors[index] && (
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

export default DeclarationsAndReferences;