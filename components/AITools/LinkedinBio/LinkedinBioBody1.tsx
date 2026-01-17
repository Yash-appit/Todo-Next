import React from 'react';
import lin1 from "@/assets/Images/AITools/linkedin-bio/lin1.svg";
import lin2 from "@/assets/Images/AITools/linkedin-bio/lin2.svg";
import lin3 from "@/assets/Images/AITools/linkedin-bio/lin3.svg";
import Image from 'next/image';

const LinkedinBioBody1 = () => {
    return (
        <div className='container'>
            <div className="row m-0">
                <div className="col-lg-6 p-5">
                    <Image src={lin1} alt="" />
                </div>
                <div className="col-lg-6 p-5">
                    <h2>How It Works - Quick & Simple</h2>
                    <ol>
                        <li>Upload your resume (PDF or Doc) or enter the details of your professional profile.</li>
                        <li>Click Generate Click Generate - Our AI examines your experiences as well as your strengths.</li>
                        <li>Create Your Bio - Professional, fully-functional LinkedIn Summary is instantly created.</li>
                    </ol>
                </div>
            </div>



            <div className="row m-0">
                <div className="col-lg-6 p-5">
                    <h2>Features of Our LinkedIn Bio Generator</h2>
                    <ul>
                        <li>ATS-Friendly and Keyword Optimized Enhances the ranking of your profile on search engines.</li>
                        <li>Created to fit your industry - A custom tone and design to suit different occupations.</li>
                        <li>Professional, yet Human - reads effortlessly while remaining short.</li>
                        <li>Many Styles to Choose - Pick between creative, formal, or hybrid styles.</li>
                        <li>There is no Writer's Block Create endless variations until you have the one that is perfect for you.</li>
                    </ul>
                </div>

                <div className="col-lg-6 p-5">
                    <Image src={lin2} alt="" />
                </div>
            </div>



            <div className="row m-0">
                <div className="col-lg-6 p-5">
                    <Image src={lin3} alt="" />
                </div>
                <div className="col-lg-6 p-5">
                    <h2>Why Your LinkedIn Bio Matters</h2>
                    <span>A convincing LinkedIn Summary can be:</span>
                    <ul>
                        <li>Increase Recruiter Profile Views.</li>
                        <li>Build Trust with potential clients.</li>
                        <li>Showcase Your Personality & Strengths.</li>
                        <li>Highlight Career Achievements Quickly.</li>
                    

                    </ul>
                </div>
            </div>


         
        </div>
    )
}

export default LinkedinBioBody1
