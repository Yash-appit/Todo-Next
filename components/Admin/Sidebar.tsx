import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import logo from "@/assets/Images/Logo/logo.png";
import { BiSolidDashboard } from "react-icons/bi";
import CustomModal from '@/components/Modal/Modal';
import { IoSettingsOutline } from "react-icons/io5";
import { LiaBookReaderSolid } from "react-icons/lia";
import fav from "@/assets/Images/Logo/mb-logo.png";
import { MdDocumentScanner } from "react-icons/md";
import { MdEditDocument } from "react-icons/md";
import { TbTextScan2 } from "react-icons/tb";
import { MdOutlineDescription } from "react-icons/md";
import { MdQuestionAnswer } from "react-icons/md";
import { PiTarget } from "react-icons/pi";
import { CiLinkedin } from "react-icons/ci";
import { ImInsertTemplate } from "react-icons/im";
import Link from 'next/link';
import Image from 'next/image';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

// Custom NavLink component for Next.js
const NavLink: React.FC<NavLinkProps> = ({ href, children }) => {
  const pathname = usePathname();
  const isActive = pathname === href || 
                   (href !== '/' && pathname.startsWith(href));

  return (
    <Link 
      href={href}
      className={`flex items-center p-3 rounded mb-1 transition-colors ${
        isActive 
          ? 'active bg-blue-50 text-blue-600' 
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      {children}
    </Link>
  );
};

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(!isOpen);
  const [isLogoutOpen, setLogoutOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/');
  };

  return (
    <div
      style={{ width: isOpen ? "0" : "235px" }}
      className="sidebar p-0 h-screen bg-white transition-all duration-300 overflow-hidden"
    >
      <div className="logo-bar flex justify-center items-center px-4 py-4 border-b pb-1">
        <Link href="/" className='flex justify-content-center'>
          <Image
            src={logo}
            alt="Logo"
            width={150}
            height={60}
            className="logo w-auto"
          />
          <Image
            src={fav}
            alt="Favicon"
            width={40}
            height={40}
            className="logo2 w-auto ml-2"
          />
        </Link>
      </div>

      <div className="flex flex-col p-3 pt-2 space-y-1">
        <NavLink href="/resumes">
          <div className='icon mr-3'>
            <BiSolidDashboard size={20} />
          </div>
          <p className='pt-1'>My Documents</p>
        </NavLink>

        <NavLink href="/manage-subscription">
          <div className='icon mr-3'>
            <LiaBookReaderSolid size={20} />
          </div>
          <p className='pt-1'>Manage Subscription</p>
        </NavLink>

        <NavLink href="/ats-checker">
          <div className='icon mr-3'>
            <MdDocumentScanner size={20} />
          </div>
          <p className='pt-1'>ATS Checker</p>
        </NavLink>

        <NavLink href="/email-template-generator">
          <div className='icon mr-3'>
            <ImInsertTemplate size={20} />
          </div>
          <p className='pt-1'>Email Temp Generator</p>
        </NavLink>

        <NavLink href="/job-description-analyzer">
          <div className='icon mr-3'>
            <TbTextScan2 size={20} />
          </div>
          <p className='pt-1'>JD Analyzer</p>
        </NavLink>

        <NavLink href="/job-description-generator">
          <div className='icon mr-3'>
            <MdOutlineDescription size={20} />
          </div>
          <p className='pt-1'>JD Generator</p>
        </NavLink>

        <NavLink href="/qa-generator">
          <div className='icon mr-3'>
            <MdQuestionAnswer size={20} />
          </div>
          <p className='pt-1'>QA Generator</p>
        </NavLink>

        <NavLink href="/career-objective-generator">
          <div className='icon mr-3'>
            <PiTarget size={20} />
          </div>
          <p className='pt-1'>Career-Obj Generator</p>
        </NavLink>

        <NavLink href="/linkedin-bio-generator">
          <div className='icon mr-3'>
            <CiLinkedin size={20} />
          </div>
          <p className='pt-1'>LinkedIn-Bio Generator</p>
        </NavLink>

        <NavLink href="/feedback">
          <div className='icon mr-3'>
            <MdEditDocument size={20} />
          </div>
          <p className='pt-1'>Feedback</p>
        </NavLink>

        <NavLink href="/settings">
          <div className='icon mr-3'>
            <IoSettingsOutline size={20} />
          </div>
          <p className='pt-1'>Settings</p>
        </NavLink>


        {/* Logout Link */}
        {/* <button
          onClick={() => setLogoutOpen(true)}
          className="flex items-center p-3 rounded mb-1 text-gray-700 hover:bg-gray-100 transition-colors w-full text-left"
        >
          <div className='icon mr-3'>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 4a1 1 0 10-2 0v1a1 1 0 102 0v-1zm-2-5a1 1 0 011-1h1a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <p className='pt-1'>Logout</p>
        </button> */}
      </div>

      <CustomModal 
        show={isLogoutOpen} 
        onHide={() => setLogoutOpen(false)} 
        custom='logout' 
        title="Logout"
      >
        <p className="text-black">
          Are you sure you want to logout from your account?
        </p>
        <div className="flex justify-center mt-4 space-x-3">
          <button 
            className="accept-btn w-32 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={handleLogout}
          >
            Yes
          </button>
          <button 
            className="decline-btn w-32 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            onClick={() => setLogoutOpen(false)}
          >
            No
          </button>
        </div>
      </CustomModal>
    </div>
  )
}

export default Sidebar