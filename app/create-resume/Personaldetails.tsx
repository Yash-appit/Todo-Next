"use client";

import { useState, useEffect, useRef } from 'react';
import AvatarEditor from 'react-avatar-editor';
import { useForm, useWatch, Controller } from 'react-hook-form';
import CustomModal from "@/components/Modal/Modal";
import prof from "@/assets/Images/resume-builder/profile.png";
import { AiWriter, UploadImage } from '@/services/resume/Index';
import { RxCrossCircled } from "react-icons/rx";
import pers from "@/assets/Images/resume-builder/pers.png";
import { TextField } from '@mui/material';
import ReactQuill from '@/components/Editor/ReactQuillEditor';
import { stripEmptyHtml } from '@/utils/htmlUtils';
import edi from "@/assets/Images/resume-builder/editor.png";
import sty from "@/assets/Images/resume-builder/sty.png";
import { RiEditFill } from "react-icons/ri";
import SelectBox from '@/Layout/Selectbox';
import 'react-datepicker/dist/react-datepicker.css';
import DatePicker from 'react-datepicker';
import { IoIosArrowBack } from "react-icons/io";
import { Spinner } from 'react-bootstrap';
import tip from "@/assets/Images/resume-builder/tips.svg";
import { Slider } from '@mui/material';
import { useResume } from '@/context/ResumeContext';
import { PaymentDetails } from '@/services/Admin';
import ToastMessage from '@/Layout/ToastMessage';
import PackagePop from '@/components/PackagePop';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface PersonaldetailsProps {
  tips: any;
  step4: boolean;
  step3: boolean;
  step2: boolean;
  setStep3: (value: boolean) => void;
  setStep4: (value: boolean) => void;
  Generate: () => void;
  setResumeData: React.Dispatch<React.SetStateAction<any>>;
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

const Personaldetails: React.FC<PersonaldetailsProps> = ({ setResumeData, Generate, step2, step4, step3, setStep4, setStep3, tips }) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    watch,
    formState: { errors },
    trigger
  } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange'
  });

  const [image, setImage] = useState<File | null>(null);
  const [editor, setEditor] = useState<AvatarEditor | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [uploadImage, setUploadImage] = useState<string | null>(null);
  const [isContOpen, setContOpen] = useState(false);
  const [isPremiumOpen, setPremiumOpen] = useState(false);
  const formData = useWatch({ control });
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const tipsRef = useRef<HTMLDivElement>(null);
  const tipsButtonRef = useRef<HTMLButtonElement>(null);
  const [showTips, setShowTips] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    fetchAiSuggestions,
    aiSuggestions,
    sectionType,
  } = useResume();

  const [Loading, setLoading] = useState(true);
  const [Paydet, setPaydet] = useState(null);

  const [showAboutSuggestions, setShowAboutSuggestions] = useState(false);
  const [aboutUsCharError, setAboutUsCharError] = useState<string>('');
  const [objectiveCharError, setObjectiveCharError] = useState<string>('');

  const getResumeData = (): any => {
    const storedData = getFromLocalStorage('resumeData');
    return storedData ? JSON.parse(storedData) : {};
  };

  const [startDate, setStartDate] = useState<Date | null>(null);
  const resumeData = getResumeData();
  const ResumeImage = resumeData?.resume_data?.personaldetails?.imageUrl || getFromLocalStorage('resumeImage');

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState<string | null>(getFromLocalStorage('resumeName'));

  const [zoom, setZoom] = useState<number>(1);

  const saveResumeData = (data: any) => {
    setToLocalStorage('resumeData', JSON.stringify(data));
  };

  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const maxSize = 5 * 1024 * 1024;

      if (selectedFile.size > maxSize) {
        ToastMessage({
          type: "error",
          message: "Image size should not exceed 5MB",
        });
        return;
      }
      setImage(e.target.files[0]);
      setCroppedImage(null);
      setContOpen(true);
    }
  };

  const previousDataRef = useRef<string>('');

  useEffect(() => {
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    const newTimeout = setTimeout(() => {
      const formattedData = {
        ...formData,
        aboutUs: stripEmptyHtml(formData.aboutUs) || '',
        objective: stripEmptyHtml(formData.objective) || '',
        imageUrl: uploadImage || ResumeImage || '',
      };

      // Compare with previous data to detect actual changes
      const currentDataString = JSON.stringify(formattedData);
      const hasDataChanged = previousDataRef.current !== currentDataString;

      if (hasDataChanged) {
        const resumeData = getResumeData();
        const updatedData = {
          ...resumeData,
          resume_data: {
            ...resumeData.resume_data,
            personaldetails: formattedData,
          },
        };
        saveResumeData(updatedData);
        setResumeData(updatedData);

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
  }, [formData, uploadImage, ResumeImage, step2, Generate, setResumeData]);

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

  useEffect(() => {
    const resumeData = getResumeData();
    const personalDetails = resumeData?.resume_data?.personaldetails;

    if (personalDetails) {
      reset({
        name: personalDetails.name || '',
        email: personalDetails.email || '',
        profession: personalDetails.profession || '',
        address: personalDetails.address || '',
        city: personalDetails.city || '',
        country: personalDetails.country || '',
        pincode: personalDetails.pincode || '',
        phone: personalDetails.phone || '',
        website: personalDetails.website || '',
        aboutUs: personalDetails.aboutUs || '',
        objective: personalDetails.objective || '',
        nationality: personalDetails.nationality || '',
        gender: personalDetails.gender || '',
        maritalStatus: personalDetails.maritalStatus || '',
        dob: personalDetails.dob || null,
      });

      if (personalDetails.dob && !personalDetails.dob.includes('/')) {
        setStartDate(new Date(personalDetails.dob));
      } else {
        setStartDate(personalDetails.dob ? parseDMYToDate(personalDetails.dob) : null);
      }
      trigger(['name', 'phone']);
    }
    else {
      trigger(['name', 'phone']);
    }
  }, [reset, trigger]);

  const [showObjectiveSuggestions, setShowObjectiveSuggestions] = useState(false);

  useEffect(() => {
    if (aiSuggestions && showAboutSuggestions && sectionType === 'Personaldetails') {
      setValue('aboutUs', aiSuggestions);
      setShowAboutSuggestions(!showAboutSuggestions);
    }

    if (aiSuggestions && showObjectiveSuggestions && sectionType === 'Personaldetails') {
      setValue('objective', aiSuggestions);
      setShowObjectiveSuggestions(!showObjectiveSuggestions);
    }
  }, [aiSuggestions, setValue, sectionType, showAboutSuggestions, showObjectiveSuggestions]);

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

  const formatDateToDMY = (date: Date | null): string => {
    if (!date) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const parseDMYToDate = (dateString: string): Date | null => {
    if (!dateString || dateString === 'NaN/NaN/NaN') return null;

    if (dateString.includes('-')) {
      return new Date(dateString);
    }

    const [day, month, year] = dateString.split('/').map(Number);
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    return new Date(year, month - 1, day);
  };

  const handleDateChange = (date: Date | null) => {
    setStartDate(date);
    const formattedDate = date ? formatDateToDMY(date) : '';
    setValue('dob', formattedDate, { shouldValidate: true });
  };

  const gender = [
    { value: 'Male' },
    { value: 'Female' },
    { value: 'Others' },
  ];

  const MaritalStatus = [
    { value: 'Single' },
    { value: 'Married' },
    { value: 'Divorced' },
    { value: 'Widowed' },
    { value: 'Separated' },
  ];

  const handleRemoveImage = () => {
    const resumeData = getResumeData();
    localStorage.removeItem('resumeImage');
    const updatedData = {
      ...resumeData,
      resume_data: {
        ...resumeData.resume_data,
        personaldetails: {
          ...resumeData.resume_data?.personaldetails,
          imageUrl: '',
        },
      },
    };
    saveResumeData(updatedData);
    setResumeData(updatedData);
    setUploadImage(null);
    Generate();
  };



  const handleCrop = async () => {
    if (editor) {
      try {
        setIsUploading(true);
        setContOpen(false);
        const cropped = editor.getImage().toDataURL();
        setCroppedImage(cropped);

        const blob = await fetch(cropped).then((res) => res.blob());
        const file = new File([blob], "cropped-image.png", { type: blob.type });

        const uploadResponse = await UploadImage(file, "cover_image");

        if (uploadResponse) {
          const resumeData = getResumeData();
          const updatedData = {
            ...resumeData,
            resume_data: {
              ...resumeData.resume_data,
              personaldetails: {
                ...resumeData.resume_data?.personaldetails,
                imageUrl: uploadResponse,
              },
            },
          };
          saveResumeData(updatedData);
          setUploadImage(uploadResponse);
          setToLocalStorage('resumeImage', uploadResponse);
        } else {
          console.error("Image upload failed:", uploadResponse);
        }
      } catch (error: any) {
        console.error("Error during cropping/upload:", error);
        ToastMessage({
          type: "error",
          message: error?.message || error || "Failed to upload image. Please try again.",
        });
      } finally {
        setIsUploading(false);
        setZoom(1);
      }
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

  const validateCharacterLimit = (markdownContent: string, fieldName: 'aboutUs' | 'objective'): boolean => {
    const plainText = getPlainTextFromMarkdown(markdownContent);
    const charCount = plainText.length;
    const limit = fieldName === 'aboutUs' ? 700 : 500;

    if (charCount > limit) {
      const errorMessage = `Character limit exceeded by ${charCount - limit} characters. Please reduce the content.`;
      if (fieldName === 'aboutUs') {
        setAboutUsCharError(errorMessage);
      } else {
        setObjectiveCharError(errorMessage);
      }
      return false;
    } else {
      if (fieldName === 'aboutUs') {
        setAboutUsCharError('');
      } else {
        setObjectiveCharError('');
      }
      return true;
    }
  };

  const onSubmit = (data: any) => {
    const resumeData = getResumeData();
    const updatedData = {
      ...resumeData,
      resume_data: {
        ...resumeData.resume_data,
        personaldetails: {
          ...data,
          imageUrl: uploadImage || resumeData.resume_data?.personaldetails?.imageUrl || '',
        },
      },
    };
    saveResumeData(updatedData);
    setResumeData(updatedData);
  };

  const Editor = () => {
    setStep4(true);
    setStep3(false);
  };

  const Style = () => {
    setStep3(true);
    setStep4(false);
  };

  const [isLoadingAiSuggestions2, setIsLoadingAiSuggestions2] = useState(false);

  const handleGetAiSuggestions = async (section: 'Personaldetails', fieldName: 'aboutUs' | 'objective', feature?: number, value?: string) => {
    await fetchAiSuggestions(section, fieldName, feature, value);
    if (fieldName === 'aboutUs') {
      setShowAboutSuggestions(true);
      setShowObjectiveSuggestions(false);
    } else {
      setShowObjectiveSuggestions(true);
      setShowAboutSuggestions(false);
    }
  };

  return (
    <div className='container p-0'>
      <button
        className="prim-but back"
        type='button'
        onClick={() => window.location.href = '/resumes'}
        style={{
          position: 'fixed',
          top: '15px',
          padding: '2px 10px 8px 10px !important',
          minWidth: 'max-content',
          cursor: 'pointer',
          borderRadius: '30px !important',
          textAlign: 'left',
          height: 'max-content',
          lineHeight: "14px"
        }}>
        <IoIosArrowBack />
      </button>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="row p-3 pt-4 px-5 m-0">
          {isEditingTitle ? (
            <TextField
              value={title || ''}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => {
                setIsEditingTitle(false);
                setToLocalStorage('resumeName', title || "");
                Generate();
              }}
              className='title'
              fullWidth
              autoFocus
              variant="standard"
              InputProps={{
                disableUnderline: true,
                style: {
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  padding: 0,
                  margin: 0
                }
              }}
              inputProps={{ maxLength: 50 }}
              sx={{
                '& .MuiInputBase-root': {
                  padding: 0,
                  margin: 0
                }
              }}
            />
          ) : (
            <h3 className='text-center my-4 mt-3'>
              {title || 'Untitled'}
              <button
                type="button"
                onClick={() => setIsEditingTitle(true)}
                className="fs-4 border-0 bg-transparent sec-col"
              >
                <RiEditFill />
              </button>
            </h3>
          )}

          <div className='d-flex justify-content-between py-4 align-items-center tabbing'>
            <span onClick={Editor} className={`${step4 ? 'active' : ''}`}>
              <Image src={edi} alt="" width={20} height={20} />Editor
            </span>
            <span onClick={Style} className={`${step3 ? 'active' : ''}`}>
              <Image src={sty} alt="" width={20} height={20} />Style
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', position: 'relative', justifyContent: 'space-between' }} className='head-name'>
            <div className='d-flex align-items-end'>
              <Image src={pers} alt="" loading="lazy" width={30} height={30} />
              <h4 className='px-2 mb-0'>Personal Details</h4>
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
                  <div className='tips-box rounded-4' ref={tipsRef}>
                    <h5 className='mb-2'>
                      <Image src={tip} alt="" width={20} height={20} className='p-1 mb-1' />
                      Personal Details Tips
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

          <div className="col-lg-6">
            <div className='mt-3'>
              <TextField
                label="Profession"
                fullWidth
                placeholder="Profession"
                value={formData.profession || ''}
                {...register('profession')}
                inputProps={{ maxLength: 50 }}
              />
            </div>
          </div>

          <div className="col-lg-6 m-auto d-flex mt-3 mb-4">
            <div className='pic-upload position-relative'>
              {!ResumeImage || ResumeImage === "undefined" ? (
                <Image src={prof} alt="Default profile" width={150} height={150} />
              ) : (
                <>
                  <Image
                    src={ResumeImage}
                    alt="Profile"
                    className="mt-2"
                    width={150}
                    height={150}
                    style={{ objectFit: 'cover', borderRadius: '50%' }}
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="btn btn-danger position-absolute end-0"
                    style={{
                      borderRadius: '50%',
                      width: '30px',
                      height: '30px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0
                    }}
                  >
                    <RxCrossCircled />
                  </button>
                </>
              )}

              <div className='position-relative'>
                <label className='btn btn-primary'>
                  {isUploading ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    "Upload Avatar"
                  )}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onImageChange}
                  disabled={isUploading}
                  ref={fileInputRef}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0,
                    cursor: 'pointer'
                  }}
                />
              </div>
            </div>
          </div>

          <div className='col-lg-6 mb-4 special'>
            <TextField
              fullWidth
              label="Name"
              placeholder="Full Name"
              value={formData.name || ''}
              {...register('name', {
                required: 'Name is required',
                onBlur: () => trigger('name')
              })}
              inputProps={{ maxLength: 50 }}
              error={!!errors.name}
              helperText={errors.name?.message?.toString()}
            />
          </div>

          <div className="col-lg-6 mb-4 pb-2 special">
            <TextField
              label="Email"
              fullWidth
              value={formData.email || ''}
              placeholder="Email"
              {...register('email', {
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: 'Invalid email address'
                }
              })}
              inputProps={{ maxLength: 40 }}
              error={!!errors.email}
              helperText={errors.email?.message?.toString()}
            />
          </div>

          <div className="col-lg-6 mb-4 pb-2">
            <TextField
              label="City"
              fullWidth
              placeholder="City"
              value={formData.city || ''}
              {...register('city')}
              inputProps={{ maxLength: 40 }}
            />
          </div>

          <div className="col-lg-6 mb-4 pb-2">
            <Controller
              name="dob"
              control={control}
              render={({ field }) => (
                <div className="w-100">
                  <DatePicker
                    selected={startDate}
                    dateFormat="dd/MM/yyyy"
                    onChange={handleDateChange}
                    peekNextMonth
                    showMonthDropdown
                    showYearDropdown
                    dropdownMode="select"
                    placeholderText="Date of Birth"
                    maxDate={new Date()}
                    minDate={new Date('1960-01-01')}
                    className="form-control w-100"
                    wrapperClassName="w-100"
                    customInput={
                      <TextField
                        fullWidth
                        label="Date of Birth"
                        variant="outlined"
                        value={field.value ? formatDateToDMY(new Date(field.value)) : ''}
                      />
                    }
                  />
                </div>
              )}
            />
          </div>

          <div className="col-lg-6 mb-4 pb-2">
            <TextField
              label="Country"
              fullWidth
              placeholder="Country"
              value={formData.country || ''}
              {...register('country')}
              inputProps={{ maxLength: 40 }}
            />
          </div>

          <div className="col-lg-6 mb-4 pb-2">
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <SelectBox
                  {...field}
                  label="Gender"
                  options={gender}
                  value={field.value || ''}
                  onChange={(e: { target: { value: any } }) => field.onChange(e.target.value)}
                />
              )}
            />
          </div>

          <div className="col-lg-6 mb-4 pb-2">
            <Controller
              name="maritalStatus"
              control={control}
              render={({ field }) => (
                <SelectBox
                  {...field}
                  label="Martial Status"
                  options={MaritalStatus}
                  value={field.value || ''}
                  onChange={(e: { target: { value: any } }) => field.onChange(e.target.value)}
                />
              )}
            />
          </div>

          <div className="col-lg-6 mb-4 pb-2">
            <TextField
              label="Pincode"
              fullWidth
              placeholder="Pincode"
              value={formData.pincode || ''}
              {...register('pincode')}
              inputProps={{ maxLength: 25 }}
              onKeyPress={(e) => {
                if (!/[0-9]/.test(e.key)) {
                  e.preventDefault();
                }
              }}
            />
          </div>

          <div className="col-lg-6 mb-4 pb-2">
            <TextField
              label="Phone"
              fullWidth
              placeholder="Phone"
              value={formData.phone || ''}
              {...register('phone', {
                minLength: { value: 10, message: 'Phone number must be at least 10 digits' },
                maxLength: { value: 14, message: 'Phone number cannot exceed 14 digits' },
                pattern: { value: /^[0-9]+$/, message: 'Phone number must be numeric' },
                onChange: () => trigger('phone')
              })}
              onKeyPress={(e) => {
                if (!/[0-9]/.test(e.key)) {
                  e.preventDefault();
                }
              }}
              error={!!errors.phone}
              helperText={errors.phone?.message?.toString()}
            />
          </div>

          <div className="col-lg-6 mb-4 pb-2">
            <TextField
              label="Website"
              fullWidth
              placeholder="Website"
              value={formData.website || ''}
              {...register('website', {
                pattern: {
                  value: /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}([\/\w .-]*)*\/?$/,
                  message: 'Invalid website URL'
                },
                onChange: () => trigger('website')
              })}
              inputProps={{ maxLength: 50 }}
              error={!!errors.website}
              helperText={errors.website?.message?.toString()}
            />
          </div>

          <div className="col-lg-6 mb-4 pb-2">
            <TextField
              label="Nationality"
              fullWidth
              placeholder="Nationality"
              value={formData.nationality || ''}
              {...register('nationality')}
              inputProps={{ maxLength: 50 }}
            />
          </div>

          <div className="col-lg-12 mb-4 pb-2">
            <TextField
              label="Address"
              fullWidth
              placeholder="Address"
              value={formData.address || ''}
              {...register('address')}
              inputProps={{ maxLength: 250 }}
            />
          </div>

          <div className="col-lg-12 mb-4 pb-2">
            <div className='position-relative mb-3'>
              <Controller
                name="aboutUs"
                control={control}
                render={({ field }) => {
                  const plainText = getPlainTextFromMarkdown(field.value || '');
                  const remainingChars = 700 - plainText.length;

                  return (
                    <>
                      <div className="position-relative">
                        <ReactQuill
                          value={field.value || ''}
                          onChange={(value: string) => {
                            if (validateCharacterLimit(value || '', 'aboutUs')) {
                              field.onChange(value);
                            }
                          }}
                          onBlur={field.onBlur}
                          placeholder="Write about yourself... You can use rich text formatting."
                        // style={{
                        //   border: aboutUsCharError ? '1px solid #f44336' : '1px solid #e0e0e0',
                        //   borderRadius: '4px',
                        //   minHeight: '200px'
                        // }}
                        />
                      </div>

                      {aboutUsCharError && (
                        <div className="text-danger small mt-1">
                          {aboutUsCharError}
                        </div>
                      )}
                    </>
                  );
                }}
              />
            </div>
          </div>

          <div className="col-lg-12">
            <div className='position-relative'>
              <Controller
                name="objective"
                control={control}
                render={({ field }) => {
                  const plainText = getPlainTextFromMarkdown(field.value || '');
                  const remainingChars = 500 - plainText.length;

                  return (
                    <>
                      <ReactQuill
                        value={field.value || ''}
                        onChange={(value: string) => {
                          if (validateCharacterLimit(value || '', 'objective')) {
                            field.onChange(value);
                          }
                        }}
                        onBlur={field.onBlur}
                        placeholder="Write your career objective... You can use rich text formatting."
                      />

                      {objectiveCharError && (
                        <div className="text-danger small mt-1">
                          {objectiveCharError}
                        </div>
                      )}
                    </>
                  );
                }}
              />
            </div>
          </div>
        </div>
      </form>

      <CustomModal
        show={isContOpen}
        onHide={() => {
          setContOpen(false);
          setZoom(1);
          setImage(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }}
        custom='crop'
        title=""
      >
        {image && (
          <div className='d-grid justify-content-center'>
            <AvatarEditor
              ref={setEditor}
              image={URL.createObjectURL(image)}
              width={250}
              height={250}
              border={50}
              scale={zoom}
              borderRadius={125}
            />

            <div className='mt-3 px-3'>
              <div className='d-flex align-items-center mb-3'>
                <span className='me-2'>Zoom:</span>
                <Slider
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  onChange={(e, newValue) => setZoom(newValue as number)}
                  valueLabelDisplay="auto"
                  aria-labelledby="zoom-slider"
                  sx={{ width: '80%' }}
                />
              </div>

              <div className='d-flex justify-content-center gap-3'>
                <button
                  type="button"
                  onClick={() => setZoom(1)}
                  className="sec-but"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={handleCrop}
                  className="prim-but"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Uploading...
                    </>
                  ) : (
                    "Crop & Save"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </CustomModal>

      <CustomModal
        show={isPremiumOpen}
        onHide={() => setPremiumOpen(false)}
        custom='res-write'
        title=""
        size='xl'
      >
        <PackagePop fetchPay={fetchData} close={() => setPremiumOpen(false)} />
      </CustomModal>
    </div>
  );
};

export default Personaldetails;