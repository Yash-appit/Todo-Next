import jd1 from "@/assets/Images/AITools/job-description/jd1.svg";
import jd2 from "@/assets/Images/AITools/job-description/jd2.svg";
import jd3 from "@/assets/Images/AITools/job-description/jd3.svg";
import jd4 from "@/assets/Images/AITools/job-description/jd4.svg";
import Image from 'next/image';

const JobDescriptionBody1 = () => {
    return (
        <div className='container'>
            <div className="row m-0">
                <div className="col-lg-6 p-5">
                    <Image src={jd1} alt="" />
                </div>
                <div className="col-lg-6 p-5">
                    <h2>Why Use a Job Description Analyzer?</h2>
                    <span>Employers are only spending seven seconds scouring resumes. If the resume you submit doesn't match the requirements of the job then it's immediately discarded. Our tool ensures your resume:</span>
                   <ul className='mt-3'>
                    <li>
                    In line with the essential capabilities and certifications.
                    </li>
                    <li>
                    The list of keywords that are relevant to industry for ATS system.
                    </li>

                    <li>
                    Employer-specific requirements are a key factor in more effective selection.
                    </li>
                   </ul>
                </div>
            </div>



            <div className="row m-0">
                <div className="col-lg-6 p-5">
                    <h2>How It Works</h2>
                    <ul>
                        <li>Copy and paste the Job Description directly via LinkedIn, Naukri, Indeed or other job site.</li>
                        <li>AI-powered Analysis - Detects essential skills, key words and job expectations.</li>
                        <li>Gap Report - Shows missing abilities and suggests ways to fill these skills easily.</li>
                        <li>Strategies for adjusting your resume - helps to tailor your resume for the greatest impact.</li>
                    </ul>
                </div>

                <div className="col-lg-6 p-5">
                    <Image src={jd2} alt="" />
                </div>
            </div>



            <div className="row m-0">
                <div className="col-lg-6 p-5">
                    <Image src={jd3} alt="" />
                </div>
                <div className="col-lg-6 p-5">
                    <h2>Key Features</h2>
                    <ul>
                        <li>Skill Extraction instantly provides a list of all crucial soft and hard abilities.</li>
                        <li>Keyword Frequency Report - Check the terms that appear often in the JD.</li>
                        <li>Strategies for optimizing your ATS - Let your resume relevant to recruiter filtering.</li>
                        <li>Scoring Relevance of Role - Receive the percentage score of your match for a better understanding of your chance.</li>
                        <li>Effective Edits - Practical tips to improve alignment.</li>

                    </ul>
                </div>
            </div>


            <div className="row m-0">
                <div className="col-lg-6 p-5">
                    <h2>Perfect For</h2>
                    <ul>
                        <li>
                        Job Seekers - Customizing resumes to fill specific positions.
                        </li>
                        <li>Career Switchers: Aligning your old experiences to new fields.</li>
                        <li>Strategies for optimizing your ATS - Let your resume relevant to recruiter filtering.</li>
                        <li>Fresh Grads and Students Knowing the expectations of industry.</li>
                    </ul>
                </div>
                <div className="col-lg-6 p-5">
                    <Image src={jd4} alt="" />
                </div>
            </div>
        </div>
    )
}

export default JobDescriptionBody1
