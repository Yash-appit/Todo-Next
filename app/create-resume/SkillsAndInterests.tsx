import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useForm, useFieldArray, Controller, useWatch } from 'react-hook-form';
import { FaPlus } from 'react-icons/fa';
import { MdDelete, MdOutlineDisplaySettings } from 'react-icons/md';
import TextInput from '@/Layout/TextInput';
import { TextField, Tab, Tabs, Box } from '@mui/material';
import skil from "@/assets/Images/resume-builder/skil.png";
import LevelSlider from '@/components/Slider/LevelSlider';
import tip from "@/assets/Images/resume-builder/tips.svg";
import ReactQuill from '@/components/Editor/ReactQuillEditor';
import { stripEmptyHtml } from '@/utils/htmlUtils';
import Image from 'next/image';

const validateSkillsAndInterests = {
  skillName: {
    // required: 'Skill name is required',
  },
  skillScore: {
    // required: 'Skill score is required',
    max: {
      value: 10,
      message: 'Score must not exceed 10',
    },
  },
  interest: {
    // required: 'Interest is required',
  },
  detailSkill: {
    maxLength: {
      value: 4000,
      message: 'Skills description must not exceed 4000 characters'
    }
  },
  detailInterest: {
    maxLength: {
      value: 4000,
      message: 'Interest description must not exceed 4000 characters'
    }
  },
  detailStrength: {
    maxLength: {
      value: 4000,
      message: 'Strength description must not exceed 4000 characters'
    }
  }
};

interface SkillsAndInterests {
  skillName: string;
  skillScore: number;
}

interface Interests {
  interest: string;
}

interface SkillsAndInterestsProps {
  setResumeData: React.Dispatch<React.SetStateAction<any>>;
  step2: boolean;
  Generate: () => void;
  tips?: any;
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

// Helper function to strip HTML tags and count characters
const stripHtmlAndCount = (html: string): string => {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '');
};

const SkillsAndInterests: React.FC<SkillsAndInterestsProps> = ({
  setResumeData,
  Generate,
  step2,
  tips
}) => {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setError,
    setValue,
    clearErrors,
  } = useForm<{
    skillsandinterests: SkillsAndInterests[];
    interests: Interests[];
    strengths: string[]; // Change to array of strings
    detailSkill: string;
    detailInterest: string;
    detailStrength: string;
  }>({
    defaultValues: {
      skillsandinterests: [{ skillName: '', skillScore: 1 }],
      interests: [{ interest: '' }],
      strengths: [''], // Initialize with an empty string
    },
    mode: 'onBlur',
  });

  const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({
    control,
    name: 'skillsandinterests',
  });

  const { fields: interestFields, append: appendInterest, remove: removeInterest } = useFieldArray({
    control,
    name: 'interests',
  });

  // Custom state for managing strengths (array of strings)
  const [strengths, setStrengths] = useState<string[]>(['']);
  const formValues = useWatch({ control }) || {
    skillsandinterests: [{ skillName: '', skillScore: 1 }],
    interests: [{ interest: '' }],
    detailSkill: '',
    detailInterest: '',
    detailStrength: '',
  };

  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [charCount, setCharCount] = useState(0);
  const MAX_CHAR_LIMIT = 4000;
  const detailStrengthValue = watch('detailStrength');
  const detailInterestValue = watch('detailInterest');
  const detailSkillValue = watch('detailSkill');

  // Effect to handle detailStrength data changes
  // Effect to handle detailStrength data changes
  useEffect(() => {
    if (detailStrengthValue && detailStrengthValue.trim() !== '') {
      // Only clear strengths if they are not already empty
      const isStrengthsEmpty = strengths.length === 1 && strengths[0] === '';
      if (!isStrengthsEmpty) {
        setStrengths(['']);
      }
    }
  }, [detailStrengthValue, strengths]);

  // Separate effect for clearing detailStrength when strengths are added
  useEffect(() => {
    const hasStrengthsData = strengths.some(strength => strength.trim() !== '');
    if (hasStrengthsData && detailStrengthValue !== '') {
      setValue('detailStrength', '');
    }
  }, [strengths, detailStrengthValue, setValue]);

  // Effect to handle detailInterest data changes
  useEffect(() => {
    if (detailInterestValue && detailInterestValue.trim() !== '') {
      reset({
        ...watch(),
        interests: [{ interest: '' }]
      });
    }
  }, [detailInterestValue, reset, watch]);

  // Separate effect to handle interests changes
  useEffect(() => {
    const hasInterestsData = formValues.interests?.some(interest =>
      interest.interest && interest.interest.trim() !== '');

    if (hasInterestsData && detailInterestValue && detailInterestValue.trim() !== '') {
      setValue('detailInterest', '');
    }
  }, [formValues.interests, setValue, detailInterestValue]);

  useEffect(() => {
    if (detailSkillValue && detailSkillValue.trim() !== '') {
      reset({
        ...watch(),
        skillsandinterests: [{ skillName: '', skillScore: 1 }]
      });
    }
  }, [detailSkillValue, reset, watch]);

  // Separate effect to handle skills changes
  useEffect(() => {
    const hasSkillsData = formValues.skillsandinterests?.some(skill =>
      skill.skillName && skill.skillName.trim() !== '');

    if (hasSkillsData && detailSkillValue && detailSkillValue.trim() !== '') {
      setValue('detailSkill', '');
    }
  }, [formValues.skillsandinterests, setValue, detailSkillValue]);

  const previousDataRef = useRef<string>('');

  // Save to localStorage in real-time
  useEffect(() => {
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    const newTimeout = setTimeout(() => {
      const formattedData = {
        skill: formValues.skillsandinterests && formValues.skillsandinterests
          .filter(skill => skill.skillName)
          .map(skill => {
            return skill.skillName
              ? { skillName: skill.skillName, skillScore: skill.skillScore || 1 }
              : null;
          })
          .filter(Boolean),
        interest: formValues.interests && formValues.interests.map((interest) => ({ ...interest })),
        strength: strengths.filter((strength) => strength.trim() !== ''),
        detailSkill: stripEmptyHtml(formValues?.detailSkill) || "",
        detailInterest: stripEmptyHtml(formValues?.detailInterest) || "",
        detailStrength: stripEmptyHtml(formValues?.detailStrength) || "",
      };

      // Compare with previous data to detect actual changes
      const currentDataString = JSON.stringify(formattedData);
      const hasDataChanged = previousDataRef.current !== currentDataString;

      if (hasDataChanged) {
        const storedData = getFromLocalStorage('resumeData');
        const resumeData = storedData ? JSON.parse(storedData) : { resume_data: {} };

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
    }, 1000);
    setTypingTimeout(newTimeout);

    return () => {
      if (newTimeout) {
        clearTimeout(newTimeout);
      }
    };
  }, [formValues, strengths]);

  useEffect(() => {
    const storedData = getFromLocalStorage('resumeData');
    if (storedData) {
      const resumeData = JSON.parse(storedData);
      const skillsData = resumeData.resume_data?.skill || [{ skillName: '', skillScore: 1 }];
      const interestsData = resumeData.resume_data?.interest || [{ interest: '' }];
      const strengthsData = resumeData.resume_data?.strength || [''];
      const detailSkillData = resumeData.resume_data?.detailSkill || '';
      const detailInterestData = resumeData.resume_data?.detailInterest || '';
      const detailStrengthData = resumeData.resume_data?.detailStrength || '';

      reset({
        skillsandinterests: skillsData.length > 0 ? skillsData : [{ skillName: '', skillScore: 1 }],
        interests: interestsData.length > 0 ? interestsData : [{ interest: '' }],
        detailSkill: detailSkillData,
        detailInterest: detailInterestData,
        detailStrength: detailStrengthData,
      });

      setStrengths(strengthsData.length > 0 ? strengthsData : ['']);
      setCharCount(detailSkillData ? stripHtmlAndCount(detailSkillData).length : 0);
    }
  }, [reset]);

  // Handler for MD editor change with character limit
  const handleMDEditorChange = useCallback((value: string | undefined, onChange: (value: string) => void, fieldName: string) => {
    const textContent = value ? stripHtmlAndCount(value) : '';
    const currentLength = textContent.length;

    if (currentLength > MAX_CHAR_LIMIT) {
      setError(fieldName as any, {
        type: 'maxLength',
        message: `${fieldName.replace('detail', '')} description must not exceed ${MAX_CHAR_LIMIT} characters`
      });
    } else {
      clearErrors(fieldName as any);
    }

    setCharCount(currentLength);
    onChange(value || '');
  }, [setError, clearErrors]);



  // Updated handler for skills
  const handleRemoveSkill = (index: number) => {
    if (index === 0 && skillFields.length === 1) {
      reset({
        ...formValues,
        skillsandinterests: [
          { skillName: '', skillScore: 1 },
          ...(formValues.skillsandinterests?.slice(1) || [])
        ]
      });
    } else {
      removeSkill(index);
    }
  };

  const handleRemoveInterest = (index: number) => {
    if (index === 0 && interestFields.length === 1) {
      reset({
        ...formValues,
        interests: [
          { interest: '' },
          ...(formValues.interests?.slice(1) || [])
        ]
      });
    } else {
      removeInterest(index);
    }
  };

  const onSubmit = (data: { skillsandinterests: SkillsAndInterests[]; interests: Interests[], detailSkill: string; }) => {
    const formattedData = {
      skill: data.skillsandinterests
        .filter((skill) => skill.skillScore > 0)
        .map((skill) => ({
          ...skill,
          skillScore: skill.skillName ? skill.skillScore : 1,
        })),
      interest: data.interests.map((interest) => ({ ...interest })),
      strength: strengths.filter((strength) => strength.trim() !== ''),
      detailSkill: data.detailSkill || '',
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

  // Handler for adding a new strength field
  const handleAddStrength = () => {
    setStrengths([...strengths, '']);
  };

  // Handler for removing a strength field
  const handleRemoveStrength = (index: number) => {
    if (index === 0 && strengths.length === 1) {
      const updatedStrengths = [...strengths];
      updatedStrengths[0] = '';
      setStrengths(updatedStrengths);
    } else {
      const updatedStrengths = strengths.filter((_, i) => i !== index);
      setStrengths(updatedStrengths);
    }
  };

  // Handler for updating a strength field
  const handleStrengthChange = (index: number, value: string) => {
    const updatedStrengths = [...strengths];
    updatedStrengths[index] = value;
    setStrengths(updatedStrengths);
  };

  const [showTips, setShowTips] = useState(false);
  const tipsRef = useRef<HTMLDivElement>(null);
  const handleTipsButtonClick = () => {
    setShowTips(prev => !prev);
  };
  const tipsButtonRef = useRef<HTMLButtonElement>(null);

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

  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const [activeTab2, setActiveTab2] = useState(0);

  const handleTabChange2 = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab2(newValue);
  };

  const [activeTab3, setActiveTab3] = useState(0);

  const handleTabChange3 = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab3(newValue);
  };

  return (
    <div className="container p-4 skill-section pt-3">
      <div style={{ display: 'flex', alignItems: 'center', position: 'relative', justifyContent: 'space-between' }} className='head-name mb-4'>
        <div className='d-flex align-items-end'>
          <Image src={skil} alt="" loading="lazy" />
          <h4 className='px-2 mb-0'>Skills, Interests & Strengths</h4>
        </div>
        {tips?.length > 0 &&
          <>
            <button
              ref={tipsButtonRef}
              type="button"
              className='tips-button pe-4 me-1'
              onClick={handleTipsButtonClick}
            >
              <Image src={tip} alt="" /> Tips
            </button>
            {showTips && (
              <div className='tips-box' ref={tipsRef}>
                <h5><Image src={tip} alt="" className='p-1 mb-1' /> Skills, Interests & Strengths Tips</h5>
                <div className='fs-6'>{(tips.map((tip: any) =>
                  <div className='text-black'
                    dangerouslySetInnerHTML={{ __html: tip.resume_tips || '' }}
                  />
                ))}</div>
              </div>
            )}
          </>
        }
      </div>
      <form>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2, mx: 4 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Skill Text" />
            <Tab label="Skill Score" />
          </Tabs>
        </Box>

        {activeTab === 1 && (<>
          {skillFields.map((field, index) => (
            <div key={field.id} className="row m-0 mb-1 px-4">
              <div className='d-flex align-items-baseline justify-content-between'>
                <h5 className='mb-0 mt-3'>Skill: {index + 1}</h5>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(index)}
                  className='bg-transparent border-0 fs-5'
                >
                  <MdDelete />
                </button>
              </div>
              <div className="col-lg-5 mt-3 pt-1">
                <Controller
                  name={`skillsandinterests.${index}.skillName`}
                  control={control}
                  rules={validateSkillsAndInterests.skillName}
                  render={({ field }) => (
                    <TextField
                      label="Skill Name"
                      type="text"
                      placeholder="Skill Name"
                      value={field.value}
                      onChange={field.onChange}
                      fullWidth
                      inputProps={{ maxLength: 80 }}
                      variant="outlined"
                      error={!!errors.skillsandinterests?.[index]?.skillName}
                      helperText={errors.skillsandinterests?.[index]?.skillName?.message}
                    />
                  )}
                />
              </div>
              <div className="col-lg-7 d-flex align-items-baseline lev-slid">
                <Controller
                  name={`skillsandinterests.${index}.skillScore`}
                  control={control}
                  rules={validateSkillsAndInterests.skillScore}
                  render={({ field }) => (
                    <LevelSlider
                      value={field.value}
                      onChange={(value) => {
                        field.onChange(value);
                      }}
                    />
                  )}
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => appendSkill({ skillName: '', skillScore: 1 })}
            className="mb-3 mt-4 mx-4 bg-transparent border-0 px-3"
          >
            <FaPlus /> Skill
          </button>
        </>
        )}

        {activeTab === 0 && (
          <div className="row m-0 mb-4 px-4">
            <div className="col-lg-12">
              <Controller
                name="detailSkill"
                control={control}
                rules={validateSkillsAndInterests.detailSkill}
                render={({ field }) => (
                  <div className="md-editor-container">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="mb-0">Skills Description</h5>
                      <div className={`char-count ${charCount > MAX_CHAR_LIMIT ? 'text-danger' : 'text-muted'}`}>
                        {charCount}/{MAX_CHAR_LIMIT} characters
                      </div>
                    </div>
                    <ReactQuill
                      value={field.value}
                      onChange={(value: string) => handleMDEditorChange(value, field.onChange, 'detailSkill')}
                      placeholder='Describe your skills in detail...'
                    />
                    {errors.detailSkill && (
                      <div className="text-danger mt-2">
                        {errors.detailSkill.message}
                      </div>
                    )}
                  </div>
                )}
              />
            </div>
          </div>
        )}

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2, mx: 4, mt: 8 }}>
          <Tabs value={activeTab2} onChange={handleTabChange2}>
            <Tab label="Interest Text" />
            <Tab label="Interest" />
          </Tabs>
        </Box>

        {activeTab2 === 1 && (<>
          {interestFields.map((field, index) => (
            <div key={field.id} className="row m-0 my-3 px-4">
              <div className='d-flex align-items-baseline justify-content-between mb-2'>
                <h5>Interest: {index + 1}</h5>
                <button
                  type="button"
                  onClick={() => handleRemoveInterest(index)}
                  className='bg-transparent border-0 fs-5'
                >
                  <MdDelete />
                </button>
              </div>
              <div className="col-lg-12">
                <Controller
                  name={`interests.${index}.interest`}
                  control={control}
                  rules={validateSkillsAndInterests.interest}
                  render={({ field }) => (
                    <TextField
                      label="Interest"
                      type="text"
                      placeholder="Interest"
                      value={field.value}
                      onChange={field.onChange}
                      fullWidth
                      variant="outlined"
                      error={!!errors.interests?.[index]?.interest}
                      helperText={errors.interests?.[index]?.interest?.message}
                    />
                  )}
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => appendInterest({ interest: '' })}
            className="mb-3 mt-2 mx-4 bg-transparent border-0 px-3"
          >
            <FaPlus /> Interest
          </button>
        </>
        )}

        {activeTab2 === 0 && (
          <div className="row m-0 mb-4 px-4">
            <div className="col-lg-12">
              <Controller
                name="detailInterest"
                control={control}
                rules={validateSkillsAndInterests.detailInterest}
                render={({ field }) => (
                  <div className="md-editor-container">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="mb-0">Interest</h5>
                      <div className={`char-count ${stripHtmlAndCount(field.value || '').length > MAX_CHAR_LIMIT ? 'text-danger' : 'text-muted'}`}>
                        {stripHtmlAndCount(field.value || '').length}/{MAX_CHAR_LIMIT} characters
                      </div>
                    </div>
                    <ReactQuill
                      value={field.value}
                      onChange={(value: string) => handleMDEditorChange(value, field.onChange, 'detailInterest')}
                      placeholder='Describe your interests in detail...'
                    />
                    {errors.detailInterest && (
                      <div className="text-danger mt-2">
                        {errors.detailInterest.message}
                      </div>
                    )}
                  </div>
                )}
              />
            </div>
          </div>
        )}

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2, mx: 4, mt: 4 }}>
          <Tabs value={activeTab3} onChange={handleTabChange3}>
            <Tab label="Strength Text" />
            <Tab label="Strength" />
          </Tabs>
        </Box>

        {activeTab3 === 0 && (
          <div className="row m-0 mb-4 px-4">
            <div className="col-lg-12">
              <Controller
                name="detailStrength"
                control={control}
                rules={validateSkillsAndInterests.detailStrength}
                render={({ field }) => (
                  <div className="md-editor-container">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="mb-0">Strength</h5>
                      <div className={`char-count ${stripHtmlAndCount(field.value || '').length > MAX_CHAR_LIMIT ? 'text-danger' : 'text-muted'}`}>
                        {stripHtmlAndCount(field.value || '').length}/{MAX_CHAR_LIMIT} characters
                      </div>
                    </div>
                    <ReactQuill
                      value={field.value}
                      onChange={(value: string) => handleMDEditorChange(value, field.onChange, 'detailStrength')}
                      placeholder='Describe your strengths in detail...'
                    />
                    {errors.detailStrength && (
                      <div className="text-danger mt-2">
                        {errors.detailStrength.message}
                      </div>
                    )}
                  </div>
                )}
              />
            </div>
          </div>
        )}

        {activeTab3 === 1 && (<>
          {strengths.map((strength, index) => (
            <div key={index} className="row my-3 px-4 m-0">
              <div className='d-flex align-items-baseline justify-content-between mt-4 pt-2'>
                <h5 className='mb-3'>Strength: {index + 1}</h5>
                <button
                  type="button"
                  onClick={() => handleRemoveStrength(index)}
                  className='bg-transparent border-0 fs-5'
                >
                  <MdDelete />
                </button>
              </div>
              <div className="col-lg-12">
                <TextField
                  label="Strength"
                  type="text"
                  placeholder="Strength"
                  value={strength}
                  onChange={(e) => handleStrengthChange(index, e.target.value)}
                  fullWidth
                  variant="outlined"
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddStrength}
            className="mb-3 mt-2 mx-4 bg-transparent border-0 px-3"
          >
            <FaPlus /> Strength
          </button>
        </>)}
      </form>
    </div>
  );
};

export default SkillsAndInterests;