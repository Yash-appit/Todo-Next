"use client"

import { RiCopyrightLine } from "react-icons/ri";
import CustomModal from "@/components/Modal/Modal";
import { useState } from "react";
import Link from "next/link";



const Footer = () => {
  const getFromLocalStorage = (key: string) => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  };
  const [token, setToken] = useState(getFromLocalStorage('token'));
   
  return (<>
    <section className='footer py-4'>
      <div className='container text-center'>
          {/* <h5>Ready to get started?</h5>
          <p>Work with one of our professional resume writers or sign up for a free resume review.</p>

          <div className="pb-5 my-3">
            <Link to="/packages" className='prim-but m-1'>View Packages</Link>
            <Link to="/packages" className='sec-but m-1'>Resume Review</Link>
          </div>
          <hr /> */}

          <div className="row justify-content-center">
          <div className="col-md-4 text-start pt-4 pe-5">
              
              <h6>Contacts</h6>
              {/* <p><Link to="">FAQ</Link></p> */}
              <p className="text-black">Address: 11 Mission Compound, near chomu house circle, C Scheme, Jaipur, Rajasthan 302001</p>
              <Link href="mailto:todoresumehelp@gmail.com">todoresumehelp@gmail.com</Link>
              <br/>
              {/* <img src={logo} alt=""/> */}
                {/* <p><Link to={token ? "/feedback" : "/login"}>Feedback</Link></p> */}
  
                {/* <p><Link to="/faq">FAQ</Link></p> */}
                {/* <p>Partnerships</p>
                <p>Press Room</p> */}
              </div>
            <div className="col-md-3 text-start pt-4 pl-5">
              <h6>Company Details</h6>
              {/* <p>Resume Builder</p>
              <p>Pricing</p> */}
                <p><Link href="/aboutUs">About Us</Link></p>
              <p><Link href="/termAndCondition">Terms & Conditions</Link></p>
              <p><Link href="/privacyPolicy">Privacy Policy</Link></p>
              {/* <p><Link href="/cookiesPolicy">Cookies Policy</Link></p> */}
              <p><Link href="/refundPolicy">Refund Policy</Link></p>

              {/* <div className="d-flex pt-4 mt-4">
               <FaFacebook />
               <FaXTwitter />
               <FaInstagram />
               <FaLinkedin />
               <FaWhatsapp />
              </div> */}

            </div>

            <div className="col-md-3 text-start pt-4">
              <h6>Tools</h6>
              <p><Link href="/ats-score">ATS Checker</Link></p>
              <p><Link href="/cover-letter">Cover Letter</Link></p>
              <p><Link href="/ai-tools/email-template-generator">Email Template Generator</Link></p>
              <p><Link href="/ai-tools/linkedin-bio-generator">LinkedIn Bio Generator</Link></p>
              <p><Link href="/ai-tools/qa-generator">QA Generator</Link></p>
              <p><Link href="/ai-tools/job-description-generator">JD Generator</Link></p>
              {/* <p><Link to="/contact">Contact</Link></p> */}
              {/* <p><Link to="/privacyPolicy">Privacy Policy</Link></p> */}
             
              {/* <p><Link to="/termAndCondition">Terms Of Use</Link></p> */}
              {/* <p>Partnerships</p>
              <p>Press Room</p> */}
            </div>


            <div className="col-md-2 text-start pt-4">
              <h6>Pages</h6>
              <p><Link href="/faq">FAQ</Link></p>
              <p><Link href="/templates">Templates</Link></p>
              {/* <p><Link href="/packages">Pricing</Link></p> */}
              <p><Link href="/blogs">Blogs</Link></p>
              <p><Link href="/contact">Contact Us</Link></p>
              {/* <p><Link to="">Resume Writing Tips</Link></p> */}
            </div>


           

            {/* <div className="col-md-3 text-start">
            <h6>Help And Support</h6>
            </div> */}

            {/* <div className="col-md-2 text-start">

              <ul>
             

                <li>
                <Link to=""></Link>
                </li>

                <li>
                <Link to=""></Link>
                </li>
              </ul>


            </div> */}



            {/* <div className="col text-end justify-content-end">
              <img src={logo} alt="" className="w-25" />
            </div> */}

            {/* <hr /> */}

            <div className="d-flex justify-content-center copy-right mt-5">
              <p className="text-start mt-4 pt-2"><RiCopyrightLine /> 2025 TodoResume, All Rights Reserved.</p>

              {/* <div className="d-flex justify-content-end mt-3">
                <TiSocialFacebook />
                <TiSocialTwitter />
                <TiSocialLinkedin />
                <AiFillInstagram />
              </div> */}
            </div>
      
        </div>
      </div>
    </section>

  
  </>)
}

export default Footer
