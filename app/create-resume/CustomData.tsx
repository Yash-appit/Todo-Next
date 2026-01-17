import React, { useEffect, useState, useRef } from 'react';
import { useForm, useFieldArray, Controller, useWatch } from 'react-hook-form';
import { FaPlus } from 'react-icons/fa';
import { MdDelete, MdOutlineDisplaySettings } from 'react-icons/md';
import TextInput from '@/Layout/TextInput';
import CustomModal from '@/components/Modal/Modal';
import Login from '@/components/Login';
import { addResume } from '@/services/resume/Index';
import ToastMessage from '@/Layout/ToastMessage';
import cus from "@/assets/Images/resume-builder/cus.png";
import soc from "@/assets/Images/resume-builder/link.svg";
import lan from "@/assets/Images/resume-builder/lang.png";
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import LevelSlider from '@/components/Slider/LevelSlider';
import { FiMinus } from "react-icons/fi";
import tip from "@/assets/Images/resume-builder/tips.svg";
import Image from 'next/image';

const validateLanguagesAndSocialLinks = {
  langName: {
    required: 'Language is required',
  },
  url: {
    required: 'URL is required',
    pattern: {
      value: /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)([\/\w\.-]*)*\/?$/,
      message: 'Please enter a valid URL',
    },
  },
};

const socialOptions = [
  { name: 'Facebook', icon: 'fab fa-facebook-f' },
  { name: 'Twitter', icon: 'fab fa-twitter' },
  { name: 'LinkedIn', icon: 'fab fa-linkedin-in' },
  { name: 'GitHub', icon: 'fab fa-github' },
  { name: 'Skype', icon: 'fab fa-skype' },
];

interface Languages {
  langName: string;
  langScore: number;
}

interface SocialLinks {
  url: string;
  name: string;
  urlName: string;
  iconUrl: string;
}

interface LanguagesAndSocialLinksProps {
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

const CustomData: React.FC<LanguagesAndSocialLinksProps> = ({
  setResumeData,
  Generate,
  step2,
  tips,
  externalTips
}) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [token, setToken] = useState(getFromLocalStorage('token'));
  const [showTips, setShowTips] = useState(false);
  const [showTips2, setShowTips2] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm<{
    languageDetails: Languages[];
    socialLinks: SocialLinks[];
  }>({
    defaultValues: {
      languageDetails: [{ langName: '', langScore: 1 }],
      socialLinks: [{ url: '', name: '', urlName: '', iconUrl: '' }],
    },
    mode: 'onBlur',
  });

  const { fields: languageFields, append: appendLanguage, remove: removeLanguage } = useFieldArray({
    control,
    name: 'languageDetails',
  });

  const { fields: socialLinkFields, append: appendSocialLink, remove: removeSocialLink } = useFieldArray({
    control,
    name: 'socialLinks',
  });

  const formData = useWatch({ control });
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const tipsRef = useRef<HTMLDivElement>(null);
  const handleTipsButtonClick = () => {
    setShowTips(prev => !prev);
  };

  const handleTipsButtonClick2 = () => {
    setShowTips2(prev => !prev);
  };
  const tipsButtonRef = useRef<HTMLButtonElement>(null);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is outside both tips box and tips button
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
  // Initialize selectedOptions based on existing data
  useEffect(() => {
    const storedData = getFromLocalStorage('resumeData');
    if (storedData) {
      const resumeData = JSON.parse(storedData);
      const options = [];

      if (resumeData.resume_data?.languageDetails?.length > 0) {
        options.push('languageDetails');
      }

      if (resumeData.resume_data?.socialLinks?.length > 0) {
        options.push('socialLinks');
      }

      setSelectedOptions(options);
    }
  }, []);

  // Save form data to localStorage in real-time
  useEffect(() => {
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    const newTimeout = setTimeout(() => {
      const storedData = getFromLocalStorage('resumeData');
      const resumeData = storedData ? JSON.parse(storedData) : { resume_data: {} };

      // Filter out languages with empty langName before saving
      const filteredLanguages = formData?.languageDetails && formData?.languageDetails
        .filter(lang => lang?.langName && lang?.langName.trim() !== '')
        .map(lang => ({
          ...lang,
          langScore: lang.langScore,
        }));

      resumeData.resume_data = {
        ...resumeData.resume_data,
        languageDetails: filteredLanguages,
        socialLinks: formData.socialLinks,
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
    const storedData = getFromLocalStorage('resumeData');
    if (storedData) {
      const resumeData = JSON.parse(storedData);
      const languageDetails = resumeData.resume_data?.languageDetails || [{ langName: '', langScore: 1 }];
      const socialLinks = resumeData.resume_data?.socialLinks || [{ url: '', name: '', urlName: '', iconUrl: '' }];

      reset({
        languageDetails,
        socialLinks,
      });

      // Update selected options based on existing data
      const options = [];
      if (languageDetails.some((lang: any) => lang.langName)) {
        options.push('languageDetails');
      }
      if (socialLinks.some((link: any) => link.url)) {
        options.push('socialLinks');
      }
      setSelectedOptions(options);
    }
  }, [reset]);

  const handleCheckboxChange = (option: string) => {
    setSelectedOptions((prevOptions) => {
      const newOptions = prevOptions.includes(option)
        ? prevOptions.filter((opt) => opt !== option)
        : [...prevOptions, option];

      // If adding a new section, ensure there's at least one field
      if (!prevOptions.includes(option)) {
        if (option === 'languageDetails' && formData?.languageDetails && formData?.languageDetails.every(lang => !lang.langName)) {
          appendLanguage({ langName: '', langScore: 1 });
        } else if (option === 'socialLinks' && formData?.socialLinks && formData?.socialLinks.every(link => !link.url)) {
          appendSocialLink({ url: '', name: '', urlName: '', iconUrl: '' });
        }
      }

      return newOptions;
    });
  };

  // Check if a section has data
  const sectionHasData = (section: string) => {
    if (section === 'languageDetails') {
      return formData.languageDetails && formData.languageDetails.some(lang => lang.langName?.trim() !== '');
    }
    if (section === 'socialLinks') {
      return formData.socialLinks && formData.socialLinks.some(link => link.url?.trim() !== '');
    }
    return false;
  };

  // Automatically show section if it has data
  useEffect(() => {
    const newOptions = [...selectedOptions];

    if (sectionHasData('languageDetails') && !newOptions.includes('languageDetails')) {
      newOptions.push('languageDetails');
    }

    if (sectionHasData('socialLinks') && !newOptions.includes('socialLinks')) {
      newOptions.push('socialLinks');
    }

    if (newOptions.length !== selectedOptions.length) {
      setSelectedOptions(newOptions);
    }
  }, [formData]);


  const handleRemoveLanguage = (index: number) => {
    if (index === 0 && languageFields.length === 1) {
      // Reset the first skill instead of removing it
      setValue(`languageDetails.${index}.langName`, '');
      setValue(`languageDetails.${index}.langScore`, 1);
    } else {
      removeLanguage(index);
    }
  };



  const handleRemoveSocialLink = (index: number) => {
    if (index === 0 && socialLinkFields.length === 1) {
      setValue(`socialLinks.${index}.url`, '');
      setValue(`socialLinks.${index}.name`, '');
      setValue(`socialLinks.${index}.urlName`, '');
      setValue(`socialLinks.${index}.iconUrl`, '');
    } else {
      removeSocialLink(index);
    }
  };

  const cleanUrl = (url: string): string => {
    return url.replace(/^(https?:\/\/)?(www\.)?/, '');
  };


  return (
    <>
      <div className="container p-4 pb-0">
        <form className="row m-0 mx-2 me-3">
          {/* Show languages section if selected OR if it has data */}
          {(selectedOptions.includes('languageDetails') || sectionHasData('languageDetails')) && (
            <div className="col-lg-12 mb-4 mt-4">
              {/* <h4 className='mb-3 px-3'><img src={lan} alt="" loading="lazy" />Languages</h4> */}
              <div style={{ display: 'flex', alignItems: 'center', position: 'relative', justifyContent: 'space-between' }} className='head-name mb-4'>
                <div className='d-flex align-items-end'>
                  <Image src={lan} alt="" loading="lazy" />
                  <h4 className='px-2 mb-0'>Languages</h4>
                </div>
                {tips.length > 0 &&
                  <>
                    <button
                      ref={tipsButtonRef}
                      type="button"
                      className='tips-button'
                      onClick={handleTipsButtonClick}
                    >

                      <img src={tip} alt="" /> Tips
                    </button>
                    {showTips && (
                      <div className='tips-box' ref={tipsRef}>
                        <h6>Languages Tips</h6>
                        <div className='fs-6'>{(tips.map((tip: any) =>

                          <div
                            dangerouslySetInnerHTML={{ __html: tip.resume_tips || '' }}
                          />
                        ))}</div>
                      </div>
                    )}
                  </>}
              </div>
              {languageFields.map((field, index) => (
                <div key={field.id} className="row m-0">
                  <div className='d-flex align-items-baseline justify-content-between'>
                    <h5>Language: {index + 1}</h5>
                    {/* {index > 0 && ( */}

                    <button
                      type="button"
                      onClick={() => handleRemoveLanguage(index)}
                      className='bg-transparent border-0 fs-5'
                    >
                      <MdDelete />
                    </button>

                    {/* )} */}
                  </div>
                  <div className="col-lg-5 mb-3 pt-2">
                    <Controller
                      name={`languageDetails.${index}.langName`}
                      control={control}
                      rules={validateLanguagesAndSocialLinks.langName}
                      render={({ field }) => (
                        <>
                          <TextField
                            label="Language"
                            type="text"
                            placeholder="Language"
                            value={field.value}
                            onChange={field.onChange}
                            inputProps={{ maxLength: 70 }}
                            className='w-100 mt-2'

                          />
                          {errors.languageDetails?.[index]?.langName && (
                            <span className="text-danger">{errors.languageDetails[index].langName.message}</span>
                          )}
                        </>
                      )}
                    />
                  </div>
                  <div className="col-lg-7 mb-3 lev-slid">
                    <Controller
                      name={`languageDetails.${index}.langScore`}
                      control={control}
                      render={({ field }) => (
                        <LevelSlider
                          onChange={(value: any) => {
                            field.onChange(value);
                          }}
                          value={field.value}
                        />
                      )}
                    />
                  </div>
                  {/* {index > 0 && (
                    <div className="col-lg-4 mb-3">
                      <button type="button" onClick={() => removeLanguage(index)} className="bg-transparent border-0 text-start mb-3">
                        <MdDelete />
                      </button>
                    </div>
                  )} */}
                </div>
              ))}
              <button type="button" onClick={() => appendLanguage({ langName: '', langScore: 1 })} className="bg-transparent border-0 text-start mb-3">
                <FaPlus /> Languages
              </button>
            </div>
          )}

          {/* Show social links section if selected OR if it has data */}
          {(selectedOptions.includes('socialLinks') || sectionHasData('socialLinks')) && (
            <div className="col-lg-12 mt-4">
              {/* <h4 className='mb-3 px-1'> <img src={soc} alt="" loading="lazy" />Social Links</h4> */}
              <div style={{ display: 'flex', alignItems: 'center', position: 'relative', justifyContent: 'space-between' }} className='head-name mb-4'>
                <div className='d-flex align-items-end'>
                  <img src={soc} alt="" loading="lazy" />
                  <h4 className='px-2 mb-0'>Social Links</h4>
                </div>
                {externalTips.length > 0 &&
                  <>
                    <button
                      ref={tipsButtonRef}
                      type="button"
                      className='tips-button'
                      onClick={handleTipsButtonClick2}
                    >

                      <img src={tip} alt="" /> Tips
                    </button>
                    {showTips2 && (
                      <div className='tips-box' ref={tipsRef}>
                        <h5><img src={tip} alt="" className='p-1 mb-1' /> Social Links Tips</h5>
                        <div className='fs-6'>{(externalTips.map((tip: any) =>

                          <div
                            dangerouslySetInnerHTML={{ __html: tip.resume_tips || '' }}
                          />
                        ))}</div>
                      </div>
                    )}
                  </>}
              </div>
              {socialLinkFields.map((field, index) => (
                <div key={field.id} className="row">
                  <div className='d-flex align-items-baseline justify-content-between'>
                    <h5>Social Link: {index + 1}</h5>
                    {/* {index > 0 && ( */}

                    <button
                      type="button"
                      onClick={() => handleRemoveSocialLink(index)}
                      className='bg-transparent border-0 fs-5'
                    >
                      <MdDelete />
                    </button>

                    {/* )} */}
                  </div>
                  <div className="col-lg-6 mb-3 pt-2">
                    <Controller
                      name={`socialLinks.${index}.name`}
                      control={control}
                      render={({ field }) => (
                        <div>
                          <TextField
                            select
                            label="Select Platform"
                            value={field.value}
                            onChange={(e) => {
                              const selectedOption = socialOptions.find(opt => opt.name === e.target.value);
                              field.onChange(e.target.value);
                              if (selectedOption) {
                                setValue(`socialLinks.${index}.iconUrl`, selectedOption.icon);
                              }
                            }}
                            className="w-100"
                          >
                            {socialOptions.map((opt) => (
                              <MenuItem value={opt.name}>{opt.name}</MenuItem>
                            ))}
                          </TextField>
                        </div>
                      )}
                    />
                  </div>
                  <div className="col-lg-6 mb-3 pt-2">
                    <Controller
                      name={`socialLinks.${index}.url`}
                      control={control}
                      rules={validateLanguagesAndSocialLinks.url}
                      render={({ field, fieldState: { error } }) => (
                        <>
                          <TextField
                            label="URL"
                            type="text"
                            placeholder="URL (e.g., https://linkedin.com)"
                            value={field.value}
                            inputProps={{ maxLength: 50 }}
                            onChange={(e) => {
                              field.onChange(e.target.value);
                              const cleanedUrl = cleanUrl(e.target.value);
                              setValue(`socialLinks.${index}.urlName`, cleanedUrl);

                              // Trigger validation on change
                              // control.trigger(`socialLinks.${index}.url`);
                            }}
                            onBlur={field.onBlur} // Also validate on blur
                            error={!!error}
                            helperText={error?.message}
                            className='w-100'
                          />

                        </>
                      )}
                    />
                  </div>
                  {/* {index > 0 && (
                    <div className="col-lg-4 mb-3">
                      <button type="button" onClick={() => removeSocialLink(index)} className="bg-transparent border-0 text-start mb-3">
                        <MdDelete />
                      </button>
                    </div>
                  )} */}
                </div>
              ))}
              <button type="button" onClick={() => appendSocialLink({ url: '', name: '', urlName: '', iconUrl: '' })} className="bg-transparent border-0 text-start mb-3">
                <FaPlus /> Social Links
              </button>
            </div>
          )}

          <div className="d-flex">
            {/* Your buttons here */}
          </div>
        </form>

        <h4 className="m-4 mt-2"><Image src={cus} alt="" loading="lazy" />Custom Sections</h4>
        <div className="d-flex gap-3 mb-3 p-2 px-4">
          <button
            type="button"
            className={`btn ${(selectedOptions.includes('languageDetails') || sectionHasData('languageDetails')) ? 'choosed' : 'choose'} d-flex align-items-center gap-2 rounded-1`}
            onClick={() => handleCheckboxChange('languageDetails')}
          >
            <span>Languages</span>
            {(selectedOptions.includes('languageDetails') || sectionHasData('languageDetails')) ? <FiMinus /> : <FaPlus />}
          </button>
          <button
            type="button"
            className={`btn ${(selectedOptions.includes('socialLinks') || sectionHasData('socialLinks')) ? 'choosed' : 'choose'} d-flex align-items-center gap-2 rounded-1`}
            onClick={() => handleCheckboxChange('socialLinks')}
          >
            <span>Social Links</span>
            {(selectedOptions.includes('socialLinks') || sectionHasData('socialLinks')) ? <FiMinus /> : <FaPlus />}
          </button>
        </div>
      </div>

      {/* <CustomModal show={isLoginModalOpen} onHide={() => setLoginModalOpen(false)} custom='login' title="" size='xl'>
        <Login />
      </CustomModal> */}
    </>
  );
};

export default CustomData;