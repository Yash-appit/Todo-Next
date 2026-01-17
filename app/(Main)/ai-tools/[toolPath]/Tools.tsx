import React from 'react';
import star from "@/assets/Images/AITools/star.svg";
import Image from 'next/image';
import Link from 'next/link';

const Tools = () => {
    const [token, setToken] = React.useState(localStorage.getItem('token'));

    return (
        <div className="container-fluid tools mb-4">
            <div className='row m-0'>
                <div className="col-lg-12">
                    <h3 className='pt-4 mt-3'>Check out these other templates</h3>

                    <div className="container mb-4">
                        <div className="row m-0 mt-5 gridlayout">
                            <Link href={token ? "/resumes" : "/login"} className="col p-5">

                                <div className="icon">
                                    <Image src={star} alt="" />
                                </div>
                                <h6>Resume Builder</h6>
                                <p>Build professional resumes that grab attention and win jobs fast.</p>
                            </Link>



                            <Link href={token ? "/ats-score" : "/login"} className="col p-5">
                                <div className="icon">
                                    <Image src={star} alt="" />
                                </div>

                                <h6>ATS Checker</h6>
                                <p>Optimize your resume to beat ATS and impress recruiters fast.</p>
                            </Link>



                            <Link href={token ? "/cover-letter" : "/login"} className="col p-5">
                                <div className="icon">
                                    <Image src={star} alt="" />
                                </div>
                                <h6>Cover Letter Builder</h6>
                                <p>Create tailored cover letters that grab attention and win interviews.</p>
                            </Link>



                            <Link href={token ? "/email-template-generator" : "/login"} className="col p-5">
                                <div className="icon">
                                    <Image src={star} alt="" />
                                </div>
                                <h6>Email Template Generator</h6>
                                <p>Quickly create professional, ready-to-send emails for any purpose.</p>
                            </Link>



                            <Link href={token ? "/linkedin-bio-generator" : "/login"} className="col p-5">
                                <div className="icon">
                                    <Image src={star} alt="" />
                                </div>
                                <h6>Linkedin Bio Generator</h6>
                                <p>Create compelling LinkedIn bios that showcase your skills and personality."
                                Ask ChatGPT</p>
                            </Link>



                            <Link href={token ? "/qa-generator" : "/login"} className="col p-5">
                                <div className="icon">
                                    <Image src={star} alt="" />
                                </div>
                                <h6>Q/A Generator</h6>
                                <p>Generate accurate questions and answers instantly for any topic.</p>
                            </Link>



                            <Link href={token ? "/job-description-generator" : "/login"} className="col p-5">
                                <div className="icon">
                                    <Image src={star} alt="" />
                                </div>
                                <h6>Job Description Generator</h6>
                                <p>Quickly create clear, tailored job descriptions for any role.</p>
                            </Link>



                            <Link href={token ? "/job-description-analyzer" : "/login"} className="col p-5">
                                <div className="icon">
                                    <Image src={star} alt="" />
                                </div>
                                <h6>Job Description Analyzer</h6>
                                <p>Analyze job descriptions to tailor your resume for success.</p>
                            </Link>



                            <Link href={token ? "/career-objective-generator" : "/login"} className="col p-5">
                                <div className="icon">
                                    <Image src={star} alt="" />
                                </div>
                                <h6>Career Objective Generator</h6>
                                <p>Quickly create tailored career objectives to match any job.</p>
                            </Link>



                            
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}

export default Tools
