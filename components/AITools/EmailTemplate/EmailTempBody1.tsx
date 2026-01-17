import React from 'react';
import cb2 from "@/assets/Images/AITools/career-objective/cb2.svg";
import emp2 from "@/assets/Images/AITools/email-temp/emp2.svg";
import emp3 from "@/assets/Images/AITools/email-temp/emp3.svg";
import Image from 'next/image';

const EmailTempBody1 = () => {
    return (
        <div className='container'>
            <div className="row m-0">
                <div className="col-lg-6 p-5">
                    <Image src={cb2} alt="" />
                </div>
                <div className="col-lg-6 p-5">
                    <h2>How It Works - Just 3 Simple Steps</h2>
                    <ol>
                        <li>Select the Email Type you prefer - choose from professional-grade scenarios that are predefined.</li>
                        <li>Click Generate We use Click Generate to create your email. AI produces your full elegant email in a matter of minutes.</li>
                        <li>Copy and send - Make edits the text if necessary, then email directly to the recipient.</li>
                    </ol>
                </div>
            </div>



            <div className="row m-0">
                <div className="col-lg-6 p-5">
                    <h2>Types of Emails You Can Generate</h2>
                    <ul>
                        <li>Job Application Email - Apply with confidence using a professional tone.</li>
                        <li>Interview Follow-Up: Leave an unforgettable impression following your appointment.</li>
                        <li>Networking Email - Make relationships with powerful marketing.</li>
                        <li>Resignation Email - Leave professional and gracefully.</li>
                        <li>Client Proposal Emails - Educate using clarity and organization.</li>
                        <li>Project Update Emails Be sure to keep stakeholders updated via concise information.</li>
                    </ul>
                </div>

                <div className="col-lg-6 p-5">
                    <Image src={emp2} alt="" />
                </div>
            </div>



            <div className="row m-0">
                <div className="col-lg-6 p-5">
                    <Image src={emp3} alt="" />
                </div>
                <div className="col-lg-6 p-5">
                    <h2>Why Use TodoResume’s Email Template Generator?</h2>
                    <ul>
                        <li>It saves Time Writing in seconds instead of working for hours.</li>
                        <li>Professional Tone: Avoid the use of a language that is unclear or awkward.</li>
                        <li>Customized Content - Tailored for the email type you've chosen.</li>
                        <li>Error-Free: Tone, grammar and formatting are handled by the system in a way that is automatic.</li>
                        <li>Flexible - Suitable well for employees, job applicants as well as business owners.</li>

                    </ul>
                </div>
            </div>


           
        </div>
    )
}

export default EmailTempBody1
