'use client';

import React, { useState } from 'react'
import TextField from '@mui/material/TextField';
import { useForm } from "react-hook-form";
import Spinner from 'react-bootstrap/Spinner';
import { MdOutlineMailOutline } from "react-icons/md";
import { forget } from '@/services/Auth/index';
import logo from "@/assets/Images/Logo/logo.png";
import for1 from "@/assets/Images/auth/forget1.svg";
import for2 from "@/assets/Images/auth/forget2.svg";
import for3 from "@/assets/Images/auth/forget3.svg";
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { IoIosArrowBack } from "react-icons/io";
import Image from 'next/image';
import "@/styles/Auth.css";
import Link from 'next/link';

// import { Helmet } from 'react-helmet';

const ForgetPassword = () => {
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [password, setPassword] = useState('');
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
        reset,
        formState: { isDirty, isValid },
    } = useForm({
        mode: "onChange",
    });


    const formSchema = {
        email: register("email", {
            required: "Email cannot be empty",
        }),
    };


    const handleFormSubmit = async (data: any) => {
        try {
            setLoading(true);
            setErrorMessage('');
            setSuccessMessage('');
            const requestBody = {
                email: data.email,
            };
            const response = await forget(requestBody);
            setSuccessMessage(response.data.message || "An Erorr Occured");
            setTimeout(() => {
                setSuccessMessage('');
                // close();
            }, 2000);
            reset();
            setPassword(response.data.data);
            setLoading(false);

        } catch (error: any) {
            setLoading(true);
            setErrorMessage(error);
            setTimeout(() => {
                setErrorMessage('');
                setLoading(false);
            }, 2000);
        }
    };

    // const forgetupdate {

    // }

    return (<>

        <section className='login forget'>
            <div className='container py-4'>
            <Link href="/">
                <Image src={logo} alt="" loading="lazy" className='logo pt-3 my-element' data-aos="fade-down" data-aos-delay="100"/>
                </Link>
                <div className="row m-auto">
                    <div className="col-lg-7 py-2 log-col m-auto my-element" data-aos="fade-up" data-aos-delay="100">



                        <Link href="/login" className='mx-0 text-black text-decoration-none back'><IoIosArrowBack className='mb-1 fs-5 text-black'/> Back to Login</Link>
                        <h1 className='mt-3'>Forgot your password?</h1>
                        <p className='mb-0 pt-2'>Don’t worry, happens to all of us. Enter your email below to recover <br /> your password</p>
                        <form onSubmit={handleSubmit(handleFormSubmit)}>
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
                            </div>

                            <div className="text-start mt-3">
                                <button
                                    disabled={(!isDirty || !isValid) || loading}
                                    type="submit"
                                    className='prim-but'
                                >
                                    {loading ? <Spinner animation="border" className='mt-1' /> : "Submit"}
                                </button>
                                {errorMessage && <p className='text-center text-danger erorr mt-3'>{errorMessage}</p>}

                                {successMessage && <p className='text-center text-success success mt-3 p-2 fw-bold'>{successMessage}</p>}
                                {password && <p className='text-center text-success success mt-3 p-2 fw-bold'>{password}</p>}
                            </div>

                        </form>
                    </div>



                    <div className="col-lg-5 p-0 sec-bg log-img mt-3 my-element" data-aos="fade-up" data-aos-delay="100">
                        <Slider {...settings}>
                            <Image src={for1} alt="" loading="lazy" className='w-100 p-5' />
                            <Image src={for2} alt="" loading="lazy" className='w-100 p-5' />
                            <Image src={for3} alt="" loading="lazy" className='w-100 p-4' />
                        </Slider>
                    </div>
                </div>
            </div>
        </section>
        </> )
}

export default ForgetPassword
