import { useForm } from 'react-hook-form';
// import TextInput from "../Layout/TextInput";
import { useState, useEffect, useRef } from 'react';
import { Spinner } from 'react-bootstrap';
import ToastMessage from '@/Layout/ToastMessage';
import AvatarEditor from 'react-avatar-editor';
import CustomModal from '../Modal/Modal';
import { UploadImage } from '@/services/resume/Index';
import prof from "@/assets/Images/resume-builder/profile.png";
// import { FiEdit3 } from "react-icons/fi";
// import { GoPlusCircle } from "react-icons/go";
import { getAccountDetail, SendAccountDetail } from '@/services/Admin';
import { Resend } from '@/services/Auth';
import { TextField } from '@mui/material';
import { Slider } from '@mui/material';
import { AiOutlineDelete } from "react-icons/ai";
import Image from 'next/image';

type AccountdetailsFormData = {
    name: string;
    email: string;
    location: string;
};

const Accountdetails = () => {
    const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<AccountdetailsFormData>();
    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState<File | null>(null);
    const [editor, setEditor] = useState<AvatarEditor | null>(null);
    const [croppedImage, setCroppedImage] = useState<string | null>(null);
    const [uploadImage, setUploadImage] = useState<string | null | any>(null);
    const [isContOpen, setContOpen] = useState(false);
    const [isDataChanged, setDataChanged] = useState(false);
    const [initialEmail, setInitialEmail] = useState<string | null>(null);
    const [Name, setName] = useState<string | null>(null);
    const [isImageChanged, setImageChanged] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [zoom, setZoom] = useState(1); // Zoom state
    const [rotation, setRotation] = useState(0); // Rotation state
    const [isDeleting, setIsDeleting] = useState(false);

    const watchFields = watch(["name", "email", "location"]);

    useEffect(() => {
        fetchAccountDetails();
    }, [reset]);

    const fetchAccountDetails = async () => {
        try {
            const response = await getAccountDetail();
            if (response && response.data) {
                setName(response?.data?.name);
                reset({
                    name: response.data.name,
                    email: response.data.email,
                    location: response.data.location,
                });
                setInitialEmail(response.data.email);
                if (response.data.image) {
                    setUploadImage(response.data.image);
                }
            }
        } catch (error) {
            console.error("Error fetching account details:", error);
        }
    };

    const handleInputChange = () => {
        setDataChanged(true);
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

            setImage(selectedFile);
            setCroppedImage(null);
            setContOpen(true);
            setImageChanged(true);
            setZoom(1); // Reset zoom when new image is selected
            setRotation(0); // Reset rotation when new image is selected
        }
    };

    const handleDeleteImage = async () => {
        try {
            setIsDeleting(true);
            // Call SendAccountDetail with null image to delete
            const resp = await SendAccountDetail({
                name: watchFields[0], // current name value
                email: watchFields[1], // current email value
                location: watchFields[2], // current location value
                image: "null" // this will trigger deletion on backend
            });

            if (resp) {
                setUploadImage(null);
                setImageChanged(false); // Reset since changes are already saved
                setDataChanged(false);
                ToastMessage({
                    type: "success",
                    message: resp.data.message || "Profile image removed successfully",
                });
                fetchAccountDetails(); // Refresh data
            } else {
                throw new Error("Failed to delete image");
            }
        } catch (error) {
            console.error("Error deleting image:", error);
            ToastMessage({
                type: "error",
                message: "Failed to delete profile image. Please try again.",
            });
        } finally {
            setIsDeleting(false);
        }
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
                    setUploadImage(uploadResponse);
                    setImageChanged(true);
                    try {
                        const resp = await SendAccountDetail({
                            name: watchFields[0], // current name value
                            email: watchFields[1], // current email value
                            location: watchFields[2], // current location value
                            image: uploadResponse // pass the uploaded image URL
                        });

                        if (resp) {
                            // ToastMessage({
                            //     type: "success",
                            //     message: "Profile image updated successfully!",
                            // });
                            fetchAccountDetails(); // Refresh data to get updated image
                        } else {
                            throw new Error("Failed to update profile image");
                        }
                    } catch (error) {
                        console.error("Error updating account details:", error);
                        ToastMessage({
                            type: "error",
                            message: "Image uploaded but failed to update profile. Please try again.",
                        });
                    }
                    } else {
                        console.error("Image upload failed:", uploadResponse);
                    }
                } catch (error) {
                    console.error("Error during cropping/upload:", error);
                } finally {
                    setIsUploading(false);
                }
            } else {
                console.error("Editor instance is not available.");
            }
        };

        const onSubmit = async (data: AccountdetailsFormData) => {
            setLoading(true);
            try {
                const resp = await SendAccountDetail({
                    name: data.name,
                    location: data.location,
                    email: initialEmail !== data.email ? data.email : null,
                    image: isImageChanged ? uploadImage : null // Only send image if it was changed
                });
                setLoading(false);
                reset();
                setDataChanged(false);
                setImageChanged(false);
                const message = resp.data.message || "Account details updated successfully!";
                ToastMessage({
                    type: "success",
                    message,
                });
                fetchAccountDetails();
                if (data.email !== initialEmail) {
                    try {
                        const resendResp = await Resend({ email: data.email });
                        ToastMessage({
                            type: "info",
                            message: resendResp.data.message || "Verification email sent successfully!",
                        });
                    } catch (resendError) {
                        ToastMessage({
                            type: "error",
                            message: "Failed to resend verification email. Please try again.",
                        });
                    }

                    setTimeout(() => {
                        localStorage.removeItem('token');
                        window.location.href = '/';
                    }, 3000);
                }
            } catch (error: any) {
                const errorMessage = error || "An error occurred. Please try again.";
                ToastMessage({
                    type: "error",
                    message: errorMessage,
                });
                setLoading(false);
            }
        };

        return (<>
            <div className="container px-5 my-element" data-aos="fade-down" data-aos-delay="100">
                <form onSubmit={handleSubmit(onSubmit)} className='row p-3 mt-5'>
                    <div className="pb-4 pt-2 page-head">
                        <h6>Personal <span>Details</span></h6>
                    </div>
                    <div className="col-lg-12 mb-4 d-flex align-items-center">
                        <div className='pic-upload d-flex align-items-center justify-content-between w-100'>
                            <div className='d-flex align-items-center position-relative'>
                                {!uploadImage || uploadImage === "null" &&
                                    <Image src={prof} alt="" loading="lazy" />
                                }
                                {uploadImage === "null" ? null : <img src={uploadImage || prof} alt="Cropped Preview" loading="lazy" className="mt-2" />}
                                <h4 className='p-2 pt-3'>{Name}</h4>
                            </div>


                            <div className='d-flex align-items-center'>

                                <div className='position-relative mt-5'>
                                    <label>{isUploading ? (
                                        <Spinner animation="border" size="sm" />
                                    ) : (
                                        "Upload Avatar"
                                    )}</label>
                                    <input type="file" accept="image/*" onChange={onImageChange} disabled={isUploading} />
                                </div>

                                {uploadImage === "null" ? null : <button
                                    type="button"
                                    disabled={isUploading || !uploadImage}
                                    className="btn prim-but m-3 mt-4"
                                    onClick={handleDeleteImage}
                                >
                                    <AiOutlineDelete size={16} />
                                </button>}

                            </div>

                        </div>
                    </div>
                    <h6 className='pb-2'>General</h6>
                    <div className="col-lg-12 mb-4">
                        <TextField
                            label="Name"
                            fullWidth
                            {...register("name", { required: "Name cannot be empty", onChange: handleInputChange })}
                            error={!!errors.name}
                            helperText={errors.name?.message}
                            focused={!!watchFields[0]}
                            inputProps={{ maxLength: 50 }}
                        />
                    </div>
                    <div className="col-lg-12 mb-4">
                        <TextField
                            label="Email"
                            fullWidth
                            type='email'
                            {...register("email", {
                                required: "Email cannot be empty",
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: "Invalid email format(abc@gmail.com)"
                                },
                                onChange: handleInputChange
                            })}
                            error={!!errors.email}
                            helperText={errors.email?.message}
                            focused={!!watchFields[1]}
                            inputProps={{ maxLength: 50 }}
                        />
                    </div>
                    <div className="col-lg-12 mb-4">
                        <TextField
                            label="Location"
                            fullWidth
                            {...register("location", { required: "Location cannot be empty", onChange: handleInputChange })}
                            error={!!errors.location}
                            helperText={errors.location?.message}
                            focused={!!watchFields[2]}
                            inputProps={{ maxLength: 50 }}
                        />
                    </div>
                    <div className='text-end'>
                        <button type="submit" className="prim-but mt-3" disabled={!(isDataChanged || isImageChanged) || loading}>
                            {loading ? <Spinner animation="border" className='mt-1' /> : "Submit"}
                        </button>
                    </div>
                </form>
            </div>

            <CustomModal show={isContOpen} onHide={() => setContOpen(false)} custom='crop' title="">
                {image && (
                    <div className='d-grid justify-content-center'>
                        <AvatarEditor
                            ref={setEditor}
                            image={URL.createObjectURL(image)}
                            width={250}
                            height={250}
                            border={50}
                            scale={zoom}
                            rotate={rotation}
                        />

                        <div className='mt-3 px-3'>
                            <div className='d-flex align-items-center mb-2'>
                                <span className='me-2'>Zoom: </span>
                                <Slider
                                    value={zoom}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    onChange={(e, newValue) => setZoom(newValue as number)}
                                    aria-labelledby="zoom-slider"
                                    sx={{ width: '80%' }}
                                />
                                <span className='ms-2'>{zoom.toFixed(1)}x</span>
                            </div>
                        </div>

                        <div className='d-flex justify-content-center'>
                            <button type="button" onClick={handleCrop} className="prim-but mt-2 p-2 w-50">Crop</button>
                        </div>
                    </div>
                )}
            </CustomModal>
        </>);
    };

    export default Accountdetails;