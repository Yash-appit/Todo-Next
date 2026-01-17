"use client"
import { FC, useEffect } from "react";
import TextInput from "@/Layout/TextInput";
import { MdOutlineMailOutline } from "react-icons/md";
import { FaRegUser } from "react-icons/fa";
import { useForm } from "react-hook-form";
import TextArea from "@/Layout/TextArea";
import { FaRegMessage } from "react-icons/fa6";
import "@/styles/Other.css";
import Spinner from 'react-bootstrap/Spinner';
import { useState } from 'react';
import { contact } from '@/services/contact/index';
import { IoMailSharp } from "react-icons/io5";
import ToastMessage from "@/Layout/ToastMessage";
import Link from "next/link";

interface ContactProps {
  onSuccess?: () => void;
}

const Contact: FC<ContactProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [])

  const Submit = async (data: any) => {
    setLoading(true);
    // Check if all fields are filled before submitting
    if (!data.first_name || !data.last_name || !data.email || !data.message) {
      ToastMessage({
        type: "error",
        message: "Please fill in all required fields",
      });
      return;
    }


    setErrorMessage('');
    setSuccessMessage('');

    try {
      const resp = await contact(data);
      if (resp.data.status === true) {
        ToastMessage({
          type: "success",    
          message: resp.data.message,
        });
        reset();
      }
    } catch (error: any) {
      const errorResponse = error?.message || 'An error occurred while contacting us';
      ToastMessage({
        type: "error",   
        message: errorResponse,
      });
    }
    setLoading(false);
  };

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    mode: "onChange",
  });

  const formSchema = {
    first_name: register("first_name", { required: "First Name cannot be empty" }),
    last_name: register("last_name", { required: "Last Name cannot be empty" }),
    email: register("email", { 
      required: "Email cannot be empty",
      pattern: {
        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        message: "Invalid email address"
      }
    }),
    message: register("message", { required: "Message cannot be empty" }),
  };

  return (
    <div className="contact pt-5">
      <div className="container mt-5 text-center">
        <h1 className="mt-5 pt-4 my-element" data-aos="fade-down" data-aos-delay="100">Contact Us</h1>
        <p className="mb-4 my-element" data-aos="fade-down" data-aos-delay="100">Any question or remarks? Just write us a message!</p>
        <div className="row m-0 mb-4">

          <div className="col-lg-5 px-0 my-element" data-aos="fade-up" data-aos-delay="200">
            <div className="cont-inf p-4">
              <h4>Contact Information</h4>
              <p>Contact us for more Information!</p>

              <Link href="mailto:todoresumehelp@gmail.com">
                <IoMailSharp /> todoresumehelp@gmail.com
              </Link>

              <div className="circle1"></div>
              <div className="circle2"></div>
            </div>
          </div>

          <div className="col-lg-7 cont my-5 p-5 my-element" data-aos="fade-up" data-aos-delay="200">
            <form onSubmit={handleSubmit(Submit)} className="row text-start">
              <div className='col-lg-6 mb-4'>
                <label>
                  First Name
                  <TextInput type='text' className='sec-bg' icon={<FaRegUser className='fs-5' />} {...formSchema.first_name} maxLength={50} />
                  {errors.first_name && <small className="text-danger">{errors.first_name.message as string}</small>}
                </label>
              </div>

              <div className='col-lg-6 mb-4'>
                <label>
                  Last Name
                  <TextInput type='text' className='sec-bg' icon={<FaRegUser className='fs-5' />} {...formSchema.last_name} maxLength={50} />
                  {errors.last_name && <small className="text-danger">{errors.last_name.message as string}</small>}
                </label>
              </div>

              <div className='col-lg-6 mb-4'>
                <label>
                  Email
                  <TextInput type='email' className='sec-bg' icon={<MdOutlineMailOutline className='fs-5' />} {...formSchema.email} maxLength={50} />
                  {errors.email && <small className="text-danger">{errors.email.message as string}</small>}
                </label>
              </div>

              <div className='col-lg-12'>
                <label>
                  Message
                  <TextArea className='sec-bg' icon={<FaRegMessage className='fs-5' />} {...formSchema.message} maxLength={250} />
                  {errors.message && <small className="text-danger">{errors.message.message as string}</small>}
                </label>
              </div>

              <div className="text-center mt-5 d-flex justify-content-end">
                <button
                  type="submit"
                  className='prim-but'
                  disabled={loading}
                >
                  {loading ? <Spinner animation="border" className='mt-1' /> : "Send Message"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact;