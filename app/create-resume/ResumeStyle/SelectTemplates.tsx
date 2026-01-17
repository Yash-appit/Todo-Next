'use client';

import { useState, useEffect } from 'react';
import ToastMessage from '@/Layout/ToastMessage';
import { templateList } from '@/services/templates/Index';
import Modal from 'react-modal'; // Import a modal library
import { HiMiniMagnifyingGlassPlus } from "react-icons/hi2";
import edi from "@/assets/Images/resume-builder/editor.png";
import sty from "@/assets/Images/resume-builder/sty.png";
import tick from "@/assets/Images/Templates/tick.png";
import { IoIosArrowBack } from "react-icons/io";
import EditableTitle from '../EditableTitle';
import ColorSetting from './ColorSetting';
import FontSetting from './FontSetting';
import SpacingSetting from './SpacingSetting';
import LineHeightSetting from './LineHeightSetting';
import CustomHeading from './CustomHeading';
import FontColor from './FontColor';
import SpacingSlider from './SpaceSlider';
import FontSizeSettings from './FontSizeSettings';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface SelectTemplatesProps {
    // save: () => void
    Generate: () => void;

    step3: boolean;
    setStep3: (value: boolean) => void;
    step4: boolean;
    setStep4: (value: boolean) => void;
}

const setToLocalStorage = (key: string, value: string): void => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(key, value);
    }
};
const setToSessionStorage = (key: string, value: string): void => {
    if (typeof window !== 'undefined') {
        sessionStorage.setItem(key, value);
    }
};
const getFromSessionStorage = (key: string) => {
    if (typeof window !== 'undefined') {
        return sessionStorage.getItem(key);
    }
    return null;
};
const getFromLocalStorage = (key: string) => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem(key);
    }
    return null;
};

const SelectTemplates = ({ step3, setStep3, step4, setStep4, Generate }: SelectTemplatesProps) => {
    const [templates, setTemplates] = useState<any[]>([]);  // Initialize as an empty array
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(getFromLocalStorage('selectedTemplateId') ? Number(getFromLocalStorage('selectedTemplateId')) : null); // State to track selected template
    const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility
    const [selectedImage, setSelectedImage] = useState<string | null>(null); // State to store the selected image URL
    const [token, setToken] = useState(getFromLocalStorage('token'));
    const [templateId, sTemplateId] = useState(getFromLocalStorage('templateId'));
    // const navigate = useNavigate();
    const router = useRouter();
    const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

    const handleImageLoad = (id: number) => {
        setLoadedImages(prev => new Set(prev).add(id));
    };


    const selectedTemplate = templates.find(temp => temp.id === selectedTemplateId);

    const shouldShowColorSetting = selectedTemplate?.template_theme !== "0";

    useEffect(() => {
        fetchData();
    }, [shouldShowColorSetting]);

    useEffect(() => {
        setToken(getFromLocalStorage('token'));
    }, [token]);

    const fetchData = async () => {
        try {
            const response = await templateList();
            const templatesData = response.data || [];
            // console.log(templatesData);
            setTemplates(templatesData);

            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
            let errorMessage = (error as Error).message;
            ToastMessage({
                type: 'error',
                message: errorMessage,
            });
        }
    };

    const handleCheckboxChange = (id: number) => {
        setSelectedTemplateId(id);
        setToSessionStorage('selectedTemplateId', id.toString());
        setToSessionStorage('templateId', id.toString());
        setToLocalStorage('templateId', id.toString());
        Generate();
    };

    const handleImageClick = (imageUrl: string) => {
        setSelectedImage(imageUrl); // Set the selected image URL
        setIsModalOpen(true); // Open the modal
    };

    const closeModal = () => {
        setIsModalOpen(false); // Close the modal
        setSelectedImage(null); // Clear the selected image
    };


    if (isLoading) {
        return <div className="row templates m-0 p-2 pt-3 templates-2">
            <div className="col-lg-10 justify-content-center">
                <div className='shimmer-head p-2'></div>
                <div className='shimmer-head p-2'></div>
                <div className="row m-0">
                    <div className="col-lg-6">
                        <div className='shimmer-temp'></div>
                    </div>

                    <div className="col-lg-6">
                        <div className='shimmer-temp'></div>
                    </div>


                    <div className="col-lg-6">
                        <div className='shimmer-temp'></div>
                    </div>


                    <div className="col-lg-6">
                        <div className='shimmer-temp'></div>
                    </div>
                </div>
            </div>
        </div>;


    }

    const Editor = () => {
        setStep4(true);
        setStep3(false);
    }

    const Style = () => {
        setStep3(true);
        setStep4(false);
        Generate();
    }


    return (
        <div className="row templates m-0 p-2 pt-3 templates-2">

            <div style={{ position: 'relative', zIndex: 100 }}>
                <button
                    type="button"
                    className="prim-but back"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.location.href = '/resumes';
                    }}
                    style={{
                        padding: '2px 4px 6px 4px',
                        minWidth: 'max-content',
                        cursor: 'pointer',
                        borderRadius: '30px',
                        textAlign: 'left' as const,
                        height: 'max-content',
                        lineHeight: "14px",
                        fontSize: '16px',
                    }}>
                    <IoIosArrowBack className='fs-5' />
                </button>
            </div>



            <div className='col-lg-10 px-1 tabbing p-0 m-auto'>
                <div className='pb-3'>
                    <EditableTitle
                        initialTitle={getFromLocalStorage('resumeName')}
                        onTitleChange={(newTitle) => {
                            setToLocalStorage('resumeName', newTitle);
                            Generate();
                        }}
                    />
                </div>
                <div className='d-flex justify-content-between align-items-center'>
                    <span onClick={Editor} className={`${step4 ? 'active' : ''}`}><Image src={edi} alt="" />Editor</span>
                    <span onClick={Style} className={`${step3 ? 'active' : ''}`}><Image src={sty} alt="" />Style</span>
                </div>
            </div>



            <div className="col-lg-10 my-2 justify-content-center m-auto">

                {shouldShowColorSetting && <ColorSetting Generate={Generate} />}
                <FontColor Generate={Generate} />
                <FontSetting Generate={Generate} />
                <SpacingSetting Generate={Generate} />
                <LineHeightSetting Generate={Generate} />
                <CustomHeading Generate={Generate} />
                <FontSizeSettings Generate={Generate} />

                <SpacingSlider Generate={Generate} />

                <h5 className='my-4 pt-3'>Select Template</h5>
            </div>
            {templates.length > 0 ? (
                templates.map((temp: any) => (
                    temp.image ? (
                        <div className={`col-lg-6 mb-4 ${selectedTemplateId === temp.id ? 'checked' : ''}`} key={temp.id}>
                            <label>
                                <div className="template-item">
                                    {selectedTemplateId === temp.id ? <Image src={tick} alt="tick" className='tick' /> : null}
                                    <input
                                        type="checkbox"
                                        checked={selectedTemplateId === temp.id}
                                        onChange={() => handleCheckboxChange(temp.id)}
                                    />
                                    <HiMiniMagnifyingGlassPlus
                                        className="eye-icon" // Add a class for styling
                                        onClick={() => handleImageClick(temp.image)}
                                        style={{ cursor: 'pointer' }}
                                    />
                                </div>
                                <h6>{temp.name}</h6>
                                {!loadedImages.has(temp.id) && (
                                    <div className="shimmer-wrapper">
                                        <div className="shimmer-img"></div>
                                    </div>
                                )}
                                <img
                                    src={temp.image}
                                    alt={temp.name || "Template Image"}
                                    loading="lazy"
                                    className='temp-img'
                                    onLoad={() => handleImageLoad(temp.id)}
                                    style={{
                                        opacity: loadedImages.has(temp.id) ? 1 : 0,
                                        transition: 'opacity 0.3s ease-in',
                                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                                    }}

                                />
                            </label>
                        </div>
                    ) : null
                ))
            ) : (
                <div>No templates available</div>
            )}

            {/* Modal for displaying full-size image */}
            <Modal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                contentLabel="Full Size Image"
                style={{
                    overlay: {
                        background: 'rgb(173 170 170 / 62%)',
                        zIndex: '1',
                    },
                    content: {
                        top: '50%',
                        left: '50%',
                        right: 'auto',
                        bottom: 'auto',
                        marginRight: '-50%',
                        transform: 'translate(-50%, -50%)',
                        padding: '0',
                        border: 'none',
                        background: 'none',
                        zIndex: '1',
                        overflow: 'vissible'
                    },
                }}
            >
                <div style={{ position: 'relative' }}>
                    {selectedImage && (
                        <img
                            src={selectedImage}
                            alt="Full Size Template"
                            style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: '10px' }}
                        />
                    )}
                    <button
                        onClick={closeModal}
                        style={{
                            position: 'absolute',
                            top: '-25px',
                            right: '-25px',
                            background: '#0A5840',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '25px',
                            height: '25px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '16px',
                        }}
                    >
                        &times;
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default SelectTemplates;