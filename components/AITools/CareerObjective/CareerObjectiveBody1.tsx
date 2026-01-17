import React from 'react';
import cb1 from "@/assets/Images/AITools/career-objective/cb1.svg";
import cb2 from "@/assets/Images/AITools/career-objective/cb2.svg";
import cb3 from "@/assets/Images/AITools/career-objective/cb3.svg";
import cb4 from "@/assets/Images/AITools/career-objective/cb4.svg";
import Image from 'next/image';

const CareerObjectiveBody1 = () => {
    return (
        <div className='container'>
            <div className="row m-0">
                <div className="col-lg-6 p-5">
                    <Image src={cb1} alt="" />
                </div>
                <div className="col-lg-6 p-5">
                    <h2>Write a Career Objective That Gets Noticed</h2>
                    <p>Our AI-powered program analyses your information (role as well as experience, along with industries to produce a customized goal for your career that matches perfectly with the job you're applying for. No matter if you're beginning your career or hoping to take your next step in the career ladder with an ATS-friendly, ATS-certified objective that increases the chances of getting interviews.
                    </p>
                </div>
            </div>



            <div className="row m-0">
                <div className="col-lg-6 p-5">
                    <h2>How It Works - Just 3 Simple Steps</h2>
                    <ol>
                        <li>This Select Your Role - Input your current job or the desired name.</li>
                        <li>Choose Experience Level - Fresher, Mid-level, or Senior.</li>
                        <li>Pick Industry Type - From IT to Marketing, Healthcare to Education.</li>
                    </ol>
                </div>

                <div className="col-lg-6 p-5">
                    <Image src={cb2} alt="" />
                </div>
            </div>



            <div className="row m-0">
                <div className="col-lg-6 p-5">
                    <Image src={cb3} alt="" />
                </div>
                <div className="col-lg-6 p-5">
                    <h2>Why Choose TodoResume's Career Objective Generator?</h2>
                    <ul>
                        <li>AI-powered Precision is tailored to your job, field and stage of your career.</li>
                        <li>Time-Saving - Design a great career goal in less than 10 seconds.</li>
                        <li>ATS-Friendly - Optimized for pass Applicant Monitoring Systems.</li>
                        <li>Flexible - Ideal for students professional, people who are changing careers.</li>
                        <li>Experienced Results - Join the thousands of people who have been able to get interviews with our AI-designed targets.</li>

                    </ul>
                </div>
            </div>


            <div className="row m-0">
                <div className="col-lg-6 p-5">
                    <h2>Be the First to Move With a Resume that Stands Out</h2>
                    <p>This AI-powered tool analyzes job descriptions to spot the most relevant keywords for your role. It then helps you craft a smart career objective that aligns with the position, making your resume more appealing to recruiters and improving your chances of landing interviews.</p>
                </div>
                <div className="col-lg-6 p-5">
                    <Image src={cb4} alt="" />
                </div>
            </div>
        </div>
    )
}

export default CareerObjectiveBody1
