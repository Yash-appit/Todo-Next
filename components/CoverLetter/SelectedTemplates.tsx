import { useState, useEffect } from 'react';
import Modal from 'react-modal'; // Import a modal library
import { HiMiniMagnifyingGlassPlus } from "react-icons/hi2";
import tick from "@/assets/Images/Templates/tick.png";
import ToastMessage from '@/Layout/ToastMessage';
import { CVTemplateList } from '@/services/CVTemplate';
import Loader from '@/Layout/Loader';
// Set the app element for accessibility (required by react-modal)
// Modal.setAppElement('#root'); // Replace '#root' with your app's root element ID
import "@/styles/Resumebuilder.css";
import Image from 'next/image';

interface TemplatesProps {
    Generate: () => void;
}



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

const setToSessionStorage = (key: string, value: string): void => {
    if (typeof window !== 'undefined') {
        sessionStorage.setItem(key, value);
    }
};

const SelectTemplates: React.FC<TemplatesProps> = ({ Generate }) => {
    // const SelectTemplates = () => {
    const [templates, setTemplates] = useState<any[]>([]);  // Initialize as an empty array
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(getFromSessionStorage('CLtemplateId') ? Number(getFromSessionStorage('CLtemplateId')) : null); // State to track selected template
    const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility
    const [selectedImage, setSelectedImage] = useState<string | null>(null); // State to store the selected image URL
    const [token, setToken] = useState(getFromSessionStorage('token'));
    const [templateId, sTemplateId] = useState(getFromSessionStorage('templateId'));


    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        setToken(getFromLocalStorage('token'));
    }, [token]);

    const fetchData = async () => {
        try {
            const response = await CVTemplateList();
            // console.log(response.data);
            // console.log(templateId);

            const templatesData = response.data || [];
            // console.log(templatesData[0].id);
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
        setToSessionStorage('CLtemplateId', id.toString());
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
        return <Loader />;
    }


    return (
        <div className="row templates m-0 p-2 pt-3 templates-2">
            {templates?.length > 0 ? (
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
                                <Image
                                    src={temp.image}
                                    alt={temp.name || "Template Image"}
                                    className='temp-img'
                                    width={300}
                                    height={400}
                                    unoptimized
                                    style={{ width: '100%', height: 'auto' }}
                                />
                                {/* <p>{temp.id}</p> */}
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
                        <Image
                            src={selectedImage}
                            alt="Full Size Template"
                            width={800}
                            height={1000}
                            unoptimized
                            style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: '10px', width: 'auto', height: 'auto' }}
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