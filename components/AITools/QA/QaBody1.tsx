import React from 'react';
import qa1 from "@/assets/Images/AITools/Qa/qa1.svg";
import qa2 from "@/assets/Images/AITools/Qa/qa2.svg";
import jb3 from "@/assets/Images/AITools/job-description/jd4.svg";
import Image from 'next/image';
// import cb4 from "../../../../../assets/Images/AITools/career-objective/cb4.svg";

const QaBody1 = () => {
    return (
        <div className='container'>
            <div className="row m-0">
                <div className="col-lg-6 p-5">
                    <Image src={qa1} alt="" />
                </div>
                <div className="col-lg-6 p-5">
                    <h2>Why Use Our Interview Q&A Generator?</h2>
                    <span>Instead of wasting hours on the internet to find "Top interview questions for XYZ role," our software will provide you with:</span>
                   <ul>
                    <li>In Specific questions for your role This is not generic. It's specific to the job title and your experience.</li>
                    <li>The Proficiently created to impress employers.</li>
                    <li>Different Types of Questions The types of questions include technical, behavioral, question types that are based on HR and situational.</li>
                    <li>Instant Access: Generate within seconds, and learn at your own speed.</li>
                   </ul>
                </div>
            </div>



            <div className="row m-0">
                <div className="col-lg-6 p-5">
                    <h2>How It Works</h2>
                    <ul>
                        <li>Enter Your Job Title - Example: "Digital Marketing Manager" or "Software Engineer."</li>
                        <li>Select Experience Level - Freshers, Mid-Level, or Senior Professionals.</li>
                        <li>Pick the Number of Questions you would like to answer Between 5 and 20, based upon your needs for practice.</li>
                        <li>Select Question Type: Technical, behavioral, HR or mix.</li>
                        <li>Create a set of questions and model solutions immediately.</li>
                    </ul>
                </div>

                <div className="col-lg-6 p-5">
                    <Image src={qa2} alt="" />
                </div>
            </div>



            <div className="row m-0">
                <div className="col-lg-6 p-5">
                    <Image src={jb3} alt="" />
                </div>
                <div className="col-lg-6 p-5">
                    <h2>Perfect For</h2>
                    {/* <span>A well-crafted job description can:</span> */}
                    <ul>
                        <li>Job-seekers, prepare yourself for your next interview confidently.</li>
                        <li>Career changers - Study specific industry questions to prepare you for your next job.</li>
                        <li>Students and Graduates - Get ready using real-world questions based on role.</li>
                        {/* <li>Improve Candidate Engagement.</li> */}

                    </ul>
                </div>
            </div>


           
        </div>
    )
}

export default QaBody1
