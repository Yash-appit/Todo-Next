import React from 'react'
import error from "@/assets/Images/404.png";
import { LuArrowLeft } from "react-icons/lu";
import Image from 'next/image';
import Link from 'next/link';


const ErrorPage = () => {
  return (
    <>

    <div className='error-page pt-4 text-center'>
      <Image src={error} alt="" loading="lazy" className='w-100 pt-5 mt-5'/>
      <Link href="/" type='button' className='prim-but mb-4'><LuArrowLeft className='me-2'/> Return to Home</Link>
    </div>
    </>)
}

export default ErrorPage;
