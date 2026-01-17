import React from 'react';
import jba1 from "@/assets/Images/AITools/job-analyzer/jba1.svg";
import jba2 from "@/assets/Images/AITools/job-analyzer/jba2.svg";
import jba3 from "@/assets/Images/AITools/job-analyzer/jba3.svg";
import Image from 'next/image';
// import cb4 from "../../../../../assets/Images/AITools/career-objective/cb4.svg";

const JobAnalyzerBody1 = () => {
    return (
        <div className='container'>
            <div className="row m-0">
                <div className="col-lg-6 p-5">
                    <Image src={jba1} alt="" />
                </div>
                <div className="col-lg-6 p-5">
                    <h2>How It Works - Quick & Accurate</h2>
                   <ol>
                    <li>Add Company Name. personalize the JD to reflect your company's image.</li>
                    <li>Include Job Titles - Enter what job title you're seeking to fill.</li>
                    <li>Select Industry Type - Ensure relevant, industry-focused details.</li>
                    <li>Click Generate instantly receives an organized, professional job descriptions.</li>
                   </ol>
                </div>
            </div>



            <div className="row m-0">
                <div className="col-lg-6 p-5">
                    <h2>Features of Our Job Description Generator</h2>
                    <ul>
                        <li>SEO optimized and ATS friendly Enhances the visibility of job advertisements across platforms.</li>
                        <li>Specific to your role - skills duties, qualifications, and responsibilities specific to the job you are in.</li>
                        <li>Flexible output - edit and fine-tune to reflect your corporate culture.</li>
                        <li>Rapid and Scalable - Create several job descriptions within just a few minutes.</li>
                        <li>It supports All Industries - From tech and finance to healthcare, and the creative field.</li>
                    </ul>
                </div>

                <div className="col-lg-6 p-5">
                    <Image src={jba2} alt="" />
                </div>
            </div>



            <div className="row m-0">
                <div className="col-lg-6 p-5">
                    <Image src={jba3} alt="" />
                </div>
                <div className="col-lg-6 p-5">
                    <h2>Why a Strong Job Description Matters</h2>
                    <span>A well-crafted job description can:</span>
                    <ul>
                        <li>Attract Qualified Candidates Faster</li>
                        <li>Reduce Hiring Time.</li>
                        <li>Set Clear Role Expectations</li>
                        <li>Improve Candidate Engagement.</li>

                    </ul>
                </div>
            </div>


           
        </div>
    )
}

export default JobAnalyzerBody1
