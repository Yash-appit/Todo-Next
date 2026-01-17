import { useState, useEffect } from 'react';
import ToastMessage from '@/Layout/ToastMessage';
import { templateList } from '@/services/templates/Index';
import Modal from 'react-modal'; // Import a modal library
import { HiMiniMagnifyingGlassPlus } from "react-icons/hi2";
// import ResumeLoader from '../ResumeLoader';
import blank from "@/assets/Images/blank.jpg";
import "@/styles/Shimmer.css";
// Set the app element for accessibility (required by react-modal)
// Modal.setAppElement('#root'); // Replace '#root' with your app's root element ID

interface TemplatesProps {
    save: () => void
    setStep1: (value: boolean) => void;
    setStep2: (value: boolean) => void;
    setShowModal: (value: boolean) => void;
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

const Templates = ({ save, setStep1, setStep2, setShowModal }: TemplatesProps) => {
    const [templates, setTemplates] = useState<any[]>([]);  // Initialize as an empty array
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);  // State to track selected template
    const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility
    const [selectedImage, setSelectedImage] = useState<string | null>(null); // State to store the selected image URL
    const [token, setToken] = useState(getFromLocalStorage('token'));
    const [templateId, sTemplateId] = useState<string | null>(getFromLocalStorage('templateId'));
    const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

    const handleImageLoad = (id: number) => {
        setLoadedImages(prev => new Set(prev).add(id));
    };

    const handleSave = () => {
        if (selectedTemplateId !== null) {
            save(); // Call the save function passed as a prop
            setStep1(false);
            setStep2(true);
            setShowModal(false);
        }
    };

    useEffect(() => {
        fetchData();
        const storedTemplateId = sessionStorage.getItem('selectedTemplateId');
        if (storedTemplateId) {
            localStorage.removeItem('resumeData');;
        }
    }, []);

    useEffect(() => {
        setToken(getFromLocalStorage('token'));
    }, [token]);

    const fetchData = async () => {
        try {
            const response = await templateList();
            // console.log(response.data);
            // console.log(templateId);

            const templatesData = response.data || [];
            // console.log(templatesData);
            setTemplates(templatesData);

            if (templatesData.length > 0) {
                // Set the first template as selected by default
                setSelectedTemplateId(Number(templateId));
                if (templateId){
                setToSessionStorage('selectedTemplateId', templateId);
                setToLocalStorage('templateId', templateId);
            }
            }

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
        return <div className="shimmer-wrapper">
            <div className="shimmer-img"></div>
        </div>;
    }

    return (
        <div className="row templates m-0 p-2 pt-0">

            <div className='d-flex justify-content-between align-items-center pt-3 pb-3 temp-heading'>
                <h1 className='text-white fs-4 mb-0 head'>Choose Template</h1>
                {selectedTemplateId !== null && selectedTemplateId !== 0 && <button onClick={handleSave} className='prim-but-2 px-5 py-2' >Save</button>}

                {/* {selectedTemplateId !== null && selectedTemplateId !== 0 && !token &&
                    <button onClick={() => navigate('/login')} className="prim-but-2 px-5 py-2">
                        Save
                    </button>
                } */}
            </div>

     
            {templates?.length > 0 ? (
                templates.map((temp: any, index) => (
                    <div className={`col-lg-6 mb-3 ${selectedTemplateId === temp?.id ? 'checked' : ''}`} key={temp.id} >
                        <label>
                            <div className="template-item mb-3">
                                <input
                                    type="checkbox"
                                    checked={selectedTemplateId === temp?.id}
                                    onChange={() => handleCheckboxChange(temp?.id)}
                                />
                                {temp?.image &&
                                    <HiMiniMagnifyingGlassPlus
                                        className="eye-icon" // Add a class for styling
                                        onClick={() => handleImageClick(temp?.image)}
                                        style={{ cursor: 'pointer' }}
                                    />
                                }
                            </div>
                            {!loadedImages.has(temp.id) && (<>
                                <div className="shimmer-wrapper">
                                    <div className="shimmer-img"></div>
                                </div>
                                 <div className="shimmer-wrapper">
                                 <div className="shimmer-img"></div>
                             </div>
                             </>)}
                            <img
                                src={temp?.image || blank}
                                alt={temp.name || "Template Image"}
                                loading="lazy"
                                onLoad={() => handleImageLoad(temp.id)}
                                style={{
                                    opacity: loadedImages.has(temp.id) ? 1 : 0,
                                    transition: 'opacity 0.3s ease-in',
                                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                                }}
                            />
                            {/* <p className='text-white'>{temp.id}</p> */}
                        </label>
                    </div>

                ))
            ) : (
                <div>No templates available</div>
            )}

            {/* Modal for displaying full-size image */}
            <Modal
                isOpen={isModalOpen}
                onRequestClose={closeModal}
                contentLabel="Full Size Image"
                ariaHideApp={false}
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

export default Templates;