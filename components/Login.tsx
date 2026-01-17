'use client';

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useForm } from "react-hook-form";
import Spinner from 'react-bootstrap/Spinner';
import TextField from '@mui/material/TextField';
import login1 from "@/assets/Images/auth/login1.svg";
import login2 from "@/assets/Images/auth/login2.svg";
import login3 from "@/assets/Images/auth/login3.svg";
import ToastMessage from '@/Layout/ToastMessage';
import logo from "@/assets/Images/Logo/logo.png";
import Slider from 'react-slick';
import { login, SocialLogin } from '@/services/Auth/index'
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import { auth, googleProvider } from '@/config/firebase';
import { signInWithPopup } from 'firebase/auth';
import { FcGoogle } from 'react-icons/fc';
import { useRefresh } from '@/context/RefreshContext';
import { useFCMToken } from '@/config/useFCMToken';
import { ANALYTICS_KEY } from '@/config';
import ReactGA from 'react-ga4';
import { v4 as uuidv4 } from 'uuid';
import Image from 'next/image';
import "@/styles/Auth.css";
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
// import { useCredits } from '@/hooks/useCredits';
// import { useDashboard } from '@/hooks/useDashboard';

interface LoginProps {
    close?: () => void;
}

// Helper function to safely access localStorage only on client side
const getFromLocalStorage = (key: string): string | null => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem(key);
    }
    return null;
};

const getFromSessionStorage = (key: string): string | null => {
    if (typeof window !== 'undefined') {
        return sessionStorage.getItem(key);
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

const removeFromLocalStorage = (key: string): void => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(key);
    }
};

// Lazy load hooks that might access localStorage
// const useCredits = lazy(() => import('@/hooks/useCredits'));
// const useDashboard = lazy(() => import('@/hooks/useDashboard'));

const LoginContent: React.FC<LoginProps> = ({ close }) => {
    const router = useRouter();
    const pathname = usePathname();
    const [deviceId, setDeviceId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [facebookLoading, setFacebookLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const isNotModalPopup = pathname === "/login" ? true : false;
    const { refresh } = useRefresh();
    const { FcmToken } = useFCMToken();
    
    // Lazy loaded hooks
    const [credits, setCredits] = useState<any>(null);
    const [dashboard, setDashboard] = useState<any>(null);

    // Initialize state on client side only
    useEffect(() => {
        // Set token from localStorage
        const storedToken = getFromLocalStorage("token");
        setToken(storedToken);
        
        // Set deviceId
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
        if (token && isNotModalPopup) {
            window.location.href = "/resumes"; // Redirect to /resumes if token exists and not a modal popup
        } else if (close && token) {
            close(); // Only call close if it exists and we have a token
            refresh();
        }
    }, [token, close, isNotModalPopup, refresh]);

    useEffect(() => {
        if (typeof window !== 'undefined' && ANALYTICS_KEY) {
            // Track pageview
            ReactGA.send({
                hitType: 'pageview',
                page: pathname,
                title: 'Login Page'
            });
        }
    }, [pathname]);

    const settings = {
        dots: true,
        autoplay: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
    };

    useEffect(() => {
        if (successMessage) {
            ToastMessage({
                type: "success",
                message: successMessage,
            });
            
            const fetchData = async () => {
                try {
                    // Dynamically import the hooks
                    const creditsModule = await import('@/hooks/useCredits');
                    const dashboardModule = await import('@/hooks/useDashboard');
                    
                    // You'll need to adjust this based on how your hooks work
                    // If they are functions that return data, call them
                    // If they are custom hooks with methods, you'll need to handle them differently
                } catch (error) {
                    console.error('Error loading hooks:', error);
                }
            };
            
            fetchData();
            
            const currentPath = pathname;

            setTimeout(() => {
                if (currentPath === '/packages') {
                    window.location.reload();
                } else if (currentPath === '/create-resume') {
                    refresh();
                } else if (currentPath === '/') {
                    refresh();
                    close?.();
                } else {
                    window.location.href = "/resumes";
                }
            }, 2000);
        }
    }, [successMessage, pathname, close, refresh]);

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

    const {
        register,
        handleSubmit,
        formState: { isDirty, isValid, errors },
    } = useForm({
        mode: "onChange",
    });

    const Submit = async (data: any) => {
        if (ANALYTICS_KEY) {
            ReactGA.event({
                category: 'Authentication',
                action: 'Social Login Attempt',
            });
        }

        setErrorMessage("");
        setSuccessMessage("");
        setIsLoading(true);
        const { email, password } = data;
        const fcm_token = FcmToken;
        const device_type = "web";
        const device_id = deviceId || '';

        const GuestId = getFromSessionStorage('GuestId');
        const resume_refrence_id = GuestId || null;

        if (rememberMe) {
            setToLocalStorage('rememberedEmail', email);
        } else {
            removeFromLocalStorage('rememberedEmail');
        }

        try {
            const response = await login({ email, password, device_id, fcm_token, device_type, resume_refrence_id });

            if (response.data.token) {
                setSuccessMessage(response?.data?.message);
                if (ANALYTICS_KEY) {
                    ReactGA.event({
                        category: 'Authentication',
                        action: 'Login Success',
                        label: "Email Login",
                        value: 1
                    });
                }
                // Store token or user data if needed
                if (typeof window !== 'undefined') {
                    setToLocalStorage('token', response?.data?.token);
                    setToLocalStorage('name', response?.data?.data?.name);
                    setToken(response?.data?.token);
                }
            } else {
                setErrorMessage(response.data.message || "Login failed");
            }
        } catch (error: any) {
            setErrorMessage(error || "An error occurred during login");
            setIsLoading(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = () => handleSocialLogin(googleProvider, 'google');

    const handleSocialLogin = async (provider: any, providerName: string) => {
        try {
            // Set loading state
            if (providerName === 'google') {
                setGoogleLoading(true);
            } else {
                setFacebookLoading(true);
            }

            setErrorMessage("");

            // Sign in with Firebase
            const result = await signInWithPopup(auth, provider).catch(error => {
                // Handle popup closed by user
                if (error.code === 'auth/popup-closed-by-user') {
                    throw new Error('Sign-In cancelled');
                }
                throw error;
            });

            const user = result.user;
            const firebaseToken = await user.getIdToken();

            const userData = {
                email: user.email,
                fcm_token: FcmToken || "fcm",
                device_id: deviceId || '',
                device_type: "",
                auth_token: firebaseToken,
                type: providerName
            };

            const response = await SocialLogin(userData);

            if (response.data.status) {
                if (ANALYTICS_KEY) {
                    ReactGA.event({
                        category: 'Authentication',
                        action: 'Login Success',
                        label: "Social Login",
                        value: 1
                    });
                }
                ToastMessage({
                    type: "success",
                    message: `${providerName.charAt(0).toUpperCase() + providerName.slice(1)} Login successful!`,
                });

                if (response.data.token) {
                    if (typeof window !== 'undefined') {
                        setToLocalStorage("token", response.data.token);
                        setToken(response.data.token);
                    }
                    if (isNotModalPopup) {
                        window.location.href = "/resumes";
                    }
                } else {
                    if (typeof window !== 'undefined') {
                        setToSessionStorage("socialUser", JSON.stringify(userData));
                    }
                    setShowModal(true);
                }
            } else {
                setErrorMessage(response.data.message || "Registration failed");
            }

        } catch (error: any) {
            let errorMsg = `${providerName.charAt(0).toUpperCase() + providerName.slice(1)} Sign-In failed`;

            if (error.code || error.message) {
                switch (error.code || error.message) {
                    case 'auth/popup-closed-by-user':
                    case 'Sign-In cancelled':
                        errorMsg = "Sign-In cancelled";
                        break;
                    case 'auth/popup-blocked':
                        errorMsg = "Popup blocked. Please allow popups and try again";
                        break;
                    case 'auth/account-exists-with-different-credential':
                        errorMsg = "Account exists with different credentials";
                        break;
                    case 'auth/cancelled-popup-request':
                        errorMsg = "Sign-Up request cancelled";
                        break;
                    default:
                        errorMsg = error.message || errorMsg;
                }
            }

            setErrorMessage(errorMsg);
        } finally {
            // Always reset loading state in finally block
            if (providerName === 'google') {
                setGoogleLoading(false);
            } else {
                setFacebookLoading(false);
            }
        }
    };

    const formSchema = {
        email: register("email", {
            required: "Email cannot be empty",
            pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Invalid email format(abc@gmail.com)"
            }
        }),
        password: register("password", {
            required: "Password cannot be empty"
        }),
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <section className='login'>
            <div className='container py-4'>
                <Link href="/" className="my-element red" data-aos="fade-up" data-aos-delay="100">
                    <Image src={logo} alt="" loading='lazy' className='logo pt-2' width={100} height={50} />
                </Link>
                <div className="row m-auto">
                    <div className="col-lg-7 py-2 log-col m-auto my-element" data-aos="fade-up" data-aos-delay="100">
                        <h1>Login</h1>
                        <p className='mt-1'>Login to access your Todo resume account</p>
                        <form onSubmit={handleSubmit(Submit)}>
                            <div>
                                <TextField
                                    label="Email"
                                    type='email'
                                    className='sec-bg'
                                    {...formSchema.email}
                                    fullWidth
                                    variant="outlined"
                                    margin="normal"
                                    inputProps={{ maxLength: 50 }}
                                />
                                {errors.email && <p className="text-danger mt-1">{String(errors.email.message)}</p>}
                            </div>
                            <div className='mt-1 position-relative'>
                                <TextField
                                    label="Password"
                                    type={showPassword ? 'text' : 'password'}
                                    className='sec-bg'
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
                                                    onClick={togglePasswordVisibility}
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

                            <div className="col-lg-9 text-start d-flex align-items-baseline justify-content-between mt-2">
                                <div className="form-check">
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        id="rememberMe"
                                        checked={rememberMe}
                                        onChange={() => setRememberMe(!rememberMe)}
                                    />
                                    <label className="form-check-label" htmlFor="rememberMe">Remember me</label>
                                </div>
                                <Link href="/forget" className='pe-4'>Forgot Password</Link>
                            </div>
                            <div className="text-start mt-4">
                                <button
                                    disabled={(!isDirty) || isLoading}
                                    type="submit"
                                    className='prim-but mt-2'
                                >
                                    {isLoading ? <Spinner animation="border" className='mt-1' /> : "Login"}
                                </button>
                                <p className='mt-2 text-center'>Don't you have an account?<Link href="/signup">Signup</Link></p>
                            </div>

                            <div className="mt-3 text-center col-lg-8">
                                <button
                                    type="button"
                                    onClick={handleGoogleLogin}
                                    disabled={googleLoading}
                                    className="social-login-btn"
                                >
                                    {googleLoading ? <Spinner animation="border" size="sm" /> : <><FcGoogle size={30} /> Continue with Google</>}
                                </button>
                            </div>
                        </form>
                    </div>

                    {pathname === "/login" &&
                        <div className="col-lg-5 p-0 sec-bg log-img my-element" data-aos="fade-up" data-aos-delay="100">
                            <Slider {...settings}>
                                <Image src={login1.src} alt="" loading="lazy" className='w-100 p-5' width={500} height={400} />
                                <Image src={login2} alt="" loading="lazy" className='w-100 p-5' width={500} height={400} />
                                <Image src={login3} alt="" loading="lazy" className='w-100 p-5' width={500} height={400} />
                            </Slider>
                        </div>
                    }
                </div>
            </div>
        </section>
    );
};

const Login: React.FC<LoginProps> = (props) => {
    return (
        <Suspense fallback={
            <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <Spinner animation="border" variant="primary" />
            </div>
        }>
            <LoginContent {...props} />
        </Suspense>
    );
};

export default Login;