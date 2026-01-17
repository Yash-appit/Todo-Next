'use client';

import { useEffect, useState } from 'react';
import "@/styles/Auth.css";
import { useForm } from "react-hook-form";
import Spinner from 'react-bootstrap/Spinner';
import { Resend, reg, SocialLogin } from '@/services/Auth/index';
import logo from "@/assets/Images/Logo/logo.png";
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import reg1 from "@/assets/Images/auth/reg1.png";
import reg2 from "@/assets/Images/auth/reg2.svg";
import reg3 from "@/assets/Images/auth/reg3.webp";
import { TextField, Checkbox, FormControlLabel } from '@mui/material';
import { Modal } from 'react-bootstrap';
import conf from "@/assets/Images/auth/conf.svg";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import ToastMessage from '@/Layout/ToastMessage';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import { FcGoogle } from "react-icons/fc";
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, facebookProvider } from '@/config/firebase';
import { useFCMToken } from '@/config/useFCMToken';
import ReactGA from 'react-ga4';
import { ANALYTICS_KEY } from '@/config';
import { v4 as uuidv4 } from 'uuid';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Helper functions for safe localStorage access
const getFromLocalStorage = (key: string): string | null => {
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

const setToSessionStorage = (key: string, value: string): void => {
    if (typeof window !== 'undefined') {
        sessionStorage.setItem(key, value);
    }
};

const getFromSessionStorage = (key: string): string | null => {
    if (typeof window !== 'undefined') {
        return sessionStorage.getItem(key);
    }
    return null;
};

const Register = () => {
    const [showModal, setShowModal] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [facebookLoading, setFacebookLoading] = useState(false);
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [token, setToken] = useState<string | null>(null);
    const [deviceId, setDeviceId] = useState<string | null>(null);
    const { FcmToken } = useFCMToken();

    // Initialize state on client side only
    useEffect(() => {
        // Set token from localStorage
        setToken(getFromLocalStorage("token"));
        
        // Initialize deviceId
        const storedDeviceId = getFromLocalStorage('device_id');
        if (!storedDeviceId) {
            const newDeviceId = uuidv4();
            setToLocalStorage('device_id', newDeviceId);
            setDeviceId(newDeviceId);
        } else {
            setDeviceId(storedDeviceId);
        }
    }, []);

    useEffect(() => {
        if (token) {
            router.push("/resumes");
        }
    }, [token, router]);

    const settings = {
        dots: true,
        autoplay: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
    };

    const {
        register,
        handleSubmit,
        formState: { errors, isDirty, isValid },
        watch,
        reset,
    } = useForm({
        mode: "onChange",
    });

    const email = watch("email");

    const resendEmail = async () => {
        const savedEmail = getFromSessionStorage("email");
        if (!savedEmail) {
            ToastMessage({
                type: "error",
                message: "No email available to resend confirmation.",
            });
            return;
        }
        try {
            setLoading(true);
            const requestBody = {
                email: savedEmail,
            };
            const response = await Resend(requestBody);
            if (response) {
                ToastMessage({
                    type: "success",
                    message: response.data.message,
                });
            }
        } catch (error: any) {
            ToastMessage({
                type: "error",
                message: error || "An error occurred.",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSocialSignUp = async (provider: any, providerName: string) => {
        try {
            if (providerName === 'google') {
                setGoogleLoading(true);
            } else {
                setFacebookLoading(true);
            }

            setErrorMessage("");
            // const fcmToken = await getFCMToken();
            // Sign in with Firebase

            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Get the Firebase ID token
            const firebaseToken = await user.getIdToken();

            // Prepare data for your backend API
            const userData = {
                email: user.email,
                fcm_token: FcmToken || "fcm",
                device_id: deviceId || '',
                device_type: "",
                auth_token: firebaseToken,
                type: providerName
            };

            // Call your backend API with the Firebase token
            const response = await SocialLogin(userData);

            if (response.data.status) {
                ToastMessage({
                    type: "success",
                    message: `${providerName.charAt(0).toUpperCase() + providerName.slice(1)} Sign-Up successful!`,
                });

                if (ANALYTICS_KEY) {
                    ReactGA.event({
                        category: 'Authentication',
                        action: 'Register Success',
                        label: "Social Email",
                        value: 1
                    });
                }
                
                // Store the token from your backend if provided
                if (response.data.token) {
                    setToLocalStorage("token", response.data.token);
                    setToken(response.data.token);
                    window.location.href = "/resumes";
                } else {
                    setToSessionStorage("socialUser", JSON.stringify(userData));
                    setShowModal(true);
                }
            } else {
                setErrorMessage(response.data.message || "Registration failed");
            }

        } catch (error: any) {
            let errorMsg = `${providerName.charAt(0).toUpperCase() + providerName.slice(1)} Sign-Up failed`;

            if (error.code) {
                switch (error.code) {
                    case 'auth/popup-closed-by-user':
                        errorMsg = "Sign-up cancelled";
                        break;
                    case 'auth/popup-blocked':
                        errorMsg = "Popup blocked. Please allow popups and try again";
                        break;
                    case 'auth/account-exists-with-different-credential':
                        errorMsg = "Account exists with different credentials";
                        break;
                    case 'auth/cancelled-popup-request':
                        errorMsg = "Sign-up request cancelled";
                        break;
                    case 'auth/facebook-auth/account-exists-with-different-credential':
                        errorMsg = "Facebook account exists with different credentials";
                        break;
                    default:
                        errorMsg = error.message || errorMsg;
                }
            }

            setErrorMessage(errorMsg);
        } finally {
            if (providerName === 'google') {
                setGoogleLoading(false);
            } else {
                setFacebookLoading(false);
            }
        }
    };

    const handleGoogleSignUp = () => handleSocialSignUp(googleProvider, 'google');
    const handleFacebookSignUp = () => handleSocialSignUp(facebookProvider, 'facebook');

    const Submit = async (data: any) => {
        if (ANALYTICS_KEY) {
            ReactGA.event({
                category: 'Authentication',
                action: 'Social Login Attempt',
            });
        }
        
        const { name, email, password } = data;
        const fcm_token = FcmToken || "fcm";
        const device_id = deviceId || '';

        try {
            setLoading(true);
            setErrorMessage("");
            setSuccessMessage("");

            const response = await reg({ name, email, password, fcm_token, device_id });

            if (response.data.status) {
                setSuccessMessage(response.data.message);

                if (ANALYTICS_KEY) {
                    ReactGA.event({
                        category: 'Authentication',
                        action: 'Register Success',
                        label: "Email",
                        value: 1
                    });
                }
                
                setShowModal(true);
            } else {
                setErrorMessage(response.data.message || "Registration failed");
            }
        } catch (error: any) {
            setErrorMessage(error || "An error occurred during registration");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (email) {
            setToSessionStorage("email", email);
        }
    }, [email]);

    useEffect(() => {
        if (errorMessage) {
            ToastMessage({
                type: "error",
                message: errorMessage,
            });

            const timer = setTimeout(() => {
                setErrorMessage("");
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, [errorMessage]);

    useEffect(() => {
        if (successMessage) {
            ToastMessage({
                type: "success",
                message: successMessage,
            });
            setShowModal(true);
        }
    }, [successMessage]);

    const formSchema = {
        name: register("name", {
            required: "Name cannot be empty",
        }),
        email: register("email", {
            required: "Email cannot be empty",
            pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                message: "Email address should be of the form example@mail.com",
            },
        }),
        password: register("password", {
            required: "Password cannot be empty",
            minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
            },
        }),
        confirmPassword: register("confirmPassword", {
            required: "Please confirm your password",
            validate: (value) => {
                const { password } = watch();
                return value === password || "Passwords do not match";
            },
        }),
        terms: register("terms", {
            required: "Please accept the terms and policy",
        }),
    };

    return (
        <>
            <section className='login reg'>
                <div className='container py-4'>
                    <Link href="/">
                        <Image src={logo} alt="" loading="lazy" className='logo pt-2 mb-2 my-element' data-aos="fade-up" data-aos-delay="100" width={100} height={50} />
                    </Link>
                    <div className="row m-auto">
                        <div className="col-lg-5 p-0 sec-bg log-img my-element" data-aos="fade-up" data-aos-delay="100">
                            <Slider {...settings}>
                                <Image src={reg1} alt="" loading="lazy" className='w-100 p-5' width={500} height={400} />
                                <Image src={reg2} alt="" loading="lazy" className='w-100 p-5' width={500} height={400} />
                                <Image src={reg3} alt="" loading="lazy" className='w-100 p-4 mt-5 pt-5' width={500} height={400} />
                            </Slider>
                        </div>
                        <div className="col-lg-7 log-col m-auto p-5 py-0 pt-2 my-element" data-aos="fade-up" data-aos-delay="100">
                            <h1>Sign up</h1>
                            <p>Let's get you all set up so you can access your personal account.</p>
                            
                            <form onSubmit={handleSubmit(Submit)} className='pt-0'>
                                <div>
                                    <TextField
                                        label="Name"
                                        type='text'
                                        className='w-100'
                                        {...formSchema.name}
                                        fullWidth
                                        variant="outlined"
                                        margin="normal"
                                        inputProps={{ maxLength: 50 }}
                                    />
                                    {errors.name?.message && <p className="text-danger mt-1">{String(errors.name.message)}</p>}
                                </div>
                                <div>
                                    <TextField
                                        label="Email"
                                        type='email'
                                        className='w-100'
                                        {...formSchema.email}
                                        fullWidth
                                        variant="outlined"
                                        margin="normal"
                                        inputProps={{ maxLength: 50 }}
                                    />
                                    {errors.email && <p className="text-danger mt-1">{String(errors.email.message)}</p>}
                                </div>
                                <div className='position-relative'>
                                    <TextField
                                        label="Password"
                                        type={showPassword ? "text" : "password"}
                                        className='w-100'
                                        {...formSchema.password}
                                        fullWidth
                                        variant="outlined"
                                        margin="normal"
                                        inputProps={{ maxLength: 30 }}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label="toggle password visibility"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        edge="end"
                                                    >
                                                        {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                    {errors.password && <p className="text-danger mt-1">{String(errors.password.message)}</p>}
                                </div>
                                <div className='position-relative'>
                                    <TextField
                                        label="Confirm Password"
                                        type={showConfirmPassword ? "text" : "password"}
                                        className='w-100'
                                        {...formSchema.confirmPassword}
                                        fullWidth
                                        variant="outlined"
                                        margin="normal"
                                        inputProps={{ maxLength: 30 }}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        aria-label="toggle password visibility"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        edge="end"
                                                    >
                                                        {showConfirmPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                    {errors.confirmPassword && <p className="text-danger mt-1">{String(errors.confirmPassword.message)}</p>}
                                </div>
                                <div>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                {...formSchema.terms}
                                                color="primary"
                                            />
                                        }
                                        label={
                                            <label>
                                                I agree to all <Link href="/termAndCondition" className='m-0'>Terms</Link> and <Link href="/privacyPolicy" className='m-0'>Privacy Policies</Link>
                                            </label>
                                        }
                                    />
                                    {errors.terms && <p className="text-danger mt-1 text-start">{String(errors.terms.message)}</p>}
                                </div>
                                <div className="text-start mt-4">
                                    <button
                                        disabled={!isDirty || loading}
                                        type="submit"
                                        className='prim-but w-100 fs-6'
                                    >
                                        {loading ? <Spinner animation="border" className='mt-1' /> : "Create Account"}
                                    </button>
                                    <div className="mt-3">
                                        <p className='w-100 text-center'>Already have an account?<Link href="/login" className='mx-1'>Login</Link></p>
                                        <button
                                            type="button"
                                            onClick={handleGoogleSignUp}
                                            disabled={googleLoading}
                                            className='soc-but d-flex justify-content-center m-auto'
                                        >
                                            {googleLoading ? (
                                                <Spinner animation="border" />
                                            ) : (
                                                <>
                                                    <FcGoogle size={30} />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </form>

                            <Modal show={showModal} onHide={() => {
                                setShowModal(false);
                                reset({
                                    name: '',
                                    email: '',
                                    password: '',
                                    confirmPassword: '',
                                    terms: false
                                });
                            }} size='xl' className='conf' centered>
                                <Modal.Header closeButton>
                                </Modal.Header>
                                <Modal.Body>
                                    <div className="row m-0">
                                        <div className="col-lg-6 conf-img">
                                            <Image
                                                src={conf}
                                                alt=""
                                                loading="lazy"
                                                className='w-100'
                                                width={500}
                                                height={400}
                                            />
                                        </div>
                                        <div className="col-lg-6 text-center m-auto">
                                            <h1 className="mt-3">Your <span className='sec-col'>Registration was</span> <br />Successful!</h1>
                                            <p className='mt-4'>We just sent you a confirmation email. Check your inbox.</p>
                                            <button className='prim-but mt-3 w-75' onClick={resendEmail}>
                                                {loading ? <Spinner animation="border" size="sm" /> : "Resend Confirmation Email"}
                                            </button>
                                        </div>
                                    </div>
                                </Modal.Body>
                            </Modal>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

export default Register;